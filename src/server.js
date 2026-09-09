import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

export function startServer(port) {
  const resolvedPort = port ?? process.env.PORT ?? 3000;
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(resolvedPort);

    server.once('listening', () => {
      resolve(server);
    });

    server.once('error', (error) => {
      reject(error);
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer()
    .then((server) => {
      const { port } = server.address();
      console.log(`Servidor no ar na porta ${port}`);
    })
    .catch((error) => {
      console.error(`Falha ao iniciar o servidor: ${error.message}`);
      process.exit(1);
    });
}
