"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Code, MessageSquare, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactMethods = [
  {
    name: "GitHub Issues",
    icon: Code,
    description: "Report bugs, request features, or ask technical questions",
    action: "Open an Issue",
    link: "https://github.com/faisalsaifii/billable/issues",
    primary: true,
  },
  {
    name: "GitHub Discussions",
    icon: MessageSquare,
    description:
      "Join the community, share ideas, and get help from other users",
    action: "Join Discussion",
    link: "https://github.com/faisalsaifii/billable/discussions",
    primary: false,
  },
];

const ContactPage = () => {
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
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-display">
                Get in Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have questions, feedback, or need help? We'd love to hear from
              you. Choose the best way to reach out based on your needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
            {contactMethods.map((method, i) => (
              <motion.div
                key={method.name}
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
                    boxShadow: method.primary
                      ? "0 20px 60px -15px hsl(82, 85%, 55%, 0.15)"
                      : "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`glass rounded-2xl p-8 flex flex-col h-full border ${
                    method.primary
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50"
                  } hover:border-primary/30 transition-colors`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${
                      method.primary ? "bg-primary/20" : "bg-primary/10"
                    } flex items-center justify-center mb-5`}
                  >
                    <method.icon
                      className={`w-7 h-7 ${
                        method.primary ? "text-primary" : "text-primary/70"
                      }`}
                    />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    {method.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    {method.description}
                  </p>

                  <motion.a
                    href={method.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-semibold text-sm transition-colors ${
                      method.primary
                        ? "bg-primary text-primary-foreground glow-border"
                        : "bg-primary/10 text-primary hover:bg-primary/15"
                    }`}
                  >
                    {method.action}
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-8 md:p-12 border border-border/50"
          >
            <h2 className="text-2xl font-display font-bold mb-4 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Before reaching out, check if your question is answered below.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  How do I report a bug?
                </h3>
                <p className="text-muted-foreground">
                  Please open an issue on our GitHub repository with detailed
                  steps to reproduce the bug, your system information, and any
                  relevant screenshots or logs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  Can I request a feature?
                </h3>
                <p className="text-muted-foreground">
                  Absolutely! Feature requests are welcome on GitHub Issues or
                  Discussions. Describe your use case and how the feature would
                  benefit you and other users.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  How can I contribute to the project?
                </h3>
                <p className="text-muted-foreground">
                  Check out the CONTRIBUTING.md file in our GitHub repository.
                  We welcome code contributions, documentation improvements,
                  translations, and more.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  Where can I get support?
                </h3>
                <p className="text-muted-foreground">
                  For support questions, GitHub Discussions is the best place.
                  The community and maintainers are active there and can help
                  with setup, usage, and troubleshooting.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  Do you offer commercial support?
                </h3>
                <p className="text-muted-foreground">
                  For business inquiries or custom development needs, please
                  open a discussion on GitHub. We can discuss consulting,
                  support contracts, or custom features for your organization.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
