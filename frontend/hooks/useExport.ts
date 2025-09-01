/**
 * Export Hook for SolFolio
 * Manages export functionality with progress tracking and error handling
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  ExportManager,
  type ExportFormat,
  type ExportData,
  type ExportOptions,
  type ExportProgress
} from '@/lib/export-utils';

interface UseExportState {
  isExporting: boolean;
  progress: ExportProgress | null;
  error: string | null;
}

interface UseExportReturn {
  isExporting: boolean;
  progress: ExportProgress | null;
  error: string | null;
  exportData: (format: ExportFormat, data: ExportData, options?: ExportOptions) => Promise<void>;
  resetState: () => void;
  getAvailableFormats: () => Array<{ value: ExportFormat; label: string; description: string }>;
}

/**
 * Hook for managing data export functionality
 */
export function useExport(): UseExportReturn {
  const [state, setState] = useState<UseExportState>({
    isExporting: false,
    progress: null,
    error: null,
  });

  const resetState = useCallback(() => {
    setState({
      isExporting: false,
      progress: null,
      error: null,
    });
  }, []);

  const updateProgress = useCallback((progress: ExportProgress) => {
    setState(prev => ({
      ...prev,
      progress,
    }));
  }, []);

  const exportData = useCallback(async (
    format: ExportFormat,
    data: ExportData,
    options: ExportOptions = {}
  ) => {
    try {
      setState({
        isExporting: true,
        progress: {
          phase: 'preparing',
          progress: 0,
          message: 'Starting export...'
        },
        error: null,
      });

      // Show initial toast
      toast.loading(`Exporting as ${format.toUpperCase()}...`, {
        id: 'export-progress',
        duration: Infinity,
      });

      await ExportManager.export(format, data, options, updateProgress);

      // Success state
      setState(prev => ({
        ...prev,
        isExporting: false,
      }));

      // Show success toast
      toast.success(`${format.toUpperCase()} export completed successfully!`, {
        id: 'export-progress',
        duration: 3000,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      
      setState({
        isExporting: false,
        progress: null,
        error: errorMessage,
      });

      // Show error toast
      toast.error(`Export failed: ${errorMessage}`, {
        id: 'export-progress',
        duration: 5000,
      });

      console.error('Export Error:', error);
    }
  }, [updateProgress]);

  const getAvailableFormats = useCallback(() => {
    return ExportManager.getExportFormats();
  }, []);

  return {
    isExporting: state.isExporting,
    progress: state.progress,
    error: state.error,
    exportData,
    resetState,
    getAvailableFormats,
  };
}

/**
 * Hook for transforming portfolio data into export format
 */
export function useExportData() {
  const transformPortfolioData = useCallback((portfolioData: any): ExportData => {
    return {
      portfolio: {
        totalValue: portfolioData?.totalValue || 0,
        change24h: portfolioData?.change24h || 0,
        changePercent: portfolioData?.changePercent || 0,
        lastUpdated: portfolioData?.lastUpdated || new Date().toISOString(),
      },
      tokens: (portfolioData?.tokens || []).map((token: any) => ({
        symbol: token.symbol || 'Unknown',
        name: token.name || 'Unknown Token',
        balance: token.balance || 0,
        value: token.value || 0,
        price: token.price || 0,
        change24h: token.change24h || 0,
        changePercent: token.changePercent || 0,
      })),
      positions: (portfolioData?.positions || []).map((position: any) => ({
        protocol: position.protocol || 'Unknown',
        type: position.type || 'Unknown',
        value: position.value || 0,
        apy: position.apy || 0,
        rewards: position.rewards || 0,
        status: position.status || 'Unknown',
      })),
    };
  }, []);

  return {
    transformPortfolioData,
  };
}

/**
 * Export format configurations
 */
export const exportConfigs = {
  csv: {
    icon: '📊',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    estimatedTime: '< 1 second',
    fileSize: 'Small (< 1MB)',
  },
  pdf: {
    icon: '📄',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    estimatedTime: '2-5 seconds',
    fileSize: 'Medium (1-5MB)',
  },
  json: {
    icon: '💾',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    estimatedTime: '< 1 second',
    fileSize: 'Small (< 500KB)',
  },
  screenshot: {
    icon: '📸',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    estimatedTime: '3-8 seconds',
    fileSize: 'Large (2-10MB)',
  },
} as const;

/**
 * Utility function to get export config for a format
 */
export function getExportConfig(format: ExportFormat) {
  return exportConfigs[format];
}