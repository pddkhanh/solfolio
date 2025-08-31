"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Wallet, Shield, TrendingUp, DollarSign, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I connect my Solana wallet to SolFolio?",
    answer: "Click the 'Connect Wallet' button in the top right corner of the page. Select your preferred wallet from the list (Phantom, Solflare, etc.) and approve the connection request. Your portfolio will automatically load once connected.",
    icon: Wallet
  },
  {
    id: "2",
    category: "Getting Started",
    question: "Is SolFolio safe to use? Do you have access to my funds?",
    answer: "Yes, SolFolio is completely safe. We never have access to your private keys or funds. All interactions are read-only through your wallet's public address. We cannot move or access your assets.",
    icon: Shield
  },
  {
    id: "3",
    category: "Portfolio",
    question: "Which DeFi protocols does SolFolio support?",
    answer: "SolFolio currently supports major Solana DeFi protocols including Marinade, Kamino, Orca, Raydium, Marginfi, and more. We're constantly adding support for new protocols.",
    icon: TrendingUp
  },
  {
    id: "4",
    category: "Portfolio",
    question: "How often does my portfolio data update?",
    answer: "Token balances and prices update every 60 seconds automatically. Position data from DeFi protocols updates every 5 minutes. You can also manually refresh at any time using the refresh button.",
    icon: RefreshCw
  },
  {
    id: "5",
    category: "Pricing",
    question: "How are token prices calculated?",
    answer: "Token prices are fetched from Jupiter's Price API, which aggregates prices from multiple DEXs on Solana to provide accurate, real-time pricing data.",
    icon: DollarSign
  },
  {
    id: "6",
    category: "Pricing",
    question: "Is SolFolio free to use?",
    answer: "Yes! SolFolio is completely free to use. We don't charge any fees for tracking your portfolio or accessing any features.",
    icon: DollarSign
  },
  {
    id: "7",
    category: "Features",
    question: "Can I export my portfolio data?",
    answer: "Yes, you can export your portfolio data in CSV or PDF format. Click the export button in your portfolio view and select your preferred format.",
    icon: HelpCircle
  },
  {
    id: "8",
    category: "Features",
    question: "Does SolFolio have a mobile app?",
    answer: "We don't have a native mobile app yet, but SolFolio is fully responsive and works great on mobile browsers. A dedicated mobile app is on our roadmap.",
    icon: HelpCircle
  },
  {
    id: "9",
    category: "Technical",
    question: "Why isn't my position showing up?",
    answer: "If a position isn't showing, it could be because: 1) The protocol isn't supported yet, 2) There's a temporary sync issue (try refreshing), or 3) The position might be in a different wallet address.",
    icon: HelpCircle
  },
  {
    id: "10",
    category: "Technical",
    question: "What browsers are supported?",
    answer: "SolFolio works best on modern browsers including Chrome, Firefox, Safari, Edge, and Brave. We recommend using the latest version for the best experience.",
    icon: HelpCircle
  }
];

const categories = ["All", "Getting Started", "Portfolio", "Pricing", "Features", "Technical"];

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-4 text-3xl font-bold text-text-primary">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-text-secondary">
          Find answers to common questions about SolFolio
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-xl border-border-default bg-bg-secondary/50 pl-12 pr-4 backdrop-blur-sm transition-all duration-200 focus:bg-bg-secondary"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* FAQ Items */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-border-default bg-bg-secondary/50 backdrop-blur-sm transition-all hover:border-border-hover"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="flex w-full items-center gap-4 p-6 text-left transition-all hover:bg-bg-secondary/80"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-text-muted">
                      {item.category}
                    </p>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {item.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedItems.has(item.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-text-muted" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {expandedItems.has(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div className="border-t border-border-default px-6 py-4">
                        <p className="text-text-secondary leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="rounded-xl border border-border-default bg-bg-secondary/50 p-12 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HelpCircle className="mx-auto mb-4 h-12 w-12 text-text-muted" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                No FAQs found
              </h3>
              <p className="text-text-secondary">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Still Need Help */}
      <motion.div
        className="mt-12 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-2 text-xl font-semibold text-text-primary">
          Still have questions?
        </h3>
        <p className="mb-4 text-text-secondary">
          Can&apos;t find what you&apos;re looking for? Contact our support team
        </p>
        <motion.a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact Support
        </motion.a>
      </motion.div>
    </div>
  );
}