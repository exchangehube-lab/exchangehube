import sys

with open('src/ChatPage.tsx', 'r') as f:
    content = f.read()

old_sidebar_info_end = """        </div>
      </div>
    </DashboardLayout>
  );
}"""

new_sidebar_info_end = """        </div>
        )}
      </div>
    </DashboardLayout>
  );
}"""

if old_sidebar_info_end in content:
    content = content.replace(old_sidebar_info_end, new_sidebar_info_end)
    print("Replaced end")
else:
    print("Could not find end")

with open('src/ChatPage.tsx', 'w') as f:
    f.write(content)
