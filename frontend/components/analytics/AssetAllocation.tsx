'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Grid3x3, BarChart3 } from 'lucide-react';

interface AssetAllocationProps {
  onAssetSelect: (asset: string | null) => void;
  selectedAsset: string | null;
}

const allocationData = [
  {
    name: 'SOL',
    size: 35000,
    fill: '#9945FF',
    percentage: 28.1,
    change: 12.5,
  },
  {
    name: 'USDC',
    size: 25000,
    fill: '#00D4FF',
    percentage: 20.1,
    change: 0.1,
  },
  {
    name: 'RAY',
    size: 18000,
    fill: '#14F195',
    percentage: 14.5,
    change: 8.3,
  },
  {
    name: 'ORCA',
    size: 15000,
    fill: '#FFB800',
    percentage: 12.0,
    change: -2.4,
  },
  {
    name: 'MNDE',
    size: 12000,
    fill: '#FF6B6B',
    percentage: 9.6,
    change: 15.7,
  },
  {
    name: 'JTO',
    size: 8000,
    fill: '#4ECDC4',
    percentage: 6.4,
    change: 22.1,
  },
  {
    name: 'BONK',
    size: 6000,
    fill: '#95E1D3',
    percentage: 4.8,
    change: -5.2,
  },
  {
    name: 'Others',
    size: 5532,
    fill: '#6B7280',
    percentage: 4.5,
    change: 3.2,
  },
];

type ViewMode = 'treemap' | 'pie' | 'bar';

export default function AssetAllocation({ onAssetSelect, selectedAsset }: AssetAllocationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('treemap');
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-tertiary border border-border-default rounded-lg p-3 shadow-xl"
        >
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-text-secondary text-sm">
            Value: ${data.size.toLocaleString()}
          </p>
          <p className="text-text-secondary text-sm">
            Allocation: {data.percentage}%
          </p>
          <p className={`text-sm font-medium ${data.change >= 0 ? 'text-success' : 'text-danger'}`}>
            {data.change >= 0 ? '+' : ''}{data.change}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const CustomTreemapContent = ({ x, y, width, height, name, size, fill, percentage, change }: any) => {
    const isSelected = selectedAsset === name;
    const isHovered = hoveredAsset === name;
    const showLabel = width > 60 && height > 40;

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setHoveredAsset(name)}
        onMouseLeave={() => setHoveredAsset(null)}
        onClick={() => onAssetSelect(isSelected ? null : name)}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          fillOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.8}
          stroke={isSelected ? '#fff' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
          rx={4}
        />
        {showLabel && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="600"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              opacity={0.8}
            >
              {percentage}%
            </text>
          </>
        )}
      </motion.g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-bg-secondary border border-border-default rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Asset Allocation</h2>
          <p className="text-text-secondary text-sm">Portfolio distribution by asset</p>
        </div>
        <div className="flex gap-2">
          {[
            { mode: 'treemap' as ViewMode, icon: Grid3x3 },
            { mode: 'pie' as ViewMode, icon: PieIcon },
            { mode: 'bar' as ViewMode, icon: BarChart3 },
          ].map(({ mode, icon: Icon }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-all ${
                viewMode === mode
                  ? 'bg-bg-tertiary border border-border-hover'
                  : 'bg-bg-primary border border-border-default hover:border-border-hover'
              }`}
            >
              <Icon className="w-4 h-4 text-text-secondary" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Treemap Chart */}
      <div className="h-[300px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={allocationData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="transparent"
            content={<CustomTreemapContent />}
            animationBegin={0}
            animationDuration={1000}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Asset List */}
      <div className="space-y-2">
        {allocationData.slice(0, 5).map((asset, index) => (
          <motion.div
            key={asset.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            whileHover={{ x: 4 }}
            onClick={() => onAssetSelect(selectedAsset === asset.name ? null : asset.name)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
              selectedAsset === asset.name
                ? 'bg-bg-tertiary border-border-hover'
                : 'bg-bg-primary border-border-default hover:border-border-hover'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: asset.fill }}
              />
              <div>
                <p className="text-white font-medium">{asset.name}</p>
                <p className="text-text-muted text-xs">
                  ${asset.size.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{asset.percentage}%</p>
              <p className={`text-xs ${asset.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4 p-3 bg-bg-tertiary rounded-lg border border-border-default"
      >
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Total Assets:</span>
          <span className="text-white font-medium">{allocationData.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-text-muted">Diversification Score:</span>
          <span className="text-success font-medium">Good (7.2/10)</span>
        </div>
      </motion.div>
    </motion.div>
  );
}