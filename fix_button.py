import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_btn = """      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-[#B8C0D0] hover:text-white transition-colors z-30 flex items-center gap-2 group">
        <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to main</span>
      </button>"""

new_btn = """      <button onClick={() => window.close()} className="absolute top-8 left-8 text-[#B8C0D0] hover:text-white transition-colors z-30 flex items-center gap-2 group">
        <X className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Close Page</span>
      </button>"""

content = content.replace(old_btn, new_btn)

with open('src/App.tsx', 'w') as f:
    f.write(content)
