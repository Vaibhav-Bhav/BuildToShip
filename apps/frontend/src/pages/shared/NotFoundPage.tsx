import React from "react";
import { Link } from "react-router-dom";
import { NeuButton, NeuCard } from "../../components/neu";
import { Home, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full">
        <NeuCard depth="raised-lg" padding="lg">
          <div className="w-14 h-14 rounded-full bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <span className="font-mono text-4xl font-bold text-[var(--accent)] block">
            404
          </span>
          <h1 className="text-xl font-bold text-[var(--text)] mt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
            The page or case view you requested does not exist or has been relocated.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/">
              <NeuButton variant="primary" icon={<Home className="w-4 h-4" />}>
                Return to Home
              </NeuButton>
            </Link>
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
