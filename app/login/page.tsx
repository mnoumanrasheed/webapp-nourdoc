import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginView } from "@/components/login-view";
export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "doctor" ? "/doctor/dashboard" : "/hospital/dashboard");
  return <LoginView enabled={process.env.DEMO_MODE === "true"} />;
}
