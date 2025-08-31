'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/skeleton';
import { Shimmer, ShimmerWrapper, GradientShimmer, WaveShimmer } from '@/components/ui/shimmer';
import { RefreshCw } from 'lucide-react';

export default function LoadingStatesDemo() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
          Loading States & Skeleton Components
        </h1>
        <p className="text-muted-foreground">
          Comprehensive skeleton loading states with shimmer animations for SolFolio
        </p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </motion.div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="shimmer">Shimmer</TabsTrigger>
        </TabsList>

        {/* Basic Skeletons */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Skeleton Components</CardTitle>
              <CardDescription>Fundamental skeleton building blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" key={`basic-${refreshKey}`}>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Default Skeleton</h3>
                <Skeleton className="h-12 w-full" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Circular Skeleton</h3>
                <div className="flex gap-4">
                  <Skeleton variant="circular" className="h-12 w-12" />
                  <Skeleton variant="circular" className="h-16 w-16" />
                  <Skeleton variant="circular" className="h-20 w-20" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Text Skeleton</h3>
                <SkeletonText lines={3} />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Animation Variants</h3>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" animation="shimmer" />
                  <Skeleton className="h-8 w-full" animation="pulse" />
                  <Skeleton className="h-8 w-full" animation="wave" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Skeletons */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Skeleton Components</CardTitle>
              <CardDescription>Loading states for various card types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" key={`cards-${refreshKey}`}>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Basic Card Skeleton</h3>
                <SkeletonCard showAvatar showTitle showDescription showActions />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Metric Card Skeleton</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SkeletonMetric showIcon showTrend />
                  <SkeletonMetric showIcon />
                  <SkeletonMetric showTrend />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Position Card Skeleton</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkeletonPositionCard />
                  <SkeletonPositionCard />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* List Skeletons */}
        <TabsContent value="lists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>List Skeleton Components</CardTitle>
              <CardDescription>Loading states for lists and tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" key={`lists-${refreshKey}`}>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Token List Skeleton</h3>
                <SkeletonContainer className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <SkeletonTokenRow key={i} />
                  ))}
                </SkeletonContainer>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Table Row Skeleton</h3>
                <div className="border rounded-lg overflow-hidden">
                  <SkeletonContainer>
                    {[1, 2, 3].map(i => (
                      <SkeletonTableRow key={i} columns={5} />
                    ))}
                  </SkeletonContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Skeletons */}
        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chart Skeleton Components</CardTitle>
              <CardDescription>Loading states for data visualizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" key={`charts-${refreshKey}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Area Chart Skeleton</h3>
                  <SkeletonChart type="area" height={200} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Bar Chart Skeleton</h3>
                  <SkeletonChart type="bar" height={200} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Pie Chart Skeleton</h3>
                  <SkeletonChart type="pie" height={200} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Line Chart Skeleton</h3>
                  <SkeletonChart type="line" height={200} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shimmer Effects */}
        <TabsContent value="shimmer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shimmer Effects</CardTitle>
              <CardDescription>Advanced shimmer and wave animations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" key={`shimmer-${refreshKey}`}>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Basic Shimmer</h3>
                <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
                  <Shimmer />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Gradient Shimmer</h3>
                <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
                  <GradientShimmer />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Wave Shimmer</h3>
                <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
                  <WaveShimmer waveCount={3} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Shimmer Wrapper</h3>
                <ShimmerWrapper isLoading={true} variant="intense">
                  <div className="h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Content with shimmer overlay</span>
                  </div>
                </ShimmerWrapper>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Note */}
      <Card className="border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-yellow-500">Performance Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ✅ All animations run at 60 FPS using GPU-accelerated transforms
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ Respects prefers-reduced-motion for accessibility
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ Staggered animations prevent overwhelming the user
          </p>
          <p className="text-sm text-muted-foreground">
            ✅ ARIA attributes included for screen reader support
          </p>
        </CardContent>
      </Card>
    </div>
  );
}