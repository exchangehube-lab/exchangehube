import sys

with open('src/BotViewModal.tsx', 'r') as f:
    content = f.read()

# Current layout:
# <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col lg:flex-row gap-8">
#   {/* Left Column: Bot Info */}
#   <div className="flex-1 flex flex-col gap-6">
# ... Description ...
#   </div>
#   {/* Right Column: Community Reviews */}
#   <div className="w-full lg:w-96 flex flex-col gap-4">

new_content = content.replace(
    '        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col lg:flex-row gap-8">',
    '        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">'
)

new_content = new_content.replace(
    '          {/* Right Column: Community Reviews */}\n          <div className="w-full lg:w-96 flex flex-col gap-4">',
    '          {/* Community Reviews */}\n          <div className="w-full flex flex-col gap-4">'
)

# And we should close the Left Column div earlier or just keep everything in one flow?
# Since the wrapper is now flex-col, it doesn't matter, but let's see. 
# wait, if I keep it as two items in a flex-col gap-8, they will stack vertically automatically on all screen sizes.
# But what if I just put Community Reviews directly inside the "flex-1 flex flex-col gap-6" of Left Column?

with open('src/BotViewModal.tsx', 'w') as f:
    f.write(new_content)
print("Moved reviews layout")
