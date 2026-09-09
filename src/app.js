import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthHandler } from './routes/health.js';
import { swaggerSpec } from './docs/swaggerSpec.js';

export function createApp() {
  const app = express();
  app.get('/health', healthHandler);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
  return app;
}
