"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap,
  Shield,
  BarChart3,
  Warehouse,
  FileText,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning-Fast Performance",
    desc: "Handle your entire accounting workflow without slowdowns. Desktop-based for maximum speed and reliability.",
  },
  {
    icon: FileText,
    title: "Complete Accounting",
    desc: "General ledger, trial balance, balance sheet, and all financial reports. Full double-entry bookkeeping.",
  },
  {
    icon: Warehouse,
    title: "Multi-Location Inventory",
    desc: "Track stock across multiple warehouses with real-time status updates and automated valuation.",
  },
  {
    icon: BarChart3,
    title: "Professional Reports",
    desc: "Generate trial balances, balance sheets, stock reports, and tax summaries instantly.",
  },
  {
    icon: Shield,
    title: "Offline & Secure",
    desc: "Work completely offline with your data stored locally. No cloud dependency, full privacy.",
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    desc: "Handle transactions in multiple currencies with built-in VAT, GST, and sales tax management.",
  },
];

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="text-primary font-display text-sm font-semibold tracking-widest uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
            Full-featured accounting,
            <br />
            <span className="text-gradient">simplified.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <FeatureCard {...feature} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
  index: number;
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative glass rounded-2xl p-8 overflow-hidden cursor-default"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>

      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default Features;
