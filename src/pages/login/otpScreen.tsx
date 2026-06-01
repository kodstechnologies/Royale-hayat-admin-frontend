import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/rhh-logo.png";
import { ShieldCheck, ChevronLeft, RefreshCw, Clock } from "lucide-react";
import { sendOtp, verifyOtp } from "@/api/auth";
import { getFirstAllowedRoutePath } from "@/config/routePermissions";

const OTP_DURATION_SECONDS = 5 * 60; // 5 minutes

const OtpScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState(OTP_DURATION_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const canResendOtp = !isTimerActive && timeLeft <= 0;
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const filledDigits = otp.filter(digit => digit !== "").length;
  const otpProgress = (filledDigits / 6) * 100;

  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setIsTimerActive(false);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const otpArray = pastedData.split("");
    const newOtp = [...otp];
    
    for (let i = 0; i < 6; i++) {
      newOtp[i] = otpArray[i] || "";
    }
    
    setOtp(newOtp);
    
    // Focus on the next empty field or last field
    let lastFilledIndex = -1;
    for (let i = 0; i < newOtp.length; i++) {
      if (newOtp[i] !== "") {
        lastFilledIndex = i;
      }
    }
    
    const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const otpValue = otp.join("");
    
    if (otpValue.length < 6) {
      setError("Please enter complete 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp(email, otpValue);

      if (!response?.success) {
        setError(response?.message || "OTP verification failed.");
        return;
      }
      
      const user = response?.data;

      if (user?.accessToken) {
        localStorage.setItem("rhh_admin_access_token", user.accessToken);
      }

      localStorage.setItem("rhh_admin_auth", "true");
      localStorage.setItem("rhh_admin_user", JSON.stringify(user || {}));

      navigate(getFirstAllowedRoutePath());
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp || resending) return;

    if (!email) {
      setError("Email not found. Please go back and login again.");
      return;
    }

    setResending(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await sendOtp(email);

      if (!response?.success) {
        setError(response?.message || "Failed to resend OTP.");
        return;
      }

      setTimeLeft(OTP_DURATION_SECONDS);
      setIsTimerActive(true);
      setOtp(["", "", "", "", "", ""]);
      setSuccessMessage("A new OTP has been sent to your email.");
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  // Circular progress component - smaller size
  const CircularProgress = ({
    progress,
    filledDigits,
  }: {
    progress: number;
    filledDigits: number;
  }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex flex-col items-center justify-center">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#8B1E3F"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          <div className="absolute text-center">
            <span className="text-sm font-bold text-burgundy">
              {filledDigits}/6
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-burgundy/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>

        {/* CARD */}
        <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 transition-all duration-500 hover:shadow-burgundy/20 hover:shadow-xl overflow-hidden">
          {/* Card gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-burgundy/40 via-burgundy to-burgundy/40"></div>

          {/* Content wrapper with padding */}
          <div className="p-8">
            {/* Logo inside card */}
            <div className="flex justify-center mb-6 pt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-burgundy/20 rounded-full blur-2xl"></div>
                <img
                  src={logo}
                  alt="Royale Hayat Hospital"
                  className="h-24 w-auto relative z-10 drop-shadow-xl"
                />
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center">
                <ShieldCheck size={30} className="text-burgundy" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Verify OTP
              </h1>
              
              <p className="text-sm text-slate-500 mt-2">
                Enter the 6-digit code sent to
              </p>
              
              {/* Email display */}
              <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <span className="text-xs font-medium text-slate-600">📧</span>
                <span className="text-sm font-semibold text-burgundy">
                  {email || "your email address"}
                </span>
              </div>
            </div>

            {/* Timer Display */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-burgundy/5 to-burgundy/10 rounded-full">
                <Clock size={16} className="text-burgundy" />
                <span className="text-sm font-semibold text-burgundy">
                  {formatTime(timeLeft)}
                </span>
                {!isTimerActive && timeLeft === 0 && (
                  <span className="text-xs text-red-500 ml-2">(Expired)</span>
                )}
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input Boxes with Progress Circle */}
              <div className="flex items-center justify-center gap-4">
                {/* 6 OTP Boxes */}
                <div className="flex gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      maxLength={1}
                      className="
                        w-12 h-14
                        rounded-xl
                        border-2
                        text-center
                        text-xl
                        font-bold
                        font-mono
                        transition-all duration-200
                        focus:outline-none
                        focus:border-burgundy
                        focus:ring-4
                        focus:ring-burgundy/10
                        hover:border-slate-300
                        bg-white
                        text-slate-800
                      "
                      style={{
                        borderColor: digit ? "#8B1E3F" : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
                
                {/* Circular Progress */}
                <CircularProgress progress={otpProgress} filledDigits={filledDigits} />
              </div>

              {successMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                </div>
              )}

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
                disabled={loading || filledDigits < 6}
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    </div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Login"
                )}
              </button>

              {/* Resend OTP Button — enabled after 5 min timer expires */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResendOtp || resending}
                  className="
                    flex items-center gap-2
                    text-sm font-medium
                    transition-all duration-200
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    hover:scale-105
                    active:scale-95
                  "
                  style={{
                    color: canResendOtp ? "#8B1E3F" : "#94a3b8",
                  }}
                >
                  <RefreshCw
                    size={14}
                    className={resending ? "animate-spin" : ""}
                  />
                  <span>{resending ? "Sending..." : "Resend OTP"}</span>
                </button>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                  w-full flex items-center justify-center gap-2
                  text-sm text-slate-500
                  hover:text-burgundy
                  transition-all duration-200
                  group
                "
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span>Back to Login</span>
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6 font-medium">
          © 2026 Royale Hayat Hospitals. Authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default OtpScreen;