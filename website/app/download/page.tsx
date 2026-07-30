"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Monitor, Apple, Terminal, Download, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const platforms = [
  {
    name: "Windows",
    icon: Monitor,
    description: "Windows 10 or later (64-bit)",
    primary: "Download .exe",
    secondary: "Download .msi",
    primaryLink:
      "https://github.com/faisalsaifii/billable/releases/download/v0.2.0/billable_0.2.0_x64-setup.exe",
    secondaryLink:
      "https://github.com/faisalsaifii/billable/releases/download/v0.2.0/billable_0.2.0_x64_en-US.msi",
  },
];

const DownloadPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="min-h-screen noise">
      <Navbar />

      <section className="relative pt-36 pb-20 px-6" ref={ref}>
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-display">
                Latest Release
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Download <span className="text-gradient">Billable</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Desktop accounting software for Windows. Free and open source.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-1 gap-6 mb-16 max-w-md mx-auto">
            {platforms.map((platform, i) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.2 + i * 0.12,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 60px -15px hsl(82, 85%, 55%, 0.15)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass rounded-2xl p-8 flex flex-col items-center text-center h-full border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <platform.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-1">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {platform.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-3 w-full">
                    <motion.a
                      href={platform.primaryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm glow-border"
                    >
                      <Download className="w-4 h-4" />
                      {platform.primary}
                    </motion.a>
                    <motion.a
                      href={platform.secondaryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-display font-semibold text-sm hover:bg-secondary transition-colors"
                    >
                      {platform.secondary}
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Source & Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="glass rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-lg font-display font-bold mb-1">
                Build from source
              </h3>
              <p className="text-sm text-muted-foreground">
                Clone the repo and build it yourself. Contributions welcome!
              </p>
            </div>
            <motion.a
              href="https://github.com/faisalsaifii/billable"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-display font-semibold text-sm hover:bg-secondary transition-colors whitespace-nowrap"
            >
              {/* <Github className="w-4 h-4" /> */}
              View on GitHub
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DownloadPage;
