import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

import re
# Clean up the broken syntax
content = re.sub(r'setLiveTotalRatings\(count\);.*?console\.warn\("Error fetching ratings collection:", error\);\n    \}\);', '', content, flags=re.DOTALL)
content = re.sub(r'setLiveTotalLikes\(likes\);.*?console\.warn\("Error fetching reactions collection:", error\);\n    \}\);', '', content, flags=re.DOTALL)

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content)
print("Cleaned up broken syntax")
