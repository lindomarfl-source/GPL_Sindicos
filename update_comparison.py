import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add FileSearch to imports if missing
if "FileSearch" not in content:
    content = content.replace("Wallet\n}", "Wallet, FileSearch\n}")

# 2. Add new sub-components ComparisonStat and DocumentCompliance
new_components = """const ComparisonStat = ({ label, val1, val2 }) => (
  <div className="flex flex-col gap-2 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{label}</span>
     <div className="flex justify-between items-center px-4">
        <span className="text-xl font-black text-blue-500">{val1}</span>
        <span className="text-xl font-black italic text-slate-700">VS</span>
        <span className="text-xl font-black text-purple-500">{val2}</span>
     </div>
  </div>
);

const DocumentCompliance = ({ candidate, globalDocTypes }) => {
  const requiredDocs = (globalDocTypes || []).filter(doc => !(doc.category === 'Pessoa Jurídica' && candidate.tipo === 'PF'));
  const docData = candidate.documentacao || {};
  const delivered = requiredDocs.filter(doc => (docData[doc.key] || '').toLowerCase() === 'entregue').length;
  const pct = requiredDocs.length > 0 ? Math.round((delivered / requiredDocs.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
      <div className="flex justify-between items-center mb-1">
         <span className="text-xs font-black text-white uppercase tracking-tight">{candidate.nome.split(' ')[0]}</span>
         <span className="text-xs font-black text-slate-400">{delivered} / {requiredDocs.length} Docs ({pct}%)</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-1000 bg-green-500" style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---"""

content = content.replace("// --- COMPONENTE PRINCIPAL ---", new_components)

# 3. Update useCandidates
content = content.replace("const { candidates } = useCandidates();", "const { candidates, globalDocTypes } = useCandidates();\n  const [isExporting, setIsExporting] = useState(false);")

# 4. Update handleExportPDF
old_export = """  const handleExportPDF = async () => {
    const element = document.getElementById('battle-arena');
    const canvas = await html2canvas(element, { backgroundColor: '#020617', scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save('GPL_Battle_Report.pdf');
  };"""

new_export = """  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const element = document.getElementById('battle-arena');
      const canvas = await html2canvas(element, { 
         backgroundColor: '#020617', 
         scale: 2,
         useCORS: true,
         logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GPL_Battle_${selectedCandidates[0].nome.split(' ')[0]}_vs_${selectedCandidates[1].nome.split(' ')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF da Batalha.");
    } finally {
      setIsExporting(false);
    }
  };"""

content = content.replace(old_export, new_export)

# 5. Add new sections to the grid
old_grid = """             </div>
          </div>

          {/* FINAL VERDICT BOX */}"""

new_grid = """             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 mt-12">
             {/* EXPERIENCE MAP */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="text-blue-400" />
                  <h4 className="font-black text-white uppercase tracking-widest text-sm">Mapa de Experiência</h4>
                </div>
                <div className="space-y-4">
                  <ComparisonStat 
                     label="VGV Sob Gestão" 
                     val1={selectedCandidates[0].experiencia?.vgv || 'N/A'} 
                     val2={selectedCandidates[1].experiencia?.vgv || 'N/A'} 
                  />
                  <ComparisonStat 
                     label="Total Unidades" 
                     val1={selectedCandidates[0].experiencia?.unidades || '0'} 
                     val2={selectedCandidates[1].experiencia?.unidades || '0'} 
                  />
                  <ComparisonStat 
                     label="Máx. de Torres" 
                     val1={selectedCandidates[0].experiencia?.torres || '0'} 
                     val2={selectedCandidates[1].experiencia?.torres || '0'} 
                  />
                </div>
             </div>

             {/* DOCUMENT COMPLIANCE */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileSearch className="text-yellow-500" />
                  <h4 className="font-black text-white uppercase tracking-widest text-sm">Checklist Documental</h4>
                </div>
                <div className="space-y-4">
                   <DocumentCompliance candidate={selectedCandidates[0]} globalDocTypes={globalDocTypes} />
                   <DocumentCompliance candidate={selectedCandidates[1]} globalDocTypes={globalDocTypes} />
                </div>
             </div>
          </div>

          {/* FINAL VERDICT BOX */}"""

content = content.replace(old_grid, new_grid)

# 6. Update export button text to show loading state
old_button = """          <div className="flex justify-center pt-10">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-sm font-bold opacity-40 hover:opacity-100"
            >
              <FileDown size={16} /> DOWNLOAD BATTLE REPORT PDF
            </button>
          </div>"""

new_button = """          <div className="flex justify-center pt-10">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center gap-2 transition-all text-sm font-bold px-6 py-3 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 ${isExporting ? 'text-slate-600 opacity-50 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:border-slate-500'}`}
            >
              <FileDown size={18} className={isExporting ? 'animate-bounce' : ''} /> 
              {isExporting ? 'GERANDO PDF...' : 'BAIXAR BATTLE REPORT (PDF)'}
            </button>
          </div>"""

content = content.replace(old_button, new_button)

with open(file_path, "w") as f:
    f.write(content)

print("ComparisonView updated.")
