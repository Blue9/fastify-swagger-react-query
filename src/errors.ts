export class HTTPException extends Error {
  statusCode: number;
  message: string;

  /**
   * Create a new HTTPException.
   * @param statusCode The status code to return (e.g., 400, 403, etc.)
   * @param message A human-readable message to return to the client.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HTTPException";
    this.statusCode = statusCode;
    this.message = message;
  }
}
