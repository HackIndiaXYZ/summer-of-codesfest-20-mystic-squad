import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Login | EchoGaze",
  description: "Sign in to EchoGaze Dashboard",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#030305] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-500/30">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-[120px] rounded-full pointer-events-none opacity-80 mix-blend-screen" />
      <div className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/4 -right-64 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-10 px-4 sm:px-0 hover:-translate-x-1 duration-300"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm tracking-wide">Back to Home</span>
        </Link>
        <div className="flex justify-center mb-6 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-[1px] shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <div className="w-full h-full bg-[#030305] rounded-2xl flex items-center justify-center">
              <svg viewBox="0 0 256 256" className="w-7 h-7 fill-white">
                <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 font-serif mb-2 tracking-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
          EchoGaze
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex justify-center px-4 sm:px-0">
        <AuthForm />
      </div>
    </div>
  );
}
