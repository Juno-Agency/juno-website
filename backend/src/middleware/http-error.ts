/** Error type that carries an HTTP status code. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (msg: string, details?: unknown) =>
  new HttpError(400, msg, details);
export const unauthorized = (msg = 'Non autorisé') => new HttpError(401, msg);
export const notFound = (msg = 'Introuvable') => new HttpError(404, msg);
