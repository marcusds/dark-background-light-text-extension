import type { RenderOptions } from '../../common/types';

export const name = 'stylesheet-processor';
export function render({
  default_foreground_color,
  default_background_color,
  is_toplevel,
}: RenderOptions) {
  return `
html {
${
  '' /* some webpages set html's bgcolor to transparent which is becomes white so it should be !important */
}\
${
  is_toplevel
    ? `\
  background-color: ${default_background_color} !important;
`
    : ''
}\
${'' /* #29 */}\
  color: ${default_foreground_color} !important;
}


${'' /* Bittorrent sync webui fix */}\
.qrCode > canvas {
  border: 10px white solid;
}
`;
}
