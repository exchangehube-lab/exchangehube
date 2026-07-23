import sys

with open('firestore.rules', 'r') as f:
    content = f.read()

old_rule = """    match /channel_members/{memberId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == request.resource.data.userId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }"""

new_rule = """    match /channel_members/{memberId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }"""

if old_rule in content:
    content = content.replace(old_rule, new_rule)
    with open('firestore.rules', 'w') as f:
        f.write(content)
    print("Rules patched.")
else:
    print("Could not find rule to patch.")
