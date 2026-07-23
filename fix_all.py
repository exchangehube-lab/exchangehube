import sys

with open('src/components/BotCard.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'const unsubRatingsCol = onSnapshot\(ratingsCollection,.*?\}\);', '', content, flags=re.DOTALL)
content = re.sub(r'const unsubReactionsCol = onSnapshot\(reactionsCollection,.*?\}\);', '', content, flags=re.DOTALL)
content = content.replace("unsubRatingsCol();", "")
content = content.replace("unsubReactionsCol();", "")
content = content.replace("const ratingsCollection = collection(db, 'bots', bot.id, 'ratings');", "")
content = content.replace("const reactionsCollection = collection(db, 'bots', bot.id, 'reactions');", "")

with open('src/components/BotCard.tsx', 'w') as f:
    f.write(content)

with open('src/BotViewModal.tsx', 'r') as f:
    content2 = f.read()

content2 = re.sub(r'const unsubRatingsCol = onSnapshot\(collection\(db, .bots., bot.id, .ratings.\),.*?\}\);', '', content2, flags=re.DOTALL)
content2 = re.sub(r'const unsubReactionsCol = onSnapshot\(collection\(db, .bots., bot.id, .reactions.\),.*?\}\);', '', content2, flags=re.DOTALL)
content2 = content2.replace("unsubRatingsCol();", "")
content2 = content2.replace("unsubReactionsCol();", "")

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(content2)

print("Cleaned up listeners")
