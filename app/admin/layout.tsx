import { redirect } from "next/navigation";
import { getSessionUser } from "@/shared/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/");
  }
  return <>{children}</>;
}
