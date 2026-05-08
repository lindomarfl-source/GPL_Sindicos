import React, { useState, useRef } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Badge, Button } from './Common';
import { 
  User, Building2, FileCheck, ClipboardList, 
  Star, MessageSquare, AlertCircle, Save,
  ArrowLeft, ShieldAlert, ShieldCheck, Map,
  Building, Layers, Activity, FilePlus, Plus, X, RotateCcw,
  Megaphone, Users, Settings, Scale, Clipboard, LayoutList, Trophy,
  Mic, Check, CircleSlash, HelpCircle, Download, Upload
} from 'lucide-react';
import { AddDocumentModal } from './AddDocumentModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ComplianceStatus = ({ label, total, current }) => {
  const isComplete = current >= total && total > 0;
  const isStarted = current > 0;
  
  return (
    <div className="space-y-3 mb-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className={`w-3 h-3 rounded-full animate-pulse ${
          isComplete ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
          isStarted ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 
          'bg-red-500'
        }`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white tracking-tighter">{current || 0}</span>
        <span className="text-slate-500 font-bold uppercase text-xs">de {total || 0} documentos</span>
      </div>
      <p className="text-[10px] font-medium text-slate-500 italic">
        {isComplete ? '✅ Documentação devidamente verificada e completa.' : 
         isStarted ? '⚠️ Em fase de coleta e conferência documental.' : 
         '❌ Nenhuma documentação foi entregue até o momento.'}
      </p>
    </div>
  );
};

const DocumentItem = ({ label, status, onToggle, onDelete }) => {
  const statusConfig = {
    entregue: { icon: FileCheck, color: 'text-green-400', label: 'Entregue' },
    pendente: { icon: AlertCircle, color: 'text-yellow-400', label: 'Pendente' },
    'não entregue': { icon: AlertCircle, color: 'text-red-400', label: 'Ausente' }
  };

  const current = statusConfig[status] || statusConfig['não entregue'];
  const Icon = current.icon;

  return (
    <div 
      className="group flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer relative overflow-hidden"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={current.color} />
        <span className="text-slate-300 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge status={status}>{current.label}</Badge>
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
            title="Remover este requisito"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const RatingItem = ({ label, value, onChange, icon: Icon, description }) => (
  <Card className="p-4 bg-slate-900/40 border-slate-800 hover:border-blue-500/30 transition-all">
    <div className="flex items-start gap-4">
      <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-400">
        <Icon size={20} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="text-sm font-bold text-slate-100">{label}</h5>
            <p className="text-[10px] text-slate-500 font-medium">{description}</p>
          </div>
          <span className="text-lg font-black text-blue-500 bg-blue-400/5 px-2 rounded-lg border border-blue-400/10">
            {(value || 0)}
          </span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onChange(star)}
              className={`flex-1 rounded-full transition-all duration-300 ${
                star <= (value || 0) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
          <span>Iniciante</span>
          <span>Especialista</span>
        </div>
      </div>
    </div>
  </Card>
);

