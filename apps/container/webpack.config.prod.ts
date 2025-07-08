import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack';
import { ModuleFederationConfig } from '@nx/module-federation';

import baseConfig from './module-federation.config';

const prodConfig: ModuleFederationConfig = {
  ...baseConfig,
  /*
   * For static deployment (S3), we'll include the remotes as part of the build
   * so everything is bundled together as a standalone application.
   * 
   * If you want to deploy micro-frontends separately, you would configure
   * the remotes to point to their deployed URLs:
   * 
   * remotes: [
   *   ['headerMfe', 'https://your-header-mfe-domain.com/remoteEntry.js'],
   *   ['projectListMfe', 'https://your-projectlist-mfe-domain.com/remoteEntry.js'],
   * ]
   */
  remotes: baseConfig.remotes,
};

// Nx plugins for webpack to build config object from Nx options and context.
/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default composePlugins(
  withNx(),
  withReact(),
  withModuleFederation(prodConfig, { dts: false })
);
