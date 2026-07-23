import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

target = """            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-gray-400">SUB</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Submitted</span>
                  <span className="text-sm font-medium text-white">
                    {bot.createdAt?.toDate ? bot.createdAt.toDate().toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-gray-400">UPD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Updated</span>
                  <span className="text-sm font-medium text-white">
                    {bot.updatedAt?.toDate ? bot.updatedAt.toDate().toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>"""

if target in content:
    content = content.replace(target, "")
    with open('src/BotViewModal.tsx', 'w') as f:
        f.write(content)
    print("Dates removed successfully")
else:
    print("Could not find the target string")
