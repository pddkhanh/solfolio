"use client";

import { motion, Variants } from "framer-motion";
import { 
  MessageCircle, 
  Twitter, 
  Github, 
  Users, 
  ExternalLink,
  Heart,
  Sparkles,
  Globe
} from "lucide-react";

interface CommunityLink {
  id: string;
  platform: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  stats?: {
    label: string;
    value: string;
  };
  isLive?: boolean;
}

const communityLinks: CommunityLink[] = [
  {
    id: "discord",
    platform: "Discord",
    title: "Join our Discord Server",
    description: "Get real-time help, share strategies, and connect with the community",
    icon: MessageCircle,
    href: "https://discord.gg/solfolio",
    color: "from-[#5865F2] to-[#7289DA]",
    stats: {
      label: "Members",
      value: "5,234"
    },
    isLive: true
  },
  {
    id: "twitter",
    platform: "Twitter",
    title: "Follow us on Twitter",
    description: "Stay updated with the latest news, features, and announcements",
    icon: Twitter,
    href: "https://twitter.com/solfolio",
    color: "from-[#1DA1F2] to-[#14171A]",
    stats: {
      label: "Followers",
      value: "12.3K"
    }
  },
  {
    id: "github",
    platform: "GitHub",
    title: "Contribute on GitHub",
    description: "View our source code, report issues, and contribute to development",
    icon: Github,
    href: "https://github.com/solfolio",
    color: "from-[#333] to-[#24292e]",
    stats: {
      label: "Stars",
      value: "1.8K"
    }
  },
  {
    id: "telegram",
    platform: "Telegram",
    title: "Telegram Group",
    description: "Join our Telegram group for announcements and discussions",
    icon: MessageCircle,
    href: "https://t.me/solfolio",
    color: "from-[#0088cc] to-[#64B5F6]",
    stats: {
      label: "Members",
      value: "3,421"
    }
  }
];

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
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

const floatingVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function CommunityLinks() {
  return (
    <motion.div
      className="rounded-2xl border border-border-default bg-bg-secondary/50 p-8 backdrop-blur-sm"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-text-primary">Join Our Community</h2>
        <p className="text-text-secondary">
          Connect with thousands of SolFolio users worldwide
        </p>
      </div>

      <div className="space-y-4">
        {communityLinks.map((link, index) => (
          <motion.a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border-default bg-bg-primary/50 p-4 transition-all hover:border-border-hover hover:bg-bg-primary"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Gradient on Hover */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
            />

            {/* Icon */}
            <motion.div
              className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${link.color}`}
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <link.icon className="h-6 w-6 text-white" />
              {link.isLive && (
                <motion.div
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-grow">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-text-primary">
                  {link.title}
                </h3>
                <ExternalLink className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="text-sm text-text-secondary">
                {link.description}
              </p>
            </div>

            {/* Stats */}
            {link.stats && (
              <div className="text-right">
                <p className="text-xs text-text-muted">{link.stats.label}</p>
                <p className="font-semibold text-text-primary">{link.stats.value}</p>
              </div>
            )}
          </motion.a>
        ))}
      </div>

      {/* Community Benefits */}
      <motion.div
        className="mt-8 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Sparkles className="h-5 w-5 text-primary" />
          Community Benefits
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2">
            <Heart className="mt-1 h-4 w-4 text-danger" />
            <div>
              <p className="font-medium text-text-primary">24/7 Support</p>
              <p className="text-xs text-text-secondary">
                Get help anytime from community members
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="mt-1 h-4 w-4 text-success" />
            <div>
              <p className="font-medium text-text-primary">Strategy Sharing</p>
              <p className="text-xs text-text-secondary">
                Learn from experienced DeFi users
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="mt-1 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium text-text-primary">Global Network</p>
              <p className="text-xs text-text-secondary">
                Connect with users worldwide
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="mt-1 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium text-text-primary">Early Access</p>
              <p className="text-xs text-text-secondary">
                Be first to try new features
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Animation Elements */}
      <div className="pointer-events-none absolute -left-10 top-20">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="h-20 w-20 rounded-full bg-primary/10 blur-2xl"
        />
      </div>
      <div className="pointer-events-none absolute -right-10 bottom-20">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="h-20 w-20 rounded-full bg-secondary/10 blur-2xl"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </motion.div>
  );
}