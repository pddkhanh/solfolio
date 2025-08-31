/**
 * Export Progress Component
 * Animated progress indicator for export operations
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExportProgress as ExportProgressType, ExportFormat } from '@/lib/export-utils';

interface ExportProgressProps {
  progress: ExportProgressType;
  format?: ExportFormat;
  className?: string;
}

const formatIcons = {
  csv: FileSpreadsheet,
  pdf: FileText,
  json: Database,
  screenshot: Camera,
} as const;


export function ExportProgress({ 
  progress, 
  format = 'csv',
  className 
}: ExportProgressProps) {
  const FormatIcon = formatIcons[format] || Download;
  
  const getPhaseIcon = () => {
    switch (progress.phase) {
      case 'complete':
        return CheckCircle2;
      case 'preparing':
      case 'processing':
      case 'generating':
        return Loader2;
      default:
        return AlertCircle;
    }
  };

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'complete':
        return 'text-green-500';
      case 'preparing':
        return 'text-blue-500';
      case 'processing':
        return 'text-orange-500';
      case 'generating':
        return 'text-purple-500';
      default:
        return 'text-red-500';
    }
  };

  const getProgressColor = () => {
    switch (progress.phase) {
      case 'complete':
        return 'from-green-500 to-green-600';
      case 'preparing':
        return 'from-blue-500 to-blue-600';
      case 'processing':
        return 'from-orange-500 to-orange-600';
      case 'generating':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-primary to-primary/80';
    }
  };

  const PhaseIcon = getPhaseIcon();
  const phaseColor = getPhaseColor();
  const progressColor = getProgressColor();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "p-4 rounded-lg border bg-card/50 backdrop-blur-sm",
          "border-border/50 shadow-lg",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={progress.phase !== 'complete' ? {
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            } : undefined}
            className="p-2 rounded-full bg-primary/10"
          >
            <FormatIcon className="w-5 h-5 text-primary" />
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <PhaseIcon 
                className={cn(
                  "w-4 h-4",
                  phaseColor,
                  progress.phase === 'complete' ? '' : 'animate-spin'
                )} 
              />
              <span className="font-medium text-sm capitalize">
                {progress.phase === 'complete' ? 'Export Complete' : progress.message}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">
                {progress.phase} • {format.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-primary">
                {progress.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full bg-gradient-to-r",
                progressColor
              )}
              initial={{ width: '0%' }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={cn(
              progress.progress >= 25 ? 'text-primary' : ''
            )}>
              Preparing
            </span>
            <span className={cn(
              progress.progress >= 50 ? 'text-primary' : ''
            )}>
              Processing
            </span>
            <span className={cn(
              progress.progress >= 75 ? 'text-primary' : ''
            )}>
              Generating
            </span>
            <span className={cn(
              progress.progress >= 100 ? 'text-green-500' : ''
            )}>
              Complete
            </span>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {progress.phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-md bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Export successful! File has been downloaded.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact Progress Indicator for inline use
 */
export function ExportProgressCompact({ 
  progress, 
  format = 'csv',
  className 
}: ExportProgressProps) {
  const PhaseIcon = progress.phase === 'complete' ? CheckCircle2 : Loader2;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full",
        "bg-primary/10 border border-primary/20",
        className
      )}
    >
      <PhaseIcon 
        className={cn(
          "w-4 h-4 text-primary",
          progress.phase !== 'complete' ? 'animate-spin' : ''
        )} 
      />
      <span className="text-sm font-medium">
        {progress.message}
      </span>
      <span className="text-xs font-mono text-primary px-1.5 py-0.5 bg-primary/20 rounded">
        {progress.progress}%
      </span>
    </motion.div>
  );
}

export default ExportProgress;