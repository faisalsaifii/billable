"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Big glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/8 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <h2 className="text-4xl md:text-7xl font-display font-bold mb-6">
            Ready to get{" "}
            <motion.span
              className="text-gradient inline-block"
              animate={isInView ? { rotateZ: [0, -2, 2, 0] } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Billable
            </motion.span>
            ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
            Join businesses using Billable for comprehensive accounting and
            inventory management. Free and open source.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/download">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 60px -8px hsl(82, 85%, 55%, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg glow-border"
              >
                Start for free →
              </motion.button>
            </Link>
            <span className="text-sm text-muted-foreground">
              No credit card required
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
