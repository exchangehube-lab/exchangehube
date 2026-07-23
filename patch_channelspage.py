import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_channels = """export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');"""

new_channels = """export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);"""

content = content.replace(old_channels, new_channels)

content = content.replace("const isMember = channel.members?.includes(auth.currentUser.uid);", "const isMember = channel.members?.includes(currentUser?.uid);")
content = content.replace("const isMember = channel.members?.includes(auth.currentUser?.uid);", "const isMember = channel.members?.includes(currentUser?.uid);")
content = content.replace("arrayUnion(auth.currentUser.uid)", "arrayUnion(currentUser?.uid)")
content = content.replace("auth.currentUser?.uid", "currentUser?.uid")

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)

