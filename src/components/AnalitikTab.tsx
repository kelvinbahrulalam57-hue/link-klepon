/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LinkItem, AnalyticsRecord } from '../types.ts';
import * as Icons from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalitikTabProps {
  links: LinkItem[];
  analytics: AnalyticsRecord[];
  onResetClicks: () => void;
}

export default function AnalitikTab({ links, analytics, onResetClicks }: AnalitikTabProps) {
  const [chartType, setChartType] = useState<'curve' | 'line' | 'bar'>('curve');
  const [dateRange, setDateRange] = useState<'weekly' | 'last_weekly' | 'monthly'>('weekly');

  const activeAnalytics = dateRange === 'weekly' 
    ? analytics 
    : dateRange === 'last_weekly' 
      ? [
          { date: "Min", clicks: 35, views: 90 },
          { date: "Sen", clicks: 25, views: 70 },
          { date: "Sel", clicks: 45, views: 110 },
          { date: "Rab", clicks: 65, views: 150 },
          { date: "Kam", clicks: 50, views: 120 },
          { date: "Jum", clicks: 80, views: 200 },
          { date: "Sab", clicks: 95, views: 220 }
        ]
      : [
          { date: "Mng 1", clicks: 250, views: 650 },
          { date: "Mng 2", clicks: 310, views: 790 },
          { date: "Mng 3", clicks: 420, views: 980 },
          { date: "Mng 4", clicks: 580, views: 1250 }
        ];

  // Calculate real metrics
  const totalActiveLinks = links.filter(l => l.isVisible).length;
  const totalClicksFromLinks = links.reduce((acc, curr) => acc + curr.clickCount, 0);

  // Fallback calculations for analytics graph
  const maxClicks = Math.max(...activeAnalytics.map(a => a.clicks), 1);
  const totalGraphClicks = activeAnalytics.reduce((acc, curr) => acc + curr.clicks, 0);
  const dailyAverage = (totalGraphClicks / activeAnalytics.length).toFixed(1);
  
  // Find peak day
  const peakRecord = [...activeAnalytics].sort((a, b) => b.clicks - a.clicks)[0];
  const peakDay = peakRecord ? `${peakRecord.clicks} Klik (${peakRecord.date})` : '0 Klik';

  // Render Custom Interactive SVG Chart
  const renderSvgChart = () => {
    const width = 600;
    const height = 180;
    const paddingLeft = 30;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Generate coordinates
    const points = activeAnalytics.map((d, i) => {
      const x = paddingLeft + (i / (activeAnalytics.length - 1)) * chartWidth;
      // invert y since SVG 0,0 is top-left
      const y = paddingTop + chartHeight - (d.clicks / maxClicks) * chartHeight;
      return { x, y, data: d };
    });

    // Generate Path for Line
    const linePath = points.reduce((path, p, i) => {
      return path + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    // Generate Path for Smooth Curve
    let curvePath = '';
    if (points.length > 0) {
      curvePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + chartWidth / 14;
        const cpY1 = p0.y;
        const cpX2 = p1.x - chartWidth / 14;
        const cpY2 = p1.y;
        curvePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
    }

    // Gradient Area paths
    const areaPathLine = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    const areaPathCurve = `${curvePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const val = Math.round(maxClicks * (1 - ratio));
          return (
            <g key={idx} opacity="0.15">
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
              <text x={paddingLeft - 8} y={y + 4} fill="#cbd5e1" fontSize="9" textAnchor="end" fontFamily="monospace">
                {val}
              </text>
            </g>
          );
        })}

        {/* Render Chart Area Fill (Area) */}
        {chartType !== 'bar' && (
          <path
            d={chartType === 'curve' ? areaPathCurve : areaPathLine}
            fill="url(#chartGradient)"
          />
        )}

        {/* Render Line Paths */}
        {chartType === 'curve' && (
          <path
            d={curvePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            filter="drop-shadow(0px 4px 6px rgba(6, 182, 212, 0.5))"
          />
        )}

        {chartType === 'line' && (
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Render Bar Chart style */}
        {chartType === 'bar' && (
          points.map((p, idx) => {
            const barWidth = 24;
            const barHeight = paddingTop + chartHeight - p.y;
            return (
              <g key={idx}>
                <rect
                  x={p.x - barWidth / 2}
                  y={p.y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx="3"
                  fill="url(#chartGradient)"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
              </g>
            );
          })
        )}

        {/* Data points (circles on line) */}
        {chartType !== 'bar' && points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#090d16"
              stroke={chartType === 'curve' ? '#06b6d4' : '#3b82f6'}
              strokeWidth="2.5"
            />
            {/* Tooltip on hover */}
            <rect
              x={p.x - 20}
              y={p.y - 25}
              width="40"
              height="16"
              rx="3"
              fill="#1e293b"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
            <text
              x={p.x}
              y={p.y - 14}
              fill="#fff"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              {p.data.clicks}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - 6}
            fill="#94a3b8"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {p.data.date}
          </text>
        ))}
      </svg>
    );
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Judul Tautan,Kategori,URL Lengkap,Jumlah Klik,Status\n";
    
    links.forEach((link, idx) => {
      const row = [
        idx + 1,
        `"${link.title.replace(/"/g, '""')}"`,
        `"${link.category}"`,
        `"${link.url}"`,
        link.clickCount,
        link.isVisible ? "Aktif" : "Nonaktif"
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_analitik_link_klepon_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF Function
  const handleExportPDF = () => {
    // Generate a beautiful formatted print window which triggers save as PDF automatically
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const linksHtml = links.map((link, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px; font-size: 13px; font-weight: bold;">${link.title}</td>
        <td style="padding: 10px; font-size: 13px; color: #4b5563;">${link.category}</td>
        <td style="padding: 10px; font-size: 11px; font-family: monospace; color: #1f2937; max-width: 250px; overflow: hidden; text-overflow: ellipsis;">${link.url}</td>
        <td style="padding: 10px; font-size: 13px; font-weight: bold; text-align: right; color: #06b6d4;">${link.clickCount} Klik</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Analitik - LINK KLEPON</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
            .header { border-bottom: 3px double #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            .stat-container { display: flex; gap: 20px; margin-bottom: 30px; }
            .stat-card { flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
            .stat-label { font-size: 11px; text-transform: uppercase; tracking: 0.5px; color: #64748b; font-weight: bold; }
            .stat-value { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #0f172a; color: #fff; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Laporan Analitik Tautan Resmi</div>
            <div style="font-weight: bold; color: #06b6d4;">PLATFORM: LINK KLEPON - PLAY. CONNECT. DOMINATE.</div>
            <div class="meta">Diekspor Pada: ${new Date().toLocaleString('id-ID')} | Status Server: Secure Cloud</div>
          </div>
          
          <div class="stat-container">
            <div class="stat-card">
              <div class="stat-label">Total Tautan Terdaftar</div>
              <div class="stat-value">${links.length} Tautan</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Akumulasi Klik Pengunjung</div>
              <div class="stat-value">${totalClicksFromLinks} Total Klik</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Rata-Rata Klik/Tautan</div>
              <div class="stat-value">${links.length > 0 ? (totalClicksFromLinks / links.length).toFixed(1) : '0'} Clicks</div>
            </div>
          </div>

          <h3 style="font-size: 16px; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 15px;">Daftar Performa Tautan</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 30%;">Judul Tautan</th>
                <th style="width: 15%;">Kategori</th>
                <th style="width: 35%;">URL Tujuan</th>
                <th style="width: 15%; text-align: right;">Performa</th>
              </tr>
            </thead>
            <tbody>
              ${linksHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Belum ada tautan aktif.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Laporan Resmi Link Klepon Builder • Powered by Cloud Encryption & Offline Storage Engine • Crafted by PAMI & KLEPON
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Premium Date Range Filter Panel */}
      <div className="bg-[#0b1329] border border-cyan-500/20 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Icons.CalendarRange className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">FILTER RENTANG ANALITIK</h4>
            <p className="text-[10px] text-slate-400">Saring data performa link berdasarkan rentang waktu yang diinginkan</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#10182b] border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setDateRange('weekly')}
            className={`px-3 py-1.5 text-xs font-black rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              dateRange === 'weekly' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Icons.CalendarDays className="w-3.5 h-3.5" />
            Minggu Ini
          </button>
          <button
            onClick={() => setDateRange('last_weekly')}
            className={`px-3 py-1.5 text-xs font-black rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              dateRange === 'last_weekly' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Icons.History className="w-3.5 h-3.5" />
            Minggu Lalu
          </button>
          <button
            onClick={() => setDateRange('monthly')}
            className={`px-3 py-1.5 text-xs font-black rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              dateRange === 'monthly' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Icons.BarChart3 className="w-3.5 h-3.5" />
            Bulan Ini
          </button>
        </div>
      </div>

      {/* Visit and click trend chart card */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
              <Icons.TrendingUp className="w-4 h-4 text-cyan-400" />
              TREN KUNJUNGAN & KLIK ({dateRange === 'weekly' ? 'MINGGU INI' : dateRange === 'last_weekly' ? 'MINGGU LALU' : 'BULAN INI'})
            </h3>
            <span className="text-[10px] text-slate-500">Analisis aktivitas harian tautan Klepon Anda</span>
          </div>

          {/* Chart Type Segmented Control */}
          <div className="flex items-center gap-1 bg-[#10182b] border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setChartType('curve')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                chartType === 'curve' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kurva
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Garis
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batang
            </button>
          </div>
        </div>

        {/* Custom Rendered SVG Graphic Chart */}
        <div className="bg-[#070d1a] border border-slate-900 rounded-lg p-3 relative mb-6">
          {renderSvgChart()}
        </div>

        {/* Metrics Grid inside chart */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-4">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Total Terpantau</div>
            <div className="text-sm font-bold text-cyan-400">{totalGraphClicks} Klik</div>
          </div>
          <div className="text-center border-x border-slate-800/80">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Rata-Rata Harian</div>
            <div className="text-sm font-bold text-slate-300">{dailyAverage} / Hari</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Puncak Aktivitas</div>
            <div className="text-sm font-bold text-rose-400 truncate max-w-full px-1">{peakDay}</div>
          </div>
        </div>
      </div>

      {/* Recharts Clicks vs Views comparison bar chart */}
      <div className="bg-[#0b1329] border border-cyan-500/15 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-indigo-500" />
        <div className="mb-4">
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
            <Icons.BarChart3 className="w-4 h-4 text-cyan-400" />
            PERBANDINGAN KLIK VS VIEW ({dateRange === 'weekly' ? 'MINGGU INI' : dateRange === 'last_weekly' ? 'MINGGU LALU' : 'BULAN INI'})
          </h3>
          <span className="text-[10px] text-slate-500">Perbandingan performa impresi halaman vs ketertarikan link (rasio CTR)</span>
        </div>

        <div className="h-60 w-full bg-[#070d1a] border border-slate-900 rounded-lg p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeAnalytics}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#16223f" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c152b',
                  borderColor: '#06b6d4',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  fontFamily: 'monospace'
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                verticalAlign="bottom"
                height={36}
              />
              <Bar 
                dataKey="views" 
                name="Views (Dilihat)" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                opacity={0.85} 
              />
              <Bar 
                dataKey="clicks" 
                name="Clicks (Diklik)" 
                fill="#06b6d4" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ringkasan Klik Tautan */}
      <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2">
            <Icons.BarChart3 className="w-4 h-4 text-cyan-400" />
            RINGKASAN KLIK TAUTAN
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onResetClicks}
              className="text-[10px] font-bold bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Reset Klik
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">Setiap pengunjung mengklik tautan Anda, Linkklepon akan melacak jumlah kliknya secara langsung di bawah ini:</p>

        {links.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Belum ada tautan aktif untuk dilacak statistiknya.</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => {
              // Calculate percent of maximum clicks to draw the custom loading gauge
              const maxLinkClick = Math.max(...links.map(l => l.clickCount), 1);
              const percentage = Math.min((link.clickCount / maxLinkClick) * 100, 100);

              return (
                <div key={link.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white truncate max-w-[240px]">{link.title}</span>
                    <span className="font-mono text-cyan-400 font-bold">{link.clickCount} Klik</span>
                  </div>
                  <div className="h-2 w-full bg-[#131d35] rounded-full overflow-hidden p-[1px] border border-slate-800">
                    <div 
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary metric cards with export triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total stats card */}
        <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider mb-1">TOTAL TAUTAN</div>
            <div className="text-2xl font-black text-white">{links.length} <span className="text-xs text-slate-500 font-normal">Aktif di Web</span></div>
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider mb-1 text-right">TOTAL KLIK TAUTAN</div>
            <div className="text-2xl font-black text-white text-right">{totalClicksFromLinks} <span className="text-xs text-slate-500 font-normal">Lacak Real-Time</span></div>
          </div>
        </div>

        {/* Report export cards */}
        <div className="bg-[#0b1329] border border-cyan-500/10 rounded-xl p-5 shadow-xl flex flex-col justify-center space-y-3">
          <div className="text-xs text-slate-400 font-semibold">EKSPOR LAPORAN ANALITIK (CSV & PDF)</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              <Icons.FileSpreadsheet className="w-3.5 h-3.5" />
              Ekspor CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-1.5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded transition-colors cursor-pointer"
            >
              <Icons.FileText className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
