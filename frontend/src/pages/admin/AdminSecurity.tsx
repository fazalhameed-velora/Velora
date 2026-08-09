import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { ipBlockAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Modal } from '../../components/ui/Common';
import notify from '../../utils/notifications';

export default function AdminSecurity() {
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ ip: '', reason: 'manual_block', notes: '', duration: 24 });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [blockedRes, statsRes] = await Promise.all([
        ipBlockAPI.getBlockedIPs() as any,
        ipBlockAPI.getStats() as any
      ]);
      setBlockedIPs(blockedRes.data?.blockedIPs || []);
      setStats(statsRes.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleBlockIP = async () => {
    if (!blockForm.ip) return;
    setSaving(true);
    try {
      await ipBlockAPI.blockIP({
        ip: blockForm.ip,
        reason: blockForm.reason,
        notes: blockForm.notes,
        duration: blockForm.duration
      });
      notify.success('IP Blocked', { description: `${blockForm.ip} has been blocked` });
      setShowBlockModal(false);
      setBlockForm({ ip: '', reason: 'manual_block', notes: '', duration: 24 });
      loadData();
    } catch (e: any) {
      notify.error('Failed', { description: e.message });
    } finally { setSaving(false); }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      await ipBlockAPI.unblockIP(ip);
      notify.success('IP Unblocked', { description: `${ip} has been unblocked` });
      loadData();
    } catch (e: any) {
      notify.error('Failed', { description: e.message });
    }
  };

  const reasonColors: Record<string, string> = {
    brute_force: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    suspicious_activity: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    manual_block: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    rate_limit_abuse: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    sql_injection_attempt: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    xss_attempt: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    other: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Security</h1>
          <p className="text-sm text-surface-500 mt-1">IP blocking and threat management</p>
        </div>
        <Button onClick={() => setShowBlockModal(true)}><Shield size={16} /> Block IP</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-4">
          <p className="text-sm text-surface-500">Blocked IPs</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats?.totalBlocked || 0}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-4">
          <p className="text-sm text-surface-500">Auto-Blocked</p>
          <p className="text-2xl font-bold text-red-600">{stats?.autoBlocked || 0}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-4">
          <p className="text-sm text-surface-500">Manual Blocks</p>
          <p className="text-2xl font-bold text-blue-600">{stats?.manualBlocked || 0}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-4">
          <p className="text-sm text-surface-500">Last 24h</p>
          <p className="text-2xl font-bold text-orange-600">{stats?.recentBlocks || 0}</p>
        </div>
      </div>

      {/* Blocked IPs List */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">
        <div className="p-5 border-b border-surface-100 dark:border-surface-800">
          <h3 className="font-semibold text-surface-900 dark:text-white">Blocked IPs</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-surface-500">Loading...</div>
        ) : blockedIPs.length === 0 ? (
          <div className="p-8 text-center text-surface-500">No blocked IPs</div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-800">
            {blockedIPs.map((item) => (
              <div key={item._id} className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-surface-900 dark:text-white">{item.ip}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${reasonColors[item.reason] || reasonColors.other}`}>{item.reason.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-surface-500 mt-1">
                      {item.blockedBy === 'system' ? 'Auto-blocked' : 'Manual block'} • {new Date(item.createdAt).toLocaleString()}
                      {item.blockedUntil && ` • Expires ${new Date(item.blockedUntil).toLocaleString()}`}
                    </p>
                    {item.notes && <p className="text-xs text-surface-400 mt-1">{item.notes}</p>}
                  </div>
                  <button 
                    onClick={() => handleUnblockIP(item.ip)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block IP Modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Block IP Address">
        <div className="space-y-4">
          <Input 
            label="IP Address" 
            value={blockForm.ip} 
            onChange={(e) => setBlockForm({ ...blockForm, ip: e.target.value })} 
            placeholder="192.168.1.1"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Reason</label>
            <select 
              value={blockForm.reason} 
              onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-sm"
            >
              <option value="manual_block">Manual Block</option>
              <option value="brute_force">Brute Force</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="sql_injection_attempt">SQL Injection</option>
              <option value="xss_attempt">XSS Attempt</option>
              <option value="rate_limit_abuse">Rate Limit Abuse</option>
            </select>
          </div>
          <Input 
            label="Notes (optional)" 
            value={blockForm.notes} 
            onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })} 
            placeholder="Optional notes"
          />
          <Input 
            label="Duration (hours)" 
            type="number"
            value={String(blockForm.duration)} 
            onChange={(e) => setBlockForm({ ...blockForm, duration: parseInt(e.target.value) || 24 })} 
            placeholder="24"
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-surface-100 dark:border-surface-800">
          <Button variant="outline" onClick={() => setShowBlockModal(false)} className="w-full sm:w-auto justify-center">Cancel</Button>
          <Button onClick={handleBlockIP} isLoading={saving} className="w-full sm:w-auto justify-center">Block IP</Button>
        </div>
      </Modal>
    </div>
  );
}
