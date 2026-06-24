const TOKEN_KEY = "eli_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ProductImage {
  id: string;
  key: string;
  url: string;
  sortOrder: number;
}

export interface SalePoint {
  id: string;
  shortName: string;
  address: string;
  imageKey: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  inStock: boolean;
  isHit: boolean;
  available: boolean;
  salePointId: string | null;
  salePoint: {
    id: string;
    shortName: string;
    address: string;
    imageUrl: string | null;
  } | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  contact: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  contact: string;
  message: string | null;
  serviceId: string | null;
  status: "NEW" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  statusLabel: string;
  service: Service | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryItem {
  id: string;
  quantity: number;
  price: number;
  productName: string;
  subtotal: number;
}

export interface PaymentOrder {
  id: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  statusLabel: string;
  totalAmount: number;
  createdAt: string;
  items: PaymentHistoryItem[];
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`/api${path}`, { ...options, headers });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? `Ошибка ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getProducts: () => request<Product[]>("/products"),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  createProduct: (data: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    inStock: boolean;
    isHit: boolean;
    salePointId?: string | null;
  }) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (
    id: string,
    data: {
      name: string;
      description?: string;
      price: number;
      quantity: number;
      inStock: boolean;
      isHit: boolean;
      salePointId?: string | null;
    }
  ) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  uploadImages: (id: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));
    return request<ProductImage[]>(`/products/${id}/images`, {
      method: "POST",
      body: formData,
    });
  },
  deleteImage: (productId: string, imageId: string) =>
    request<void>(`/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    }),
  reorderImages: (productId: string, imageIds: string[]) =>
    request<ProductImage[]>(`/products/${productId}/images/order`, {
      method: "PUT",
      body: JSON.stringify({ imageIds }),
    }),

  getServices: () => request<Service[]>("/services"),
  getService: (id: string) => request<Service>(`/services/${id}`),
  createService: (data: {
    name: string;
    description?: string;
    price?: number | null;
    isActive: boolean;
  }) =>
    request<Service>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateService: (
    id: string,
    data: {
      name: string;
      description?: string;
      price?: number | null;
      isActive: boolean;
    }
  ) =>
    request<Service>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<void>(`/services/${id}`, { method: "DELETE" }),

  getFeedback: () => request<Feedback[]>("/feedback"),
  markFeedbackRead: (id: string, isRead: boolean) =>
    request<Feedback>(`/feedback/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isRead }),
    }),
  deleteFeedback: (id: string) =>
    request<void>(`/feedback/${id}`, { method: "DELETE" }),

  getApplications: () => request<Application[]>("/applications"),
  updateApplicationStatus: (
    id: string,
    status: Application["status"]
  ) =>
    request<Application>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteApplication: (id: string) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),

  getPaymentHistory: () => request<PaymentOrder[]>("/orders/history"),

  getReviews: () => request<Review[]>("/reviews"),
  getReview: (id: string) => request<Review>(`/reviews/${id}`),
  createReview: (data: {
    authorName: string;
    text: string;
    rating: number;
    isPublished: boolean;
  }) =>
    request<Review>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateReview: (
    id: string,
    data: {
      authorName: string;
      text: string;
      rating: number;
      isPublished: boolean;
    }
  ) =>
    request<Review>(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  toggleReviewPublish: (id: string) =>
    request<Review>(`/reviews/${id}/publish`, { method: "PATCH" }),
  deleteReview: (id: string) =>
    request<void>(`/reviews/${id}`, { method: "DELETE" }),

  getSalePoints: () => request<SalePoint[]>("/sale-points"),
  getSalePoint: (id: string) => request<SalePoint>(`/sale-points/${id}`),
  createSalePoint: (data: { shortName: string; address: string }) =>
    request<SalePoint>("/sale-points", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSalePoint: (
    id: string,
    data: { shortName: string; address: string }
  ) =>
    request<SalePoint>(`/sale-points/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  uploadSalePointImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return request<SalePoint>(`/sale-points/${id}/image`, {
      method: "POST",
      body: formData,
    });
  },
  deleteSalePointImage: (id: string) =>
    request<void>(`/sale-points/${id}/image`, { method: "DELETE" }),
  deleteSalePoint: (id: string) =>
    request<void>(`/sale-points/${id}`, { method: "DELETE" }),
};
