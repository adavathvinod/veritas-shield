import { useState, useCallback } from "react";
import { VeritasToggle } from "./VeritasToggle";
import { ContentCard } from "./ContentCard";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

type VerificationStatus = "pending" | "scanning" | "verified" | "alert" | "unverified";

interface DemoContent {
  id: string;
  username: string;
  bio: string;
  contentType: string;
  profession: string;
  imageUrl?: string;
  expectedStatus: "verified" | "alert";
  alertMessage?: string;
}

const demoContent: DemoContent[] = [
  {
    id: "1",
    username: "lifestyle_vibes",
    bio: "Travel • Fashion • Daily inspiration ✨",
    contentType: "Instagram Post",
    profession: "unknown",
    expectedStatus: "verified",
  },
  {
    id: "2",
    username: "crypto_guru_official",
    bio: "💰 Make $10k/day with my secret method",
    contentType: "YouTube Video",
    profession: "unknown",
    expectedStatus: "alert",
    alertMessage: "Scam Warning: Account promotes unrealistic financial claims. Multiple user reports of fraud.",
  },
  {
    id: "3",
    username: "celebrity_updates",
    bio: "Breaking celebrity news and gossip",
    contentType: "Instagram Reel",
    profession: "unknown",
    expectedStatus: "alert",
    alertMessage: "Deepfake Detected: AI-generated video manipulation detected. This content appears to be synthetically created.",
  },
  {
    id: "4",
    username: "tech_reviews_daily",
    bio: "Honest tech reviews • 500K subscribers",
    contentType: "YouTube Video",
    profession: "unknown",
    expectedStatus: "verified",
  },
];

export const DemoSection = () => {
  const [isActive, setIsActive] = useState(false);
  const [contentStatuses, setContentStatuses] = useState<Record<string, VerificationStatus>>({});

  const handleToggle = () => {
    setIsActive(!isActive);
    if (isActive) {
      // Reset all statuses when turning off
      setContentStatuses({});
    }
  };

  const handleDwellComplete = useCallback((id: string, expectedStatus: "verified" | "alert") => {
    // Set to scanning first
    setContentStatuses(prev => ({ ...prev, [id]: "scanning" }));
    
    // After 2 seconds, show result
    setTimeout(() => {
      setContentStatuses(prev => ({ ...prev, [id]: expectedStatus }));
    }, 2000);
  }, []);

  const handleReset = () => {
    setContentStatuses({});
  };

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Try the Demo</h2>
        <p className="text-muted-foreground">Toggle Veritas on, then hover over content for 3+ seconds</p>
      </div>

      {/* Toggle control */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <VeritasToggle isActive={isActive} onToggle={handleToggle} />
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            {isActive ? "Protection Active" : "Protection Off"}
          </span>
          {Object.keys(contentStatuses).length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoContent.map((content) => (
          <ContentCard
            key={content.id}
            username={content.username}
            bio={content.bio}
            contentType={content.contentType}
            profession={content.profession}
            status={contentStatuses[content.id] || "pending"}
            alertMessage={content.alertMessage}
            isMonitoring={isActive}
            onDwellComplete={() => handleDwellComplete(content.id, content.expectedStatus)}
          />
        ))}
      </div>
    </section>
  );
};
