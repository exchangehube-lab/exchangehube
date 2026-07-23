const fs = require('fs');
let code = fs.readFileSync('src/ChannelChatPage.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { ForwardModal } from './components/ForwardModal';",
  "import { ForwardModal } from './components/ForwardModal';\nimport { ReportModal } from './components/ReportModal';\nimport { Flag, MoreVertical } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);",
  "const [messageToDelete, setMessageToDelete] = useState<ChannelMessage | null>(null);\n  const [reportingMessage, setReportingMessage] = useState<ChannelMessage | null>(null);\n  const [reportingUser, setReportingUser] = useState<string | null>(null);\n  const [showChannelMenu, setShowChannelMenu] = useState(false);"
);

// 3. Add to Channel Header
const fullHeaderTarget = `            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{channelData?.name || 'Loading...'}</h1>
              <p className="text-xs text-[#B8C0D0] truncate">{channelData?.description || 'No description'}</p>
            </div>
          </div>`;

const fullHeaderReplacement = `            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{channelData?.name || 'Loading...'}</h1>
              <p className="text-xs text-[#B8C0D0] truncate">{channelData?.description || 'No description'}</p>
            </div>
            
            <div className="relative ml-2">
              <button onClick={() => setShowChannelMenu(!showChannelMenu)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              {showChannelMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#1A1D2D] border border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-64 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-bold text-white/50 uppercase">Report Member</div>
                  {channelData?.members?.filter((m: string) => m !== currentUser?.uid).map((memberId: string) => (
                    <button 
                      key={memberId}
                      onClick={() => { setReportingUser(memberId); setShowChannelMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" /> {userProfiles[memberId]?.username || 'Unknown'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>`;

code = code.replace(fullHeaderTarget, fullHeaderReplacement);

// 4. Add Report to message menu
const msgMenuTarget = `<button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}`;

const msgMenuReplacement = `<button onClick={() => setMessageToDelete(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => setReportingMessage(msg)} className="p-1 rounded-full text-white/50 hover:bg-white/10 hover:text-red-400 transition-colors" title="Report">
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      )}`;

code = code.replace(msgMenuTarget, msgMenuReplacement);

// 5. Add modals at the end
const endTarget = `      {showSharedMedia && (`;
const endReplacement = `      {(reportingMessage || reportingUser) && (
        <ReportModal 
          reporterId={currentUser?.uid || ''}
          reporterUsername={currentUser?.displayName || currentUser?.email?.split('@')[0] || ''}
          reportedUserId={reportingMessage ? reportingMessage.sender_id : reportingUser || ''}
          reportedUsername={reportingMessage ? (userProfiles[reportingMessage.sender_id]?.username || 'Unknown') : (userProfiles[reportingUser || '']?.username || 'Unknown')}
          messageId={reportingMessage?.id}
          messageContent={reportingMessage?.content}
          onClose={() => { setReportingMessage(null); setReportingUser(null); }}
        />
      )}
      {showSharedMedia && (`;

code = code.replace(endTarget, endReplacement);

fs.writeFileSync('src/ChannelChatPage.tsx', code);
