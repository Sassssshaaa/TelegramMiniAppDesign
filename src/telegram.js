export interface CartItem {
  product: {
    name: string;
    price: number;
  };
  qty: number;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
  payment: string;
}

export const sendTelegramOrder = async (
  cart: CartItem[],
  total: number,
  details: OrderDetails
): Promise<void> => {
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

  // Укажите логин менеджера или аккаунт без знака @
  const managerUsername = "ВАШ_TELEGRAM_USERNAME";

  const tgUrl = `https://t.me/${managerUsername}?text=${encodeURIComponent(text)}`;

  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(tgUrl);
  } else {
    window.open(tgUrl, "_blank");
  }
};
