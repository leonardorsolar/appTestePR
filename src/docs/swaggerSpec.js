import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';
import packageJson from '../../package.json' with { type: 'json' };

const routesGlob = join(dirname(fileURLToPath(import.meta.url)), '..', 'routes', '*.js');

export function buildSwaggerSpec() {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
      },
    },
    apis: [routesGlob],
  });
}

export const swaggerSpec = buildSwaggerSpec();
