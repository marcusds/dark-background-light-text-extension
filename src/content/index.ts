// Using native Firefox WebExtensions API types
import type {
  AddonOptions,
  ConfiguredPages,
  ConfiguredTabs,
  MethodExecutor,
  MethodIndex,
  MethodMetadataWithExecutors,
} from '../common/types';
import { detectIframe } from './iframe-detector';
import { createMethodResolver } from './method-resolver';
import { createDarkPageHandler } from './dark-page-handler';
import { createDomObserver } from './dom-observer';
import { createMessageHandler } from './message-handler';

declare const browser: typeof chrome;

const tabId_promise = browser.runtime.sendMessage({ action: 'query_tabId' });
const is_iframe = detectIframe();

declare global {
  interface Window {
    content_script_state:
      | 'normal_order'
      | 'registered_content_script_first'
      | 'does not matters anymore'
      | undefined;
    prefs: AddonOptions;
    merged_configured: ConfiguredPages;
    configured_tabs: ConfiguredTabs;
    rendered_stylesheets: { [key: string]: string };
    do_it: (
      changes: { [s: string]: chrome.storage.StorageChange },
      forceMethod?: MethodIndex,
    ) => Promise<void>;
  }
}

if (typeof window.content_script_state === 'undefined') {
  /* #226 part 1 workaround */
  window.content_script_state = 'normal_order';
}

// Initialize modular components
const methodResolver = createMethodResolver({
  isIframe: is_iframe,
  tabIdPromise: tabId_promise,
  getPrefs: () => window.prefs,
  getMergedConfigured: () => window.merged_configured,
  getConfiguredTabs: () => window.configured_tabs,
});

let current_method: MethodMetadataWithExecutors;
let resolve_current_method_promise:
  | ((mmd: MethodMetadataWithExecutors) => void)
  | null;
let current_method_promise: Promise<MethodMetadataWithExecutors> = new Promise(
  (resolve: (mmd: MethodMetadataWithExecutors) => void) => {
    resolve_current_method_promise = resolve;
  },
);
let current_method_executor: MethodExecutor | undefined;

// Initialize dark page handler and DOM observer
const darkPageHandler = createDarkPageHandler({
  methodResolver,
  tabIdPromise: tabId_promise,
  getMergedConfigured: () => window.merged_configured,
  getConfiguredTabs: () => window.configured_tabs,
  doIt: (changes, forceMethod) => window.do_it(changes, forceMethod),
  disconnectAllObservers: () => domObserver.disconnectAll(),
});

const domObserver = createDomObserver({
  methodResolver,
  darkPageHandler,
});

document.addEventListener('DOMContentLoaded', () => {
  darkPageHandler.checkAndPersistDarkPage();
  domObserver.observeClassListChanges();
});

window.do_it = async function do_it(
  changes: {
    [s: string]: chrome.storage.StorageChange;
  },
  forceMethod?: MethodIndex,
): Promise<void> {
  try {
    const new_method = await methodResolver.getMethodForUrl(
      window.document.documentURI,
      forceMethod,
    );
    if (resolve_current_method_promise) {
      resolve_current_method_promise(new_method);
      resolve_current_method_promise = null;
    } else {
      current_method_promise = Promise.resolve(new_method);
    }
    if (
      !current_method
      || new_method.number !== current_method.number
      || Object.keys(changes).some((key) => key.indexOf('_color') >= 0)
    ) {
      document
        .querySelectorAll('style.dblt-ykjmwcnxmi')
        .forEach((node) => node.remove());
      for (const css_renderer of new_method.stylesheets) {
        const style_node = document.createElement('style');
        style_node.setAttribute('data-source', css_renderer.name);
        style_node.classList.add('dblt-ykjmwcnxmi');
        style_node.innerText =
          window.rendered_stylesheets[
            `${css_renderer.name}_${is_iframe ? 'iframe' : 'toplevel'}`
          ];
        document.documentElement.appendChild(style_node);
        if (!document.body) {
          const appendNode = () => {
            document.documentElement.appendChild(style_node);
          };
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', appendNode, {
              once: true,
            });
          } else {
            appendNode();
          }
        }
      }
      if (current_method_executor) {
        current_method_executor.unload_from_window();
        current_method_executor = undefined;
      }
      if (new_method.executor) {
        current_method_executor = new new_method.executor(window, window.prefs);
        current_method_executor.load_into_window();
      }
    }
    current_method = new_method;
  } catch (e) {
    console.error(e);
  }
};

// Initialize message handler
const messageHandler = createMessageHandler({
  getCurrentMethodPromise: () => current_method_promise,
});
messageHandler.setupMessageListener();

if (window.content_script_state === 'registered_content_script_first') {
  /* #226 part 1 workaround */
  window.do_it({});
  window.content_script_state = 'does not matters anymore';
}
