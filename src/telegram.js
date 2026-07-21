export const sendTelegramOrder = async (cart, total, customerData) => {
  const tg = window.Telegram?.WebApp;
  tg?.expand();

  const user = tg?.initDataUnsafe?.user || {};
  const username = user.username ? `@${user.username}` : 'без username';

  // 1. Токен бота и ID чата
  const BOT_TOKEN = "8800322131:AAGyDmhejJga0F65FobakauJdTcRE_8KPnw";
  const ADMIN_CHAT_ID = "8461436945";

  // 2. Формируем список купленных товаров
  const itemsList = cart
    .map(
      (item) =>
        `• <b>${item.product.name}</b> (${item.product.volume}) × ${item.qty} шт. = ${
          item.product.price * item.qty
        } Kč`
    )
    .join("\n");

  // 3. Собираем текст сообщения
  const message = `
🚨 <b>НОВЫЙ ЗАКАЗ!</b>

👤 <b>Покупатель:</b> ${customerData.name || user.first_name || 'Не указан'} (${username})
🚚 <b>Доставка:</b> ${customerData.address || 'Не указан'}
💳 <b>Оплата:</b> ${customerData.payment || 'Не указано'}

📦 <b>Товары:</b>
${itemsList}

💰 <b>Итого к оплате:</b> ${total} Kč
  `;

  // 4. Отправляем через Bot API
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

    if (res.ok) {
      tg?.showAlert("Заказ успешно отправлен продавцу!");
    } else {
      alert("Ошибка отправки заказа. Попробуйте еще раз.");
    }
  } catch (error) {
    console.error("Ошибка при отправке заказа:", error);
    alert("Не удалось отправить заказ. Проверьте интернет-соединение.");
  }
};
