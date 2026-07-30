import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "EchoGaze | Caregiver Dashboard",
  description: "Your gaze, echoed to those who care.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-echogaze-bg text-echogaze-text`}
      >
        {children}
      </body>
    </html>
  );
}
