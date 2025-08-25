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

function getWebsiteTheme() {
  const root = document.documentElement;
  const colorMode = root.getAttribute('data-color-mode');

  if (colorMode === 'auto') {
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? root.getAttribute('data-dark-theme') || 'dark'
      : root.getAttribute('data-light-theme') || 'light';
  }

  return colorMode; // "light" or "dark"
}

export function isPageDark() {
  const body = window.document.body;
  const docEl = window.document.documentElement;

  const htmlEl = window.document.getElementsByTagName('html')[0];
  const isDarkClass =
    (htmlEl && htmlEl.classList.contains('dark')) ||
    docEl.classList.contains('dark') ||
    body.classList.contains('dark');

  if (isDarkClass) return true;

  const darkreaderSchemeHtml = htmlEl && htmlEl.getAttribute('data-darkreader-scheme') === 'dark';

  if (darkreaderSchemeHtml) return true;

  const theme = docEl.getAttribute('data-theme');
  const themeIsDark = theme && theme.toLowerCase().includes('dark');
  if (themeIsDark) return true;

  const websiteTheme = getWebsiteTheme();
  const websiteThemeIsDark = websiteTheme === 'dark';
  if (websiteThemeIsDark) return true;

  return false;

  /*const style = window.getComputedStyle(body || docEl);
  const bg = style.backgroundColor;
  const fg = style.color;
  const bgLum = getLuminance(bg);
  const fgLum = getLuminance(fg);

  return bgLum < 0.5 && fgLum > 0.5;*/
}
