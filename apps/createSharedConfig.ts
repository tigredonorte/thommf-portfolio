import { SharedFunction } from '@nx/module-federation';

interface SharedConfig {
  singleton?: boolean;
  requiredVersion?: string;
  eager?: boolean;
  shareScope?: string;
  import?: string | false;
}

interface SharedObject {
  [sharedName: string]: SharedConfig | false;
}

const sharedPackages: SharedObject = {
  'react': {
    singleton: true,
  },
  'react-dom': {
    singleton: true,
  },
  'react-router-dom': {
    singleton: true,
  },
  'react-icons': false,
};

export const createSharedConfig = (): SharedFunction => {
  return (pkg, config) => {
    if (!(pkg in sharedPackages)) {
      return config;
    }

    const sharedConfig = sharedPackages[pkg];
    
    if (sharedConfig === false) {
      return false;
    }

    return {
      ...config,
      ...sharedConfig,
    };
  };
};
