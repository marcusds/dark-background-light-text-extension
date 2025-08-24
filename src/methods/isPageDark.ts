// --- DARK MODE DETECTION AND AUTO-DISABLE LOGIC ---
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

const DEBUG = true;

function debugLog(...args: any[]) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function isPageDark() {
  // Heuristic: check computed background and text color of <body> or <html>
  //const body = document.body;
  //const docEl = document.documentElement;

  // Check for 'dark' class on <html> (documentElement), <body>, and explicitly via getElementsByTagName('html')[0]
  const htmlEl = document.getElementsByTagName('html')[0];
  const isDarkClass =
    (htmlEl && htmlEl.classList.contains('dark')) ||
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark');
  debugLog('isPageDark: .dark class present:', isDarkClass);
  if (isDarkClass) return true;

  // Check for data-darkreader-scheme="dark" on <html> or <body>
  const darkreaderSchemeHtml = htmlEl && htmlEl.getAttribute('data-darkreader-scheme') === 'dark';
  debugLog('isPageDark: data-darkreader-scheme="dark" on html:', darkreaderSchemeHtml);
  if (darkreaderSchemeHtml) return true;

  const theme = document.documentElement.getAttribute('data-theme');
  const themeIsDark = theme && theme.toLowerCase().includes('dark');
  debugLog(
    "isPageDark: data-theme contains 'dark':",
    themeIsDark,
    '(theme:',
    theme,
    ')',
  );
  if (themeIsDark) return true;

  const websiteTheme = getWebsiteTheme();
  const websiteThemeIsDark = websiteTheme === 'dark';
  debugLog(
    "isPageDark: getWebsiteTheme() === 'dark':",
    websiteThemeIsDark,
    '(websiteTheme:',
    websiteTheme,
    ')',
  );
  if (websiteThemeIsDark) return true;

  return false;

 /* const style = window.getComputedStyle(body || docEl);
  const bg = style.backgroundColor;
  const fg = style.color;
  const bgLum = getLuminance(bg);
  const fgLum = getLuminance(fg);
  const heuristicDark = bgLum < 0.5 && fgLum > 0.5;
  debugLog(
    'isPageDark: bgLum:',
    bgLum,
    'fgLum:',
    fgLum,
    'heuristicDark:',
    heuristicDark,
    '(bg:',
    bg,
    'fg:',
    fg,
    ')',
  );
  // If background is dark and text is light, consider it dark mode
  return heuristicDark;*/
}
