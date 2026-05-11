import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCandidates } from '../context/CandidatesContext';
import { Calendar, Clock, Edit2, Trash2, Plus, Download, Upload, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';

export const VisitasManager = () => {
  const { showNotification, candidates } = useCandidates();
  const [visitas, setVisitas] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nome_candidato: '',
    responsavel: '',
    data_visita: '',
    hora_visita: '',
    hora_fim: '',
    observacao: ''
  });

  // Modal de Confirmação
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null });

  useEffect(() => {
    fetchVisitas();
  }, []);

  const fetchVisitas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitas')
        .select('*')
        .order('data_visita', { ascending: true })
        .order('hora_visita', { ascending: true });

      if (error) throw error;
      setVisitas(data || []);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
      showNotification('Erro ao carregar visitas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nome_candidato: '', responsavel: '', data_visita: '', hora_visita: '', hora_fim: '', observacao: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome_candidato || !formData.data_visita || !formData.hora_visita) {
      showNotification('Preencha os campos obrigatórios.', 'error');
      return;
    }

    try {
      if (isEditing) {
        setConfirmModal({ isOpen: true, type: 'edit_submit', id: currentId });
      } else {
        const { data, error } = await supabase
          .from('visitas')
          .insert([{ ...formData, realizada: false, rodada: activeTab }])
          .select();
          
        if (error) throw error;
        
        setVisitas(prev => [...prev, data[0]].sort((a, b) => {
           if (a.data_visita === b.data_visita) return a.hora_visita.localeCompare(b.hora_visita);
           return a.data_visita.localeCompare(b.data_visita);
        }));
        showNotification('Visita agendada com sucesso!');
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      showNotification('Erro ao salvar visita.', 'error');
    }
  };

  const executeEdit = async () => {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .update({
          nome_candidato: formData.nome_candidato,
          responsavel: formData.responsavel,
          data_visita: formData.data_visita,
          hora_visita: formData.hora_visita,
          hora_fim: formData.hora_fim,
          observacao: formData.observacao
        })
        .eq('id', confirmModal.id)
        .select();

      if (error) throw error;
      
      // Usa os dados do formData local para garantir que a UI reflita a alteração instantaneamente e sem depender do payload do banco
      setVisitas(prev => prev.map(v => v.id === confirmModal.id ? { ...v, ...formData } : v).sort((a, b) => {
           if (a.data_visita === b.data_visita) return a.hora_visita.localeCompare(b.hora_visita);
           return a.data_visita.localeCompare(b.data_visita);
      }));
      showNotification('Visita atualizada com sucesso!');
      resetForm();
    } catch (error) {
      showNotification('Erro ao atualizar visita.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, type: '', id: null });
    }
  };

  const executeDelete = async () => {
    try {
      const { error } = await supabase
        .from('visitas')
        .delete()
        .eq('id', confirmModal.id);

      if (error) throw error;
      
      setVisitas(prev => prev.filter(v => v.id !== confirmModal.id));
      showNotification('Visita excluída com sucesso!', 'success');
      
      if (currentId === confirmModal.id) {
        resetForm();
      }
    } catch (error) {
      showNotification('Erro ao excluir visita.', 'error');
    } finally {
      setConfirmModal({ isOpen: false, type: '', id: null });
    }
  };

  const toggleRealizada = async (id, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('visitas')
        .update({ realizada: !currentStatus })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      setVisitas(prev => prev.map(v => v.id === id ? data[0] : v));
      showNotification(!currentStatus ? 'Visita marcada como realizada!' : 'Visita remarcada como pendente.', 'success');
    } catch (error) {
      showNotification('Erro ao alterar status da visita.', 'error');
    }
  };

  const confirmAction = () => {
    if (confirmModal.type === 'delete') {
      executeDelete();
    } else if (confirmModal.type === 'edit_submit') {
      executeEdit();
    }
  };

  const handleEditClick = (visita) => {
    setFormData({
      nome_candidato: visita.nome_candidato,
      responsavel: visita.responsavel || '',
      data_visita: visita.data_visita,
      hora_visita: visita.hora_visita,
      hora_fim: visita.hora_fim || '',
      observacao: visita.observacao || ''
    });
    setIsEditing(true);
    setCurrentId(visita.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadJSON = () => {
    const exportData = visitas.map(({ id, created_at, updated_at, ...rest }) => rest);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "visitas_sindicos.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) throw new Error("Formato inválido");
        
        // Remove ids para não dar conflito na importação
        const cleanedData = importedData.map(({ id, created_at, updated_at, cadastro, ...rest }) => ({
           ...rest,
           nome_candidato: rest.nome_candidato || 'Importado sem nome',
           realizada: rest.realizada || false,
           rodada: activeTab
        }));

        const { data, error } = await supabase
          .from('visitas')
          .insert(cleanedData)
          .select();

        if (error) throw error;

        showNotification(`${data.length} visitas importadas com sucesso!`);
        
        // Atualiza a tela em tempo real sem precisar refazer o fetch
        setVisitas(prev => {
          const combined = [...prev, ...data];
          return combined.sort((a, b) => {
             if (a.data_visita === b.data_visita) return a.hora_visita.localeCompare(b.hora_visita);
             return a.data_visita.localeCompare(b.data_visita);
          });
        });
      } catch (err) {
        console.error("Erro na importação", err);
        showNotification("Erro ao importar o arquivo JSON. Verifique o formato.", "error");
      }
      e.target.value = null; // Reseta o input
    };
    reader.readAsText(file);
  };

  const filteredVisitas = visitas.filter(v => (v.rodada || 1) === activeTab);

  // Agrupar visitas por data
  const groupedVisitas = filteredVisitas.reduce((acc, visita) => {
    if (!acc[visita.data_visita]) {
      acc[visita.data_visita] = [];
    }
    acc[visita.data_visita].push(visita);
    return acc;
  }, {});

  const totalVisitas = filteredVisitas.length;
  const visitasRealizadas = filteredVisitas.filter(v => v.realizada).length;
  const visitasPendentes = totalVisitas - visitasRealizadas;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      

      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total de Visitas</p>
            <h3 className="text-3xl font-black text-white">{totalVisitas}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative z-10">
            <Calendar size={24} />
          </div>
        </div>

        {/* Realizadas Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-green-500/30">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Realizadas</p>
            <h3 className="text-3xl font-black text-white">{visitasRealizadas}</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)] relative z-10">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Pendentes Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pendentes</p>
            <h3 className="text-3xl font-black text-white">{visitasPendentes}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] relative z-10">
            <Clock size={24} />
          </div>
        </div>
      </div>
      
      {/* Confirmação Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Atenção!</h3>
            </div>
            <p className="text-slate-300 mb-6">
              {confirmModal.type === 'delete' 
                ? 'Tem certeza que deseja excluir esta visita? Essa ação não pode ser desfeita.' 
                : 'Confirmar alteração nos dados desta visita?'}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, type: '', id: null })}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAction}
                className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${
                  confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Sim, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-blue-500" /> 
              {isEditing ? 'Editar Agendamento' : 'Novo Agendamento de Visita'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Marque as visitas in loco aos condomínios dos síndicos.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImportJSON} 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-medium text-sm border border-slate-700"
            >
              <Upload size={16} />
              Importar JSON
            </button>
            <button 
              onClick={downloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-medium text-sm border border-slate-700"
            >
              <Download size={16} />
              Baixar JSON
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Empresa / Síndico Aprovado</label>
              <select
                name="nome_candidato"
                value={formData.nome_candidato}
                onChange={(e) => {
                  const selNome = e.target.value;
                  const c = candidates.find(cnd => cnd.nome === selNome);
                  setFormData(prev => ({ 
                    ...prev, 
                    nome_candidato: selNome, 
                    responsavel: c ? (c.responsavel || '') : '' 
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              >
                <option value="">Selecione um candidato...</option>
                {candidates.filter(c => c.status === 'Aprovado').map(c => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Data da Visita</label>
              <input
                type="date"
                name="data_visita"
                value={formData.data_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hora Início</label>
              <input
                type="time"
                name="hora_visita"
                value={formData.hora_visita}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hora Fim</label>
              <input
                type="time"
                name="hora_fim"
                value={formData.hora_fim}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observações / Endereço</label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleInputChange}
              rows="2"
              placeholder="Digite aqui suas anotações ou observações..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar Edição
              </button>
            )}
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
            >
              <Plus size={18} />
              {isEditing ? 'Salvar Alterações' : 'Agendar Visita'}
            </button>
          </div>
        </form>
      </div>

            {/* TABS DE RODADAS */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-0">
        <button 
           onClick={() => setActiveTab(1)}
           className={`px-8 py-4 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 1 ? 'bg-blue-600 text-white shadow-[0_-5px_20px_rgba(37,99,235,0.2)]' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
          1ª Rodada
        </button>
        <button 
           onClick={() => setActiveTab(2)}
           className={`px-8 py-4 rounded-t-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 2 ? 'bg-purple-600 text-white shadow-[0_-5px_20px_rgba(147,51,234,0.2)]' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
          2ª Rodada
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 tracking-tight relative z-10">
          <Clock className="text-blue-500" />
          Cronograma de Visitas
        </h3>

        {loading ? (
          <div className="flex justify-center p-8 text-slate-500 relative z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(groupedVisitas).length === 0 ? (
          <div className="text-center p-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 relative z-10">
            <p className="text-slate-400 font-medium">Nenhuma visita agendada até o momento.</p>
          </div>
        ) : (
          <div className="space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/20 before:via-slate-700/30 before:to-transparent">
            {Object.keys(groupedVisitas).sort().map(data => {
              // Formatar a data para evitar bugs de fuso horário (Timezone shift)
              const [year, month, day] = data.split('-');
              const dataObj = new Date(year, month - 1, day);
              const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

              return (
                <div key={data} className="relative z-10 flex flex-col md:flex-row gap-6 md:justify-center group">
                  
                  {/* Glowing Dot on Timeline Line (Desktop) */}
                  <div className="hidden md:block absolute left-1/2 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-slate-900 z-20"></div>

                  {/* Marcador de Data (Glassmorphism) */}
                  <div className="flex items-start justify-start md:justify-end md:w-[220px] md:pr-10 pt-1 relative">
                     {/* Glowing Dot on Timeline Line (Mobile) */}
                     <div className="md:hidden absolute left-5 top-4 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] z-20"></div>
                     <div className="ml-10 md:ml-0 bg-slate-900/60 backdrop-blur-md text-blue-300 border border-slate-700/50 text-xs font-bold px-5 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] capitalize tracking-wider">
                        {dataFormatada}
                     </div>
                  </div>

                  {/* Cards de Visitas neste dia */}
                  <div className="w-full md:w-[500px] flex flex-col gap-4 pl-10 md:pl-0">
                    {groupedVisitas[data].map(visita => (
                      <div key={visita.id} className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${currentId === visita.id ? 'border-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.15)]' : (visita.realizada ? 'border-green-500/20 shadow-[0_10px_30px_rgba(34,197,94,0.05)]' : 'border-slate-700/40 hover:border-slate-600/60 shadow-xl shadow-black/10')}`}>
                        
                        {/* Accent line for status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${visita.realizada ? 'bg-gradient-to-b from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-b from-slate-700 to-slate-800'}`}></div>

                        <div className="flex justify-between items-start gap-4 pl-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex flex-col">
                                <h4 className={`font-bold text-lg tracking-wide ${visita.realizada ? 'text-slate-300 line-through opacity-70' : 'text-white'}`}>{visita.nome_candidato}</h4>
                                {visita.responsavel && (
                                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
                                    Resp: {visita.responsavel}
                                  </span>
                                )}
                              </div>
                              {visita.realizada && (
                                <span className="bg-green-500/10 text-green-400 text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md border border-green-500/20 h-fit mt-1">
                                  Concluída
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold mb-4 tracking-wider">
                              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${visita.realizada ? 'text-green-400/70 bg-green-950/30' : 'text-blue-300 bg-blue-950/40 border border-blue-900/50'}`}>
                                <Clock size={12} /> {visita.hora_visita ? visita.hora_visita.substring(0, 5) : ''}
                                {visita.hora_fim ? ` - ${visita.hora_fim.substring(0,5)}` : ''}
                              </span>
                            </div>
                            {visita.observacao && (
                              <p className={`text-sm p-3.5 rounded-xl flex items-start gap-3 border font-medium leading-relaxed ${visita.realizada ? 'text-green-200/50 bg-green-950/10 border-transparent' : 'text-slate-300 bg-slate-950/40 border-slate-800/60 shadow-inner'}`}>
                                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
                                {visita.observacao}
                              </p>
                            )}
                          </div>
                          
                          {/* Ações */}
                          <div className="flex flex-col gap-2 opacity-90">
                            <button 
                              onClick={() => toggleRealizada(visita.id, visita.realizada)}
                              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${visita.realizada ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20 hover:scale-105' : 'text-slate-400 bg-slate-800/40 hover:text-green-400 hover:bg-slate-800 hover:scale-105'}`}
                              title={visita.realizada ? "Desmarcar como concluída" : "Marcar como concluída"}
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleEditClick(visita)}
                              className="p-2.5 text-slate-400 bg-slate-800/20 hover:text-blue-400 hover:bg-slate-800/60 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => setConfirmModal({ isOpen: true, type: 'delete', id: visita.id })}
                              className="p-2.5 text-slate-400 bg-slate-800/20 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
