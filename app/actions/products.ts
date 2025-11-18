"use server";

import { requireUser } from "../utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { productSchema, productVariationSchema } from "../utils/zodSchemas";
import prisma from "../utils/db";
import { revalidatePath } from "next/cache";

// Product CRUD Actions
export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      sku: submission.value.sku,
      type: submission.value.type,
      basePrice: submission.value.basePrice,
      currency: submission.value.currency,
      trackStock: submission.value.trackStock,
      stockQty: submission.value.stockQty,
      minStockLevel: submission.value.minStockLevel,
      reorderPoint: submission.value.reorderPoint,
      userId: session.user?.id as string,
    },
  });

  revalidatePath("/dashboard/products");
  return submission.reply();
}

export async function updateProduct(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const productId = formData.get("id") as string;

  await prisma.product.update({
    where: {
      id: productId,
      userId: session.user?.id as string,
    },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      sku: submission.value.sku,
      type: submission.value.type,
      basePrice: submission.value.basePrice,
      currency: submission.value.currency,
      trackStock: submission.value.trackStock,
      stockQty: submission.value.stockQty,
      minStockLevel: submission.value.minStockLevel,
      reorderPoint: submission.value.reorderPoint,
    },
  });

  revalidatePath("/dashboard/products");
  return submission.reply();
}

export async function deleteProduct(productId: string) {
  const session = await requireUser();

  await prisma.product.delete({
    where: {
      id: productId,
      userId: session.user?.id,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateStock(productId: string, quantity: number) {
  const session = await requireUser();

  await prisma.product.update({
    where: {
      id: productId,
      userId: session.user?.id as string,
    },
    data: {
      stockQty: quantity,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

// Product Variation Actions
export async function createProductVariation(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: productVariationSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Verify user owns the product
  const product = await prisma.product.findUnique({
    where: {
      id: submission.value.productId,
      userId: session.user?.id as string,
    },
  });

  if (!product) {
    return submission.reply({
      formErrors: ["Product not found"],
    });
  }

  await prisma.productVariation.create({
    data: {
      name: submission.value.name,
      value: submission.value.value,
      priceAdjust: submission.value.priceAdjust,
      stockQty: submission.value.stockQty,
      productId: submission.value.productId,
    },
  });

  revalidatePath(`/dashboard/products/${submission.value.productId}`);
  return submission.reply();
}

export async function updateProductVariation(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: productVariationSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const variationId = formData.get("id") as string;

  // Verify user owns the product
  const variation = await prisma.productVariation.findUnique({
    where: { id: variationId },
    include: { product: true },
  });

  if (!variation || variation.product.userId !== (session.user?.id as string)) {
    return submission.reply({
      formErrors: ["Variation not found"],
    });
  }

  await prisma.productVariation.update({
    where: {
      id: variationId,
    },
    data: {
      name: submission.value.name,
      value: submission.value.value,
      priceAdjust: submission.value.priceAdjust,
      stockQty: submission.value.stockQty,
    },
  });

  revalidatePath(`/dashboard/products/${variation.productId}`);
  return submission.reply();
}

export async function deleteProductVariation(variationId: string) {
  const session = await requireUser();

  const variation = await prisma.productVariation.findUnique({
    where: { id: variationId },
    include: { product: true },
  });

  if (!variation || variation.product.userId !== (session.user?.id as string)) {
    throw new Error("Variation not found");
  }

  await prisma.productVariation.delete({
    where: {
      id: variationId,
    },
  });

  revalidatePath(`/dashboard/products/${variation.productId}`);
  return { success: true };
}