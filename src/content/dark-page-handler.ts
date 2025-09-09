import type { MethodIndex, MethodMetadataWithExecutors } from '../common/types';
import { generate_urls } from '../common/generate-urls';
import { isPageDark } from '../utils/isPageDark';
import { DISABLED_ID } from '../methods/methods';

interface MethodResolver {
  isDefaultMethod: (url: string) => Promise<boolean>;
  getMethodForUrl: (
    url: string,
    forceMethod?: MethodIndex,
  ) => Promise<MethodMetadataWithExecutors>;
}

export class DarkPageHandler {
  constructor(
    private methodResolver: MethodResolver,
    private tabIdPromise: Promise<unknown>,
    private disconnectAllObservers: () => void,
  ) {}

  async disableDarkMode() {
    this.disconnectAllObservers();
    const urlKey = generate_urls(window.document.documentURI)[0];
    const mergedConfigured = window.merged_configured;
    if (!mergedConfigured[urlKey] || mergedConfigured[urlKey] !== DISABLED_ID) {
      const tabId = await this.tabIdPromise;
      const configuredTabs = window.configured_tabs;
      const url = configuredTabs?.[tabId as number];
      await browser.runtime.sendMessage({
        action: 'set_configured_page',
        key: url,
        value: DISABLED_ID,
      });
      window.do_it({}, DISABLED_ID);
    }
  }

  async checkAndPersistDarkPage(retry = false): Promise<void> {
    const isDefaultMethod =
      (await this.methodResolver.isDefaultMethod(window.document.documentURI))
      || (await this.methodResolver.isDefaultMethod(window.location.hostname));

    if (!isDefaultMethod) {
      return;
    }

    // Check if we have a previous log entry for this URL
    if (window.location.hostname) {
      let result = await browser.runtime.sendMessage({
        action: 'get_dark_page_logs',
        key: window.location.hostname,
      });
      if (result === undefined || result === null) {
        // Try again with documentURI if no result
        result = await browser.runtime.sendMessage({
          action: 'get_dark_page_logs',
          key: window.document.documentURI,
        });
      }
      if (result === false) {
        return;
      }
    }

    const currentMethod = await this.methodResolver.getMethodForUrl(
      window.document.documentURI,
    );

    const method = await this.methodResolver.getMethodForUrl(
      window.document.documentURI,
    );

    if (retry) {
      // If not the initial check do a simple check
      if (isPageDark(method)) {
        await this.disableDarkMode();
      }
    } else {
      const sheets = document.querySelectorAll('.dblt-ykjmwcnxmi');
      for (const sheet of sheets) {
        sheet?.setAttribute('media', '(not all)');
      }
      const keepFromBlinding = document.createElement('style');
      keepFromBlinding.appendChild(
        document.createTextNode('* { background: #000 !important; }'),
      );
      document.body.appendChild(keepFromBlinding);

      await window.do_it({}, DISABLED_ID, async () => {
        requestAnimationFrame(async () => {
          if (isPageDark(method)) {
            await this.disableDarkMode();
          } else {
            await browser.runtime.sendMessage({
              action: 'log_dark_page_check',
              key: window.location.hostname,
              value: false,
            });
            for (const sheet of sheets) {
              sheet?.setAttribute('media', '');
            }
            await window.do_it({}, currentMethod.number);
          }
          keepFromBlinding.remove();
        });
      });
    }
  }
}
