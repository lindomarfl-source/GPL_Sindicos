import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const CandidatesContext = createContext();

export const CandidatesProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('gpl_auth') === 'true';
  });
  const [notification, setNotification] = useState(null);

  const defaultDocs = [
    { key: 'curriculo', label: 'Currículo e Trajetória Profissional', category: 'Obrigatórios' },
    { key: 'experiencia', label: 'Comprovação de Experiência em Condomínios', category: 'Obrigatórios' },
    { key: 'certidao_civel', label: 'Certidão Negativa Cível', category: 'Obrigatórios' },
    { key: 'certidao_criminal', label: 'Certidão Negativa Criminal', category: 'Obrigatórios' },
    { key: 'certidao_fiscal', label: 'Certidão Negativa Fiscal (Federal/Estadual)', category: 'Obrigatórios' },
    { key: 'planoGestao', label: 'Plano de Gestão e Operação GPL', category: 'Obrigatórios' },
    { key: 'contratoSocial', label: 'Contrato Social / Estatuto', category: 'Pessoa Jurídica' },
    { key: 'certidoesPJ', label: 'Certidões Negativas da Empresa', category: 'Pessoa Jurídica' },
    { key: 'responsavelTecnico', label: 'Indicação de Responsável Técnico', category: 'Pessoa Jurídica' },
    { key: 'estrutura', label: 'Estrutura Operacional e Suporte', category: 'Pessoa Jurídica' },
    { key: 'referencias', label: 'Referências de Outros Condomínios', category: 'Extras' },
    { key: 'cases', label: 'Apresentação de Cases Anteriores', category: 'Extras' },
    { key: 'complementar', label: 'Materiais e Certificados Complementares', category: 'Extras' }
  ];

  const defaultQuestions = [
    { key: 'obras', q: 'Gestão de Obras e Aditivos', d: 'Como gerenciou obras estruturais e aditivos de preço?' },
    { key: 'custos', q: 'Redução de Inadimplência', d: 'Estratégia para reduzir dívidas sem aumentar a tensão.' },
    { key: 'transparencia', q: 'Governança e Notas Fiscais', d: 'Procedimento técnico ao ser questionado por moradores.' },
    { key: 'conflitos', q: 'Liderança em Assembleias', d: 'Como retomou as rédeas de uma pauta descontrolada?' },
    { key: 'manutencao', q: 'Primeiros 90 Dias / Manutenção', d: 'Visão sobre os contratos preventivos atuais.' },
    { key: 'equipe', q: 'Gestão de Staff / Vícios', d: 'Como lidará com a equipe operacional legada?' },
    { key: 'lgpd', q: 'Proteção de Dados / LGPD', d: 'Segurança das câmeras e dados sensíveis no condomínio.' },
    { key: 'emergencia', q: 'Compromisso 24h / Emergência', d: 'Protocolo de resposta às 3h da manhã de domingo.' },
    { key: 'etica', q: 'Integridade e Dilemas Éticos', d: 'Situações onde teve que negar pedidos irregulares.' },
    { key: 'diferencial', q: 'Diferencial x Concorrência', d: 'Por que VOCÊ e não uma empresa de maior VGV?' }
  ];

  const [globalDocTypes, setGlobalDocTypes] = useState(defaultDocs);
  const [globalQuestions, setGlobalQuestions] = useState(defaultQuestions);

  // 1. Carregar dados do Supabase ao iniciar
  useEffect(() => {
    fetchCandidates();
    fetchConfigs();
    
    // Opcional: Escutar mudanças em tempo real
    const subscription = supabase
      .channel('portal_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatos' }, fetchCandidates)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config_perguntas' }, fetchConfigs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config_documentos' }, fetchConfigs)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchConfigs = async () => {
    try {
      // Carrega Documentos
      const { data: docs, error: errDocs } = await supabase.from('config_documentos').select('*').order('created_at', { ascending: true });
      if (errDocs) throw errDocs;
      setGlobalDocTypes(docs?.length > 0 ? docs : defaultDocs);

      // Carrega Perguntas
      const { data: qst, error: errQst } = await supabase.from('config_perguntas').select('*').order('created_at', { ascending: true });
      if (errQst) throw errQst;
      setGlobalQuestions(qst?.length > 0 ? qst : defaultQuestions);
    } catch (error) {
      console.warn('Usando padrões locais. Tabelas de config ainda não criadas no Supabase.');
      setGlobalDocTypes(defaultDocs);
      setGlobalQuestions(defaultQuestions);
    }
  };

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Falha no fetch de candidatos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = (password) => {
    if (password === 'GPL2026') {
      setIsAuthenticated(true);
      localStorage.setItem('gpl_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('gpl_auth');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addCandidate = async (candidate) => {
    // Mapeamento explícito para garantir que registro e telefone sejam salvos
    const payload = {
      nome: candidate.nome,
      tipo: candidate.tipo,
      registro: candidate.registro,
      responsavel: candidate.responsavel,
      email: candidate.email,
      telefone: candidate.telefone,
      cidade: candidate.cidade || 'Porto Alegre',
      status: candidate.status || 'Em análise',
      documentacao: candidate.documentacao || {},
      avaliacao: candidate.avaliacao || {
        comunicacao: 0, lideranca: 0, tecnica: 0, conflitos: 0, planejamento: 0, organizacao: 0
      },
      experiencia: candidate.experiencia || {
        vgv: '-', unidades: 0, torres: 0, complexidade: 'Não informada'
      },
      risco: candidate.risco || 'baixo',
      parecer: '',
      entrevista: {}
    };

    try {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) setCandidates(prev => [data[0], ...prev]);
      showNotification('Candidato cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar no banco: ' + error.message);
    }
  };

  const updateCandidate = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('candidatos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error('Erro ao atualizar:', error.message);
    }
  };

  const deleteCandidate = async (id, name = 'Candidato') => {
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCandidates(prev => prev.filter(c => c.id !== id));
      showNotification(`Candidato "${name.toUpperCase()}" removido!`, 'success');
    } catch (error) {
      showNotification('Erro ao excluir', 'error');
    }
  };

  return (
    <CandidatesContext.Provider value={{ 
      candidates, 
      loading,
      isAuthenticated, 
      login, 
      logout, 
      addCandidate, 
      updateCandidate, 
      deleteCandidate,
      globalDocTypes,
      globalQuestions,
      notification,
      showNotification,
      resetGlobalDocTypes: async () => {
        await supabase.from('config_documentos').delete().neq('key', 'null');
        setGlobalDocTypes(defaultDocs);
        showNotification('Lista restaurada!');
      },
      addGlobalDocType: async (doc) => {
        const { data, error } = await supabase.from('config_documentos').insert([doc]).select();
        if (!error && data) setGlobalDocTypes([...globalDocTypes, data[0]]);
        showNotification(`Requisito "${doc.label}" adicionado!`);
      },
      deleteGlobalDocType: async (key) => {
        await supabase.from('config_documentos').delete().eq('key', key);
        setGlobalDocTypes(globalDocTypes.filter(d => d.key !== key));
        showNotification(`Requisito removido!`, 'success');
      },
      resetGlobalQuestions: async () => {
        await supabase.from('config_perguntas').delete().neq('key', 'null');
        setGlobalQuestions(defaultQuestions);
        showNotification('Roteiro restaurado!', 'success');
      },
      addGlobalQuestion: async (q) => {
        const newQ = { ...q, key: Date.now().toString() };
        const { data, error } = await supabase.from('config_perguntas').insert([newQ]).select();
        if (!error && data) setGlobalQuestions([...globalQuestions, data[0]]);
        showNotification('Pergunta adicionada!');
      },
      updateGlobalQuestion: async (key, updates) => {
        await supabase.from('config_perguntas').update(updates).eq('key', key);
        setGlobalQuestions(prev => prev.map(q => q.key === key ? { ...q, ...updates } : q));
        showNotification('Pergunta atualizada!');
      },
      deleteGlobalQuestion: async (key) => {
        await supabase.from('config_perguntas').delete().eq('key', key);
        setGlobalQuestions(prev => prev.filter(q => q.key !== key));
        showNotification('Pergunta removida.', 'warning');
      }
    }}>
      {children}
    </CandidatesContext.Provider>
  );
};

export const useCandidates = () => useContext(CandidatesContext);
