import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toFixed(decimals)
}

export function formatPercentage(value: number): string {
  const prefix = value >= 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

export function formatAPY(value: number): string {
  return `${value.toFixed(2)}%`
}

export function formatTokenAmount(amount: number, decimals: number = 4): string {
  if (amount < 0.0001) {
    return '<0.0001'
  }
  return amount.toFixed(decimals)
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function getChangeColor(value: number): string {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-error'
  return 'text-muted-foreground'
}

export function getRandomChange(): number {
  return (Math.random() - 0.5) * 20
}

export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) {
    return Math.floor(interval) + " years ago"
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + " months ago"
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + " days ago"
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + " hours ago"
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago"
  }
  return Math.floor(seconds) + " seconds ago"
}