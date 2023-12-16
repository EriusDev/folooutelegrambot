const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const port = process.env.PORT || 3000;

const app = express();

const telegramToken = process.env.TELEGRAM_TOKEN || 'AAH8LDhATAkzNVzYKkqEigS_pKXMpX6u2LE';
const bot = new TelegramBot(telegramToken, { polling: false });

// Obtén la URL única de Render y configura el Webhook
const renderAppURL = 'https://foloou-bot-telegram-l092mgghf-eriusdev.render.com'; // Reemplaza con tu URL de Render
const webhookPath = `/bot${telegramToken}`;
bot.setWebHook(`${renderAppURL}${webhookPath}`);
app.use(bot.webhookCallback(webhookPath));

// Manejar el comando /start con un teclado en línea
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Enviar nueva indicación', callback_data: 'new_instruction' }],
      [{ text: 'Salir', callback_data: 'exit' }]
    ]
  };

  bot.sendMessage(chatId, 'Selecciona una opción:', {
    reply_markup: JSON.stringify(keyboard)
  });
});

// Manejar los botones en línea
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case 'new_instruction':
      bot.sendMessage(chatId, 'Por favor, envía tu nombre:');
      // Puedes seguir con más preguntas...
      break;
    case 'exit':
      bot.sendMessage(chatId, 'Has seleccionado salir. ¡Hasta luego!');
      break;
    default:
      // Lógica para manejar otros botones si es necesario
  }
});

// Manejar las respuestas a las preguntas
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Puedes agregar lógica aquí para manejar las respuestas a tus preguntas
  switch (text) {
    case 'Tu nombre es:':
      // Lógica para manejar el nombre
      bot.sendMessage(chatId, `¡Hola, ${text}! Ahora, por favor, envía tu correo electrónico.`);
      break;
    // Agrega más casos según sea necesario...
    default:
      bot.sendMessage(chatId, 'Por favor, sigue las instrucciones.');
  }
});

app.get('/', (req, res) => {
  res.send('Tu bot de Telegram está en funcionamiento en Render.');
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
