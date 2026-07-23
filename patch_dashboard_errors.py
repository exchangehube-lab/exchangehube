import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

import re
# We just want to replace:
# const unsubscribe = onSnapshot(q, (snapshot) => {
# ...
# });
# with 
# }, (error) => { console.error(error); });

pattern = re.compile(r'    const unsubscribe = onSnapshot\(q, \(snapshot\) => \{([\s\S]*?)      \}\);\n')
new_str = r'    const unsubscribe = onSnapshot(q, (snapshot) => {\1      }, (error) => { console.error("Snapshot error:", error); });\n'

new_content = pattern.sub(new_str, content)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(new_content)
print("DashboardPages.tsx error handlers patched.")
