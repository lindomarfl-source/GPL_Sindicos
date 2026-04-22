import React, { useState } from 'react';
import { useCandidates } from '../context/CandidatesContext';
import { Card, Badge, Button } from './Common';
import { CandidateModal } from './CandidateModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Search, Plus, Filter, ArrowRight, Edit2, Trash2, Users } from 'lucide-react';

export const CandidateManager = ({ onSelectCandidate }) => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const filteredCandidates = candidates.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" icon={Filter}>Filtros</Button>
          <Button icon={Plus} onClick={() => {
            setEditingCandidate(null);
            setIsModalOpen(true);
          }}>Novo Candidato</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-slate-800 shadow-2xl bg-transparent md:bg-slate-900/40">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Candidato / Registro</th>
                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-slate-400 font-black text-xs uppercase tracking-widest text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-500 font-medium">
                    Nenhum candidato encontrado com os termos de busca.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    className="hover:bg-blue-500/5 transition-colors cursor-pointer group border-b border-slate-800/50" 
                    onClick={() => onSelectCandidate(candidate.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{candidate.nome}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">{candidate.registro}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-tighter ${candidate.tipo === 'PJ' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {candidate.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Badge status={candidate.status}>{candidate.status}</Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCandidate(candidate);
                            setIsModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-blue-400 p-2 rounded-xl hover:bg-blue-500/10 transition-all"
                          title="Editar Ficha"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCandidateToDelete(candidate);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-xl hover:bg-blue-500/10 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                        >
                          Analisar <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 p-2">
          {filteredCandidates.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-medium">
              Nenhum candidato localizado.
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <div 
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate.id)}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 active:scale-[0.98] transition-all space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight text-lg">{candidate.nome}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{candidate.registro}</p>
                  </div>
                  <Badge status={candidate.status}>{candidate.status}</Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex gap-4">
                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-tighter ${candidate.tipo === 'PJ' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {candidate.tipo}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCandidate(candidate);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 p-2 bg-slate-800 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCandidateToDelete(candidate);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-400 p-2 bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <CandidateModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCandidate(null);
        }} 
        onSave={(data) => {
          if (editingCandidate) {
            updateCandidate(editingCandidate.id, data);
          } else {
            addCandidate(data);
          }
        }}
        initialData={editingCandidate}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCandidateToDelete(null);
        }}
        onConfirm={() => deleteCandidate(candidateToDelete.id, candidateToDelete.nome)}
        candidateName={candidateToDelete?.nome}
      />
    </div>
  );
};
