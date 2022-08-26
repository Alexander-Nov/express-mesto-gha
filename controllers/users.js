const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const errorCodes = require('../errors/errorCodes');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const DuplicateError = require('../errors/DuplicateError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    })
    .then((user) => {
      res.send({ user });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send(user))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err.statusCode === errorCodes.ValidationError || err._message === 'user validation failed') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      } else if (err.code === errorCodes.DuplicateErrorCode) {
        throw new DuplicateError('Пользователь с указанным email уже существует');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } else if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Введены некорректные данные при обновлении пользователя');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } else if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Введены некорректные данные аватара пользователя');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      if (err.statusCode === errorCodes.UnauthorizedError) {
        throw new UnauthorizedError('Авторизация не пройдена');
      } else {
        next(err);
      }
    })
    .catch(next);
};

const getUserProfile = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.statusCode === ValidationError || err.name === 'CastError') {
        throw new ValidationError('Введены некорректные данные аватара пользователя');
      } else if (err.statusCode === errorCodes.NotFoundError) {
        throw new NotFoundError('Пользователь по указанному id не найден');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
  login,
  getUserProfile,
};
