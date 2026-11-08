import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/site/Providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: { default: "Delhi Vascular IR Clinic — Dr. Girendra Shankar | Vascular & Interventional Radiology", template: "%s | Delhi Vascular IR Clinic" },
  description: "Complex Interventions. Precision. Expertise. Dr. Girendra Shankar (MBBS, MD, FVIR, EBIR), Vascular & Interventional Radiologist — independent specialist clinic in Moti Nagar, New Delhi. Explore procedures in interactive 3D.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-4 focus:py-2 focus:text-navy">Skip to content</a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
