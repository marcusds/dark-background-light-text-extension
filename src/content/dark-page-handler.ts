import type { Browser, Storage } from 'webextension-polyfill';
import type { ConfiguredPages, ConfiguredTabs, MethodIndex, MethodMetadataWithExecutors } from '../common/types';
import { generate_urls } from '../common/generate-urls';
import { isPageDark } from '../utils/isPageDark';
import { DISABLED_ID } from '../methods/methods';

declare const browser: Browser;

interface DarkPageHandlerDeps {
  methodResolver: {
    isDefaultMethod: (url: string) => Promise<boolean>;
    getMethodForUrl: (url: string, forceMethod?: MethodIndex) => Promise<MethodMetadataWithExecutors>;
  };
  tabIdPromise: Promise<unknown>;
  getMergedConfigured: () => ConfiguredPages;
  getConfiguredTabs: () => ConfiguredTabs;
  doIt: (changes: { [s: string]: Storage.StorageChange }, forceMethod?: MethodIndex) => Promise<void>;
  disconnectAllObservers: () => void;
}

export function createDarkPageHandler(deps: DarkPageHandlerDeps) {
  const { methodResolver, tabIdPromise, getMergedConfigured, getConfiguredTabs, doIt, disconnectAllObservers } = deps;

  async function checkAndPersistDarkPage(): Promise<void> {
    const isDefaultMethod =
      (await methodResolver.isDefaultMethod(window.document.documentURI))
      || (await methodResolver.isDefaultMethod(window.location.hostname));
    
    if (!isDefaultMethod) return;
    
    const method = await methodResolver.getMethodForUrl(window.document.documentURI);
    const sheets = document.querySelectorAll('.dblt-ykjmwcnxmi');
    
    for (const sheet of sheets) {
      sheet?.setAttribute('media', '(not all)');
    }

    if (isPageDark(method)) {
      disconnectAllObservers();
      for (const sheet of sheets) {
        sheet?.setAttribute('media', '');
      }
      const urlKey = generate_urls(window.document.documentURI)[0];
      const mergedConfigured = getMergedConfigured();
      if (
        !mergedConfigured[urlKey]
        || mergedConfigured[urlKey] !== DISABLED_ID
      ) {
        const tabId = await tabIdPromise;
        const configuredTabs = getConfiguredTabs();
        const url = configuredTabs?.[tabId as number];
        await browser.runtime.sendMessage({
          action: 'set_configured_page',
          key: url,
          value: DISABLED_ID,
        });
        doIt({}, DISABLED_ID);
      }
    } else {
      sheets.forEach((link) => {
        link.setAttribute('media', '');
      });
    }
  }

  return {
    checkAndPersistDarkPage,
  };
}