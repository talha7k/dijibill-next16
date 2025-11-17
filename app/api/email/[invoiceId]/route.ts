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
      include: {
        invoiceItems: true,
        user: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get company settings for sender info
    const company = invoiceData.user?.company;
    const sender = {
      email: company?.email || invoiceData.fromEmail,
      name: company?.name || invoiceData.fromName,
    };

    const { formatCurrency } = await import("@/app/utils/formatCurrency");
    
    const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoiceId}`;
    
    const company = invoiceData.user?.company;
    
    // Use company info if available, otherwise fallback to invoice data
    const companyName = company?.name || invoiceData.fromName;
    const companyEmail = company?.email || invoiceData.fromEmail;
    const companyAddress = company?.address || invoiceData.fromAddress;
    const companyPhone = company?.phone;
    const companyWebsite = company?.website;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice #${invoiceData.invoiceNumber}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #374151;
        margin: 0;
        padding: 0;
        background-color: #f9fafb;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 5px 0 0 0;
        opacity: 0.9;
        font-size: 16px;
      }
      .content {
        padding: 40px 30px;
      }
      .invoice-details {
        background: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        border-left: 4px solid #3b82f6;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
      }
      .detail-row:last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 600;
        color: #6b7280;
      }
      .detail-value {
        font-weight: 700;
        color: #111827;
      }
      .total-amount {
        background: #3b82f6;
        color: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        margin: 25px 0;
      }
      .total-amount .amount {
        font-size: 32px;
        font-weight: 700;
        margin: 5px 0;
      }
      .button {
        display: inline-block;
        padding: 14px 28px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white !important;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
        transition: all 0.2s ease;
        box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
      }
      .button:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
      }
      .footer {
        background: #f8fafc;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }
      .footer p {
        margin: 5px 0;
        font-size: 14px;
        color: #6b7280;
      }
      .company-info {
        margin-top: 20px;
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Invoice</h1>
        <p>#${invoiceData.invoiceNumber}</p>
      </div>
      
      <div class="content">
        <p>Dear ${invoiceData.clientName},</p>
        
        <p>I hope this email finds you well. Please find your invoice details below for services provided.</p>
        
        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${invoiceData.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Issue Date:</span>
            <span class="detail-value">${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(invoiceData.date)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span class="detail-value">Net ${invoiceData.dueDate} days</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Items:</span>
            <span class="detail-value">${invoiceData.invoiceItems.length > 0 ? invoiceData.invoiceItems.length : 1} item(s)</span>
          </div>
        </div>
        
        <div class="total-amount">
          <div>Total Amount Due</div>
          <div class="amount">${formatCurrency({ amount: invoiceData.total, currency: invoiceData.currency as "USD" | "EUR" })}</div>
        </div>
        
        <p style="text-align: center;">
          <a href="${invoiceUrl}" class="button">View & Download Invoice</a>
        </p>
        
        ${invoiceData.note ? `
        <div class="company-info">
          <strong>Note:</strong><br>
          ${invoiceData.note}
        </div>
        ` : ''}
        
        <p>If you have any questions or need clarification on any items, please don't hesitate to contact us. We appreciate your prompt payment.</p>
        
        <p>Thank you for your business!</p>
        
        <div class="company-info">
          <strong>${companyName}</strong><br>
          ${companyEmail}<br>
          ${companyAddress}<br>
          ${companyPhone ? `Phone: ${companyPhone}<br>` : ''}
          ${companyWebsite ? `Website: <a href="${companyWebsite}" style="color: #3b82f6;">${companyWebsite}</a><br>` : ''}
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message from ${companyName || 'Invoice Platform'}</p>
        <p>© ${new Date().getFullYear()} ${companyName || 'Invoice Platform'}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
    `;

    emailClient.send({
      from: sender,
      to: [{ email: invoiceData.clientEmail }],
      subject: `Invoice #${invoiceData.invoiceNumber} from ${invoiceData.fromName}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}
