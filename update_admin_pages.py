import sys
import re

with open('src/AdminPages.tsx', 'r') as f:
    content = f.read()

# Remove AdminBotsPage
bots_pattern = r'export function AdminBotsPage\(\) \{.*?\}(?=\nexport function|\n$)'
content = re.sub(bots_pattern, '', content, flags=re.DOTALL)

# Remove AdminChannelsPage
channels_pattern = r'export function AdminChannelsPage\(\) \{.*?\}(?=\nexport function|\n$)'
content = re.sub(channels_pattern, '', content, flags=re.DOTALL)

with open('src/AdminPages.tsx', 'w') as f:
    f.write(content)
