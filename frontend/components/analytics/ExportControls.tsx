'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Image, Share2, Check } from 'lucide-react';

type ExportFormat = 'pdf' | 'csv' | 'json' | 'png';

export default function ExportControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [exportComplete, setExportComplete] = useState(false);

  const exportOptions = [
    { format: 'pdf' as ExportFormat, label: 'PDF Report', icon: FileText, color: 'text-red-400' },
    { format: 'csv' as ExportFormat, label: 'CSV Data', icon: FileSpreadsheet, color: 'text-green-400' },
    { format: 'json' as ExportFormat, label: 'JSON Export', icon: FileText, color: 'text-yellow-400' },
    { format: 'png' as ExportFormat, label: 'Screenshot', icon: Image, color: 'text-blue-400' },
  ];

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setExportingFormat(null);
    setExportComplete(true);
    
    // Reset complete state after animation
    setTimeout(() => {
      setExportComplete(false);
      setIsOpen(false);
    }, 2000);

    // In real implementation, generate and download the file
    console.log(`Exporting as ${format}...`);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary border border-border-default rounded-lg hover:border-border-hover transition-all"
      >
        {exportComplete ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Download className="w-4 h-4 text-text-secondary" />
        )}
        <span className="text-white text-sm font-medium hidden sm:inline">
          {exportComplete ? 'Exported!' : 'Export'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 z-50"
          >
            <div className="bg-bg-tertiary border border-border-default rounded-lg shadow-xl p-2 min-w-[200px]">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border-default mb-2">
                <Share2 className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary text-sm">Export Analytics</span>
              </div>

              {exportOptions.map((option, index) => {
                const Icon = option.icon;
                const isExporting = exportingFormat === option.format;

                return (
                  <motion.button
                    key={option.format}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => handleExport(option.format)}
                    disabled={exportingFormat !== null}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    <div className={`${option.color} ${isExporting ? 'animate-pulse' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-white text-sm flex-1 text-left">
                      {option.label}
                    </span>
                    {isExporting && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}

              <div className="mt-2 pt-2 border-t border-border-default">
                <div className="px-3 py-2">
                  <p className="text-text-muted text-xs mb-1">Export includes:</p>
                  <ul className="text-text-muted text-xs space-y-0.5">
                    <li>• Portfolio metrics</li>
                    <li>• Transaction history</li>
                    <li>• Performance charts</li>
                    <li>• Asset allocations</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}