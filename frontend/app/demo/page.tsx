"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { 
  HelpCircle, 
  Loader2, 
  AlertTriangle, 
  Smartphone,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface DemoItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  taskId: string;
  color: string;
  isNew?: boolean;
}

const demos: DemoItem[] = [
  {
    id: "help",
    title: "Help & Support UI",
    description: "Comprehensive help system with contact form, FAQ, documentation, and community links",
    icon: HelpCircle,
    href: "/demo/help",
    taskId: "TASK-UI-018",
    color: "from-primary to-secondary",
    isNew: true
  },
  {
    id: "loading",
    title: "Loading States",
    description: "Progressive loading, skeletons, and shimmer effects",
    icon: Loader2,
    href: "/demo/loading-states",
    taskId: "TASK-UI-008",
    color: "from-accent to-primary"
  },
  {
    id: "error",
    title: "Error Boundaries",
    description: "Error handling, fallback UI, and recovery mechanisms",
    icon: AlertTriangle,
    href: "/demo/error-boundary",
    taskId: "TASK-UI-012",
    color: "from-danger to-warning"
  },
  {
    id: "touch",
    title: "Touch Interactions",
    description: "Mobile gestures, swipe actions, and touch-optimized components",
    icon: Smartphone,
    href: "/demo/touch",
    taskId: "TASK-UI-017",
    color: "from-secondary to-accent"
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

export default function DemoIndexPage() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-secondary">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SolFolio UI Demos
          </h1>
          <p className="text-xl text-text-secondary">
            Interactive demonstrations of UI components and features
          </p>
        </motion.div>

        {/* Demo Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {demos.map((demo, index) => (
            <motion.div
              key={demo.id}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={demo.href}
                className="group relative block overflow-hidden rounded-xl border border-border-default bg-bg-secondary/50 p-8 backdrop-blur-sm transition-all hover:border-border-hover hover:bg-bg-secondary hover:shadow-xl"
              >
                {/* Background Gradient */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                />

                {/* Badge */}
                {demo.isNew && (
                  <motion.span
                    className="absolute right-4 top-4 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    NEW
                  </motion.span>
                )}

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <motion.div
                    className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${demo.color} p-3`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <demo.icon className="h-6 w-6 text-white" />
                  </motion.div>

                  {/* Task ID */}
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    {demo.taskId}
                  </p>

                  {/* Title */}
                  <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-text-primary">
                    {demo.title}
                    <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-2 group-hover:opacity-50" />
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary">
                    {demo.description}
                  </p>

                  {/* View Demo Link */}
                  <div className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View Demo →
                  </div>
                </div>

                {/* Hover Effect Line */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${demo.color}`}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-12 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-semibold text-text-primary">
            More Demos Coming Soon
          </h2>
          <p className="text-text-secondary">
            We&apos;re continuously adding new UI components and features to showcase the full capabilities of SolFolio
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}