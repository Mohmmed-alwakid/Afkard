import { 
  TargetAudience,
  getActiveFiltersCount,
  calculateEstimatedReachPercentage,
  getAudienceSizeCategory,
  formatAudienceCriteriaForStorage
} from '@/utils/audience-utils';

describe('Audience Utilities', () => {
  // Sample audience criteria for testing
  const emptyCriteria: TargetAudience = {
    age_range: { enabled: false },
    gender: { enabled: false },
    location: { enabled: false },
    occupation: { enabled: false },
    tech_proficiency: { enabled: false },
  };

  const sampleCriteria: TargetAudience = {
    age_range: { enabled: true, min: 25, max: 45 },
    gender: { enabled: true, value: 'male' },
    location: { enabled: true, regions: ['Riyadh', 'Makkah'] },
    occupation: { enabled: false },
    tech_proficiency: { enabled: true, level: 'intermediate' },
  };

  describe('getActiveFiltersCount', () => {
    it('should return 0 for empty criteria', () => {
      expect(getActiveFiltersCount(emptyCriteria)).toBe(0);
    });

    it('should return the correct count of active filters', () => {
      expect(getActiveFiltersCount(sampleCriteria)).toBe(3);
    });
  });

  describe('calculateEstimatedReachPercentage', () => {
    it('should return 100 for empty criteria', () => {
      expect(calculateEstimatedReachPercentage(emptyCriteria)).toBe(100);
    });

    it('should calculate reduced percentage based on age range', () => {
      const criteria: TargetAudience = {
        ...emptyCriteria,
        age_range: { enabled: true, min: 25, max: 45 },
      };
      const result = calculateEstimatedReachPercentage(criteria);
      expect(result).toBeLessThan(100);
      expect(result).toBeGreaterThan(0);
    });

    it('should calculate reduced percentage based on gender', () => {
      const criteria: TargetAudience = {
        ...emptyCriteria,
        gender: { enabled: true, value: 'female' },
      };
      expect(calculateEstimatedReachPercentage(criteria)).toBe(50);
    });

    it('should not reduce percentage for "all" gender', () => {
      const criteria: TargetAudience = {
        ...emptyCriteria,
        gender: { enabled: true, value: 'all' },
      };
      expect(calculateEstimatedReachPercentage(criteria)).toBe(100);
    });

    it('should calculate combined reduction for multiple filters', () => {
      const result = calculateEstimatedReachPercentage(sampleCriteria);
      expect(result).toBeLessThan(50); // Multiple reductions should compound
    });
  });

  describe('getAudienceSizeCategory', () => {
    it('should return "Very Large" for percentages >= 75', () => {
      expect(getAudienceSizeCategory(75)).toBe('Very Large');
      expect(getAudienceSizeCategory(100)).toBe('Very Large');
    });

    it('should return "Large" for percentages between 40 and 74', () => {
      expect(getAudienceSizeCategory(40)).toBe('Large');
      expect(getAudienceSizeCategory(74)).toBe('Large');
    });

    it('should return "Medium" for percentages between 15 and 39', () => {
      expect(getAudienceSizeCategory(15)).toBe('Medium');
      expect(getAudienceSizeCategory(39)).toBe('Medium');
    });

    it('should return "Small" for percentages between 5 and 14', () => {
      expect(getAudienceSizeCategory(5)).toBe('Small');
      expect(getAudienceSizeCategory(14)).toBe('Small');
    });

    it('should return "Very Small" for percentages < 5', () => {
      expect(getAudienceSizeCategory(4)).toBe('Very Small');
      expect(getAudienceSizeCategory(1)).toBe('Very Small');
    });
  });

  describe('formatAudienceCriteriaForStorage', () => {
    it('should return an empty object for empty criteria', () => {
      expect(formatAudienceCriteriaForStorage(emptyCriteria)).toEqual({});
    });

    it('should format enabled criteria correctly', () => {
      const result = formatAudienceCriteriaForStorage(sampleCriteria);
      
      // Verify age range
      expect(result.age_range).toEqual({ min: 25, max: 45 });
      
      // Verify gender
      expect(result.gender).toBe('male');
      
      // Verify regions
      expect(result.regions).toEqual(['Riyadh', 'Makkah']);
      
      // Verify occupation is not included
      expect(result.occupation_sectors).toBeUndefined();
      
      // Verify tech proficiency
      expect(result.tech_proficiency).toBe('intermediate');
    });
  });
}); 