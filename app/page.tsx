import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
export default async function Home() {
  const user = await getSessionUser();
  redirect(!user ? "/login" : user.role === "doctor" ? "/doctor/dashboard" : "/hospital/dashboard");
}
