import { Info } from 'lucide-react';
export function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="metric-box">
      <span>{label}</span>
      <strong>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
    </div>
  );
}
export function ToolHelp({ children }: { children: React.ReactNode }) {
  return (
    <div className="tool-help">
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}
