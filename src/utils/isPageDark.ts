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

/*function checkByElement() {
  // Add a div to the page.
  // Set its style to position: absolute; right: 0; bottom: 0;
  const id = 'is-page-dark-test-div';
  let testDiv = document.getElementById(id) as HTMLDivElement | null;
  if (!testDiv) {
    testDiv = document.createElement('div');
    testDiv.id = id;
    testDiv.style.position = 'absolute';
    testDiv.style.right = '0';
    testDiv.style.bottom = '0';
    testDiv.style.width = '100px';
    testDiv.style.height = '100px';
    // testDiv.style.zIndex = '-9999';
    testDiv.style.pointerEvents = 'none';
    testDiv.style.background = 'white';
    testDiv.style.border = 'green';
    document.body.appendChild(testDiv);
  }
  return false;
}*/

// Check for common dark mode classes
const darkClassNames = ['dark', 'night', 'skin-theme-clientpref-os'];

// Check for common dark mode data attr
export const darkDatas = ['colorMode', 'theme', 'bs-theme'];

const isDarkPref = window.matchMedia('(prefers-color-scheme: dark)').matches;

const hasDarkClass = (els: HTMLElement[] | null) => {
  if (!els) return false;
  for (const el of els) {
    if (darkClassNames.some((cls) => el.getAttribute('class')?.includes(cls))) {
      return true;
    }
  }
  return false;
};

const hasDarkData = (els: HTMLElement[] | null) => {
  if (!els) return false;
  for (const el of els) {
    if (
      el.hasAttribute('dark') // Youtube
      || darkDatas.some(
        (v) =>
          (isDarkPref && el?.dataset?.[v]?.includes('auto'))
          || el?.dataset?.[v]?.includes('dark')
          || el?.dataset?.[v]?.includes('black'),
      )
    ) {
      return true;
    }
  }
  return false;
};

const hasDarkStyle = (els: HTMLElement[] | null) => {
  if (!els) return false;
  for (const el of els) {
    const style = el.getAttribute('style');
    if (style && /color-scheme\s*:\s*dark/i.test(style)) {
      return true;
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isPageDark(_recheck = false) {
  const doc = document.documentElement;
  const body = document.body;
  const htmlEl = window.document.getElementsByTagName('html')[0];

  const allEls = [doc, body, htmlEl];

  if (hasDarkClass(allEls)) return true;

  if (hasDarkData(allEls)) return true;

  return hasDarkStyle(allEls);

  //if (recheck) return false;

  //return checkByElement()
}
