"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Search,
  Code,
  Wallet,
  TrendingUp,
  Shield,
  Settings,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  articles: DocArticle[];
}

interface DocArticle {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  content?: string;
}

const documentation: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      {
        id: "gs-1",
        title: "Welcome to SolFolio",
        excerpt: "An introduction to SolFolio and its key features for tracking your Solana DeFi portfolio",
        readTime: "2 min read"
      },
      {
        id: "gs-2",
        title: "Connecting Your Wallet",
        excerpt: "Step-by-step guide to connect your Solana wallet and start tracking your portfolio",
        readTime: "3 min read"
      },
      {
        id: "gs-3",
        title: "Understanding Your Dashboard",
        excerpt: "Learn how to navigate and use the main dashboard features effectively",
        readTime: "4 min read"
      }
    ]
  },
  {
    id: "wallet",
    title: "Wallet Management",
    icon: Wallet,
    articles: [
      {
        id: "w-1",
        title: "Supported Wallets",
        excerpt: "List of compatible Solana wallets and how to set them up with SolFolio",
        readTime: "3 min read"
      },
      {
        id: "w-2",
        title: "Multiple Wallet Support",
        excerpt: "How to track and manage multiple wallet addresses in one dashboard",
        readTime: "2 min read"
      },
      {
        id: "w-3",
        title: "Wallet Security Tips",
        excerpt: "Best practices for keeping your wallet secure while using DeFi applications",
        readTime: "5 min read"
      }
    ]
  },
  {
    id: "defi",
    title: "DeFi Protocols",
    icon: TrendingUp,
    articles: [
      {
        id: "d-1",
        title: "Supported Protocols Overview",
        excerpt: "Complete list of integrated DeFi protocols and their features",
        readTime: "6 min read"
      },
      {
        id: "d-2",
        title: "Understanding APY and Rewards",
        excerpt: "How yields, APY, and rewards are calculated across different protocols",
        readTime: "4 min read"
      },
      {
        id: "d-3",
        title: "Managing Positions",
        excerpt: "Track and analyze your positions across multiple DeFi protocols",
        readTime: "3 min read"
      }
    ]
  },
  {
    id: "features",
    title: "Advanced Features",
    icon: Zap,
    articles: [
      {
        id: "f-1",
        title: "Portfolio Analytics",
        excerpt: "Deep dive into portfolio performance metrics and analytics tools",
        readTime: "5 min read"
      },
      {
        id: "f-2",
        title: "Price Alerts",
        excerpt: "Set up custom alerts for price movements and portfolio changes",
        readTime: "3 min read"
      },
      {
        id: "f-3",
        title: "Export and Reports",
        excerpt: "Generate detailed reports and export your portfolio data",
        readTime: "2 min read"
      }
    ]
  },
  {
    id: "api",
    title: "API & Developers",
    icon: Code,
    articles: [
      {
        id: "api-1",
        title: "API Introduction",
        excerpt: "Getting started with the SolFolio API for developers",
        readTime: "4 min read"
      },
      {
        id: "api-2",
        title: "Authentication",
        excerpt: "How to authenticate and make secure API requests",
        readTime: "3 min read"
      },
      {
        id: "api-3",
        title: "Endpoints Reference",
        excerpt: "Complete reference guide for all available API endpoints",
        readTime: "8 min read"
      }
    ]
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
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function HelpDocumentation() {
  const [selectedSection, setSelectedSection] = useState<string>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const currentSection = documentation.find(s => s.id === selectedSection);

  const filteredArticles = currentSection?.articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-4 text-3xl font-bold text-text-primary">
          Documentation
        </h2>
        <p className="text-lg text-text-secondary">
          Comprehensive guides and tutorials to help you master SolFolio
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="sticky top-24 space-y-2">
            {documentation.map((section) => {
              const Icon = section.icon;
              const isActive = selectedSection === section.id;
              
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-text-primary"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                  <span className="font-medium">{section.title}</span>
                  {isActive && (
                    <motion.div
                      className="ml-auto"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 90 }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder={`Search in ${currentSection?.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border-border-default bg-bg-secondary/50 pl-12 pr-4 backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Section Title */}
          <motion.div
            key={selectedSection}
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              {currentSection && (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
                    <currentSection.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">
                    {currentSection.title}
                  </h3>
                </>
              )}
            </div>
          </motion.div>

          {/* Articles List */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filteredArticles?.map((article, index) => (
                <motion.div
                  key={article.id}
                  layout
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -20 }}
                  className="overflow-hidden rounded-xl border border-border-default bg-bg-secondary/50 backdrop-blur-sm transition-all hover:border-border-hover hover:bg-bg-secondary"
                >
                  <button
                    onClick={() => setExpandedArticle(
                      expandedArticle === article.id ? null : article.id
                    )}
                    className="flex w-full items-start gap-4 p-6 text-left"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="mb-2 text-lg font-semibold text-text-primary">
                        {article.title}
                      </h4>
                      <p className="mb-2 text-sm text-text-secondary">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-muted">
                          {article.readTime}
                        </span>
                        <motion.span
                          className="text-xs font-medium text-primary"
                          whileHover={{ scale: 1.05 }}
                        >
                          Read more →
                        </motion.span>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedArticle === article.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="border-t border-border-default px-6 py-6">
                          <div className="prose prose-invert max-w-none">
                            <p className="text-text-secondary">
                              This is where the full article content would be displayed. 
                              In a real implementation, this would contain detailed 
                              documentation with code examples, screenshots, and step-by-step 
                              instructions.
                            </p>
                            <p className="mt-4 text-text-secondary">
                              The content would be fetched from a CMS or markdown files and 
                              rendered with proper formatting, syntax highlighting for code 
                              blocks, and embedded images or videos as needed.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredArticles?.length === 0 && (
              <motion.div
                className="rounded-xl border border-border-default bg-bg-secondary/50 p-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FileText className="mx-auto mb-4 h-12 w-12 text-text-muted" />
                <h4 className="mb-2 text-lg font-semibold text-text-primary">
                  No articles found
                </h4>
                <p className="text-text-secondary">
                  Try adjusting your search query
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}