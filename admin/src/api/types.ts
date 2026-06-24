export interface ProductImage {
  id: string;
  key: string;
  url: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageKey: string | null;
  parentId: string | null;
  parent: Category | null;
  children: Category[];
  sortOrder: number;
  createdAt: string;
}

export interface SalePoint {
  id: string;
  shortName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  description: string | null;
  workingHours: Record<string, unknown> | null;
  imageKey: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  careGuide: string | null;
  height: number | null;
  heightLabel: string | null;
  sort: string | null;
  price: number;
  costPrice: number | null;
  quantity: number;
  reserved: number;
  inStock: boolean;
  isHit: boolean;
  isNew: boolean;
  available: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
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
  productId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productName: string;
  subtotal: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "ASSEMBLED"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export interface Order {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  totalAmount: number;
  deliveryType: "SELF_PICKUP" | "COURIER" | null;
  deliveryCost: number | null;
  deliveryAddress: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  salePoint: { id: string; shortName: string } | null;
  cancelReason: string | null;
  managerNote: string | null;
  paymentLink: string | null;
  cartReservedUntil: string | null;
  paymentExpiresAt: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  basePrice: number;
  perKmPrice: number;
  polygon: [number, number][];
  isActive: boolean;
  createdAt: string;
}

export interface WholesalePrice {
  id: string;
  productId: string;
  productName: string;
  minQuantity: number;
  price: number;
}

export type PartnerStatus = "NEW" | "IN_PROGRESS" | "APPROVED" | "REJECTED";

export interface PartnerDocument {
  id: string;
  key: string;
  type: "PHOTO" | "CONTRACT" | "LEGAL_DOCS";
  originalName: string | null;
  url: string;
  createdAt: string;
}

export interface PartnerApplication {
  id: string;
  organizationName: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  landAddress: string;
  landArea: number | null;
  description: string | null;
  status: PartnerStatus;
  statusLabel: string;
  statusNote: string | null;
  documents: PartnerDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CpRequest {
  id: string;
  companyName: string;
  inn: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  requirements: string | null;
  isProcessed: boolean;
  managerNote: string | null;
  createdAt: string;
}

export interface DashboardStats {
  revenue: { today: number; week: number; month: number };
  orders: {
    new: number;
    paid: number;
    processing: number;
    assembled: number;
    delivering: number;
  };
  topProducts: { name: string; sold: number; revenue: number }[];
  stockByPoint: {
    salePointId: string;
    shortName: string;
    totalItems: number;
    totalValue: number;
  }[];
}
