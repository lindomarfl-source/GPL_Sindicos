import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/ComparisonView.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Fix jsPDF import
old_import = "import { jsPDF } from 'jspdf';"
new_import = "import jsPDF from 'jspdf';"
content = content.replace(old_import, new_import)

# 2. Fix handleExportPDF
old_export = """  const handleExportPDF = async () => {
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

new_export = """  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Pequeno delay para garantir que a UI de "GERANDO PDF" renderize antes de travar a thread
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = document.getElementById('battle-arena');
      
      const canvas = await html2canvas(element, { 
         backgroundColor: '#020617', 
         scale: 2,
         useCORS: true,
         allowTaint: true,
         logging: true,
         windowWidth: element.scrollWidth,
         windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Se a imagem for maior que a folha A4, ela será redimensionada
      // Mas para a Battle Arena, como é um grid, pode ficar longo. O jsPDF vai imprimir em uma folha longa?
      // O a4 é fixo em 297mm. Se passar, vai cortar. Como o grid tem 2 colunas, deve caber em A4.
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GPL_Battle_${selectedCandidates[0].nome.split(' ')[0]}_vs_${selectedCandidates[1].nome.split(' ')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF: " + (error.message || error));
    } finally {
      setIsExporting(false);
    }
  };"""

content = content.replace(old_export, new_export)

with open(file_path, "w") as f:
    f.write(content)

print("ComparisonView PDF Export fixed.")
