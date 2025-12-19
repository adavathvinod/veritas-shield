import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VeritasToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export const VeritasToggle = ({ isActive, onToggle }: VeritasToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-20 h-20 rounded-full transition-all duration-500 flex items-center justify-center",
        isActive
          ? "bg-gradient-to-br from-primary to-emerald-500 glow-primary"
          : "bg-secondary border-2 border-border"
      )}
    >
      {/* Pulse rings when active */}
      {isActive && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/30 pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      
      {/* Icon */}
      <div className={cn(
        "relative z-10 transition-transform duration-300",
        isActive ? "scale-110" : "scale-100"
      )}>
        {isActive ? (
          <ShieldCheck className="w-10 h-10 text-primary-foreground" />
        ) : (
          <ShieldOff className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
    </button>
  );
};
