"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema, onboardingSchema, companySchema, paymentSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { revalidatePath } from "next/cache";
import { emailClient } from "./utils/mailtrap";
import { formatCurrency } from "./utils/formatCurrency";


export async function onboardUser(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      firstName: submission.value.firstName,
      lastName: submission.value.lastName,
      address: submission.value.address,
    },
  });

  return   revalidatePath("/dashboard");
  return { success: true };
}

export async function createInvoice(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
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
      userId: session.user?.id,
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
  return { success: true };
}

export async function editInvoice(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
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
      userId: session.user?.id,
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
  return { success: true };
}

export async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  await prisma.invoice.delete({
    where: {
      userId: session.user?.id,
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
      userId: session.user?.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  revalidatePath("/dashboard/invoices");
  return { success: true };
}

export async function updateCompany(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: companySchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const id = formData.get("id") as string;

  if (id) {
    // Update existing company
    await prisma.company.update({
      where: {
        id: id,
        userId: session.user?.id,
      },
      data: {
        name: submission.value.name,
        email: submission.value.email,
        address: submission.value.address || null,
        phone: submission.value.phone || null,
        website: submission.value.website || null,
        logo: submission.value.logo || null,
        taxId: submission.value.taxId || null,
      },
    });
  } else {
    // Create new company
    await prisma.company.create({
      data: {
        name: submission.value.name,
        email: submission.value.email,
        address: submission.value.address || null,
        phone: submission.value.phone || null,
        website: submission.value.website || null,
        logo: submission.value.logo || null,
        taxId: submission.value.taxId || null,
        userId: session.user?.id as string,
      },
    });
  }

  return { success: true };
}

export async function recordPayment(
  prevState: unknown,
  formData: FormData,
) {
  const session = await requireUser();

  const submission = await parseWithZod(formData, {
    schema: paymentSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const invoiceId = formData.get("invoiceId") as string;

  // Verify user owns the invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId: session.user?.id },
  });

  if (!invoice) {
    return { error: "Invoice not found" };
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      amount: submission.value.amount,
      method: submission.value.method || null,
      notes: submission.value.notes || null,
      invoiceId: invoiceId,
    },
  });

  // Update invoice total paid
  const newTotalPaid = invoice.totalPaid + submission.value.amount;
  const newStatus = newTotalPaid >= invoice.total ? "PAID" : 
                    newTotalPaid > 0 ? "PARTIALLY_PAID" : "PENDING";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      totalPaid: newTotalPaid,
      status: newStatus,
    },
  });

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { success: true };
}
