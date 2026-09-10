import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../app.js';
import { usersHandler } from './users.js';

describe('GET /users', () => {
  it('responde 200 com Content-Type JSON e o array exato de usuários de exemplo (UT-005)', async () => {
    const app = createApp();

    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual([
      { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' },
      { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com' },
      { id: 3, nome: 'Carla Souza', email: 'carla.souza@example.com' },
    ]);
  });

  it('usersHandler responde 200 com o array, sem branch condicional sobre o conteúdo (UT-006)', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    usersHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.any(Array));
  });

  it('responde de forma idêntica em chamadas sequenciais, na mesma ordem (UT-007)', async () => {
    const app = createApp();

    const first = await request(app).get('/users');
    const second = await request(app).get('/users');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body).toEqual(second.body);
  });

  it('responde 200 sem exigir header Authorization (UT-008)', async () => {
    const app = createApp();

    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
  });

  it('ignora query params não suportados e responde a lista completa (UT-009)', async () => {
    const app = createApp();

    const response = await request(app).get('/users').query({ filtro: 'x' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' },
      { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com' },
      { id: 3, nome: 'Carla Souza', email: 'carla.souza@example.com' },
    ]);
  });
});
