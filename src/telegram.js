export const sendTelegramOrder = async (cart, total, customerData) => {
  const tg = window.Telegram?.WebApp;
  tg?.expand();

  const user = tg?.initDataUnsafe?.user || {};
  const username = user.username ? `@${user.username}` : 'без username';

  // ⚠️ ЗАМЕНИ НА СВОИ ДАННЫЕ В КАВЫЧКАХ:
  const BOT_TOKEN = "8800322131:AAGyDmhejJga0F65FobakauJdTcRE_8KPnw";      // Токен от @BotFather
  const ADMIN_CHAT_ID = "8461436945";     // Ваш ID от @getmyid_bot

  const message = `
🚨 <b>НОВЫЙ ЗАКАЗ!</b>

👤 <b>Покупатель:</b> ${customerData.name || user.first_name} (${username})
📞 <b>Телефон:</b> ${customerData.phone}
📍 <b>Адрес:</b> ${customerData.address}

💰 <b>Сумма:</b> ${total} Kč
  `;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  }).then(res => {
    if (res.ok) {
      tg?.showAlert("Заказ отправлен продавцу!");
    } else {
      alert(" Ошибка отправки заказа");
    }
  });
};
