import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;

  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      invoiceItems: true,
      User: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add company logo if available
  const company = data.User?.company;
  try {
    let logoData;
    if (company?.logo) {
      // Use company logo URL if available
      const response = await fetch(company.logo);
      logoData = Buffer.from(await response.arrayBuffer()).toString('base64');
    } else {
      // Fallback to default logo
      const logoPath = path.join(process.cwd(), "public", "logo.svg");
      logoData = await readFile(logoPath, "base64");
    }
    
    // Add logo to the header (positioned on the right side)
    pdf.addImage(logoData, "SVG", 150, 10, 40, 20);
  } catch {
    // Logo not found, continue without it
    console.warn("Logo not found, proceeding without logo");
  }

  // Header section with background
  pdf.setFillColor(59, 130, 246); // Blue
  pdf.rect(0, 0, 210, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("INVOICE", 20, 25);
  
  pdf.setFontSize(16);
  pdf.text(`#${data.invoiceNumber}`, 20, 35);

  // Invoice details in header
  pdf.setFontSize(10);
  pdf.text(`Date: ${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(data.date)}`, 120, 20);
  pdf.text(`Due: Net ${data.dueDate} days`, 120, 30);

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // From Section with styling
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("FROM", 20, 55);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  
  // Use company info if available, otherwise fallback to invoice data
  const fromName = company?.name || data.fromName;
  const fromEmail = company?.email || data.fromEmail;
  const fromAddress = company?.address || data.fromAddress;
  
  const fromLines = pdf.splitTextToSize(fromName, 80);
  pdf.text(fromLines, 20, 62);
  
  const fromEmailLines = pdf.splitTextToSize(fromEmail, 80);
  pdf.text(fromEmailLines, 20, 68);
  
  const fromAddressLines = pdf.splitTextToSize(fromAddress, 80);
  pdf.text(fromAddressLines, 20, 74);

  // Client Section with styling
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text("BILL TO", 110, 55);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  const clientLines = pdf.splitTextToSize(data.clientName, 80);
  pdf.text(clientLines, 110, 62);
  
  const clientEmailLines = pdf.splitTextToSize(data.clientEmail, 80);
  pdf.text(clientEmailLines, 110, 68);
  
  const clientAddressLines = pdf.splitTextToSize(data.clientAddress, 80);
  pdf.text(clientAddressLines, 110, 74);

  // Table header with background
  const tableStartY = 90;
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, tableStartY - 5, 170, 10, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("DESCRIPTION", 25, tableStartY);
  pdf.text("QTY", 120, tableStartY);
  pdf.text("RATE", 140, tableStartY);
  pdf.text("TOTAL", 170, tableStartY, { align: "right" });

  // Table content
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(75, 85, 99);
  pdf.setFontSize(9);
  
  let currentY = tableStartY + 10;
  
  // Use invoice items
  const items = data.invoiceItems;
  
  items.forEach((item) => {
    const descriptionLines = pdf.splitTextToSize(item.description, 85);
    pdf.text(descriptionLines, 25, currentY);
    
    pdf.text(item.quantity.toString(), 120, currentY);
    pdf.text(
      formatCurrency({
        amount: item.rate,
        currency: data.currency as "USD" | "EUR",
      }),
      140,
      currentY
    );
    pdf.text(
      formatCurrency({ 
        amount: item.quantity * item.rate, 
        currency: data.currency as "USD" | "EUR" 
      }),
      170,
      currentY,
      { align: "right" }
    );
    
    currentY += 15;
  });

  // Table border
  const tableHeight = currentY - tableStartY + 5;
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(20, tableStartY - 5, 170, tableHeight);

  // Total section with styling
  const totalY = currentY + 10;
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.5);
  pdf.line(20, totalY, 190, totalY);
  
  // Subtotal and Total
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Subtotal:", 140, totalY + 10);
  pdf.text(
    formatCurrency({ amount: data.total, currency: data.currency as "USD" | "EUR" }),
    190,
    totalY + 10,
    { align: "right" }
  );
  
  // Total with background
  pdf.setFillColor(59, 130, 246);
  pdf.rect(130, totalY + 15, 60, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(`TOTAL (${data.currency})`, 135, totalY + 23);
  pdf.text(
    formatCurrency({ amount: data.total, currency: data.currency as "USD" | "EUR" }),
    190,
    totalY + 23,
    { align: "right" }
  );

  // Note section
  if (data.note) {
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("NOTES", 20, totalY + 45);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(75, 85, 99);
    const noteLines = pdf.splitTextToSize(data.note, 170);
    pdf.text(noteLines, 20, totalY + 52);
  }

  // Footer
  const footerY = 280;
  pdf.setTextColor(150, 150, 150);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.text("Thank you for your business!", 105, footerY, { align: "center" });
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, footerY + 5, { align: "center" });

  // generate pdf as buffer
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  //return pdf as download

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
