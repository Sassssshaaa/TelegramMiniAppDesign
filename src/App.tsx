import { sendTelegramOrder } from './telegram';
import { useState, useEffect, useRef } from "react";
import {
  Home,
  Grid3X3,
  ShoppingCart,
  Search,
  Star,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Tag,
  Package,
  Heart,
  Headphones,
  Settings,
  CheckCircle,
  MapPin,
  CreditCard,
  Wallet,
  Filter,
  X,
  Bell,
  Clock,
  Zap,
  Wind,
  Flame,
  Snowflake,
  Candy,
  Coffee,
  Droplets,
} from "lucide-react";

// ─── Telegram WebApp ──────────────────────────────────────────────────────────

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

function openManagerChat() {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink("https://t.me/Manager_cloud_kopr");
    } else {
      window.open("https://t.me/Manager_cloud_kopr", "_blank");
    }
  } catch {
    window.open("https://t.me/Manager_cloud_kopr", "_blank");
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "success";

interface Product {
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
  isNew?: boolean;
  isHot?: boolean;
  color: string;
  accent: string;
  desc: string;
  img: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

// ─── Single Product ───────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Apple Peach",
    brand: "ElfLiq",
    volume: "30 мл",
    strength: "50 мг",
    vgpg: "50/50",
    price: 350,
    rating: 4.9,
    reviews: 874,
    category: "Ягоды",
    inStock: true,
    isNew: true,
    isHot: true,
    color: "#FF6B9D",
    accent: "#FFB347",
    desc: "Сочное яблоко встречается со спелым персиком — освежающий фруктовый микс с нежным сладким послевкусием. Один из самых популярных вкусов линейки ElfLiq Salt.",
    img: "https://cheapvape.eu/1231-home_default/apple-peach-elfliq-30-ml-salt-50-mg.jpg",
  },
];

const CATEGORIES = [
  { name: "Фрукты", icon: Droplets, color: "#FF8C42" },
  { name: "Ягоды", icon: Heart, color: "#FF4D6D" },
  { name: "Лед", icon: Snowflake, color: "#4DA6FF" },
  { name: "Напитки", icon: Coffee, color: "#FF6B35" },
  { name: "Конфеты", icon: Candy, color: "#FF9ECD" },
  { name: "Табак", icon: Flame, color: "#C4A265" },
  { name: "Мята", icon: Wind, color: "#7CFF5B" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
        letterSpacing: 0.3,
      }}
    >
      {text}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

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
  return (
    <div
      className="product-card"
      style={{ padding: 14, cursor: "pointer", position: "relative" }}
      onClick={() => onSelect(product)}
    >
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 4, zIndex: 2, flexWrap: "wrap" }}>
        {product.isNew && <Badge text="NEW" color="#7CFF5B" />}
        {product.isHot && <Badge text="🔥 ХИТ" color="#FF6B35" />}
        {!product.inStock && <Badge text="Нет" color="#FF4D6D" />}
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
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
        />
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2, lineHeight: 1.3 }}>
        {product.name}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{product.brand}</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 6px" }}>
          {product.volume}
        </span>
        <span style={{ fontSize: 10, color: product.color, background: product.color + "18", borderRadius: 6, padding: "2px 6px" }}>
          {product.strength}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
        <Stars rating={product.rating} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{product.rating}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#7CFF5B" }}>{product.price} Kč</div>
        <button
          className="btn-primary"
          style={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 13,
            opacity: product.inStock ? 1 : 0.4,
            transform: pressed ? "scale(0.9)" : undefined,
          }}
          disabled={!product.inStock}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onClick={(e) => {
            e.stopPropagation();
            if (product.inStock) onAddCart(product);
          }}
        >
          <Plus size={18} color="#0F1115" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
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
        border: "1px solid rgba(124,255,91,0.3)",
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      }}
    >
      <CheckCircle size={18} color="#7CFF5B" />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{msg}</span>
    </div>
  );
}

