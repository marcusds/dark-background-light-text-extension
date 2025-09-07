/**
 * Calculates the darkness of a color based on its RGB components.
 *
 * The function computes the luminance of the color using the standard
 * formula for relative luminance (Rec. 709), then returns a value
 * between 0 (lightest) and 1 (darkest) representing the darkness.
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns A number between 0 (light) and 1 (dark) indicating the darkness.
 */
export function darkness(r: number, g: number, b: number) {
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1 - luminance / 255;
}
