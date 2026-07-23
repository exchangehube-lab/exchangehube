import sys

def add_title(filepath, title):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Insert document.title = '...' inside useEffect
    if 'useEffect(() => {' in content:
        content = content.replace('useEffect(() => {', f"useEffect(() => {{\n    document.title = '{title}';")
    
    with open(filepath, 'w') as f:
        f.write(content)

add_title('src/AdminManagementHubPage.tsx', 'Management | ExchangeHube Admin')
add_title('src/AdminUsersPage.tsx', 'Users | ExchangeHube Admin')
add_title('src/AdminBotsPage.tsx', 'Bots | ExchangeHube Admin')
add_title('src/AdminChannelsPage.tsx', 'Channels | ExchangeHube Admin')
