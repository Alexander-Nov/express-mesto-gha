class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    // this.name = 'NotFoundError';
    this.statusCode = 400;
  }
}

module.exports = ForbiddenError;
