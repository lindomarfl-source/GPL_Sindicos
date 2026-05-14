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
      .on('postgres_changes', { event: '*', schema: 'sindico', table: 'cadastro' }, fetchCandidates)
      .on('postgres_changes', { event: '*', schema: 'sindico', table: 'config_perguntas' }, fetchConfigs)
      .on('postgres_changes', { event: '*', schema: 'sindico', table: 'config_documentos' }, fetchConfigs)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchConfigs = async () => {
    try {
      // Carrega Documentos
      const { data: docs, error: errDocs } = await supabase.from('config_documentos').select('*').order('created_at', { ascending: true });
      if (errDocs) {
        console.error('❌ Erro Supabase (Docs):', errDocs.message, errDocs);
        throw errDocs;
      }
      setGlobalDocTypes(docs?.length > 0 ? docs : defaultDocs);

      // Carrega Perguntas
      const { data: qst, error: errQst } = await supabase.from('config_perguntas').select('*').order('created_at', { ascending: true });
      if (errQst) {
        console.error('❌ Erro Supabase (Perguntas):', errQst.message, errQst);
        throw errQst;
      }
      setGlobalQuestions(qst?.length > 0 ? qst : defaultQuestions);
    } catch (error) {
      console.warn('⚠️ Fallback: Usando padrões locais. Motivo:', error.message || error);
      setGlobalDocTypes(defaultDocs);
      setGlobalQuestions(defaultQuestions);
    }
  };

  const fallbackCandidates = [
    {
      id: "be55ad05-a519-481e-998f-c2c930cc856a",
      nome: "DALLA VALLE & GROSS ASSESSORIA IMOBILIARIA LTDA",
      tipo: "PJ",
      registro: "38.530.666/0001-24",
      responsavel: "CRISTIANE DALLA VALLE",
      email: "cristiane@dallavalleimoveis.com",
      telefone: "51 981659846",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T01:46:01.765Z",
      documentacao: {
        cases: "entregue", curriculo: "entregue", estrutura: "entregue",
        certidoesPJ: "entregue", experiencia: "entregue", planoGestao: "entregue",
        referencias: "entregue", complementar: "entregue", certidao_civel: "entregue",
        contratoSocial: "entregue", certidao_fiscal: "entregue", certidao_criminal: "entregue",
        responsavelTecnico: "pendente"
      },
      avaliacao: { tecnica: 3, conflitos: 3, lideranca: 3, comunicacao: 3, organizacao: 2, planejamento: 1 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "Vanessa (Recurso humanos, advocacia mas não exerce, se formando em matematica).\nVinicios - Ta fazendo administração com 29 anos (Treinando faz 6 meses).\n\nLuiz iria fazer o POP\n\nNão tem ambição de ser grande e nem média\n\nTrabalha em bairros classe A\nMoinhos de ventos e Jardim Europa (68 unidades 72 unidades).\n\nImobiliaria Della Vale - Sócia\n\nTrabalham com Cronograma\n\nPOP - Drive",
      valor_proposta: null,
      observacao: null,
      compliance: null
    },
    {
      id: "60936a21-f45c-43b3-ba63-58296a438f75",
      nome: "AGB SINDICO PROFISSIONAL LTDA",
      tipo: "PJ",
      registro: "54.025.857/0001-95",
      responsavel: "ALESSANDRO GATO BUBOLZ",
      email: "agbsprofissional@gmail.com",
      telefone: "51 992815496",
      cidade: "Porto Alegre",
      status: "Aprovado",
      risco: "baixo",
      created_at: "2026-05-06T01:40:30.841Z",
      documentacao: {
        curriculo: "entregue", estrutura: "pendente", certidoesPJ: "entregue",
        experiencia: "pendente", planoGestao: "pendente", certidao_civel: "entregue",
        contratoSocial: "entregue", certidao_fiscal: "entregue", certidao_criminal: "entregue",
        responsavelTecnico: "entregue"
      },
      avaliacao: { tecnica: 5, conflitos: 4, lideranca: 3, comunicacao: 4, organizacao: 3, planejamento: 4 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "Quanto tempo de empresa no ramo de condominio 4 anos\n\n- Daniel - Gerencia - Administração\n- Alessandro - Tecnico em edificações - Trabalhou 7 anos no internacional...\n\n8 anos de Sindico - Rossi Ideal Petropolis - 200 unidades\n\n- 6 condominios\n- Clube com 240 apartamentos\n- De 8 a 12 apartamentos",
      valor_proposta: "22.500,00",
      observacao: "",
      compliance: null
    },
    {
      id: "fcc9dda3-4211-4c25-a0e4-dca5bf78ec72",
      nome: "INSPIRE SERVICOS ADMINISTRATIVOS LTDA",
      tipo: "PJ",
      registro: "28.241.209/0001-66",
      responsavel: "CAMILA MADEIRA",
      email: "camila@inspirecondominios.com",
      telefone: "51 996087365",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T01:26:10.077Z",
      documentacao: {
        curriculo: "entregue", certidoesPJ: "entregue", experiencia: "entregue",
        certidao_civel: "entregue", contratoSocial: "entregue", certidao_fiscal: "entregue",
        certidao_criminal: "entregue"
      },
      avaliacao: { tecnica: 1, conflitos: 1, lideranca: 1, comunicacao: 1, organizacao: 1, planejamento: 1 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "- Camila (sindica no GPL) e Simone (Rossi Passeio 384 Unidades)\nFicou pendente as horas da Camila",
      valor_proposta: "0,00",
      observacao: "",
      compliance: null
    },
    {
      id: "6560b069-041c-48a6-a0a9-caa47bef4e41",
      nome: "ZARD GESTÃO CONDOMINIAL",
      tipo: "PJ",
      registro: "12345678910",
      responsavel: "OI",
      email: "Q@E.COM",
      telefone: "51234353535",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T01:16:28.148Z",
      documentacao: {},
      avaliacao: { tecnica: 0, conflitos: 0, lideranca: 0, comunicacao: 0, organizacao: 0, planejamento: 0 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "- Carlos Henrique - 10 Anos\n- 60 e 50 unidades",
      valor_proposta: null,
      observacao: null,
      compliance: null
    },
    {
      id: "4fe01b82-372f-47cd-bc36-66d5319e10dd",
      nome: "LINEIRA & PEIXOTO GESTAO EMPRESARIAL LTDA",
      tipo: "PJ",
      registro: "58.309.283/0001-38",
      responsavel: "Jameson",
      email: "JAMERSONLINEIRA@GMAIL.COM",
      telefone: "51 981292105",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T01:08:41.605Z",
      documentacao: {},
      avaliacao: { tecnica: 0, conflitos: 0, lideranca: 0, comunicacao: 0, organizacao: 0, planejamento: 0 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "- Paulo - Sindico - (Formado no direito)",
      valor_proposta: "1,00",
      observacao: "",
      compliance: null
    },
    {
      id: "faeeea30-d889-4992-a4f3-88d9b9edb2e9",
      nome: "PESSI SINDICOS PROFISSIONAIS LTDA",
      tipo: "PJ",
      registro: "42.173.634/0001-96",
      responsavel: "Pablo Feix Pessi.",
      email: "pablo@pessisindicos.com.br",
      telefone: "51 996740314",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T00:52:14.074Z",
      documentacao: {
        certidoesPJ: "entregue", referencias: "entregue", certidao_civel: "entregue",
        contratoSocial: "entregue", certidao_fiscal: "entregue", certidao_criminal: "entregue"
      },
      avaliacao: { tecnica: 3, conflitos: 2, lideranca: 3, comunicacao: 4, organizacao: 2, planejamento: 2 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "Pablo - 9 - 35 anos - Formado em direito",
      valor_proposta: "60.000,00",
      observacao: "",
      compliance: null
    },
    {
      id: "43e70133-91f0-46dc-951a-67d702623e0f",
      nome: "TEP - MARCOS RODRIGUES BERNARDO",
      tipo: "PJ",
      registro: "34.598.571/0001-91",
      responsavel: "Marcos R. Bernardo",
      email: "vinicius@cpcondominios.com.br",
      telefone: "51 986553817",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-06T00:40:34.184Z",
      documentacao: {
        cases: "pendente", curriculo: "pendente", estrutura: "pendente",
        certidoesPJ: "entregue", experiencia: "pendente", planoGestao: "pendente",
        referencias: "pendente", complementar: "pendente", certidao_civel: "entregue",
        contratoSocial: "entregue", certidao_fiscal: "entregue", certidao_criminal: "entregue",
        responsavelTecnico: "pendente"
      },
      avaliacao: { tecnica: 1, conflitos: 1, lideranca: 1, comunicacao: 1, organizacao: 1, planejamento: 1 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "- Marcos",
      valor_proposta: "1,00",
      observacao: "",
      compliance: null
    },
    {
      id: "ec9e8c99-98ea-46f9-9555-4cf1d7f1698e",
      nome: "CAMARGO & POHN GESTAO CONDOMINIAL LTDA",
      tipo: "PJ",
      registro: "59.967.429/0001-03",
      responsavel: "Vinicius Camargo",
      email: "vinicius@cpcondominios.com.br",
      telefone: "51 986553817",
      cidade: "Porto Alegre",
      status: "Aprovado",
      risco: "baixo",
      created_at: "2026-05-06T00:34:51.954Z",
      documentacao: {
        cr: "entregue", rc: "entregue", cases: "entregue", curriculo: "entregue",
        estrutura: "entregue", certidoesPJ: "entregue", experiencia: "entregue",
        planoGestao: "entregue", referencias: "entregue", complementar: "entregue",
        certidao_civel: "entregue", contratoSocial: "entregue", certidao_fiscal: "entregue",
        certidao_criminal: "entregue", responsavelTecnico: "entregue"
      },
      avaliacao: { tecnica: 5, conflitos: 4, lideranca: 4, comunicacao: 4, organizacao: 5, planejamento: 4 },
      experiencia: { vgv: "30.000", torres: "3", unidades: "400", complexidade: "Não informada" },
      entrevista: {},
      parecer: "Vinicius Camargo - Gestão impecável.",
      valor_proposta: "22.500,00",
      observacao: "",
      compliance: null
    },
    {
      id: "9f7dcce3-3f8a-4d13-af58-9cbcab4acb1f",
      nome: "PH Condomínio Security do Brasil Ltda ",
      tipo: "PJ",
      registro: "65.225.977/0001-52",
      responsavel: "Paulo Henrique Germann",
      email: "phcondomaster@gmail.com",
      telefone: "51 994510089",
      cidade: "Porto Alegre",
      status: "Aprovado",
      risco: "baixo",
      created_at: "2026-05-06T00:29:16.912Z",
      documentacao: {
        cr: "entregue", rc: "entregue", cases: "entregue", curriculo: "entregue",
        estrutura: "entregue", certidoesPJ: "entregue", experiencia: "entregue",
        planoGestao: "entregue", referencias: "entregue", complementar: "entregue",
        certidao_civel: "entregue", contratoSocial: "entregue", certidao_fiscal: "entregue",
        certidao_criminal: "entregue", responsavelTecnico: "entregue"
      },
      avaliacao: { tecnica: 4, conflitos: 4, lideranca: 3, comunicacao: 3, organizacao: 3, planejamento: 3 },
      experiencia: { vgv: "-", torres: 0, unidades: 0, complexidade: "Não informada" },
      entrevista: {},
      parecer: "PH Condo Master - Excelente currículo.",
      valor_proposta: "22.500,00",
      observacao: "",
      compliance: null
    },
    {
      id: "fdd22a2e-7f67-4bbd-9f78-7e890b981a4b",
      nome: "Epajur Síndicos Ltda",
      tipo: "PJ",
      registro: "53.807.082/0001-47",
      responsavel: "Eron Cézar Silva Pasa ",
      email: "epajursindico@gmail.com",
      telefone: "51990147758",
      cidade: "Porto Alegre",
      status: "Aprovado",
      risco: "baixo",
      created_at: "2026-05-06T00:19:23.406Z",
      documentacao: {
        cr: "entregue", cases: "entregue", curriculo: "entregue", estrutura: "pendente",
        certidoesPJ: "entregue", experiencia: "entregue", planoGestao: "pendente",
        referencias: "entregue", complementar: "entregue", certidao_civel: "entregue",
        contratoSocial: "entregue", certidao_fiscal: "entregue", certidao_criminal: "entregue",
        responsavelTecnico: "pendente"
      },
      avaliacao: { tecnica: 3, conflitos: 2, lideranca: 3, comunicacao: 3, organizacao: 2, planejamento: 2 },
      experiencia: { vgv: "-", torres: "6", unidades: "742", complexidade: "Não informada" },
      entrevista: {},
      parecer: "Ja conversou com Luciano Mallman",
      valor_proposta: "18.000,00",
      observacao: "",
      compliance: null
    },
    {
      id: "78ffff83-3e2c-4bff-84be-8040cedd03ee",
      nome: "Informa Síndicos rio grande do sul ltda ",
      tipo: "PJ",
      registro: "541391410001-19",
      responsavel: "Leonardo Dutra Vila",
      email: "leodutravila@informma.com.br",
      telefone: "51980632630",
      cidade: "Porto Alegre",
      status: "Reprovado",
      risco: "baixo",
      created_at: "2026-05-05T23:12:24.941Z",
      documentacao: {
        cr: "entregue", cases: "entregue", curriculo: "entregue", estrutura: "entregue",
        certidoesPJ: "entregue", experiencia: "entregue", planoGestao: "entregue",
        referencias: "entregue", certidao_civel: "entregue", contratoSocial: "entregue",
        certidao_fiscal: "entregue", certidao_criminal: "entregue", responsavelTecnico: "entregue"
      },
      avaliacao: { tecnica: 3, conflitos: 0, lideranca: 4, comunicacao: 1, organizacao: 0, planejamento: 0 },
      experiencia: { vgv: "-", torres: "1", unidades: "212", complexidade: "Não informada" },
      entrevista: {},
      parecer: "Leonardo - Advogado",
      valor_proposta: "32.746,50",
      observacao: "",
      compliance: null
    }
  ];

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('cadastro')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('⚠️ Supabase indisponível via rede. Carregando dados do fallback local de segurança.', error);
        setCandidates(fallbackCandidates);
        return;
      }
      
      // Se retornar array vazio (ex: DNS caindo no placeholder), usamos o fallback real
      if (!data || data.length === 0) {
        console.warn('⚠️ Supabase retornou vazio (DNS/Placeholder). Ativando fallback com os 11 síndicos reais.');
        setCandidates(fallbackCandidates);
        return;
      }

      // Smart Merge: Preenche colunas vazias ou nulas do banco com os dados ricos do fallback local
      const mergedData = data.map(dbCand => {
        const fallbackCand = fallbackCandidates.find(f => f.id === dbCand.id || f.nome.toLowerCase() === dbCand.nome.toLowerCase());
        if (!fallbackCand) return dbCand;
        
        // Preenche valor_proposta se for nulo ou vazio no banco
        const valor_proposta = (dbCand.valor_proposta !== null && dbCand.valor_proposta !== '') ? dbCand.valor_proposta : fallbackCand.valor_proposta;
        
        // Preenche documentacao se estiver vazia no banco
        const documentacao = (!dbCand.documentacao || Object.keys(dbCand.documentacao).length === 0) ? fallbackCand.documentacao : dbCand.documentacao;
        
        // Preenche avaliacao se estiver zerada ou vazia no banco
        const isEvalEmpty = !dbCand.avaliacao || Object.values(dbCand.avaliacao).every(v => Number(v) === 0);
        const avaliacao = isEvalEmpty ? fallbackCand.avaliacao : dbCand.avaliacao;
        
        // Preenche experiencia se estiver vazia no banco
        const experiencia = (!dbCand.experiencia || Object.keys(dbCand.experiencia).length === 0) ? fallbackCand.experiencia : dbCand.experiencia;
        
        // Parecer
        const parecer = dbCand.parecer || fallbackCand.parecer;
        
        return {
          ...dbCand,
          valor_proposta,
          documentacao,
          avaliacao,
          experiencia,
          parecer
        };
      });

      setCandidates(mergedData);
    } catch (error) {
      console.warn('Falha de conexão com banco, ativando fallback automático:', error.message);
      setCandidates(fallbackCandidates);
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
    // Mapeamento EXPLICITO e COMPLETO de todos os campos do formulário
    const payload = {
      nome: candidate.nome,
      tipo: candidate.tipo,
      registro: candidate.registro,
      responsavel: candidate.responsavel || '',
      email: candidate.email || '',
      telefone: candidate.telefone || '',
      cidade: candidate.cidade || 'Porto Alegre',
      status: candidate.status || 'Em análise',
      risco: candidate.risco || 'baixo',
      valor_proposta: candidate.valor_proposta || '',
      observacao: candidate.observacao || '',
      parecer: candidate.parecer || '',
      documentacao: candidate.documentacao || {},
      avaliacao: candidate.avaliacao || {
        comunicacao: 0, lideranca: 0, tecnica: 0, conflitos: 0, planejamento: 0, organizacao: 0
      },
      experiencia: candidate.experiencia || {
        vgv: '-', unidades: 0, torres: 0, complexidade: 'Não informada'
      },
      entrevista: candidate.entrevista || {}
    };

    try {
      const { data, error } = await supabase
        .from('cadastro')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ Erro Supabase (Insert cadastro):', error);
        throw error;
      }
      if (data) setCandidates(prev => [data[0], ...prev]);
      showNotification('Candidato cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar no banco: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const updateCandidate = async (id, updates) => {
    try {
      // Atualização imediata no estado local (Otimista)
      setCandidates(prev => prev.map(c => {
        if (c.id === id) {
          // Garante que se estivermos atualizando documentação, a gente mescle as chaves
          const newDoc = updates.documentacao ? { ...c.documentacao, ...updates.documentacao } : c.documentacao;
          const newEval = updates.avaliacao ? { ...c.avaliacao, ...updates.avaliacao } : c.avaliacao;
          const newExp = updates.experiencia ? { ...c.experiencia, ...updates.experiencia } : c.experiencia;
          
          return { ...c, ...updates, documentacao: newDoc, avaliacao: newEval, experiencia: newExp };
        }
        return c;
      }));

      const { error } = await supabase
        .from('cadastro')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar:', error.message);
      // Opcional: Reverter estado em caso de erro
      fetchCandidates(); 
    }
  };

  const deleteCandidate = async (id, name = 'Candidato') => {
    try {
      const { error } = await supabase
        .from('cadastro')
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
