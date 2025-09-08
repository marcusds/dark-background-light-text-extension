import type {
  AddonOptions,
  ConfiguredPages,
  ConfiguredTabs,
  MethodIndex,
  MethodMetadataWithExecutors,
} from '../common/types';
import { methods } from '../methods/methods-with-executors';
import { generate_urls } from '../common/generate-urls';

interface MethodResolverDeps {
  isIframe: boolean;
  tabIdPromise: Promise<unknown>;
  getPrefs: () => AddonOptions;
  getMergedConfigured: () => ConfiguredPages;
  getConfiguredTabs: () => ConfiguredTabs;
}

export function createMethodResolver(deps: MethodResolverDeps) {
  const {
    isIframe,
    tabIdPromise,
    getPrefs,
    getMergedConfigured,
    getConfiguredTabs,
  } = deps;

  async function isDefaultMethod(url: string): Promise<boolean> {
    const prefs = getPrefs();
    if (prefs.enabled) {
      if (isIframe) {
        const parent_method_number = await browser.runtime.sendMessage({
          action: 'query_parent_method_number',
        });
        if (methods[parent_method_number as number].affects_iframes) {
          return false;
        } else if (url === 'about:blank' || url === 'about:srcdoc') {
          return false;
        }
      }

      let tab_configuration: MethodIndex | boolean = false;
      const configuredTabs = getConfiguredTabs();
      if (Object.keys(configuredTabs).length > 0) {
        const tabId = await tabIdPromise;
        tab_configuration =
          (tabId as number) in configuredTabs
            ? configuredTabs[tabId as number]
            : false;
      }

      if (tab_configuration !== false) {
        return true;
      }

      const mergedConfigured = getMergedConfigured();
      const configured_urls = Object.keys(mergedConfigured);
      for (const gen_url of generate_urls(url)) {
        if (configured_urls.includes(gen_url)) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  async function getMethodForUrl(
    url: string,
    forceMethod?: MethodIndex,
  ): Promise<MethodMetadataWithExecutors> {
    if (forceMethod !== undefined) {
      return methods[forceMethod];
    }

    const prefs = getPrefs();
    if (prefs.enabled) {
      if (isIframe) {
        const parent_method_number = await browser.runtime.sendMessage({
          action: 'query_parent_method_number',
        });
        if (methods[parent_method_number as number].affects_iframes) {
          return methods[0];
        } else if (url === 'about:blank' || url === 'about:srcdoc') {
          return methods[parent_method_number as number];
        }
      }

      let tab_configuration: MethodIndex | boolean = false;
      const configuredTabs = getConfiguredTabs();
      if (Object.keys(configuredTabs).length > 0) {
        const tabId = await tabIdPromise;
        tab_configuration =
          (tabId as number) in configuredTabs
            ? configuredTabs[tabId as number]
            : false;
      }
      if (tab_configuration !== false) {
        return methods[tab_configuration as unknown as number];
      }

      const mergedConfigured = getMergedConfigured();
      const configured_urls = Object.keys(mergedConfigured);
      for (const gen_url of generate_urls(url)) {
        if (configured_urls.includes(gen_url)) {
          return methods[mergedConfigured[gen_url]];
        }
      }
      return methods[prefs.default_method];
    } else {
      return methods[0];
    }
  }

  return {
    isDefaultMethod,
    getMethodForUrl,
  };
}
