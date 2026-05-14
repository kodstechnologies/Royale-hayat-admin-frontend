import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/rhh-logo.png";
import { Eye, EyeOff, Lock, User, LogIn, CheckCircle, XCircle } from "lucide-react";
import { login } from "@/api/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  // Real-time email validation
  useEffect(() => {
    if (!emailTouched && email === "") return;

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());
    setEmailValid(isValid);
  }, [email, emailTouched]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);

      if (!response?.success) {
        setError(response?.message || "Unable to send OTP.");
        return;
      }

      navigate("/otp", {
        state: {
          email,
        },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Custom Loader Component
  const CustomLoader = () => (
    <div className="flex items-center justify-center gap-2">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
      </div>
      <span>Sending OTP...</span>
    </div>
  );

  // Get email validation icon and color
  const getEmailValidationIcon = () => {
    if (!emailTouched || email === "") return null;
    if (emailValid) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    return <XCircle size={16} className="text-red-500" />;
  };

  const getEmailBorderColor = () => {
    if (!emailTouched || email === "") return "border-slate-200";
    if (emailValid) return "border-green-500";
    return "border-red-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 px-4 py-8 overflow-hidden">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-burgundy/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* CARD with bottom to top animation */}
        <div
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 transition-all duration-500 hover:shadow-burgundy/20 hover:shadow-xl animate-slide-up-from-bottom overflow-hidden"
        >
          {/* Card gradient accent - properly aligned with border radius */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          {/* Content wrapper with padding */}
          <div className="p-8">
            {/* Logo inside card */}
            <div className="flex justify-center mb-8 pt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl"></div>
                <img
                  src={logo}
                  alt="Royale Hayat Hospital"
                  className="h-28 w-auto relative z-10 drop-shadow-xl"
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Secure access to hospital management system
              </p>
            </div>

            <form onSubmit={handleCredentials} className="space-y-6">
              {/* EMAIL */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block transition-all group-focus-within:text-burgundy">
                  Email Address
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all group-focus-within:scale-110 ${emailTouched && emailValid
                      ? "text-green-500"
                      : emailTouched && !emailValid && email !== ""
                        ? "text-red-500"
                        : "text-slate-400 group-focus-within:text-burgundy"
                      }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    onFocus={() => setEmailTouched(true)}
                    placeholder="admin@royalehayat.com"
                    className={`
                      w-full h-12
                      pl-12 pr-10
                      rounded-xl
                      border-2
                      transition-all duration-200
                      focus:outline-none
                      focus:border-burgundy
                      focus:ring-0
                      hover:border-slate-300
                      hover:bg-slate-50
                      ${getEmailBorderColor()}
                      bg-white
                      text-slate-800
                      text-sm
                      font-medium
                      placeholder:text-slate-400
                    `}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {getEmailValidationIcon()}
                  </div>
                </div>

                {/* Email validation message */}
                {emailTouched && email !== "" && (
                  <div className="mt-2 animate-in fade-in duration-200">
                    <div className={`flex items-center gap-2 p-2 rounded-lg ${emailValid
                      ? "bg-green-50 border border-green-100"
                      : "bg-red-50 border border-red-100"
                      }`}>
                      {emailValid ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      <p className={`text-xs font-medium ${emailValid ? "text-green-600" : "text-red-600"
                        }`}>
                        {emailValid ? "Valid format" : "Invalid format"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PASSWORD */}
              <div className="group">
                <label className="text-sm font-semibold text-slate-700 mb-2 block transition-all group-focus-within:text-burgundy">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all group-focus-within:text-burgundy group-focus-within:scale-110"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full h-12
                      pl-12 pr-12
                      rounded-xl
                      border-2 border-slate-200
                      bg-white
                      text-slate-800
                      text-sm
                      font-medium
                      placeholder:text-slate-400
                      transition-all duration-200
                      focus:outline-none
                      focus:border-burgundy
                      focus:ring-0
                      hover:border-slate-300
                      hover:bg-slate-50
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-4 top-1/2
                      -translate-y-1/2
                      text-slate-400
                      hover:text-burgundy
                      transition-all duration-200
                      hover:scale-110
                    "
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading || (emailTouched && !emailValid && email !== "")}
                className="
                  relative w-full h-12
                  rounded-xl
                  bg-gradient-to-r from-burgundy to-burgundy-deep
                  text-white
                  font-semibold
                  text-base
                  overflow-hidden
                  transition-all duration-300
                  hover:shadow-lg hover:shadow-burgundy/30
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  disabled:hover:scale-100
                  group
                "
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                {loading ? (
                  <CustomLoader />
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
                    <span>Continue to Portal</span>
                  </div>
                )}
              </button>
            </form>

            {/* Footer note */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                {/* Secure encrypted connection */}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6 font-medium">
          © 2026 Royale Hayat Hospitals. Authorized personnel only.
        </p>
      </div>

      {/* Add animation keyframes for bottom to top sliding */}
      <style>{`
        @keyframes slideUpFromBottom {
          0% {
            opacity: 0;
            transform: translateY(100vh);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up-from-bottom {
animation: slideUpFromBottom 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;