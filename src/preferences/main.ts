// @ts-expect-error Svelte files can be imported
import App from './App.svelte';
import type { Browser } from 'webextension-polyfill';
declare const browser: Browser;

const app = new App({
  target: document.body,
  props: {
    browser: browser,
  },
});

export default app;
