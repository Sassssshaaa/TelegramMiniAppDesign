import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronLeft, 
  Package, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Wallet, 
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info
} from 'lucide-react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Om Nom Pods 10000',
    price: 429,
    description: '10000 затяжек, насыщенный вкус и отличная передача вкуса.',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=400',
    category: 'Pods'
  },
  {
    id: '2',
    name: 'Om Nom Liquid 30ml',
    price: 250,
    description: 'Солевой жидкость premium качества. 50mg.',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=400',
    category: 'Liquids'
  }
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [page, setPage] = useState<'catalog' | 'cart' | 'checkout' | 'success'>('catalog');
  
  // Delivery & Payment State
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [telegramContact, setTelegramContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card_ua'>('crypto');

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.username) {
        setTelegramContact(`@${tg.initDataUnsafe.user.username}`);
      }
    }
  }, [tg]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 79 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleSendOrder = () => {
    const orderDetails = {
      items: cart,
      total: grandTotal,
      deliveryMethod,
      deliveryFee,
      fullName,
      phone,
      address,
      telegramContact: telegramContact || '@Manager_cloud_Om',
      paymentMethod
    };

    if (tg && tg.sendData) {
      tg.sendData(JSON.stringify(orderDetails));
    } else {
      console.log('Order sent:', orderDetails);
    }

    setPage('success');
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex flex-col justify-between font-sans antialiased selection:bg-green-500 selection:text-black">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f10]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        {page !== 'catalog' ? (
          <button 
            onClick={() => setPage('catalog')}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-bold tracking-wide text-sm">Om Nom Cloud</span>
          </div>
        )}

        <h1 className="text-base font-semibold">
          {page === 'catalog' && 'Каталог'}
          {page === 'cart' && 'Корзина'}
          {page === 'checkout' && 'Оформление'}
          {page === 'success' && 'Заказ отправлен'}
        </h1>

        {page === 'catalog' ? (
          <button 
            onClick={() => cart.length > 0 && setPage('cart')}
            className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-gray-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0f0f10]">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Catalog Page */}
        {page === 'catalog' && (
          <div className="p-4 space-y-4 pb-24">
            <div className="grid grid-cols-1 gap-4">
              {PRODUCTS.map(product => (
                <div key={product.id} className="bg-[#18181b] border border-white/5 rounded-2xl p-4 flex gap-4 items-center shadow-lg">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-24 h-24 rounded-xl object-cover bg-black/40"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-white truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-green-400 font-bold text-sm">{product.price} Kč</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-green-500 hover:bg-green-400 text-black font-semibold text-xs px-3 py-2 rounded-lg active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Page */}
        {page === 'cart' && (
          <div className="p-4 space-y-4 pb-32">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-600" />
                <p>Ваша корзина пуста</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="bg-[#18181b] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-white">{item.name}</h4>
                        <p className="text-xs text-green-400 font-semibold mt-0.5">{item.price} Kč</p>
                      </div>
                      <div className="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Сумма заказа</span>
                    <span className="text-white font-medium">{cartTotal} Kč</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Checkout Page */}
        {page === 'checkout' && (
          <div className="p-4 space-y-6 pb-36">
            
            {/* Способ получения */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Способ получения
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'border-green-500 bg-green-500/10 text-white'
                      : 'border-white/10 bg-[#18181b] text-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package className={`w-5 h-5 ${deliveryMethod === 'delivery' ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="font-semibold text-xs text-white">Доставка / Почта</span>
                  </div>
                  <span className="text-[10px] text-green-400 font-medium mt-2">+ 79 Kč</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-green-500 bg-green-500/10 text-white'
                      : 'border-white/10 bg-[#18181b] text-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building2 className={`w-5 h-5 ${deliveryMethod === 'pickup' ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="font-semibold text-xs text-white">Самовывоз</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2">в округах Ostrava</span>
                </button>
              </div>
            </div>

            {/* Данные для доставки */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Данные для доставки / почты
              </label>
              
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ФИО получателя (для почты)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#18181b] text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3.5 outline-none border border-white/5 focus:border-green-500 transition-all text-sm"
                  />
                </div>

                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Номер телефона (+420...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#18181b] text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3.5 outline-none border border-white/5 focus:border-green-500 transition-all text-sm"
                  />
                </div>

                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Улица, дом, квартира / № отделения почты"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#18181b] text-white placeholder-gray-500 rounded-xl pl-11 pr-4 py-3.5 outline-none border border-white/5 focus:border-green-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Telegram для связи */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Telegram для связи
              </label>
              <input
                type="text"
                value={telegramContact || '@Manager_cloud_Om'}
                onChange={(e) => setTelegramContact(e.target.value)}
                className="w-full bg-[#18181b] text-white placeholder-gray-500 rounded-xl px-4 py-3.5 outline-none border border-white/5 focus:border-green-500 transition-all text-sm font-medium"
              />
            </div>

            {/* Способ оплаты */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Способ оплаты
              </label>
              
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'crypto'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-[#18181b]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className={`w-5 h-5 ${paymentMethod === 'crypto' ? 'text-green-400' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold text-sm text-white">Криптовалюта</div>
                      <div className="text-xs text-gray-400">USDT</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card_ua')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'card_ua'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-[#18181b]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Wallet className={`w-5 h-5 ${paymentMethod === 'card_ua' ? 'text-green-400' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold text-sm text-white">Оплата на укр карту</div>
                      <div className="text-xs text-gray-400">ПриватБанк / Monobank</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Success Page */}
        {page === 'success' && (
          <div className="p-6 text-center space-y-4 my-auto py-16">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Заказ успешно сформирован!</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Менеджер свяжется с вами в Telegram для подтверждения и уточнения деталей.
            </p>
            <button
              onClick={() => {
                setCart([]);
                setPage('catalog');
              }}
              className="mt-6 w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all text-sm"
            >
              Вернуться в каталог
            </button>
          </div>
        )}

      </main>

      {/* Fixed Bottom Action Bar */}
      {page === 'cart' && cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f10]/95 backdrop-blur-md border-t border-white/5 p-4 z-50">
          <button
            onClick={() => setPage('checkout')}
            className="w-full bg-green-500 hover:bg-green-400 active:scale-[0.99] text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/10 flex items-center justify-center space-x-2 text-base"
          >
            <span>Оформить заказ ({grandTotal} Kč)</span>
          </button>
        </div>
      )}

      {page === 'checkout' && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f10]/95 backdrop-blur-md border-t border-white/5 p-4 z-50">
          <button
            onClick={handleSendOrder}
            className="w-full bg-green-500 hover:bg-green-400 active:scale-[0.99] text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-green-500/10 flex items-center justify-center space-x-2 text-base"
          >
            <Send className="w-5 h-5 text-black" />
            <span>Отправить заказ ({grandTotal} Kč)</span>
          </button>
        </div>
      )}

    </div>
  );
}
