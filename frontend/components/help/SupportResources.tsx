"use client";

import { motion, Variants } from "framer-motion";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Code, 
  MessageSquare, 
  Users,
  Zap,
  Shield,
  TrendingUp,
  ExternalLink
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  type: string;
  link: string;
  color: string;
  isNew?: boolean;
  isPro?: boolean;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    description: "Learn the basics of using SolFolio and setting up your portfolio",
    icon: BookOpen,
    type: "Documentation",
    link: "/docs/getting-started",
    color: "from-primary to-secondary",
    isNew: true
  },
  {
    id: "2",
    title: "Video Tutorials",
    description: "Watch step-by-step video guides for all major features",
    icon: Video,
    type: "Video",
    link: "/tutorials",
    color: "from-accent to-primary"
  },
  {
    id: "3",
    title: "API Documentation",
    description: "Integrate SolFolio data into your own applications",
    icon: Code,
    type: "Developer",
    link: "/api-docs",
    color: "from-secondary to-accent",
    isPro: true
  },
  {
    id: "4",
    title: "DeFi Protocol Guide",
    description: "Understanding supported protocols and their features",
    icon: TrendingUp,
    type: "Guide",
    link: "/docs/protocols",
    color: "from-primary to-accent"
  },
  {
    id: "5",
    title: "Security Best Practices",
    description: "Keep your wallet and assets safe while using DeFi",
    icon: Shield,
    type: "Security",
    link: "/docs/security",
    color: "from-danger to-warning"
  },
  {
    id: "6",
    title: "Advanced Features",
    description: "Master advanced portfolio tracking and analysis tools",
    icon: Zap,
    type: "Advanced",
    link: "/docs/advanced",
    color: "from-warning to-success"
  },
  {
    id: "7",
    title: "Community Forum",
    description: "Connect with other users and share strategies",
    icon: Users,
    type: "Community",
    link: "/forum",
    color: "from-secondary to-primary"
  },
  {
    id: "8",
    title: "Release Notes",
    description: "Stay updated with the latest features and improvements",
    icon: FileText,
    type: "Updates",
    link: "/changelog",
    color: "from-accent to-secondary",
    isNew: true
  }
];

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
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

export function SupportResources() {
  return (
    <div>
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-4 text-3xl font-bold text-text-primary">
          Support Resources
        </h2>
        <p className="text-lg text-text-secondary">
          Everything you need to make the most of SolFolio
        </p>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {resources.map((resource, index) => (
          <motion.a
            key={resource.id}
            href={resource.link}
            className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-secondary/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border-hover hover:bg-bg-secondary hover:shadow-xl"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            custom={index}
          >
            {/* Background Gradient */}
            <div 
              className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
            />

            {/* Badges */}
            <div className="absolute right-4 top-4 flex gap-2">
              {resource.isNew && (
                <motion.span
                  className="rounded-full bg-success/20 px-2 py-1 text-xs font-semibold text-success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  NEW
                </motion.span>
              )}
              {resource.isPro && (
                <motion.span
                  className="rounded-full bg-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  PRO
                </motion.span>
              )}
            </div>

            {/* Content */}
            <div className="relative">
              {/* Icon */}
              <motion.div
                className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${resource.color} p-3`}
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <resource.icon className="h-6 w-6 text-white" />
              </motion.div>

              {/* Type Badge */}
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {resource.type}
              </p>

              {/* Title */}
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-text-primary">
                {resource.title}
                <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-50" />
              </h3>

              {/* Description */}
              <p className="text-sm text-text-secondary">
                {resource.description}
              </p>
            </div>

            {/* Hover Effect Line */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${resource.color}`}
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
        ))}
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        className="mt-12 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-6 text-center text-xl font-semibold text-text-primary">
          Quick Links
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <motion.a
            href="/status"
            className="flex items-center justify-center gap-2 rounded-lg bg-bg-secondary/50 p-4 text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            System Status
          </motion.a>
          <motion.a
            href="/roadmap"
            className="flex items-center justify-center gap-2 rounded-lg bg-bg-secondary/50 p-4 text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="h-4 w-4" />
            Product Roadmap
          </motion.a>
          <motion.a
            href="/privacy"
            className="flex items-center justify-center gap-2 rounded-lg bg-bg-secondary/50 p-4 text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-4 w-4" />
            Privacy Policy
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}