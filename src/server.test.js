import net from 'node:net';
import request from 'supertest';
import { startServer } from './server.js';

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.listen(0, () => {
      const { port } = probe.address();
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
    probe.on('error', reject);
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

describe('startServer', () => {
  const originalPort = process.env.PORT;
  let openServers = [];

  afterEach(async () => {
    await Promise.all(openServers.map((server) => closeServer(server)));
    openServers = [];

    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  it('sobe um servidor real em uma porta efêmera e responde GET /health (IT-001)', async () => {
    process.env.PORT = '0';

    const server = await startServer();
    openServers.push(server);

    const response = await request(server).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('escuta na porta padrão 3000 quando PORT não está definido, e na porta customizada quando PORT é definido (IT-002)', async () => {
    delete process.env.PORT;

    const defaultServer = await startServer();
    openServers.push(defaultServer);

    expect(defaultServer.address().port).toBe(3000);

    await closeServer(defaultServer);
    openServers = [];

    process.env.PORT = '4321';

    const customServer = await startServer();
    openServers.push(customServer);

    expect(customServer.address().port).toBe(4321);
  });

  it('nunca confirma no ar antes de app.listen() completar (IT-003 / US-001.EC-1)', async () => {
    const port = await getFreePort();

    await expect(
      new Promise((resolve, reject) => {
        const socket = net.connect(port, '127.0.0.1');
        socket.once('connect', () => {
          socket.destroy();
          reject(new Error('conexão inesperadamente aceita antes de app.listen()'));
        });
        socket.once('error', (error) => {
          resolve(error);
        });
      })
    ).resolves.toMatchObject({ code: 'ECONNREFUSED' });

    const server = await startServer(port);
    openServers.push(server);

    const response = await request(server).get('/health');

    expect(response.status).toBe(200);
  });

  it('responde corretamente a 10 requisições GET /health simultâneas (IT-004 / US-001.EC-2)', async () => {
    process.env.PORT = '0';

    const server = await startServer();
    openServers.push(server);

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => request(server).get('/health'))
    );

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
