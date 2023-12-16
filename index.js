const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const port = process.env.PORT || 3000;

const app = express();

const telegramToken = process.env.TELEGRAM_TOKEN || 'TU_TOKEN_AQUI';
const bot = new TelegramBot(telegramToken, { polling: false });

const renderAppURL = 'https://tubotenrender.onrender.com';
const webhookPath = `/bot${telegramToken}`;

bot.setWebHook(`${renderAppURL}${webhookPath}`);

// Variable para almacenar los datos recogidos
const userData = {};

// Manejar el comando /start con un teclado en línea
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Enviar indicaciones', callback_data: 'new_instruction' }],
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
      // Inicia el proceso de recogida de datos
      userData[chatId] = {};
      bot.sendMessage(chatId, 'Por favor, envía el nombre de la indicación:');
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

  // Verificar si hay un proceso de recogida de datos en curso para este usuario
  if (userData[chatId]) {
    const userDataChat = userData[chatId];

    // Manejar cada paso de la recogida de datos
    if (!userDataChat.nombre) {
      userDataChat.nombre = text;
      bot.sendMessage(chatId, 'Ahora, por favor, envía la localización:');
    } else if (!userDataChat.localizacion) {
      // Puedes manejar la localización de manera especial si es necesario
      // userDataChat.localizacion = ...
      bot.sendMessage(chatId, 'Ahora, por favor, envía la descripción (opcional):');
    } else if (!userDataChat.descripcion) {
      userDataChat.descripcion = text;
      bot.sendMessage(chatId, 'Por último, envía un video o audio:');
    } else if (!userDataChat.media) {
      // Puedes manejar el video o audio de manera especial si es necesario
      // userDataChat.media = ...
      bot.sendMessage(chatId, 'Resumen de la indicación:\n\n' +
        `Nombre: ${userDataChat.nombre}\n` +
        `Localización: ${userDataChat.localizacion}\n` +
        `Descripción: ${userDataChat.descripcion || 'No proporcionada'}\n` +
        `Video o Audio: ${userDataChat.media ? 'Adjunto' : 'No proporcionado'}\n\n` +
        '¿Todo está correcto?',
        { reply_markup: { inline_keyboard: [[{ text: 'Sí', callback_data: 'confirm' }]] } }
      );
    }
  }
});

// Manejar la confirmación del resumen
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === 'confirm' && userData[chatId]) {
    bot.sendMessage(chatId, '¡Gracias por enviar las indicaciones! Proceso completado.');
    // Puedes hacer lo que quieras con los datos recopilados aquí
    delete userData[chatId]; // Limpiar los datos después de completar el proceso
  }
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
