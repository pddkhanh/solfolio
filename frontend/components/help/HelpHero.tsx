"use client";

import { motion, Variants } from "framer-motion";
import { Search, MessageCircle, BookOpen, Users } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const heroVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
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

const quickLinks = [
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Get help from our team",
    href: "#contact",
    color: "from-primary to-secondary"
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Learn how to use SolFolio",
    href: "#docs",
    color: "from-accent to-primary"
  },
  {
    icon: Users,
    title: "Community",
    description: "Join our Discord",
    href: "#community",
    color: "from-secondary to-accent"
  }
];

export function HelpHero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-bg-secondary to-secondary/10 py-24"
      variants={heroVariants}
      initial="initial"
      animate="animate"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div className="mx-auto max-w-3xl text-center" variants={itemVariants}>
          <h1 className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            How Can We Help?
          </h1>
          <p className="mb-12 text-xl text-text-secondary">
            Get answers to your questions, contact support, or explore our documentation
          </p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            className="relative mb-12"
            variants={itemVariants}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder="Search for help articles, FAQs, or guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 w-full rounded-xl border-border-default bg-bg-tertiary/50 pl-12 pr-4 text-lg backdrop-blur-sm transition-all duration-200 focus:bg-bg-tertiary focus:shadow-lg focus:shadow-primary/10"
              />
              <motion.button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-2 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
            </div>
          </motion.form>

          {/* Quick Links */}
          <motion.div 
            className="grid gap-4 md:grid-cols-3"
            variants={itemVariants}
          >
            {quickLinks.map((link, index) => (
              <motion.a
                key={link.title}
                href={link.href}
                className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-secondary/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border-hover hover:bg-bg-secondary hover:shadow-xl"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${link.color} p-3`}>
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-text-primary">
                    {link.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {link.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}