import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/api/endpoints/cart';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  height: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItem[]; total: number }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; itemId: string };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items, total: action.total };
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((item) =>
        item.id === action.itemId ? { ...item, quantity: action.quantity } : item,
      );
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.id !== action.itemId);
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) };
    }
    default:
      return state;
  }
};

const initialState: CartState = { items: [], total: 0 };

const CartContext = createContext<{
  state: CartState;
  setItems: (items: CartItem[], total: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  itemCount: number;
  isLoading: boolean;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (cartData) {
      dispatch({ type: 'SET_ITEMS', items: cartData.items as CartItem[], total: cartData.total });
    }
  }, [cartData]);

  const setItems = useCallback((items: CartItem[], total: number) => {
    dispatch({ type: 'SET_ITEMS', items, total });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
  }, []);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ state, setItems, updateQuantity, removeItem, itemCount, isLoading: false }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};
