import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

dupe = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });
  const [showChannelPicker, setShowChannelPicker] = useState(false);
  const [showChannelPicker, setShowChannelPicker] = useState(false);"""

single = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string}>({ isOpen: false, src: '' });
  const [showChannelPicker, setShowChannelPicker] = useState(false);"""

content = content.replace(dupe, single)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
