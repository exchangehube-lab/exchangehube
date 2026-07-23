import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

old_header = """export function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);"""

new_header = """export function ChannelsPage() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);"""

content = content.replace(old_header, new_header)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
