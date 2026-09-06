import { useState, useEffect } from "react";
import { sendTelegramOrder } from "./telegram";
import { supabase } from "./supabase";
import { 
  Home,
  Grid3X3,
  ShoppingCart,
  Search,
  Star,
  Plus,
  ChevronLeft,
  Heart,
  CheckCircle,
  MapPin,
  Wallet,
  X,
  Wind,
  Flame,
  Snowflake,
  Candy,
  Coffee,
  CreditCard,
  Zap,
  User,
  Phone,
  AlertCircle
} from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        openTelegramLink?: (url: string) => void;
        openLink?: (url: string) => void;
        expand?: () => void;
        ready?: () => void;
      };
    };
  }
}

function getTelegramUser() {
  try {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return {
      firstName: user?.first_name || null,
      username: user?.username || null,
      id: user?.id || null,
    };
  } catch {
    return { firstName: null, username: null, id: null };
  }
}

type Screen = "home" | "catalog" | "product" | "cart" | "checkout" | "success";

export interface Product {
  id: number;
  name: string;
  brand: string;
  volume: string;
  strength: string;
  vgpg: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  inStock: boolean;
  stock?: number;
  isNew?: boolean;
  isHot?: boolean;
  ishot?: boolean;
  is_hot?: boolean;
  color: string;
  accent: string;
  desc: string;
  img: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

const CATEGORIES = [
  { name: "Ягоды", icon: Heart, color: "#FF4D6D" },
  { name: "Лед", icon: Snowflake, color: "#4DA6FF" },
  { name: "Напитки", icon: Coffee, color: "#FF6B35" },
  { name: "Конфеты", icon: Candy, color: "#FF9ECD" },
  { name: "Табак", icon: Flame, color: "#C4A265" },
  { name: "Мята", icon: Wind, color: "#7CFF5B" },
];

const BRANDS = ["ElfliQ", "Chaser"];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          fill={i <= Math.round(rating) ? "#FFD700" : "transparent"}
          color={i <= Math.round(rating) ? "#FFD700" : "rgba(255,255,255,0.2)"}
        />
      ))}
    </div>
  );
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      style={{
        background: color + "22",
        color: color,
        border: `1px solid ${color}44`,
        borderRadius: 8,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  );
}

