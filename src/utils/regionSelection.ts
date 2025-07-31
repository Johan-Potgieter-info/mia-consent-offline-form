export interface Region {
  code: string;
  name: string;
  doctor: string;
  practiceNumber: string;
}

export const REGIONS: Record<string, Region> = {
  PTA: {
    code: 'PTA',
    name: 'Pretoria',
    doctor: 'Dr Vorster',
    practiceNumber: '1227831'
  },
  JHB: {
    code: 'JHB',
    name: 'Johannesburg',
    doctor: 'Dr Essop',
    practiceNumber: '1182609'
  },
  CPT: {
    code: 'CPT',
    name: 'Cape Town',
    doctor: 'Dr Soni',
    practiceNumber: '1030817'
  }
};

export const getDefaultRegion = async (): Promise<Region> => {
  // Default to PTA region for manual selection
  return REGIONS.PTA;
};