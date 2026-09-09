import { buildSwaggerSpec } from './swaggerSpec.js';
import packageJson from '../../package.json' with { type: 'json' };

describe('buildSwaggerSpec', () => {
  it('retorna openapi 3.0.3 (UT-001)', () => {
    const spec = buildSwaggerSpec();

    expect(spec.openapi).toBe('3.0.3');
  });

  it('retorna info.title e info.version a partir de package.json (UT-002)', () => {
    const spec = buildSwaggerSpec();

    expect(spec.info.title).toBe(packageJson.name);
    expect(spec.info.version).toBe(packageJson.version);
  });

  it('inclui o path /health com um método get (UT-003)', () => {
    const spec = buildSwaggerSpec();

    expect(spec.paths['/health']).toBeDefined();
    expect(spec.paths['/health'].get).toBeDefined();
  });

  it('não inclui paths inventados além dos endpoints de fato anotados (UT-004)', () => {
    const spec = buildSwaggerSpec();

    expect(spec.paths['/rota-inexistente']).toBeUndefined();
    expect(Object.keys(spec.paths)).toEqual(['/health']);
  });

  it('produz o mesmo conteúdo em chamadas repetidas (UT-005)', () => {
    const first = buildSwaggerSpec();
    const second = buildSwaggerSpec();

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('encontra /health mesmo com process.cwd() fora da raiz do projeto (UT-006)', () => {
    const originalCwd = process.cwd();

    try {
      process.chdir('/tmp');
      const spec = buildSwaggerSpec();

      expect(spec.paths['/health']).toBeDefined();
    } finally {
      process.chdir(originalCwd);
    }
  });
});
