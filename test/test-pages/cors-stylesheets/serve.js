#!/usr/bin/node

import { serve } from '../simple-node-server.js';

const ports = [8080, 8081, 8082, 8083];

ports.forEach((port) =>
  serve({
    port,
    mutateHeaders({ headers, request }) {
      if (request.url.endsWith('.woff2')) {
        headers['Access-Control-Allow-Origin'] = '*';
      }
      return headers;
    },
    mutateFilePath: ({ filePath }) => `./${port}${filePath}`,
  }),
);
