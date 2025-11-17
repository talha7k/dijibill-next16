import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { formatCurrency } from "../utils/formatCurrency";

async function getData(userId: string) {
  const [invoices, pendingInvoices, paidInvoices, partiallyPaidInvoices, overdueInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        userId: userId,
      },
      select: {
        total: true,
        totalPaid: true,
        currency: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
      select: {
        id: true,
        total: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "PAID",
      },
      select: {
        id: true,
        total: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "PARTIALLY_PAID",
      },
      select: {
        id: true,
        total: true,
        totalPaid: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        userId: userId,
        status: "OVERDUE",
      },
      select: {
        id: true,
        total: true,
      },
    }),
  ]);

  const totalRevenue = invoices.reduce((acc, invoice) => acc + (invoice.totalPaid || 0), 0);
  const totalOutstanding = pendingInvoices.reduce((acc, invoice) => acc + invoice.total, 0) +
                          partiallyPaidInvoices.reduce((acc, invoice) => acc + (invoice.total - (invoice.totalPaid || 0)), 0) +
                          overdueInvoices.reduce((acc, invoice) => acc + invoice.total, 0);

  return {
    invoices,
    pendingInvoices,
    paidInvoices,
    partiallyPaidInvoices,
    overdueInvoices,
    totalRevenue,
    totalOutstanding,
  };
}

export async function DashboardBlocks() {
  const session = await requireUser();
  const {
    pendingInvoices,
    paidInvoices,
    partiallyPaidInvoices,
    overdueInvoices,
    totalRevenue,
    totalOutstanding
  } = await getData(session.user?.id as string);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">
            {formatCurrency({
              amount: totalRevenue,
              currency: "USD",
            })}
          </h2>
          <p className="text-xs text-muted-foreground">Total revenue collected</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Outstanding Amount
          </CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">
            {formatCurrency({
              amount: totalOutstanding,
              currency: "USD",
            })}
          </h2>
          <p className="text-xs text-muted-foreground">Total amount pending</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          <CreditCard className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{paidInvoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Total invoices paid!
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Invoices
          </CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-bold">+{pendingInvoices.length + partiallyPaidInvoices.length + overdueInvoices.length}</h2>
          <p className="text-xs text-muted-foreground">
            Invoices awaiting payment!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
