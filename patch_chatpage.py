import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

# 1. Add currentUser state
old_states = """  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Chats list states"""

new_states = """  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);
  
  // Chats list states"""

content = content.replace(old_states, new_states)

# 2. Update Fetch channels
old_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!auth.currentUser) return;
    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(auth.currentUser?.uid) && c.status === 'active');
      setChannels(myChannels);
      setChannelsLoading(false);
    });
    return () => unsubChannels();
  }, []);"""

new_fetch = """  // Fetch joined channels
  useEffect(() => {
    if (!currentUser) {
      setChannels([]);
      return;
    }
    const channelsRef = collection(db, 'channels');
    const unsubChannels = onSnapshot(channelsRef, (snapshot) => {
      const fetchedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myChannels = fetchedChannels.filter((c: any) => c.members?.includes(currentUser.uid) && c.status === 'active');
      setChannels(myChannels);
      setChannelsLoading(false);
    });
    return () => unsubChannels();
  }, [currentUser]);"""

content = content.replace(old_fetch, new_fetch)

# 3. Replace auth.currentUser with currentUser in ChatPage.tsx
content = content.replace("auth.currentUser?.uid", "currentUser?.uid")
content = content.replace("auth.currentUser?.displayName", "currentUser?.displayName")
content = content.replace("auth.currentUser?.photoURL", "currentUser?.photoURL")
content = content.replace("!auth.currentUser", "!currentUser")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
