import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-white rounded-2xl border border-rose-200/90 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 mb-3.5">
        <WifiOff className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">Backend Connection Error</h3>
      <div className="mt-2 p-3 bg-rose-50/50 rounded-lg border border-rose-100 text-xs text-rose-800 flex items-center gap-2 justify-center">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
        <span className="font-mono">{message}</span>
      </div>
      <p className="mt-3 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        Unable to communicate with the REST API. Ensure the backend server and MongoDB instance are running.
      </p>
      <div className="mt-5">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
};
