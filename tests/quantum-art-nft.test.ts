import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let lastTokenId = 0;
const tokenMetadata = new Map();
const tokenOwners = new Map();

// Mock quantum-art-management contract
const quantumArtManagement = {
  getArtwork: (artworkId: number) => ({
    creator: 'artist1',
    title: 'Quantum Masterpiece',
    quantumSignature: 'qsig123'
  })
};

// Simulated contract functions
function mintNFT(artworkId: number, minter: string) {
  const tokenId = ++lastTokenId;
  const artwork = quantumArtManagement.getArtwork(artworkId);
  if (artwork.creator !== minter) throw new Error('Not authorized');
  tokenMetadata.set(tokenId, {
    creator: minter,
    artworkId,
    title: artwork.title,
    quantumSignature: artwork.quantumSignature,
    creationTime: Date.now()
  });
  tokenOwners.set(tokenId, minter);
  return tokenId;
}

function transferNFT(tokenId: number, sender: string, recipient: string) {
  if (tokenOwners.get(tokenId) !== sender) throw new Error('Not authorized');
  tokenOwners.set(tokenId, recipient);
  return true;
}

describe('Quantum Art NFT Contract', () => {
  beforeEach(() => {
    lastTokenId = 0;
    tokenMetadata.clear();
    tokenOwners.clear();
  });
  
  it('should mint a new NFT', () => {
    const id = mintNFT(1, 'artist1');
    expect(id).toBe(1);
    const metadata = tokenMetadata.get(id);
    expect(metadata.title).toBe('Quantum Masterpiece');
    expect(tokenOwners.get(id)).toBe('artist1');
  });
  
  it('should transfer NFT ownership', () => {
    const id = mintNFT(1, 'artist1');
    expect(transferNFT(id, 'artist1', 'collector1')).toBe(true);
    expect(tokenOwners.get(id)).toBe('collector1');
  });
  
  it('should not allow unauthorized minting', () => {
    expect(() => mintNFT(1, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized transfers', () => {
    const id = mintNFT(1, 'artist1');
    expect(() => transferNFT(id, 'unauthorized_user', 'collector2')).toThrow('Not authorized');
  });
});

