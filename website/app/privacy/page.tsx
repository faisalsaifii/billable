"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div className="min-h-screen noise">
      <Navbar />

      <section className="relative pt-36 pb-20 px-6" ref={ref}>
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />

        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-display">
                Privacy First
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-8 md:p-12 border border-border/50 space-y-8"
          >
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                Our Commitment to Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Billable, we believe your data belongs to you. This privacy
                policy explains how we handle information related to our desktop
                accounting software.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                1. Data Collection
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">
                  We do not collect any personal data.
                </strong>{" "}
                Billable is a desktop application that stores all your
                information locally on your device. We do not have servers that
                collect, store, or process your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                2. Local Data Storage
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All your business data, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li>Company information and financial years</li>
                <li>Chart of accounts and account groups</li>
                <li>
                  Financial transactions (sales, purchases, payments, receipts,
                  journals)
                </li>
                <li>
                  Inventory items, stock levels, and multi-location tracking
                </li>
                <li>Trial balances, balance sheets, and all reports</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                is stored exclusively on your local device. You have complete
                control over this data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                3. Website Analytics
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use basic analytics to understand how visitors
                use our site. This may include information such as browser type,
                referring site, and pages visited. This information is not
                linked to the desktop application and does not include any of
                your accounting data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                4. No Third-Party Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Since we don't collect your data, we have nothing to share with
                third parties. Your accounting information never leaves your
                device unless you explicitly export or backup files yourself.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                5. Updates and Communication
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The application may check for software updates, but this process
                does not involve transmitting any of your personal or financial
                data. Update checks are performed using standard HTTP requests
                that only identify the application version.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                6. Open Source
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Billable is open-source software. You can review our source code
                on GitHub to verify our privacy claims. We encourage security
                researchers and developers to audit the code and report any
                concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                7. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                While we don't handle your data directly, we recommend that you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li>Regularly backup your data to a secure location</li>
                <li>
                  Use appropriate security measures on your device (passwords,
                  encryption)
                </li>
                <li>
                  Keep your operating system and Billable updated to the latest
                  version
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our software is designed for business use and is not directed at
                children under 13. We do not knowingly collect any information
                from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. Any changes
                will be posted on this page with an updated revision date. For
                significant changes, we will provide notice through our release
                notes or GitHub repository.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                10. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this privacy policy, please contact
                us through our GitHub repository or via our contact page.
              </p>
            </section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
