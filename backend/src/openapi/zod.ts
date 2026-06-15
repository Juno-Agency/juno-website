import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Adds `.openapi()` to every Zod schema. Must run before schemas are defined.
extendZodWithOpenApi(z);

export { z };
