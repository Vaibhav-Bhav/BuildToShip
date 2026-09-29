import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterBody } from "@workspace/api-zod";
import { useRegister, type User } from "@workspace/api-client-react";
import { useAuth } from "./useAuth";
import { NeuCard, NeuInput, NeuButton, useToast } from "../../components/neu";
import { User as UserIcon, Mail, Lock, ShieldAlert } from "lucide-react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterBody),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useRegister();

  const onSubmit = (formData: RegisterFormData) => {
    setServerError(null);
    registerMutation.mutate(
      { data: formData },
      {
        onSuccess: (res: { token: string; user: User }) => {
          login(res.token, res.user);
          toast(`Account created! Welcome, ${res.user.name}.`, "success");
          navigate("/customer/cases", { replace: true });
        },
        onError: (err: any) => {
          const msg = err?.data?.error || err?.message || "Registration failed";
          setServerError(msg);
        },
      }
    );
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
          <h1 className="text-xl font-bold text-[var(--text)]">Create a customer account</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Track your orders, report product defects, and receive fast resolutions.
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
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Jane Doe"
              icon={<UserIcon className="w-4 h-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <NeuInput
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="e.g. jane@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <NeuInput
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              helperText="Must be at least 8 characters long"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <NeuButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3"
              loading={registerMutation.isPending}
            >
              Create Account
            </NeuButton>
          </form>

          <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </div>
        </NeuCard>
      </div>
    </main>
  );
}
