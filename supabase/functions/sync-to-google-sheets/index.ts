import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Sheets configuration
const GOOGLE_SHEETS_CREDENTIALS = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS');
const GOOGLE_SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID');

interface SensitiveDataEncryption {
  ENCRYPTION_PREFIX: string;
  DB_SENSITIVE_FIELDS: string[];
  simpleFallbackDecrypt(encryptedText: string): string;
  decryptDatabaseFields(dbData: any): any;
}

// Replicated encryption logic for edge function
const SensitiveDataEncryption = {
  ENCRYPTION_PREFIX: 'enc:',
  DB_SENSITIVE_FIELDS: [
    'patient_name',
    'id_number',
    'cell_phone',
    'email',
    'address',
    'emergency_name',
    'emergency_phone',
    'account_holder_name',
    'account_holder_id_number'
  ],

  simpleFallbackDecrypt(encryptedText: string): string {
    try {
      if (!encryptedText.startsWith(this.ENCRYPTION_PREFIX)) {
        return encryptedText; // Not encrypted
      }
      const base64 = encryptedText.slice(this.ENCRYPTION_PREFIX.length);
      return decodeURIComponent(atob(base64));
    } catch {
      return encryptedText; // Return original if decoding fails
    }
  },

  decryptDatabaseFields(dbData: any): any {
    const decryptedData = { ...dbData };
    
    this.DB_SENSITIVE_FIELDS.forEach(field => {
      const value = decryptedData[field];
      if (value && typeof value === 'string') {
        decryptedData[field] = this.simpleFallbackDecrypt(value);
      }
    });

    // Remove encryption marker if present
    delete decryptedData.encrypted;
    
    return decryptedData;
  }
};

async function getGoogleSheetsAccessToken(): Promise<string> {
  if (!GOOGLE_SHEETS_CREDENTIALS) {
    throw new Error('Google Sheets credentials not configured');
  }

  const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
  
  // Create JWT for Google Service Account
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Note: In a real implementation, you'd need to sign the JWT with the private key
  // For now, we'll use a simplified approach assuming credentials include access_token
  if (credentials.access_token) {
    return credentials.access_token;
  }

  throw new Error('Google Sheets access token not available');
}

async function appendToGoogleSheet(data: any): Promise<void> {
  if (!GOOGLE_SHEET_ID) {
    throw new Error('Google Sheet ID not configured');
  }

  const accessToken = await getGoogleSheetsAccessToken();
  
  // Decrypt sensitive fields
  const decryptedData = SensitiveDataEncryption.decryptDatabaseFields(data);
  
  // Prepare row data for Google Sheets
  const rowData = [
    decryptedData.id || '',
    decryptedData.timestamp || '',
    decryptedData.patient_name || '',
    decryptedData.id_number || '',
    decryptedData.gender || '',
    decryptedData.birth_date || '',
    decryptedData.age || '',
    decryptedData.marital_status || '',
    decryptedData.cell_phone || '',
    decryptedData.email || '',
    decryptedData.address || '',
    decryptedData.postal_code || '',
    decryptedData.employer_school || '',
    decryptedData.occupation_grade || '',
    decryptedData.responsible_for_payment || '',
    decryptedData.account_holder_name || '',
    decryptedData.account_holder_age || '',
    decryptedData.medical_aid_name || '',
    decryptedData.medical_aid_no || '',
    decryptedData.medical_aid_plan || '',
    decryptedData.main_member || '',
    decryptedData.dependant_code || '',
    decryptedData.payment_preference || '',
    decryptedData.gp_name || '',
    decryptedData.gp_contact || '',
    decryptedData.allergies || '',
    decryptedData.medication || '',
    JSON.stringify(decryptedData.chronic_conditions || []),
    decryptedData.emergency_name || '',
    decryptedData.emergency_relationship || '',
    decryptedData.emergency_phone || '',
    decryptedData.whatsapp_number || '',
    decryptedData.same_as_contact_number || false,
    decryptedData.consent_agreement || false,
    decryptedData.signature || '',
    decryptedData.doctor || '',
    decryptedData.practice_number || '',
    decryptedData.region_code || '',
    decryptedData.region_label || '',
    decryptedData.submission_region || '',
    decryptedData.status || '',
    decryptedData.created_at || ''
  ];

  const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1:append?valueInputOption=RAW`;
  
  const response = await fetch(sheetsUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to append to Google Sheets: ${response.status} ${errorText}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    console.log('Received consent form data for Google Sheets sync:', record?.id);
    
    if (!record) {
      throw new Error('No record data provided');
    }

    // Sync to Google Sheets
    await appendToGoogleSheet(record);
    
    console.log('Successfully synced to Google Sheets:', record.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synced to Google Sheets successfully',
        recordId: record.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});