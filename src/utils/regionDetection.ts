
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
    doctor: 'Dr. Vorster',
    practiceNumber: '1227831'
  },
  JHB: {
    code: 'JHB',
    name: 'Johannesburg',
    doctor: 'Dr. Smith',
    practiceNumber: '1234567'
  },
  CPT: {
    code: 'CPT',
    name: 'Cape Town',
    doctor: 'Dr. Johnson',
    practiceNumber: '7654321'
  }
};

export const getRegionWithFallback = async (): Promise<Region> => {
  // Simple fallback to PTA region
  return REGIONS.PTA;
};
