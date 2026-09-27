import React, { useState } from 'react';
import {
  User,
  ChevronRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Phone,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { EmergencyContact } from '../../types';
import { ScreenHeader } from '../common/ScreenHeader';

interface EmergencyContactsScreenProps {
  contacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
  onBack: () => void;
}

export const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({
  contacts,
  onUpdateContacts,
  onBack,
}) => {
  const [testingAlert, setTestingAlert] = useState(false);
  const [alertSentModal, setAlertSentModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // New contact form state
  const [newRelation, setNewRelation] = useState('Doctor');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const secondaryContact = contacts.find((c) => !c.isPrimary) || contacts[1];

  const handleTestAlert = () => {
    setTestingAlert(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const updated = contacts.map((c) => ({
        ...c,
        notified: true,
        notifiedTime: `Sent at ${timeStr}`,
      }));

      onUpdateContacts(updated);
      setTestingAlert(false);
      setAlertSentModal(true);
    }, 1500);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newEntry: EmergencyContact = {
      id: `cnt-${Date.now()}`,
      relation: newRelation,
      name: newName,
      phone: newPhone,
      avatarSeed: 'contact_avatar',
      notified: false,
      isPrimary: false,
    };

    onUpdateContacts([...contacts, newEntry]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('+91 ');
  };

  const handleDeleteContact = (id: string) => {
    if (contacts.length <= 1) return;
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="w-full flex-1 flex flex-col px-4 py-2 overflow-y-auto select-none">
      <ScreenHeader title="Emergency Contacts" onBack={onBack} />

      <div className="space-y-3 pb-4 mt-1">
        {/* Primary Contact */}
        {primaryContact && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#1e2e4f] border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold overflow-hidden">
                <span className="text-base">👩</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                  Primary Contact
                </span>
                <span className="text-slate-900 dark:text-white text-sm font-bold block">
                  {primaryContact.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
                  {primaryContact.phone}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Notified:{' '}
                  <span
                    className={
                      primaryContact.notified
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {primaryContact.notified
                      ? primaryContact.notifiedTime || 'Yes'
                      : 'No'}
                  </span>
                </span>
              </div>
            </div>
            {isEditing ? (
              <button
                onClick={() => handleDeleteContact(primaryContact.id)}
                className="text-xs text-rose-500 px-2 py-1 bg-rose-500/10 rounded-lg cursor-pointer font-medium"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <a
                  href={`tel:${primaryContact.phone}`}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                  title={`Call ${primaryContact.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`sms:${primaryContact.phone}?body=VitalShell Alert: Operator status normal. Routine telemetry check.`}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                  title={`Send SMS to ${primaryContact.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Secondary Contact */}
        {secondaryContact && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#1e2e4f] border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold overflow-hidden">
                <span className="text-base">👦</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                  Secondary Contact
                </span>
                <span className="text-slate-900 dark:text-white text-sm font-bold block">
                  {secondaryContact.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
                  {secondaryContact.phone}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Notified:{' '}
                  <span
                    className={
                      secondaryContact.notified
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {secondaryContact.notified
                      ? secondaryContact.notifiedTime || 'Yes'
                      : 'No'}
                  </span>
                </span>
              </div>
            </div>
            {isEditing ? (
              <button
                onClick={() => handleDeleteContact(secondaryContact.id)}
                className="text-xs text-rose-500 px-2 py-1 bg-rose-500/10 rounded-lg cursor-pointer font-medium"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <a
                  href={`tel:${secondaryContact.phone}`}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                  title={`Call ${secondaryContact.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`sms:${secondaryContact.phone}?body=VitalShell Alert: Operator status normal. Routine telemetry check.`}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition cursor-pointer"
                  title={`Send SMS to ${secondaryContact.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Escalation Settings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1529] border border-slate-200 dark:border-[#182847] shadow-xs">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold block mb-2.5">
            Escalation Settings
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182847]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-900 dark:text-white font-medium">Critical</span>
                <span className="text-slate-500 dark:text-slate-400">→ Immediate notification</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#182847]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-slate-900 dark:text-white font-medium">Elevated</span>
                <span className="text-slate-500 dark:text-slate-400">→ User warning</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-900 dark:text-white font-medium">Normal</span>
                <span className="text-slate-500 dark:text-slate-400">→ No notification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons: Add Contact (Blue Full-Width) */}
        <button
          id="btn-add-contact"
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>

        {/* Edit and Test Alert Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-edit-contacts"
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition cursor-pointer ${
              isEditing
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300'
                : 'bg-white dark:bg-[#0c1529] hover:bg-slate-50 dark:hover:bg-[#14223d] border-slate-200 dark:border-[#20345b] text-slate-800 dark:text-white'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>

          <button
            id="btn-test-alert"
            onClick={handleTestAlert}
            disabled={testingAlert}
            className="w-full py-2.5 rounded-xl bg-white dark:bg-[#0c1529] hover:bg-slate-50 dark:hover:bg-[#14223d] active:scale-98 border border-slate-200 dark:border-[#20345b] text-slate-800 dark:text-white text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {testingAlert ? (
              <span className="text-cyan-600 dark:text-cyan-400 animate-pulse">Broadcasting...</span>
            ) : (
              <span>Test Alert</span>
            )}
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-slate-200 dark:border-cyan-500/40 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a2d52]">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm">Add Emergency Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddContact} className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Relationship / Role</label>
                <input
                  type="text"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  placeholder="e.g. Spouse, Physician, Friend"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1d2d4d] text-slate-900 dark:text-white text-xs focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contact Name"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1d2d4d] text-slate-900 dark:text-white text-xs focus:border-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1d2d4d] text-slate-900 dark:text-white text-xs focus:border-cyan-400 outline-none font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Alert Broadcast Confirmation Modal */}
      {alertSentModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAlertSentModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0d172e] border border-emerald-500/40 p-5 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-bold text-base">Emergency SOS Broadcast Dispatched</h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs mt-2 leading-relaxed">
              Automated emergency alert and telemetry transmission prepared for{' '}
              <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{primaryContact?.name}</span> and{' '}
              <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{secondaryContact?.name}</span>.
              Notification timestamps and carrier dispatch logs updated.
            </p>
            <button
              onClick={() => setAlertSentModal(false)}
              className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
