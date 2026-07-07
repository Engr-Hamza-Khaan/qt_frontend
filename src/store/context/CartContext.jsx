import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'qt_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, variation, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variationId === variation.id);
      if (existing) {
        return prev.map((i) =>
          i.variationId === variation.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          variationId: variation.id,
          productId: product.id,
          title: product.title,
          image: product.media?.find((m) => m.isFeatured)?.url || product.media?.[0]?.url,
          sku: variation.sku,
          platform: variation.platform,
          color: variation.color,
          storage: variation.storage,
          edition: variation.edition,
          price: parseFloat(variation.price),
          maxStock: variation.stockQuantity,
          quantity,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((variationId) => {
    setItems((prev) => prev.filter((i) => i.variationId !== variationId));
  }, []);

  const updateQuantity = useCallback((variationId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.variationId === variationId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
