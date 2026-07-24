"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Shield, BarChart3, Clock, Send, Globe } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Invoices",
    desc: "Generate polished invoices in under 10 seconds with smart templates.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    desc: "End-to-end encryption keeps your financial data safe and private.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track revenue, outstanding payments, and growth at a glance.",
  },
  {
    icon: Clock,
    title: "Auto Reminders",
    desc: "Never chase payments again. Automated follow-ups do the work.",
  },
  {
    icon: Send,
    title: "One-Click Delivery",
    desc: "Send invoices via email, link, or WhatsApp with a single tap.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    desc: "Bill clients worldwide with 50+ supported currencies.",
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
            Everything you need,
            <br />
            <span className="text-gradient">nothing you don't.</span>
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
