import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_card = """                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-[14px] font-bold text-white truncate pr-2">{c.channelName}</h3>
                        <span className="text-[10px] text-[#B8C0D0] whitespace-nowrap shrink-0">{msgTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#B8C0D0] truncate pr-2">
                          {lastMsg && (
                            <span className={isOwnMessage ? "text-purple-400 font-medium" : "text-white/70 font-medium"}>
                              {isOwnMessage ? 'You: ' : `${lastMsg.senderName}: `}
                            </span>
                          )}
                          {msgPreview}
                        </p>
                      </div>
                    </div>"""

new_card = """                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <h3 className="text-[14px] font-bold text-white truncate">{c.channelName}</h3>
                          {/* Mute Icon Placeholder */}
                        </div>
                        <span className="text-[10px] text-[#B8C0D0] whitespace-nowrap shrink-0">{msgTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#B8C0D0] truncate pr-2">
                          {lastMsg && (
                            <span className={isOwnMessage ? "text-purple-400 font-medium" : "text-white/70 font-medium"}>
                              {isOwnMessage ? 'You: ' : `${lastMsg.senderName}: `}
                            </span>
                          )}
                          {msgPreview}
                        </p>
                        {/* Unread Count Placeholder */}
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20 opacity-0">
                          <span className="text-[10px] font-bold text-white">0</span>
                        </div>
                      </div>
                    </div>"""

if old_card in content:
    content = content.replace(old_card, new_card)
    print("Replaced card")
else:
    print("Could not find card")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
