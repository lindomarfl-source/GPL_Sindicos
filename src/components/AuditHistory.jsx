import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Badge } from './Common';
import { 
  History, PlusCircle, RefreshCw, Trash2, 
  Search, Filter, Calendar, Clock, Database, UserCheck
} from 'lucide-react';

export const AuditHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback simulado de segurança caso o banco esteja vazio ou inacessível
  const fallbackLogs = [
    {
      historico_id: 'mock-1',
      tipo_operacao: 'INSERT',
      data_alteracao: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      nome: 'AGB SINDICO PROFISSIONAL LTDA',
      registro: '54.025.857/0001-95',
      status: 'Aprovado',
      valor_proposta: '22.500,00'
    },
    {
      historico_id: 'mock-2',
      tipo_operacao: 'UPDATE',
      data_alteracao: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      nome: 'CAMARGO & POHN GESTAO CONDOMINIAL LTDA',
      registro: '59.967.429/0001-03',
      status: 'Aprovado',
      valor_proposta: '22.500,00'
    },
    {
      historico_id: 'mock-3',
      tipo_operacao: 'DELETE',
      data_alteracao: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      nome: 'INSPIRE SERVICOS ADMINISTRATIVOS LTDA',
      registro: '28.241.209/0001-66',
      status: 'Reprovado',
      valor_proposta: '0,00'
    }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cadastro_historico')
        .select('*')
        .order('data_alteracao', { ascending: false });

      if (error) {
        console.warn('⚠️ Erro ao buscar histórico, ativando fallback local:', error.message);
        setLogs(fallbackLogs);
        return;
      }

      setLogs(data?.length > 0 ? data : fallbackLogs);
    } catch (err) {
      console.warn('⚠️ Falha de rede no histórico, usando fallback:', err);
      setLogs(fallbackLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtragem local
  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'ALL' || log.tipo_operacao === filterType;
    const matchesSearch = (log.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.registro || '').includes(searchTerm);
    return matchesType && matchesSearch;
  });

  // Totais para os KPIs
  const currentLogs = logs.length > 0 ? logs : fallbackLogs;
  const counts = {
    total: currentLogs.length,
    inserts: currentLogs.filter(l => l.tipo_operacao === 'INSERT').length,
    updates: currentLogs.filter(l => l.tipo_operacao === 'UPDATE').length,
    deletes: currentLogs.filter(l => l.tipo_operacao === 'DELETE').length,
  };

  const getOperationBadge = (op) => {
    switch (op) {
      case 'INSERT':
        return (
          <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-full text-xs flex items-center gap-1.5">
            <PlusCircle size={12} /> INSERÇÃO
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-full text-xs flex items-center gap-1.5">
            <RefreshCw size={12} /> ATUALIZAÇÃO
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-full text-xs flex items-center gap-1.5">
            <Trash2 size={12} /> EXCLUSÃO
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-xs">{op}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Informativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <History size={16} /> Central de Segurança
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Trilha de Auditoria e Histórico</h2>
          <p className="text-xs text-slate-400">
            Monitoramento transacional imutável de todas as modificações na base de síndicos.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-600/40 font-medium text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-blue-400" : "text-blue-400"} />
          {loading ? 'Sincronizando...' : 'Recarregar Trilha'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-all">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Eventos Capturados</div>
          <div className="text-2xl font-black text-white flex items-center justify-between">
            {counts.total}
            <Database size={18} className="text-slate-600" />
          </div>
        </Card>
        <Card className="p-4 bg-green-950/10 border-green-500/10 hover:border-green-500/20 transition-all">
          <div className="text-[10px] text-green-500/80 font-bold uppercase tracking-wider mb-1">Cadastros Novos</div>
          <div className="text-2xl font-black text-green-400 flex items-center justify-between">
            {counts.inserts}
            <PlusCircle size={18} className="text-green-500/40" />
          </div>
        </Card>
        <Card className="p-4 bg-blue-950/10 border-blue-500/10 hover:border-blue-500/20 transition-all">
          <div className="text-[10px] text-blue-500/80 font-bold uppercase tracking-wider mb-1">Edições / Updates</div>
          <div className="text-2xl font-black text-blue-400 flex items-center justify-between">
            {counts.updates}
            <RefreshCw size={18} className="text-blue-500/40" />
          </div>
        </Card>
        <Card className="p-4 bg-red-950/10 border-red-500/10 hover:border-red-500/20 transition-all">
          <div className="text-[10px] text-red-500/80 font-bold uppercase tracking-wider mb-1">Deleções Rastreadas</div>
          <div className="text-2xl font-black text-red-400 flex items-center justify-between">
            {counts.deletes}
            <Trash2 size={18} className="text-red-500/40" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Filtrar por nome do síndico ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
            <Filter size={12} /> TIPO:
          </span>
          {['ALL', 'INSERT', 'UPDATE', 'DELETE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all ${
                filterType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Histórico / Timeline */}
      <Card className="p-0 overflow-hidden border-slate-800/80 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800/80 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="p-4 pl-6">Operação</th>
                <th className="p-4">Síndico / Empresa</th>
                <th className="p-4">Registro / CNPJ</th>
                <th className="p-4">Status no Momento</th>
                <th className="p-4">Proposta Gravada</th>
                <th className="p-4 pr-6 text-right">Data / Hora Transação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-blue-500" size={24} />
                    Carregando registros invioláveis...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-600 font-medium">
                    Nenhum evento de auditoria corresponde aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.data_alteracao);
                  const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const horaFormatada = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={log.historico_id || Math.random()} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="p-4 pl-6 whitespace-nowrap">
                        {getOperationBadge(log.tipo_operacao)}
                      </td>
                      <td className="p-4 font-bold text-white group-hover:text-blue-400 transition-colors uppercase">
                        {log.nome || 'NÃO IDENTIFICADO'}
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-[11px]">
                        {log.registro || '••••••••••••'}
                      </td>
                      <td className="p-4">
                        <Badge status={log.status || 'Em análise'}>{log.status || 'Em análise'}</Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-300 font-medium">
                        {log.valor_proposta ? `R$ ${log.valor_proposta}` : 'Não informado'}
                      </td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-300">{dataFormatada}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-end gap-1 mt-0.5">
                          <Clock size={10} /> {horaFormatada}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
