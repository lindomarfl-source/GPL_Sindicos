import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace texts
content = content.replace("Selection Battlefield", "Campo de Batalha")
content = content.replace("BAIXAR BATTLE REPORT (PDF)", "BAIXAR RELATÓRIO DO DUELO (PDF)")
content = content.replace("GPL_Battle_", "GPL_Duelo_")

with open(file_path, "w") as f:
    f.write(content)

print("English texts replaced.")
