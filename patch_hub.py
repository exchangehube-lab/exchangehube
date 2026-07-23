import sys

with open('src/AdminManagementHubPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import React from 'react';", "import React, { useEffect } from 'react';")
content = content.replace("export function AdminManagementHubPage() {", "export function AdminManagementHubPage() {\n  useEffect(() => {\n    document.title = 'Management | ExchangeHube Admin';\n  }, []);")

with open('src/AdminManagementHubPage.tsx', 'w') as f:
    f.write(content)
