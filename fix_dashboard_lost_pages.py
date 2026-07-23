import sys

with open('update_trending.py.tmp', 'r') as f:
    backup_content = f.read()

start_idx = backup_content.find("export function ProfilePage() {")
end_idx = backup_content.find("export function TrendingBotsPage() {")

if start_idx == -1 or end_idx == -1:
    print("Could not find ProfilePage or TrendingBotsPage in backup")
    sys.exit(1)

lost_pages = backup_content[start_idx:end_idx]

# Now apply ProfilePage changes
target_to_remove = """            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

if target_to_remove in lost_pages:
    lost_pages = lost_pages.replace(target_to_remove, "")
else:
    print("Could not find target to remove")

lost_pages = lost_pages.replace('<div className="mt-auto">', '<div>')
lost_pages = lost_pages.replace('<div className="mt-8">', '<div>')

# Now insert it back to current DashboardPages.tsx
with open('src/DashboardPages.tsx', 'r') as f:
    current_content = f.read()

# We need to insert lost_pages just before export function TrendingBotsPage() {
insert_idx = current_content.find("export function TrendingBotsPage() {")
if insert_idx == -1:
    print("Could not find TrendingBotsPage in current")
    sys.exit(1)

new_content = current_content[:insert_idx] + lost_pages + current_content[insert_idx:]

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(new_content)

print("Restored lost pages successfully")
