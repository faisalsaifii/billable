"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsPage = () => {
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
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium font-display">
                Legal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Terms of <span className="text-gradient">Service</span>
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
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By downloading, installing, or using Billable, you agree to be
                bound by these Terms of Service. If you do not agree to these
                terms, please do not use the software.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                2. License
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Billable is open-source software released under the Elastic
                License 2.0 (ELv2). You are free to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  Use the software for commercial and non-commercial purposes
                </li>
                <li>Modify the source code to suit your needs</li>
                <li>Distribute copies of the software</li>
                <li>
                  Host the software as a service for your own organization
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, you may not provide the software to third parties as a
                hosted or managed service where the software provides
                substantial value to that service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                3. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Billable is provided "as is" without warranty of any kind,
                express or implied, including but not limited to the warranties
                of merchantability, fitness for a particular purpose, and
                non-infringement. The entire risk as to the quality and
                performance of the software is with you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                4. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall the authors or copyright holders be liable for
                any claim, damages, or other liability, whether in an action of
                contract, tort, or otherwise, arising from, out of, or in
                connection with the software or the use or other dealings in the
                software.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                5. Data Responsibility
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for maintaining backups of your data.
                Billable stores all data locally on your device. We recommend
                implementing a regular backup strategy to prevent data loss.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                6. Modifications to Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or discontinue the software at
                any time without notice. We shall not be liable to you or any
                third party for any modification, suspension, or discontinuance
                of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                7. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance
                with the laws of your jurisdiction, without regard to its
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update these terms at any time. We will
                notify users of any material changes through our release notes
                or GitHub repository.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold mb-4">
                9. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us through our GitHub repository or via the contact
                page.
              </p>
            </section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
