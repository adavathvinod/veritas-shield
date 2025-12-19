import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Database,
  BarChart3,
  Search,
  Trash2,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

interface ScanHistoryItem {
  id: string;
  user_id: string;
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

interface FakeAccount {
  id: string;
  username: string;
  platform: string | null;
  reason: string;
  evidence: string | null;
  reported_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "scans" | "accounts">("overview");
  
  // Data states
  const [allScans, setAllScans] = useState<ScanHistoryItem[]>([]);
  const [fakeAccounts, setFakeAccounts] = useState<FakeAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { isAdmin, isLoading: roleLoading } = useUserRole(user?.id);

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check admin access
  useEffect(() => {
    if (!roleLoading && !isAdmin && user) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [isAdmin, roleLoading, user, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (isAdmin) {
      fetchAllScans();
      fetchFakeAccounts();
    }
  }, [isAdmin]);

  const fetchAllScans = async () => {
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setAllScans(data);
    }
  };

  const fetchFakeAccounts = async () => {
    const { data, error } = await supabase
      .from("known_fake_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFakeAccounts(data);
    }
  };

  const updateAccountStatus = async (id: string, status: "confirmed" | "dismissed") => {
    const { error } = await supabase
      .from("known_fake_accounts")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Account ${status}`);
      fetchFakeAccounts();
    }
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from("known_fake_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete account");
    } else {
      toast.success("Account removed from database");
      fetchFakeAccounts();
    }
  };

  // Calculate stats
  const stats = {
    totalScans: allScans.length,
    alertsCount: allScans.filter(s => s.verification_status === "alert").length,
    verifiedCount: allScans.filter(s => s.verification_status === "verified").length,
    fakeAccountsCount: fakeAccounts.filter(a => a.status === "confirmed").length,
    pendingReports: fakeAccounts.filter(a => a.status === "pending").length,
  };

  // Filter scans
  const filteredScans = allScans.filter(scan => {
    const matchesSearch = !searchTerm || 
      scan.username_scanned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.content_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || scan.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter accounts
  const filteredAccounts = fakeAccounts.filter(account => {
    const matchesSearch = !searchTerm || 
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (isLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-destructive/5 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Admin Dashboard</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => { fetchAllScans(); fetchFakeAccounts(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="relative z-10 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "scans", label: "All Scans", icon: Search },
              { id: "accounts", label: "Fake Accounts", icon: Database },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Search}
                value={stats.totalScans}
                label="Total Scans"
                color="primary"
              />
              <StatCard
                icon={AlertTriangle}
                value={stats.alertsCount}
                label="Alerts"
                color="destructive"
              />
              <StatCard
                icon={CheckCircle2}
                value={stats.verifiedCount}
                label="Verified"
                color="success"
              />
              <StatCard
                icon={Database}
                value={stats.fakeAccountsCount}
                label="Confirmed Fakes"
                color="warning"
              />
            </div>

            {/* Pending reports alert */}
            {stats.pendingReports > 0 && (
              <div className="glass rounded-xl p-4 border-l-4 border-warning">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning" />
                  <p className="text-foreground">
                    <strong>{stats.pendingReports}</strong> pending reports need review
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setActiveTab("accounts"); setStatusFilter("pending"); }}
                  >
                    Review Now
                  </Button>
                </div>
              </div>
            )}

            {/* Recent alerts */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {allScans
                  .filter(s => s.verification_status === "alert")
                  .slice(0, 5)
                  .map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          @{scan.username_scanned || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {scan.alert_message || scan.content_type}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(scan.scanned_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                {allScans.filter(s => s.verification_status === "alert").length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No recent alerts</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "scans" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or content type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="alert">Alerts</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* Scans list */}
            <div className="space-y-2">
              {filteredScans.map((scan) => (
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
                      {scan.platform && (
                        <span className="text-xs text-muted-foreground">
                          • {scan.platform}
                        </span>
                      )}
                    </div>
                    {scan.alert_message && (
                      <p className="text-sm text-destructive truncate mt-1">{scan.alert_message}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {scan.confidence_score && (
                      <p className="text-sm font-mono text-muted-foreground">{scan.confidence_score}%</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {filteredScans.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No scans found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "accounts" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Accounts list */}
            <div className="space-y-3">
              {filteredAccounts.map((account) => (
                <div key={account.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">@{account.username}</span>
                        {account.platform && (
                          <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                            {account.platform}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          account.status === "confirmed" 
                            ? "bg-destructive/20 text-destructive"
                            : account.status === "pending"
                            ? "bg-warning/20 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {account.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{account.reason}</p>
                      {account.evidence && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Evidence: {account.evidence}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Reported {account.reported_count} time(s) • {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateAccountStatus(account.id, "confirmed")}
                            className="text-success hover:bg-success/10"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateAccountStatus(account.id, "dismissed")}
                            className="text-muted-foreground hover:bg-muted"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAccount(account.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAccounts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No accounts found</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: "primary" | "destructive" | "success" | "warning";
}

const StatCard = ({ icon: Icon, value, label, color }: StatCardProps) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    destructive: "text-destructive bg-destructive/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

export default AdminDashboard;
