import type {
  MethodIndex,
  MethodMetadataWithExecutors,
} from '../common/types';
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

  async checkAndPersistDarkPage(): Promise<void> {
    const isDefaultMethod =
      (await this.methodResolver.isDefaultMethod(window.document.documentURI))
      || (await this.methodResolver.isDefaultMethod(window.location.hostname));

    if (!isDefaultMethod) return;

    const method = await this.methodResolver.getMethodForUrl(
      window.document.documentURI,
    );
    const sheets = document.querySelectorAll('.dblt-ykjmwcnxmi');

    for (const sheet of sheets) {
      sheet?.setAttribute('media', '(not all)');
    }

    if (isPageDark(method)) {
      this.disconnectAllObservers();
      for (const sheet of sheets) {
        sheet?.setAttribute('media', '');
      }
      const urlKey = generate_urls(window.document.documentURI)[0];
      const mergedConfigured = window.merged_configured;
      if (
        !mergedConfigured[urlKey]
        || mergedConfigured[urlKey] !== DISABLED_ID
      ) {
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
    } else {
      sheets.forEach((link) => {
        link.setAttribute('media', '');
      });
    }
  }
}
