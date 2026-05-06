import re

file_path = "/Users/lindomar.fontana/Documents/Meus_Projetos_Antigravity/GPL_Sindicos/src/components/CandidateDetails.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add Icons
content = content.replace("Mic, Check, CircleSlash, HelpCircle", "Mic, Check, CircleSlash, HelpCircle, Download, Upload")

# 2. Add fileInputRef
content = content.replace("const reportRef = useRef();", "const reportRef = useRef();\n  const fileInputRef = useRef();")

# 3. Add import/export logic and replace exportPDF
old_export_pdf = re.search(r"  const exportPDF = \(\) => \{.*?\n  \};\n", content, re.DOTALL)

new_methods = """  const exportCandidateJSON = () => {
    const dataStr = JSON.stringify(candidate, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ficha_${candidate.nome.replace(/\s+/g, '_').toLowerCase()}.json`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCandidateJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const { id, created_at, updated_at, ...cleanCandidate } = parsed;
        
        if (window.confirm("Isso irá sobrescrever todos os dados técnicos e documentais deste candidato. Deseja continuar?")) {
          await updateCandidate(candidate.id, cleanCandidate);
          showNotification('Ficha importada com sucesso!', 'success');
        }
      } catch (error) {
        console.error("Erro na importação:", error);
        showNotification("Erro ao importar o arquivo JSON.", "error");
      }
    };
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportPDF = () => {
    if (!candidate) return;
    showNotification('Gerando arquivo PDF...', 'success');
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const primaryColor = [15, 23, 42];
      
      const checkPageBreak = (currentY, needed) => {
        if (currentY + needed > 280) { doc.addPage(); return 20; }
        return currentY;
      };

      // 1. Cabeçalho
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('FICHA TÉCNICA DO SÍNDICO', 15, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleString('pt-BR'), 160, 28);

      let currentY = 45;

      // 2. Dados Pessoais / Empresa
      doc.setTextColor(...primaryColor);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(String(candidate.nome || '').toUpperCase(), 15, currentY);
      currentY += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Registro: ${candidate.registro || 'N/A'} | Tipo: ${candidate.tipo}`, 15, currentY);
      currentY += 6;
      doc.text(`Email: ${candidate.email || 'N/A'} | Telefone: ${candidate.telefone || 'N/A'}`, 15, currentY);
      currentY += 6;
      doc.text(`Cidade: ${candidate.cidade || 'N/A'} | Valor Proposta: ${candidate.valor_proposta || 'N/A'}`, 15, currentY);
      currentY += 6;
      doc.text(`Status: ${candidate.status || 'N/A'} | Risco: ${candidate.risco || 'N/A'}`, 15, currentY);
      currentY += 15;

      // 3. Mapa de Experiência
      currentY = checkPageBreak(currentY, 30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MAPA DE EXPERIÊNCIA', 15, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`VGV sob Gestão: ${candidate.experiencia?.vgv || 'N/A'}`, 15, currentY);
      doc.text(`Total Unidades: ${candidate.experiencia?.unidades || 'N/A'}`, 80, currentY);
      doc.text(`Máx Torres: ${candidate.experiencia?.torres || 'N/A'}`, 140, currentY);
      currentY += 15;

      // 4. Avaliação Técnica
      currentY = checkPageBreak(currentY, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AVALIAÇÃO TÉCNICA (0 a 5)', 15, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const av = candidate.avaliacao || {};
      doc.text(`Comunicação: ${av.comunicacao || 0}`, 15, currentY);
      doc.text(`Liderança: ${av.lideranca || 0}`, 80, currentY);
      doc.text(`Técnica: ${av.tecnica || 0}`, 140, currentY);
      currentY += 6;
      doc.text(`Conflitos: ${av.conflitos || 0}`, 15, currentY);
      doc.text(`Planejamento: ${av.planejamento || 0}`, 80, currentY);
      doc.text(`Organização: ${av.organizacao || 0}`, 140, currentY);
      currentY += 15;

      // 5. Checklist Documentos
      currentY = checkPageBreak(currentY, 20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CHECKLIST DOCUMENTAL', 15, currentY);
      currentY += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const docsToPrint = (globalDocTypes || []).filter(d => !(d.category === 'Pessoa Jurídica' && candidate.tipo === 'PF'));
      docsToPrint.forEach(d => {
        const status = (candidate.documentacao?.[d.key] === 'entregue') ? 'ENTREGUE' : 'PENDENTE';
        const wrappedLabel = doc.splitTextToSize(`- ${d.label}`, 140);
        const lines = wrappedLabel.length;
        currentY = checkPageBreak(currentY, lines * 5);
        doc.text(wrappedLabel, 15, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(status, 160, currentY);
        doc.setFont('helvetica', 'normal');
        currentY += (lines * 5) + 2;
      });
      currentY += 10;

      // 6. Questionário
      currentY = checkPageBreak(currentY, 20);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('QUESTIONÁRIO TÉCNICO', 15, currentY);
      currentY += 8;
      doc.setFontSize(9);
      (globalQuestions || []).forEach((q, idx) => {
        const ans = candidate.entrevista?.[q.key] || 'Não respondido';
        const qText = doc.splitTextToSize(`${idx + 1}. ${q.q}`, 180);
        const aText = doc.splitTextToSize(`R: ${ans}`, 175);
        currentY = checkPageBreak(currentY, (qText.length + aText.length) * 5 + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(qText, 15, currentY);
        currentY += qText.length * 5;
        doc.setFont('helvetica', 'normal');
        doc.text(aText, 20, currentY);
        currentY += aText.length * 5 + 3;
      });
      currentY += 10;

      // 7. Parecer
      currentY = checkPageBreak(currentY, 30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PARECER DA COMISSÃO E OBSERVAÇÕES', 15, currentY);
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const obsText = doc.splitTextToSize(`Obs Inicial: ${candidate.observacao || 'Nenhuma observação inicial.'}`, 180);
      currentY = checkPageBreak(currentY, obsText.length * 5);
      doc.text(obsText, 15, currentY);
      currentY += obsText.length * 5 + 5;

      const parText = doc.splitTextToSize(`Parecer: ${localParecer || 'Nenhum parecer técnico registrado.'}`, 180);
      currentY = checkPageBreak(currentY, parText.length * 5);
      doc.text(parText, 15, currentY);

      const safeName = String(candidate.nome).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`ficha_${safeName}.pdf`);
      showNotification('PDF gerado com sucesso!', 'success');
    } catch (err) {
      console.error('Falha no PDF:', err);
      showNotification('Erro ao gerar PDF', 'error');
    }
  };
"""
if old_export_pdf:
    content = content.replace(old_export_pdf.group(0), new_methods)

# 4. Replace Top Buttons
old_buttons = """        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="secondary" onClick={exportPDF} icon={FilePlus} className="flex-1 md:flex-none text-[10px] md:text-sm">
            PDF
          </Button>"""

new_buttons = """        <div className="flex items-center gap-2 md:gap-3">
          <input type="file" accept=".json" ref={fileInputRef} onChange={importCandidateJSON} className="hidden" />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={Upload} className="hidden md:flex text-[10px] md:text-sm" title="Importar JSON">
            Importar
          </Button>
          <Button variant="secondary" onClick={exportCandidateJSON} icon={Download} className="hidden md:flex text-[10px] md:text-sm" title="Exportar JSON">
            Exportar
          </Button>
          <Button variant="secondary" onClick={exportPDF} icon={FilePlus} className="flex-1 md:flex-none text-[10px] md:text-sm">
            Gerar PDF
          </Button>"""

content = content.replace(old_buttons, new_buttons)

with open(file_path, "w") as f:
    f.write(content)

print("Script concluido.")
