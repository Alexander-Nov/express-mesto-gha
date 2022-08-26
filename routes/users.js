const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const { ObjectId } = require('mongoose').Types;

const {
  getUsers, getUserById, updateUserProfile, updateUserAvatar, getUserProfile,
} = require('../controllers/users');

// eslint-disable-next-line prefer-regex-literals
const urlRegExp = new RegExp('^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=.]+$');

router.get('/', getUsers);

router.get('/me', getUserProfile);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }).unknown(true),
}), updateUserProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string()
      .pattern(urlRegExp)
      .message('Поле "avatar" должно быть валидным url-адресом'),
  }),
}), updateUserAvatar);

module.exports = router;
