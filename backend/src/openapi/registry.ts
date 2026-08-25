import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Single registry collecting schemas + paths from across the app.
 * Imported by feature modules to register their contracts.
 */
export const registry = new OpenAPIRegistry();

// Bearer-token auth scheme used by back-office endpoints.
export const bearerAuth = registry.registerComponent(
  'securitySchemes',
  'bearerAuth',
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
);

// Clé d'API du backlog partagé : seconde voie d'authentification sur
// `/api/tickets`, pour les appels hors navigateur (scripts, curl, front local).
export const ticketsApiKey = registry.registerComponent(
  'securitySchemes',
  'ticketsApiKey',
  {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
  },
);
