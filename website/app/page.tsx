import CTA from "@/components/CTA";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import Stats from "@/components/Stats";

export default function Home() {
  return (
    <div className="min-h-screen noise">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}
