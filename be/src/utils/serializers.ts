import { getImagePublicUrl } from "../services/minio.js";

export function serializeCategory(category: {
  id: string;
  name: string;
  slug: string;
  imageKey: string | null;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  parent?: {
    id: string;
    name: string;
    slug: string;
    imageKey: string | null;
    parentId: string | null;
    sortOrder: number;
    createdAt: Date;
  } | null;
  children?: {
    id: string;
    name: string;
    slug: string;
    imageKey: string | null;
    parentId: string | null;
    sortOrder: number;
    createdAt: Date;
  }[];
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageKey: category.imageKey,
    imageUrl: category.imageKey ? getImagePublicUrl(category.imageKey) : null,
    parentId: category.parentId,
    parent: category.parent
      ? {
          id: category.parent.id,
          name: category.parent.name,
          slug: category.parent.slug,
          imageKey: category.parent.imageKey,
          parentId: category.parent.parentId,
          sortOrder: category.parent.sortOrder,
          createdAt: category.parent.createdAt,
        }
      : null,
    children: (category.children ?? []).map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      imageKey: child.imageKey,
      parentId: child.parentId,
      sortOrder: child.sortOrder,
      createdAt: child.createdAt,
    })),
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
  };
}

export function serializeSalePointRef(point: {
  id: string;
  shortName: string;
  address: string;
  imageKey: string | null;
} | null) {
  if (!point) return null;
  return {
    id: point.id,
    shortName: point.shortName,
    address: point.address,
    imageUrl: point.imageKey ? getImagePublicUrl(point.imageKey) : null,
  };
}

export function serializeProduct(product: {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  careGuide: string | null;
  height: number | null;
  heightLabel: string | null;
  sort: string | null;
  price: { toString(): string };
  costPrice: { toString(): string } | null;
  quantity: number;
  reserved: number;
  inStock: boolean;
  isHit: boolean;
  isNew: boolean;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  salePointId: string | null;
  salePoint: {
    id: string;
    shortName: string;
    address: string;
    imageKey: string | null;
  } | null;
  images: { id: string; key: string; url: string; sortOrder: number }[];
  createdAt: Date;
  updatedAt: Date;
}) {
  const available = product.inStock && product.quantity - product.reserved > 0;
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    careGuide: product.careGuide,
    height: product.height,
    heightLabel: product.heightLabel,
    sort: product.sort,
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    quantity: product.quantity,
    reserved: product.reserved,
    inStock: product.inStock,
    isHit: product.isHit,
    isNew: product.isNew,
    available,
    categoryId: product.categoryId,
    category: product.category ?? null,
    salePointId: product.salePointId,
    salePoint: serializeSalePointRef(product.salePoint),
    images: product.images.map((img) => ({
      ...img,
      url: getImagePublicUrl(img.key),
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
