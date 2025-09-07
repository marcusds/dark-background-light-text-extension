export function detectIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}