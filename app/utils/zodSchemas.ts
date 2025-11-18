import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(2, "Address is required"),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required"),
  total: z.number().min(1, "1$ is minimum"),

  status: z.enum(["PAID", "PENDING", "PARTIALLY_PAID", "OVERDUE", "EMAILED"]).default("PENDING"),

  date: z.string().min(1, "Date is required"),

  dueDate: z.number().min(0, "Due Date is required"),

  fromName: z.string().min(1, "Your name is required"),

  fromEmail: z.string().email("Invalid Email address"),

  fromAddress: z.string().min(1, "Your address is required"),

  clientName: z.string().min(1, "Client name is required"),

  clientEmail: z.string().email("Invalid Email address"),

  clientAddress: z.string().min(1, "Client address is required"),

  currency: z.string().min(1, "Currency is required"),

  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),

  note: z.string().optional(),

  invoiceItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity min 1"),
    rate: z.number().min(0, "Rate min 0"),
    productId: z.string().optional(),
    variationId: z.string().optional(),
  })).min(1, "At least one item is required"),

  // Backward compatibility fields
  invoiceItemDescription: z.string().optional(),
  invoiceItemQuantity: z.number().optional(),
  invoiceItemRate: z.number().optional(),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo: z.string().optional(),
  taxId: z.string().optional(),
});

export const paymentSchema = z.object({
  amount: z.number().min(1, "Payment amount must be greater than 0"),
  method: z.string().optional(),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  type: z.enum(["SERVICE", "PRODUCT"]).default("SERVICE"),
  basePrice: z.number().min(0, "Price must be 0 or greater"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  
  // Inventory fields
  trackStock: z.boolean().default(false),
  stockQty: z.number().min(0, "Stock quantity must be 0 or greater").default(0),
  minStockLevel: z.number().min(0, "Minimum stock level must be 0 or greater").default(0),
  reorderPoint: z.number().min(0, "Reorder point must be 0 or greater").default(0),
});

export const productVariationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  value: z.string().min(1, "Variation value is required"),
  priceAdjust: z.number().default(0),
  stockQty: z.number().min(0, "Stock quantity must be 0 or greater").default(0),
  productId: z.string().min(1, "Product ID is required"),
});
