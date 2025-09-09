import { darkness } from './darkness';
import type { MethodMetadataWithExecutors } from '../common/types';

function checkByElement(invertCheck = false) {
  const id = 'is-page-dark-test-3k4fh3';
  let testDiv = document.getElementById(id) as HTMLDivElement | null;
  if (!testDiv) {
    testDiv = document.createElement('div');
    testDiv.id = id;
    testDiv.style.width = '0px';
    testDiv.style.height = '0px';
    testDiv.style.fontSize = '0';
    testDiv.style.overflow = 'hidden';
    testDiv.innerText = '.';

    /*testDiv.style.border = '2px solid green';
    testDiv.style.width = '200px';
    testDiv.style.height = '200px';
    testDiv.style.fontSize = '20px';
    testDiv.style.position = 'absolute';
    testDiv.style.top = '0';
    testDiv.style.left = '0';
    testDiv.innerText = 'TEST ETST TEST TST';*/
    document.body?.appendChild(testDiv);
  }
  const computedColor = window.getComputedStyle(testDiv).color;
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  testDiv.remove();

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const d = darkness(r, g, b);
    if ((invertCheck && d >= 0.7) || (!invertCheck && d <= 0.35)) {
      return true;
    }
  }
  if (
    invertCheck
    && (computedColor === 'white'
      || computedColor === '#fff'
      || computedColor === '#ffffff')
  ) {
    return true;
  }

  return (
    !invertCheck
    && (computedColor === 'black'
      || computedColor === '#000'
      || computedColor === '#000000')
  );
}

// Check for common dark mode classes
const darkClassNames = ['dark', 'night', 'skin-theme-clientpref-os'];

// Check for common dark mode data attr
export const darkDatas = ['colorMode', 'theme', 'bs-theme'];

const isDarkPref = window.matchMedia('(prefers-color-scheme: dark)').matches;

const hasDarkClass = (els: HTMLElement[] | null) => {
  if (!els) return false;
  for (const el of els) {
    if (
      darkClassNames.some((cls) => el?.getAttribute('class')?.includes(cls))
    ) {
      return true;
    }
  }
  return false;
};

const hasDarkData = (els: HTMLElement[] | null) => {
  if (!els) return false;
  for (const el of els) {
    if (
      el?.hasAttribute('dark') // Youtube
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
    const style = el?.getAttribute('style');
    if (style && /color-scheme\s*:\s*dark/i.test(style)) {
      return true;
    }
  }
  return false;
};

export function isPageDark(
  method?: MethodMetadataWithExecutors,
  retry = false,
) {
  const doc = document.documentElement;
  const body = document.body;
  const htmlEl = window.document.getElementsByTagName('html')[0];

  const allEls = [doc, body, htmlEl];

  if (hasDarkClass(allEls)) return true;

  if (hasDarkData(allEls)) return true;

  if (hasDarkStyle(allEls)) return true;

  if (retry) return false;

  return checkByElement(method?.label === 'invert');
}
