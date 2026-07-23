import sys

for filename in ['src/components/ReviewModal.tsx', 'src/DashboardPages.tsx']:
    with open(filename, 'r') as f:
        content = f.read()
    
    content = content.replace("shadow-[0_15px_40px_-5px_rgba(168,85,247,0.25)]", "shadow-[0_15px_40px_rgba(168,85,247,0.2)]")
    
    with open(filename, 'w') as f:
        f.write(content)
