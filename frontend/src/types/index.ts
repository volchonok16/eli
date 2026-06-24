export interface Product {
  id: string;
  name: string;
  latinName: string;
  description: string;
  height: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
