import { z } from 'zod';

/**
 * Schema for audience targeting criteria
 */
export const targetAudienceSchema = z.object({
  age_range: z.object({
    enabled: z.boolean().default(false),
    min: z.coerce.number().min(18).max(99).optional(),
    max: z.coerce.number().min(18).max(99).optional(),
  }),
  gender: z.object({
    enabled: z.boolean().default(false),
    value: z.enum(['male', 'female', 'all']).optional(),
  }),
  location: z.object({
    enabled: z.boolean().default(false),
    regions: z.array(z.string()).optional(),
  }),
  occupation: z.object({
    enabled: z.boolean().default(false),
    sectors: z.array(z.string()).optional(),
  }),
  tech_proficiency: z.object({
    enabled: z.boolean().default(false),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  }),
});

export type TargetAudience = z.infer<typeof targetAudienceSchema>;

/**
 * Saudi Arabia regions for location targeting
 */
export const SAUDI_REGIONS = [
  'Riyadh',
  'Makkah',
  'Madinah',
  'Eastern Province',
  'Asir',
  'Tabuk',
  'Hail',
  'Northern Borders',
  'Jazan',
  'Najran',
  'Al Bahah',
  'Al Jawf',
  'Qassim',
];

/**
 * Common industry sectors for occupation targeting
 */
export const OCCUPATION_SECTORS = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Manufacturing',
  'Government',
  'Media',
  'Transportation',
  'Construction',
  'Energy',
  'Agriculture',
  'Hospitality',
  'Non-profit',
];

/**
 * Calculates the number of active filters in the targeting criteria
 */
export const getActiveFiltersCount = (criteria: TargetAudience): number => {
  return Object.values(criteria).filter(filter => filter?.enabled).length;
};

/**
 * Calculates the estimated audience reach as a percentage
 * This is a simulated calculation based on the targeting criteria
 */
export const calculateEstimatedReachPercentage = (criteria: TargetAudience): number => {
  let basePercentage = 100;
  
  // Age range reduces by ~10-30%
  if (criteria.age_range?.enabled && criteria.age_range.min && criteria.age_range.max) {
    const ageRange = criteria.age_range.max - criteria.age_range.min;
    const ageFactor = Math.min(1, ageRange / 80);
    basePercentage *= ageFactor;
  }
  
  // Gender reduces by ~50% if specific
  if (criteria.gender?.enabled && criteria.gender.value && criteria.gender.value !== 'all') {
    basePercentage *= 0.5;
  }
  
  // Locations reduce based on selected count
  if (criteria.location?.enabled && criteria.location.regions?.length) {
    const totalRegions = SAUDI_REGIONS.length;
    const regionFactor = Math.min(1, (criteria.location.regions.length / totalRegions));
    basePercentage *= regionFactor;
  }
  
  // Occupation reduces based on sectors
  if (criteria.occupation?.enabled && criteria.occupation.sectors?.length) {
    const totalSectors = OCCUPATION_SECTORS.length;
    const sectorFactor = Math.min(1, (criteria.occupation.sectors.length / totalSectors));
    basePercentage *= sectorFactor;
  }
  
  // Tech proficiency reduces by ~30-70% depending on level
  if (criteria.tech_proficiency?.enabled && criteria.tech_proficiency.level) {
    switch (criteria.tech_proficiency.level) {
      case 'beginner':
        basePercentage *= 0.7;
        break;
      case 'intermediate':
        basePercentage *= 0.5;
        break;
      case 'advanced':
        basePercentage *= 0.3;
        break;
      // 'all' doesn't reduce
    }
  }
  
  return Math.max(1, Math.round(basePercentage));
};

/**
 * Audience size categories based on reach percentage
 */
export type AudienceSizeCategory = 'Very Small' | 'Small' | 'Medium' | 'Large' | 'Very Large';

/**
 * Determines the audience size category based on the reach percentage
 */
export const getAudienceSizeCategory = (reachPercentage: number): AudienceSizeCategory => {
  if (reachPercentage >= 75) return 'Very Large';
  if (reachPercentage >= 40) return 'Large';
  if (reachPercentage >= 15) return 'Medium';
  if (reachPercentage >= 5) return 'Small';
  return 'Very Small';
};

/**
 * Formats target audience criteria for storage in the database
 */
export const formatAudienceCriteriaForStorage = (
  criteria: TargetAudience
): Record<string, any> => {
  const formattedCriteria: Record<string, any> = {};
  
  if (criteria.age_range?.enabled && criteria.age_range.min && criteria.age_range.max) {
    formattedCriteria.age_range = {
      min: criteria.age_range.min,
      max: criteria.age_range.max,
    };
  }
  
  if (criteria.gender?.enabled && criteria.gender.value) {
    formattedCriteria.gender = criteria.gender.value;
  }
  
  if (criteria.location?.enabled && criteria.location.regions?.length) {
    formattedCriteria.regions = criteria.location.regions;
  }
  
  if (criteria.occupation?.enabled && criteria.occupation.sectors?.length) {
    formattedCriteria.occupation_sectors = criteria.occupation.sectors;
  }
  
  if (criteria.tech_proficiency?.enabled && criteria.tech_proficiency.level) {
    formattedCriteria.tech_proficiency = criteria.tech_proficiency.level;
  }
  
  return formattedCriteria;
}; 