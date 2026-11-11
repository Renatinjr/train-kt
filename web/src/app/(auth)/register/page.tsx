import { registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up" };

export default function RegisterPage() {
  return <AuthForm mode="register" action={registerAction} />;
}
