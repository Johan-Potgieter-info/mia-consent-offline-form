
export const testDBConnection = async (): Promise<boolean> => {
  try {
    if (!window.indexedDB) {
      return false;
    }
    // Simple test to see if IndexedDB is available
    const testDB = window.indexedDB.open('test', 1);
    return new Promise((resolve) => {
      testDB.onsuccess = () => {
        testDB.result.close();
        resolve(true);
      };
      testDB.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};
