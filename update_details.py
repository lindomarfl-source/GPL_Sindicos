import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateDetails.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update Buttons in the Header
old_buttons = """        <div className="flex items-center gap-2 md:gap-3">
          <input type="file" accept=".json" ref={fileInputRef} onChange={importCandidateJSON} className="hidden" />"""

new_buttons = """        <div className="flex items-center gap-2 md:gap-3">
          {candidate.status !== 'Aprovado' && (
            <Button variant="secondary" onClick={() => updateCandidate(candidate.id, { status: 'Aprovado' })} className="hidden md:flex bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-[10px] md:text-sm">
              <Check size={16} /> Aprovar
            </Button>
          )}
          {candidate.status !== 'Reprovado' && (
            <Button variant="secondary" onClick={() => updateCandidate(candidate.id, { status: 'Reprovado' })} className="hidden md:flex bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-[10px] md:text-sm">
              <X size={16} /> Reprovar
            </Button>
          )}
          <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>
          <input type="file" accept=".json" ref={fileInputRef} onChange={importCandidateJSON} className="hidden" />"""

content = content.replace(old_buttons, new_buttons)

# 2. Add Stamp logic to PDF
# Around the header section:
old_pdf_header = """      // 1. Cabeçalho
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('FICHA TÉCNICA DO SÍNDICO', 15, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString('pt-BR'), 160, 28);"""

new_pdf_header = """      // 1. Cabeçalho
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('FICHA TÉCNICA DO SÍNDICO', 15, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString('pt-BR'), 160, 28);
      
      // Carimbo (Stamp)
      if (candidate.status === 'Aprovado') {
        doc.setTextColor(34, 197, 94); // Green
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('[ CANDIDATO APROVADO ]', 15, 32);
      } else if (candidate.status === 'Reprovado') {
        doc.setTextColor(239, 68, 68); // Red
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('[ CANDIDATO REPROVADO ]', 15, 32);
      }"""

content = content.replace(old_pdf_header, new_pdf_header)

# 3. Add Mobile Approval Buttons inside the Card Info
old_card_info = """            <h3 className="text-xl font-bold text-white mb-1">{candidate.nome}</h3>
            <p className="text-slate-400 text-sm mb-4">{candidate.tipo === 'PJ' ? 'Empresa Administradora' : 'Candidato morador'}</p>
            <Badge status={candidate.status}>{candidate.status}</Badge>"""

new_card_info = """            <h3 className="text-xl font-bold text-white mb-1">{candidate.nome}</h3>
            <p className="text-slate-400 text-sm mb-4">{candidate.tipo === 'PJ' ? 'Empresa Administradora' : 'Candidato morador'}</p>
            <div className="flex flex-col items-center gap-3">
              <Badge status={candidate.status}>{candidate.status}</Badge>
              <div className="flex gap-2 mt-2 md:hidden">
                {candidate.status !== 'Aprovado' && (
                  <button onClick={() => updateCandidate(candidate.id, { status: 'Aprovado' })} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check size={14} /> Aprovar
                  </button>
                )}
                {candidate.status !== 'Reprovado' && (
                  <button onClick={() => updateCandidate(candidate.id, { status: 'Reprovado' })} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <X size={14} /> Reprovar
                  </button>
                )}
              </div>
            </div>"""

content = content.replace(old_card_info, new_card_info)

with open(file_path, "w") as f:
    f.write(content)

print("Details updated.")
