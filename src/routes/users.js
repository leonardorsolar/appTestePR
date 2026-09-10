const users = [
  { id: 1, nome: 'Ana Silva', email: 'ana.silva@example.com' },
  { id: 2, nome: 'Bruno Costa', email: 'bruno.costa@example.com' },
  { id: 3, nome: 'Carla Souza', email: 'carla.souza@example.com' },
];

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Lista todos os usuários cadastrados
 *     responses:
 *       200:
 *         description: Lista completa de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: Ana Silva
 *                   email:
 *                     type: string
 *                     example: ana.silva@example.com
 *             example:
 *               - id: 1
 *                 nome: Ana Silva
 *                 email: ana.silva@example.com
 *               - id: 2
 *                 nome: Bruno Costa
 *                 email: bruno.costa@example.com
 *               - id: 3
 *                 nome: Carla Souza
 *                 email: carla.souza@example.com
 */
export function usersHandler(req, res) {
  res.status(200).json(users);
}
