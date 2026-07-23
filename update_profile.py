import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

target = """            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-medium text-white">Account Settings</h3>
                </div>
                <div className="space-y-4">
                  {['Email Notifications', 'Two-Factor Authentication', 'Dark Mode Preference'].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-[#B8C0D0]">{setting}</span>
                      <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#070b1a] border border-white/5 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-medium text-white">Security</h3>
                </div>
                <p className="text-[#B8C0D0] text-sm mb-6">
                  Review your security settings to ensure your account is protected against unauthorized access.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex justify-between items-center px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white text-sm">
                    <span>Active Sessions</span>
                    <ChevronRight className="w-4 h-4 text-[#B8C0D0]" />
                  </button>
                  <button className="w-full flex justify-between items-center px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-white text-sm">
                    <span>Login History</span>
                    <ChevronRight className="w-4 h-4 text-[#B8C0D0]" />
                  </button>
                </div>
              </div>
            </div>"""

if target in content:
    content = content.replace(target, "")
    print("Removed Account Settings and Security sections.")
else:
    print("Could not find the target code to remove.")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
