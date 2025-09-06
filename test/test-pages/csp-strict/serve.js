#!/usr/bin/node

import { serve } from '../simple-node-server.js';

serve({
  port: 8080,
  mutateHeaders({ headers }) {
    headers['Content-Security-Policy'] = "default-src 'self'";
    return headers;
  },
  mutateFilePath: ({ filePath }) => `./webroot${filePath}`,
});
