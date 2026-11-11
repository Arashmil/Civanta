/**
 * CIVANTA Design Tokens System
 * Tone: Dense, calm, administrative (Linear / Grafana inspired).
 * Single source of truth for colors, typography, border-radii, spacing, and component variants.
 */

export const tokens = {
  colors: {
    // Primary Navy (core administrative identity)
    navy: '#14213D',
    navyHover: '#1e2e50',
    navySubtle: '#e8ecf4',
    navyText: '#ffffff',

    // Semantic administrative accents
    // Red: ONLY for overdue SLA violations or broken audit chains
    red: '#B91C1C',
    redBg: '#fef2f2',
    redBorder: '#fecaca',
    redText: '#991b1b',
    redDarkBg: '#450a0a',
    redDarkBorder: '#7f1d1d',
    redDarkText: '#fca5a5',

    // Amber: ONLY for "needs attention" / impending deadlines
    amber: '#D97706',
    amberBg: '#fffbeb',
    amberBorder: '#fde68a',
    amberText: '#92400e',
    amberDarkBg: '#451a03',
    amberDarkBorder: '#78350f',
    amberDarkText: '#fcd34d',

    // Green: ONLY for resolved complaints / valid verified audit chains
    green: '#15803D',
    greenBg: '#f0fdf4',
    greenBorder: '#bbf7d0',
    greenText: '#166534',
    greenDarkBg: '#052e16',
    greenDarkBorder: '#14532d',
    greenDarkText: '#86efac',

    // Slate Grey Surfaces
    surface: {
      bg: '#f8fafc',
      card: '#ffffff',
      subtle: '#f1f5f9',
      muted: '#e2e8f0',
      darkBg: '#090d16',
      darkCard: '#0f172a',
      darkSubtle: '#1e293b',
      darkMuted: '#334155',
    },

    // 1px Borders
    border: {
      default: '#e2e8f0',
      subtle: '#cbd5e1',
      dark: '#1e293b',
      darkSubtle: '#334155',
    },

    // Text hierarchy
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
      darkPrimary: '#f8fafc',
      darkSecondary: '#cbd5e1',
      darkMuted: '#94a3b8',
    }
  },

  fonts: {
    ui: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'IBM Plex Mono', monospace",
    kannada: "'Noto Sans Kannada', sans-serif",
  },

  // 6px uniform corner radius
  radius: '6px',
  radiusClass: 'rounded-[6px]',

  // Common card and header classes
  cardClass: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-xs',
  headerBarClass: 'bg-[#14213D] text-white border-b border-slate-800 rounded-[6px]',
  headerCardClass: 'p-4 rounded-[6px] bg-[#14213D] dark:bg-slate-900 text-white border border-slate-700 dark:border-slate-800 shadow-sm space-y-2',

  // 8px base spacing grid
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // Administrative component class tokens (1px borders, no heavy shadows, no gradients)
  components: {
    // Dense card container
    card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-xs',
    
    // Header block
    headerBar: 'bg-[#14213D] text-white border-b border-slate-800 rounded-[6px]',

    // Primary button (Navy)
    buttonPrimary: 'px-3.5 py-2 rounded-[6px] bg-[#14213D] hover:bg-[#1e2e50] dark:bg-police-600 dark:hover:bg-police-500 text-white text-sm font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-50',

    // Secondary button
    buttonSecondary: 'px-3.5 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50',

    // Danger button (Red - Overdue / Escalations / Tamper tests)
    buttonDanger: 'px-3.5 py-2 rounded-[6px] bg-[#B91C1C] hover:bg-red-800 text-white text-sm font-semibold border border-red-900 transition-colors cursor-pointer disabled:opacity-50',

    // Success button (Green - Resolution)
    buttonSuccess: 'px-3.5 py-2 rounded-[6px] bg-[#15803D] hover:bg-green-800 text-white text-sm font-semibold border border-green-900 transition-colors cursor-pointer disabled:opacity-50',

    // Form input / select
    input: 'w-full px-3 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-police-600 dark:focus:border-police-400',

    // Compact table container
    tableContainer: 'border border-slate-200 dark:border-slate-800 rounded-[6px] overflow-hidden bg-white dark:bg-slate-900',
    tableHeaderRow: 'bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider sticky top-0 z-10',
    tableRow: 'hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200 dark:border-slate-800 text-sm cursor-pointer',

    // Status Chips
    statusChip: (status: string) => {
      const s = status.toLowerCase().replace(/\s+/g, '_');
      if (s === 'overdue' || s === 'escalated') {
        return 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-bold bg-[#fef2f2] dark:bg-red-950/70 text-[#991b1b] dark:text-red-300 border border-[#fecaca] dark:border-red-800';
      }
      if (s === 'resolved' || s === 'closed') {
        return 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#f0fdf4] dark:bg-emerald-950/70 text-[#166534] dark:text-emerald-300 border border-[#bbf7d0] dark:border-emerald-800';
      }
      if (s === 'in_progress' || s === 'pending') {
        return 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#fffbeb] dark:bg-amber-950/70 text-[#92400e] dark:text-amber-300 border border-[#fde68a] dark:border-amber-800';
      }
      return 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
    },

    // Priority Chips
    priorityChip: (priority: string) => {
      const p = priority.toLowerCase();
      if (p === 'urgent') {
        return 'inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-mono font-bold bg-[#fef2f2] dark:bg-red-950/70 text-[#991b1b] dark:text-red-300 border border-[#fecaca] dark:border-red-800';
      }
      if (p === 'high') {
        return 'inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-mono font-semibold bg-[#fffbeb] dark:bg-amber-950/70 text-[#92400e] dark:text-amber-300 border border-[#fde68a] dark:border-amber-800';
      }
      return 'inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  }
};
