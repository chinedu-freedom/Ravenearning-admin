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
  title: "Ravenearning Admin Portal",
  description: "Ravenearning Administration & Operations Control Center",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/logo.png"],
    apple: [
      { url: "/logo.png" },
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Ravenearning Admin Portal",
    description: "Ravenearning Administration & Operations Control Center",
    siteName: "Ravenearning",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary",
    title: "Ravenearning Admin Portal",
    description: "Ravenearning Administration & Operations Control Center",
    images: ["/logo.png"],
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
