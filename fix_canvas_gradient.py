import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace w-px bg-gradient-to-b with w-[2px] bg-slate-800
old_div = '<div className="h-20 w-px bg-gradient-to-b from-slate-700 to-transparent"></div>'
new_div = '<div className="h-20 w-[2px] bg-slate-800/50"></div>'

content = content.replace(old_div, new_div)

with open(file_path, "w") as f:
    f.write(content)

print("Gradient removed to fix html2canvas bug.")
