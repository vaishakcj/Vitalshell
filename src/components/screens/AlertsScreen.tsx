import React, { useState } from 'react';
import {
  Heart,
  Droplets,
  Activity,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { AlertItem, AlertSeverity } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';

interface AlertsScreenProps {
  alerts: AlertItem[];
  onBack?: () => void;
  showBack?: boolean;
  onClearAlerts?: () => void;
  onDismissAlert?: (id: string) => void;
  onRestoreAlerts?: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onBack,
  showBack = false,
  onClearAlerts,
  onDismissAlert,
  onRestoreAlerts,
}) => {
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredAlerts = alerts.filter((item) => {
    if (filter === 'all') return true;
    return item.severity === filter;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    if (severity === 'critical') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          Critical
        </span>
      );
    }
    if (severity === 'elevated') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Elevated
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
        Resolved
      </span>
    );
  };

  const getAlertIcon = (item: AlertItem) => {
    if (item.title.includes('Fall')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-4 h-4" />
        </div>
      );
    }
    if (item.title.includes('Heart')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
          <Heart className="w-4 h-4 fill-amber-500/20" />
        </div>
      );
    }
    if (item.title.includes('Temperature')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
          <Thermometer className="w-4 h-4" />
        </div>
      );
    }
    if (item.title.includes('SpO₂') || item.title.includes('Oxygen')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
          <Droplets className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400">
        <Activity className="w-4 h-4" />
      </div>
    );
  };

  const handleConfirmClear = () => {
    onClearAlerts?.();
    setShowConfirmClear(false);
    setSelectedAlert(null);
  };

  const clearButton = alerts.length > 0 ? (
    <button
      id="clear-alerts-btn"
      onClick={() => setShowConfirmClear(true)}
      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer shadow-xs"
      title="Clear all alerts"
      aria-label="Clear all alerts"
    >
      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
      <span>Clear Alerts</span>
    </button>
  ) : (
    <div className="flex items-center space-x-1 text-xs text-teal-600 dark:text-teal-400 font-medium px-2 py-1">
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>All Clear</span>
    </div>
  );

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader
        title="Alerts"
        showBack={showBack}
        onBack={onBack}
        rightAction={clearButton}
      />

      {/* Tabs: All | Critical | Elevated | Resolved */}
      <div className="flex justify-center my-2">
        <div className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-[#0b1325] rounded-xl border border-slate-200 dark:border-[#16233d] w-full">
          {(['all', 'critical', 'elevated', 'resolved'] as const).map((tabKey) => {
            const isActive = filter === tabKey;
            const label = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
            return (
              <button
                key={tabKey}
                id={`alert-tab-${tabKey}`}
                onClick={() => setFilter(tabKey)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer capitalize text-center ${
                  isActive
                    ? 'bg-white dark:bg-[#182847] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-2.5 pb-4 mt-2">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 dark:text-teal-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {alerts.length === 0 ? 'No Active Alerts' : `No ${filter} alerts found.`}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 max-w-xs">
              {alerts.length === 0
                ? 'All alerts have been cleared. Monitoring sensors in real time.'
                : `There are currently no alerts matching the "${filter}" filter.`}
            </div>
            {alerts.length === 0 && onRestoreAlerts && (
              <button
                id="restore-sample-alerts-btn"
                onClick={onRestoreAlerts}
                className="mt-4 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 bg-white dark:bg-[#0b1325] transition cursor-pointer"
              >
                Restore Sample Alerts
              </button>
            )}
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedAlert(item)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] hover:border-cyan-500/40 transition text-left cursor-pointer group shadow-xs"
            >
              <div className="flex items-center space-x-3">
                {getAlertIcon(item)}
                <div>
                  <div className="text-slate-900 dark:text-white text-xs sm:text-sm font-semibold tracking-tight">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.source} • {item.time}
                  </div>
                </div>
              </div>

              <div>{getSeverityBadge(item.severity)}</div>
            </button>
          ))
        )}
      </div>

      {/* Confirm Clear Alerts Modal */}
      {showConfirmClear && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowConfirmClear(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-rose-500/40 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                  Clear All Alerts?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Are you sure you want to clear all {alerts.length} alerts?
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs mt-3 leading-relaxed">
              This will clear all critical, elevated, and resolved notifications from your current active session.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#182847] flex justify-end space-x-2">
              <button
                id="cancel-clear-alerts-btn"
                onClick={() => setShowConfirmClear(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                id="confirm-clear-alerts-btn"
                onClick={handleConfirmClear}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                <span>Clear All Alerts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <div className="flex items-center space-x-2">
                {getAlertIcon(selectedAlert)}
                <div>
                  <h3 className="text-slate-900 dark:text-white font-semibold text-sm">{selectedAlert.title}</h3>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {selectedAlert.source} • {selectedAlert.time}
                  </span>
                </div>
              </div>
              {getSeverityBadge(selectedAlert.severity)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-xs mt-3 leading-relaxed">
              {selectedAlert.description}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#182847] flex justify-end space-x-2">
              <button
                onClick={() => {
                  if (onDismissAlert) {
                    onDismissAlert(selectedAlert.id);
                  }
                  setSelectedAlert(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-medium"
              >
                Dismiss
              </button>
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
