import { get_prefs, set_pref } from '../common/shared';
import { CURRENT_TAB_LABEL } from '../consts';
import type { MethodIndex } from '../common/types';

// Firefox WebExtensions API - using Chrome types as base
declare const browser: typeof chrome;

export async function method_change(url: string, method_n: number) {
  const current_tab = (
    await browser.tabs.query({
      //                    popup in the new Fenix is now in a separate window
      currentWindow:
        (await browser.runtime.getPlatformInfo()).os === 'android'
          ? undefined
          : true,
      active: true,
    })
  )[0];

  const isPrivate = current_tab.incognito;

  if (url === CURRENT_TAB_LABEL) {
    browser.runtime.sendMessage({
      action: 'set_configured_tab',
      key: current_tab.id,
      value: method_n >= 0 ? method_n : null,
    });
  } else if (isPrivate) {
    browser.runtime.sendMessage({
      action: 'set_configured_private',
      key: url,
      value: method_n >= 0 ? method_n : null,
    });
  } else {
    const configured_pages = await get_prefs('configured_pages');
    if (method_n < 0) {
      delete configured_pages[url];
    } else {
      configured_pages[url] = method_n.toString() as MethodIndex;
    }
    await set_pref('configured_pages', configured_pages);
  }
}
