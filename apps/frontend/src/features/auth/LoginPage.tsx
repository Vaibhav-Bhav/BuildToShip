import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginBody } from "@workspace/api-zod";
import { useLogin, type User } from "@workspace/api-client-react";
import { useAuth } from "./useAuth";
import { NeuCard, NeuInput, NeuButton, useToast } from "../../components/neu";
import { Lock, Mail, ShieldAlert } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSubmit = (formData: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate(
      { data: formData },
      {
        onSuccess: (res: { token: string; user: User }) => {
          login(res.token, res.user);
          toast(`Welcome back, ${res.user.name}!`, "success");
          const from = searchParams.get("from");
          if (from) {
            navigate(from, { replace: true });
          } else if (res.user.role === "agent") {
            navigate("/agent/dashboard", { replace: true });
          } else {
            navigate("/customer/cases", { replace: true });
          }
        },
        onError: (err: any) => {
          const msg = err?.data?.error || err?.message || "Invalid credentials";
          setServerError(msg);
        },
      }
    );
  };

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <main role="main" className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-[14px] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--neu-raised-sm)] flex items-center justify-center font-bold font-mono text-base">
              R
            </div>
            <span className="font-bold text-2xl tracking-tight text-[var(--text)]">
              Resolve<span className="text-[var(--accent)]">AI</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--text)]">Sign in to your account</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Access your resolution dashboard and active customer cases.
          </p>
        </div>

        <NeuCard depth="raised" padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-[12px] bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-xs text-[var(--danger)] font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <NeuInput
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="e.g. agent@demo.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <NeuInput
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <NeuButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              loading={loginMutation.isPending}
            >
              Sign In
            </NeuButton>
          </form>

          {/* Demo Accounts Inset Helper Box */}
          <div className="mt-6 p-4 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
              Demo Credentials (Password: password123)
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo("agent@demo.com")}
                className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-[8px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--accent)] cursor-pointer"
              >
                agent@demo.com
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer1@demo.com")}
                className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-[8px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--text)] cursor-pointer"
              >
                customer1@demo.com
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer2@demo.com")}
                className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-[8px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--text)] cursor-pointer"
              >
                customer2@demo.com
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">
              Create an account
            </Link>
          </div>
        </NeuCard>
      </div>
    </main>
  );
}
