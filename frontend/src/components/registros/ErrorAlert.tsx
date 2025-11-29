import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4" />
      <span>{error}</span>
      <button className="ml-auto text-xs font-semibold" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}