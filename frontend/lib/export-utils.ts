/**
 * Export Utilities for SolFolio
 * Handles CSV, PDF, JSON exports and screenshot capture
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Types
export type ExportFormat = 'csv' | 'pdf' | 'json' | 'screenshot';

export interface ExportData {
  portfolio: {
    totalValue: number;
    change24h: number;
    changePercent: number;
    lastUpdated: string;
  };
  tokens: Array<{
    symbol: string;
    name: string;
    balance: number;
    value: number;
    price: number;
    change24h: number;
    changePercent: number;
  }>;
  positions: Array<{
    protocol: string;
    type: string;
    value: number;
    apy: number;
    rewards: number;
    status: string;
  }>;
}

export interface ExportProgress {
  phase: 'preparing' | 'processing' | 'generating' | 'complete';
  progress: number;
  message: string;
}

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
  includeWatermark?: boolean;
  format?: ExportFormat;
}

/**
 * CSV Export Utilities
 */
export class CSVExporter {
  private static arrayToCSV(data: Array<Record<string, any>>): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() ?? '';
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  static export(data: ExportData, options: ExportOptions = {}): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `solfolio-export-${timestamp}.csv`;

    // Portfolio Summary
    const portfolioSummary = [
      {
        'Export Date': new Date().toLocaleDateString(),
        'Total Portfolio Value': `$${data.portfolio.totalValue.toLocaleString()}`,
        '24h Change': `${data.portfolio.changePercent > 0 ? '+' : ''}${data.portfolio.changePercent.toFixed(2)}%`,
        'Last Updated': data.portfolio.lastUpdated,
      }
    ];

    // Combine all data
    const csvContent = [
      '=== PORTFOLIO SUMMARY ===',
      this.arrayToCSV(portfolioSummary),
      '',
      '=== TOKEN HOLDINGS ===',
      this.arrayToCSV(data.tokens.map(token => ({
        'Symbol': token.symbol,
        'Name': token.name,
        'Balance': token.balance,
        'Value (USD)': token.value,
        'Price (USD)': token.price,
        '24h Change %': `${token.changePercent > 0 ? '+' : ''}${token.changePercent.toFixed(2)}%`,
      }))),
      '',
      '=== DEFI POSITIONS ===',
      this.arrayToCSV(data.positions.map(position => ({
        'Protocol': position.protocol,
        'Type': position.type,
        'Value (USD)': position.value,
        'APY %': `${position.apy.toFixed(2)}%`,
        'Rewards': position.rewards,
        'Status': position.status,
      }))),
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  private static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * JSON Export Utilities
 */
export class JSONExporter {
  static export(data: ExportData, options: ExportOptions = {}): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = options.filename || `solfolio-export-${timestamp}.json`;

    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        source: 'SolFolio',
      },
      ...data,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  private static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * PDF Export Utilities
 */
export class PDFExporter {
  static async export(
    data: ExportData, 
    options: ExportOptions = {},
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        phase: 'preparing',
        progress: 10,
        message: 'Preparing PDF document...'
      });

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(153, 69, 255); // Solana purple
      pdf.text('SolFolio Portfolio Report', margin, yPosition);
      yPosition += 15;

      // Date and timestamp
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 20;

      onProgress?.({
        phase: 'processing',
        progress: 30,
        message: 'Adding portfolio summary...'
      });

      // Portfolio Summary
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Portfolio Summary', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const summaryLines = [
        `Total Value: $${data.portfolio.totalValue.toLocaleString()}`,
        `24h Change: ${data.portfolio.changePercent > 0 ? '+' : ''}${data.portfolio.changePercent.toFixed(2)}%`,
        `Last Updated: ${data.portfolio.lastUpdated}`,
      ];

