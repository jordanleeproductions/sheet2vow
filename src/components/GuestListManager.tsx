'use client';

import React, { useState } from 'react';
import { Guest, AgeCategory, RSVPStatus } from '@/lib/sheets/types';
import { User, Mail, Phone, MapPin, Coffee, Tag, Plus, Edit2, Check, X } from 'lucide-react';

interface GuestListManagerProps {
  guests: Guest[];
  onUpdate: (updatedGuests: Guest[]) => Promise<void>;
  isSyncing: boolean;
}

export default function GuestListManager({ guests, onUpdate, isSyncing }: GuestListManagerProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'All'>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  
  // Edit Dialog State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState<Partial<Guest>>({});

  // Unique list of groups for filtering
  const groups = Array.from(new Set(guests.map(g => g.partyGroup).filter(Boolean)));

  // Filtered Guests
  const filteredGuests = guests.filter(guest => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          guest.emailAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRsvp = rsvpFilter === 'All' || guest.rsvpStatus === rsvpFilter;
    const matchesGroup = groupFilter === 'All' || guest.partyGroup === groupFilter;
    
    return matchesSearch && matchesRsvp && matchesGroup;
  });

  // Handle Edit Click
  const startEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormState(guest);
    setIsAdding(false);
  };

  // Handle Add Click
  const startAdd = () => {
    const nextId = `G${guests.length + 1}`;
    setFormState({
      guestId: nextId,
      firstName: '',
      lastName: '',
      partyGroup: groups[0] || 'Friends',
      ageCategory: 'Adult',
      rsvpStatus: 'No Response',
      dietaryRestrictions: '',
      tableAssignment: '',
      emailAddress: '',
      phoneNumber: '',
      mailingAddress: '',
    });
    setIsAdding(true);
    setEditingGuest(null);
  };

  // Handle Form Input Changes
  const handleInputChange = (field: keyof Guest, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Handle Quick RSVP Change directly on card
  const handleQuickRsvp = async (guest: Guest, newStatus: RSVPStatus) => {
    if (isSyncing) return;
    const updated = guests.map(g => 
      g.guestId === guest.guestId ? { ...g, rsvpStatus: newStatus } : g
    );
    await onUpdate(updated);
  };

  // Save changes
  const saveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;

    let updatedGuests: Guest[];
    if (isAdding) {
      updatedGuests = [...guests, formState as Guest];
    } else {
      updatedGuests = guests.map(g => 
        g.guestId === editingGuest?.guestId ? (formState as Guest) : g
      );
    }

    await onUpdate(updatedGuests);
    setEditingGuest(null);
    setIsAdding(false);
  };

  return (
    <div style={styles.container}>
      {/* Header Panel */}
      <div style={styles.header}>
        <h2 style={styles.title}>Guest Registry</h2>
        <button style={styles.addButton} onClick={startAdd} disabled={isSyncing}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> ADD GUEST
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="SEARCH GUEST OR EMAIL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <div style={styles.filtersGroup}>
          <select 
            value={rsvpFilter} 
            onChange={(e) => setRsvpFilter(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="All">ALL RSVPS</option>
            <option value="No Response">NO RESPONSE</option>
            <option value="Attending">ATTENDING</option>
            <option value="Declined">DECLINED</option>
          </select>

          <select 
            value={groupFilter} 
            onChange={(e) => setGroupFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">ALL GROUPS</option>
            {groups.map(grp => (
              <option key={grp} value={grp}>{grp.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Counter */}
      <div style={styles.statsBar}>
        <span>FOUND: <strong>{filteredGuests.length}</strong> GUESTS</span>
        <span>
          ATTENDING: <strong>{guests.filter(g => g.rsvpStatus === 'Attending').length}</strong> | 
          DECLINED: <strong>{guests.filter(g => g.rsvpStatus === 'Declined').length}</strong> | 
          PENDING: <strong>{guests.filter(g => g.rsvpStatus === 'No Response').length}</strong>
        </span>
      </div>

      {/* Cards Grid */}
      <div style={styles.grid}>
        {filteredGuests.map((guest) => {
          const rsvpColor = 
            guest.rsvpStatus === 'Attending' ? 'var(--color-primary)' :
            guest.rsvpStatus === 'Declined' ? 'var(--color-muted)' :
            '#e6b800'; // dark gold/amber
            
          const rsvpBg = 
            guest.rsvpStatus === 'Attending' ? '#eef2f7' :
            guest.rsvpStatus === 'Declined' ? '#f4f5f6' :
            'var(--color-highlight)';

          return (
            <div key={guest.guestId} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardMeta}>
                  <span style={styles.monoBadge}>{guest.partyGroup.toUpperCase()}</span>
                  <span style={{ ...styles.monoBadge, backgroundColor: 'var(--color-highlight)' }}>
                    {guest.ageCategory.toUpperCase()}
                  </span>
                </div>
                <button style={styles.editBtn} onClick={() => startEdit(guest)}>
                  <Edit2 size={12} />
                </button>
              </div>

              <h3 style={styles.cardName}>{guest.firstName} {guest.lastName}</h3>

              <div style={styles.cardDetails}>
                {guest.emailAddress && (
                  <div style={styles.detailItem}>
                    <Mail size={12} style={styles.icon} />
                    <span>{guest.emailAddress}</span>
                  </div>
                )}
                {guest.phoneNumber && (
                  <div style={styles.detailItem}>
                    <Phone size={12} style={styles.icon} />
                    <span>{guest.phoneNumber}</span>
                  </div>
                )}
                <div style={styles.detailItem}>
                  <Coffee size={12} style={styles.icon} />
                  <span>Diet: {guest.dietaryRestrictions || 'None'}</span>
                </div>
                <div style={styles.detailItem}>
                  <Tag size={12} style={styles.icon} />
                  <span>Table: {guest.tableAssignment || 'Unassigned'}</span>
                </div>
              </div>

              {/* RSVP Status Selector Toggle */}
              <div style={styles.rsvpToggleSection}>
                <span style={styles.rsvpLabel}>RSVP STATUS:</span>
                <div style={styles.rsvpButtonGroup}>
                  {(['No Response', 'Attending', 'Declined'] as RSVPStatus[]).map((status) => {
                    const isSelected = guest.rsvpStatus === status;
                    const btnStyle = isSelected 
                      ? { ...styles.rsvpToggleBtn, backgroundColor: rsvpColor, color: '#fff', border: `1px solid ${rsvpColor}` }
                      : styles.rsvpToggleBtn;

                    return (
                      <button 
                        key={status} 
                        style={btnStyle}
                        onClick={() => handleQuickRsvp(guest, status)}
                        disabled={isSyncing}
                      >
                        {status === 'No Response' ? '?' : status.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Overlay Modal */}
      {(editingGuest || isAdding) && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isAdding ? 'ADD NEW GUEST' : `EDIT GUEST: ${formState.firstName} ${formState.lastName}`}
              </h3>
              <button style={styles.closeBtn} onClick={() => { setEditingGuest(null); setIsAdding(false); }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={saveGuest} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>FIRST NAME *</label>
                  <input
                    type="text"
                    required
                    value={formState.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>LAST NAME *</label>
                  <input
                    type="text"
                    required
                    value={formState.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PARTY GROUP</label>
                  <input
                    type="text"
                    value={formState.partyGroup || ''}
                    placeholder="e.g. Groom Family, Bride Friends"
                    onChange={(e) => handleInputChange('partyGroup', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>AGE CATEGORY</label>
                  <select
                    value={formState.ageCategory || 'Adult'}
                    onChange={(e) => handleInputChange('ageCategory', e.target.value)}
                    style={styles.select}
                  >
                    <option value="Adult">Adult (Full cater rate)</option>
                    <option value="Youth">Youth (Underage, adult meal, no alcohol)</option>
                    <option value="Child">Child (Kids menu pricing)</option>
                    <option value="Infant">Infant (Seat space only, zero cost)</option>
                    <option value="Vendor">Vendor (Flat staff meal tier)</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>RSVP STATUS</label>
                  <select
                    value={formState.rsvpStatus || 'No Response'}
                    onChange={(e) => handleInputChange('rsvpStatus', e.target.value)}
                    style={styles.select}
                  >
                    <option value="No Response">No Response</option>
                    <option value="Attending">Attending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>TABLE ASSIGNMENT</label>
                  <input
                    type="text"
                    value={formState.tableAssignment || ''}
                    placeholder="e.g. Table 4"
                    onChange={(e) => handleInputChange('tableAssignment', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={formState.emailAddress || ''}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={formState.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>DIETARY RESTRICTIONS</label>
                  <input
                    type="text"
                    value={formState.dietaryRestrictions || ''}
                    placeholder="e.g. Vegetarian, Gluten Free, Nut Allergy"
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.fieldGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>MAILING ADDRESS</label>
                  <textarea
                    value={formState.mailingAddress || ''}
                    rows={2}
                    onChange={(e) => handleInputChange('mailingAddress', e.target.value)}
                    style={styles.textarea}
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => { setEditingGuest(null); setIsAdding(false); }}
                >
                  CANCEL
                </button>
                <button type="submit" style={styles.saveBtn} disabled={isSyncing}>
                  {isSyncing ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  searchInput: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    padding: '0.75rem',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    width: '100%',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterSelect: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    padding: '0.5rem',
  },
  statsBar: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderBottom: '1px dotted var(--color-muted)',
    paddingBottom: '0.5rem',
    gap: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  card: {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--box-shadow-subtle)',
    position: 'relative',
    transition: 'var(--transition-smooth)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '0.25rem',
  },
  monoBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    fontWeight: 600,
    backgroundColor: '#f1f1f1',
    color: 'var(--color-text)',
    padding: '0.125rem 0.375rem',
    borderRadius: 'var(--border-radius-sm)',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  cardName: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: 'var(--color-primary)',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.8rem',
    color: 'var(--color-text)',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    color: 'var(--color-muted)',
    flexShrink: 0,
  },
  rsvpToggleSection: {
    marginTop: 'auto',
    borderTop: '1px dotted var(--color-muted)',
    paddingTop: '0.75rem',
  },
  rsvpLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--color-muted)',
    display: 'block',
    marginBottom: '0.375rem',
  },
  rsvpButtonGroup: {
    display: 'flex',
    gap: '0.25rem',
  },
  rsvpToggleBtn: {
    flex: 1,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.375rem 0',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-muted)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
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
  select: {
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
