import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let experienceCount = 0;
const experiences = new Map();

// Mock quantum-art-management contract
const quantumArtManagement = {
  getArtwork: (artworkId: number) => ({
    creator: 'artist1',
    title: 'Quantum Masterpiece'
  })
};

// Simulated contract functions
function createExperience(artworkId: number, vrMetadata: string, arMetadata: string, creator: string) {
  const artwork = quantumArtManagement.getArtwork(artworkId);
  if (artwork.creator !== creator) throw new Error('Not authorized');
  const experienceId = ++experienceCount;
  experiences.set(experienceId, {
    creator,
    artworkId,
    vrMetadata,
    arMetadata,
    quantumSeed: `qseed${experienceId}`
  });
  return experienceId;
}

function updateExperience(experienceId: number, vrMetadata: string, arMetadata: string, updater: string) {
  const experience = experiences.get(experienceId);
  if (!experience) throw new Error('Invalid experience');
  if (experience.creator !== updater) throw new Error('Not authorized');
  experience.vrMetadata = vrMetadata;
  experience.arMetadata = arMetadata;
  experiences.set(experienceId, experience);
  return true;
}

describe('Experience Integration Contract', () => {
  beforeEach(() => {
    experienceCount = 0;
    experiences.clear();
  });
  
  it('should create a new experience', () => {
    const id = createExperience(1, 'vr_data_1', 'ar_data_1', 'artist1');
    expect(id).toBe(1);
    const experience = experiences.get(id);
    expect(experience.vrMetadata).toBe('vr_data_1');
    expect(experience.arMetadata).toBe('ar_data_1');
    expect(experience.quantumSeed).toBeDefined();
  });
  
  it('should update an existing experience', () => {
    const id = createExperience(2, 'vr_data_2', 'ar_data_2', 'artist1');
    expect(updateExperience(id, 'updated_vr_data', 'updated_ar_data', 'artist1')).toBe(true);
    const updatedExperience = experiences.get(id);
    expect(updatedExperience.vrMetadata).toBe('updated_vr_data');
    expect(updatedExperience.arMetadata).toBe('updated_ar_data');
  });
  
  it('should not allow unauthorized experience creation', () => {
    expect(() => createExperience(3, 'vr_data_3', 'ar_data_3', 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized experience updates', () => {
    const id = createExperience(4, 'vr_data_4', 'ar_data_4', 'artist1');
    expect(() => updateExperience(id, 'hacked_vr_data', 'hacked_ar_data', 'hacker')).toThrow('Not authorized');
  });
  
  it('should not allow updates to non-existent experiences', () => {
    expect(() => updateExperience(999, 'invalid_vr_data', 'invalid_ar_data', 'artist1')).toThrow('Invalid experience');
  });
});

