import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateDetails.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update UI
old_ui = """            <h3 className="text-xl font-bold text-white mb-1">{candidate.nome}</h3>
            <p className="text-slate-400 text-sm mb-4">{candidate.tipo === 'PJ' ? 'Empresa Administradora' : 'Candidato morador'}</p>"""

new_ui = """            <h3 className="text-xl font-bold text-white mb-1">{candidate.nome}</h3>
            <p className="text-slate-400 text-sm mb-2 font-mono">{candidate.registro || 'Sem Registro'}</p>
            {candidate.tipo === 'PJ' && candidate.responsavel && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg py-1.5 px-4 mb-4 inline-block">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Resp: {candidate.responsavel}</p>
              </div>
            )}
            <p className="text-slate-500 text-xs mb-4 uppercase font-bold tracking-wider">{candidate.tipo === 'PJ' ? 'Empresa Administradora' : 'Síndico Morador / Profissional'}</p>"""

content = content.replace(old_ui, new_ui)

# 2. Update PDF
old_pdf = """      doc.text(String(candidate.nome || '').toUpperCase(), 15, currentY);
      currentY += 8;
      
      doc.setFontSize(10);"""

new_pdf = """      doc.text(String(candidate.nome || '').toUpperCase(), 15, currentY);
      currentY += 8;
      
      if (candidate.tipo === 'PJ' && candidate.responsavel) {
        doc.setFontSize(10);
        doc.setTextColor(59, 130, 246); // Blue color for responsavel
        doc.text(`SÍNDICO RESP: ${String(candidate.responsavel).toUpperCase()}`, 15, currentY);
        currentY += 6;
        doc.setTextColor(...primaryColor);
      }
      
      doc.setFontSize(10);"""

content = content.replace(old_pdf, new_pdf)

with open(file_path, "w") as f:
    f.write(content)

print("Responsavel added to CandidateDetails UI and PDF.")
