import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_error = """  if (!channel) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#070b1a] rounded-3xl border border-white/5">
          <Hash className="w-12 h-12 text-[#B8C0D0] mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Channel not found</h3>
          <p className="text-[#B8C0D0]">This channel does not exist or has been removed.</p>
          <button onClick={() => navigate('/channels')} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
            Back to Channels
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isMember = channel.members?.includes(currentUser?.uid);

  if (!isMember) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#070b1a] rounded-3xl border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mb-6 overflow-hidden">
            {channel.channelImageURL ? (
              <img src={channel.channelImageURL} alt={channel.channelName} className="w-full h-full object-cover" />
            ) : (
              <Hash className="w-10 h-10 text-purple-400" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{channel.channelName}</h3>
          <p className="text-[#B8C0D0] mb-8 max-w-md">{channel.channelBio}</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8">
            <h4 className="text-white font-medium mb-2">You must join this channel first.</h4>
            <p className="text-sm text-[#B8C0D0] mb-6">Join to see messages and participate in the conversation.</p>
            <button 
              onClick={handleJoinChannel}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
            >
              Join Channel
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canPost = channel.postPermission !== 'admin' || channel.ownerUid === currentUser?.uid;"""

new_error = """  if (channelId && !channel) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#070b1a] rounded-3xl border border-white/5">
          <Hash className="w-12 h-12 text-[#B8C0D0] mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Channel not found</h3>
          <p className="text-[#B8C0D0]">This channel does not exist or has been removed.</p>
          <button onClick={() => navigate('/channels')} className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
            Back to Channels
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isMember = channelId ? channel?.members?.includes(currentUser?.uid) : true;

  if (channelId && !isMember) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#070b1a] rounded-3xl border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center mb-6 overflow-hidden">
            {channel?.channelImageURL ? (
              <img src={channel.channelImageURL} alt={channel.channelName} className="w-full h-full object-cover" />
            ) : (
              <Hash className="w-10 h-10 text-purple-400" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{channel?.channelName}</h3>
          <p className="text-[#B8C0D0] mb-8 max-w-md">{channel?.channelBio}</p>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-8">
            <h4 className="text-white font-medium mb-2">You must join this channel first.</h4>
            <p className="text-sm text-[#B8C0D0] mb-6">Join to see messages and participate in the conversation.</p>
            <button 
              onClick={handleJoinChannel}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
            >
              Join Channel
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canPost = channelId ? (channel?.postPermission !== 'admin' || channel?.ownerUid === currentUser?.uid) : false;"""

if old_error in content:
    content = content.replace(old_error, new_error)
    print("Replaced error logic")
else:
    print("Could not find error logic")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
