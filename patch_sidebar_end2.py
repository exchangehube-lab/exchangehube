import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_end = """        </div>
      </div>
    </DashboardLayout>
  );
}"""

new_end = """        </div>
        )}
      </div>
    </DashboardLayout>
  );
}"""

if old_end in content:
    content = content.replace(old_end, new_end)
    print("Replaced end2")
else:
    print("Not found")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
