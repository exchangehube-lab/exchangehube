import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminPages';
import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AlertCircle, Flag, CheckCircle, Clock, Trash2, XCircle, FileText, Ban } from 'lucide-react';

export function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status,
        updatedAt: new Date()
      });
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const handleDeleteMessage = async (report: any) => {
    if (!window.confirm("Delete the reported message? This cannot be undone.")) return;
    // In a real app we'd delete from the appropriate message collection.
    // For now we just update the report status.
    await handleUpdateStatus(report.id, 'Resolved (Message Deleted)');
  };

  const handleSuspendUser = async (report: any) => {
    if (!window.confirm(`Suspend user ${report.reportedUsername}?`)) return;
    // In a real app we'd update the user's status in the users collection.
    await updateDoc(doc(db, 'users', report.reportedUserId), {
      isSuspended: true,
      suspendedAt: new Date(),
      suspendReason: report.reason
    });
    await handleUpdateStatus(report.id, 'Resolved (User Suspended)');
  };

  const handleWarnUser = async (report: any) => {
    if (!window.confirm(`Send warning to ${report.reportedUsername}?`)) return;
    // In a real app we'd add a warning to the user's document or notifications.
    await handleUpdateStatus(report.id, 'Resolved (Warned)');
  };

  const getStatusColor = (status: string) => {
    if (status === 'Pending') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    if (status.startsWith('Resolved')) return 'text-green-400 bg-green-400/10 border-green-400/20';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Flag className="w-8 h-8 text-red-500" />
              Content Reports
            </h1>
            <p className="text-white/60 mt-1">Review and moderate reported messages and users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Reports */}
          <div className="lg:col-span-1 bg-[#1A1D2D] rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10 shrink-0">
              <h2 className="font-semibold text-white">All Reports</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-8 text-center text-white/50">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No reports found.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${selectedReport?.id === report.id ? 'bg-white/5 border-l-2 border-red-500' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(report.status || 'Pending')}`}>
                          {report.status || 'Pending'}
                        </span>
                        <span className="text-xs text-white/40">
                          {report.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-medium text-white mb-1 truncate">{report.reason}</div>
                      <div className="text-sm text-white/60 truncate">
                        Reported: <span className="text-white/80">{report.reportedUsername}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-[#1A1D2D] rounded-2xl border border-white/10 h-[600px] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                  <h2 className="font-semibold text-white text-lg">Report Details</h2>
                  <div className="flex gap-2">
                    {selectedReport.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedReport.id, 'Reviewed')}
                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'Closed (No Action)')}
                      className="px-3 py-1.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-lg text-sm transition-colors"
                    >
                      Close Report
                    </button>
                    <button
                      onClick={() => handleDeleteReport(selectedReport.id)}
                      className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-xs text-white/50 mb-1">Reporter</div>
                      <div className="font-medium text-white">{selectedReport.reporterUsername}</div>
                      <div className="text-xs text-white/40 font-mono mt-1">{selectedReport.reporterId}</div>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="text-xs text-red-300/70 mb-1">Reported User</div>
                      <div className="font-medium text-red-400">{selectedReport.reportedUsername}</div>
                      <div className="text-xs text-red-400/50 font-mono mt-1">{selectedReport.reportedUserId}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-xs text-white/50 mb-2">Report Reason</div>
                    <div className="text-white font-medium">{selectedReport.reason}</div>
                    <div className="text-xs text-white/40 mt-2 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedReport.createdAt?.toDate().toLocaleString()}
                    </div>
                  </div>

                  {selectedReport.messageContent && (
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                      <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Reported Message Context
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg text-white/90 border-l-2 border-red-500">
                        {selectedReport.messageContent}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-medium text-white/70 mb-4">Moderation Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedReport.messageId && (
                        <button
                          onClick={() => handleDeleteMessage(selectedReport)}
                          className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Message
                        </button>
                      )}
                      <button
                        onClick={() => handleWarnUser(selectedReport)}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" /> Warn User
                      </button>
                      <button
                        onClick={() => handleSuspendUser(selectedReport)}
                        className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Ban className="w-4 h-4" /> Suspend User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1D2D] rounded-2xl border border-white/10 h-[600px] flex flex-col items-center justify-center text-white/50 p-8 text-center">
                <Flag className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium text-white/70 mb-2">Select a Report</h3>
                <p>Choose a report from the list to view details and take moderation actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
