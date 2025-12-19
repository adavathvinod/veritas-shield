import { Eye, Clock, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Eye,
    title: "Screen Monitoring",
    description: "Veritas monitors content as you scroll through social media",
  },
  {
    icon: Clock,
    title: "3-Second Trigger",
    description: "Analysis activates when you view content for more than 3 seconds",
  },
  {
    icon: Search,
    title: "Verification Engine",
    description: "OCR extraction, credential verification, and deepfake detection",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Silent for verified content, alerts only when something's wrong",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">How It Works</h2>
        <p className="text-muted-foreground">Four simple steps to truth</p>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent hidden md:block" />

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <step.icon className="w-7 h-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
