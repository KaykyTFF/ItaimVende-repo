/**
 * ITAIM VENDE - LISTA OFICIAL E ROBUSTA DE CATEGORIAS
 * Arquivo: frontend/js/core/categorias/categorias-lista.js
 * 
 * Taxonomia completa para o comércio regional do Vale do Itaim e semiárido:
 * - Chave canônica para URLs e parâmetros (?cat=...)
 * - Nome amigável para exibição
 * - Slug unificado para banco de dados e APIs
 * - Ícones FontAwesome e classes semânticas
 * - Subcategorias hierárquicas
 * - Aliases fonéticos e sinônimos para tolerância em buscas
 */

const CATEGORIAS = [
    {
        chave: 'Veículos',
        nome: 'Veículos & Autopeças',
        slug: 'veiculos',
        icone: 'fa-car',
        descricao: 'Carros, motos, caminhões, autopeças, pneus e acessórios automotivos.',
        subcategorias: [
            'Carros & Utilitários',
            'Motos & Scooters',
            'Caminhões & Carretas',
            'Peças Automotivas',
            'Pneus, Rodas & Calotas',
            'Som & Acessórios Automotivos',
            'Barcos & Náutica'
        ],
        aliases: ['Veículos', 'Veículos & Peças', 'Veículos & Autopeças', 'Carros', 'Motos', 'Automóveis', 'Peças', 'Caminhões', 'Pneus', 'Som Automotivo']
    },
    {
        chave: 'Imóveis',
        nome: 'Imóveis & Terrenos',
        slug: 'imoveis',
        icone: 'fa-house',
        descricao: 'Casas, apartamentos, terrenos, lotes, chácaras, fazendas para venda e locação.',
        subcategorias: [
            'Casas para Comprar',
            'Casas & Quartos para Alugar',
            'Apartamentos & Studios',
            'Terrenos & Lotes Urbanos',
            'Chácaras, Sítios & Fazendas',
            'Pontos Comerciais & Galpões'
        ],
        aliases: ['Imóveis', 'Imóveis & Terrenos', 'Casas', 'Terrenos', 'Lotes', 'Sítios', 'Chácaras', 'Fazendas', 'Aluguel', 'Venda de Imóveis', 'Ponto Comercial']
    },
    {
        chave: 'Agro',
        nome: 'Agro & Pecuária',
        slug: 'agro',
        icone: 'fa-tractor',
        descricao: 'Animais de criação, caprinos, ovinos, gado, rações, tratores e máquinas agrícolas.',
        subcategorias: [
            'Caprinos & Ovinos (Bodes, Carneiros)',
            'Bovinos & Gado de Corte/Leite',
            'Aves, Frangos & Ovos',
            'Suínos & Porcos',
            'Equinos, Cavalos & Burros',
            'Tratores, Carretas & Máquinas Agrícolas',
            'Rações, Feno, Silagem & Nutrição',
            'Sementes, Mudas & Adubos',
            'Cercas, Arame & Equipamentos Rurais'
        ],
        aliases: ['Agro', 'Agro & Animais', 'Agro & Pecuária', 'Animais', 'Fazenda', 'Agricultura', 'Pecuária', 'Caprinos', 'Ovinos', 'Bodes', 'Carneiros', 'Gado', 'Trator', 'Ração']
    },
    {
        chave: 'Celulares',
        nome: 'Celulares & Telefonia',
        slug: 'celulares',
        icone: 'fa-mobile-screen',
        descricao: 'Smartphones, iPhones, acessórios, cabos, películas e smartwatches.',
        subcategorias: [
            'iPhones (Apple)',
            'Smartphones Android (Samsung, Xiaomi, Motorola)',
            'Capinhas, Películas & Suportes',
            'Carregadores, Cabos & Fontes',
            'Fones de Ouvido & Caixinhas',
            'Smartwatches & Smartbands',
            'Peças, Telas & Baterias'
        ],
        aliases: ['Celulares', 'Celulares e Smartphones', 'Telefonia', 'Smartphones', 'iPhone', 'Android', 'Samsung', 'Xiaomi', 'Motorola', 'Carregador', 'Capinha']
    },
    {
        chave: 'Eletrônicos',
        nome: 'Eletrônicos, Áudio & Vídeo',
        slug: 'eletronicos',
        icone: 'fa-tv',
        descricao: 'Smart TVs, caixas de som, fones bluetooth, câmeras e áudio de alta potência.',
        subcategorias: [
            'Smart TVs & Telas',
            'Caixas de Som & Soundbars (JBL e similares)',
            'Fones Bluetooth & Headphones',
            'Aparelhos de Som & Microfones',
            'Câmeras, Filmadoras & Drones',
            'Projetores & Telões',
            'Conversores, TV Box & Receptores'
        ],
        aliases: ['Eletrônicos', 'Eletrônicos & Celulares', 'Eletrônicos e Áudio', 'Áudio e Vídeo', 'Smart TV', 'TV', 'Caixa de Som', 'Som', 'JBL', 'Home Theater', 'Tecnologia']
    },
    {
        chave: 'Informática',
        nome: 'Informática & Games',
        slug: 'informatica',
        icone: 'fa-laptop',
        descricao: 'Notebooks, computadores, monitores, consoles de videogame e peças para PC.',
        subcategorias: [
            'Notebooks & Laptops',
            'Computadores Desktop & PCs Gamer',
            'Monitores & Telas',
            'Consoles (PlayStation, Xbox, Nintendo)',
            'Jogos & Mídias Físicas',
            'Teclados, Mouses & Headsets',
            'Placas de Vídeo, Memória & SSDs',
            'Impressoras, Tintas & Scanners'
        ],
        aliases: ['Informática', 'Informática & Games', 'Computadores e Informática', 'Informática & PC', 'Games', 'Jogos', 'Notebook', 'PC', 'Computador', 'PlayStation', 'Xbox', 'Nintendo']
    },
    {
        chave: 'Móveis',
        nome: 'Casa, Móveis & Decoração',
        slug: 'moveis',
        icone: 'fa-couch',
        descricao: 'Móveis para sala, quarto, cozinha, decoração e artigos de cama, mesa e banho.',
        subcategorias: [
            'Sofás, Poltronas & Puffs',
            'Camas, Box & Colchões',
            'Guarda-Roupas, Cômodas & Armários',
            'Mesas, Cadeiras & Banquetas',
            'Armários de Cozinha & Balcões',
            'Painéis para TV & Racks',
            'Tapetes, Cortinas & Persianas',
            'Quadros, Espelhos & Enfeites',
            'Cama, Mesa & Banho'
        ],
        aliases: ['Móveis', 'Móveis & Casa', 'Móveis e Decoração', 'Decoração', 'Decoração & Casa', 'Casa', 'Sofá', 'Cama', 'Mesa', 'Armário', 'Cortina', 'Tapete', 'Cama Mesa e Banho']
    },
    {
        chave: 'Eletrodomésticos',
        nome: 'Eletrodomésticos',
        slug: 'eletrodomesticos',
        icone: 'fa-blender',
        descricao: 'Geladeiras, fogões, máquinas de lavar, ar-condicionado e eletroportáteis.',
        subcategorias: [
            'Geladeiras, Refrigeradores & Freezers',
            'Fogões, Cooktops & Fornos',
            'Máquinas de Lavar, Tanquinhos & Secadoras',
            'Ar-condicionado & Climatizadores',
            'Ventiladores & Circuladores de Ar',
            'Micro-ondas & Fornos Elétricos',
            'Airfryers, Fritadeiras & Grills',
            'Liquidificadores, Batedeiras & Cafeteiras'
        ],
        aliases: ['Eletrodomésticos', 'Geladeira', 'Freezer', 'Fogão', 'Lavadora', 'Máquina de Lavar', 'Ar Condicionado', 'Ventilador', 'Airfryer', 'Micro-ondas', 'Eletroportáteis']
    },
    {
        chave: 'Moda',
        nome: 'Moda, Calçados & Acessórios',
        slug: 'moda',
        icone: 'fa-shirt',
        descricao: 'Roupas masculinas, femininas, calçados, bolsas, relógios e joias.',
        subcategorias: [
            'Roupas Femininas (Vestidos, Blusas, Calças)',
            'Roupas Masculinas (Camisas, Bermudas, Calças)',
            'Calçados Femininos (Sandálias, Saltos, Tênis)',
            'Calçados Masculinos (Tênis, Botas, Sapatos)',
            'Bolsas, Mochilas & Malas',
            'Relógios, Joias, Semijoias & Bijuterias',
            'Óculos de Sol & Armações',
            'Cintos, Bonés, Chapéus & Carteiras'
        ],
        aliases: ['Moda', 'Moda & Vestuário', 'Moda e Acessórios', 'Moda e Calçados', 'Roupas', 'Vestuário', 'Calçados', 'Tênis', 'Sandálias', 'Bolsas', 'Relógios', 'Bijuterias', 'Acessórios']
    },
    {
        chave: 'Beleza',
        nome: 'Beleza & Cuidado Pessoal',
        slug: 'beleza',
        icone: 'fa-spray-can-sparkles',
        descricao: 'Perfumes, maquiagens, cuidados para cabelo, pele e aparelhos de beleza.',
        subcategorias: [
            'Perfumes Importados & Nacionais',
            'Maquiagem & Pincéis',
            'Cuidados com a Pele (Skincare)',
            'Produtos para Cabelo (Shampoos, Máscaras)',
            'Secadores, Chapinhas, Pranchas & Modeladores',
            'Máquinas de Cortar Cabelo & Barbeadores',
            'Esmaltes, Manicure & Pedicure'
        ],
        aliases: ['Beleza', 'Beleza & Cuidado Pessoal', 'Cosméticos', 'Perfumes', 'Perfumes e Cosméticos', 'Maquiagem', 'Skincare', 'Cabelo', 'Secador', 'Chapinha', 'Barbeador']
    },
    {
        chave: 'Infantil',
        nome: 'Infantil & Bebês',
        slug: 'infantil',
        icone: 'fa-baby',
        descricao: 'Carrinhos, berços, roupas infantis, fraldas, brinquedos e acessórios para bebê.',
        subcategorias: [
            'Carrinhos de Bebê & Moisés',
            'Berços, Cercados & Cômodas Infantis',
            'Cadeirinhas para Carro & Bebê Conforto',
            'Roupas para Bebês & Crianças',
            'Calçados Infantis',
            'Brinquedos, Jogos & Bonecas',
            'Fraldas, Banheiras & Acessórios de Cuidados'
        ],
        aliases: ['Infantil', 'Infantil & Brinquedos', 'Infantil & Bebês', 'Bebês', 'Crianças', 'Brinquedos', 'Carrinho de Bebê', 'Berço', 'Cadeirinha', 'Enxoval']
    },
    {
        chave: 'Esportes',
        nome: 'Esportes, Fitness & Lazer',
        slug: 'esportes',
        icone: 'fa-bicycle',
        descricao: 'Bicicletas, artigos de futebol, musculação, academia, pesca e camping.',
        subcategorias: [
            'Bicicletas, Acessórios & Peças de Bike',
            'Artigos de Futebol, Bolas, Chuteiras & Camisas',
            'Equipamentos de Musculação & Halteres',
            'Suplementos & Vitaminas',
            'Pesca, Varas, Molinetes & Iscas',
            'Camping, Barracas & Colchões Infláveis',
            'Piscinas, Boias & Artigos Aquáticos'
        ],
        aliases: ['Esportes', 'Esportes & Lazer', 'Esportes, Fitness & Lazer', 'Bicicletas', 'Bike', 'Fitness', 'Ciclismo', 'Academia', 'Musculação', 'Futebol', 'Pesca', 'Camping']
    },
    {
        chave: 'Construção',
        nome: 'Construção & Ferramentas',
        slug: 'construcao',
        icone: 'fa-hammer',
        descricao: 'Ferramentas elétricas, manuais, tintas, materiais de obra e ferragens.',
        subcategorias: [
            'Ferramentas Elétricas (Furadeiras, Serras, Lixadeiras)',
            'Ferramentas Manuais (Chaves, Alicates, Martelos)',
            'Tintas, Vernizes, Pincéis & Rolos',
            'Materiais de Construção (Cimento, Tijolos, Pisos)',
            'Material Elétrico, Fios, Disjuntores & Lâmpadas',
            'Tubos, Conexões & Material Hidráulico',
            'Escadas, Andaimes & Carrinhos de Mão'
        ],
        aliases: ['Construção', 'Construção & Ferramentas', 'Ferramentas', 'Materiais de Construção', 'Obras', 'Reforma', 'Furadeira', 'Tintas', 'Elétrica', 'Hidráulica', 'Ferragens']
    },
    {
        chave: 'Comércio',
        nome: 'Comércio, Negócios & Escritório',
        slug: 'comercio',
        icone: 'fa-store',
        descricao: 'Balcões, freezers comerciais, estantes, gôndolas, maquinetas e móveis comerciais.',
        subcategorias: [
            'Balcões, Vitrines & Expositores',
            'Freezers & Geladeiras Comerciais',
            'Chapas, Estufas, Fornos & Cozinha Comercial',
            'Balanças, Maquinetas & Caixas Registradoras',
            'Móveis para Escritório (Mesas, Cadeiras Giratórias)',
            'Lotes & Estoques para Revenda'
        ],
        aliases: ['Comércio', 'Comércio & Negócios', 'Comércio, Negócios & Escritório', 'Negócios', 'Escritório', 'Comercial', 'Balcão', 'Vitrine', 'Freezer Comercial', 'Balança', 'Lotes']
    },
    {
        chave: 'Serviços',
        nome: 'Serviços & Profissionais',
        slug: 'servicos',
        icone: 'fa-briefcase',
        descricao: 'Pedreiros, pintores, fretes, carretos, mecânicos, eletricistas e serviços em geral.',
        subcategorias: [
            'Pedreiros, Pintores & Reformas',
            'Fretes, Mudanças, Carretos & Viagens',
            'Mecânica, Funilaria & Elétrica Automotiva',
            'Eletricistas, Encanadores & Montadores',
            'Assistência Técnica (Celulares, Eletrônicos, PCs)',
            'Aulas Particulares, Cursos & Consultorias',
            'Festas, Eventos, Buffets, Bolos & Salgados',
            'Limpeza, Diaristas & Cuidados Pessoais'
        ],
        aliases: ['Serviços', 'Serviços & Negócios', 'Serviços e Trabalhos', 'Serviços & Profissionais', 'Profissionais', 'Trabalhos', 'Empregos', 'Frete', 'Mudança', 'Reforma', 'Mecânico', 'Eletricista']
    },
    {
        chave: 'Hobbies',
        nome: 'Música, Arte & Hobbies',
        slug: 'hobbies',
        icone: 'fa-guitar',
        descricao: 'Instrumentos musicais, violões, teclados, livros, artesanato e coleções.',
        subcategorias: [
            'Violões, Guitarras, Baixos & Cordas',
            'Teclados, Pianos & Órgãos',
            'Caixas de Som & Áudio para Músicos',
            'Livros, Revistas, Mangás & HQs',
            'Artesanato, Crochê, Biscuit & Pinturas',
            'Antiguidades, Cédulas, Moedas & Colecionáveis'
        ],
        aliases: ['Hobbies', 'Hobbies & Games', 'Música', 'Música & Instrumentos', 'Música, Arte & Hobbies', 'Instrumentos', 'Violão', 'Teclado', 'Guitarra', 'Livros', 'Arte', 'Artesanato', 'Coleções']
    },
    {
        chave: 'Pets',
        nome: 'Animais de Estimação & Pet Shop',
        slug: 'pets',
        icone: 'fa-paw',
        descricao: 'Cachorros, gatos, pássaros, rações, casinhas, coleiras e acessórios pet.',
        subcategorias: [
            'Cachorros & Filhotes',
            'Gatos & Filhotes',
            'Pássaros, Gaiolas & Viveiros',
            'Peixes, Aquários & Bombas',
            'Rações, Petiscos & Vitaminas Pet',
            'Casinhas, Caminhas, Caixas de Transporte',
            'Coleiras, Guias, Roupinhas & Brinquedos Pet'
        ],
        aliases: ['Pets', 'Animais de Estimação', 'Animais de Estimação & Pet Shop', 'Pet Shop', 'Cachorros', 'Gatos', 'Filhotes', 'Ração Pet', 'Aquário', 'Passarinhos']
    },
    {
        chave: 'Doações',
        nome: 'Doações, Trocas & Solidariedade',
        slug: 'doacoes',
        icone: 'fa-hand-holding-heart',
        descricao: 'Itens gratuitos para doação, trocas diretas, permutas e apoio comunitário.',
        subcategorias: [
            'Doações Gratuitas (Desapego Social)',
            'Trocas & Permutas (Aceito Troca)',
            'Campanhas Solidárias & Ajuda Comunitária'
        ],
        aliases: ['Doações', 'Doação', 'Doações & Trocas', 'Doações, Trocas & Solidariedade', 'Trocas', 'Permuta', 'Grátis', 'Solidariedade', 'Desapego']
    },
    {
        chave: 'Outros',
        nome: 'Outros & Diversos',
        slug: 'outros',
        icone: 'fa-boxes-stacked',
        descricao: 'Itens variados, utilidades gerais, achados e bazar comunitário.',
        subcategorias: [
            'Utilidades do Dia a Dia',
            'Bazar & Garimpo Geral',
            'Lotes & Saldões Diversos'
        ],
        aliases: ['Outros', 'Outros & Geral', 'Outros & Diversos', 'Outros Produtos', 'Geral', 'Diversos', 'Bazar', 'Variados']
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORIAS };
}
