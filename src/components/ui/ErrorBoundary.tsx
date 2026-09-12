import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fffdf5] text-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-slate-950 p-6 rounded-3xl shadow-[6px_6px_0px_0px_#0f172a] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-300 border-3 border-slate-950 flex items-center justify-center shadow-[3px_3px_0px_0px_#0f172a]">
              <AlertTriangle size={32} className="text-slate-950" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              Terjadi Kendala Memuat Halaman
            </h2>
            <p className="text-xs font-bold text-slate-600">
              {this.state.error?.message || 'Aplikasi mengalami kendala saat render pada peramban ini.'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-[#ffe600] hover:bg-yellow-400 text-slate-950 border-3 border-slate-950 font-black text-sm shadow-[3px_3px_0px_0px_#0f172a] flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <RefreshCw size={16} />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
