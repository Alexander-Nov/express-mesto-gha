class DuplicateError extends Error {
  constructor(message) {
    super(message);
    // this.name = 'NotFoundError';
    this.statusCode = 409;
  }
}

module.exports = DuplicateError;