export const CandidateDetails = ({ candidateId, onBack }) => {
  const { 
    candidates, 
    loading, 
    updateCandidate, 
    globalDocTypes, 
    globalQuestions,
    addGlobalDocType, 
    deleteGlobalDocType, 
    resetGlobalDocTypes,
    showNotification 
  } = useCandidates();
  const [activeSubTab, setActiveSubTab] = useState('info');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isDeleteDocModalOpen, setIsDeleteDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localParecer, setLocalParecer] = useState('');
  const [localExp, setLocalExp] = useState({ vgv: '', unidades: '', torres: '' });
  const reportRef = useRef();
  const fileInputRef = useRef();
  
  // REATIVIDADE CRÍTICA: Garante que o componente pegue sempre a versão mais nova do objeto candidato
  const candidate = React.useMemo(() => {
    return (candidates || []).find(c => c.id === candidateId);
  }, [candidates, candidateId]);
  
  React.useEffect(() => {
    if (candidate) {
      setLocalParecer(candidate.parecer || '');
      setLocalExp(candidate.experiencia || { vgv: '', unidades: '', torres: '' });
    }
  }, [candidateId, candidate?.id]);

  if (!candidates || loading) return <div className="p-20 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest">Sincronizando com Supabase...</div>;
  if (!candidate) return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Candidato não localizado na base de dados.</div>;

  const toggleDoc = (key) => {
    const docData = { ...(candidate.documentacao || {}) };
    const currentStatus = docData[key] || 'não entregue';
    const nextStatus = currentStatus === 'entregue' ? 'pendente' : 
                       currentStatus === 'pendente' ? 'não entregue' : 'entregue';
    
    updateCandidate(candidate.id, {
      documentacao: { ...docData, [key]: nextStatus }
    });
  };

  const updateExperience = () => {
    updateCandidate(candidate.id, {
      experiencia: localExp
    });
  };

  const updateRating = (key, val) => {
    const evalData = candidate.avaliacao || {};
    updateCandidate(candidate.id, {
      avaliacao: { ...evalData, [key]: val }
    });
  };

  const updateInterview = async (questionKey, field, val) => {
    if (!candidate) return;
    const interviewData = candidate.entrevista || {};
    const questionData = interviewData[questionKey] || { answer: '', status: 'neutral' };
    
    await updateCandidate(candidate.id, {
      entrevista: { 
        ...interviewData, 
        [questionKey]: { ...questionData, [field]: val } 
      }
    });
  };

  const handleSave = async () => {
    if (!candidate) return;
    setIsSaving(true);
    
    try {
      await updateCandidate(candidate.id, { parecer: localParecer });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const exportCandidateJSON = () => {
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
      }

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

  // Cálculo reativo de progresso (Monitora mudanças no candidato e nos tipos globais)
  const docStats = React.useMemo(() => {
    if (!candidate || !globalDocTypes || globalDocTypes.length === 0) return { pct: 0, current: 0, total: 0 };
    
    const requiredDocs = globalDocTypes.filter(doc => {
      if (doc.category === 'Pessoa Jurídica' && candidate.tipo === 'PF') return false;
      return true;
    });

    if (requiredDocs.length === 0) return { pct: 0, current: 0, total: 0 };

    const docData = candidate.documentacao || {};
    const deliveredCount = requiredDocs.filter(doc => (docData[doc.key] || '').toLowerCase() === 'entregue').length;
    const rawProgress = (deliveredCount / requiredDocs.length) * 100;
    
    return {
      pct: Math.min(Math.max(Math.round(rawProgress), 0), 100),
      current: deliveredCount,
      total: requiredDocs.length
    };
  }, [candidate, globalDocTypes]);

  const progress = docStats.pct;

  // Cálculo reativo de score técnico
  const techScore = React.useMemo(() => {
    if (!candidate || !candidate.avaliacao) return 0;
    const evalData = candidate.avaliacao;
    const values = Object.values(evalData);
    if (values.length === 0) return 0;
    const total = values.reduce((a, b) => a + (Number(b) || 0), 0);
    return Math.min((total / 30) * 100, 100);
  }, [candidate]);

  const DocList = ({ title, items }) => (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => (
          <DocumentItem 
            key={item.key} 
            label={item.label} 
            status={(candidate.documentacao && candidate.documentacao[item.key]) || 'não entregue'} 
            onToggle={() => toggleDoc(item.key)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft} className="w-fit">
          Voltar
        </Button>
        <div className="flex items-center gap-2 md:gap-3">
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
          <input type="file" accept=".json" ref={fileInputRef} onChange={importCandidateJSON} className="hidden" />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={Upload} className="flex text-[10px] md:text-sm" title="Importar JSON">
            <span className="hidden sm:inline">Importar JSON</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button variant="secondary" onClick={exportCandidateJSON} icon={Download} className="flex text-[10px] md:text-sm" title="Exportar JSON">
            <span className="hidden sm:inline">Exportar JSON</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
          <Button variant="secondary" onClick={exportPDF} icon={FilePlus} className="flex flex-1 md:flex-none text-[10px] md:text-sm" title="Gerar PDF">
            <span className="hidden sm:inline">Gerar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          {saveSuccess && (
            <div className="hidden md:flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
              <Check size={16} className="font-bold" />
              <span className="text-sm font-bold">Salvo!</span>
            </div>
          )}
          <Button 
            icon={Save} 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none text-[10px] md:text-sm"
          >
            {isSaving ? '...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1 md:p-2">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-8 border-b-4 border-b-blue-500 shadow-xl shadow-blue-900/10">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 ${candidate.tipo === 'PJ' ? 'bg-purple-600/20 text-purple-400' : 'bg-blue-600/20 text-blue-400'}`}>
              {candidate.tipo === 'PJ' ? <Building2 size={40} /> : <User size={40} />}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{candidate.nome}</h3>
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
            </div>
            
            <div className="mt-8 text-left border-t border-slate-700/50 pt-6">
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase mb-2">Análise de Risco</p>
                <div className={`p-3 rounded-lg flex items-center gap-3 border ${
                   (candidate.risco || 'baixo') === 'baixo' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                   (candidate.risco === 'moderado') ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                   'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {(candidate.risco || 'baixo') === 'baixo' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  <span className="text-sm font-bold uppercase">{(candidate.risco || 'baixo')} RISCO</span>
                </div>
              </div>
              <ComplianceStatus 
                label="Checklist Documental" 
                total={docStats.total}
                current={docStats.current}
              />
              
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avaliação Técnica</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-500 tracking-tighter">{Math.round(techScore || 0)}</span>
                  <span className="text-slate-500 font-bold uppercase text-xs">Pontos / 100</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Map size={18} className="text-blue-400" />
              Mapa de Experiência
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Activity size={14} /> VGV Sob Gestão
                </div>
                <input 
                  type="text" 
                  value={localExp.vgv || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, vgv: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-32"
                  placeholder="Ex: 50M"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Building size={14} /> Total Unidades
                </div>
                <input 
                  type="number" 
                  value={localExp.unidades || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, unidades: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Layers size={14} /> Máx. de Torres
                </div>
                <input 
                  type="number" 
                  value={localExp.torres || ''} 
                  onChange={(e) => setLocalExp({ ...localExp, torres: e.target.value })}
                  onBlur={updateExperience}
                  className="bg-transparent text-right text-slate-100 font-bold outline-none focus:text-blue-400 w-20"
                  placeholder="0"
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            <div className="flex min-w-max md:min-w-0 md:w-full">
              <button onClick={() => setActiveSubTab('info')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${activeSubTab === 'info' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><User size={16} /> <span className="text-xs font-bold uppercase tracking-tighter">Dados</span></button>
              <button onClick={() => setActiveSubTab('docs')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${activeSubTab === 'docs' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><FileCheck size={16} /> <span className="text-xs font-bold uppercase tracking-tighter">Docs</span></button>
              <button onClick={() => setActiveSubTab('tech')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${activeSubTab === 'tech' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Star size={16} /> <span className="text-xs font-bold uppercase tracking-tighter">Técnico</span></button>
              <button onClick={() => setActiveSubTab('interview')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${activeSubTab === 'interview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Mic size={16} /> <span className="text-xs font-bold uppercase tracking-tighter">Questionário</span></button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeSubTab === 'info' && (
              <Card className="p-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-blue-400" /> Parecer da Comissão</h4>
                <textarea 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none h-60 transition-all resize-none" 
                  placeholder="Descreva aqui as impressões técnicas da comissão sobre este candidato..." 
                  value={localParecer} 
                  onChange={(e) => setLocalParecer(e.target.value)}
                  onBlur={() => updateCandidate(candidate.id, { parecer: localParecer })}
                />
              </Card>
            )}

            {activeSubTab === 'docs' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={18} className="text-blue-500" />
                    Checklist de Documentação
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (window.confirm('Deseja restaurar a lista padrão organizada por categorias? Isso removerá as personalizações atuais.')) {
                          resetGlobalDocTypes();
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
                      title="Restaurar padrão"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsAddDocOpen(true)}>
                      Novo Requisito
                    </Button>
                  </div>
                </div>

                {/* Renderização Agrupada por Categoria */}
                {['Obrigatórios', 'Pessoa Jurídica', 'Extras'].map(category => {
                  const docsInCategory = (globalDocTypes || []).filter(d => d.category === category);
                  
                  // Se for categoria PJ e o candidato for PF, podemos ocultar ou mostrar desabilitado
                  if (category === 'Pessoa Jurídica' && candidate.tipo === 'PF') return null;
                  if (!docsInCategory || docsInCategory.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-l-2 border-blue-500 pl-3 ml-1 bg-slate-800/20 py-1">
                        {category}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docsInCategory.map(doc => (
                          <DocumentItem 
                            key={doc.key} 
                            label={doc.label} 
                            status={(candidate.documentacao && candidate.documentacao[doc.key]) || 'não entregue'} 
                            onToggle={() => toggleDoc(doc.key)}
                            onDelete={() => {
                              setDocToDelete(doc);
                              setIsDeleteDocModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Documentos sem categoria definida (Outros) */}
                {(() => {
                  const others = (globalDocTypes || []).filter(d => !['Obrigatórios', 'Pessoa Jurídica', 'Extras'].includes(d.category));
                  if (!others || others.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-l-2 border-slate-600 pl-3 ml-1 bg-slate-800/20 py-1">
                        Outros Documentos
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {others.map(doc => (
                          <DocumentItem 
                            key={doc.key} 
                            label={doc.label} 
                            status={(candidate.documentacao && candidate.documentacao[doc.key]) || 'não entregue'} 
                            onToggle={() => toggleDoc(doc.key)}
                            onDelete={() => {
                              setDocToDelete(doc);
                              setIsDeleteDocModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <AddDocumentModal 
                  isOpen={isAddDocOpen} 
                  onClose={() => setIsAddDocOpen(false)} 
                  onAdd={addGlobalDocType} 
                />

                <DeleteConfirmModal 
                  isOpen={isDeleteDocModalOpen}
                  onClose={() => {
                    setIsDeleteDocModalOpen(false);
                    setDocToDelete(null);
                  }}
                  onConfirm={() => {
                    deleteGlobalDocType(docToDelete.key, docToDelete.label);
                    setIsDeleteDocModalOpen(false);
                    setDocToDelete(null);
                  }}
                  candidateName={docToDelete?.label}
                />
              </div>
            )}

            {activeSubTab === 'tech' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    Avaliação de Perfil Técnico
                  </h4>
                  <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-xs text-slate-400 font-bold uppercase mr-2 tracking-tighter">Score Geral:</span>
                    <span className="text-blue-400 font-black text-lg">{ (Object.values(candidate.avaliacao || {}).reduce((a,b) => a+b, 0) / 6).toFixed(1) }</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RatingItem 
                    label="Comunicação" 
                    icon={Megaphone}
                    description="Oratória, feedback e clareza informativa."
                    value={candidate.avaliacao?.comunicacao} 
                    onChange={(v) => updateRating('comunicacao', v)} 
                  />
                  <RatingItem 
                    label="Liderança" 
                    icon={Users}
                    description="Gestão de equipes e influência positiva."
                    value={candidate.avaliacao?.lideranca} 
                    onChange={(v) => updateRating('lideranca', v)} 
                  />
                  <RatingItem 
                    label="Conhecimento Técnico" 
                    icon={Settings}
                    description="Legislação, manutenção e áreas correlatas."
                    value={candidate.avaliacao?.tecnica} 
                    onChange={(v) => updateRating('tecnica', v)} 
                  />
                  <RatingItem 
                    label="Gestão de Conflitos" 
                    icon={Scale}
                    description="Mediação de crises entre moradores."
                    value={candidate.avaliacao?.conflitos} 
                    onChange={(v) => updateRating('conflitos', v)} 
                  />
                  <RatingItem 
                    label="Planejamento Orçamentário" 
                    icon={Clipboard}
                    description="Previsão orçamentária e planos de ação."
                    value={candidate.avaliacao?.planejamento} 
                    onChange={(v) => updateRating('planejamento', v)} 
                  />
                  <RatingItem 
                    label="Organização" 
                    icon={LayoutList}
                    description="Controle de cronogramas e processos."
                    value={candidate.avaliacao?.organizacao} 
                    onChange={(v) => updateRating('organizacao', v)} 
                  />
                </div>
              </div>
            )}

            {activeSubTab === 'interview' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 pb-10">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Mic size={18} className="text-red-500" />
                    Resposta do Questionário Técnico
                  </h4>
                  <Badge status="Em análise">Protocolo GCP</Badge>
                </div>

                <div className="space-y-4">
                  {(globalQuestions || []).map((item, idx) => (
                    <Card key={item.key} className="p-6 bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-all">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white">{item.q}</h5>
                              <p className="text-[10px] text-slate-500 font-medium italic mt-1">{item.d}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resposta do Candidato</label>
                          <textarea 
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none h-40 transition-all resize-none"
                            placeholder="Registre aqui os detalhes da resposta dada pelo síndico durante a sabatina..."
                            value={candidate.entrevista?.[item.key] || ''}
                            onChange={(e) => {
                              const interviewData = { ...(candidate.entrevista || {}) };
                              updateCandidate(candidate.id, {
                                entrevista: { ...interviewData, [item.key]: e.target.value }
                              });
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
