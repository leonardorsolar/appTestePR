import request from 'supertest';
import { createApp } from '../app.js';

describe('GET /health', () => {
  it('responde 200 com Content-Type JSON e corpo { status: "ok" } (UT-001)', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('responde 404 para uma rota não registrada (UT-002)', async () => {
    const app = createApp();

    const response = await request(app).get('/rota-inexistente');

    expect(response.status).toBe(404);
  });

  it('responde de forma idêntica em chamadas sequenciais, sem estado entre elas (UT-003)', async () => {
    const app = createApp();

    const first = await request(app).get('/health');
    const second = await request(app).get('/health');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body).toEqual({ status: 'ok' });
    expect(second.body).toEqual({ status: 'ok' });
  });

  it('responde 200 sem exigir header Authorization (UT-004)', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
  });
});
