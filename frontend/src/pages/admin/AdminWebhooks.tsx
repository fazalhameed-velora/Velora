import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Trash2, AlertTriangle, CheckCircle, Clock, XCircle, Search, ChevronDown, ChevronUp, RotateCcw, Eye, Filter } from 'lucide-react';
import { webhookAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import { Badge, Modal } from '../../components/ui/Common';
import notify from '../../utils/notifications';
import { formatDate } from '../../utils';

interface WebhookStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead_letter: number;
}

interface WebhookEvent {
  _id: string;
  eventId: string;
  eventType: string;
  status: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  errorHistory?: Array<{
    attempt: number;
    error: string;
    timestamp: string;
  }>;
  nextRetryAt?: string;
  completedAt?: string;
  deadLetterReason?: string;
  deadLetterAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'warning', icon: Clock, label: 'Pending' },
  processing: { color: 'info', icon: RefreshCw, label: 'Processing' },
  completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  failed: { color: 'danger', icon: XCircle, label: 'Failed' },
  dead_letter: { color: 'danger', icon: AlertTriangle, label: 'Dead Letter' },
};

function StatCard({ label, value, icon: Icon, color, gradient }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
}) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-5 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={22} />
        </div>
      </div>
      <div>
        <p className="text-sm text-surface-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function EventRow({ event, onRetry, onViewDetails }: {
  event: WebhookEvent;
  onRetry: (eventId: string) => void;
  onViewDetails: (event: WebhookEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = statusConfig[event.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="border-b border-surface-50 dark:border-surface-800 last:border-0">
      <div className="flex items-center justify-between p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            event.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
            event.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
            event.status === 'dead_letter' ? 'bg-orange-100 dark:bg-orange-900/30' :
            'bg-surface-100 dark:bg-surface-800'
          }`}>
            <StatusIcon size={18} className={`${
              event.status === 'completed' ? 'text-green-600' :
              event.status === 'failed' ? 'text-red-600' :
              event.status === 'dead_letter' ? 'text-orange-600' :
              'text-surface-500'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-surface-900 dark:text-white">{event.eventType}</span>
              <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>
            </div>
            <p className="text-xs text-surface-500 mt-0.5 truncate">
              ID: {event.eventId} • {formatDate(event.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {event.retryCount > 0 && (
            <span className="text-xs text-surface-500">
              Retry {event.retryCount}/{event.maxRetries}
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => onViewDetails(event)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 transition-colors"
          >
            <Eye size={16} />
          </button>
          {(event.status === 'failed' || event.status === 'dead_letter') && (
            <button
              onClick={() => onRetry(event.eventId)}
              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
              title="Retry event"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 bg-surface-50 dark:bg-surface-800/30">
          <div className="text-sm space-y-2">
            {event.lastError && (
              <div>
                <span className="font-medium text-surface-700 dark:text-surface-300">Last Error:</span>
                <p className="text-red-600 dark:text-red-400 mt-1">{event.lastError}</p>
              </div>
            )}
            {event.deadLetterReason && (
              <div>
                <span className="font-medium text-surface-700 dark:text-surface-300">Dead Letter Reason:</span>
                <p className="text-orange-600 dark:text-orange-400 mt-1">{event.deadLetterReason}</p>
              </div>
            )}
            {event.nextRetryAt && (
              <div>
                <span className="font-medium text-surface-700 dark:text-surface-300">Next Retry:</span>
                <span className="ml-2 text-surface-600 dark:text-surface-400">{formatDate(event.nextRetryAt)}</span>
              </div>
            )}
            {event.errorHistory && event.errorHistory.length > 0 && (
              <div>
                <span className="font-medium text-surface-700 dark:text-surface-300">Error History:</span>
                <div className="mt-2 space-y-1">
                  {event.errorHistory.map((err, i) => (
                    <div key={i} className="text-xs bg-white dark:bg-surface-900 p-2 rounded-lg">
                      <span className="font-medium">Attempt {err.attempt}:</span>{' '}
                      <span className="text-red-600 dark:text-red-400">{err.error}</span>
                      <span className="text-surface-500 ml-2">({formatDate(err.timestamp)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EventDetailsModal({ event, onClose }: { event: WebhookEvent | null; onClose: () => void }) {
  if (!event) return null;

  return (
    <Modal isOpen={!!event} onClose={onClose} title="Event Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-surface-500">Event Type</label>
            <p className="text-surface-900 dark:text-white font-medium">{event.eventType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-500">Status</label>
            <Badge variant={statusConfig[event.status]?.color as any}>
              {statusConfig[event.status]?.label}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-500">Event ID</label>
            <p className="text-surface-900 dark:text-white font-mono text-sm break-all">{event.eventId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-500">Retries</label>
            <p className="text-surface-900 dark:text-white">{event.retryCount} / {event.maxRetries}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-500">Created</label>
            <p className="text-surface-900 dark:text-white">{formatDate(event.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-surface-500">Updated</label>
            <p className="text-surface-900 dark:text-white">{formatDate(event.updatedAt)}</p>
          </div>
        </div>

        {event.lastError && (
          <div>
            <label className="text-sm font-medium text-surface-500">Last Error</label>
            <p className="text-red-600 dark:text-red-400 mt-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {event.lastError}
            </p>
          </div>
        )}

        {event.deadLetterReason && (
          <div>
            <label className="text-sm font-medium text-surface-500">Dead Letter Reason</label>
            <p className="text-orange-600 dark:text-orange-400 mt-1 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              {event.deadLetterReason}
            </p>
          </div>
        )}

        {event.errorHistory && event.errorHistory.length > 0 && (
          <div>
            <label className="text-sm font-medium text-surface-500">Error History</label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {event.errorHistory.map((err, i) => (
                <div key={i} className="bg-surface-50 dark:bg-surface-800 p-3 rounded-lg text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-surface-900 dark:text-white">Attempt {err.attempt}</span>
                    <span className="text-xs text-surface-500">{formatDate(err.timestamp)}</span>
                  </div>
                  <p className="text-red-600 dark:text-red-400 mt-1">{err.error}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AdminWebhooks() {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [deadLetterEvents, setDeadLetterEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  const loadStats = async () => {
    try {
      const res: any = await webhookAPI.getStats();
      setStats(res.data);
    } catch (e) {
      console.error('Error loading webhook stats:', e);
    }
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res: any = await webhookAPI.getRecent(params);
      setEvents(res.data || []);
    } catch (e) {
      console.error('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadDeadLetter = async () => {
    try {
      const res: any = await webhookAPI.getDeadLetter();
      setDeadLetterEvents(res.data || []);
    } catch (e) {
      console.error('Error loading dead letter events:', e);
    }
  };

  useEffect(() => {
    loadStats();
    loadEvents();
    loadDeadLetter();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRetry = async (eventId: string) => {
    setRetrying(eventId);
    try {
      await webhookAPI.retryEvent(eventId);
      notify.success('Event Queued', { description: 'The event has been queued for retry.' });
      loadStats();
      loadEvents();
      loadDeadLetter();
    } catch (e: any) {
      notify.error('Retry Failed', { description: e.message });
    } finally {
      setRetrying(null);
    }
  };

  const handleRetryAll = async () => {
    setRetryingAll(true);
    try {
      const res: any = await webhookAPI.retryAll();
      notify.success('Retry Queued', { description: `${res.data.retriedCount} events queued for retry.` });
      loadStats();
      loadEvents();
      loadDeadLetter();
    } catch (e: any) {
      notify.error('Retry Failed', { description: e.message });
    } finally {
      setRetryingAll(false);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('Clean up events older than 30 days?')) return;
    try {
      const res: any = await webhookAPI.cleanup({ days: '30' });
      notify.success('Cleanup Complete', { description: `${res.data.deletedCount} old events removed.` });
      loadStats();
      loadEvents();
    } catch (e: any) {
      notify.error('Cleanup Failed', { description: e.message });
    }
  };

  const handleRefresh = () => {
    loadStats();
    loadEvents();
    loadDeadLetter();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Webhooks</h1>
          <p className="text-sm text-surface-500 mt-1">Monitor webhook events and manage retries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} />
          </Button>
          <Button variant="outline" onClick={handleCleanup}>
            <Trash2 size={16} /> Cleanup Old
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            color="warning"
            gradient="from-yellow-500 to-orange-500"
          />
          <StatCard
            label="Processing"
            value={stats.processing}
            icon={RefreshCw}
            color="info"
            gradient="from-blue-500 to-indigo-500"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="success"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            color="danger"
            gradient="from-red-500 to-pink-500"
          />
          <StatCard
            label="Dead Letter"
            value={stats.dead_letter}
            icon={AlertTriangle}
            color="danger"
            gradient="from-orange-500 to-red-500"
          />
        </div>
      )}

      {/* Dead Letter Queue Section */}
      {deadLetterEvents.length > 0 && (
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-red-900 dark:text-red-400">Dead Letter Queue</h2>
                <p className="text-sm text-red-600 dark:text-red-500">{deadLetterEvents.length} events permanently failed</p>
              </div>
            </div>
            <Button
              onClick={handleRetryAll}
              isLoading={retryingAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RotateCcw size={16} /> Retry All
            </Button>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {deadLetterEvents.slice(0, 5).map(event => (
              <EventRow
                key={event._id}
                event={event}
                onRetry={handleRetry}
                onViewDetails={setSelectedEvent}
              />
            ))}
          </div>
          {deadLetterEvents.length > 5 && (
            <div className="p-4 text-center border-t border-surface-100 dark:border-surface-800">
              <p className="text-sm text-surface-500">
                Showing 5 of {deadLetterEvents.length} dead letter events
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Events Section */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Filter size={18} className="text-primary-600" />
            </div>
            <h2 className="font-bold text-surface-900 dark:text-white">Recent Events</h2>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm font-medium"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="dead_letter">Dead Letter</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-surface-500 mt-3">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
            <p className="font-medium">No events found</p>
            <p className="text-sm mt-1">Webhook events will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {events.map(event => (
              <EventRow
                key={event._id}
                event={event}
                onRetry={handleRetry}
                onViewDetails={setSelectedEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
