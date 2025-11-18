"use server";

import { requireUser } from "../utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { paymentSchema } from "../utils/zodSchemas";
import prisma from "../utils/db";
import { revalidatePath } from "next/cache";

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
    where: { id: invoiceId, userId: session.user?.id as string },
  });

  if (!invoice) {
    return submission.reply({
      formErrors: ["Invoice not found"]
    });
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
  return submission.reply();
}