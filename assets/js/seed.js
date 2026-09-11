/* Popula dados mockados no primeiro carregamento (2 imóveis, corretores e 1 cliente de teste) */
async function garantirSeed() {
  if (localStorage.getItem(DB_KEYS.SEED_FLAG)) return;

  const senhaPadraoHash = await hashSenha('123456');

  salvarAdmin({
    nome: 'Administrador',
    email: 'adm@email.com',
    senha: await hashSenha('adm@senha.com')
  });

  const corretores = [
    {
      id: 1,
      foto: 'src/img_corretor/foto1.svg',
      nome: 'Ana Souza',
      telefone: '(86) 99123-4567',
      cpf: '123.456.789-01',
      dataNascimento: '1990-04-12',
      creci: '123456-PI',
      email: 'ana@email.com',
      senha: senhaPadraoHash
    },
    {
      id: 2,
      foto: 'src/img_corretor/foto2.svg',
      nome: 'Carlos Lima',
      telefone: '(86) 98877-2233',
      cpf: '987.654.321-00',
      dataNascimento: '1985-11-03',
      creci: '654321-PI',
      email: 'carlos@email.com',
      senha: senhaPadraoHash
    }
  ];

  const clientes = [
    {
      id: 1,
      nome: 'Mariana Alves',
      telefone: '(86) 99988-7766',
      cpf: '111.222.333-44',
      dataNascimento: '1996-07-22',
      email: 'cliente@email.com',
      senha: senhaPadraoHash
    }
  ];

  const imoveis = [
    {
      id: 1,
      corretorId: 1,
      tipo: 'Apartamento',
      bairro: 'Centro',
      preco: 350000,
      quartos: 2,
      vagas: 1,
      areaM2: 65,
      status: 'ativo',
      caracteristicas: ['Piscina', 'Portaria 24h', 'Academia'],
      fotos: [
        'src/img_imovel_1/foto1.svg',
        'src/img_imovel_1/foto2.svg',
        'src/img_imovel_1/foto3.svg'
      ]
    },
    {
      id: 2,
      corretorId: 2,
      tipo: 'Casa',
      bairro: 'Jardim das Flores',
      preco: 620000,
      quartos: 3,
      vagas: 2,
      areaM2: 180,
      status: 'ativo',
      caracteristicas: ['Quintal amplo', 'Churrasqueira', 'Garagem coberta'],
      fotos: [
        'src/img_imovel_2/foto1.svg',
        'src/img_imovel_2/foto2.svg',
        'src/img_imovel_2/foto3.svg'
      ]
    }
  ];

  const mensagens = [
    {
      id: 1,
      imovelId: 1,
      clienteId: 1,
      corretorId: 1,
      texto: 'Olá! Esse apartamento no Centro ainda está disponível? Gostaria de agendar uma visita.',
      remetente: 'cliente',
      data: new Date().toISOString(),
      lida: false
    }
  ];

  dbSetAll(DB_KEYS.CORRETORES, corretores);
  dbSetAll(DB_KEYS.CLIENTES, clientes);
  dbSetAll(DB_KEYS.IMOVEIS, imoveis);
  dbSetAll(DB_KEYS.MENSAGENS, mensagens);
  localStorage.setItem(DB_KEYS.SEED_FLAG, '1');
}
