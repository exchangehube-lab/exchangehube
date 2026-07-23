import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_channel = """    const unsubChannel = onSnapshot(channelRef, (docSnap) => {
      if (docSnap.exists()) {
        setChannel({ id: docSnap.id, ...docSnap.data() });
      } else {
        setChannel(null);
      }
      setLoading(false);
    });

    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
      setTimeout(scrollToBottom, 100);
    });"""

new_channel = """    const unsubChannel = onSnapshot(channelRef, (docSnap) => {
      if (docSnap.exists()) {
        setChannel({ id: docSnap.id, ...docSnap.data() });
      } else {
        setChannel(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching channel:", error);
      setLoading(false);
    });

    const messagesRef = collection(db, 'channels', channelId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
      setTimeout(scrollToBottom, 100);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });"""

if old_channel in content:
    content = content.replace(old_channel, new_channel)
    with open('src/ChatPage.tsx', 'w') as f:
        f.write(content)
    print("Patched ChatPage.tsx channel/messages onSnapshot errors.")
else:
    print("Could not find the target code in ChatPage.tsx.")
