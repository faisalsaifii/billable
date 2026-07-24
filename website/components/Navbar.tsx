"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Features", href: "#features", isAnchor: true },
  { label: "Download", href: "/download", isRoute: true },
  {
    label: "GitHub",
    href: "https://github.com/faisalsaifii/billable",
    isExternal: true,
  },
];

const Navbar = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleAnchorClick = (href: string) => {
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between glass rounded-2xl px-6 py-3">
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 font-display text-xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              B
            </div>
            Billable
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item, i) => {
            const inner = (
              <>
                {hovered === i && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-lg bg-secondary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </>
            );
            const cls =
              "relative px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer";

            if (item.isAnchor) {
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleAnchorClick(item.href)}
                  className={cls}
                  onHoverStart={() => setHovered(i)}
                  onHoverEnd={() => setHovered(null)}
                >
                  {inner}
                </motion.button>
              );
            }

            if (item.isRoute) {
              return (
                <motion.div
                  key={item.label}
                  onHoverStart={() => setHovered(i)}
                  onHoverEnd={() => setHovered(null)}
                >
                  <Link href={item.href} className={cls}>
                    {inner}
                  </Link>
                </motion.div>
              );
            }

            return (
              <motion.a
                key={item.label}
                href={item.href}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className={cls}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
              >
                {inner}
              </motion.a>
            );
          })}
        </div>

        <Link href="/download">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-display text-sm font-semibold"
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
