const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const port = process.env.PORT || 3000;

const app = express();

const telegramToken = process.env.TELEGRAM_TOKEN || '6901826067:AAH8LDhATAkzNVzYKkqEigS_pKXMpX6u2LE';
const bot = new TelegramBot(telegramToken, { polling: false });

// Obtén la URL única de Render y configura el Webhook
const renderAppURL = 'https://folooutelegrambot.onrender.com'; // Reemplaza con tu URL de Render
const webhookPath = `/bot${telegramToken}`;

// Configura el Webhook
bot.setWebHook(`${renderAppURL}${webhookPath}`);

// Manejar el comando /start con un teclado en línea
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Enviar nombre de la indicación', callback_data: 'name_instruction' }],
      [{ text: 'Enviar localización', callback_data: 'location' }],
      [{ text: 'Enviar descripción', callback_data: 'description' }],
      [{ text: 'Enviar video o audio', callback_data: 'video_or_audio' }],
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
    case 'name_instruction':
      bot.sendMessage(chatId, 'Por favor, indica el nombre de la indicación:');
      break;
    case 'location':
      bot.sendMessage(chatId, 'Por favor, envía la localización:');
      break;
    case 'description':
      bot.sendMessage(chatId, 'Por favor, envía la descripción:');
      break;
    case 'video_or_audio':
      bot.sendMessage(chatId, 'Por favor, envía un video o audio:');
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
      bot.sendMessage(chatId, `¡Hola, ${text}! Ahora, por favor, envía la localización.`);
      break;
    case 'Por favor, envía la localización:':
      bot.sendMessage(chatId, 'Has enviado la localización. ¿Tienes alguna descripción que agregar?');
      break;
    case 'Por favor, envía la descripción:':
      bot.sendMessage(chatId, 'Ahora, puedes enviar un video o audio (opcional):');
      break;
    // Agrega más casos según sea necesario...
    default:
      bot.sendMessage(chatId, 'Por favor, sigue las instrucciones.');
  }
});

// Manejar la recepción de documentos (video o audio)
bot.on('document', (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.document.file_id;

  // Puedes procesar el fileId según tus necesidades (almacenar, analizar, etc.)
  // Puedes enviar un mensaje de confirmación o realizar más acciones...
  bot.sendMessage(chatId, 'Has enviado un video o audio. ¡Gracias!');
});

app.get('/', (req, res) => {
  res.send('Tu bot de Telegram está en funcionamiento en Render.');
});

app.post(webhookPath, express.json(), (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
