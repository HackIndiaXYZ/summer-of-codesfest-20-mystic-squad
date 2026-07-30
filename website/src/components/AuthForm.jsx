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
import { Loader2, Globe, Mail, Lock } from "lucide-react";
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
    <div className="w-full max-w-md">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-echogaze-accent/20 blur-3xl rounded-full pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {isSignIn ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-echogaze-muted mb-8 text-sm">
          {isSignIn
            ? "Sign in to manage your devices and view history."
            : "Join EchoGaze to empower communication."}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-echogaze-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-echogaze-surface/50 border border-echogaze-surface-hover rounded-xl py-3 pl-10 pr-4 text-white placeholder-echogaze-muted focus:outline-none focus:border-echogaze-accent focus:ring-1 focus:ring-echogaze-accent transition-all"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-echogaze-muted" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-echogaze-surface/50 border border-echogaze-surface-hover rounded-xl py-3 pl-10 pr-4 text-white placeholder-echogaze-muted focus:outline-none focus:border-echogaze-accent focus:ring-1 focus:ring-echogaze-accent transition-all"
              />
            </div>
          </div>

          {isSignIn && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-echogaze-accent hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-echogaze-accent hover:bg-echogaze-mid text-echogaze-bg font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-echogaze-surface-hover" />
          <span className="text-xs text-echogaze-muted">OR</span>
          <div className="flex-1 h-px bg-echogaze-surface-hover" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Globe className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm text-echogaze-muted">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-echogaze-accent hover:text-white font-medium transition-colors"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
