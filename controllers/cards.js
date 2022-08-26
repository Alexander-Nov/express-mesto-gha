const Card = require('../models/card');
const errorCodes = require('../errors/errorCodes');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err.statusCode === errorCodes.ValidationError || err._message === 'card validation failed') {
        throw new ValidationError('Введены некорректные данные при создании карточки');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('Карточка с указанным _id не найдена');
    })
    .then((card) => {
      const cardOwner = card.owner.toString().replace('new ObjectId("', '');
      if (cardOwner !== req.user._id) {
        throw new ForbiddenError('Можно удалять только свои карточки');
      } else {
        Card.findByIdAndRemove(req.params.id)
          .then((removedCard) => res.send(removedCard));
      }
    })
    .catch((err) => {
      console.log(err);
      if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Переданы некорректные данные для удаления карточки');
      } else if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      console.log(err);
      if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Переданы некорректные данные для постановки лайка');
      } else if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Переданы некорректные данные для удаления лайка');
      } else if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Карточка с указанным id не найдена');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
