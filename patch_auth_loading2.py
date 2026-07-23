import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_auth = """  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);"""

new_auth = """  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsub();
  }, []);"""

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    print("Replaced auth effect")
else:
    print("Could not find auth effect")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
