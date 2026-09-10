import request from 'supertest';
import { createApp } from './app.js';

describe('GET /api-docs', () => {
  it('redireciona (301) para /api-docs/ (IT-001)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs');

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/api-docs/');
  });

  it('/api-docs/ responde 200 com Content-Type text/html (IT-001)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
  });
});

describe('GET /api-docs.json', () => {
  it('responde 200 com Content-Type JSON e paths["/health"] presente (IT-002)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.paths['/health']).toBeDefined();
  });

  it('lista exatamente os endpoints reais, nenhum endpoint falso (IT-010)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    expect(Object.keys(response.body.paths)).toEqual(['/users', '/health']);
  });

  it('documenta a resposta 200 de /health com o corpo { status: "ok" } (IT-004)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    const okResponse = response.body.paths['/health'].get.responses['200'];
    const example = okResponse.content['application/json'].example;
    expect(example).toEqual({ status: 'ok' });
  });

  it('documenta /health sem nenhum parâmetro (IT-005)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    const parameters = response.body.paths['/health'].get.parameters;
    expect(parameters === undefined || parameters.length === 0).toBe(true);
  });

  it('documenta apenas a resposta 200 para /health, sem erros inventados (IT-006)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    expect(Object.keys(response.body.paths['/health'].get.responses)).toEqual(['200']);
  });

  it('responde JSON independente do header Accept enviado (IT-007)', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api-docs.json')
      .set('Accept', 'text/html');

    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.paths['/health']).toBeDefined();
  });

  it('documenta /users com resposta 200 e exemplo de array de usuários (IT-009)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    const usersPath = response.body.paths['/users'];
    expect(usersPath).toBeDefined();
    const okResponse = usersPath.get.responses['200'];
    expect(okResponse).toBeDefined();
    const example = okResponse.content['application/json'].example;
    expect(example).toEqual([
      { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' },
      { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com' },
      { id: 3, nome: 'Carla Souza', email: 'carla.souza@example.com' },
    ]);
  });

  it('documenta apenas a resposta 200 para /users, sem erros inventados (IT-011)', async () => {
    const app = createApp();

    const response = await request(app).get('/api-docs.json');

    expect(Object.keys(response.body.paths['/users'].get.responses)).toEqual(['200']);
  });
});

describe('GET /health (regressão pós rotas de documentação)', () => {
  it('continua respondendo 200 com { status: "ok" } (IT-008)', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('continua respondendo 200 com { status: "ok" } após o registro de /users (IT-012)', async () => {
    const app = createApp();

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
