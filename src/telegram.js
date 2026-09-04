export async function sendTelegramOrder(cart, total, customerData) {
  const tg = window.Telegram?.WebApp;
  tg?.expand();

  const user = tg?.initDataUnsafe?.user || {};
  const username = user.username ? `@${user.username}` : 'без username';

  // Токен бота и Chat ID
  const BOT_TOKEN = "880032312312jJga012465FobakauJdTcRE_8KPnЫ";
  const ADMIN_CHAT_ID = "8461412445";

  // Собираем товары
  const itemsList = cart
    .map(
      (item) =>
        `• <b>${item.product.name}</b> (${item.product.volume || ''}) × ${item.qty} шт. = ${
          item.product.price * item.qty
        } Kč`
    )
    .join("\n");

  const message = `
🚨 <b>НОВЫЙ ЗАКАЗ!</b>

👤 <b>Телеграм профиль:</b> ${customerData.name || user.first_name || 'Не указан'} (${username})
📞 <b>Телефон:</b> ${customerData.phone || 'Не указан'}
📍 <b>Детали доставки:</b>
${customerData.address || 'Не указан'}

💳 <b>Способ оплаты:</b> ${customerData.payment || 'Не указан'}

📦 <b>Состав заказа:</b>
${itemsList}

💰 <b>Итого к оплате:</b> ${total} Kč
  `;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    return res.ok;
  } catch (error) {
    console.error("Ошибка при отправке заказа:", error);
    return false;
  }
}
