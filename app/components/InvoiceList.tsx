import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceActions } from "./InvoiceActions";
import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { Progress } from "@/components/ui/progress";
import { getPaymentProgress } from "../utils/payments";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      clientName: true,
      total: true,
      totalPaid: true,
      createdAt: true,
      status: true,
      invoiceNumber: true,
      currency: true,
      date: true,
      dueDate: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}
export async function InvoiceList() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500";
      case "PARTIALLY_PAID":
        return "bg-yellow-500";
      case "OVERDUE":
        return "bg-red-500";
      case "EMAILED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PARTIALLY_PAID":
        return "Partially Paid";
      case "OVERDUE":
        return "Overdue";
      case "EMAILED":
        return "Emailed";
      default:
        return "Pending";
    }
  };

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to get started"
          buttontext="Create invoice"
          href="/dashboard/invoices/create"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invoice) => {
              const progressPercentage = getPaymentProgress(
                invoice.total,
                invoice.totalPaid || 0
              );
              
              return (
                <TableRow key={invoice.id}>
                  <TableCell>#{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>
                    {formatCurrency({
                      amount: invoice.total,
                      currency: invoice.currency as "USD" | "EUR",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{formatCurrency({
                          amount: invoice.totalPaid || 0,
                          currency: invoice.currency as "USD" | "EUR",
                        })}</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2 w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(invoice.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <InvoiceActions status={invoice.status} id={invoice.id} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
}
