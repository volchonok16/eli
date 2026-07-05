import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/api/endpoints/cart';

interface BackendCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    heightLabel: string | null;
    images: { url: string }[];
  };
}

function mapCartItem(item: BackendCartItem) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    height: item.product.heightLabel ?? '—',
    price: item.price,
    quantity: item.quantity,
    image: item.product.images[0]?.url ?? '',
  };
}

interface CartState {
  items: ReturnType<typeof mapCartItem>[];
  total: number;
}

type CartAction =
  | { type: 'SET_ITEMS'; items: ReturnType<typeof mapCartItem>[]; total: number }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { items: action.items, total: action.total };
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((item) =>
        item.productId === action.productId ? { ...item, quantity: action.quantity } : item,
      );
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.productId !== action.productId);
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) };
    }
    default:
      return state;
  }
};

const initialState: CartState = { items: [], total: 0 };

const CartContext = createContext<{
  state: CartState;
  setItems: (items: ReturnType<typeof mapCartItem>[], total: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
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
    retry: false,
  });

  useEffect(() => {
    if (cartData) {
      dispatch({
        type: 'SET_ITEMS',
        items: cartData.items,
        total: cartData.total,
      });
    }
  }, [cartData]);

  const setItems = useCallback((items: ReturnType<typeof mapCartItem>[], total: number) => {
    dispatch({ type: 'SET_ITEMS', items, total });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
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
