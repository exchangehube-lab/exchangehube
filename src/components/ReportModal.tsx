import React, { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface ReportModalProps {
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  messageId?: string;
  messageContent?: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Spam',
  'Scam/Fraud',
  'Harassment',
  'Hate Speech',
  'Violence',
  'Adult Content',
  'Copyright',
  'Fake Information',
  'Other'
];

export function ReportModal({ reporterId, reporterUsername, reportedUserId, reportedUsername, messageId, messageContent, onClose }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Check for duplicate
      const q = query(
        collection(db, 'reports'),
        where('reporterId', '==', reporterId),
        where('reportedUserId', '==', reportedUserId),
        ...(messageId ? [where('messageId', '==', messageId)] : [])
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError('You have already reported this.');
        setIsSubmitting(false);
        return;
      }

      const finalReason = reason === 'Other' ? `Other: ${otherReason}` : reason;

      await addDoc(collection(db, 'reports'), {
        reporterId,
        reporterUsername,
        reportedUserId,
        reportedUsername,
        messageId: messageId || null,
        messageContent: messageContent || null,
        reason: finalReason,
        status: 'Pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
            <Flag className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
          <p className="text-white/70 text-sm">Thank you for helping keep the community safe. Our team will review this report shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#1A1D2D] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-[60px] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            Report {messageId ? 'Message' : 'User'}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-white/70 mb-2">
              You are reporting <strong className="text-white">{reportedUsername}</strong>.
            </p>
            {messageContent && (
              <div className="mt-2 p-3 bg-black/20 rounded-lg text-sm text-white/90 border-l-2 border-red-500/50 line-clamp-3">
                "{messageContent}"
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Select Reason</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors"
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r} className="bg-[#1A1D2D]">{r}</option>
                ))}
              </select>
            </div>

            {reason === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Additional Details</label>
                <textarea 
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none transition-colors min-h-[100px] resize-none"
                  placeholder="Please provide more information..."
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting || (reason === 'Other' && !otherReason.trim())}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 mt-4"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
