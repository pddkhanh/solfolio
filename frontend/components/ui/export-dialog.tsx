/**
 * Export Dialog Component
 * Provides a comprehensive export interface with format selection and progress tracking
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Database,
  Camera,
  Check,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExport, useExportData, getExportConfig, exportConfigs } from '@/hooks/useExport';
import type { ExportFormat, ExportData, ExportOptions } from '@/lib/export-utils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExportData;
  title?: string;
}

const formatIcons = {
  csv: FileSpreadsheet,
  pdf: FileText,
  json: Database,
  screenshot: Camera,
} as const;

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};


export function ExportDialog({ open, onOpenChange, data, title = 'Export Portfolio Data' }: ExportDialogProps) {
  const { exportData, isExporting, progress, error } = useExport();
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('csv');
  const [filename, setFilename] = React.useState('');
  const [includeTimestamp, setIncludeTimestamp] = React.useState(true);
  const [includeWatermark, setIncludeWatermark] = React.useState(true);

  const availableFormats = [
    {
      value: 'csv' as ExportFormat,
      label: 'CSV Spreadsheet',
      description: 'Export data in CSV format for Excel/Sheets',
      icon: FileSpreadsheet,
    },
    {
      value: 'pdf' as ExportFormat,
      label: 'PDF Report',
      description: 'Generate a comprehensive PDF report',
      icon: FileText,
    },
    {
      value: 'json' as ExportFormat,
      label: 'JSON Data',
      description: 'Raw data in JSON format for developers',
      icon: Database,
    },
    {
      value: 'screenshot' as ExportFormat,
      label: 'Screenshot',
      description: 'Capture a high-resolution screenshot',
      icon: Camera,
    },
  ];

  const selectedConfig = React.useMemo(() => getExportConfig(selectedFormat), [selectedFormat]);

  const handleExport = async () => {
    const options: ExportOptions = {
      filename: filename.trim() || undefined,
      includeTimestamp,
      includeWatermark,
      format: selectedFormat,
    };

    await exportData(selectedFormat, data, options);
  };

  const handleClose = () => {
    if (!isExporting) {
      onOpenChange(false);
    }
  };

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setFilename('');
      setSelectedFormat('csv');
      setIncludeTimestamp(true);
      setIncludeWatermark(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format and customize the output settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
            className="space-y-4"
          >
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFormats.map((format, index) => {
                const Icon = format.icon;
                const config = exportConfigs[format.value];
                const isSelected = selectedFormat === format.value;

                return (
                  <motion.div
                    key={format.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    <motion.button
                      type="button"
                      onClick={() => setSelectedFormat(format.value)}
                      disabled={isExporting}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
                        "hover:border-primary/50 focus:border-primary focus:outline-none",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:bg-accent/50"
                      )}
                      whileHover={!isExporting ? { scale: 1.02 } : undefined}
                      whileTap={!isExporting ? { scale: 0.98 } : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-md shrink-0",
                          config.bgColor
                        )}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{format.label}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {format.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>⏱️ {config.estimatedTime}</span>
                            <span>💾 {config.fileSize}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <Label className="text-base font-medium">Export Options</Label>
            
            {/* Custom Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename" className="text-sm">
                Custom Filename (optional)
              </Label>
              <Input
                id="filename"
                placeholder="Enter custom filename..."
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isExporting}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default naming with timestamp
              </p>
            </div>

            {/* Timestamp Option */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Include Timestamp</Label>
                <p className="text-xs text-muted-foreground">
                  Add current date and time to filename
                </p>
              </div>
              <Switch
                checked={includeTimestamp}
                onCheckedChange={setIncludeTimestamp}
                disabled={isExporting}
              />
            </div>

            {/* Watermark Option (for PDF and Screenshot) */}
            {(selectedFormat === 'pdf' || selectedFormat === 'screenshot') && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Include Watermark</Label>
                  <p className="text-xs text-muted-foreground">
                    Add SolFolio branding to exported file
                  </p>
                </div>
                <Switch
                  checked={includeWatermark}
                  onCheckedChange={setIncludeWatermark}
                  disabled={isExporting}
                />
              </div>
            )}
          </motion.div>

          {/* Progress Indicator */}
          <AnimatePresence>
            {isExporting && progress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{progress.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Phase: {progress.phase}
                      </p>
                    </div>
                    <span className="text-sm font-mono text-primary">
                      {progress.progress}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Export Failed</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {data.tokens.length} tokens, {data.positions.length} positions
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExportDialog;