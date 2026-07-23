import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

content = content.replace('<div className="mt-8">', '<div>')

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
