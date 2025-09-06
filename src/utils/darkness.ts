export function darkness(r: number, g: number, b: number) {
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1 - luminance / 255;
}
