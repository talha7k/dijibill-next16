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
    rate: z.number().min(1, "Rate min 1"),
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
