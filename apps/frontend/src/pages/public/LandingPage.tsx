import React from "react";
import { Link } from "react-router-dom";
import {
  NeuButton,
  NeuCard,
  NeuBadge,
} from "../../components/neu";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      {/* Navigation Navbar */}
      <nav className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-12 bg-[var(--bg)] border-b border-[var(--input-border)]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--neu-raised-sm)] flex items-center justify-center font-bold font-mono text-base">
            R
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text)]">
            Resolve<span className="text-[var(--accent)]">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/login">
            <NeuButton variant="ghost" size="sm">
              Sign In
            </NeuButton>
          </Link>
          <Link to="/register">
            <NeuButton variant="primary" size="sm">
              Get Started
            </NeuButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 sm:py-20 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/60 text-xs font-semibold text-[var(--accent)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Resolution Copilot</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[var(--text)] leading-tight">
            Fair, swift issue resolutions for modern e-commerce.
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            ResolveAI combines Groq-powered reasoning with human agent decisions to diagnose damaged orders,
            orchestrate fair warranties, and provide transparent step-by-step resolution tracking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <NeuButton variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Create Account
              </NeuButton>
            </Link>
            <Link to="/login">
              <NeuButton variant="secondary" size="lg">
                Sign In
              </NeuButton>
            </Link>
          </div>
        </div>

        {/* Example Case Card (Real case mock, no invented statistics) */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Example Case Preview
            </span>
          </div>

          <NeuCard depth="raised-lg" padding="md">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--input-border)]/40">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-[var(--accent)]">RF-4821</span>
                <span className="text-xs text-[var(--text-muted)]">· Damaged in transit</span>
              </div>
              <NeuBadge tone="info">Being reviewed</NeuBadge>
            </div>

            <div className="py-4 space-y-3">
              <h2 className="text-base font-semibold text-[var(--text)]">
                Laptop display screen damaged upon arrival
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Order ORD-9021 · High value review active · 2 photos verified by system
              </p>

              {/* Your Next Step Box */}
              <div className="p-3.5 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50 mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] block">
                  Your Next Step
                </span>
                <p className="text-xs text-[var(--text)] mt-1">
                  Our support team has verified your transit damage photos. A prepaid return label has been authorized.
                </p>
              </div>

              {/* Mini timeline */}
              <div className="pt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>Report received with 2 evidence photos</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text)] font-medium">
                  <Clock className="w-4 h-4 text-[var(--accent)]" />
                  <span>Assigned to specialist agent for replacement authorization</span>
                </div>
              </div>
            </div>
          </NeuCard>
        </div>

        {/* 3-Step How It Works */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--text)]">How ResolveAI Works</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Transparent, verifiable steps from report to resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeuCard depth="raised" padding="md">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] flex items-center justify-center font-bold font-mono text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Customer Reports</h3>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Select your order, describe the issue, and securely attach photographic proof via our encrypted evidence bucket.
              </p>
            </NeuCard>

            <NeuCard depth="raised" padding="md">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] flex items-center justify-center font-bold font-mono text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">AI Diagnostic Brief</h3>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Groq LLaMA models review customer history, detect SLA risks or escalation triggers, and propose policy-backed actions.
              </p>
            </NeuCard>

            <NeuCard depth="raised" padding="md">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] flex items-center justify-center font-bold font-mono text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Agent Final Decision</h3>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Human agents retain complete control: approve suggested replies, record reasoned overrides, or commit timebound promises.
              </p>
            </NeuCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--input-border)]/40 py-8 px-6 sm:px-12 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text)]">ResolveAI</span>
            <span>· Enterprise Resolution Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-[var(--text)]">Sign In</Link>
            <Link to="/register" className="hover:text-[var(--text)]">Register</Link>
            <Link to="/__styleguide" className="hover:text-[var(--accent)] font-mono text-[11px]">/__styleguide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
