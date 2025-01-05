import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let artworkCount = 0;
const artworks = new Map();
const viewingRights = new Map();

// Simulated contract functions
function createArtwork(title: string, description: string, quantumSignature: string, viewingPrice: number, creator: string) {
  const artworkId = ++artworkCount;
  artworks.set(artworkId, {
    creator,
    title,
    description,
    quantumSignature,
    creationTime: Date.now(),
    viewingPrice
  });
  return artworkId;
}

function updateViewingPrice(artworkId: number, newPrice: number, updater: string) {
  const artwork = artworks.get(artworkId);
  if (!artwork) throw new Error('Invalid artwork');
  if (artwork.creator !== updater) throw new Error('Not authorized');
  artwork.viewingPrice = newPrice;
  artworks.set(artworkId, artwork);
  return true;
}

function purchaseViewingRights(artworkId: number, viewer: string) {
  const artwork = artworks.get(artworkId);
  if (!artwork) throw new Error('Invalid artwork');
  const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 1 day from now
  viewingRights.set(`${artworkId}-${viewer}`, { expiration: expirationTime });
  return true;
}

describe('Quantum Art Management Contract', () => {
  beforeEach(() => {
    artworkCount = 0;
    artworks.clear();
    viewingRights.clear();
  });
  
  it('should create a new artwork', () => {
    const id = createArtwork('Quantum Waves', 'A visualization of quantum interference', 'abc123', 100, 'artist1');
    expect(id).toBe(1);
    const artwork = artworks.get(id);
    expect(artwork.title).toBe('Quantum Waves');
    expect(artwork.viewingPrice).toBe(100);
  });
  
  it('should update viewing price', () => {
    const id = createArtwork('Entangled Particles', 'An artistic representation of quantum entanglement', 'def456', 200, 'artist2');
    expect(updateViewingPrice(id, 250, 'artist2')).toBe(true);
    const artwork = artworks.get(id);
    expect(artwork.viewingPrice).toBe(250);
  });
  
  it('should purchase viewing rights', () => {
    const id = createArtwork('Schrodinger\'s Canvas', 'A painting that exists in multiple states simultaneously', 'ghi789', 150, 'artist3');
    expect(purchaseViewingRights(id, 'viewer1')).toBe(true);
    const rights = viewingRights.get(`${id}-viewer1`);
    expect(rights).toBeDefined();
    expect(rights.expiration).toBeGreaterThan(Date.now());
  });
  
  it('should not allow unauthorized viewing price updates', () => {
    const id = createArtwork('Quantum Realm', 'A journey through the quantum world', 'jkl012', 300, 'artist4');
    expect(() => updateViewingPrice(id, 350, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow purchasing viewing rights for invalid artworks', () => {
    expect(() => purchaseViewingRights(999, 'viewer2')).toThrow('Invalid artwork');
  });
});

