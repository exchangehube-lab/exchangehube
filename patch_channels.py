import sys

with open('src/DashboardPages.tsx', 'r') as f:
    content = f.read()

# 1. Change `"pending"` to `"active"` for new channels.
old_create = """        channelBio,
        status: "pending",
        ownerUid: auth.currentUser.uid,"""
new_create = """        channelBio,
        status: "active",
        ownerUid: auth.currentUser.uid,"""
content = content.replace(old_create, new_create)

# 2. Redirect / change success message.
old_success = """      setShowAddModal(false);
      setShowSuccessModal(true);
      
      // Reset form"""
new_success = """      setShowAddModal(false);
      setMessage("✅ Channel created successfully.");
      setTimeout(() => {
        window.open(`https://${finalLink}`, '_blank');
        setMessage('');
      }, 1500);
      
      // Reset form"""
content = content.replace(old_success, new_success)

# 3. Change query to fetch "active" instead of "approved"
old_query = """const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where("status", "==", "approved"));"""
new_query = """const channelsRef = collection(db, 'channels');
    const q = query(channelsRef, where("status", "==", "active"));"""
content = content.replace(old_query, new_query)

with open('src/DashboardPages.tsx', 'w') as f:
    f.write(content)
