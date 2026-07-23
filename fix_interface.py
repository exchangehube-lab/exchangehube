import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

interface_str = """
interface UserProfileData {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  profilePhotoURL?: string;
  normalizedUsername?: string;
}
"""

# Insert right before export function ProfilePage()
idx = content.find("export function ProfilePage() {")
if idx != -1:
    content = content[:idx] + interface_str + content[idx:]
    with open('src/DashboardPages.tsx', 'w') as f:
        f.write(content)
        print("Inserted interface")
else:
    print("Could not find ProfilePage")
