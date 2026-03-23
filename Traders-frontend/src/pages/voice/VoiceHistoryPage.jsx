import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Play, Pause, Trash2, Calendar } from 'lucide-react';
import useVoiceHistory from '../../hooks/useVoiceHistory';

export default function VoiceHistoryPage() {
  const { recordings, loading, total, pages, fetchRecordings, deleteRecording } = useVoiceHistory();
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  // Fetch recordings on filter change
  useEffect(() => {
    fetchRecordings(filters);
  }, [filters, fetchRecordings]);

  // Fetch users for dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users?limit=200');
        const data = await response.json();
        setUsers((data.data || data.users || []).slice(0, 200));
      } catch (err) {
        console.warn('[VoiceHistoryPage] Failed to load users:', err.message);
      }
    };
    loadUsers();
  }, []);

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val, page: 1 }));
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this recording?')) {
      deleteRecording(id);
    }
  };

  const statusStyles = {
    executed: { bg: '#1a3a1a', color: '#4ade80', label: 'Executed' },
    failed: { bg: '#3a1a1a', color: '#f87171', label: 'Failed' },
    saved: { bg: '#2a2a1a', color: '#facc15', label: 'Saved' },
    pending: { bg: '#1a2a3a', color: '#60a5fa', label: 'Pending' },
  };

  const getStatusStyle = (status) => statusStyles[status] || statusStyles.saved;

  return (
    <div style={{ padding: '24px', color: '#fff', minHeight: '100vh', background: '#0a0a14' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Voice Recordings
        </h1>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
          Total: <span style={{ color: '#4ade80', fontWeight: 600 }}>{total}</span> recordings
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        background: '#111122',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid #2a2a3e'
      }}>
        {/* User filter */}
        <select
          value={filters.user_id || ''}
          onChange={e => updateFilter('user_id', e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #2a2a3e',
            background: '#0d0d1a',
            color: '#ddd',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          <option value="">All Users</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name || u.username} (ID: {u.id})</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={e => updateFilter('status', e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #2a2a3e',
            background: '#0d0d1a',
            color: '#ddd',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          <option value="">All Status</option>
          <option value="executed">Executed</option>
          <option value="failed">Failed</option>
          <option value="saved">Saved</option>
          <option value="pending">Pending</option>
        </select>

        {/* Date from */}
        <input
          type="date"
          value={filters.from_date || ''}
          onChange={e => updateFilter('from_date', e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #2a2a3e',
            background: '#0d0d1a',
            color: '#ddd',
            fontSize: '13px',
            fontWeight: 500
          }}
          placeholder="From date"
        />

        {/* Date to */}
        <input
          type="date"
          value={filters.to_date || ''}
          onChange={e => updateFilter('to_date', e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #2a2a3e',
            background: '#0d0d1a',
            color: '#ddd',
            fontSize: '13px',
            fontWeight: 500
          }}
        />

        {/* Transcript search */}
        <input
          type="text"
          placeholder="Search transcript…"
          value={filters.search || ''}
          onChange={e => updateFilter('search', e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #2a2a3e',
            background: '#0d0d1a',
            color: '#ddd',
            fontSize: '13px',
            fontWeight: 500,
            minWidth: '200px'
          }}
        />

        {/* Clear */}
        <button
          onClick={() => setFilters({ page: 1, limit: 20 })}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#2a2a3e',
            color: '#aaa',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.target.style.background = '#3a3a4e'; e.target.style.color = '#ddd'; }}
          onMouseLeave={e => { e.target.style.background = '#2a2a3e'; e.target.style.color = '#aaa'; }}
        >
          Clear
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
          <p style={{ fontSize: '14px' }}>Loading recordings…</p>
        </div>
      ) : recordings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
          <Calendar style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px', fontWeight: 600 }}>No recordings found</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recordings.map(rec => {
            const isExpanded = expanded === rec.id;
            const status = getStatusStyle(rec.status);

            return (
              <div
                key={rec.id}
                style={{
                  background: '#111122',
                  borderRadius: '10px',
                  border: '1px solid #2a2a3e',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Main Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                  onClick={() => setExpanded(isExpanded ? null : rec.id)}
                >
                  {/* Status badge */}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                    background: status.bg,
                    color: status.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {status.label}
                  </span>

                  {/* Transcript preview */}
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    color: '#ddd',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}>
                    {rec.transcript || '(no transcript)'}
                  </span>

                  {/* User */}
                  {rec.target_user_name && (
                    <span style={{
                      fontSize: '12px',
                      color: '#7c6ff7',
                      flexShrink: 0,
                      fontWeight: 600
                    }}>
                      {rec.target_user_name}
                    </span>
                  )}

                  {/* Time */}
                  <span style={{
                    fontSize: '11px',
                    color: '#555',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    {new Date(rec.created_at).toLocaleString('en-IN', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>

                  {/* Expand arrow */}
                  <span style={{ color: '#555', fontSize: '14px', flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid #2a2a3e',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '16px'
                    }}>
                      {/* Full transcript */}
                      <div>
                        <p style={{
                          fontSize: '11px',
                          color: '#555',
                          margin: '0 0 6px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>Transcript</p>
                        <p style={{
                          fontSize: '13px',
                          color: '#ddd',
                          margin: 0,
                          lineHeight: 1.5,
                          background: '#0d0d1a',
                          padding: '10px',
                          borderRadius: '6px',
                          maxHeight: '120px',
                          overflow: 'auto'
                        }}>
                          {rec.transcript || '—'}
                        </p>
                      </div>

                      {/* Action taken */}
                      <div>
                        <p style={{
                          fontSize: '11px',
                          color: '#555',
                          margin: '0 0 6px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>Action Taken</p>
                        <p style={{
                          fontSize: '13px',
                          color: '#facc15',
                          margin: 0,
                          background: '#0d0d1a',
                          padding: '10px',
                          borderRadius: '6px'
                        }}>
                          {rec.action_taken || '—'}
                        </p>
                      </div>

                      {/* Parsed command */}
                      {rec.parsed_command && (
                        <div>
                          <p style={{
                            fontSize: '11px',
                            color: '#555',
                            margin: '0 0 6px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                          }}>Parsed Command</p>
                          <pre style={{
                            fontSize: '11px',
                            color: '#4ade80',
                            margin: 0,
                            background: '#0d0d1a',
                            padding: '10px',
                            borderRadius: '6px',
                            overflow: 'auto',
                            maxHeight: '150px'
                          }}>
                            {JSON.stringify(
                              typeof rec.parsed_command === 'string'
                                ? JSON.parse(rec.parsed_command)
                                : rec.parsed_command,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}

                      {/* Action result */}
                      {rec.action_result && (
                        <div>
                          <p style={{
                            fontSize: '11px',
                            color: '#555',
                            margin: '0 0 6px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                          }}>Result</p>
                          <pre style={{
                            fontSize: '11px',
                            color: '#60a5fa',
                            margin: 0,
                            background: '#0d0d1a',
                            padding: '10px',
                            borderRadius: '6px',
                            overflow: 'auto',
                            maxHeight: '150px'
                          }}>
                            {JSON.stringify(
                              typeof rec.action_result === 'string'
                                ? JSON.parse(rec.action_result)
                                : rec.action_result,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Audio player */}
                    {rec.audio_filename && (
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          fontSize: '11px',
                          color: '#555',
                          margin: '0 0 6px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}>Audio Recording</p>
                        <audio
                          controls
                          src={`/api/ai/voice/audio/${rec.audio_filename}`}
                          style={{
                            width: '100%',
                            height: '32px',
                            borderRadius: '6px'
                          }}
                          onPlay={() => setPlayingId(rec.id)}
                          onPause={() => setPlayingId(null)}
                        />
                      </div>
                    )}

                    {/* Delete button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#3a1a1a',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.background = '#4a2a2a'}
                        onMouseLeave={e => e.target.style.background = '#3a1a1a'}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setFilters(prev => ({ ...prev, page: p }))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                background: filters.page === p ? '#7c6ff7' : '#2a2a3e',
                color: filters.page === p ? '#fff' : '#aaa',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if (filters.page !== p) {
                  e.target.style.background = '#3a3a4e';
                  e.target.style.color = '#ddd';
                }
              }}
              onMouseLeave={e => {
                if (filters.page !== p) {
                  e.target.style.background = '#2a2a3e';
                  e.target.style.color = '#aaa';
                }
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
