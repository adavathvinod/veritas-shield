import { 
  Shield, 
  Fingerprint, 
  Brain, 
  FileSearch, 
  AlertTriangle,
  ChevronDown,
  Zap,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { StatsDisplay } from "@/components/StatsDisplay";
import { DemoSection } from "@/components/DemoSection";
import { HowItWorks } from "@/components/HowItWorks";
import { TechStack } from "@/components/TechStack";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        
        <div className="relative container mx-auto px-4 pt-12 pb-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8 opacity-0 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center glow-primary">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Veritas</span>
          </div>

          {/* Hero text */}
          <div className="text-center max-w-lg mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <span className="text-gradient">Truth Layer</span>
              <br />
              <span className="text-foreground">for Social Media</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Real-time verification of credentials, deepfake detection, and fact-checking while you scroll.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Button variant="hero" size="lg">
                <Zap className="w-5 h-5 mr-2" />
                Get Early Access
              </Button>
              <Button variant="glass" size="lg">
                Learn More
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <StatsDisplay />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4">
        {/* Features */}
        <section className="py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">Core Features</h2>
            <p className="text-muted-foreground">Comprehensive protection for the digital age</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={Fingerprint}
              title="Credential Verification"
              description="Cross-reference usernames and bios against official medical, legal, and government registries worldwide."
              delay={100}
            />
            <FeatureCard
              icon={Brain}
              title="Deepfake Detection"
              description="Vision Transformers analyze synthetic media artifacts to detect AI-generated faces, voices, and manipulated content."
              delay={200}
            />
            <FeatureCard
              icon={FileSearch}
              title="Fact Checking"
              description="Audio-to-text conversion with live database verification for real-time incident verification."
              delay={300}
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Smart Alerts"
              description="Silent for verified content. Red-border overlay with specific warnings only when something's wrong."
              delay={400}
            />
          </div>
        </section>

        {/* How it works */}
        <HowItWorks />

        {/* Demo Section */}
        <DemoSection />

        {/* Tech Stack */}
        <TechStack />

        {/* Privacy section */}
        <section className="py-12">
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Privacy First</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• <strong className="text-foreground">On-device processing</strong> for sensitive data analysis</p>
              <p>• <strong className="text-foreground">End-to-end encryption</strong> for all API communications</p>
              <p>• <strong className="text-foreground">No data storage</strong> — content analyzed is never saved</p>
              <p>• <strong className="text-foreground">Transparent algorithms</strong> with explainable AI decisions</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 text-center">
          <div className="max-w-md mx-auto">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4 float" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Join the Truth Movement</h2>
            <p className="text-muted-foreground mb-6">
              Be among the first to experience the future of content verification.
            </p>
            <Button variant="hero" size="xl" className="w-full">
              Request Early Access
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Available for iOS and Android • Coming Q1 2025
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Veritas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Veritas. Protecting truth in the digital age.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
