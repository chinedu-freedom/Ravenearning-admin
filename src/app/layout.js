import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  metadataBase: new URL("https://admin.suncerestcapital.com"),
  title: {
    default: "suncerestcapital Admin Portal",
    template: "%s | suncerestcapital Admin"
  },
  description: "suncerestcapital Administration & Operations Control Center",
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
    type: "website",
    locale: "en_US",
    url: "https://admin.suncerestcapital.com",
    title: "suncerestcapital Admin Portal",
    description: "suncerestcapital Administration & Operations Control Center",
    siteName: "suncerestcapital",
    images: [
      {
        url: "https://suncerestcapital.com/logo.png",
        width: 800,
        height: 800,
        alt: "suncerestcapital Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "suncerestcapital Admin Portal",
    description: "suncerestcapital Administration & Operations Control Center",
    images: ["https://suncerestcapital.com/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans h-full antialiased`}
    >
      <head>
        <meta property="og:image" content="https://suncerestcapital.com/logo.png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/png" />
        <link rel="image_src" href="https://suncerestcapital.com/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f0f4f8] font-['Poppins',sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
