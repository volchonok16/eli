import { prisma } from "../db/prisma.js";
import { getImagePublicUrl } from "./minio.js";

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" as const } },
          salePoint: true,
        },
      },
    },
    orderBy: { product: { name: "asc" as const } },
  },
} as const;

export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: { userId },
    include: cartInclude,
  });
}

export function serializeCart(cart: {
  id: string;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      heightLabel: string | null;
      description: string | null;
      price: { toString(): string };
      quantity: number;
      reserved: number;
      inStock: boolean;
      isHit: boolean;
      salePointId: string | null;
      salePoint: {
        id: string;
        shortName: string;
        address: string;
        imageKey: string | null;
      } | null;
      images: { id: string; key: string; url: string; sortOrder: number }[];
    };
  }[];
}) {
  let totalAmount = 0;
  let totalItems = 0;

  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    const subtotal = price * item.quantity;
    totalAmount += subtotal;
    totalItems += item.quantity;

    return {
      id: item.id,
      productId: item.product.id,
      quantity: item.quantity,
      price,
      subtotal,
      available:
        item.product.inStock &&
        item.product.quantity - item.product.reserved >= item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        heightLabel: item.product.heightLabel,
        description: item.product.description,
        price,
        quantity: item.product.quantity,
        inStock: item.product.inStock,
        isHit: item.product.isHit,
        salePointId: item.product.salePointId,
        salePoint: item.product.salePoint
          ? {
              id: item.product.salePoint.id,
              shortName: item.product.salePoint.shortName,
              address: item.product.salePoint.address,
              imageUrl: item.product.salePoint.imageKey
                ? getImagePublicUrl(item.product.salePoint.imageKey)
                : null,
            }
          : null,
        images: item.product.images.map((img) => ({
          ...img,
          url: getImagePublicUrl(img.key),
        })),
      },
    };
  });

  return {
    id: cart.id,
    items,
    totalItems,
    totalAmount,
  };
}
