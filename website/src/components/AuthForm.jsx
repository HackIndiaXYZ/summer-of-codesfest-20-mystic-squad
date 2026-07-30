"use client";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2, Globe, Mail, Lock, ArrowRight } from "lucide-react";
import Toast from "./Toast";

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!auth) {
      setToast({ type: "error", message: "Firebase is not initialized." });
      return;
    }
    setLoading(true);
    try {
      if (isSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!auth || !email) {
      setToast({ type: "error", message: "Please enter your email first." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setToast({ type: "success", message: "Password reset email sent!" });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-up">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-[2rem] blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative bg-zinc-950/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Subtle inner glows */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {isSignIn ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-zinc-400 mb-8 text-sm font-medium">
              {isSignIn
                ? "Sign in to manage your devices and view history."
                : "Join EchoGaze to empower communication."}
            </p>

            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-white/20"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all hover:border-white/20"
                  />
                </div>
              </div>

              {isSignIn && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group/btn relative w-full bg-white text-black font-semibold py-3.5 rounded-xl transition-all overflow-hidden mt-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full duration-1000 transition-transform"></div>
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  <span>{isSignIn ? "Sign In" : "Sign Up"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-xs font-medium text-zinc-500 tracking-wider">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 hover:border-white/10 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 hover:text-white"
            >
              <Globe className="w-5 h-5 text-zinc-400" />
              Continue with Google
            </button>

            <div className="mt-8 text-center text-sm font-medium text-zinc-400">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-white hover:text-blue-400 underline decoration-white/30 underline-offset-4 hover:decoration-blue-400 transition-all"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
