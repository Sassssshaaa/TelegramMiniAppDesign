// src/telegram.js

export const sendTelegramOrder = async (cart, total, details) => {
  const itemsText = cart
    .map((item) => `• ${item.product.name} x${item.qty} (${item.product.price * item.qty} Kč)`)
    .join("\n");

  const text =
    `🛒 *Новый заказ!*\n\n` +
    `👤 *Клиент:* ${details.name}\n` +
    `📞 *Телефон:* ${details.phone}\n` +
    `📍 *Адрес:* ${details.address}\n` +
    `💳 *Оплата:* ${details.payment}\n\n` +
    `📦 *Состав заказа:*\n${itemsText}\n\n` +
    `💰 *Итого:* ${total} Kč`;

  // Передаем ТОЛЬКО юзернейм без https://t.me/ и без @
  const managerUsername = "Manager_cloud_Om";

  const tgUrl = `https://t.me/${managerUsername}?text=${encodeURIComponent(text)}`;

  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(tgUrl);
  } else {
    window.open(tgUrl, "_blank");
  }
};
