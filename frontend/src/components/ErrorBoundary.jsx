import { Component } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

// Without this, an uncaught error anywhere in the tree (e.g. a bad map
// marker position) unmounts the whole app to a blank white screen.
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/12 text-red-700">
          <AlertTriangle size={26} />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">Something went wrong</h1>
          <p className="mt-1.5 max-w-sm text-sm text-text-dim">
            This page hit an unexpected error. Reloading usually fixes it.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
        >
          <RefreshCw size={16} />
          Reload
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