      summaryLines.forEach(line => {
        pdf.text(line, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 15;

      onProgress?.({
        phase: 'processing',
        progress: 50,
        message: 'Adding token holdings...'
      });

      // Token Holdings
      pdf.setFontSize(16);
      pdf.text('Token Holdings', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      const tokenHeaders = ['Symbol', 'Balance', 'Value (USD)', 'Price (USD)', '24h Change %'];
      const colWidth = (pageWidth - 2 * margin) / tokenHeaders.length;

      // Headers
      tokenHeaders.forEach((header, index) => {
        pdf.text(header, margin + index * colWidth, yPosition);
      });
      yPosition += 8;

      // Token data
      data.tokens.slice(0, 20).forEach(token => { // Limit to prevent overflow
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        const values = [
          token.symbol,
          token.balance.toFixed(4),
          `$${token.value.toLocaleString()}`,
          `$${token.price.toFixed(4)}`,
          `${token.changePercent > 0 ? '+' : ''}${token.changePercent.toFixed(2)}%`
        ];

        values.forEach((value, index) => {
          pdf.text(value, margin + index * colWidth, yPosition);
        });
        yPosition += 8;
      });

      yPosition += 15;

      onProgress?.({
        phase: 'processing',
        progress: 70,
        message: 'Adding DeFi positions...'
      });

      // DeFi Positions
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(16);
      pdf.text('DeFi Positions', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      const positionHeaders = ['Protocol', 'Type', 'Value (USD)', 'APY %', 'Status'];
      const posColWidth = (pageWidth - 2 * margin) / positionHeaders.length;

      // Headers
      positionHeaders.forEach((header, index) => {
        pdf.text(header, margin + index * posColWidth, yPosition);
      });
      yPosition += 8;

      // Position data
      data.positions.forEach(position => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        const values = [
          position.protocol,
          position.type,
          `$${position.value.toLocaleString()}`,
          `${position.apy.toFixed(2)}%`,
          position.status
        ];

        values.forEach((value, index) => {
          pdf.text(value, margin + index * posColWidth, yPosition);
        });
        yPosition += 8;
      });

      // Watermark/Footer
      if (options.includeWatermark !== false) {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Generated by SolFolio - Solana Portfolio Tracker', margin, pageHeight - 10);
      }

      onProgress?.({
        phase: 'generating',
        progress: 90,
        message: 'Generating PDF file...'
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = options.filename || `solfolio-report-${timestamp}.pdf`;

      pdf.save(filename);

      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: 'PDF export complete!'
      });

    } catch (error) {
      console.error('PDF Export Error:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
}

/**
 * Screenshot Capture Utilities
 */
export class ScreenshotExporter {
  static async capture(
    elementId: string,
    options: ExportOptions = {},
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        phase: 'preparing',
        progress: 10,
        message: 'Preparing screenshot capture...'
      });

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
      }

      onProgress?.({
        phase: 'processing',
        progress: 30,
        message: 'Capturing screenshot...'
      });

      const canvas = await html2canvas(element, {
        backgroundColor: '#0A0B0D', // Dark theme background
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure all styles are captured
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.transform = 'none';
          }
        }
      });

      onProgress?.({
        phase: 'generating',
        progress: 80,
        message: 'Processing image...'
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to generate image');
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = options.filename || `solfolio-screenshot-${timestamp}.png`;

        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onProgress?.({
          phase: 'complete',
          progress: 100,
          message: 'Screenshot saved!'
        });
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Screenshot Export Error:', error);
      throw new Error('Failed to capture screenshot');
    }
  }
}

/**
 * Main Export Manager
 */
export class ExportManager {
  static async export(
    format: ExportFormat,
    data: ExportData,
    options: ExportOptions = {},
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      switch (format) {
        case 'csv':
          onProgress?.({
            phase: 'processing',
            progress: 50,
            message: 'Generating CSV export...'
          });
          CSVExporter.export(data, options);
          onProgress?.({
            phase: 'complete',
            progress: 100,
            message: 'CSV export complete!'
          });
          break;

        case 'json':
          onProgress?.({
            phase: 'processing',
            progress: 50,
            message: 'Generating JSON export...'
          });
          JSONExporter.export(data, options);
          onProgress?.({
            phase: 'complete',
            progress: 100,
            message: 'JSON export complete!'
          });
          break;

        case 'pdf':
          await PDFExporter.export(data, options, onProgress);
          break;

        case 'screenshot':
          await ScreenshotExporter.capture('portfolio-dashboard', options, onProgress);
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export Error:', error);
      throw error;
    }
  }

  static getExportFormats(): Array<{ value: ExportFormat; label: string; description: string }> {
    return [
      {
        value: 'csv',
        label: 'CSV Spreadsheet',
        description: 'Export data in CSV format for Excel/Sheets'
      },
      {
        value: 'pdf',
        label: 'PDF Report',
        description: 'Generate a comprehensive PDF report'
      },
      {
        value: 'json',
        label: 'JSON Data',
        description: 'Raw data in JSON format for developers'
      },
      {
        value: 'screenshot',
        label: 'Screenshot',
        description: 'Capture a high-resolution screenshot'
      }
    ];
  }

  static generateFilename(format: ExportFormat, customName?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    
    if (customName) {
      return `${customName}-${timestamp}-${time}.${this.getFileExtension(format)}`;
    }

    const formatNames = {
      csv: 'export',
      pdf: 'report',
      json: 'data',
      screenshot: 'screenshot'
    };

    return `solfolio-${formatNames[format]}-${timestamp}-${time}.${this.getFileExtension(format)}`;
  }

  private static getFileExtension(format: ExportFormat): string {
    const extensions = {
      csv: 'csv',
      pdf: 'pdf',
      json: 'json',
      screenshot: 'png'
    };
    return extensions[format];
  }
}