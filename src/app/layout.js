import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://ravenearning-admin.vercel.app"),
  title: "SatrixNow Admin Portal",
  description: "SatrixNow Administration & Operations Control Center",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.jpeg", type: "image/jpeg" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/logo.jpeg"],
    apple: [
      { url: "/logo.jpeg" },
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SatrixNow Admin Portal",
    description: "SatrixNow Administration & Operations Control Center",
    images: ["/logo.jpeg"],
  },
  twitter: {
    card: "summary",
    title: "SatrixNow Admin Portal",
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f0f4f8] font-['Poppins',sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
