const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errorCodes = require('./errors/errorCodes');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

// middleware - добавляем пользователя в каждый запрос
app.use((req, res, next) => {
  req.user = {
    _id: '62f9602dffb1f9d65be1515f',
  };
  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res) => {
  res.status(errorCodes.NotFoundError).send({ message: 'По указанному запросу данные не найдены' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
