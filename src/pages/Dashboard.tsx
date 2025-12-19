import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  LogOut, 
  History, 
  Settings, 
  Scan,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Bell,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { VeritasToggle } from "@/components/VeritasToggle";
import { ContentCard } from "@/components/ContentCard";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import type { User, Session } from "@supabase/supabase-js";

interface ScanHistoryItem {
  id: string;
  content_type: string;
  username_scanned: string | null;
  platform: string | null;
  verification_status: string;
  alert_type: string | null;
  alert_message: string | null;
  confidence_score: number | null;
  deepfake_detected: boolean | null;
  credential_verified: boolean | null;
  scanned_at: string;
}

interface Profile {
  display_name: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(() => {
    // Initialize from localStorage - protection stays ON until user turns it OFF
    const saved = localStorage.getItem("veritas_protection_active");
    return saved === "true";
  });
  const [activeTab, setActiveTab] = useState<"scan" | "history" | "settings">("scan");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Hooks for admin role and notifications
  const { isAdmin } = useUserRole(user?.id);
  const { requestPermission } = useRealtimeNotifications(user?.id, notificationsEnabled && isActive);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        // Defer data fetching
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
    }

    // Fetch scan history
    const { data: historyData } = await supabase
      .from("scan_history")
      .select("*")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: false })
      .limit(50);
    
    if (historyData) {
      setScanHistory(historyData);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDeleteScan = async (scanId: string) => {
    const { error } = await supabase
      .from("scan_history")
      .delete()
      .eq("id", scanId);
    
    if (error) {
      toast.error("Failed to delete scan");
    } else {
      setScanHistory(scanHistory.filter(s => s.id !== scanId));
      toast.success("Scan deleted");
    }
  };

  const handleScanComplete = async (result: {
    username: string;
    contentType: string;
    verificationStatus: string;
    alertType?: string;
    alertMessage?: string;
    confidenceScore: number;
    deepfakeDetected: boolean;
    credentialVerified: boolean;
  }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("scan_history")
      .insert({
        user_id: user.id,
        username_scanned: result.username,
        content_type: result.contentType,
        verification_status: result.verificationStatus,
        alert_type: result.alertType || null,
        alert_message: result.alertMessage || null,
        confidence_score: result.confidenceScore,
        deepfake_detected: result.deepfakeDetected,
        credential_verified: result.credentialVerified,
      })
      .select()
      .single();

    if (!error && data) {
      setScanHistory([data, ...scanHistory]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Veritas</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification toggle */}
            <Button 
              variant={notificationsEnabled ? "default" : "ghost"} 
              size="icon"
              onClick={() => {
                if (!notificationsEnabled) {
                  requestPermission();
                }
                setNotificationsEnabled(!notificationsEnabled);
              }}
              title={notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}
            >
              <Bell className={`w-4 h-4 ${notificationsEnabled ? "" : "text-muted-foreground"}`} />
            </Button>

            {/* Admin link */}
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} title="Admin Dashboard">
                <ShieldAlert className="w-4 h-4 text-destructive" />
              </Button>
            )}

            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.display_name || user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="relative z-10 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("scan")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "scan"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Scan className="w-4 h-4 inline mr-2" />
              Scanner
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === "scan" && (
          <ScannerTab 
            isActive={isActive} 
            onToggle={() => {
              const newState = !isActive;
              setIsActive(newState);
              localStorage.setItem("veritas_protection_active", String(newState));
              toast.success(newState ? "Protection activated - continuous monitoring enabled" : "Protection disabled");
            }}
            onScanComplete={handleScanComplete}
          />
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Scan History</h2>
              <span className="text-sm text-muted-foreground">{scanHistory.length} scans</span>
            </div>

            {scanHistory.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scans yet. Start scanning to see your history.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(scan.verification_status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          @{scan.username_scanned || "Unknown"}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                          {scan.content_type}
                        </span>
                      </div>
                      {scan.alert_message && (
                        <p className="text-sm text-destructive truncate mt-1">{scan.alert_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.scanned_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {scan.confidence_score && (
                        <span className="text-sm font-mono text-muted-foreground">
                          {scan.confidence_score}%
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteScan(scan.id)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <SettingsTab />
        )}
      </main>
    </div>
  );
};

// Scanner Tab Component
interface ScannerTabProps {
  isActive: boolean;
  onToggle: () => void;
  onScanComplete: (result: any) => void;
}

const ScannerTab = ({ isActive, onToggle, onScanComplete }: ScannerTabProps) => {
  const [contentStatuses, setContentStatuses] = useState<Record<string, "pending" | "scanning" | "verified" | "alert" | "unverified">>({});

  const demoContent = [
    {
      id: "1",
      username: "lifestyle_vibes",
      bio: "Travel • Fashion • Daily inspiration ✨",
      contentType: "Instagram Post",
      profession: "unknown",
    },
    {
      id: "2",
      username: "crypto_guru_official",
      bio: "💰 Make $10k/day with my secret method",
      contentType: "YouTube Video",
      profession: "unknown",
    },
    {
      id: "3",
      username: "tech_reviews_daily",
      bio: "Honest tech reviews • 500K subscribers",
      contentType: "YouTube Video",
      profession: "unknown",
    },
    {
      id: "4",
      username: "celebrity_updates",
      bio: "Breaking celebrity news and gossip",
      contentType: "Instagram Reel",
      profession: "unknown",
    },
  ];

  const handleDwellComplete = async (content: typeof demoContent[0]) => {
    setContentStatuses(prev => ({ ...prev, [content.id]: "scanning" }));

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          username: content.username,
          bio: content.bio,
          contentType: content.contentType,
          platform: "Demo",
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      
      setContentStatuses(prev => ({ 
        ...prev, 
        [content.id]: result.verificationStatus 
      }));

      // Save to history
      onScanComplete({
        username: content.username,
        contentType: content.contentType,
        verificationStatus: result.verificationStatus,
        alertType: result.alertType,
        alertMessage: result.alertMessage,
        confidenceScore: result.confidenceScore,
        deepfakeDetected: result.deepfakeDetected,
        credentialVerified: result.credentialVerified,
      });

    } catch (error) {
      console.error("Analysis error:", error);
      setContentStatuses(prev => ({ ...prev, [content.id]: "unverified" }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex flex-col items-center gap-4">
        <VeritasToggle isActive={isActive} onToggle={onToggle} />
        <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
          {isActive ? "Protection Active - Hover for 3s to scan" : "Protection Off"}
        </p>
      </div>

      {/* Demo content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoContent.map((content) => (
          <ContentCard
            key={content.id}
            username={content.username}
            bio={content.bio}
            contentType={content.contentType}
            profession={content.profession}
            status={contentStatuses[content.id] || "pending"}
            isMonitoring={isActive}
            onDwellComplete={() => handleDwellComplete(content)}
          />
        ))}
      </div>
    </div>
  );
};

// Settings Tab Component  
const SettingsTab = () => {
  const [preferences, setPreferences] = useState({
    autoScan: true,
    dwellTime: 3,
    alertSound: true,
  });

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Auto-scan enabled</p>
            <p className="text-sm text-muted-foreground">Automatically analyze all content</p>
          </div>
          <button
            onClick={() => setPreferences(p => ({ ...p, autoScan: !p.autoScan }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              preferences.autoScan ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
              preferences.autoScan ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Alert sounds</p>
            <p className="text-sm text-muted-foreground">Play sound when fake content detected</p>
          </div>
          <button
            onClick={() => setPreferences(p => ({ ...p, alertSound: !p.alertSound }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              preferences.alertSound ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${
              preferences.alertSound ? "translate-x-6" : "translate-x-0.5"
            }`} />
          </button>
        </div>

        <div>
          <p className="font-medium text-foreground mb-2">Dwell time: {preferences.dwellTime}s</p>
          <p className="text-sm text-muted-foreground mb-3">Time to wait before analyzing content</p>
          <input
            type="range"
            min={1}
            max={10}
            value={preferences.dwellTime}
            onChange={(e) => setPreferences(p => ({ ...p, dwellTime: Number(e.target.value) }))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="font-medium text-foreground mb-2">Universal Analysis</p>
        <p className="text-sm text-muted-foreground">
          Veritas analyzes ALL content types including Instagram posts, YouTube videos, 
          reels, and stories. No content is filtered - everything gets checked for:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Fake accounts & impersonation</li>
          <li>• AI-generated/deepfake content</li>
          <li>• Misleading claims & misinformation</li>
          <li>• Unverified credentials</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
