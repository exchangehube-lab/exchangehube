import sys

with open('src/DashboardPages.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "disabled={isSubmitting || (channelType === 'Public Channel' && usernameStatus !== 'available')}" in line and i > 2100:
        lines[i] = line.replace("disabled={isSubmitting || (channelType === 'Public Channel' && usernameStatus !== 'available')}", "disabled={isSubmitting}")

with open('src/DashboardPages.tsx', 'w') as f:
    f.writelines(lines)
