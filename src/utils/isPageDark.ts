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

import { darkness } from './darkness';

function checkByElement() {
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
    testDiv.style.zIndex = '2147483647 !important';
    //testDiv.style.pointerEvents = 'none';
    testDiv.style.border = 'green';
    testDiv.style.borderWidth = '1px';
    testDiv.style.borderStyle = 'solid';
    //testDiv.style.color = 'green';
    //testDiv.style.color = 'white';
    testDiv.innerText = 'TEst me baby one more time';
    document.body.appendChild(testDiv);
  }
  // Get computed color style
  console.log(1, testDiv, window.getComputedStyle(testDiv).color);
  const computedColor = window.getComputedStyle(testDiv).color;
  // Parse rgb color string
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    // Use darkness() to check if color is very close to white
    // darkness() returns 0 for white, 1 for black
    // If darkness is very low (e.g. < 0.05), treat as white
    const d = darkness(r, g, b);
    console.log('matchmatchmatch', d, match);
    if (d < 0.4) {
      return true;
    }
  }
  if (
    computedColor === 'white'
    || computedColor === '#fff'
    || computedColor === '#ffffff'
  ) {
    return true;
  }
  return false;
}

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

  if (hasDarkStyle(allEls)) return true;

  //if (recheck) return false;

  const test = checkByElement();

  console.log('we are testing', test);

  return false;
}