function ProductCard({
  product,
  onSelect,
  onAddCart,
}: {
  product: Product;
  onSelect: (p: Product) => void;
  onAddCart: (p: Product) => void;
}) {
  const [pressed, setPressed] = useState(false);
  const isAvailable = product.inStock && (product.stock === undefined || product.stock > 0);
  const isHot = product.isHot || product.ishot || product.is_hot;

  return (
    <div
      className="product-card"
      style={{ padding: 14, cursor: "pointer", position: "relative" }}
      onClick={() => onSelect(product)}
    >
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 4, zIndex: 2, flexWrap: "wrap" }}>
        {product.isNew && <Badge text="NEW" color="#7CFF5B" />}
        {isHot && <Badge text="🔥 ХИТ" color="#FF6B35" />}
      </div>

      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 10,
          height: 160,
          background: "#1A1D24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={product.img}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 14 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = "0.3";
          }}
        />
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{product.name}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{product.brand}</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {product.volume && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 6px" }}>
            {product.volume}
          </span>
        )}
        {product.strength && (
          <span style={{ fontSize: 10, color: product.color || "#7CFF5B", background: (product.color || "#7CFF5B") + "18", borderRadius: 6, padding: "2px 6px" }}>
            {product.strength}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
        <Stars rating={product.rating || 5} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{product.rating || 5}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#7CFF5B" }}>{product.price} Kč</div>
          {product.stock !== undefined && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Остаток: {product.stock} шт.</div>
          )}
        </div>
        <button
          className="btn-primary"
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            opacity: isAvailable ? 1 : 0.4,
            transform: pressed ? "scale(0.9)" : undefined,
          }}
          disabled={!isAvailable}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (isAvailable) onAddCart(product);
          }}
        >
          <Plus size={18} color="#0F1115" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function Toast({ msg, isError = false, onDone }: { msg: string; isError?: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="animate-toast"
      style={{
        position: "fixed",
        top: 20,
        right: 16,
        left: 16,
        zIndex: 999,
        background: "rgba(20,23,28,0.95)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${isError ? "#FF4D6D" : "rgba(124,255,91,0.3)"}`,
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {isError ? <AlertCircle size={18} color="#FF4D6D" /> : <CheckCircle size={18} color="#7CFF5B" />}
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{msg}</span>
    </div>
  );
}

function BottomNav({
  current,
  cartCount,
  onNav,
}: {
  current: Screen;
  cartCount: number;
  onNav: (s: Screen) => void;
}) {
  const tabs = [
    { id: "home" as Screen, icon: Home, label: "Главная" },
    { id: "catalog" as Screen, icon: Grid3X3, label: "Каталог" },
    { id: "cart" as Screen, icon: ShoppingCart, label: "Корзина" },
  ];
  return (
    <div
      className="glass-dark"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 390,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 8px 25px",
        zIndex: 100,
      }}
    >
      {tabs.map((t) => {
        const active = current === t.id || (t.id === "cart" && current === "checkout");
        return (
          <button
            key={t.id}
            className={`nav-tab ${active ? "active" : ""}`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 24px",
              position: "relative",
            }}
            onClick={() => onNav(t.id)}
          >
            <div style={{ position: "relative" }}>
              <t.icon size={22} color={active ? "#7CFF5B" : "rgba(255,255,255,0.35)"} />
              {t.id === "cart" && cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -6,
                    background: "#7CFF5B",
                    color: "#0F1115",
                    fontSize: 9,
                    fontWeight: 800,
                    borderRadius: 99,
                    minWidth: 16,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HomeScreen({
  products,
  loading,
  onSelectProduct,
  onAddCart,
  tgFirstName,
}: {
  products: Product[];
  loading: boolean;
  onSelectProduct: (p: Product) => void;
  onAddCart: (p: Product) => void;
  onNav: (s: Screen) => void;
  tgFirstName: string | null;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const greeting = tgFirstName ? `Привет, ${tgFirstName}!` : "Привет!";

  const availableProducts = products.filter((p) => {
    return p.inStock && (p.stock === undefined || p.stock > 0);
  });

  const displayed = availableProducts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    }

    if (activeBrand) {
      const matchesBrand = p.brand?.trim().toLowerCase() === activeBrand.trim().toLowerCase();
      if (activeCategory) {
        return matchesBrand && p.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase();
      }
      return matchesBrand;
    }

    if (activeCategory) {
      return p.category?.trim().toLowerCase() === activeCategory.trim().toLowerCase();
    }

    const isHotProduct = p.isHot || p.ishot || p.is_hot;
    const hasAnyHot = availableProducts.some((prod) => prod.isHot || prod.ishot || prod.is_hot);
    return hasAnyHot ? Boolean(isHotProduct) : true;
  });

  return (
    <div style={{ paddingBottom: 110 }}>
      <div
        style={{
          padding: "56px 20px 20px",
          background: "linear-gradient(180deg, rgba(124,255,91,0.07) 0%, transparent 100%)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
            Добро пожаловать 👋
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
            <span style={{ color: "#7CFF5B" }}>{greeting}</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
          }}
        >
          <Search size={18} color="rgba(255,255,255,0.35)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти жидкость..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 15,
              padding: "14px 0",
            }}
          />
          {search && (
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setSearch("")}>
              <X size={16} color="rgba(255,255,255,0.4)" />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Категории</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.name;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(active ? null : cat.name)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 14px",
                    borderRadius: 16,
                    border: active ? `1.5px solid ${cat.color}` : "1px solid rgba(255,255,255,0.08)",
                    background: active ? cat.color + "18" : "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={20} color={active ? cat.color : "rgba(255,255,255,0.5)"} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? cat.color : "rgba(255,255,255,0.5)" }}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Бренды</div>
          <div style={{ display: "flex", gap: 10 }}>
            {BRANDS.map((brandName) => {
              const active = activeBrand === brandName;
              return (
                <button
                  key={brandName}
                  onClick={() => setActiveBrand(active ? null : brandName)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: active ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.08)",
                    background: active ? "rgba(124,255,91,0.15)" : "rgba(255,255,255,0.05)",
                    color: active ? "#7CFF5B" : "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {brandName}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              {search ? `Результаты: «${search}»` : activeBrand ? `Бренд: ${activeBrand}` : activeCategory ? activeCategory : "🔥 Популярные вкусы"}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.5)" }}>Загрузка товаров...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {displayed.map((p) => (
                <ProductCard key={p.id} product={p} onSelect={onSelectProduct} onAddCart={onAddCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogScreen({
  products,
  loading,
  onSelectProduct,
  onAddCart,
}: {
  products: Product[];
  loading: boolean;
  onSelectProduct: (p: Product) => void;
  onAddCart: (p: Product) => void;
}) {
  const [search, setSearch] = useState("");

  const availableProducts = products.filter((p) => {
    return p.inStock && (p.stock === undefined || p.stock > 0);
  });

  const filtered = availableProducts.filter((p) => {
    if (
      search &&
      !p.name?.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div style={{ paddingBottom: 110 }}>
      <div style={{ padding: "56px 20px 16px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Каталог</div>
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
            }}
          >
            <Search size={16} color="rgba(255,255,255,0.35)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, padding: "12px 0" }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.5)" }}>Загрузка товаров...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} onAddCart={onAddCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductScreen({
  product,
  onBack,
  onAddCart,
}: {
  product: Product;
  onBack: () => void;
  onAddCart: (p: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const isAvailable = product.inStock && (product.stock === undefined || product.stock > 0);

  return (
    <div style={{ paddingBottom: 140 }}>
      <div
        style={{
          height: 320,
          position: "relative",
          background: "#1A1D24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={product.img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }} />
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 20, 
            left: 16,
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "rgba(15,17,21,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <ChevronLeft size={20} color="#fff" />
        </button>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{product.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 20 }}>{product.desc}</div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Количество</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer" }}>-</button>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(124,255,91,0.15)", border: "none", color: "#7CFF5B", cursor: "pointer" }}>+</button>
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "16px 20px 30px", background: "#0F1115", zIndex: 90, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button 
          className="btn-primary" 
          style={{ width: "100%", padding: "16px 0", fontSize: 16, opacity: isAvailable ? 1 : 0.4 }} 
          disabled={!isAvailable}
          onClick={() => {
            if (isAvailable) onAddCart(product, qty);
          }}
        >
          {isAvailable ? `Добавить ${product.price * qty} Kč` : "Нет в наличии"}
        </button>
      </div>
    </div>
  );
}

function CartScreen({
  cart,
  onUpdateQty,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Корзина пуста</div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 140, padding: "56px 20px 0" }}>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Корзина</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {cart.map((item) => (
          <div key={item.product.id} className="glass" style={{ borderRadius: 18, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
            <img src={item.product.img} alt={item.product.name} style={{ width: 60, height: 60, objectFit: "contain" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.product.name}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#7CFF5B" }}>{item.product.price * item.qty} Kč</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => (item.qty === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, item.qty - 1))} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer" }}>-</button>
              <span>{item.qty}</span>
              <button onClick={() => onUpdateQty(item.product.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,255,91,0.2)", border: "none", color: "#7CFF5B", cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "16px 20px 90px", background: "#0F1115", zIndex: 90 }}>
        <button className="btn-primary" style={{ width: "100%", padding: "17px 0", fontSize: 16 }} onClick={onCheckout}>
          Оформить ({total} Kč)
        </button>
      </div>
    </div>
  );
}

function CheckoutScreen({
  cart,
  tgUsername,
  onBack,
  onError,
  onConfirm,
}: {
  cart: CartItem[];
  tgUsername: string | null;
  onBack: () => void;
  onError: (msg: string) => void;
  onConfirm: () => void;
}) {
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState<"crypto" | "card" | "cash">("crypto");
  const [tg, setTg] = useState(tgUsername ? `@${tgUsername}` : "");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const deliveryFee = deliveryType === "delivery" ? 79 : 0;
  const total = itemsTotal + deliveryFee;

  const handleConfirm = async () => {
    if (deliveryType === "delivery" && (!fullName.trim() || !phone.trim() || !address.trim())) {
      onError("Заполните ФИО, телефон и адрес для доставки");
      return;
    }

    if (!tg.trim()) {
      onError("Укажите контактный Telegram");
      return;
    }

    setIsSubmitting(true);

    const deliveryStr = deliveryType === "delivery" 
      ? `Доставка (+79 Kč) — ФИО: ${fullName.trim()}, Телефон: ${phone.trim()}, Адрес: ${address.trim()}` 
      : "Самовывоз (в округах Ostrava)";
      
    let paymentStr = "Криптовалюта (USDT)";
    if (deliveryType === "delivery") {
      paymentStr = payment === "card" ? "Оплата на карту 🇺🇦" : "Криптовалюта (USDT)";
    } else {
      paymentStr = payment === "cash" ? "Наличные" : "Криптовалюта (USDT)";
    }

    try {
      if (typeof sendTelegramOrder === "function") {
        await sendTelegramOrder(cart, total, {
          name: `${fullName.trim()} (${tg.trim()})`,
          phone: phone.trim() || "Не указан",
          address: deliveryStr,
          payment: paymentStr,
        });
      }
      onConfirm();
    } catch (err) {
      console.error("Ошибка при отправке заказа:", err);
      onError("Сбой при отправке заказа. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 20px 120px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer" }}>
            <ChevronLeft size={18} color="#fff" />
          </button>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Оформление</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>СПОСОБ ПОЛУЧЕНИЯ</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "delivery", label: "Доставка", sub: "+ 79 Kč" },
              { id: "pickup", label: "Самовывоз", sub: "в округах Ostrava" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setDeliveryType(opt.id as "delivery" | "pickup");
                  if (opt.id === "pickup" && payment === "card") setPayment("crypto");
                }}
                style={{
                  padding: "12px 10px",
                  borderRadius: 14,
                  background: deliveryType === opt.id ? "rgba(124,255,91,0.12)" : "rgba(255,255,255,0.05)",
                  border: deliveryType === opt.id ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.08)",
                  color: deliveryType === opt.id ? "#7CFF5B" : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>{opt.id === "delivery" ? "🛵 Доставка / Почта" : "🏪 Самовывоз"}</span>
                <span style={{ fontSize: 10, color: deliveryType === opt.id ? "rgba(124,255,91,0.8)" : "rgba(255,255,255,0.4)" }}>{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {deliveryType === "delivery" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>ДАННЫЕ ДЛЯ ДОСТАВКИ / ПОЧТЫ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "0 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <User size={16} color="rgba(255,255,255,0.35)" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="ФИО получателя (для почты)" style={{ flex: 1, background: "none", border: "none", color: "#fff", padding: "14px 0", outline: "none" }} />
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "0 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <Phone size={16} color="rgba(255,255,255,0.35)" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Номер телефона (+420...)" style={{ flex: 1, background: "none", border: "none", color: "#fff", padding: "14px 0", outline: "none" }} />
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "0 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={16} color="rgba(255,255,255,0.35)" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, квартира / № отделения" style={{ flex: 1, background: "none", border: "none", color: "#fff", padding: "14px 0", outline: "none" }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>TELEGRAM ДЛЯ СВЯЗИ</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "0 14px" }}>
            <input value={tg} onChange={(e) => setTg(e.target.value)} placeholder="@username" style={{ width: "100%", background: "none", border: "none", color: "#fff", padding: "14px 0", outline: "none" }} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>СПОСОБ ОПЛАТЫ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(deliveryType === "delivery" 
              ? [
                  { id: "crypto", label: "Криптовалюта", sub: "USDT", icon: Zap },
                  { id: "card", label: "Оплата на карту 🇺🇦", sub: "Украинская карта", icon: CreditCard }
                ]
              : [
                  { id: "cash", label: "Наличные", sub: "При получении", icon: Wallet },
                  { id: "crypto", label: "Криптовалюта", sub: "USDT", icon: Zap },
                ]
            ).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id as "cash" | "crypto" | "card")}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: payment === opt.id ? "rgba(124,255,91,0.1)" : "rgba(255,255,255,0.05)",
                    border: payment === opt.id ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={20} color={payment === opt.id ? "#7CFF5B" : "rgba(255,255,255,0.4)"} />
                  <div>
                    <div style={{ fontSize: opt.id === "card" ? 16 : 15, fontWeight: opt.id === "card" ? 700 : 600, color: payment === opt.id ? "#7CFF5B" : "#fff" }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{opt.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 390, margin: "0 auto", padding: "16px 20px 24px", background: "#0F1115", zIndex: 110, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button 
          className="btn-primary" 
          style={{ width: "100%", padding: "17px 0", fontSize: 16, opacity: isSubmitting ? 0.6 : 1 }} 
          disabled={isSubmitting} 
          onClick={handleConfirm}
        >
          {isSubmitting ? "Отправка..." : `Отправить заказ (${total} Kč)`}
        </button>
      </div>
    </div>
  );
}

function SuccessScreen({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "0 28px", textAlign: "center" }}>
      <CheckCircle size={60} color="#7CFF5B" style={{ marginBottom: 20 }} />
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Переход в чат!</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Заказ сформирован и передан менеджеру в диалог Telegram.</div>
      <button className="btn-primary" style={{ width: "100%", padding: "16px 0", cursor: "pointer" }} onClick={onHome}>
        Вернуться в магазин
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { firstName, username, id: telegramId } = getTelegramUser();

  useEffect(() => {
    async function saveUser() {
      if (!telegramId) return;
      try {
        const { error } = await supabase
          .from("users")
          .upsert({ telegram_id: telegramId }, { onConflict: "telegram_id" });

        if (error) {
          console.error("Ошибка сохранения пользователя в базу:", error);
        }
      } catch (err) {
        console.error("Ошибка запроса при сохранении юзера:", err);
      }
    }

    saveUser();
  }, [telegramId]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("products").select("*");
        if (error) {
          console.error("Ошибка при получении товаров из Supabase:", error);
        } else if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Ошибка запроса:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    try {
      window.Telegram?.WebApp?.expand?.();
      window.Telegram?.WebApp?.ready?.();
    } catch {}
  }, []);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { product, qty }];
    });
    setToast({ msg: `${product.name} добавлен в корзину` });
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) => prev.map((i) => (i.product.id === id ? { ...i, qty } : i)));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  };

  const selectProduct = (p: Product) => {
    setSelectedProduct(p);
    navigate("product");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", height: "100vh", overflowY: "auto", background: "#0F1115", position: "relative" }}>
      {toast && <Toast msg={toast.msg} isError={toast.isError} onDone={() => setToast(null)} />}

      {screen === "home" && (
        <HomeScreen
          products={products}
          loading={loading}
          onSelectProduct={selectProduct}
          onAddCart={(p) => addToCart(p, 1)}
          onNav={navigate}
          tgFirstName={firstName}
        />
      )}

      {screen === "catalog" && (
        <CatalogScreen
          products={products}
          loading={loading}
          onSelectProduct={selectProduct}
          onAddCart={(p) => addToCart(p, 1)}
        />
      )}

      {screen === "product" && selectedProduct && (
        <ProductScreen
          product={selectedProduct}
          onBack={() => navigate(prevScreen)}
          onAddCart={(p, q) => {
            addToCart(p, q);
            navigate("cart");
          }}
        />
      )}

      {screen === "cart" && (
        <CartScreen
          cart={cart}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={() => navigate("checkout")}
        />
      )}

      {screen === "checkout" && (
        <CheckoutScreen
          cart={cart}
          tgUsername={username}
          onBack={() => navigate("cart")}
          onError={(msg) => setToast({ msg, isError: true })}
          onConfirm={() => {
            setCart([]);
            navigate("success");
          }}
        />
      )}

      {screen === "success" && (
        <SuccessScreen onHome={() => navigate("home")} />
      )}

      {screen !== "product" && screen !== "checkout" && screen !== "success" && (
        <BottomNav current={screen} cartCount={cartCount} onNav={navigate} />
      )}
    </div>
  );
}
