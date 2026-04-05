/**
 * L² Fractal Engine — 54-Sublayer Web Worker
 * 
 * Offloads heavy fractal computation from the main UI thread.
 * Generates sovereign seed hashes through recursive layering.
 * 
 * Input: { seed: any, depth: number (default 54) }
 * Output: { hash: string, layers: number, timestamp: number, metrics: object }
 */

// Golden Ratio for fractal scaling
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;

// Fractal layer computation
const computeLayer = (input, layerIndex) => {
  const layerSeed = `${JSON.stringify(input)}_L${layerIndex}_${PHI}`;
  let hash = 0;
  
  for (let i = 0; i < layerSeed.length; i++) {
    const char = layerSeed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
    // Apply golden ratio transformation
    hash = Math.floor(hash * PHI_INV) ^ (hash >> 3);
  }
  
  return Math.abs(hash);
};

// Recursive fractal hash generation
const generateFractalHash = (seed, depth) => {
  const startTime = performance.now();
  const layerHashes = [];
  let currentInput = seed;
  
  for (let layer = 0; layer < depth; layer++) {
    const layerHash = computeLayer(currentInput, layer);
    layerHashes.push(layerHash);
    
    // Feed layer output as input to next layer (recursive property)
    currentInput = {
      previous: layerHash,
      layer,
      accumulated: layerHashes.slice(-3) // Last 3 layers influence next
    };
    
    // Report progress every 10 layers
    if ((layer + 1) % 10 === 0) {
      self.postMessage({
        type: 'PROGRESS',
        layer: layer + 1,
        total: depth,
        percent: ((layer + 1) / depth * 100).toFixed(1)
      });
    }
  }
  
  // Combine all layer hashes into final hash
  const combinedHash = layerHashes
    .map((h, i) => {
      // Weight later layers more heavily (emergence principle)
      const weight = 1 + (i / depth) * PHI;
      return Math.floor(h * weight).toString(16).padStart(8, '0');
    })
    .join('');
  
  // Truncate to 64 characters (256-bit equivalent)
  const finalHash = combinedHash.slice(0, 64);
  
  const endTime = performance.now();
  
  return {
    hash: finalHash,
    layers: depth,
    timestamp: Date.now(),
    metrics: {
      computeTime: Math.round(endTime - startTime),
      layerHashes: layerHashes.length,
      entropyScore: calculateEntropy(finalHash)
    }
  };
};

// Calculate entropy score (randomness quality)
const calculateEntropy = (hash) => {
  const charFreq = {};
  for (const char of hash) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = hash.length;
  for (const char in charFreq) {
    const p = charFreq[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  // Normalize to 0-100 scale (max entropy for hex is ~4 bits)
  return Math.round((entropy / 4) * 100);
};

// Message handler
self.onmessage = (e) => {
  const { seed, depth = 54, requestId } = e.data;
  
  console.log(`[FractalEngine] Starting ${depth}-layer computation...`);
  
  try {
    const result = generateFractalHash(seed, depth);
    
    self.postMessage({
      type: 'COMPLETE',
      requestId,
      ...result
    });
    
    console.log(`[FractalEngine] Complete: ${result.hash.slice(0, 16)}... (${result.metrics.computeTime}ms)`);
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      requestId,
      error: error.message
    });
  }
};

// Handle errors
self.onerror = (error) => {
  self.postMessage({
    type: 'ERROR',
    error: error.message
  });
};
