/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica se o servidor está no ar
 *     responses:
 *       200:
 *         description: Servidor no ar e respondendo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *             example:
 *               status: ok
 */
export function healthHandler(req, res) {
  res.status(200).json({ status: 'ok' });
}
