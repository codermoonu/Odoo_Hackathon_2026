import { Link } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import AppShell from "./AppShell";

function PlaceholderPage({ title, description }) {
  return (
    <AppShell title={title}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/12 text-violet-700">
          <Construction size={26} />
        </div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="max-w-sm text-sm text-text-dim">
          {description ||
            "This part of WAYFLOW is coming soon. We're focused on getting your core ride-sharing flow polished first."}
        </p>
        <Link
          to="/dashboard"
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}

export default PlaceholderPage;
