import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/DocumentComparator.jsx"
with open(file_path, "r") as f:
    content = f.read()

old_filter = """  const filteredCandidates = candidates.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );"""

new_filter = """  const filteredCandidates = candidates
    .filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.status === 'Aprovado' && b.status !== 'Aprovado') return -1;
      if (b.status === 'Aprovado' && a.status !== 'Aprovado') return 1;
      return a.nome.localeCompare(b.nome);
    });"""

content = content.replace(old_filter, new_filter)

with open(file_path, "w") as f:
    f.write(content)

print("DocumentComparator sorted.")
