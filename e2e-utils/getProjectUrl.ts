import { workspaceRoot } from '@nx/devkit';
import * as path from 'path';
import * as fs from 'fs';

export const getProjectUrl = (projectName: string, envUrl: string | undefined = process.env['APP_URL']) => {
  const baseUrl = envUrl || 'http://localhost';

  if (!projectName) {
    console.error('Project name is required to get the project URL');
    throw new Error('Project name is required to get the project URL');
  }

  if (process.env['CI'] === 'true') {
    if (projectName.includes('container')) {
      return baseUrl;
    }
    return `${baseUrl}/${projectName}/`;
  }

  try {
    const projectJsonPath = path.join(workspaceRoot, `apps/${projectName}/project.json`);
    const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
    const port = projectJson.targets.serve.options.port;

    if (!port) {
      throw new Error(`Port not found in project.json for ${projectName}`);
    }

    return `${baseUrl}:${port}`;
  } catch (error) {
    console.warn(`Failed to read project config for ${projectName}:`, error);
    const defaultPorts: Record<string, number> = {
      container: 4200,
      headerMfe: 4201,
      projectListMfe: 4202,
    };
    const port = defaultPorts[projectName] || 4200;
    return `${baseUrl}:${port}`;
  }
};
