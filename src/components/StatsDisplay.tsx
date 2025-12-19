import { cn } from "@/lib/utils";

interface StatProps {
  value: string;
  label: string;
  delay?: number;
}

const Stat = ({ value, label, delay = 0 }: StatProps) => (
  <div 
    className="text-center opacity-0 animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-3xl font-bold text-gradient mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export const StatsDisplay = () => {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat value="2.3M" label="Scans Today" delay={100} />
        <Stat value="847K" label="Alerts Sent" delay={200} />
        <Stat value="99.7%" label="Accuracy" delay={300} />
      </div>
    </div>
  );
};
