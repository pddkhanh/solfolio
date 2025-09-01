/**
 * Export Button Component
 * Animated button that opens the export dialog
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportDialog } from '@/components/ui/export-dialog';
import { useExport, useExportData, exportConfigs } from '@/hooks/useExport';
import type { ExportFormat, ExportData } from '@/lib/export-utils';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  data: ExportData;
  variant?: 'default' | 'outline' | 'ghost' | 'dropdown';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
  showQuickActions?: boolean;
}


export function ExportButton({
  data,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  showQuickActions = true,
}: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { exportData, isExporting } = useExport();

  const handleQuickExport = async (format: ExportFormat) => {
    await exportData(format, data, {
      includeTimestamp: true,
      includeWatermark: true,
    });
  };

  const formatOptions = [
    {
      format: 'csv' as ExportFormat,
      label: 'CSV Spreadsheet',
      icon: '📊',
      description: 'Quick export to Excel/Sheets',
    },
    {
      format: 'pdf' as ExportFormat,
      label: 'PDF Report',
      icon: '📄',
      description: 'Professional report format',
    },
    {
      format: 'json' as ExportFormat,
      label: 'JSON Data',
      icon: '💾',
      description: 'Developer-friendly format',
    },
    {
      format: 'screenshot' as ExportFormat,
      label: 'Screenshot',
      icon: '📸',
      description: 'Visual capture of dashboard',
    },
  ];

  // Simple button variant
  if (variant !== 'dropdown') {
    return (
      <>
        <motion.div
          initial={{ scale: 1 }}
          whileHover={!disabled && !isExporting ? { scale: 1.02 } : undefined}
          whileTap={!disabled && !isExporting ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant={variant}
            size={size}
            onClick={() => setDialogOpen(true)}
            disabled={disabled || isExporting}
            className={cn(
              "relative overflow-hidden",
              "bg-gradient-to-r from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "transition-all duration-200",
              className
            )}
          >
            <div className="flex items-center gap-2 relative z-10">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </div>
            
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Button>
        </motion.div>
        
        <ExportDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          data={data}
        />
      </>
    );
  }

  // Dropdown variant with quick actions
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ scale: 1 }}
            whileHover={!disabled && !isExporting ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !isExporting ? { scale: 0.98 } : undefined}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="default"
              size={size}
              disabled={disabled || isExporting}
              className={cn(
                "relative overflow-hidden",
                "bg-gradient-to-r from-primary to-primary/80",
                "hover:from-primary/90 hover:to-primary/70",
                "transition-all duration-200",
                className
              )}
            >
              <div className="flex items-center gap-2 relative z-10">
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-64 p-2"
          forceMount
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b mb-2">
              Quick Export
            </div>

            {showQuickActions && formatOptions.map((option) => {
              const config = exportConfigs[option.format];
              
              return (
                <DropdownMenuItem
                  key={option.format}
                  onClick={() => handleQuickExport(option.format)}
                  disabled={isExporting}
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent rounded-md transition-colors"
                >
                  <span className="text-lg shrink-0 mt-0.5">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        config.bgColor,
                        config.color
                      )}>
                        {config.estimatedTime}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={() => setDialogOpen(true)}
              disabled={isExporting}
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-accent rounded-md transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>More Options...</span>
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
      />
    </>
  );
}

export default ExportButton;