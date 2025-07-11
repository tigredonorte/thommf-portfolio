import { composePlugins, withNx } from '@nx/webpack';
import { withReact } from '@nx/react';
import { withModuleFederation } from '@nx/module-federation/webpack';
import { ModuleFederationConfig } from '@nx/module-federation';

import baseConfig from './module-federation.config';

const prodConfig: ModuleFederationConfig = {
  ...baseConfig,
  /*
   * For static deployment on S3, we use relative URLs that will resolve
   * to the same domain where the container app is hosted.
   * The micro-frontends will be available at /{remoteName}/remoteEntry.js
   */
  remotes: baseConfig.remotes?.map((remote) => {
    const remoteName = typeof remote === 'string' ? remote : remote[0];
    // Use relative URLs that resolve to the current domain
    return [remoteName, `promise new Promise((resolve, reject) => {
      const remoteUrl = new URL('${remoteName}/remoteEntry.js', document.baseURI);
      const script = document.createElement('script');
      script.src = remoteUrl.href;
      script.onload = () => {
        resolve(window.${remoteName});
      };
      script.onerror = reject;
      document.head.appendChild(script);
    })`];
  }) || [],
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