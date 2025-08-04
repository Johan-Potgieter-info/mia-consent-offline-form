-- Add NAM-specific consent fields to consent_forms table
ALTER TABLE public.consent_forms 
ADD COLUMN nam_itc_blacklisting_consent boolean DEFAULT NULL,
ADD COLUMN nam_medical_aid_claiming_responsibility boolean DEFAULT NULL,
ADD COLUMN nam_information_sharing_authorization boolean DEFAULT NULL,
ADD COLUMN nam_privacy_confidentiality_acknowledgment boolean DEFAULT NULL;