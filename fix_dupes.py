import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

dupe = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string, mode: 'setup' | 'edit'}>({ isOpen: false, src: '', mode: 'setup' });
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);

  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string, mode: 'setup' | 'edit'}>({ isOpen: false, src: '', mode: 'setup' });
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);"""

single = """  const [cropperState, setCropperState] = useState<{isOpen: boolean, src: string, mode: 'setup' | 'edit'}>({ isOpen: false, src: '', mode: 'setup' });
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const setupFileInputRef = useRef<HTMLInputElement>(null);"""

content = content.replace(dupe, single)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