// ─── Bottom Nav (no Profile tab) ──────────────────────────────────────────────

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
        padding: "12px 8px 20px",
        zIndex: 100,
      }}
    >
      {tabs.map((t) => {
        const active =
          current === t.id ||
          (t.id === "cart" && current === "checkout");
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
                    padding: "0 3px",
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

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({
  onSelectProduct,
  onAddCart,
  onNav,
  tgFirstName,
}: {
  onSelectProduct: (p: Product) => void;
  onAddCart: (p: Product) => void;
  onNav: (s: Screen) => void;
  tgFirstName: string | null;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const greeting = tgFirstName ? `Привет, ${tgFirstName}!` : "Привет!";

  const displayed = PRODUCTS.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Header */}
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

        {/* Search */}
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
            <button
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setSearch("")}
            >
              <X size={16} color="rgba(255,255,255,0.4)" />
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Categories */}
        <div style={{ marginBottom: 24 }}>
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
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={20} color={active ? cat.color : "rgba(255,255,255,0.5)"} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: active ? cat.color : "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>
              {search
                ? `Результаты: «${search}»`
                : activeCategory
                ? activeCategory
                : "🔥 Популярные вкусы"}
            </div>
            {(activeCategory || search) && (
              <button
                style={{ background: "none", border: "none", color: "#4DA6FF", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                onClick={() => { setActiveCategory(null); setSearch(""); }}
              >
                Все
              </button>
            )}
          </div>

          {displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😔</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Ничего не найдено</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Попробуйте другой запрос</div>
            </div>
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

// ─── Catalog Screen ───────────────────────────────────────────────────────────

function CatalogScreen({
  onSelectProduct,
  onAddCart,
}: {
  onSelectProduct: (p: Product) => void;
  onAddCart: (p: Product) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [strength, setStrength] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);

  const filtered = PRODUCTS.filter((p) => {
    if (strength && p.strength !== strength) return false;
    if (category && p.category !== category) return false;
    if (p.price > maxPrice) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const strengths = ["20 мг", "35 мг", "50 мг"];

  return (
    <div style={{ paddingBottom: 90 }}>
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
              placeholder="Поиск по названию или бренду..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, padding: "12px 0" }}
            />
            {search && (
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setSearch("")}>
                <X size={14} color="rgba(255,255,255,0.4)" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: (strength || category) ? "rgba(124,255,91,0.15)" : "rgba(255,255,255,0.07)",
              border: (strength || category) ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Filter size={18} color={(strength || category) ? "#7CFF5B" : "rgba(255,255,255,0.6)"} />
          </button>
        </div>

        {(strength || category) && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {strength && (
              <button
                onClick={() => setStrength(null)}
                style={{
                  background: "rgba(77,166,255,0.15)",
                  border: "1px solid rgba(77,166,255,0.4)",
                  borderRadius: 99,
                  padding: "4px 12px",
                  color: "#4DA6FF",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {strength} <X size={10} />
              </button>
            )}
            {category && (
              <button
                onClick={() => setCategory(null)}
                style={{
                  background: "rgba(124,255,91,0.12)",
                  border: "1px solid rgba(124,255,91,0.3)",
                  borderRadius: 99,
                  padding: "4px 12px",
                  color: "#7CFF5B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {category} <X size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "0 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Ничего не найдено</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Попробуйте другие фильтры</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} onAddCart={onAddCart} />
            ))}
          </div>
        )}
      </div>

      {filterOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-end",
            maxWidth: 390,
            margin: "0 auto",
          }}
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="animate-slide-up"
            style={{
              width: "100%",
              background: "#16191F",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px 24px 0 0",
              padding: "20px 20px 40px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Фильтры</div>
              <button
                onClick={() => { setStrength(null); setCategory(null); setMaxPrice(2000); }}
                style={{ background: "none", border: "none", color: "#FF4D6D", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Сбросить
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>КРЕПОСТЬ</div>
              <div style={{ display: "flex", gap: 8 }}>
                {strengths.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrength(strength === s ? null : s)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 12,
                      background: strength === s ? "rgba(124,255,91,0.15)" : "rgba(255,255,255,0.06)",
                      border: strength === s ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.08)",
                      color: strength === s ? "#7CFF5B" : "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>КАТЕГОРИЯ</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(category === cat.name ? null : cat.name)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: category === cat.name ? cat.color + "18" : "rgba(255,255,255,0.06)",
                      border: category === cat.name ? `1.5px solid ${cat.color}` : "1px solid rgba(255,255,255,0.08)",
                      color: category === cat.name ? cat.color : "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>ЦЕНА</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#7CFF5B" }}>до {maxPrice} Kč</span>
              </div>
              <input
                type="range"
                min={100}
                max={2000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7CFF5B" }}
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
              onClick={() => setFilterOpen(false)}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Product Screen ───────────────────────────────────────────────────────────

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

  const specs = [
    { label: "Производитель", value: product.brand },
    { label: "Объем", value: product.volume },
    { label: "Крепость", value: product.strength },
    { label: "Соотношение VG/PG", value: product.vgpg },
    { label: "Категория", value: product.category },
  ];

  return (
    <div style={{ paddingBottom: 120 }} className="animate-fade-in">
      <div
        style={{
          height: 320,
          position: "relative",
          background: "#1A1D24",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 80%, ${product.color}20 0%, transparent 70%)`,
          }}
        />
        <img
          src={product.img}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }}
        />
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 52,
            left: 16,
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "rgba(15,17,21,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color="#fff" />
        </button>
        <div style={{ position: "absolute", top: 52, right: 16, display: "flex", gap: 6 }}>
          {product.isNew && <Badge text="NEW" color="#7CFF5B" />}
          {product.isHot && <Badge text="🔥 ХИТ" color="#FF6B35" />}
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{product.brand}</div>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>{product.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Stars rating={product.rating} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#FFD700" }}>{product.rating}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>({product.reviews} отзывов)</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{product.desc}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Характеристики</div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            {specs.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "13px 16px",
                  borderBottom: i < specs.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Количество</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Minus size={16} color="#fff" />
            </button>
            <span style={{ fontSize: 20, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(124,255,91,0.15)",
                border: "1.5px solid rgba(124,255,91,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Plus size={16} color="#7CFF5B" />
            </button>
          </div>
        </div>
      </div>

      {/* Fixed CTA — high enough above bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 390,
          margin: "0 auto",
          padding: "16px 20px 90px",
          background: "linear-gradient(to top, #0F1115 55%, transparent)",
          zIndex: 90,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Итого</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#7CFF5B" }}>{product.price * qty} Kč</div>
          </div>
          <button
            className="btn-primary"
            style={{ flex: 1, padding: "16px 0", fontSize: 16 }}
            disabled={!product.inStock}
            onClick={() => onAddCart(product, qty)}
          >
            {product.inStock ? "Добавить в корзину" : "Нет в наличии"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Screen ──────────────────────────────────────────────────────────────

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
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = 0;
  const total = subtotal - discount + delivery;

  const applyPromo = () => {
    if (promo.toUpperCase() === "VAPE10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          padding: "0 40px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Корзина пуста</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
          Добавьте понравившиеся жидкости из каталога
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: "56px 20px 16px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Корзина</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="glass"
              style={{ borderRadius: 18, padding: 14, display: "flex", gap: 12, alignItems: "center" }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  background: "#1A1D24",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.product.img}
                  alt={item.product.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.product.name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                  {item.product.brand} · {item.product.volume}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#7CFF5B" }}>
                    {item.product.price * item.qty} Kč
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() =>
                        item.qty === 1 ? onRemove(item.product.id) : onUpdateQty(item.product.id, item.qty - 1)
                      }
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        background: item.qty === 1 ? "rgba(255,77,109,0.15)" : "rgba(255,255,255,0.08)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {item.qty === 1 ? <Trash2 size={13} color="#FF4D6D" /> : <Minus size={13} color="#fff" />}
                    </button>
                    <span style={{ fontSize: 15, fontWeight: 700, minWidth: 18, textAlign: "center" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        background: "rgba(124,255,91,0.12)",
                        border: "1px solid rgba(124,255,91,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={13} color="#7CFF5B" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${promoError ? "#FF4D6D" : promoApplied ? "#7CFF5B" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 14px",
              }}
            >
              <Tag size={16} color={promoApplied ? "#7CFF5B" : "rgba(255,255,255,0.35)"} />
              <input
                value={promo}
                onChange={(e) => { setPromo(e.target.value); setPromoError(false); }}
                placeholder="Промокод"
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  padding: "14px 0",
                }}
              />
              {promoApplied && <CheckCircle size={16} color="#7CFF5B" />}
            </div>
            <button className="btn-blue" style={{ padding: "0 18px", fontSize: 14 }} onClick={applyPromo}>
              Применить
            </button>
          </div>
          {promoError && <div style={{ fontSize: 12, color: "#FF4D6D", marginTop: 6 }}>Промокод недействителен</div>}
          {promoApplied && <div style={{ fontSize: 12, color: "#7CFF5B", marginTop: 6 }}>Скидка 10% применена!</div>}
        </div>

        {/* Summary */}
        <div className="glass" style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 80 }}>
          {[
            { label: "Сумма заказа", val: `${subtotal} Kč` },
            { label: "Скидка", val: discount > 0 ? `-${discount} Kč` : "—", color: discount > 0 ? "#7CFF5B" : undefined },
            { label: "Доставка", val: "Обсудим с менеджером", color: undefined },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: row.color || "#fff" }}>{row.val}</span>
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700 }}>Итого</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#7CFF5B" }}>{total} Kč</span>
          </div>
        </div>
      </div>

      {/* Fixed checkout button — above nav bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 390,
          margin: "0 auto",
          padding: "16px 20px 90px",
          background: "linear-gradient(to top, #0F1115 55%, transparent)",
          zIndex: 90,
        }}
      >
        <button
          className="btn-primary"
          style={{ width: "100%", padding: "17px 0", fontSize: 16 }}
  onClick={() => {
  sendTelegramOrder(
    cart, 
    350, 
    { name: tgUsername || "Клиент", phone: "Из приложения", address: "Указан при связи" }
  );
  if (onCheckout) onCheckout();
}}

// ─── Checkout Screen ──────────────────────────────────────────────────────────

function CheckoutScreen({
  cart,
  tgUsername,
  onBack,
  onConfirm,
}: {
  cart: CartItem[];
  tgUsername: string | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [deliveryType, setDeliveryType] = useState<"courier" | "pickup">("courier");
  const [payment, setPayment] = useState<"card" | "cash" | "crypto">("card");
  const [tg, setTg] = useState(tgUsername ? `@${tgUsername}` : "");
  const [address, setAddress] = useState("");

  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);

  const handleConfirm = () => {
    const itemLines = cart
      .map((i) => `• ${i.product.name} (${i.product.volume}, ${i.product.strength}) × ${i.qty} шт. = ${i.product.price * i.qty} Kč`)
      .join("\n");

    const deliveryStr =
      deliveryType === "courier"
        ? `Курьер${address ? ` → ${address}` : " (адрес уточнить)"}`
        : "Самовывоз";

    const paymentStr =
      payment === "card" ? "Банковская карта" : payment === "cash" ? "Наличные" : "Криптовалюта (USDT/TON)";

    const msg = [
      "🛒 Новый заказ!",
      "",
      `👤 Покупатель: ${tg || "не указан"}`,
      `🚚 Доставка: ${deliveryStr}`,
      `💳 Оплата: ${paymentStr}`,
      "",
      "📦 Состав заказа:",
      itemLines,
      "",
      `💰 Итого: ${total} Kč`,
    ].join("\n");

    // Log for debug; actual sending is via Telegram link
    console.log("Order for manager:\n" + msg);

    openManagerChat();
    onConfirm();
  };

  return (
    <div style={{ paddingBottom: 120 }} className="animate-fade-in">
      <div style={{ padding: "56px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} color="#fff" />
          </button>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Оформление</div>
        </div>

        {/* Delivery */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
            СПОСОБ ПОЛУЧЕНИЯ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "courier", label: "Курьер", icon: "🛵" },
              { id: "pickup", label: "Самовывоз", icon: "🏪" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDeliveryType(opt.id as "courier" | "pickup")}
                style={{
                  padding: "14px 0",
                  borderRadius: 14,
                  background: deliveryType === opt.id ? "rgba(124,255,91,0.12)" : "rgba(255,255,255,0.05)",
                  border: deliveryType === opt.id ? "1.5px solid #7CFF5B" : "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: deliveryType === opt.id ? "#7CFF5B" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {deliveryType === "courier" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
              АДРЕС ДОСТАВКИ
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
              }}
            >
              <MapPin size={16} color="rgba(255,255,255,0.35)" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Введите адрес..."
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  padding: "14px 0",
                }}
              />
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
            TELEGRAM ДЛЯ СВЯЗИ
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
            }}
          >
            <span style={{ fontSize: 16 }}>✈️</span>
            <input
              value={tg}
              onChange={(e) => setTg(e.target.value)}
              placeholder="@username"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 14,
                padding: "14px 0",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, paddingLeft: 4 }}>
            Менеджер свяжется с вами в Telegram после подтверждения
          </div>
        </div>

        {/* Payment */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: 0.5 }}>
            СПОСОБ ОПЛАТЫ
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "card", label: "Банковская карта", sub: "Visa, MC, МИР", icon: CreditCard },
              { id: "cash", label: "Наличные", sub: "При получении", icon: Wallet },
              { id: "crypto", label: "Криптовалюта", sub: "USDT, TON", icon: Zap },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id as "card" | "cash" | "crypto")}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: payment === opt.id ? "rgba(77,166,255,0.1)" : "rgba(255,255,255,0.05)",
                    border: payment === opt.id ? "1.5px solid #4DA6FF" : "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Icon size={20} color={payment === opt.id ? "#4DA6FF" : "rgba(255,255,255,0.4)"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: payment === opt.id ? "#4DA6FF" : "#fff" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{opt.sub}</div>
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 99,
                      border: payment === opt.id ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                      background: payment === opt.id ? "#4DA6FF" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {payment === opt.id && (
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: "#fff" }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="glass" style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Ваш заказ ({cart.length} поз.)</div>
          {cart.map((item) => (
            <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginRight: 8,
                }}
              >
                {item.product.name} ×{item.qty}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {item.product.price * item.qty} Kč
              </span>
            </div>
          ))}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700 }}>Итого</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#7CFF5B" }}>{total} Kč</span>
          </div>
        </div>

        {/* Manager note */}
        <div
          style={{
            background: "rgba(77,166,255,0.08)",
            border: "1px solid rgba(77,166,255,0.2)",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 100,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>✈️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4DA6FF", marginBottom: 2 }}>
              Авто-уведомление менеджеру
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Нажав «Подтвердить», откроется чат с{" "}
              <span style={{ color: "#4DA6FF" }}>@Manager_cloud_kopr</span> — детали заказа будут отправлены автоматически.
            </div>
          </div>
        </div>
      </div>

      {/* Fixed confirm button — clears bottom bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 390,
          margin: "0 auto",
          padding: "16px 20px 36px",
          background: "linear-gradient(to top, #0F1115 65%, transparent)",
          zIndex: 90,
        }}
      >
        <button
          className="btn-primary"
          style={{ width: "100%", padding: "17px 0", fontSize: 16 }}
          onClick={handleConfirm}
        >
          Подтвердить заказ
        </button>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ onHome }: { onHome: () => void }) {
  const orderId = useRef("#" + Math.floor(10000 + Math.random() * 90000));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "0 28px",
        textAlign: "center",
      }}
      className="animate-scale-in"
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 999,
          background: "radial-gradient(circle, rgba(124,255,91,0.2) 0%, rgba(124,255,91,0.05) 70%)",
          border: "2px solid rgba(124,255,91,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
          position: "relative",
        }}
      >
        <div
          style={{ position: "absolute", inset: -8, borderRadius: 999, border: "1px solid rgba(124,255,91,0.1)" }}
        />
        <CheckCircle size={52} color="#7CFF5B" />
      </div>

      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Заказ оформлен!</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 8 }}>
        Менеджер <span style={{ color: "#4DA6FF" }}>@Manager_cloud_kopr</span> скоро свяжется с вами в Telegram для подтверждения деталей.
      </div>

      <div
        style={{
          background: "rgba(124,255,91,0.08)",
          border: "1px solid rgba(124,255,91,0.2)",
          borderRadius: 14,
          padding: "12px 24px",
          marginBottom: 36,
          marginTop: 4,
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Номер заказа</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#7CFF5B", letterSpacing: 2 }}>{orderId.current}</div>
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%", flexDirection: "column" }}>
        <button
          className="btn-blue"
          style={{
            width: "100%",
            padding: "16px 0",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onClick={() => openManagerChat()}
        >
          <Clock size={18} />
          Написать менеджеру
        </button>
        <button className="btn-primary" style={{ width: "100%", padding: "16px 0", fontSize: 15 }} onClick={onHome}>
          Продолжить покупки
        </button>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { firstName, username } = getTelegramUser();

  useEffect(() => {
    try {
      window.Telegram?.WebApp?.expand?.();
      window.Telegram?.WebApp?.ready?.();
    } catch {
      // not in Telegram env
    }
  }, []);

  const navigate = (s: Screen) => {
    setPrevScreen(screen);
    setScreen(s);
  };

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });
    setToast(`${product.name} добавлен в корзину`);
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
    <div
      style={{
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#0F1115",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <div key={screen} className="animate-fade-in">
        {screen === "home" && (
          <HomeScreen
            onSelectProduct={selectProduct}
            onAddCart={addToCart}
            onNav={navigate}
            tgFirstName={firstName}
          />
        )}
        {screen === "catalog" && (
          <CatalogScreen onSelectProduct={selectProduct} onAddCart={addToCart} />
        )}
        {screen === "product" && selectedProduct && (
          <ProductScreen
            product={selectedProduct}
            onBack={() => navigate(prevScreen === "product" ? "home" : prevScreen)}
            onAddCart={(p, qty) => {
              addToCart(p, qty);
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
            onConfirm={() => {
              setCart([]);
              navigate("success");
            }}
          />
        )}
        {screen === "success" && <SuccessScreen onHome={() => navigate("home")} />}
      </div>

      {screen !== "success" && (
        <BottomNav current={screen} cartCount={cartCount} onNav={navigate} />
      )}
    </div>
  );
}
