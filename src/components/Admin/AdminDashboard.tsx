import { useState, useEffect, useMemo, FC } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Video,
  Building2,
  Home,
  PhoneCall,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  ExternalLink,
  Copy,
  ArrowLeft,
  CalendarCheck2,
  CalendarDays,
  Shield,
  Stethoscope,
  X,
  FileText,
  Check,
  Info,
  LogOut,
} from 'lucide-react';
import {
  Appointment,
  AppointmentStatus,
  fetchAppointments,
  updateAppointmentStatus,
  supabase,
} from '../../lib/supabase';
import { logoutAdmin } from '../../lib/auth';
import './AdminDashboard.css';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: FC<AdminDashboardProps> = ({ onNavigateHome, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelModalAppointment, setCancelModalAppointment] = useState<Appointment | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Appointments from Supabase
  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setFetchError(null);

    const { data, error } = await fetchAppointments();
    if (error) {
      console.error('Error fetching appointments:', error);
      setFetchError(error.message || 'Failed to load appointments from Supabase.');
      showToast('Could not load appointments from Supabase', 'error');
    } else if (data) {
      setAppointments(data);
      if (showRefreshIndicator) {
        showToast('Appointments updated with latest data', 'success');
      }
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Distinct Doctors for Filter
  const availableDoctors = useMemo(() => {
    const doctorsSet = new Set<string>();
    appointments.forEach((a) => {
      if (a.doctor) doctorsSet.add(a.doctor);
    });
    // Add standard clinic doctors if not yet populated
    ['Dr. Abhinav Chaudhary', 'Dr. Ravi Dahiya', 'Dr. Kapil Chauhan'].forEach((doc) =>
      doctorsSet.add(doc)
    );
    return Array.from(doctorsSet);
  }, [appointments]);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => (a.status || '').toLowerCase() === 'pending').length;
    const confirmed = appointments.filter((a) => (a.status || '').toLowerCase() === 'confirmed').length;
    const completed = appointments.filter((a) => (a.status || '').toLowerCase() === 'completed').length;
    const cancelled = appointments.filter((a) => (a.status || '').toLowerCase() === 'cancelled').length;
    const today = appointments.filter((a) => a.date === todayStr).length;
    const video = appointments.filter((a) => (a.appointment_type || '').toLowerCase().includes('video')).length;

    return { total, pending, confirmed, completed, cancelled, today, video };
  }, [appointments, todayStr]);

  // Filter & Search Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // 1. Search filter (Name, Phone, Email, Doctor, Message)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (appointment.patient_name || '').toLowerCase().includes(q);
        const phoneMatch = (appointment.phone || '').toLowerCase().includes(q);
        const emailMatch = (appointment.email || '').toLowerCase().includes(q);
        const doctorMatch = (appointment.doctor || '').toLowerCase().includes(q);
        const msgMatch = (appointment.message || '').toLowerCase().includes(q);

        if (!nameMatch && !phoneMatch && !emailMatch && !doctorMatch && !msgMatch) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all') {
        const currentStatus = (appointment.status || 'pending').toLowerCase();
        if (currentStatus !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Appointment type filter
      if (typeFilter !== 'all') {
        const type = (appointment.appointment_type || '').toLowerCase();
        if (typeFilter === 'video' && !type.includes('video')) return false;
        if (typeFilter === 'in_person' && (type.includes('video') || type.includes('home') || type.includes('telephonic'))) return false;
        if (typeFilter === 'home-visit' && !type.includes('home')) return false;
        if (typeFilter === 'telephonic' && !type.includes('telephonic')) return false;
      }

      // 4. Doctor filter
      if (doctorFilter !== 'all') {
        if (appointment.doctor !== doctorFilter) {
          return false;
        }
      }

      // 5. Date filter
      if (dateFilter === 'today') {
        if (appointment.date !== todayStr) return false;
      } else if (dateFilter === 'tomorrow') {
        if (appointment.date !== tomorrowStr) return false;
      } else if (dateFilter === 'custom' && customDate) {
        if (appointment.date !== customDate) return false;
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, typeFilter, doctorFilter, dateFilter, customDate, todayStr, tomorrowStr]);

  // Status Change Handlers
  const handleConfirmAppointment = async (appointmentId: string) => {
    if (confirmingId || cancellingId || isUpdatingStatus) return;

    setConfirmingId(appointmentId);
    setIsUpdatingStatus(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.access_token) {
        throw new Error('Authentication required. Please sign in to perform admin actions.');
      }

      const response = await fetch(
        'https://taranjeet09.app.n8n.cloud/webhook/admin-confirm-appointment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: appointmentId,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Failed to confirm appointment (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            const detail = errorData.message || errorData.error || errorData.details;
            if (detail && typeof detail === 'string') {
              errorMessage = detail;
            }
          }
        } catch {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      // Optimistically update appointment status to confirmed in local state
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? { ...item, status: 'confirmed' } : item))
      );
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
      }

      showToast('Appointment confirmed successfully!', 'success');

      // Refresh appointments from Supabase to sync any updated fields (e.g. meeting link)
      const { data, error } = await fetchAppointments();
      if (!error && data) {
        setAppointments(data);
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          const updated = data.find((a) => a.id === appointmentId);
          if (updated) {
            setSelectedAppointment(updated);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to confirm appointment via webhook:', error);
      const msg =
        error?.message && typeof error.message === 'string' && !error.message.includes('Failed to fetch')
          ? error.message
          : 'Failed to confirm appointment. Please check your connection and try again.';
      showToast(msg, 'error');
    } finally {
      setConfirmingId(null);
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (cancellingId || confirmingId || isUpdatingStatus) return;

    setCancellingId(appointmentId);
    setIsUpdatingStatus(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.access_token) {
        throw new Error('Authentication required. Please sign in to perform admin actions.');
      }

      const response = await fetch(
        'https://taranjeet09.app.n8n.cloud/webhook/admin-cancel-appointment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: appointmentId,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Failed to cancel appointment (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            const detail = errorData.message || errorData.error || errorData.details;
            if (detail && typeof detail === 'string') {
              errorMessage = detail;
            }
          }
        } catch {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      // Close cancel confirmation modal on success
      setCancelModalAppointment(null);

      showToast('Appointment cancelled successfully!', 'success');

      // Refresh appointments from Supabase to sync the new cancelled status
      const { data, error } = await fetchAppointments();
      if (!error && data) {
        setAppointments(data);
        if (selectedAppointment && selectedAppointment.id === appointmentId) {
          const updated = data.find((a) => a.id === appointmentId);
          if (updated) {
            setSelectedAppointment(updated);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to cancel appointment via webhook:', error);
      const msg =
        error?.message && typeof error.message === 'string' && !error.message.includes('Failed to fetch')
          ? error.message
          : 'Failed to cancel appointment. Please check your connection and try again.';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    if (newStatus === 'confirmed') {
      return handleConfirmAppointment(appointmentId);
    }
    if (newStatus === 'cancelled') {
      return handleCancelAppointment(appointmentId);
    }

    setIsUpdatingStatus(true);
    const { success, error } = await updateAppointmentStatus(appointmentId, newStatus);
    setIsUpdatingStatus(false);

    if (success) {
      // Optimistic update
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointmentId ? { ...item, status: newStatus } : item))
      );
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Appointment status changed to ${newStatus.toUpperCase()}`, 'success');
    } else {
      console.error('Failed to update status:', error);
      showToast(`Failed to update status: ${error?.message || 'Database error'}`, 'error');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalAppointment) return;
    await handleCancelAppointment(cancelModalAppointment.id);
  };

  const handleCopyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast('Meeting link copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      showToast('Logged out successfully', 'info');
      if (onLogout) {
        onLogout();
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      showToast('Failed to log out', 'error');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDoctorFilter('all');
    setDateFilter('all');
    setCustomDate('');
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date not specified';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDisplayTime = (timeStr: string | null) => {
    if (!timeStr) return 'Time not set';
    // If it's already HH:MM:SS or HH:MM
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'confirmed':
        return (
          <span className="status-badge status-confirmed">
            <CheckCircle2 size={13} />
            <span>Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="status-badge status-completed">
            <Check size={13} />
            <span>Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="status-badge status-cancelled">
            <XCircle size={13} />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="status-badge status-pending">
            <Clock3 size={13} />
            <span>Pending</span>
          </span>
        );
    }
  };

  const getTypeBadge = (type: string | null) => {
    const t = (type || 'in_person').toLowerCase();
    if (t.includes('video')) {
      return (
        <span className="type-badge type-video">
          <Video size={13} />
          <span>Video Consult</span>
        </span>
      );
    }
    if (t.includes('home')) {
      return (
        <span className="type-badge type-home">
          <Home size={13} />
          <span>Home Visit</span>
        </span>
      );
    }
    if (t.includes('telephonic')) {
      return (
        <span className="type-badge type-phone">
          <PhoneCall size={13} />
          <span>Telephonic</span>
        </span>
      );
    }
    return (
      <span className="type-badge type-clinic">
        <Building2 size={13} />
        <span>In-Clinic</span>
      </span>
    );
  };

  return (
    <div className="admin-root">
      {/* Top Ambient Light Glow */}
      <div className="admin-ambient-glow" aria-hidden="true" />

      {/* Admin Top Navigation Bar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand-section">
            <button
              type="button"
              className="admin-back-btn"
              onClick={onNavigateHome}
              title="Return to ARK Clinic website"
            >
              <ArrowLeft size={18} />
              <span>Patient Website</span>
            </button>
            <div className="admin-brand-divider" />
            <div className="admin-brand-meta">
              <div className="admin-crest">
                <span className="crest-ark">ARK</span>
              </div>
              <div className="admin-brand-text">
                <div className="admin-title-row">
                  <h1 className="admin-title">ARK CLINIC</h1>
                  <span className="admin-tag">
                    <Shield size={12} />
                    <span>Clinical Portal</span>
                  </span>
                </div>
                <p className="admin-subtitle">Appointments & Patient Consultation Management</p>
              </div>
            </div>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className={`admin-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={() => loadData(true)}
              disabled={isLoading || isRefreshing}
              title="Fetch latest appointments from Supabase"
            >
              <RefreshCw size={16} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
            <div className="admin-live-pill">
              <span className="live-dot" />
              <span>Supabase Live</span>
            </div>
            <button
              type="button"
              className="admin-logout-btn"
              onClick={handleLogout}
              title="Sign out of Clinical Portal"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Welcome Banner / Overview */}
          <div className="admin-welcome-bar">
            <div>
              <h2 className="admin-page-heading">Appointment Command Center</h2>
              <p className="admin-page-desc">
                Review incoming consultation requests, launch Google Meet sessions, and update patient statuses in real time.
              </p>
            </div>
            <div className="admin-today-badge">
              <CalendarDays size={18} />
              <div>
                <span className="today-label">Today's Date</span>
                <strong className="today-value">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <section className="stats-grid" aria-label="Appointment Statistics">
            {/* Total */}
            <div
              className={`stat-card ${statusFilter === 'all' ? 'active-stat' : ''}`}
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('all');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-header">
                <span className="stat-label">Total Appointments</span>
                <div className="stat-icon-wrapper stat-icon-burgundy">
                  <CalendarCheck2 size={20} />
                </div>
              </div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-footer">
                <span>All recorded consultations</span>
              </div>
            </div>

            {/* Pending */}
            <div
              className={`stat-card ${statusFilter === 'pending' ? 'active-stat' : ''}`}
              onClick={() => {
                setStatusFilter('pending');
                setDateFilter('all');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-header">
                <span className="stat-label">Pending Review</span>
                <div className="stat-icon-wrapper stat-icon-amber">
                  <Clock3 size={20} />
                </div>
              </div>
              <div className="stat-number stat-amber">{stats.pending}</div>
              <div className="stat-footer">
                <span className="stat-highlight-amber">Requires action</span>
              </div>
            </div>

            {/* Confirmed */}
            <div
              className={`stat-card ${statusFilter === 'confirmed' ? 'active-stat' : ''}`}
              onClick={() => {
                setStatusFilter('confirmed');
                setDateFilter('all');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-header">
                <span className="stat-label">Confirmed</span>
                <div className="stat-icon-wrapper stat-icon-emerald">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="stat-number stat-emerald">{stats.confirmed}</div>
              <div className="stat-footer">
                <span>Active scheduled visits</span>
              </div>
            </div>

            {/* Today */}
            <div
              className={`stat-card ${dateFilter === 'today' ? 'active-stat' : ''}`}
              onClick={() => {
                setDateFilter('today');
                setStatusFilter('all');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-header">
                <span className="stat-label">Today's Schedule</span>
                <div className="stat-icon-wrapper stat-icon-gold">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="stat-number stat-gold">{stats.today}</div>
              <div className="stat-footer">
                <span>Appointments for today</span>
              </div>
            </div>

            {/* Video Consultations */}
            <div
              className={`stat-card ${typeFilter === 'video' ? 'active-stat' : ''}`}
              onClick={() => {
                setTypeFilter(typeFilter === 'video' ? 'all' : 'video');
              }}
              role="button"
              tabIndex={0}
            >
              <div className="stat-card-header">
                <span className="stat-label">Video Consults</span>
                <div className="stat-icon-wrapper stat-icon-purple">
                  <Video size={20} />
                </div>
              </div>
              <div className="stat-number">{stats.video}</div>
              <div className="stat-footer">
                <span>Google Meet links</span>
              </div>
            </div>
          </section>

          {/* Search, Filter & Action Toolbar */}
          <div className="admin-toolbar">
            <div className="toolbar-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient name, phone, email, doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toolbar-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="toolbar-filters">
              {/* Status Filter */}
              <div className="filter-select-wrapper">
                <label htmlFor="filter-status" className="filter-label">Status:</label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="filter-select-wrapper">
                <label htmlFor="filter-type" className="filter-label">Type:</label>
                <select
                  id="filter-type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="video">Video Consult</option>
                  <option value="in_person">In-Clinic</option>
                  <option value="home-visit">Home Visit</option>
                  <option value="telephonic">Telephonic</option>
                </select>
              </div>

              {/* Doctor Filter */}
              <div className="filter-select-wrapper">
                <label htmlFor="filter-doctor" className="filter-label">Doctor:</label>
                <select
                  id="filter-doctor"
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Doctors</option>
                  {availableDoctors.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="filter-select-wrapper">
                <label htmlFor="filter-date" className="filter-label">Date:</label>
                <select
                  id="filter-date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value !== 'custom') setCustomDate('');
                  }}
                  className="filter-select"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {dateFilter === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="filter-date-input"
                />
              )}

              {(searchQuery ||
                statusFilter !== 'all' ||
                typeFilter !== 'all' ||
                doctorFilter !== 'all' ||
                dateFilter !== 'all') && (
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={resetFilters}
                  title="Clear all filters"
                >
                  <Filter size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Count & Filter Pill Summary */}
          <div className="results-summary">
            <span className="results-count">
              Showing <strong>{filteredAppointments.length}</strong> of{' '}
              <strong>{appointments.length}</strong> appointments
            </span>
            {searchQuery && (
              <span className="active-filter-tag">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Error Message if any */}
          {fetchError && (
            <div className="admin-error-box" role="alert">
              <AlertCircle size={20} />
              <div className="error-content">
                <strong>Connection Error:</strong> {fetchError}
              </div>
              <button
                type="button"
                className="error-retry-btn"
                onClick={() => loadData(true)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Appointments Table Card */}
          <div className="appointments-table-card">
            {isLoading ? (
              <div className="admin-loading-state">
                <RefreshCw size={36} className="spinning text-gold" />
                <p>Loading real-time appointments from Supabase...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="admin-empty-state">
                <div className="empty-icon-circle">
                  <Calendar size={36} />
                </div>
                <h3>No Appointments Found</h3>
                <p>
                  {appointments.length === 0
                    ? 'There are currently no appointment submissions in the database.'
                    : 'No appointments match your current search and filter criteria.'}
                </p>
                {appointments.length > 0 && (
                  <button type="button" className="empty-reset-btn" onClick={resetFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Patient Details</th>
                      <th>Physician / Doctor</th>
                      <th>Type</th>
                      <th>Scheduled For</th>
                      <th>Status</th>
                      <th>Consultation Link</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => {
                      const isVideo = (appointment.appointment_type || '').toLowerCase().includes('video');
                      const hasMeetLink = Boolean(appointment.meeting_link && appointment.meeting_link.trim());

                      return (
                        <tr key={appointment.id} className="appointment-row">
                          {/* Patient Info */}
                          <td>
                            <div className="patient-cell">
                              <div className="patient-avatar">
                                {(appointment.patient_name || 'U')
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="patient-meta">
                                <button
                                  type="button"
                                  className="patient-name-btn"
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                  {appointment.patient_name || 'Anonymous Patient'}
                                </button>
                                <div className="patient-contacts">
                                  {appointment.phone && (
                                    <a
                                      href={`tel:${appointment.phone}`}
                                      className="contact-link"
                                      title="Call patient"
                                    >
                                      <Phone size={12} />
                                      <span>{appointment.phone}</span>
                                    </a>
                                  )}
                                  {appointment.email && (
                                    <a
                                      href={`mailto:${appointment.email}`}
                                      className="contact-link"
                                      title="Email patient"
                                    >
                                      <Mail size={12} />
                                      <span>{appointment.email}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Doctor */}
                          <td>
                            <div className="doctor-cell">
                              <Stethoscope size={14} className="doctor-icon" />
                              <span>{appointment.doctor || 'Any Available Doctor'}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td>{getTypeBadge(appointment.appointment_type)}</td>

                          {/* Date & Time */}
                          <td>
                            <div className="datetime-cell">
                              <div className="date-item">
                                <Calendar size={13} />
                                <strong>{formatDisplayDate(appointment.date)}</strong>
                              </div>
                              <div className="time-item">
                                <Clock size={13} />
                                <span>{formatDisplayTime(appointment.time)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td>{getStatusBadge(appointment.status)}</td>

                          {/* Meeting Link / Video Action */}
                          <td>
                            {isVideo && hasMeetLink ? (
                              <div className="meet-link-group">
                                <a
                                  href={appointment.meeting_link!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-join-meet"
                                  title="Open Google Meet session"
                                >
                                  <Video size={14} />
                                  <span>Join Google Meet</span>
                                  <ExternalLink size={12} />
                                </a>
                                <button
                                  type="button"
                                  className="btn-copy-meet"
                                  onClick={() => handleCopyMeetingLink(appointment.meeting_link!)}
                                  title="Copy Google Meet Link"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            ) : isVideo ? (
                              <span className="no-meet-link">
                                <Video size={13} />
                                <span>Link Pending</span>
                              </span>
                            ) : (
                              <span className="in-person-note">
                                <Building2 size={13} />
                                <span>In-Clinic Visit</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="td-actions">
                            <div className="row-actions">
                              {/* View details */}
                              <button
                                type="button"
                                className="action-icon-btn action-view"
                                onClick={() => setSelectedAppointment(appointment)}
                                title="View full appointment details"
                              >
                                <Info size={16} />
                              </button>

                              {/* Quick Confirm if pending */}
                              {(appointment.status || '').toLowerCase() === 'pending' && (
                                <button
                                  type="button"
                                  className="action-icon-btn action-confirm"
                                  onClick={() => handleConfirmAppointment(appointment.id)}
                                  disabled={isUpdatingStatus || confirmingId === appointment.id}
                                  title={confirmingId === appointment.id ? 'Confirming appointment...' : 'Confirm appointment'}
                                >
                                  {confirmingId === appointment.id ? (
                                    <RefreshCw size={16} className="spinning" />
                                  ) : (
                                    <CheckCircle2 size={16} />
                                  )}
                                </button>
                              )}

                              {/* Quick Complete if confirmed */}
                              {(appointment.status || '').toLowerCase() === 'confirmed' && (
                                <button
                                  type="button"
                                  className="action-icon-btn action-complete"
                                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                                  disabled={isUpdatingStatus}
                                  title="Mark as completed"
                                >
                                  <Check size={16} />
                                </button>
                              )}

                              {/* Cancel action with modal confirmation */}
                              {(appointment.status || '').toLowerCase() !== 'cancelled' && (
                                <button
                                  type="button"
                                  className="action-icon-btn action-cancel"
                                  onClick={() => setCancelModalAppointment(appointment)}
                                  disabled={isUpdatingStatus}
                                  title="Cancel appointment"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-meta">
                <span className="modal-pretitle">Clinical Appointment Record</span>
                <h3 id="modal-title" className="modal-title">
                  {selectedAppointment.patient_name || 'Patient Appointment'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close dialog"
                title="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Status Management Bar */}
              <div className="modal-status-bar">
                <div className="status-label-group">
                  <span className="text-muted-sm">Current Status</span>
                  <div className="modal-current-badge">{getStatusBadge(selectedAppointment.status)}</div>
                </div>

                <div className="status-actions-group">
                  <span className="text-muted-sm">Change Status:</span>
                  <div className="status-quick-buttons">
                    <button
                      type="button"
                      className={`btn-pill-status ${
                        (selectedAppointment.status || '').toLowerCase() === 'pending' ? 'active-pending' : ''
                      }`}
                      onClick={() => handleStatusChange(selectedAppointment.id, 'pending')}
                      disabled={isUpdatingStatus}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      className={`btn-pill-status ${
                        (selectedAppointment.status || '').toLowerCase() === 'confirmed' ? 'active-confirmed' : ''
                      }`}
                      onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                      disabled={isUpdatingStatus || confirmingId === selectedAppointment.id}
                    >
                      {confirmingId === selectedAppointment.id ? 'Confirming...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      className={`btn-pill-status ${
                        (selectedAppointment.status || '').toLowerCase() === 'completed' ? 'active-completed' : ''
                      }`}
                      onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                      disabled={isUpdatingStatus}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      className={`btn-pill-status ${
                        (selectedAppointment.status || '').toLowerCase() === 'cancelled' ? 'active-cancelled' : ''
                      }`}
                      onClick={() => {
                        setCancelModalAppointment(selectedAppointment);
                      }}
                      disabled={isUpdatingStatus}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* 1. Patient Information */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <div className="modal-section-icon">
                    <User size={15} />
                  </div>
                  <h4 className="modal-section-title">Patient Information</h4>
                </div>
                <div className="modal-details-grid">
                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <User size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Patient Name</span>
                      <strong className="detail-value">{selectedAppointment.patient_name || '—'}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <Phone size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Phone Number</span>
                      {selectedAppointment.phone ? (
                        <a href={`tel:${selectedAppointment.phone}`} className="detail-link">
                          {selectedAppointment.phone}
                        </a>
                      ) : (
                        <span className="detail-value text-muted">—</span>
                      )}
                    </div>
                  </div>

                  <div className="detail-item detail-item-full">
                    <div className="detail-icon-circle">
                      <Mail size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Email Address</span>
                      {selectedAppointment.email ? (
                        <a href={`mailto:${selectedAppointment.email}`} className="detail-link">
                          {selectedAppointment.email}
                        </a>
                      ) : (
                        <span className="detail-value text-muted">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Appointment Information */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <div className="modal-section-icon">
                    <CalendarDays size={15} />
                  </div>
                  <h4 className="modal-section-title">Appointment Information</h4>
                </div>
                <div className="modal-details-grid">
                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <Stethoscope size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Attending Doctor</span>
                      <strong className="detail-value">{selectedAppointment.doctor || 'Any Available Doctor'}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <Building2 size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Appointment Type</span>
                      <div className="detail-badge-wrap">{getTypeBadge(selectedAppointment.appointment_type)}</div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <Calendar size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Appointment Date</span>
                      <strong className="detail-value">
                        {formatDisplayDate(selectedAppointment.date)}
                      </strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-icon-circle">
                      <Clock size={14} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Appointment Time</span>
                      <strong className="detail-value">
                        {formatDisplayTime(selectedAppointment.time)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Patient Symptoms / Clinical Notes if present */}
                {selectedAppointment.message && (
                  <div className="modal-notes-section">
                    <div className="notes-header">
                      <FileText size={14} />
                      <span>Patient Symptoms & Clinical Notes</span>
                    </div>
                    <p className="notes-content">{selectedAppointment.message}</p>
                  </div>
                )}
              </div>

              {/* 3. Consultation Information */}
              <div className="modal-section">
                <div className="modal-section-header">
                  <div className="modal-section-icon">
                    <Video size={15} />
                  </div>
                  <h4 className="modal-section-title">Consultation Information</h4>
                </div>

                {(() => {
                  const isVideo = (selectedAppointment.appointment_type || '').toLowerCase().includes('video');
                  const status = (selectedAppointment.status || '').toLowerCase();
                  const isConfirmed = status === 'confirmed';
                  const isPending = status === 'pending';
                  const isCancelled = status === 'cancelled';

                  // 1. If appointment status is cancelled, hide the entire Google Meet section
                  if (isCancelled) {
                    return (
                      <div className="modal-consultation-card consult-cancelled-state">
                        <div className="consult-card-header">
                          <div className="consult-badge-icon cancel-icon-bg">
                            <XCircle size={16} />
                          </div>
                          <div>
                            <strong className="consult-headline">Appointment Cancelled</strong>
                            <p className="consult-subtext">
                              This appointment has been cancelled. No active consultation session is scheduled.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 2. For pending appointments (video or in-person): show Awaiting Confirmation
                  if (isPending) {
                    return (
                      <div className="modal-consultation-card consult-pending-state">
                        <div className="consult-card-header">
                          <div className="consult-badge-icon pending-icon-bg">
                            <Clock3 size={16} />
                          </div>
                          <div>
                            <strong className="consult-headline">Awaiting Confirmation</strong>
                            <p className="consult-subtext">
                              This appointment is awaiting administrative confirmation. Consultation details and Google Meet link will be generated upon confirmation.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 3. For confirmed video appointments: show Google Meet section
                  if (isVideo && isConfirmed) {
                    return (
                      <div className="modal-consultation-card consult-video-confirmed">
                        <div className="consult-card-header">
                          <div className="consult-header-left">
                            <div className="consult-badge-icon video-icon-bg">
                              <Video size={16} />
                            </div>
                            <div>
                              <strong className="consult-headline">Google Meet Consultation</strong>
                              <span className="consult-subtext">Online Teleconsultation session</span>
                            </div>
                          </div>
                          {selectedAppointment.meeting_link && (
                            <button
                              type="button"
                              className="btn-copy-meet-sm"
                              onClick={() => handleCopyMeetingLink(selectedAppointment.meeting_link!)}
                              title="Copy Google Meet Link"
                            >
                              <Copy size={13} />
                              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                            </button>
                          )}
                        </div>

                        {selectedAppointment.meeting_link ? (
                          <div className="consult-video-actions">
                            <div className="meeting-url-display">
                              <code>{selectedAppointment.meeting_link}</code>
                            </div>
                            <div className="consult-btn-row">
                              <a
                                href={selectedAppointment.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-btn-join"
                              >
                                <Video size={16} />
                                <span>Join Google Meet</span>
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <p className="consult-no-link-warning">
                            Google Meet link will be generated automatically via Google Calendar sync.
                          </p>
                        )}
                      </div>
                    );
                  }

                  // 4. For in-person appointments (confirmed or completed)
                  if (!isVideo) {
                    return (
                      <div className="modal-consultation-card consult-in-person-state">
                        <div className="consult-card-header">
                          <div className="consult-badge-icon clinic-icon-bg">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <strong className="consult-headline">In-Person Appointment</strong>
                            <p className="consult-subtext">
                              Clinical consultation at ARK Clinic, Safdarjung Enclave, New Delhi.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 5. Default Fallback
                  return (
                    <div className="modal-consultation-card consult-default-state">
                      <div className="consult-card-header">
                        <div className="consult-badge-icon clinic-icon-bg">
                          <Stethoscope size={16} />
                        </div>
                        <div>
                          <strong className="consult-headline">{selectedAppointment.appointment_type || 'Consultation'}</strong>
                          <p className="consult-subtext">Standard clinical consultation</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 4. System Information */}
              <div className="modal-section modal-section-system">
                <div className="modal-section-header">
                  <div className="modal-section-icon">
                    <Shield size={15} />
                  </div>
                  <h4 className="modal-section-title">System Information</h4>
                </div>
                <div className="modal-system-grid">
                  <div className="system-item">
                    <span className="system-label">Appointment ID</span>
                    <code className="system-code-val">{selectedAppointment.id}</code>
                  </div>
                  <div className="system-item">
                    <span className="system-label">Created Date & Time</span>
                    <span className="system-val">
                      {new Date(selectedAppointment.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {((selectedAppointment as any).calendar_event_id || (selectedAppointment as any).event_id) && (
                    <div className="system-item">
                      <span className="system-label">Calendar Event ID</span>
                      <code className="system-code-val">
                        {(selectedAppointment as any).calendar_event_id || (selectedAppointment as any).event_id}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalAppointment && (
        <div className="modal-backdrop" onClick={() => setCancelModalAppointment(null)}>
          <div
            className="modal-card modal-confirm-card"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-cancel-title"
          >
            <div className="confirm-icon-box">
              <AlertCircle size={36} />
            </div>
            <h3 id="confirm-cancel-title" className="confirm-title">
              Cancel Appointment?
            </h3>
            <p className="confirm-text">
              Are you sure you want to cancel the appointment for{' '}
              <strong>{cancelModalAppointment.patient_name}</strong> on{' '}
              <strong>{formatDisplayDate(cancelModalAppointment.date)}</strong> at{' '}
              <strong>{formatDisplayTime(cancelModalAppointment.time)}</strong>?
            </p>
            <p className="confirm-subtext">
              This will update the status to <strong>Cancelled</strong> in the Supabase database.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn-confirm-dismiss"
                onClick={() => setCancelModalAppointment(null)}
                disabled={isUpdatingStatus}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="btn-confirm-danger"
                onClick={handleConfirmCancel}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? 'Cancelling...' : 'Yes, Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className={`admin-toast toast-${toastMessage.type}`} role="alert">
          {toastMessage.type === 'success' && <CheckCircle2 size={18} />}
          {toastMessage.type === 'error' && <AlertCircle size={18} />}
          {toastMessage.type === 'info' && <Info size={18} />}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
