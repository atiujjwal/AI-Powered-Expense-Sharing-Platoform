"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Mail, Lock, User, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../../src/hooks/useAuth";
import Card from "../../../src/components/ui/Card";
import Input from "../../../src/components/ui/Input";
import Button from "../../../src/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.literal(true, {
    error: () => ({ message: "You must accept the terms" }),
  }),
});

type FormData = z.infer<typeof schema>;

function strength(pwd: string) {
  if (!pwd) return { label: "", score: 0 };
  if (pwd.length < 6) return { label: "Weak", score: 1 };
  if (pwd.length < 10) return { label: "Medium", score: 2 };
  return { label: "Strong", score: 3 };
}

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pwd = watch("password");
  const s = strength(pwd);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await registerUser(data.email, data.password, data.name); // TODO: backend register
      toast.success("Account created!");
      router.push("/dashboard");
    } catch {
      toast.error("Registration failed");
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
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-mono-200">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            <span>AI categorization</span>
          </div>
          <div className="flex items-center gap-3 text-mono-200">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            <span>Receipt OCR</span>
          </div>
          <div className="flex items-center gap-3 text-mono-200">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3" />
            </div>
            <span>Smart splits</span>
          </div>
        </div>
        <div className="text-mono-300 text-sm">© 2025 PayAId</div>
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

          <Card className="p-8" variant="elevated">
            <h1 className="text-2xl font-bold text-mono-900 mb-2">
              Create your account
            </h1>
            <p className="text-mono-600 mb-6">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-mono-900 font-medium underline"
              >
                Log in
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full name"
                placeholder="John Doe"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s.score >= i
                            ? s.score === 1
                              ? "bg-red-500"
                              : s.score === 2
                              ? "bg-amber-500"
                              : "bg-green-500"
                            : "bg-mono-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-mono-600">
                    Password strength: {s.label}
                  </p>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-mono-300"
                  {...register("terms")}
                />
                <span className="text-sm text-mono-600">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-mono-900 font-medium underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-mono-900 font-medium underline"
                  >
                    Privacy
                  </Link>
                  .
                </span>
              </label>

              {errors.terms && (
                <p className="text-sm text-red-500">{errors.terms.message}</p>
              )}
              <Button type="submit" fullWidth isLoading={isLoading}>
                Create account
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
