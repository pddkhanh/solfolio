'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Network, Info } from 'lucide-react';
import { TimePeriod } from '@/app/analytics/page';

interface CorrelationMatrixProps {
  timePeriod: TimePeriod;
}

const assets = ['SOL', 'USDC', 'RAY', 'ORCA', 'MNDE', 'JTO'];

// Generate mock correlation data
const generateCorrelationData = () => {
  const matrix: number[][] = [];
  for (let i = 0; i < assets.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < assets.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i];
      } else {
        // Generate realistic correlation values
        if (assets[i] === 'USDC' || assets[j] === 'USDC') {
          matrix[i][j] = Math.random() * 0.3 - 0.15; // Low correlation with stablecoin
        } else {
          matrix[i][j] = Math.random() * 0.8 + 0.1; // Higher correlation between crypto assets
        }
      }
    }
  }
  return matrix;
};

export default function CorrelationMatrix({ timePeriod }: CorrelationMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{ i: number; j: number } | null>(null);
  const correlationData = generateCorrelationData();

  const getCorrelationColor = (value: number) => {
    if (value === 1) return 'rgba(153, 69, 255, 1)';
    if (value > 0.7) return 'rgba(20, 241, 149, 0.8)';
    if (value > 0.3) return 'rgba(0, 212, 255, 0.6)';
    if (value > -0.3) return 'rgba(107, 114, 128, 0.4)';
    if (value > -0.7) return 'rgba(255, 184, 0, 0.6)';
    return 'rgba(255, 71, 71, 0.8)';
  };

  const getCorrelationLabel = (value: number) => {
    if (value === 1) return 'Perfect';
    if (value > 0.7) return 'Strong +';
    if (value > 0.3) return 'Moderate +';
    if (value > -0.3) return 'Weak';
    if (value > -0.7) return 'Moderate -';
    return 'Strong -';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-bg-secondary border border-border-default rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Asset Correlation Matrix
          </h2>
          <p className="text-text-secondary text-sm">
            Price correlation between assets over {timePeriod}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-bg-tertiary border border-border-default hover:border-border-hover transition-all"
        >
          <Info className="w-4 h-4 text-text-secondary" />
        </motion.button>
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Column Headers */}
          <div className="flex mb-2">
            <div className="w-16" /> {/* Empty corner */}
            {assets.map((asset) => (
              <div
                key={asset}
                className="flex-1 text-center text-text-secondary text-sm font-medium"
              >
                {asset}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {assets.map((rowAsset, i) => (
            <motion.div
              key={rowAsset}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="flex mb-1"
            >
              {/* Row Header */}
              <div className="w-16 flex items-center justify-end pr-3 text-text-secondary text-sm font-medium">
                {rowAsset}
              </div>

              {/* Matrix Cells */}
              {assets.map((colAsset, j) => {
                const value = correlationData[i][j];
                const isHovered = hoveredCell?.i === i && hoveredCell?.j === j;

                return (
                  <motion.div
                    key={`${i}-${j}`}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    onMouseEnter={() => setHoveredCell({ i, j })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className="flex-1 aspect-square relative"
                  >
                    <div
                      className="absolute inset-0.5 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: getCorrelationColor(value),
                        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.5)' : 'none',
                      }}
                    >
                      <span className="text-white text-xs font-medium">
                        {value.toFixed(2)}
                      </span>
                    </div>

                    {/* Tooltip */}
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20"
                      >
                        <div className="bg-bg-tertiary border border-border-default rounded-lg p-2 shadow-xl whitespace-nowrap">
                          <p className="text-white text-sm font-medium">
                            {rowAsset} / {colAsset}
                          </p>
                          <p className="text-text-secondary text-xs">
                            Correlation: {value.toFixed(3)}
                          </p>
                          <p className="text-text-muted text-xs">
                            {getCorrelationLabel(value)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-text-secondary" />
          <span className="text-text-secondary text-sm">Correlation Scale</span>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Strong -', color: 'rgba(255, 71, 71, 0.8)' },
            { label: 'Weak', color: 'rgba(107, 114, 128, 0.4)' },
            { label: 'Strong +', color: 'rgba(20, 241, 149, 0.8)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-muted text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 p-4 bg-bg-tertiary rounded-lg border border-border-default"
      >
        <p className="text-text-secondary text-sm mb-2">Key Insights:</p>
        <ul className="space-y-1 text-text-muted text-xs">
          <li>• USDC shows low correlation with other assets (good for diversification)</li>
          <li>• SOL and RAY have strong positive correlation (0.82)</li>
          <li>• Your portfolio has moderate diversification across assets</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}