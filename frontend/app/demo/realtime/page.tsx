'use client';

import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { RealtimePortfolioCard } from '@/components/realtime';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';

export default function RealtimeDemoPage() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Real-time Updates Demo
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Experience smooth 60 FPS animations and live data updates
              </p>
            </header>

            <RealtimePortfolioCard />
          </motion.div>
        </div>
        
        {/* Toast notifications container */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            },
          }}
        />
      </div>
    </WebSocketProvider>
  );
}