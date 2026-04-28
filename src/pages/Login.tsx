import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/rhh-logo.png";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFA, setTwoFA] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError("Please enter username and password."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("2fa"); }, 800);
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!twoFA || twoFA.length < 6) { setError("Please enter a valid 6-digit code."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("rhh_admin_auth", "true");
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-section-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Royale Hayat Hospital" className="h-20 w-auto" />
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          <h1 className="text-xl font-serif font-bold text-foreground text-center mb-1">Admin Portal</h1>
          <p className="text-xs font-sans text-muted-foreground text-center mb-6">Secure access to hospital management system</p>

          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="text-xs font-sans font-medium text-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold bg-background" />
                </div>
              </div>
              <div>
                <label className="text-xs font-sans font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border text-sm font-sans focus:outline-none focus:ring-1 focus:ring-gold bg-background" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs font-sans text-error">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors disabled:opacity-50">
                {loading ? "Verifying..." : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck size={20} className="text-success" />
                <span className="text-sm font-sans font-medium text-foreground">Two-Factor Authentication</span>
              </div>
              <p className="text-xs font-sans text-muted-foreground text-center">Enter the 6-digit code from your authenticator app</p>
              <div>
                <input type="text" value={twoFA} onChange={(e) => setTwoFA(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-border text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-gold bg-background" />
              </div>
              {error && <p className="text-xs font-sans text-error">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-burgundy text-primary-foreground text-sm font-sans font-medium hover:bg-burgundy-deep transition-colors disabled:opacity-50">
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button type="button" onClick={() => setStep("credentials")}
                className="w-full py-2 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
                ← Back to login
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] font-sans text-muted-foreground text-center mt-6">
          © 2026 Royale Hayat Hospitals. Authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default Login;
