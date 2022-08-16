const Card = require('../models/card');
const errorCodes = require('../errors/errorCodes');
const NotFoundError = require('../errors/NotFoundError');

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
  Card.findByIdAndRemove(req.params.id)
    .orFail(() => {
      const error = new Error('Карточка по заданному id отсутствует в базе');
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof NotFoundError) {
        res.status(errorCodes.NotFoundError).send({ message: 'Карточка с указанным id не найдена' });
      } else if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные для удаления карточки' });
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
      if (err instanceof NotFoundError) {
        res.status(errorCodes.NotFoundError).send({ message: 'Передан несуществующий id карточки' });
      } else if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные для постановки лайка' });
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
      if (err instanceof NotFoundError) {
        res.status(errorCodes.NotFoundError).send({ message: 'Передан несуществующий id карточки' });
      } else if (err.name === 'CastError') {
        res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные для удаления лайка' });
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
