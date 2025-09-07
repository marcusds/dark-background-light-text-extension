import App from './App.svelte';
import { mount } from 'svelte';
// Using native Firefox WebExtensions API
declare const browser: typeof chrome;

const app = mount(App, {
  target: document.body,
  props: {
    browser: browser,
  },
});

export default app;
