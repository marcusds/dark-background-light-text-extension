<script lang="ts" context="module">
  let global_i = 0;
</script>

<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { strip_alpha } from '../common/color_utils';
  import type { RGBA } from '../common/types';

  const local_i = global_i++;

  let class_: string | undefined;
  export { class_ as class };
  export let value: string;
  export let default_: string;

  let common_value = writable('');

  let color_value: string;
  $: color_value = value;
  let text_value: string;
  $: text_value = value;

  let shake_it = false;
  let is_wrong = false;
  let text_class: string;
  $: text_class = [
    ...(text_value.startsWith('#') ? ['uppercase'] : []),
    ...(shake_it ? ['headShake'] : []),
    ...(is_wrong ? ['is-wrong'] : []),
  ].join(' ');

  // Hex color validation regex (supports #RGB, #RRGGBB, #RRGGBBAA, #RGBA)
  function isValidHexColor(str: string): boolean {
    return /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(str);
  }

  onDestroy(
    common_value.subscribe((val) => {
      color_value = val;
      if (
        text_value && val && text_value.toLowerCase() !== val.toLowerCase()
      ) {
        text_value = val;
      }
    }),
  );

  $: common_value.update(() => color_value);
  $: {
    if (isValidHexColor(text_value)) {
      common_value.update(() => text_value);
      is_wrong = false;
    } else {
      is_wrong = true;
    }
  }

  function to_hex_color(a: string): string {
    // Already validated as hex, just return in lowercase
    return a.toLowerCase();
  }

  const dispatch = createEventDispatcher();
  function emit(is_text: boolean) {
    let new_value: string;
    if (is_text) {
      if (isValidHexColor(text_value)) {
        new_value = to_hex_color(text_value);
      } else {
        new_value = default_;
        text_value = new_value;
        shake_it = true;
      }
    } else {
      new_value = color_value;
    }
    dispatch('change', { value: new_value });
  }
</script>

<div class={class_}>
  <input bind:value={color_value} type="color" on:change={() => emit(false)} />
  <input
    bind:value={text_value}
    type="text"
    on:change={() => emit(true)}
    class={text_class}
    on:animationend={() => (shake_it = false)}
  />
</div>

<style>
  div {
    display: flex;
  }
  input {
    width: 50%;
  }
  .uppercase {
    text-transform: uppercase;
  }
  input:first-child {
    /* same as margin-top in .row in bootstrap grid */
    margin-right: 0.2em;
  }
  input[type='text'] {
    transition: border-color box-shadow 2s;
  }
  input:focus {
    outline: none;
  }
  .is-wrong:not(#xhodwxsxaj) {
    border-color: red !important;
  }
  .is-wrong:not(#xhodwxsxaj):focus {
    box-shadow: inset 0 0 0.15em 0.15em red !important;
  }

  /* based on https://github.com/animate-css/animate.css/blob/main/source/attention_seekers/headShake.css */
  @keyframes headShake {
    0% {
      transform: translateX(0);
    }
    6.5% {
      transform: translateX(-6px) rotateY(-9deg);
    }
    18.5% {
      transform: translateX(5px) rotateY(7deg);
    }
    31.5% {
      transform: translateX(-3px) rotateY(-5deg);
    }
    43.5% {
      transform: translateX(2px) rotateY(3deg);
    }
    50% {
      transform: translateX(0);
    }
  }
  .headShake {
    animation-timing-function: ease-in-out;
    animation-name: headShake;

    animation-duration: 0.7s;
    animation-fill-mode: both;
  }
</style>
