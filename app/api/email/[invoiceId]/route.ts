import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const sender = {
      email: process.env.SENDER_EMAIL!,
      name: process.env.SENDER_NAME!,
    };

    emailClient.send({
      from: sender,
      to: [{ email: invoiceData.clientEmail }],
      template_uuid: "03c0c5ec-3f09-42ab-92c3-9f338f31fe2c",
      template_variables: {
        first_name: invoiceData.clientName,
        company_info_name: process.env.COMPANY_NAME!,
        company_info_address: "Chad street 124",
        company_info_city: "Munich",
        company_info_zip_code: "345345",
        company_info_country: "Germany",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}
