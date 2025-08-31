"use client";

import { motion, Variants } from "framer-motion";
import { HelpHero } from "@/components/help/HelpHero";
import { ContactForm } from "@/components/help/ContactForm";
import { FAQSection } from "@/components/help/FAQSection";
import { SupportResources } from "@/components/help/SupportResources";
import { HelpDocumentation } from "@/components/help/HelpDocumentation";
import { CommunityLinks } from "@/components/help/CommunityLinks";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const sectionVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function HelpPage() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <motion.section variants={sectionVariants}>
        <HelpHero />
      </motion.section>

      {/* Quick Actions Grid */}
      <motion.section 
        className="container mx-auto px-4 py-12"
        variants={sectionVariants}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="lg:col-span-1">
            <ContactForm />
          </div>

          {/* Community Links */}
          <div className="lg:col-span-1">
            <CommunityLinks />
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="container mx-auto px-4 py-12"
        variants={sectionVariants}
      >
        <FAQSection />
      </motion.section>

      {/* Support Resources */}
      <motion.section 
        className="container mx-auto px-4 py-12"
        variants={sectionVariants}
      >
        <SupportResources />
      </motion.section>

      {/* Help Documentation */}
      <motion.section 
        className="container mx-auto px-4 py-12 pb-24"
        variants={sectionVariants}
      >
        <HelpDocumentation />
      </motion.section>
    </motion.div>
  );
}