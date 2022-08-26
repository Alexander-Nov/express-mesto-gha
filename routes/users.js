const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const { ObjectId } = require('mongoose').Types;

const {
  getUsers, getUserById, updateUserProfile, updateUserAvatar, getUserProfile,
} = require('../controllers/users');

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

router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
