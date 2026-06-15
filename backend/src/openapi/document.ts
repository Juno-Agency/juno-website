import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

/**
 * Builds the OpenAPI 3 document from everything registered in the registry.
 * Call after all route modules have been imported (paths register on import).
 */
export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'JUNO API',
      version: '1.0.0',
      description:
        'API JUNO — réception des demandes du formulaire d’intake et endpoints back-office.',
    },
    servers: [{ url: '/', description: 'Racine (proxifiée sous /api)' }],
    tags: [
      { name: 'Leads', description: 'Demandes issues du formulaire' },
      { name: 'Auth', description: 'Authentification back-office' },
      { name: 'Health', description: 'Supervision' },
    ],
  });
}
