import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_channels = """export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);"""

new_channels = """export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);"""

content = content.replace(old_channels, new_channels)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
