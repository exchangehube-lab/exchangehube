import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_main = """        {/* Main Chat Area */}
        <div className={`flex-1 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${!channelId ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#050816]/80 backdrop-blur-md sticky top-0 z-20">"""

new_main = """        {/* Main Chat Area */}
        <div className={`flex-1 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex flex-col relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${!channelId ? 'hidden md:flex' : 'flex'}`}>
          {!channelId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-[#B8C0D0]/50" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">Your Messages</h3>
              <p className="text-[#B8C0D0]">Select a chat from the sidebar to start messaging.</p>
            </div>
          ) : (
            <>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#050816]/80 backdrop-blur-md sticky top-0 z-20">"""

if old_main in content:
    content = content.replace(old_main, new_main)
    print("Replaced main area start")
else:
    print("Could not find main area start")


old_sidebar_info = """        {/* Sidebar Info (Desktop) */}
        <div className="hidden lg:flex w-80 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex-col shrink-0">"""

new_sidebar_info = """            </>
          )}
        </div>
        
        {/* Sidebar Info (Desktop) */}
        {channelId && channel && (
        <div className="hidden lg:flex w-80 bg-[#070b1a] border border-white/5 rounded-3xl overflow-hidden flex-col shrink-0">"""

old_sidebar_info_end = """        </div>
      </div>
    </DashboardLayout>
  );
}"""

new_sidebar_info_end = """        </div>
        )}
      </div>
    </DashboardLayout>
  );
}"""

if old_sidebar_info in content:
    content = content.replace(old_sidebar_info, new_sidebar_info)
    
    # We must also close the fragment and the condition around the main chat area
    # wait, we opened `<>` inside `new_main`
    
    # But wait, the main chat area ends before the sidebar info. 
    # Let's check what precedes Sidebar Info
    pass

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
