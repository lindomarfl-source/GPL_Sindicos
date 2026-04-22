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
    { key: 'certidoes', label: 'Certidões Negativas (Cível, Criminal, Fiscal)', category: 'Obrigatórios' },
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
    
    // Opcional: Escutar mudanças em tempo real
    const subscription = supabase
      .channel('candidatos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatos' }, (payload) => {
        console.log('🔄 Mudança detectada no banco:', payload.eventType);
        fetchCandidates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      console.log('📡 Iniciando busca de candidatos no Supabase...');
      const { data, error } = await supabase
        .from('candidatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na busca do Supabase:', error.message);
        throw error;
      }
      
      console.log('✅ Busca finalizada. Candidatos encontrados:', data?.length || 0);
      setCandidates(data || []);
    } catch (error) {
      console.error('💥 Falha crítica no fetch:', error.message);
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
    const newCandidate = {
      nome: candidate.nome,
      tipo: candidate.tipo,
      registro: candidate.registro,
      responsavel: candidate.responsavel,
      email: candidate.email,
      status: 'Em análise',
      documentacao: candidate.documentacao || {},
      avaliacao: candidate.avaliacao || {
        comunicacao: 0, lideranca: 0, tecnica: 0, conflitos: 0, planejamento: 0, organizacao: 0
      },
      experiencia: candidate.experiencia || {
        vgv: '-', unidades: 0, torres: 0, complexidade: 'Não informada'
      },
      risco: candidate.risco || 'moderado',
      parecer: '',
      entrevista: {}
    };

    try {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([newCandidate])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setCandidates(prev => [data[0], ...prev]);
      }
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
      showNotification(`Candidato "${name.toUpperCase()}" removido com sucesso!`, 'success');
    } catch (error) {
      showNotification('Erro ao excluir do banco', 'error');
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
      resetGlobalDocTypes: () => {
        setGlobalDocTypes(defaultDocs);
        showNotification('Lista de documentos restaurada!');
      },
      addGlobalDocType: (doc) => {
        setGlobalDocTypes([...globalDocTypes, doc]);
        showNotification(`Novo requisito "${doc.label}" adicionado!`);
      },
      deleteGlobalDocType: (key, label = 'Requisito') => {
        setGlobalDocTypes(globalDocTypes.filter(d => d.key !== key));
        showNotification(`Requisito "${label}" removido com sucesso!`, 'success');
      },
      resetGlobalQuestions: () => {
        setGlobalQuestions(defaultQuestions);
        showNotification('Roteiro de entrevista restaurado!', 'success');
      },
      addGlobalQuestion: (q) => {
        setGlobalQuestions([...globalQuestions, { ...q, key: Date.now().toString() }]);
        showNotification('Nova pergunta adicionada ao roteiro!');
      },
      updateGlobalQuestion: (key, updates) => {
        setGlobalQuestions(prev => prev.map(q => q.key === key ? { ...q, ...updates } : q));
        showNotification('Pergunta atualizada!');
      },
      deleteGlobalQuestion: (key) => {
        setGlobalQuestions(prev => prev.filter(q => q.key !== key));
        showNotification('Pergunta removida do roteiro.', 'warning');
      }
    }}>
      {children}
    </CandidatesContext.Provider>
  );
};

export const useCandidates = () => useContext(CandidatesContext);
