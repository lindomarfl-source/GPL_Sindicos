import React from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Badge } from './Common';
import { 
  CheckCircle2, AlertCircle, XCircle, 
  FileSearch, Search, Download, Filter
} from 'lucide-react';

export const DocumentComparator = () => {
  const { candidates, globalDocTypes } = useCandidates();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCandidates = candidates.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (candidate, docKey) => {
    const status = (candidate.documentacao?.[docKey] || '').toLowerCase();
    
    if (status === 'entregue') return <CheckCircle2 size={18} className="text-green-500 mx-auto" />;
    if (status === 'pendente') return <AlertCircle size={18} className="text-yellow-500 mx-auto" />;
    return <XCircle size={18} className="text-red-500/30 mx-auto" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-3 italic text-blue-500">
            <FileSearch size={24} />
            Matriz Comparativa de Documentos
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Visão geral de conformidade entre todos os candidatos
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Filtrar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tabela de Comparação Transposta */}
      <Card className="overflow-hidden border-slate-800 bg-slate-950/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-900 z-20 min-w-[200px] border-r border-slate-800">
                  Documento / Requisito
                </th>
                {filteredCandidates.map(candidate => (
                  <th key={candidate.id} className="p-4 text-[10px] font-black text-white uppercase tracking-widest text-center min-w-[150px] whitespace-nowrap bg-slate-900/40">
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[140px]">{candidate.nome}</span>
                      <span className="text-[8px] text-blue-500 mt-1 italic">{candidate.tipo}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {globalDocTypes.map((doc, docIdx) => (
                <tr key={doc.key} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                  <td className="p-4 sticky left-0 bg-slate-950 group-hover:bg-slate-900 transition-all border-r border-slate-800 shadow-xl z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {docIdx + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">
                        {doc.label}
                      </span>
                    </div>
                  </td>
                  {filteredCandidates.map(candidate => (
                    <td key={`${candidate.id}-${doc.key}`} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(candidate, doc.key)}
                        {/* Se o doc for exclusivo PJ e o candidato for PF */}
                        {doc.category === 'Pessoa Jurídica' && candidate.tipo === 'PF' ? (
                          <span className="text-[8px] text-slate-700 font-bold uppercase italic">N/A</span>
                        ) : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-6 p-4 bg-slate-900/20 rounded-xl border border-slate-800/50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <CheckCircle2 size={14} className="text-green-500" /> Entregue
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <AlertCircle size={14} className="text-yellow-500" /> Pendente
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <XCircle size={14} className="text-red-500" /> Ausente
        </div>
      </div>
    </div>
  );
};
