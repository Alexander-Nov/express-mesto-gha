const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
// const { createUser, login } = require('./controllers/users');
// const auth = require('./middlewares/auth');
// const NotFoundError = require('./errors/NotFoundError');
const errorHandling = require('./middlewares/errorHandling');
const routes = require('./routes/index');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

// app.post('/signin', celebrate({
//   body: Joi.object().keys({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//   }),
// }), login);

// app.post('/signup', celebrate({
//   body: Joi.object().keys({
//     name: Joi.string().min(2).max(30),
//     about: Joi.string().min(2).max(30),
//     avatar: Joi.string()
//       .pattern(urlRegExp)
//       .message('Поле "avatar" должно быть валидным url-адресом'),
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//   }),
// }), createUser);

// авторизация
// app.use(auth);

// app.use('/users', require('./routes/users'));
// app.use('/cards', require('./routes/cards'));

// app.use('*', () => {
//   throw new NotFoundError('Данные по указанному запросу не существуют');
// });

app.use(routes);

app.use(errors()); // обработчик ошибок celebrate

// централизованный обработчик ошибок
app.use(errorHandling);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
