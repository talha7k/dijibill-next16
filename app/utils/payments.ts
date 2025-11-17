import prisma from "./db";

export type InvoiceStatus = "PAID" | "PENDING" | "PARTIALLY_PAID" | "OVERDUE" | "EMAILED";

export interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  method?: string | null;
  notes?: string | null;
  invoiceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPaymentHistory(invoiceId: string, userId: string): Promise<Payment[]> {
  const payments = await prisma.payment.findMany({
    where: {
      invoiceId: invoiceId,
      invoice: {
        userId: userId,
      },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return payments;
}

export async function updateInvoiceStatus(invoiceId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
  const now = new Date();
  const dueDate = new Date(invoice.date);
  dueDate.setDate(dueDate.getDate() + invoice.dueDate);
  const isOverdue = now > dueDate;

  let newStatus: InvoiceStatus;

  if (totalPaid >= invoice.total) {
    newStatus = "PAID";
  } else if (totalPaid > 0) {
    newStatus = "PARTIALLY_PAID";
  } else if (isOverdue) {
    newStatus = "OVERDUE";
  } else {
    newStatus = "PENDING";
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      totalPaid: totalPaid,
      status: newStatus,
    },
  });
}

export function calculateInvoiceStatus(
  total: number,
  totalPaid: number,
  date: Date,
  dueDate: number
): InvoiceStatus {
  if (totalPaid >= total) {
    return "PAID";
  } else if (totalPaid > 0) {
    return "PARTIALLY_PAID";
  }
  
  const now = new Date();
  const due = new Date(date);
  due.setDate(due.getDate() + dueDate);
  
  if (now > due) {
    return "OVERDUE";
  }
  
  return "PENDING";
}

export function getPaymentProgress(total: number, totalPaid: number): number {
  if (total === 0) return 0;
  return Math.min((totalPaid / total) * 100, 100);
}