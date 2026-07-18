/**
 * Utilities for client-side image compression and base64 optimization.
 */

import { AppState } from '../types.ts';

/**
 * Compresses a base64 image string to a specified size and quality.
 */
export function compressBase64Image(
  base64Str: string,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.7
): Promise<string> {
  if (!base64Str || !base64Str.startsWith('data:image/')) {
    return Promise.resolve(base64Str);
  }

  // If already small (e.g., < 25 KB), return as is to avoid unnecessary cycles
  if (base64Str.length < 35000) {
    return Promise.resolve(base64Str);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Downscale if exceeds max dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Export as a lightweight JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

/**
 * Scans the AppState for any large base64 image fields and compresses them recursively.
 * If the final state size is still dangerously large, it aggressively trims or clears
 * the largest images to guarantee the final state size fits under the Firestore 1MB limit.
 */
export async function compressAppState(state: AppState): Promise<AppState> {
  if (!state) return state;

  // Deep clone state to avoid direct mutation
  let newState: AppState;
  try {
    newState = JSON.parse(JSON.stringify(state));
  } catch (err) {
    return state;
  }

  // Recursive walker to compress any base64 images
  async function walkAndCompress(obj: any, isAggressive = false): Promise<any> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = await walkAndCompress(obj[i], isAggressive);
      }
      return obj;
    }

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string' && val.startsWith('data:image/')) {
        // Configure dimensions
        let maxW = isAggressive ? 80 : 300;
        let maxH = isAggressive ? 80 : 300;
        let quality = isAggressive ? 0.4 : 0.7;

        if (!isAggressive) {
          if (key.toLowerCase().includes('background')) {
            maxW = 600;
            maxH = 600;
            quality = 0.6;
          } else if (key.toLowerCase().includes('favicon')) {
            maxW = 48;
            maxH = 48;
            quality = 0.7;
          } else if (key.toLowerCase().includes('icon')) {
            maxW = 80;
            maxH = 80;
            quality = 0.7;
          }
        }

        const compressed = await compressBase64Image(val, maxW, maxH, quality);
        obj[key] = compressed;
      } else if (typeof val === 'string' && val.includes('data:image/')) {
        // Handle background url("data:image/...") syntax
        const match = val.match(/url\(["']?(data:image\/[^"']+)["']?\)/);
        if (match && match[1]) {
          const base64Part = match[1];
          const maxDim = isAggressive ? 100 : 600;
          const qual = isAggressive ? 0.4 : 0.6;
          const compressedPart = await compressBase64Image(base64Part, maxDim, maxDim, qual);
          obj[key] = val.replace(base64Part, compressedPart);
        }
      } else if (typeof val === 'object') {
        obj[key] = await walkAndCompress(val, isAggressive);
      }
    }

    return obj;
  }

  // 1. Primary standard compression pass
  newState = await walkAndCompress(newState, false);

  // 2. Check size. If it exceeds 800KB (leaving 200KB buffer for Firestore 1MB limits),
  // we perform an AGGRESSIVE compression pass downscale.
  let stateStr = JSON.stringify(newState);
  if (stateStr.length > 800000) {
    console.warn("[compressAppState] State size exceeds 800KB. Applying aggressive downscale...");
    newState = await walkAndCompress(newState, true);
    stateStr = JSON.stringify(newState);
  }

  // 3. Absolute Failsafe: If it STILL exceeds 900KB, remove or replace large base64 strings with simple fallbacks
  if (stateStr.length > 900000) {
    console.warn("[compressAppState] State size STILL exceeds 900KB. Dropping extremely large base64 image data...");
    
    // Recursive walker to drop large image strings
    function walkAndClearLargeStrings(obj: any): any {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = walkAndClearLargeStrings(obj[i]);
        }
        return obj;
      }
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'string' && val.startsWith('data:image/') && val.length > 10000) {
          // Replace with a simple, small fallback text/initials representation
          obj[key] = "LK"; 
        } else if (typeof val === 'string' && val.includes('data:image/') && val.length > 10000) {
          obj[key] = "none";
        } else if (typeof val === 'object') {
          obj[key] = walkAndClearLargeStrings(val);
        }
      }
      return obj;
    }

    newState = walkAndClearLargeStrings(newState);
  }

  return newState;
}
