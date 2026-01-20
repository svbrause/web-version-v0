import React, { useState, useMemo } from 'react';
import { getUserData, getStageDisplayName, clearUserData, type UserData } from '../utils/userDataCollection';
import { HIGH_LEVEL_CONCERNS, AREAS_OF_CONCERN } from '../constants/data';
import '../App.css';
import './Dashboard.css';

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData[]>(getUserData());
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'stage' | 'name' | 'email'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique stages for filter
  const stages = useMemo(() => {
    const uniqueStages = new Set(userData.map(u => u.stage));
    return Array.from(uniqueStages).sort();
  }, [userData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = userData;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.message?.toLowerCase().includes(term)
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(user => user.stage === stageFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'stage':
          aVal = a.stage;
          bVal = b.stage;
          break;
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'email':
          aVal = (a.email || '').toLowerCase();
          bVal = (b.email || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [userData, searchTerm, stageFilter, sortBy, sortDirection]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const refreshData = () => {
    setUserData(getUserData());
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all user data? This cannot be undone.')) {
      clearUserData();
      setUserData([]);
    }
  };

  const getConcernName = (id: string) => {
    return HIGH_LEVEL_CONCERNS.find(c => c.id === id)?.name || id;
  };

  const getAreaName = (id: string) => {
    return AREAS_OF_CONCERN.find(a => a.id === id)?.name || id;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">User Leads Dashboard</h1>
          <p className="dashboard-subtitle">View and manage user data from the consultation app</p>
        </div>
        <div className="dashboard-actions">
          <button className="dashboard-button dashboard-button-secondary" onClick={refreshData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh
          </button>
          <button className="dashboard-button dashboard-button-danger" onClick={handleClearData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All
          </button>
        </div>
      </div>

      <div className="dashboard-filters">
        <div className="dashboard-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
          />
        </div>
        <div className="dashboard-filter-group">
          <label className="dashboard-filter-label">Filter by Stage:</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="dashboard-select"
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{getStageDisplayName(stage)}</option>
            ))}
          </select>
        </div>
        <div className="dashboard-stats">
          <span className="dashboard-stat">
            Total: <strong>{userData.length}</strong>
          </span>
          <span className="dashboard-stat">
            Filtered: <strong>{filteredAndSortedData.length}</strong>
          </span>
        </div>
      </div>

      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th className="dashboard-th dashboard-th-expand"></th>
              <th 
                className="dashboard-th dashboard-th-sortable" 
                onClick={() => handleSort('timestamp')}
              >
                Date/Time
                {sortBy === 'timestamp' && (
                  <span className="dashboard-sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="dashboard-th dashboard-th-sortable" 
                onClick={() => handleSort('name')}
              >
                Name
                {sortBy === 'name' && (
                  <span className="dashboard-sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="dashboard-th dashboard-th-sortable" 
                onClick={() => handleSort('email')}
              >
                Email
                {sortBy === 'email' && (
                  <span className="dashboard-sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="dashboard-th">Phone</th>
              <th 
                className="dashboard-th dashboard-th-sortable" 
                onClick={() => handleSort('stage')}
              >
                Stage
                {sortBy === 'stage' && (
                  <span className="dashboard-sort-indicator">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="dashboard-empty">
                  No user data found. {searchTerm || stageFilter !== 'all' ? 'Try adjusting your filters.' : 'Users will appear here as they use the app.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((user) => {
                const isExpanded = expandedRows.has(user.id);
                return (
                  <React.Fragment key={user.id}>
                    <tr 
                      className={`dashboard-row ${isExpanded ? 'dashboard-row-expanded' : ''}`}
                      data-stage={user.stage}
                      onClick={() => toggleRow(user.id)}
                    >
                      <td className="dashboard-td dashboard-td-expand">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          className={`dashboard-expand-icon ${isExpanded ? 'dashboard-expand-icon-expanded' : ''}`}
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </td>
                      <td className="dashboard-td">
                        {new Date(user.timestamp).toLocaleString()}
                      </td>
                      <td className="dashboard-td">{user.name || '-'}</td>
                      <td className="dashboard-td">{user.email || '-'}</td>
                      <td className="dashboard-td">{user.phone || '-'}</td>
                      <td className="dashboard-td">
                        <span className="dashboard-stage-badge">
                          {getStageDisplayName(user.stage)}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="dashboard-row-expanded-content">
                        <td colSpan={6} className="dashboard-td-expanded">
                          <div className="dashboard-expanded-content">
                            <div className="dashboard-expanded-section">
                              <h3 className="dashboard-expanded-title">Contact Information</h3>
                              <div className="dashboard-expanded-grid">
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Name:</span>
                                  <span className="dashboard-expanded-value">{user.name || 'Not provided'}</span>
                                </div>
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Email:</span>
                                  <span className="dashboard-expanded-value">{user.email || 'Not provided'}</span>
                                </div>
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Phone:</span>
                                  <span className="dashboard-expanded-value">{user.phone || 'Not provided'}</span>
                                </div>
                                {user.message && (
                                  <div className="dashboard-expanded-item dashboard-expanded-item-full">
                                    <span className="dashboard-expanded-label">Message:</span>
                                    <span className="dashboard-expanded-value">{user.message}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="dashboard-expanded-section">
                              <h3 className="dashboard-expanded-title">Selected Concerns</h3>
                              <div className="dashboard-expanded-tags">
                                {user.selectedConcerns.length > 0 ? (
                                  user.selectedConcerns.map(concernId => (
                                    <span key={concernId} className="dashboard-tag">
                                      {getConcernName(concernId)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="dashboard-expanded-empty">None selected</span>
                                )}
                              </div>
                            </div>

                            <div className="dashboard-expanded-section">
                              <h3 className="dashboard-expanded-title">Selected Areas</h3>
                              <div className="dashboard-expanded-tags">
                                {user.selectedAreas.length > 0 ? (
                                  user.selectedAreas.map(areaId => (
                                    <span key={areaId} className="dashboard-tag">
                                      {getAreaName(areaId)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="dashboard-expanded-empty">None selected</span>
                                )}
                              </div>
                            </div>

                            <div className="dashboard-expanded-section">
                              <h3 className="dashboard-expanded-title">Demographics</h3>
                              <div className="dashboard-expanded-grid">
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Age Range:</span>
                                  <span className="dashboard-expanded-value">{user.ageRange || 'Not provided'}</span>
                                </div>
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Skin Type:</span>
                                  <span className="dashboard-expanded-value">{user.skinType || 'Not provided'}</span>
                                </div>
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Skin Tone:</span>
                                  <span className="dashboard-expanded-value">{user.skinTone || 'Not provided'}</span>
                                </div>
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Ethnic Background:</span>
                                  <span className="dashboard-expanded-value">{user.ethnicBackground || 'Not provided'}</span>
                                </div>
                              </div>
                            </div>

                            {user.completedAt && (
                              <div className="dashboard-expanded-section">
                                <div className="dashboard-expanded-item">
                                  <span className="dashboard-expanded-label">Completed At:</span>
                                  <span className="dashboard-expanded-value">
                                    {new Date(user.completedAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
