import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/VisitasManager.jsx"
with open(file_path, "r") as f:
    content = f.read()

old_code = """      setVisitas(prev => prev.map(v => v.id === confirmModal.id ? data[0] : v).sort((a, b) => {
           if (a.data_visita === b.data_visita) return a.hora_visita.localeCompare(b.hora_visita);
           return a.data_visita.localeCompare(b.data_visita);
      }));"""

new_code = """      // Usa os dados do formData local para garantir que a UI reflita a alteração instantaneamente e sem depender do payload do banco
      setVisitas(prev => prev.map(v => v.id === confirmModal.id ? { ...v, ...formData } : v).sort((a, b) => {
           if (a.data_visita === b.data_visita) return a.hora_visita.localeCompare(b.hora_visita);
           return a.data_visita.localeCompare(b.data_visita);
      }));"""

content = content.replace(old_code, new_code)

with open(file_path, "w") as f:
    f.write(content)

print("VisitasManager updated to guarantee local state update.")
