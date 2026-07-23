import re

def fix(filepath, msg_type):
    with open(filepath, 'r') as f:
        content = f.read()

    # Look for:
    # if (payload.eventType === 'INSERT') {
    #   const newMsg = payload.new as PersonalMessage;
    #   setMessages((prev) => [...prev, newMsg]);
    #   if (newMsg.sender_uid !== currentUser.uid) { ... }
    # }
    
    # Or for channel:
    # if (payload.eventType === 'INSERT') {
    #   setMessages((prev) => [...prev, payload.new as ChannelMessage]);
    # }

    def replacer_personal(match):
        return """if (payload.eventType === 'INSERT') {
        const newMsg = payload.new as PersonalMessage;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
        if (newMsg.sender_uid !== currentUser.uid) {"""

    content = re.sub(r"if \(payload\.eventType === 'INSERT'\) \{\s*const newMsg = payload\.new as PersonalMessage;\s*setMessages\(\(prev\) => \[\.\.\.prev, newMsg\]\);\s*if \(newMsg\.sender_uid !== currentUser\.uid\) \{", replacer_personal, content)

    def replacer_channel(match):
        return """if (payload.eventType === 'INSERT') {
        const newMsg = payload.new as ChannelMessage;
        setMessages((prev) => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      }"""
      
    content = re.sub(r"if \(payload\.eventType === 'INSERT'\) \{\s*setMessages\(\(prev\) => \[\.\.\.prev, payload\.new as ChannelMessage\]\);\s*\}", replacer_channel, content)

    with open(filepath, 'w') as f:
        f.write(content)

fix('src/PersonalChatWindow.tsx', 'PersonalMessage')
fix('src/ChannelChatPage.tsx', 'ChannelMessage')
print("Done")
