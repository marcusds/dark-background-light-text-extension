// Don't delete this comment... I'm coming back to it.
/*const getLuminance = (rgb: string) => {
  // Parse rgb(a) string and compute luminance
  const match = rgb.match(/rgba?\((\d+), (\d+), (\d+)/);
  if (!match) return 1; // fallback: treat as light
  const r = parseInt(match[1], 10) / 255;
  const g = parseInt(match[2], 10) / 255;
  const b = parseInt(match[3], 10) / 255;
  // sRGB luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};*/

export function isPageDark() {
  const doc = document.documentElement;
  const body = document.body;
  const htmlEl = window.document.getElementsByTagName('html')[0];


  // Check for common dark mode classes
  const darkClassNames = ['dark', 'night', 'dark-mode', 'theme-dark', 'darkTheme', 'skin-theme-clientpref-os'];
  const hasDarkClass = (el: Element | null) =>
    !!el && darkClassNames.some(cls => el.getAttribute('class')?.includes(cls));

  if (hasDarkClass(doc) || hasDarkClass(body) || hasDarkClass(htmlEl)) return true;

  // Check for data-theme="dark"
  return doc.getAttribute('data-theme')?.toLowerCase() === 'dark' ||
    body.getAttribute('data-theme')?.toLowerCase() === 'dark';
}
