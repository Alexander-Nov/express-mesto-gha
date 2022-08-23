const Card = require('../models/card');
const errorCodes = require('../errors/errorCodes');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные при создании карточки' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.id)
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = 404;
      throw error;
    })
    .then((card) => {
      const cardOwner = card.owner.toString().replace('new ObjectId("', '');
      if (cardOwner !== req.user._id) {
        const error = new Error('Можно удалять только свои карточки');
        error.statusCode = errorCodes.ForbiddenError;
        throw error;
      } else {
        Card.findByIdAndRemove(req.params.id)
          // eslint-disable-next-line no-shadow
          .then((card) => res.send({ data: card }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные для удаления карточки' });
      } else if (err.statusCode === 404) {
        res.status(errorCodes.NotFoundError).send({ message: 'Карточка с указанным id не найдена' });
      } else if (err.statusCode === 403) {
        res.status(errorCodes.ForbiddenError).send({ message: 'Можно удалять только свои карточки' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = 404;
      throw error;
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else if (err.statusCode === 404) {
        res.status(errorCodes.NotFoundError).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = 404;
      throw error;
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные для удаления лайка' });
      } else if (err.statusCode === 404) {
        res.status(errorCodes.NotFoundError).send({ message: 'Передан несуществующий id карточки' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
