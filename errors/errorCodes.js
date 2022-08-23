const DefaultError = 500;
const ValidationError = 400;
const UnAuthorizedError = 401;
const ForbiddenError = 403;
const NotFoundError = 404;

module.exports = {
  DefaultError, ValidationError, Unauthorized: UnAuthorizedError, ForbiddenError, NotFoundError,
};
