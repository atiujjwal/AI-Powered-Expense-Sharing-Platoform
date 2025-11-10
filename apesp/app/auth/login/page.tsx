"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Wallet, Mail, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../../src/hooks/useAuth";
import Card, { CardContent } from "../../../src/components/ui/Card";
import Input from "../../../src/components/ui/Input";
import Button from "../../../src/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password); // TODO: backend auth
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mono-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-mono-900 to-mono-700 p-12 flex-col justify-between text-white">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to home</span>
        </Link>
        <div>
          <Wallet className="w-16 h-16 mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Welcome back</h2>
          <p className="text-mono-300 text-lg">
            Continue paying your share smAIrtly with AI assistance.
          </p>
        </div>
        <div className="text-mono-300 text-sm">© 2025 PayAid</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-mono-600 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-8 h-8 text-mono-900" />
              <span className="text-2xl font-semibold text-mono-900">
                PayAId
              </span>
            </div>
          </div>

          <Card variant="elevated" className="p-8">
            <h1 className="text-2xl font-bold text-mono-900 mb-2">Sign in</h1>
            <p className="text-mono-600 mb-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-mono-900 font-medium underline"
              >
                Sign up
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={errors.email?.message}
                leftIcon={<Mail className="w-4 h-4" />}
                {...register("email")}
              />
              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                leftIcon={<Lock className="w-4 h-4" />}
                {...register("password")}
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-mono-300" />
                  <span className="text-mono-600">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-mono-900 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign in
              </Button>
            </form>

            <CardContent className="mt-6 pt-6 border-t border-mono-200">
              <p className="text-xs text-mono-500 text-center">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
