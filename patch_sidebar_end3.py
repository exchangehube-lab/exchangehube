import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_end = """          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}"""

new_end = """          </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
}"""

if old_end in content:
    content = content.replace(old_end, new_end)
    print("Replaced end3")
else:
    print("Not found3")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
