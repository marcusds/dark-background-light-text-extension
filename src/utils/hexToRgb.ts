export function stringToRgba(value: string, includeOpacity = true) {
  if (value.startsWith('rgb')) {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map((v) => parseFloat(v.trim()));
      if (!includeOpacity || parts.length === 3) {
        return [parts[0], parts[1], parts[2]];
      } else {
        return [parts[0], parts[1], parts[2], parts[3]];
      }
    }
  }

  const sanitizedHex = value.startsWith('#') ? value.slice(1) : value;

  const expandedHex =
    sanitizedHex.length <= 4
      ? sanitizedHex
          .split('')
          .map((char) => char + char)
          .join('')
      : sanitizedHex;

  const r = parseInt(expandedHex.substring(0, 2), 16);
  const g = parseInt(expandedHex.substring(2, 4), 16);
  const b = parseInt(expandedHex.substring(4, 6), 16);
  let a = 1;

  if (expandedHex.length === 8) {
    a = parseInt(expandedHex.substring(6, 8), 16) / 255;
  }

  return [r, g, b, ...(includeOpacity ? [a] : [])];
}
