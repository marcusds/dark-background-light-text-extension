#!/usr/bin/node

import { serve } from '../simple-node-server.js';

const ports = [8080, 8081];

ports.forEach((port) =>
  serve({
    port,
    mutateFilePath: ({ filePath }) => `./${port}${filePath}`,
  }),
);
