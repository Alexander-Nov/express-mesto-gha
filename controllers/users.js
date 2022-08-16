const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const errorCodes = require('../errors/errorCodes');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' }));
};

const getUserById = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error('Пользователь по заданному id отсутствует в базе');
      error.statusCode = 404;
      throw error;
    })
    .then((user) => {
      res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(errorCodes.NotFoundError).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'ValidationError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные при создании пользователя' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные при создании пользователя' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const updateUserProfile = (req, res) => {
  const { name, about } = req.body;

  if (!name || !about) {
    res.status(errorCodes.ValidationError).send({ message: 'Переданы некорректные данные при обновлении пользователя, одно или несколько полей пустые' });
  }

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err instanceof NotFoundError) {
        res.status(errorCodes.NotFoundError).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'ValidationError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные при обновлении пользователя' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err instanceof NotFoundError) {
        res.status(errorCodes.NotFoundError).send({ message: 'Пользователь по указанному id не найден' });
      } else if (err.name === 'ValidationError') {
        res.status(errorCodes.ValidationError).send({ message: 'Введены некорректные данные аватара пользователя' });
      } else {
        res.status(errorCodes.DefaultError).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
};
