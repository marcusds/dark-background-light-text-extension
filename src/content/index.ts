import type { Browser, Storage } from 'webextension-polyfill';
import type {
  AddonOptions,
  ConfiguredPages,
  ConfiguredTabs,
  MethodExecutor,
  MethodIndex,
  MethodMetadataWithExecutors,
} from '../common/types';
import { methods } from '../methods/methods-with-executors';
import { generate_urls } from '../common/generate-urls';
import { darkDatas, isPageDark } from '../utils/isPageDark';
import { DISABLED_ID } from '../methods/methods';

declare const browser: Browser;

const tabId_promise = browser.runtime.sendMessage({ action: 'query_tabId' });
let is_iframe: boolean;
try {
  is_iframe = window.self !== window.top;
} catch {
  // Using empty catch block as the error value is not needed
  is_iframe = true;
}

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
      changes: { [s: string]: Storage.StorageChange },
      forceMethod?: MethodIndex,
    ) => Promise<void>;
  }
}

if (typeof window.content_script_state === 'undefined') {
  /* #226 part 1 workaround */
  window.content_script_state = 'normal_order';
}

async function is_default_method(url: string): Promise<boolean> {
  if (window.prefs.enabled) {
    if (is_iframe) {
      const parent_method_number = await browser.runtime.sendMessage({
        action: 'query_parent_method_number',
      });
      if (methods[parent_method_number].affects_iframes) {
        return false;
      } else if (url === 'about:blank' || url === 'about:srcdoc') {
        return false;
      }
    }
    // TODO: get rid of await here, https://bugzilla.mozilla.org/show_bug.cgi?id=1574713
    let tab_configuration: MethodIndex | boolean = false;
    if (Object.keys(window.configured_tabs).length > 0) {
      const tabId = await tabId_promise;
      tab_configuration =
        tabId in window.configured_tabs ? window.configured_tabs[tabId] : false;
    }

    if (tab_configuration !== false) {
      return true;
    }

    const configured_urls = Object.keys(window.merged_configured);
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

async function get_method_for_url(
  url: string,
  forceMethod?: MethodIndex,
): Promise<MethodMetadataWithExecutors> {
  if (forceMethod !== undefined) {
    return methods[forceMethod];
  }
  if (window.prefs.enabled) {
    if (is_iframe) {
      const parent_method_number = await browser.runtime.sendMessage({
        action: 'query_parent_method_number',
      });
      if (methods[parent_method_number].affects_iframes) {
        return methods[0];
      } else if (url === 'about:blank' || url === 'about:srcdoc') {
        return methods[parent_method_number];
      }
    }
    // TODO: get rid of await here, https://bugzilla.mozilla.org/show_bug.cgi?id=1574713
    let tab_configuration: MethodIndex | boolean = false;
    if (Object.keys(window.configured_tabs).length > 0) {
      const tabId = await tabId_promise;
      tab_configuration =
        tabId in window.configured_tabs ? window.configured_tabs[tabId] : false;
    }
    if (tab_configuration !== false) {
      return methods[tab_configuration];
    }

    const configured_urls = Object.keys(window.merged_configured);
    for (const gen_url of generate_urls(url)) {
      if (configured_urls.includes(gen_url)) {
        return methods[window.merged_configured[gen_url]];
      }
    }
    return methods[window.prefs.default_method];
  } else {
    return methods[0];
  }
}

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

// Move dark mode check and persistence to its own function and listener
async function checkAndPersistDarkPage(recheck = false) {
  const isDefaultMethod =
    (await is_default_method(window.document.documentURI))
    || (await is_default_method(window.location.hostname));
  if (!isDefaultMethod) return;
  if (isPageDark(recheck)) {
    const urlKey = generate_urls(window.document.documentURI)[0];
    if (
      !window.merged_configured[urlKey]
      || window.merged_configured[urlKey] !== DISABLED_ID
    ) {
      const tabId = await tabId_promise;
      const url = window.configured_tabs?.[tabId];
      await browser.runtime.sendMessage({
        action: 'set_configured_page',
        key: url,
        value: DISABLED_ID,
      });
      window.do_it({}, DISABLED_ID);
    }
  }
}

// Listen for classList changes on <body> and <html> to re-check dark mode
function observeClassListChanges() {
  // Store observers so we can disconnect them later
  const observers: MutationObserver[] = [];
  let disconnected = false;
  const disconnectAll = () => {
    clearTimeout(timeout);
    if (!disconnected) {
      observers.forEach((observer) => observer.disconnect());
      disconnected = true;
    }
  };
  // Remove observers after 45s regardless
  const timeout = setTimeout(disconnectAll, 45000);
  const callback = (mutationsList: MutationRecord[]) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === 'attributes'
        && (mutation.attributeName === 'class'
          || mutation.attributeName?.startsWith('data-'))
      ) {
        checkAndPersistDarkPage();
        if (isPageDark(true)) {
          disconnectAll();
        }
        break;
      }
    }
  };
  const config = {
    attributes: true,
    attributeFilter: ['class', ...darkDatas.map((value) => `data-${value}`)],
  };
  const body = document.body;
  const html = document.documentElement;
  if (body) {
    const observer = new MutationObserver(callback);
    observer.observe(body, config);
    observers.push(observer);
  }
  if (html) {
    const observer = new MutationObserver(callback);
    observer.observe(html, config);
    observers.push(observer);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAndPersistDarkPage();
  observeClassListChanges();
});

window.do_it = async function do_it(
  changes: {
    [s: string]: Storage.StorageChange;
  },
  forceMethod?: MethodIndex,
): Promise<void> {
  try {
    const new_method = await get_method_for_url(
      window.document.documentURI,
      forceMethod,
    );
    console.log('new_method', new_method, forceMethod);
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
      console.log('new_method.stylesheets', new_method.stylesheets);
      for (const css_renderer of new_method.stylesheets) {
        console.log('css_renderer.name', css_renderer.name);
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
            // console.log(2, window.getComputedStyle(document.body)?.color);
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
        // console.log(3, window.getComputedStyle(document.body)?.color);
        current_method_executor.unload_from_window();
        current_method_executor = undefined;
      }
      if (new_method.executor) {
        // console.log(4, window.getComputedStyle(document.body)?.color);
        current_method_executor = new new_method.executor(window, window.prefs);
        console.log('new_method', new_method);
        current_method_executor.load_into_window();
        /*if (document.readyState === 'complete') {
          document
            .querySelectorAll('.dblt-ykjmwcnxmi')
            .forEach((el) => el.setAttribute('media', 'not all'));
        }*/
      }
    }
    current_method = new_method;
  } catch (e) {
    console.error(e);
  }
};

interface GetMethodNumberMsg {
  action: 'get_method_number';
}
browser.runtime.onMessage.addListener(async (message: GetMethodNumberMsg) => {
  try {
    if (!message?.action) {
      console.error('Invalid message format:', message);
      return undefined;
    }

    if (message.action === 'get_method_number') {
      return (await current_method_promise).number;
    }

    console.error('Unknown message action:', message.action);
    return undefined;
  } catch (error) {
    console.error('Error handling message:', error);
    return undefined;
  }
});

if (window.content_script_state === 'registered_content_script_first') {
  /* #226 part 1 workaround */
  window.do_it({});
  window.content_script_state = 'does not matters anymore';
}
