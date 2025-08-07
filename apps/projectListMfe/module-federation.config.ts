import { ModuleFederationConfig } from '@nx/module-federation';
const { createSharedConfig } = require('../createSharedConfig');

const config: ModuleFederationConfig = {
  name: 'projectListMfe',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
  shared: createSharedConfig()
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
