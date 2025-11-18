"use server";

import { requireUser } from "../utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";
import prisma from "../utils/db";
import { revalidatePath } from "next/cache";
import { emailClient } from "../utils/mailtrap";
import { formatCurrency } from "../utils/formatCurrency";

export async function createInvoice(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Parse invoice items from JSON string
  let invoiceItems;
  try {
    const itemsString = formData.get('invoiceItems') as string;
    invoiceItems = itemsString ? JSON.parse(itemsString) : [];
  } catch {
    return submission.reply({
      formErrors: ["Invalid invoice items format"],
    });
  }

// Validate stock for products
  for (const item of invoiceItems) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variations: true },
      });

      if (!product) {
        return submission.reply({
          formErrors: [`Product not found: ${item.productId}`],
        });
      }

      if (product.trackStock) {
        const currentStock = item.variationId 
          ? product.variations.find((v: { id: string }) => v.id === item.variationId)?.stockQty || 0
          : product.stockQty;

        if (currentStock < item.quantity) {
          return submission.reply({
            formErrors: [`Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${item.quantity}`],
          });
        }
      }
    }
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id as string,
      invoiceItems: {
        create: invoiceItems,
      },
    },
  });

  // Get company settings for sender info
  const userCompany = await prisma.company.findUnique({
    where: { userId: session.user?.id },
  });
  
  const sender = {
    email: userCompany?.email || submission.value.fromEmail,
    name: userCompany?.name || submission.value.fromName,
  };

  emailClient.send({
    from: sender,
    to: [{ email: submission.value.clientEmail }],
    template_uuid: "3c01e4ee-a9ed-4cb6-bbf7-e57c2ced6c94",
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber,
      invoiceDueDate: new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
      }).format(new Date(submission.value.date)),
      invoiceAmount: formatCurrency({
        amount: submission.value.total,
        currency: submission.value.currency as "USD" | "EUR",
      }),
      invoiceLink:
        process.env.NODE_ENV !== "production"
          ? `http://localhost:3000/api/invoice/${data.id}`
          : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
    },
  });

  revalidatePath("/dashboard/invoices");
  return submission.reply();
}

export async function editInvoice(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  // Parse invoice items from JSON string first
  let invoiceItems;
  try {
    const itemsString = formData.get('invoiceItems') as string;
    invoiceItems = itemsString ? JSON.parse(itemsString) : [];
  } catch {
    return submission.reply({
      formErrors: ["Invalid invoice items format"],
    });
  }

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Validate stock for products
  for (const item of invoiceItems) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variations: true },
      });

      if (!product) {
        return submission.reply({
          formErrors: [`Product not found: ${item.productId}`],
        });
      }

      if (product.trackStock) {
        const currentStock = item.variationId 
          ? product.variations.find((v: { id: string }) => v.id === item.variationId)?.stockQty || 0
          : product.stockQty;

        // Get existing invoice items to check current stock usage
        const existingInvoice = await prisma.invoice.findUnique({
          where: { id: formData.get("id") as string },
          include: { invoiceItems: true },
        });

        const existingItemQuantity = existingInvoice?.invoiceItems
          .filter((existingItem) => 
            existingItem.productId === item.productId && 
            existingItem.variationId === item.variationId
          )
          .reduce((sum: number, existingItem) => sum + existingItem.quantity, 0) || 0;

        const availableStock = currentStock + existingItemQuantity;

        if (availableStock < item.quantity) {
          return submission.reply({
            formErrors: [`Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`],
          });
        }
      }
    }
  }

  // First delete existing invoice items
  await prisma.invoiceItem.deleteMany({
    where: {
      invoiceId: formData.get("id") as string,
    },
  });

  const data = await prisma.invoice.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id as string,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      invoiceItems: {
        create: submission.value.invoiceItems,
      },
    },
  });

  // Get company settings for sender info
  const userCompany = await prisma.company.findUnique({
    where: { userId: session.user?.id },
  });
  
  const sender = {
    email: userCompany?.email || submission.value.fromEmail,
    name: userCompany?.name || submission.value.fromName,
  };

  emailClient.send({
    from: sender,
    to: [{ email: submission.value.clientEmail }],
    template_uuid: "9d04aa85-6896-48a8-94e9-b54354a48880",
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber,
      invoiceDueDate: new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
      }).format(new Date(submission.value.date)),
      invoiceAmount: formatCurrency({
        amount: submission.value.total,
        currency: submission.value.currency as "USD" | "EUR",
      }),
      invoiceLink:
        process.env.NODE_ENV !== "production"
          ? `http://localhost:3000/api/invoice/${data.id}`
          : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
    },
  });

  revalidatePath("/dashboard/invoices");
  return submission.reply();
}

export async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  // Get invoice with items before deletion to restore stock
  const invoice = await prisma.invoice.findUnique({
    where: {
      userId: session.user?.id as string,
      id: invoiceId,
    },
    include: {
      invoiceItems: true,
    },
  });

  if (!invoice) {
    return { error: "Invoice not found" };
  }

  // Restore stock for products
  for (const item of invoice.invoiceItems) {
    if (item.productId) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variations: true },
      });

      if (product && product.trackStock) {
        if (item.variationId) {
          // Update variation stock
          await prisma.productVariation.update({
            where: { id: item.variationId },
            data: {
              stockQty: {
                increment: item.quantity,
              },
            },
          });
        } else {
          // Update main product stock
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQty: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }
  }

  await prisma.invoice.delete({
    where: {
      userId: session.user?.id as string,
      id: invoiceId,
    },
  });

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function MarkAsPaidAction(invoiceId: string) {
  const session = await requireUser();

  await prisma.invoice.update({
    where: {
      userId: session.user?.id as string,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  revalidatePath("/dashboard/invoices");
  return { success: true };
}