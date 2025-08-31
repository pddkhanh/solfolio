"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EmptyState, EmptyStateInline } from "@/components/ui/empty-state";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonContainer,
  SkeletonMetric,
  SkeletonTokenRow,
  SkeletonPositionCard,
  SkeletonChart,
} from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

/**
 * Empty States & Skeleton Loaders Showcase
 * Interactive demo page showing all empty state variants and skeleton loaders
 * Implements TASK-UI-015 requirements
 */
export default function EmptyStatesShowcase() {
  const [activeEmptyState, setActiveEmptyState] = useState<string>("no-wallet");
  const [activeSkeletonType, setActiveSkeletonType] = useState<string>("basic");
  const [showRetryCountdown, setShowRetryCountdown] = useState(false);

  const emptyStateVariants = [
    { id: "no-wallet", label: "No Wallet", description: "User hasn't connected wallet" },
    { id: "no-tokens", label: "No Tokens", description: "Wallet has no tokens" },
    { id: "no-positions", label: "No Positions", description: "No DeFi positions" },
    { id: "no-results", label: "No Results", description: "Search/filter returned empty" },
    { id: "no-history", label: "No History", description: "No transaction history" },
    { id: "network-error", label: "Network Error", description: "Connection issues" },
    { id: "maintenance", label: "Maintenance", description: "Service temporarily down" },
    { id: "error", label: "Error", description: "Generic error state" },
    { id: "loading", label: "Loading", description: "Data is loading" },
    { id: "custom", label: "Custom", description: "Custom empty state" },
  ];

  const skeletonTypes = [
    { id: "basic", label: "Basic Shapes" },
    { id: "text", label: "Text Content" },
    { id: "cards", label: "Card Layouts" },
    { id: "table", label: "Table Rows" },
    { id: "metrics", label: "Metrics" },
    { id: "tokens", label: "Token List" },
    { id: "positions", label: "Position Cards" },
    { id: "charts", label: "Charts" },
    { id: "composed", label: "Composed Views" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 gradient-text">
          Empty States & Skeleton Loaders
        </h1>
        <p className="text-text-secondary text-lg">
          Beautiful empty states and loading skeletons for every scenario in SolFolio
        </p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="empty-states" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="empty-states">Empty States</TabsTrigger>
          <TabsTrigger value="skeleton-loaders">Skeleton Loaders</TabsTrigger>
        </TabsList>

        {/* Empty States Tab */}
        <TabsContent value="empty-states" className="space-y-6">
          <Card className="border-border-default bg-bg-secondary">
            <CardHeader>
              <CardTitle>Empty State Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variant Selector */}
              <div className="flex flex-wrap gap-2">
                {emptyStateVariants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={activeEmptyState === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveEmptyState(variant.id)}
                    className="group"
                  >
                    {variant.label}
                    {activeEmptyState === variant.id && (
                      <motion.span
                        className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </Button>
                ))}
              </div>

              {/* Empty State Preview */}
              <div className="relative rounded-xl border border-border-default bg-bg-primary p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                  variant={activeEmptyState as any}
                  action={{
                    label: "Primary Action",
                    onClick: () => console.log("Primary action clicked"),
                  }}
                  secondaryAction={
                    ["no-tokens", "no-positions", "error", "network-error"].includes(activeEmptyState)
                      ? {
                          label: "Secondary Action",
                          onClick: () => console.log("Secondary action clicked"),
                        }
                      : undefined
                  }
                  showRetryAfter={
                    ["network-error", "maintenance"].includes(activeEmptyState) && showRetryCountdown
                      ? 60
                      : undefined
                  }
                  animated={true}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showRetryCountdown}
                    onChange={(e) => setShowRetryCountdown(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Show retry countdown (for network/maintenance states)
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg bg-bg-tertiary border border-border-default">
                <h4 className="font-semibold mb-2">
                  {emptyStateVariants.find((v) => v.id === activeEmptyState)?.label}
                </h4>
                <p className="text-sm text-text-secondary">
                  {emptyStateVariants.find((v) => v.id === activeEmptyState)?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Inline Empty State */}
          <Card className="border-border-default bg-bg-secondary">
            <CardHeader>
              <CardTitle>Inline Empty State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border-default bg-bg-primary p-4">
                <EmptyStateInline message="No data available" />
              </div>
              <p className="text-sm text-text-secondary mt-4">
                Use inline empty states for compact spaces like table cells or small sections.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skeleton Loaders Tab */}
        <TabsContent value="skeleton-loaders" className="space-y-6">
          <Card className="border-border-default bg-bg-secondary">
            <CardHeader>
              <CardTitle>Skeleton Loader Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Selector */}
              <div className="flex flex-wrap gap-2">
                {skeletonTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={activeSkeletonType === type.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSkeletonType(type.id)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Skeleton Preview */}
              <div className="space-y-6">
                {activeSkeletonType === "basic" && <BasicSkeletons />}
                {activeSkeletonType === "text" && <TextSkeletons />}
                {activeSkeletonType === "cards" && <CardSkeletons />}
                {activeSkeletonType === "table" && <TableSkeletons />}
                {activeSkeletonType === "metrics" && <MetricSkeletons />}
                {activeSkeletonType === "tokens" && <TokenSkeletons />}
                {activeSkeletonType === "positions" && <PositionSkeletons />}
                {activeSkeletonType === "charts" && <ChartSkeletons />}
                {activeSkeletonType === "composed" && <ComposedSkeletons />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Guidelines */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Card className="border-border-default bg-bg-secondary">
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-lg font-semibold mb-3">Empty States</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Use appropriate variant for each scenario</li>
                  <li>• Always provide actionable CTAs</li>
                  <li>• Keep descriptions concise and helpful</li>
                  <li>• Include illustrations for visual appeal</li>
                  <li>• Test with real user scenarios</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Skeleton Loaders</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Match the exact structure of content</li>
                  <li>• Use shimmer animation for visual feedback</li>
                  <li>• Implement progressive loading when possible</li>
                  <li>• Avoid layout shift when content loads</li>
                  <li>• Consider staggered animations for lists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Skeleton Components Showcase
function BasicSkeletons() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-secondary">Basic Shapes</h4>
        <div className="flex gap-4 items-center">
          <Skeleton className="w-32 h-10" />
          <Skeleton variant="circular" className="w-12 h-12" />
          <Skeleton variant="text" className="w-48" />
          <Skeleton variant="rectangular" className="w-24 h-16" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-secondary">Animation Types</h4>
        <div className="flex gap-4">
          <Skeleton animation="shimmer" className="w-32 h-10" />
          <Skeleton animation="pulse" className="w-32 h-10" />
          <Skeleton animation="wave" className="w-32 h-10" />
          <Skeleton animation="none" className="w-32 h-10" />
        </div>
      </div>
    </div>
  );
}

function TextSkeletons() {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-4">Single Line</h4>
        <SkeletonText lines={1} />
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-4">Multiple Lines</h4>
        <SkeletonText lines={3} />
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-text-secondary mb-4">Custom Widths</h4>
        <SkeletonText lines={4} widths={["100%", "80%", "90%", "60%"]} />
      </div>
    </div>
  );
}

function CardSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonCard showAvatar={true} showActions={true} />
      <SkeletonCard showAvatar={false} showActions={false} />
    </div>
  );
}

function TableSkeletons() {
  return (
    <div className="rounded-lg border border-border-default overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <SkeletonTableRow key={i} columns={4} />
      ))}
    </div>
  );
}

function MetricSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SkeletonMetric showIcon={true} showTrend={true} />
      <SkeletonMetric showIcon={true} showTrend={false} />
      <SkeletonMetric showIcon={false} showTrend={true} />
    </div>
  );
}

function TokenSkeletons() {
  return (
    <div className="rounded-lg border border-border-default overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <SkeletonTokenRow key={i} showActions={i === 0} />
      ))}
    </div>
  );
}

function PositionSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonPositionCard />
      <SkeletonPositionCard />
    </div>
  );
}

function ChartSkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonChart type="area" height={200} />
      <SkeletonChart type="bar" height={200} />
      <SkeletonChart type="pie" height={200} />
      <SkeletonChart type="line" height={200} />
    </div>
  );
}

function ComposedSkeletons() {
  return (
    <SkeletonContainer className="space-y-6">
      {/* Portfolio Overview */}
      <motion.div variants={staggerItem}>
        <Card className="border-border-default bg-bg-secondary">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonMetric key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Token List */}
      <motion.div variants={staggerItem}>
        <Card className="border-border-default bg-bg-secondary">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <SkeletonTokenRow key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </SkeletonContainer>
  );
}