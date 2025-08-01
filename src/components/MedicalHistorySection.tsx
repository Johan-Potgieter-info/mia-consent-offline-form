
import React from 'react';
import { Checkbox } from './ui/checkbox';
import ValidatedInput from './ValidatedInput';

interface MedicalHistorySectionProps {
  formData: any;
  onInputChange: (name: string, value: string) => void;
  onCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const MedicalHistorySection = ({ formData, onInputChange, onCheckboxChange }: MedicalHistorySectionProps) => {
  const handleNilCheckbox = (fieldName: string, checked: boolean) => {
    if (checked) {
      onInputChange(fieldName, 'Nil');
    } else {
      onInputChange(fieldName, '');
    }
  };

  const handleChronicConditionsChange = (condition: string, checked: boolean) => {
    let currentConditions = [];
    
    if (formData.chronicConditions) {
      if (typeof formData.chronicConditions === 'string') {
        currentConditions = formData.chronicConditions.split(', ').filter(c => c.trim());
      } else if (Array.isArray(formData.chronicConditions)) {
        currentConditions = [...formData.chronicConditions];
      }
    }
    
    if (checked) {
      if (condition === 'None') {
        // If "None" is selected, clear all other conditions
        onInputChange('chronicConditions', 'None');
      } else {
        // Remove "None" if any other condition is selected
        currentConditions = currentConditions.filter(c => c !== 'None');
        if (!currentConditions.includes(condition)) {
          currentConditions.push(condition);
        }
        onInputChange('chronicConditions', currentConditions.join(', '));
      }
    } else {
      if (condition === 'None') {
        onInputChange('chronicConditions', '');
      } else {
        currentConditions = currentConditions.filter(c => c !== condition);
        onInputChange('chronicConditions', currentConditions.length > 0 ? currentConditions.join(', ') : '');
      }
    }
  };

  const handleHabitsChange = (habit: string, checked: boolean) => {
    let currentHabits = [];
    
    if (formData.habits) {
      if (typeof formData.habits === 'string') {
        currentHabits = formData.habits.split(', ').filter(h => h.trim());
      } else if (Array.isArray(formData.habits)) {
        currentHabits = [...formData.habits];
      }
    }
    
    if (checked) {
      if (habit === 'Nil') {
        // If "Nil" is selected, clear all other habits
        onInputChange('habits', 'Nil');
      } else {
        // Remove "Nil" if any other habit is selected
        currentHabits = currentHabits.filter(h => h !== 'Nil');
        if (!currentHabits.includes(habit)) {
          currentHabits.push(habit);
        }
        onInputChange('habits', currentHabits.join(', '));
      }
    } else {
      if (habit === 'Nil') {
        onInputChange('habits', '');
      } else {
        currentHabits = currentHabits.filter(h => h !== habit);
        onInputChange('habits', currentHabits.length > 0 ? currentHabits.join(', ') : '');
      }
    }
  };

  const handleFemaleConditionsChange = (condition: string, checked: boolean) => {
    let currentConditions = [];
    
    if (formData.femalePatients) {
      if (typeof formData.femalePatients === 'string') {
        currentConditions = formData.femalePatients.split(', ').filter(c => c.trim());
      } else if (Array.isArray(formData.femalePatients)) {
        currentConditions = [...formData.femalePatients];
      }
    }
    
    if (checked) {
      if (condition === 'N/A') {
        // If "N/A" is selected, clear all other conditions
        onInputChange('femalePatients', 'N/A');
      } else {
        // Remove "N/A" if any other condition is selected
        currentConditions = currentConditions.filter(c => c !== 'N/A');
        if (!currentConditions.includes(condition)) {
          currentConditions.push(condition);
        }
        onInputChange('femalePatients', currentConditions.join(', '));
      }
    } else {
      if (condition === 'N/A') {
        onInputChange('femalePatients', '');
      } else {
        currentConditions = currentConditions.filter(c => c !== condition);
        onInputChange('femalePatients', currentConditions.length > 0 ? currentConditions.join(', ') : '');
      }
    }
  };

  const chronicConditionsList = [
    'Alzheimers', 'Anaemia', 'Arthritis', 'Asthma/Lung Disease',
    'Bleeding Disorders', 'On warfarin/Aspirin or anticoagulants',
    'Cancer Treatment', 'Diabetes', 'Dizziness/Fainting Spells',
    'Epilepsy', 'Rheumatic Fever', 'Heart Disease',
    'High/low Blood Pressure', 'Hepatitis/Liver Disease',
    'HIV/Aids', 'Sinusitis', 'Ulcers', 'Other'
  ];

  const habitsList = ['Smoking', 'Alcohol', 'Recreational Drugs', 'Other'];
  const femaleConditionsList = ['Pregnant', 'Nursing', 'On Birth Control', 'On Hormone Replacement Therapy'];

  const currentConditions = typeof formData.chronicConditions === 'string' 
    ? formData.chronicConditions.split(', ').filter(c => c) 
    : (Array.isArray(formData.chronicConditions) ? formData.chronicConditions : []);

  const currentHabits = typeof formData.habits === 'string' 
    ? formData.habits.split(', ').filter(h => h) 
    : (Array.isArray(formData.habits) ? formData.habits : []);

  const currentFemaleConditions = typeof formData.femalePatients === 'string' 
    ? formData.femalePatients.split(', ').filter(c => c) 
    : (Array.isArray(formData.femalePatients) ? formData.femalePatients : []);

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold text-[#ef4805] border-b pb-2">4. Medical History</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <ValidatedInput
          type="text"
          label="34. GP's Name (optional)"
          value={formData.gpName || ''}
          onChange={(value) => onInputChange('gpName', value)}
          placeholder="Enter GP's name"
        />

        <ValidatedInput
          type="tel"
          label="35. GP's Contact No. (optional)"
          value={formData.gpContact || ''}
          onChange={(value) => onInputChange('gpContact', value)}
          placeholder="Enter GP's contact number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          36. Chronic Conditions
        </label>
        <div className="grid md:grid-cols-2 gap-2 mb-2">
          {chronicConditionsList.map(condition => (
            <label key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={`chronic-${condition}`}
                checked={currentConditions.includes(condition)}
                onCheckedChange={(checked) => handleChronicConditionsChange(condition, checked === true)}
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="noChronicConditions"
            checked={formData.chronicConditions === 'None'}
            onCheckedChange={(checked) => handleChronicConditionsChange('None', checked === true)}
          />
          <label htmlFor="noChronicConditions" className="text-sm text-gray-600">
            No chronic conditions
          </label>
        </div>
      </div>

      <div>
        <ValidatedInput
          type="text"
          label="37. Allergies *"
          value={formData.allergies || ''}
          onChange={(value) => onInputChange('allergies', value)}
          placeholder="Please answer 'Nil' if you have no allergies"
          required
        />
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="nilAllergies"
            checked={formData.allergies === 'Nil'}
            onCheckedChange={(checked) => handleNilCheckbox('allergies', checked === true)}
          />
          <label htmlFor="nilAllergies" className="text-sm text-gray-600">
            No allergies (Nil)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          38. Habits *
        </label>
        <div className="grid md:grid-cols-2 gap-2 mb-2">
          {habitsList.map(habit => (
            <label key={habit} className="flex items-center space-x-2">
              <Checkbox
                id={`habit-${habit}`}
                checked={currentHabits.includes(habit)}
                onCheckedChange={(checked) => handleHabitsChange(habit, checked === true)}
              />
              <span className="text-sm">{habit}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="nilHabits"
            checked={formData.habits === 'Nil'}
            onCheckedChange={(checked) => handleHabitsChange('Nil', checked === true)}
          />
          <label htmlFor="nilHabits" className="text-sm text-gray-600">
            Nil
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          39. Under Specialist Care
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef4805] focus:border-transparent"
          value={formData.specialistCare || ''}
          onChange={(e) => onInputChange('specialistCare', e.target.value)}
          placeholder="If yes, please add a short description"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          40. Hospitalised This Year
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef4805] focus:border-transparent"
          value={formData.hospitalised || ''}
          onChange={(e) => onInputChange('hospitalised', e.target.value)}
          placeholder="If yes, please add a short description"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          41. Psychiatric History
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ef4805] focus:border-transparent"
          value={formData.psychiatricHistory || ''}
          onChange={(e) => onInputChange('psychiatricHistory', e.target.value)}
          placeholder="Please provide details if applicable"
          rows={3}
        />
      </div>

      <div>
        <ValidatedInput
          type="text"
          label="42. Medication *"
          value={formData.medication || ''}
          onChange={(value) => onInputChange('medication', value)}
          placeholder="Please answer 'Nil' if you are not on any medication"
          required
        />
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="nilMedication"
            checked={formData.medication === 'Nil'}
            onCheckedChange={(checked) => handleNilCheckbox('medication', checked === true)}
          />
          <label htmlFor="nilMedication" className="text-sm text-gray-600">
            No medication (Nil)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          43. Female Patients
        </label>
        <div className="grid md:grid-cols-2 gap-2 mb-2">
          {femaleConditionsList.map(condition => (
            <label key={condition} className="flex items-center space-x-2">
              <Checkbox
                id={`female-${condition}`}
                checked={currentFemaleConditions.includes(condition)}
                onCheckedChange={(checked) => handleFemaleConditionsChange(condition, checked === true)}
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <Checkbox
            id="naFemale"
            checked={formData.femalePatients === 'N/A'}
            onCheckedChange={(checked) => handleFemaleConditionsChange('N/A', checked === true)}
          />
          <label htmlFor="naFemale" className="text-sm text-gray-600">
            N/A
          </label>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistorySection;
