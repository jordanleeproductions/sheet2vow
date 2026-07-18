'use client';

import React from 'react';
import { DashboardSummary } from '@/lib/sheets/types';

interface DashboardMetricsProps {
  metrics: DashboardSummary;
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const { totalBudget, estimatedCost, actualCost, remainingTasks } = metrics;
  
  // Calculations
  const remainingBudget = totalBudget - actualCost;
  const actualPercent = Math.min(Math.round((actualCost / totalBudget) * 100), 100) || 0;
  const estimatedPercent = Math.min(Math.round((estimatedCost / totalBudget) * 100), 100) || 0;

  return (
    <div className="metrics-container" style={styles.container}>
      {/* KPI Cards Grid */}
      <div className="kpi-grid" style={styles.kpiGrid}>
        
        <div className="kpi-card" style={styles.kpiCard}>
          <div style={styles.kpiLabel}>TOTAL BUDGET</div>
          <div style={styles.kpiValue}>
            ${totalBudget.toLocaleString()}
          </div>
          <div style={styles.kpiSub}>Cell B2 Config Value</div>
        </div>

        <div className="kpi-card" style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ESTIMATED COST</div>
          <div style={styles.kpiValue}>
            ${estimatedCost.toLocaleString()}
          </div>
          <div style={styles.kpiSub}>SUM('Budget Ledger'!D:D)</div>
        </div>

        <div className="kpi-card" style={styles.kpiCard}>
          <div style={styles.kpiLabel}>ACTUAL COST</div>
          <div style={{ ...styles.kpiValue, color: 'var(--color-primary)' }}>
            ${actualCost.toLocaleString()}
          </div>
          <div style={styles.kpiSub}>SUM('Budget Ledger'!E:E)</div>
        </div>

        <div className="kpi-card" style={styles.kpiCard}>
          <div style={styles.kpiLabel}>REMAINING TASKS</div>
          <div style={{ ...styles.kpiValue, color: remainingTasks > 0 ? '#d9383a' : 'var(--color-muted)' }}>
            {remainingTasks}
          </div>
          <div style={styles.kpiSub}>COUNTIF('To-Do List', "To Do")</div>
        </div>

      </div>

      {/* Progress Bar & Ledger Balance Panel */}
      <div className="budget-bar-panel" style={styles.barPanel}>
        <h3 style={styles.panelTitle}>Budget Allocation Progress</h3>
        
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>
            Actual Spent: <strong>{actualPercent}%</strong> (${actualCost.toLocaleString()})
          </span>
          <span style={styles.progressLabel}>
            Estimated Total: <strong>{estimatedPercent}%</strong> (${estimatedCost.toLocaleString()})
          </span>
        </div>

        {/* Double-layered progress bar: estimated vs actual */}
        <div style={styles.progressTrack}>
          {/* Estimated bar */}
          <div style={{ ...styles.progressBarEstimated, width: `${estimatedPercent}%` }} />
          {/* Actual spent bar (layered on top) */}
          <div style={{ ...styles.progressBarActual, width: `${actualPercent}%` }} />
        </div>

        <div style={styles.progressFooter}>
          <div style={styles.footerItem}>
            <div style={{ ...styles.colorDot, backgroundColor: 'var(--color-primary)' }} />
            <span>Actual Cost (${actualCost.toLocaleString()})</span>
          </div>
          <div style={styles.footerItem}>
            <div style={{ ...styles.colorDot, backgroundColor: 'var(--color-highlight)', border: '1px solid var(--color-muted)' }} />
            <span>Estimated Outlay (${estimatedCost.toLocaleString()})</span>
          </div>
          <div style={styles.footerItem}>
            <span style={{ ...styles.monoText, fontWeight: 600 }}>
              Remaining: ${remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  kpiCard: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'var(--transition-smooth)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  kpiLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'var(--color-muted)',
    marginBottom: '0.5rem',
  },
  kpiValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: '1.2',
  },
  kpiSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
    marginTop: '0.5rem',
    letterSpacing: '0.02em',
  },
  barPanel: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.5rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  panelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: 'var(--color-primary)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text)',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  progressLabel: {
    fontSize: '0.75rem',
  },
  progressTrack: {
    position: 'relative',
    height: '14px',
    backgroundColor: '#f1f1f1',
    borderRadius: '7px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBarEstimated: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--color-highlight)',
    borderRadius: '7px 0 0 7px',
    transition: 'width 0.4s ease',
  },
  progressBarActual: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '7px 0 0 7px',
    transition: 'width 0.4s ease',
    zIndex: 2,
  },
  progressFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-muted)',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  monoText: {
    fontFamily: 'var(--font-mono)',
  }
};
