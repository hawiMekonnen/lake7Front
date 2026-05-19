import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantAddress: string | null;
  restaurantLatitude: number | null;
  restaurantLongitude: number | null;
  addToCart: (item: any, restaurant: any) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantAddress, setRestaurantAddress] = useState<string | null>(null);
  const [restaurantLatitude, setRestaurantLatitude] = useState<number | null>(null);
  const [restaurantLongitude, setRestaurantLongitude] = useState<number | null>(null);

  const addToCart = (item: any, restaurant: any) => {
    // If adding an item from a different restaurant, clear the cart first
    if (restaurantId && restaurantId !== restaurant.id) {
      setCartItems([{
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
        description: item.description,
      }]);
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      setRestaurantAddress(restaurant.address);
      setRestaurantLatitude(restaurant.latitude || 9.0192); // default Addis latitude if none
      setRestaurantLongitude(restaurant.longitude || 38.7525); // default Addis longitude if none
    } else {
      if (!restaurantId) {
        setRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name);
        setRestaurantAddress(restaurant.address);
        setRestaurantLatitude(restaurant.latitude || 9.0192);
        setRestaurantLongitude(restaurant.longitude || 38.7525);
      }
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prevItems, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
          description: item.description,
        }];
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const updated = prevItems.filter((i) => i.id !== itemId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
        setRestaurantAddress(null);
        setRestaurantLatitude(null);
        setRestaurantLongitude(null);
      }
      return updated;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setRestaurantAddress(null);
    setRestaurantLatitude(null);
    setRestaurantLongitude(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        restaurantName,
        restaurantAddress,
        restaurantLatitude,
        restaurantLongitude,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
