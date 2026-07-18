'use client';

import React, { useState } from 'react';
import { ScheduleEvent } from '@/lib/sheets/types';
import { Clock, MapPin, User, ChevronDown, ChevronUp, Plus, Edit2, X } from 'lucide-react';

interface TimelineManagerProps {
  schedule: ScheduleEvent[];
  onUpdate: (updatedSchedule: ScheduleEvent[]) => Promise<void>;
  isSyncing: boolean;
}

export default function TimelineManager({ schedule, onUpdate, isSyncing }: TimelineManagerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // expand first by default
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [formState, setFormState] = useState<Partial<ScheduleEvent>>({});

  // Sorting timeline events by Start Time (basic text comparison or user sorted order)
  // Google Sheet order is generally the true order, so we'll maintain the sheet order
  const events = schedule;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const startEdit = (event: ScheduleEvent, index: number) => {
    setEditingIndex(index);
    setFormState(event);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormState({
      startTime: '',
      endTime: '',
      eventMoment: '',
      location: '',
      responsibility: '',
      notes: '',
    });
    setIsAdding(true);
    setEditingIndex(null);
  };

  const handleInputChange = (field: keyof ScheduleEvent, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updated: ScheduleEvent[];
    if (isAdding) {
      updated = [...schedule, formState as ScheduleEvent];
    } else if (editingIndex !== null) {
      updated = schedule.map((ev, i) => i === editingIndex ? (formState as ScheduleEvent) : ev);
    } else {
      return;
    }

    await onUpdate(updated);
    setIsAdding(false);
    setEditingIndex(null);
  };

  const deleteEvent = async (indexToDelete: number) => {
    if (isSyncing || !confirm('Delete this event from the timeline?')) return;
    const updated = schedule.filter((_, i) => i !== indexToDelete);
    await onUpdate(updated);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Day-Of Schedule</h2>
        <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD EVENT
        </button>
      </div>

      {/* Editor Modal */}
      {(isAdding || editingIndex !== null) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isAdding ? 'ADD TIMELINE MOMENT' : 'EDIT TIMELINE MOMENT'}
              </h3>
              <button style={styles.closeBtn} onClick={() => { setIsAdding(false); setEditingIndex(null); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={saveEvent} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>START TIME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 04:00 PM"
                    value={formState.startTime || ''}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>END TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 04:30 PM"
                    value={formState.endTime || ''}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>EVENT MOMENT *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceremony Service"
                    value={formState.eventMoment || ''}
                    onChange={(e) => handleInputChange('eventMoment', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Courtyard Lawn"
                    value={formState.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>RESPONSIBILITY / VENDORS</label>
                  <input
                    type="text"
                    placeholder="e.g. Officiant, Harpist, Coordinator"
                    value={formState.responsibility || ''}
                    onChange={(e) => handleInputChange('responsibility', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>NOTES / DETAILS</label>
                  <textarea
                    placeholder="Provide specific guidelines, cues, setup details..."
                    value={formState.notes || ''}
                    rows={3}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                {editingIndex !== null && (
                  <button 
                    type="button" 
                    style={styles.deleteBtn}
                    onClick={() => deleteEvent(editingIndex)}
                  >
                    DELETE
                  </button>
                )}
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setIsAdding(false); setEditingIndex(null); }}
                >
                  CANCEL
                </button>
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE MOMENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vertical Timeline Layout */}
      <div style={styles.timelineList}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>No schedule events found. Add your first timeline moment!</div>
        ) : (
          events.map((event, index) => {
            const isExpanded = expandedIndex === index;
            
            return (
              <div key={index} style={styles.timelineItem}>
                {/* Left Side: Time node */}
                <div style={styles.timelineTimeSide}>
                  <span style={styles.timeText}>{event.startTime}</span>
                  {event.endTime && <span style={styles.endTimeText}>to {event.endTime}</span>}
                </div>

                {/* Vertical line and dot */}
                <div style={styles.lineConnector}>
                  <div style={styles.timelineDot} />
                  {index < events.length - 1 && <div style={styles.timelineVerticalLine} />}
                </div>

                {/* Right Side: Collapsible detail card */}
                <div 
                  style={{
                    ...styles.timelineCard,
                    borderColor: isExpanded ? 'var(--color-primary)' : 'var(--color-muted)',
                  }}
                >
                  {/* Card click header */}
                  <div style={styles.cardHeader} onClick={() => toggleExpand(index)}>
                    <div style={styles.cardMainInfo}>
                      <h3 style={styles.eventMomentTitle}>{event.eventMoment}</h3>
                      {event.location && (
                        <div style={styles.locationContainer}>
                          <MapPin size={12} style={styles.cardIcon} />
                          <span style={styles.locationText}>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.headerRightActions}>
                      <button 
                        style={styles.editCardBtn} 
                        onClick={(e) => { e.stopPropagation(); startEdit(event, index); }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <div style={styles.expandChevron}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail section */}
                  {isExpanded && (
                    <div style={styles.cardBody}>
                      {event.responsibility && (
                        <div style={styles.bodyDetailRow}>
                          <User size={12} style={styles.cardIcon} />
                          <span style={styles.bodyDetailText}>
                            <strong>Responsibility:</strong> {event.responsibility}
                          </span>
                        </div>
                      )}
                      
                      {event.notes && (
                        <div style={styles.notesSection}>
                          <div style={styles.notesLabel}>COORDINATION NOTES</div>
                          <p style={styles.notesText}>{event.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
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
    marginBottom: '1rem',
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
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '0.25rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
    marginBottom: '1rem',
  },
  timelineTimeSide: {
    width: '80px',
    flexShrink: 0,
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: '0.75rem',
  },
  timeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  endTimeText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--color-muted)',
  },
  lineConnector: {
    width: '16px',
    flexShrink: 0,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    zIndex: 3,
    marginTop: '0.9rem',
    border: '2px solid var(--color-white)',
  },
  timelineVerticalLine: {
    position: 'absolute',
    top: '0.9rem',
    bottom: '-1.5rem',
    width: '1px',
    backgroundColor: 'var(--color-muted)',
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--box-shadow-subtle)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  eventMomentTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--color-primary)',
  },
  locationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  cardIcon: {
    color: 'var(--color-muted)',
    flexShrink: 0,
  },
  locationText: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  headerRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  editCardBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  expandChevron: {
    color: 'var(--color-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  cardBody: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fafafa',
    borderTop: '1px dotted var(--color-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bodyDetailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
  },
  bodyDetailText: {
    fontSize: '0.75rem',
  },
  notesSection: {
    marginTop: '0.5rem',
    borderTop: '1px solid #eeeeee',
    paddingTop: '0.5rem',
  },
  notesLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  notesText: {
    fontSize: '0.75rem',
    color: 'var(--color-text)',
    lineHeight: '1.4',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 27, 42, 0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: 'var(--color-bg)',
    border: '2px solid var(--color-primary)',
    borderRadius: 'var(--border-radius-lg)',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.15rem',
    color: '#fff',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  form: {
    padding: '1.25rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.875rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
    borderTop: '1px solid var(--color-muted)',
    paddingTop: '1rem',
  },
  deleteBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    marginRight: 'auto',
  },
  cancelBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: 'var(--color-muted)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  saveBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  }
};
