// Inline minification function to avoid TypeScript import issues
function minCss(rendered_css) {
  return rendered_css
    .replaceAll(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
    .replaceAll(/\/\/.*$/gm, '') // Remove // comments
    .replaceAll(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replaceAll(/;\s*}/g, '}') // Remove semicolon before closing brace
    .replaceAll(/\{\s+/g, '{') // Remove space after opening brace
    .replaceAll(/\s+\{/g, '{') // Remove space before opening brace
    .replaceAll(/:\s+/g, ':') // Remove space after colon
    .replaceAll(/,\s+/g, ',') // Remove space after comma
    .replaceAll(/;\s+/g, ';') // Remove space after semicolon
    .trim(); // Remove leading/trailing whitespace
}

export default function minCssPlugin() {
  return {
    name: 'min-css',
    transform(code, id) {
      // Only process TypeScript files in the stylesheets directory
      if (
        !id.replace(/\\/g, '/').includes('src/methods/stylesheets/')
        || !id.endsWith('.ts')
      ) {
        return null;
      }

      return minCss(code);
    },
  };
}
