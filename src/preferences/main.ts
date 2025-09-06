import App from './App.svelte';
import { mount } from 'svelte';
import type { Browser } from 'webextension-polyfill';
declare const browser: Browser;

const app = mount(App, {
  target: document.body,
  props: {
    browser: browser,
  },
});

export default app;
