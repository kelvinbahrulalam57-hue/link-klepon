/**
 * Utilities for client-side image compression and base64 optimization.
 */

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

  // If already small (e.g., < 80 KB), return as is to avoid unnecessary cycles
  if (base64Str.length < 110000) {
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

import { AppState } from '../types.ts';

/**
 * Scans the AppState for any large base64 image fields and compresses them.
 * Returns a new optimized AppState.
 */
export async function compressAppState(state: AppState): Promise<AppState> {
  const newState = { ...state };
  let changed = false;

  // 1. Profile Avatar
  if (newState.profile?.avatarValue && newState.profile.avatarValue.startsWith('data:image/')) {
    const original = newState.profile.avatarValue;
    const compressed = await compressBase64Image(original, 300, 300, 0.7);
    if (compressed !== original) {
      newState.profile = { ...newState.profile, avatarValue: compressed };
      changed = true;
    }
  }

  // 2. Profile Favicon
  if (newState.profile?.favicon && newState.profile.favicon.startsWith('data:image/')) {
    const original = newState.profile.favicon;
    const compressed = await compressBase64Image(original, 64, 64, 0.7);
    if (compressed !== original) {
      newState.profile = { ...newState.profile, favicon: compressed };
      changed = true;
    }
  }

  // 3. Theme Background (if base64 URL inside)
  if (newState.theme?.backgroundValue && newState.theme.backgroundValue.includes('data:image/')) {
    // Background value might be of format `url("data:image/...")`
    const original = newState.theme.backgroundValue;
    const match = original.match(/url\(["']?(data:image\/[^"']+)["']?\)/);
    if (match && match[1]) {
      const base64Part = match[1];
      const compressedPart = await compressBase64Image(base64Part, 800, 800, 0.6); // Slightly larger dimensions for background
      if (compressedPart !== base64Part) {
        newState.theme = {
          ...newState.theme,
          backgroundValue: original.replace(base64Part, compressedPart)
        };
        changed = true;
      }
    } else if (original.startsWith('data:image/')) {
      const compressed = await compressBase64Image(original, 800, 800, 0.6);
      if (compressed !== original) {
        newState.theme = { ...newState.theme, backgroundValue: compressed };
        changed = true;
      }
    }
  }

  // 4. Link Item Icons/Images
  if (newState.links && newState.links.length > 0) {
    const updatedLinks = [...newState.links];
    let linksChanged = false;
    for (let i = 0; i < updatedLinks.length; i++) {
      const link = updatedLinks[i];
      if (link.imageValue && link.imageValue.startsWith('data:image/')) {
        const original = link.imageValue;
        const compressed = await compressBase64Image(original, 200, 200, 0.7);
        if (compressed !== original) {
          updatedLinks[i] = { ...link, imageValue: compressed };
          linksChanged = true;
        }
      }
    }
    if (linksChanged) {
      newState.links = updatedLinks;
      changed = true;
    }
  }

  return newState;
}
