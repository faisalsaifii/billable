"use client";

import { motion } from "framer-motion";

const FloatingInvoice = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full scale-75" />

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative glass rounded-3xl p-8 w-[380px] shadow-2xl"
      >
        {/* Invoice header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">INVOICE</div>
            <div className="font-display font-bold text-lg">#INV-2024-087</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
            Paid
          </div>
        </div>

        {/* Line items */}
        <div className="space-y-3 mb-6">
          {[
            { name: "UI/UX Design", hours: "40h", amount: "$4,800" },
            { name: "Frontend Dev", hours: "60h", amount: "$7,200" },
            { name: "Consulting", hours: "8h", amount: "$1,200" },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
              className="flex items-center justify-between py-2 border-b border-border/50"
            >
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.hours}
                </div>
              </div>
              <div className="font-display font-semibold text-sm">
                {item.amount}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-between pt-2"
        >
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-2xl font-display font-bold text-gradient">
            $13,200
          </span>
        </motion.div>

        {/* Decorative dots */}
        <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/20 animate-pulse-glow" />
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-primary/10 animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default FloatingInvoice;
