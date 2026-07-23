const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { ForwardModal } from './components/ForwardModal';",
  "import { ForwardModal } from './components/ForwardModal';\nimport { ReportModal } from './components/ReportModal';\nimport { Flag, MoreVertical } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [messageToDelete, setMessageToDelete] = useState<PersonalMessage | null>(null);",
  "const [messageToDelete, setMessageToDelete] = useState<PersonalMessage | null>(null);\n  const [reportingMessage, setReportingMessage] = useState<PersonalMessage | null>(null);\n  const [reportingUser, setReportingUser] = useState(false);\n  const [showUserMenu, setShowUserMenu] = useState(false);"
);

// 3. Add to User Header
const headerTarget = `              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8C0D0] truncate">@{targetUser?.username || '...'}</span>`;

const headerReplacement = `              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8C0D0] truncate">@{targetUser?.username || '...'}</span>`;
                
const fullHeaderTarget = `            <div className="flex flex-col overflow-hidden">
              <h2 className="text-lg font-bold text-white truncate">{targetUser?.fullName || 'Loading...'}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8C0D0] truncate">@{targetUser?.username || '...'}</span>
                {isTargetOnline ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                ) : targetLastSeen ? (
                  <span className="text-[10px] text-white/40">Last seen: {new Date(targetLastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                ) : null}
              </div>
            </div>
          </div>`;

const fullHeaderReplacement = `            <div className="flex flex-col overflow-hidden">
              <h2 className="text-lg font-bold text-white truncate">{targetUser?.fullName || 'Loading...'}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8C0D0] truncate">@{targetUser?.username || '...'}</span>
                {isTargetOnline ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                ) : targetLastSeen ? (
                  <span className="text-[10px] text-white/40">Last seen: {new Date(targetLastSeen).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                ) : null}
              </div>
            </div>
            
            <div className="relative ml-2">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1D2D] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  <button 
                    onClick={() => { setReportingUser(true); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Report User
                  </button>
                </div>
              )}
            </div>
          </div>`;

code = code.replace(fullHeaderTarget, fullHeaderReplacement);

// 4. Add Report to message menu
const msgMenuTarget = `<button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                        </div>
                      )}`;

const msgMenuReplacement = `<button onClick={() => setForwardingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                            <Forward className="w-4 h-4" />
                          </button>
                          <button onClick={() => setReportingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors" title="Report">
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      )}`;

code = code.replace(msgMenuTarget, msgMenuReplacement); // For not mine

// 5. Add modals at the end
const endTarget = `      {showSharedMedia && (`;
const endReplacement = `      {(reportingMessage || reportingUser) && (
        <ReportModal 
          reporterId={currentUser?.uid || ''}
          reporterUsername={currentUser?.displayName || currentUser?.email?.split('@')[0] || ''}
          reportedUserId={reportingMessage ? reportingMessage.sender_id : targetUserId || ''}
          reportedUsername={reportingMessage ? (userProfiles[reportingMessage.sender_id]?.username || 'Unknown') : (targetUser?.username || 'Unknown')}
          messageId={reportingMessage?.id}
          messageContent={reportingMessage?.content}
          onClose={() => { setReportingMessage(null); setReportingUser(false); }}
        />
      )}
      {showSharedMedia && (`;

code = code.replace(endTarget, endReplacement);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
