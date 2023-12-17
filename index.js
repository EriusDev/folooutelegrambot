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
      [{ text: 'Enviar indicaciones', callback_data: 'send_instructions' }],
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
    case 'send_instructions':
      // Comenzar el proceso de envío de indicaciones
      bot.sendMessage(chatId, 'Por favor, indica el nombre de la indicación:');
      break;
    case 'exit':
      bot.sendMessage(chatId, 'Has seleccionado salir. ¡Hasta luego!');
      break;
    default:
      // Lógica para manejar otros botones si es necesario
  }
});

// Manejar las respuestas a las preguntas
let paso = 1;
let nombreGuardado = '';
let localizacionGuardada = '';
let descripcionGuardada = '';

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Lógica para manejar las respuestas a las preguntas
  // Puedes agregar más casos según sea necesario

  switch (paso) {
    case 1:
      nombreGuardado = text.trim();
      bot.sendMessage(chatId, 'Por favor, indica la localización:');
      paso++;
      break;
    case 2:
      localizacionGuardada = text.trim();
      bot.sendMessage(chatId, 'Por favor, indica la descripción (opcional):');
      paso++;
      break;
    case 3:
      descripcionGuardada = text.trim();
      // Muestra un resumen
      const summary = `Resumen de la indicación:
Nombre: ${nombreGuardado}
Localización: ${localizacionGuardada}
Descripción: ${descripcionGuardada || 'No proporcionada'}`;

      bot.sendMessage(chatId, summary, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Todo OK', callback_data: 'ok' }],
            [{ text: 'Volver a empezar', callback_data: 'start_over' }]
          ]
        }
      });
      paso = 1; // Reiniciar el paso después de mostrar el resumen
      break;
  }
});

// Manejar la respuesta al resumen
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case 'ok':
      bot.sendMessage(chatId, '¡Gracias por enviar las indicaciones!');
      break;
    case 'start_over':
      // Reiniciar el proceso
      nombreGuardado = '';
      localizacionGuardada = '';
      descripcionGuardada = '';
      bot.sendMessage(chatId, 'Volvamos a empezar. Selecciona una opción:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Enviar indicaciones', callback_data: 'send_instructions' }],
            [{ text: 'Salir', callback_data: 'exit' }]
          ]
        }
      });
      break;
    default:
      // Lógica para manejar otros botones si es necesario
  }
});

app.post(webhookPath, express.json(), (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
