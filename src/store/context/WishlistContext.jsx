import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProductImage, getLowestPrice, getTotalStock, getProductPlatforms } from '../utils';

const WishlistContext = createContext(null);
const WISHLIST_KEY = 'qt_wishlist';

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return items.some((item) => String(item.id) === String(productId));
    },
    [items]
  );

  const toggleWishlist = useCallback((product) => {
    if (!product || !product.id) return;
    
    setItems((prev) => {
      const exists = prev.some((item) => String(item.id) === String(product.id));
      if (exists) {
        setLastAction({ type: 'removed', product });
        return prev.filter((item) => String(item.id) !== String(product.id));
      }

      const itemToAdd = {
        id: product.id,
        title: product.title,
        condition: product.condition,
        category: product.category?.name || product.category || '',
        image: getProductImage(product),
        price: getLowestPrice(product),
        inStock: getTotalStock(product) > 0,
        platforms: getProductPlatforms(product),
        variations: product.variations || [],
        media: product.media || [],
        isFlashSale: !!product.isFlashSale,
        isFeatured: !!product.isFeatured,
        addedAt: new Date().toISOString(),
      };

      setLastAction({ type: 'added', product: itemToAdd });
      return [itemToAdd, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        lastAction,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
