// Storage quota management and cleanup utilities

export interface StorageQuota {
  quota: number;
  usage: number;
  available: number;
  percentage: number;
}

export interface CleanupResult {
  deletedCount: number;
  freedSpace: number;
  remainingDrafts: number;
}

// Get storage quota information
export const getStorageQuota = async (): Promise<StorageQuota | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const available = quota - usage;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;
      
      return { quota, usage, available, percentage };
    } catch (error) {
      console.error('Error getting storage quota:', error);
      return null;
    }
  }
  return null;
};

// Check if storage is near capacity (>85%)
export const isStorageNearCapacity = async (): Promise<boolean> => {
  const quota = await getStorageQuota();
  return quota ? quota.percentage > 85 : false;
};

// Get size of a JSON object in bytes
const getObjectSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

// Clean up old drafts based on age and size
export const cleanupOldDrafts = async (
  getDrafts: () => Promise<any[]>,
  deleteDraft: (id: string | number) => Promise<void>,
  maxAge: number = 30 // days
): Promise<CleanupResult> => {
  try {
    const drafts = await getDrafts();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);
    
    let deletedCount = 0;
    let freedSpace = 0;
    
    // Sort drafts by lastModified date (oldest first)
    const sortedDrafts = drafts.sort((a, b) => {
      const dateA = new Date(a.lastModified || a.timestamp || a.createdAt);
      const dateB = new Date(b.lastModified || b.timestamp || b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Delete drafts older than cutoff
    for (const draft of sortedDrafts) {
      const draftDate = new Date(draft.lastModified || draft.timestamp || draft.createdAt);
      
      if (draftDate < cutoffDate) {
        try {
          const draftSize = getObjectSize(draft);
          await deleteDraft(draft.id);
          deletedCount++;
          freedSpace += draftSize;
          console.log(`Cleaned up old draft: ${draft.id}, freed ${draftSize} bytes`);
        } catch (error) {
          console.error(`Error deleting draft ${draft.id}:`, error);
        }
      }
    }
    
    const remainingDrafts = drafts.length - deletedCount;
    
    return {
      deletedCount,
      freedSpace,
      remainingDrafts
    };
  } catch (error) {
    console.error('Error during cleanup:', error);
    return { deletedCount: 0, freedSpace: 0, remainingDrafts: 0 };
  }
};

// Emergency cleanup - remove drafts until storage is under 70%
export const emergencyCleanup = async (
  getDrafts: () => Promise<any[]>,
  deleteDraft: (id: string | number) => Promise<void>
): Promise<CleanupResult> => {
  try {
    const quota = await getStorageQuota();
    if (!quota || quota.percentage < 70) {
      return { deletedCount: 0, freedSpace: 0, remainingDrafts: 0 };
    }
    
    const drafts = await getDrafts();
    
    // Sort by oldest first
    const sortedDrafts = drafts.sort((a, b) => {
      const dateA = new Date(a.lastModified || a.timestamp || a.createdAt);
      const dateB = new Date(b.lastModified || b.timestamp || b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
    
    let deletedCount = 0;
    let freedSpace = 0;
    
    // Delete oldest drafts until we're under 70% capacity
    for (const draft of sortedDrafts) {
      const currentQuota = await getStorageQuota();
      if (!currentQuota || currentQuota.percentage < 70) {
        break;
      }
      
      try {
        const draftSize = getObjectSize(draft);
        await deleteDraft(draft.id);
        deletedCount++;
        freedSpace += draftSize;
        console.log(`Emergency cleanup: deleted draft ${draft.id}, freed ${draftSize} bytes`);
      } catch (error) {
        console.error(`Error deleting draft ${draft.id} during emergency cleanup:`, error);
      }
    }
    
    const remainingDrafts = drafts.length - deletedCount;
    
    return {
      deletedCount,
      freedSpace,
      remainingDrafts
    };
  } catch (error) {
    console.error('Error during emergency cleanup:', error);
    return { deletedCount: 0, freedSpace: 0, remainingDrafts: 0 };
  }
};

// Create export data for emergency backup
export const createEmergencyExport = async (
  getDrafts: () => Promise<any[]>
): Promise<string> => {
  try {
    const drafts = await getDrafts();
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      drafts: drafts
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error creating emergency export:', error);
    throw error;
  }
};

// Download emergency export as file
export const downloadEmergencyExport = async (
  getDrafts: () => Promise<any[]>,
  filename: string = 'form_drafts_backup.json'
): Promise<void> => {
  try {
    const exportData = await createEmergencyExport(getDrafts);
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Emergency export downloaded successfully');
  } catch (error) {
    console.error('Error downloading emergency export:', error);
    throw error;
  }
};