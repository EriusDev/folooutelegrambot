const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const port = process.env.PORT || 3000;

const app = express();

app.get('/', (req, res) => {
  res.send('Tu bot de Telegram está en funcionamiento en Heroku.');
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});

const telegramToken = process.env.TELEGRAM_TOKEN || 'AAH8LDhATAkzNVzYKkqEigS_pKXMpX6u2LE';

const bot = new TelegramBot(telegramToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '¡Hola! Bienvenido a tu bot paso a paso. Envia /paso1 para comenzar.');
});

bot.onText(/\/paso1/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Paso 1: Por favor, envía tu nombre.');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  switch (msg.text) {
    case 'Paso 1: Tu Nombre':
      // Puedes almacenar la información en una base de datos o en memoria.
      // En este ejemplo, simplemente lo mostraremos.
      bot.sendMessage(chatId, `Tu nombre es: ${msg.text}`);
      // Puedes agregar más pasos y lógica según tus necesidades.
      break;
    default:
      bot.sendMessage(chatId, 'Por favor, sigue las instrucciones.');
  }
});
