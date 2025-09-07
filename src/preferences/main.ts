import App from './App.svelte';
import { mount } from 'svelte';
// Firefox WebExtensions API - using Chrome types as base
declare const browser: typeof chrome;

const app = mount(App, {
  target: document.body,
  props: {
    browser: browser,
  },
});

export default app;
