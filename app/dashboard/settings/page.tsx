import { CompanySettings } from "@/app/components/CompanySettings";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

async function getData(userId: string) {
  const data = await prisma.company.findUnique({
    where: {
      userId: userId,
    },
  });

  return data;
}

export default async function CompanySettingsPage() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);

  return <CompanySettings data={data} />;
}