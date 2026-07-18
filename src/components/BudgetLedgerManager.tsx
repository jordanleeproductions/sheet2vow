'use client';

import React, { useState } from 'react';
import { BudgetItem } from '@/lib/sheets/types';
import { Plus, Edit2, Check, X, Trash2, HelpCircle } from 'lucide-react';

interface BudgetLedgerManagerProps {
  budget: BudgetItem[];
  onUpdate: (updatedBudget: BudgetItem[]) => Promise<void>;
  isSyncing: boolean;
}

export default function BudgetLedgerManager({ budget, onUpdate, isSyncing }: BudgetLedgerManagerProps) {
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BudgetItem>>({});
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<BudgetItem>>({
    category: '',
    vendorName: '',
    estimatedCost: 0,
    actualCost: 0,
    amountPaid: 0,
    dueDate: '',
    paymentStatus: 'Pending',
  });

  // Unique categories for summaries
  const categories = Array.from(new Set(budget.map(item => item.category).filter(Boolean)));

  // Totals
  const totalEstimate = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actualCost, 0);
  const totalPaid = budget.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalBalance = budget.reduce((sum, item) => sum + (item.actualCost - item.amountPaid), 0);

  // Edit action
  const startEdit = (item: BudgetItem) => {
    setEditingId(item.itemId);
    setEditForm(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field: keyof BudgetItem, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'estimatedCost' || field === 'actualCost' || field === 'amountPaid'
        ? Number(value) || 0
        : value
    }));
  };

  const saveEdit = async (itemId: string) => {
    if (isSyncing) return;
    const updated = budget.map(item => 
      item.itemId === itemId ? { ...(item), ...editForm } as BudgetItem : item
    );
    await onUpdate(updated);
    setEditingId(null);
    setEditForm({});
  };

  // Add action
  const handleAddChange = (field: keyof BudgetItem, value: any) => {
    setAddForm(prev => ({
      ...prev,
      [field]: field === 'estimatedCost' || field === 'actualCost' || field === 'amountPaid'
        ? Number(value) || 0
        : value
    }));
  };

  const saveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    const newItem: BudgetItem = {
      itemId: `B${budget.length + 1}`,
      category: addForm.category || 'General',
      vendorName: addForm.vendorName || 'TBD',
      estimatedCost: addForm.estimatedCost || 0,
      actualCost: addForm.actualCost || 0,
      amountPaid: addForm.amountPaid || 0,
      dueDate: addForm.dueDate || '',
      paymentStatus: addForm.paymentStatus || 'Pending',
    };

    await onUpdate([...budget, newItem]);
    setIsAdding(false);
    setAddForm({
      category: '',
      vendorName: '',
      estimatedCost: 0,
      actualCost: 0,
      amountPaid: 0,
      dueDate: '',
      paymentStatus: 'Pending',
    });
  };

  // Delete action
  const deleteItem = async (itemId: string) => {
    if (isSyncing || !confirm('Are you sure you want to delete this budget item?')) return;
    const updated = budget.filter(item => item.itemId !== itemId);
    await onUpdate(updated);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Budget Ledger</h2>
        <button 
          style={styles.addButton} 
          onClick={() => setIsAdding(!isAdding)} 
          disabled={isSyncing}
        >
          {isAdding ? <X size={16} style={{ marginRight: '0.25rem' }} /> : <Plus size={16} style={{ marginRight: '0.25rem' }} />} 
          {isAdding ? 'CANCEL' : 'ADD ITEM'}
        </button>
      </div>

      {/* Adding Panel */}
      {isAdding && (
        <form onSubmit={saveNewItem} style={styles.addPanel}>
          <h3 style={styles.panelTitle}>ADD BUDGET LINE ITEM</h3>
          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>CATEGORY</label>
              <input
                type="text"
                required
                placeholder="e.g. Catering, Venue"
                value={addForm.category}
                onChange={(e) => handleAddChange('category', e.target.value)}
                style={styles.input}
              />
            </div>
            
            <div style={styles.fieldGroup}>
              <label style={styles.label}>VENDOR NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Plaza"
                value={addForm.vendorName}
                onChange={(e) => handleAddChange('vendorName', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>ESTIMATED COST ($)</label>
              <input
                type="number"
                min="0"
                value={addForm.estimatedCost || ''}
                onChange={(e) => handleAddChange('estimatedCost', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>ACTUAL COST ($)</label>
              <input
                type="number"
                min="0"
                value={addForm.actualCost || ''}
                onChange={(e) => handleAddChange('actualCost', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>AMOUNT PAID ($)</label>
              <input
                type="number"
                min="0"
                value={addForm.amountPaid || ''}
                onChange={(e) => handleAddChange('amountPaid', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>DUE DATE</label>
              <input
                type="date"
                value={addForm.dueDate}
                onChange={(e) => handleAddChange('dueDate', e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>PAYMENT STATUS</label>
              <select
                value={addForm.paymentStatus}
                onChange={(e) => handleAddChange('paymentStatus', e.target.value)}
                style={styles.select}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div style={{ ...styles.fieldGroup, alignSelf: 'flex-end' }}>
              <button type="submit" style={styles.saveSubmitBtn} disabled={isSyncing}>
                {isSyncing ? 'SAVING...' : 'SAVE ITEM'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Ledger Table (Scrollable on Mobile) */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>CATEGORY</th>
              <th style={styles.th}>VENDOR</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>ESTIMATED</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>ACTUAL</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>PAID</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>OWING</th>
              <th style={styles.th}>DUE DATE</th>
              <th style={styles.th}>STATUS</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {budget.map((item) => {
              const isEditing = editingId === item.itemId;
              const owing = item.actualCost - item.amountPaid;
              
              return (
                <tr key={item.itemId} style={styles.tr}>
                  {/* Category */}
                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={(e) => handleEditChange('category', e.target.value)}
                        style={styles.tableInput}
                      />
                    ) : (
                      <span style={styles.categoryCell}>{item.category}</span>
                    )}
                  </td>

                  {/* Vendor Name */}
                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.vendorName || ''}
                        onChange={(e) => handleEditChange('vendorName', e.target.value)}
                        style={styles.tableInput}
                      />
                    ) : (
                      <span>{item.vendorName}</span>
                    )}
                  </td>

                  {/* Estimated Cost */}
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.estimatedCost !== undefined ? editForm.estimatedCost : item.estimatedCost}
                        onChange={(e) => handleEditChange('estimatedCost', e.target.value)}
                        style={{ ...styles.tableInput, textAlign: 'right' }}
                      />
                    ) : (
                      <span style={styles.monoText}>${item.estimatedCost.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Actual Cost */}
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.actualCost !== undefined ? editForm.actualCost : item.actualCost}
                        onChange={(e) => handleEditChange('actualCost', e.target.value)}
                        style={{ ...styles.tableInput, textAlign: 'right' }}
                      />
                    ) : (
                      <span style={styles.monoText}>${item.actualCost.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Amount Paid */}
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.amountPaid !== undefined ? editForm.amountPaid : item.amountPaid}
                        onChange={(e) => handleEditChange('amountPaid', e.target.value)}
                        style={{ ...styles.tableInput, textAlign: 'right' }}
                      />
                    ) : (
                      <span style={styles.monoText}>${item.amountPaid.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Owing (Calculated) */}
                  <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>
                    <span style={{ ...styles.monoText, color: owing > 0 ? 'var(--color-primary)' : 'var(--color-muted)' }}>
                      ${owing.toLocaleString()}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td style={styles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={editForm.dueDate || ''}
                        onChange={(e) => handleEditChange('dueDate', e.target.value)}
                        style={styles.tableInput}
                      />
                    ) : (
                      <span style={styles.monoText}>{item.dueDate || '-'}</span>
                    )}
                  </td>

                  {/* Payment Status */}
                  <td style={styles.td}>
                    {isEditing ? (
                      <select
                        value={editForm.paymentStatus || 'Pending'}
                        onChange={(e) => handleEditChange('paymentStatus', e.target.value)}
                        style={styles.tableSelect}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    ) : (
                      <span style={{
                        ...styles.statusTag,
                        backgroundColor: 
                          item.paymentStatus === 'Paid' ? '#eef2f7' : 
                          item.paymentStatus === 'Overdue' ? '#fee2e2' : 
                          'var(--color-highlight)',
                        color: 
                          item.paymentStatus === 'Paid' ? 'var(--color-primary)' : 
                          item.paymentStatus === 'Overdue' ? '#ef4444' : 
                          '#cda250'
                      }}>
                        {item.paymentStatus.toUpperCase()}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionsCell}>
                      {isEditing ? (
                        <>
                          <button 
                            style={{ ...styles.actionBtn, color: '#10b981' }} 
                            onClick={() => saveEdit(item.itemId)}
                            disabled={isSyncing}
                          >
                            <Check size={14} />
                          </button>
                          <button style={{ ...styles.actionBtn, color: '#ef4444' }} onClick={cancelEdit}>
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button style={styles.actionBtn} onClick={() => startEdit(item)}>
                            <Edit2 size={12} />
                          </button>
                          <button 
                            style={{ ...styles.actionBtn, color: '#ef4444' }} 
                            onClick={() => deleteItem(item.itemId)}
                            disabled={isSyncing}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Table Footer Totals */}
            <tr style={styles.footerTr}>
              <td colSpan={2} style={{ ...styles.td, fontWeight: 700 }}>LEDGER TOTALS</td>
              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                <span style={styles.monoText}>${totalEstimate.toLocaleString()}</span>
              </td>
              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                <span style={styles.monoText}>${totalActual.toLocaleString()}</span>
              </td>
              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700 }}>
                <span style={styles.monoText}>${totalPaid.toLocaleString()}</span>
              </td>
              <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                <span style={styles.monoText}>${totalBalance.toLocaleString()}</span>
              </td>
              <td colSpan={3} style={styles.td}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Mini Box */}
      <div style={styles.summaryBox}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>TOTAL OUTSTANDING DEBT</span>
          <span style={styles.summaryValue}>${totalBalance.toLocaleString()}</span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>PERCENT PAID</span>
          <span style={styles.summaryValue}>
            {totalActual > 0 ? Math.round((totalPaid / totalActual) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-muted)',
    paddingBottom: '0.75rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: 'var(--color-primary)',
  },
  addButton: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'var(--transition-smooth)',
  },
  addPanel: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  panelTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1rem',
    marginBottom: '0.75rem',
    color: 'var(--color-primary)',
    letterSpacing: '0.02em',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.375rem 0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
  },
  select: {
    padding: '0.375rem 0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
  },
  saveSubmitBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.5rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  },
  tableWrapper: {
    overflowX: 'auto',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--color-bg)',
    boxShadow: 'var(--box-shadow-subtle)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.825rem',
    textAlign: 'left',
  },
  th: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.675rem',
    fontWeight: 700,
    color: 'var(--color-muted)',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid var(--color-muted)',
    padding: '0.75rem',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f1f1',
    transition: 'var(--transition-smooth)',
  },
  footerTr: {
    backgroundColor: '#f8f9fa',
    borderTop: '2px solid var(--color-muted)',
  },
  td: {
    padding: '0.75rem',
    verticalAlign: 'middle',
  },
  tableInput: {
    padding: '0.25rem 0.375rem',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    width: '100%',
  },
  tableSelect: {
    padding: '0.25rem',
    border: '1px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.8rem',
    width: '100%',
  },
  categoryCell: {
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  monoText: {
    fontFamily: 'var(--font-mono)',
  },
  statusTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
    display: 'inline-block',
  },
  actionsCell: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBox: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  summaryItem: {
    flex: 1,
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1rem',
    backgroundColor: 'var(--color-bg)',
    boxShadow: 'var(--box-shadow-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  summaryLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  }
};
