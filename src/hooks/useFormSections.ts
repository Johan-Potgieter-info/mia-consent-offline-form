
import { useMemo } from 'react';
import PatientDetailsSection from '../components/PatientDetailsSection';
import AccountHolderSection from '../components/AccountHolderSection';
import PaymentEmergencySection from '../components/PaymentEmergencySection';
import MedicalHistorySection from '../components/MedicalHistorySection';
import ConsentSection from '../components/ConsentSection';

export const useFormSections = () => {
  const sections = useMemo(() => [
    { id: 'patientDetails', title: '1. Patient Details (Fields 1-12)', component: PatientDetailsSection },
    { id: 'accountHolder', title: '2. Account Holder Details (Fields 13-24)', component: AccountHolderSection },
    { id: 'paymentEmergency', title: '3. Payment and Emergency Contact (Fields 25-33)', component: PaymentEmergencySection },
    { id: 'medicalHistory', title: '4. Medical History (Fields 34-43)', component: MedicalHistorySection },
    { id: 'consent', title: '5. Consent (Fields 44-51)', component: ConsentSection },
  ], []);

  return { sections };
};
