import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  User, 
  Eye,
  Bot,
  Stethoscope,
  Scale,
  Landmark,
  TrendingUp
} from "lucide-react";

type VerificationStatus = "pending" | "scanning" | "verified" | "alert" | "unverified";

interface ContentCardProps {
  username: string;
  bio: string;
  contentType: string;
  profession?: string;
  imageUrl?: string;
  status?: VerificationStatus;
  alertMessage?: string;
  isMonitoring: boolean;
  onDwellComplete?: () => void;
}

const professionIcons: Record<string, React.ReactNode> = {
  doctor: <Stethoscope className="w-4 h-4" />,
  lawyer: <Scale className="w-4 h-4" />,
  politician: <Landmark className="w-4 h-4" />,
  influencer: <TrendingUp className="w-4 h-4" />,
  unknown: <User className="w-4 h-4" />,
};

export const ContentCard = ({
  username,
  bio,
  contentType,
  profession = "unknown",
  imageUrl,
  status = "pending",
  alertMessage,
  isMonitoring,
  onDwellComplete,
}: ContentCardProps) => {
  const [dwellTime, setDwellTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovering && isMonitoring && status === "pending") {
      intervalRef.current = setInterval(() => {
        setDwellTime((prev) => {
          if (prev >= 3) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onDwellComplete?.();
            return prev;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!isHovering) setDwellTime(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovering, isMonitoring, status, onDwellComplete]);

  const getStatusColor = () => {
    switch (status) {
      case "verified":
        return "border-success/50";
      case "alert":
        return "border-destructive";
      case "scanning":
        return "border-primary";
      default:
        return "border-border";
    }
  };

  return (
    <div
      className={cn(
        "relative glass rounded-2xl overflow-hidden transition-all duration-500",
        status === "alert" && "alert-border",
        getStatusColor()
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
    >
      {/* Scan line overlay when scanning */}
      {status === "scanning" && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="scan-line absolute inset-0 h-full" />
        </div>
      )}

      {/* Content preview */}
      <div className="relative aspect-video bg-secondary">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bot className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Dwell progress bar */}
        {isMonitoring && status === "pending" && dwellTime > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${(dwellTime / 3) * 100}%` }}
            />
          </div>
        )}

        {/* Content type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur rounded-full text-muted-foreground">
            {contentType}
          </span>
        </div>

        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          {status === "verified" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-success/20 backdrop-blur rounded-full">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-success">Verified</span>
            </div>
          )}
          {status === "alert" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-destructive/20 backdrop-blur rounded-full animate-pulse">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Alert</span>
            </div>
          )}
          {status === "scanning" && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 backdrop-blur rounded-full">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-medium text-primary">Scanning</span>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            {professionIcons[profession] || <User className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">@{username}</h3>
            <p className="text-xs text-muted-foreground truncate">{bio}</p>
          </div>
        </div>

        {/* Alert message */}
        {status === "alert" && alertMessage && (
          <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{alertMessage}</p>
            </div>
          </div>
        )}

        {/* Verification details */}
        {status === "verified" && (
          <div className="mt-3 p-3 bg-success/10 rounded-lg border border-success/30">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-success">Credentials verified via official registry</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
