import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "SatrixNow Admin Portal",
  description: "SatrixNow Administration & Operations Control Center",
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
