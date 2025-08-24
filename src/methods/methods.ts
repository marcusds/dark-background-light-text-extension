import type { MethodIndex, MethodsMetadataBare } from '../common/types';

export const DEFAULT_ID = '-1' as MethodIndex;
export const DISABLED_ID = '0' as MethodIndex;
export const STYLESHEET_PROCESSOR_ID = '1' as MethodIndex;
export const SIMPLE_CSS_ID = '2' as MethodIndex;
export const INVERT_ID = '3' as MethodIndex;

export const methods: MethodsMetadataBare = {
  [DEFAULT_ID]: {
    number: DEFAULT_ID,
    label: 'Default',
    stylesheets: [],
    affects_iframes: false,
  },
  [DISABLED_ID]: {
    number: DISABLED_ID,
    label: 'Disabled',
    stylesheets: [],
    affects_iframes: true,
  },
  [STYLESHEET_PROCESSOR_ID]: {
    number: STYLESHEET_PROCESSOR_ID,
    label: 'Stylesheet processor',
    stylesheets: [
      { name: 'base' },
      /* simple-css will be removed as soon as StylesheetColorProcessor do its work —
               this prevents bright flickering */
      { name: 'simple-css' },
      { name: 'stylesheet-processor' },
    ],
    affects_iframes: false,
  },
  [SIMPLE_CSS_ID]: {
    number: SIMPLE_CSS_ID,
    label: 'Simple CSS',
    stylesheets: [{ name: 'base' }, { name: 'simple-css' }],
    affects_iframes: false,
  },
  [INVERT_ID]: {
    number: INVERT_ID,
    label: 'Invert',
    stylesheets: [{ name: 'invert' }],
    affects_iframes: true,
  },
};
