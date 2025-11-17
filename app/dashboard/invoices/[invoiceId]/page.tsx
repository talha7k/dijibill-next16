import { EditInvoice } from "@/app/components/EditInvoice";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { notFound } from "next/navigation";
import { getPaymentHistory } from "@/app/utils/payments";

async function getData(invoiceId: string, userId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
      userId: userId,
    },
  });

  if (!invoice) {
    return notFound();
  }

  const payments = await getPaymentHistory(invoiceId, userId);

  return {
    ...invoice,
    payments,
  };
}

type Params = Promise<{ invoiceId: string }>;

export default async function EditInvoiceRoute({ params }: { params: Params }) {
  const { invoiceId } = await params;
  const session = await requireUser();
  const data = await getData(invoiceId, session.user?.id as string);

  return <EditInvoice data={data} />;
}
