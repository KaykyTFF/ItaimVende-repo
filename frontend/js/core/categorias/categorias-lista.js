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
        nome: 'Veículos',
        slug: 'veiculos',
        icone: 'fa-car',
        descricao: 'Carros, motos, caminhões, utilitários, carretas, barcos e veículos em geral.',
        subcategorias: [
            'Carros & Utilitários',
            'Motos & Scooters',
            'Caminhões & Vans',
            'Carretas & Reboques',
            'Barcos & Náutica'
        ],
        aliases: ['Veículos', 'Veiculos', 'Veículos & Autopeças', 'Carros', 'Motos', 'Automóveis', 'Caminhões', 'Carretas']
    },
    {
        chave: 'Autopeças',
        nome: 'Autopeças',
        slug: 'autopecas',
        icone: 'fa-gears',
        descricao: 'Peças automotivas, pneus, rodas, som automotivo e acessórios para carros e motos.',
        subcategorias: [
            'Peças para Carros',
            'Peças para Motos',
            'Pneus, Rodas & Calotas',
            'Som & Acessórios Automotivos',
            'Baterias & Iluminação Automotiva',
            'Óleos, Filtros & Fluidos'
        ],
        aliases: ['Autopeças', 'Autopecas', 'Peças', 'Peças Automotivas', 'Acessórios Automotivos', 'Veículos & Autopeças', 'Pneus', 'Som Automotivo']
    },
    {
        chave: 'Imóveis',
        nome: 'Imóveis',
        slug: 'imoveis',
        icone: 'fa-house',
        descricao: 'Casas, apartamentos, kitnets, quartos e pontos comerciais para venda e locação.',
        subcategorias: [
            'Casas para Comprar',
            'Casas & Quartos para Alugar',
            'Apartamentos & Studios',
            'Pontos Comerciais & Galpões',
            'Chácaras & Sítios'
        ],
        aliases: ['Imóveis', 'Imoveis', 'Imóveis & Terrenos', 'Casas', 'Apartamentos', 'Aluguel', 'Venda de Imóveis', 'Ponto Comercial']
    },
    {
        chave: 'Terrenos',
        nome: 'Terrenos',
        slug: 'terrenos',
        icone: 'fa-map-location-dot',
        descricao: 'Lotes urbanos, terrenos em condomínio, áreas comerciais, fazendas e glebas de terra.',
        subcategorias: [
            'Lotes Urbanos',
            'Terrenos Residenciais',
            'Terrenos Comerciais & Industriais',
            'Fazendas & Grandes Áreas',
            'Áreas Rurais & Glebas'
        ],
        aliases: ['Terrenos', 'Lotes', 'Lote', 'Imóveis & Terrenos', 'Fazendas', 'Chácaras', 'Áreas Rurais', 'Glebas']
    },
    {
        chave: 'Agro',
        nome: 'Agro',
        slug: 'agro',
        icone: 'fa-tractor',
        descricao: 'Tratores, máquinas agrícolas, sementes, rações, feno, insumos e equipamentos rurais.',
        subcategorias: [
            'Tratores & Máquinas Agrícolas',
            'Implementos & Carretas Rurais',
            'Rações, Feno, Silagem & Nutrição Animal',
            'Sementes, Mudas & Adubos',
            'Cercas, Arame & Equipamentos Rurais',
            'Irrigação & Bombas de Água'
        ],
        aliases: ['Agro', 'Agricultura', 'Agro & Pecuária', 'Agropecuária', 'Trator', 'Ração', 'Feno', 'Sementes', 'Adubo']
    },
    {
        chave: 'Pecuária',
        nome: 'Pecuária',
        slug: 'pecuaria',
        icone: 'fa-cow',
        descricao: 'Caprinos, ovinos, bovinos, equinos, suínos e animais de criação para reprodução e abate.',
        subcategorias: [
            'Caprinos & Ovinos (Bodes, Carneiros, Ovelhas)',
            'Bovinos & Gado de Corte/Leite',
            'Equinos & Cavalos',
            'Suínos & Porcos',
            'Aves de Criação (Frangos, Galinhas Caipiras, Patos)',
            'Peixes para Criação (Alevinos)'
        ],
        aliases: ['Pecuária', 'Pecuaria', 'Animais de Criação', 'Agro & Pecuária', 'Bodes', 'Carneiros', 'Gado', 'Cavalos', 'Porcos', 'Caprinos', 'Ovinos']
    },
    {
        chave: 'Celulares',
        nome: 'Celulares',
        slug: 'celulares',
        icone: 'fa-mobile-screen',
        descricao: 'Smartphones, iPhones, aparelhos celulares e peças de reposição.',
        subcategorias: [
            'iPhones (Apple)',
            'Smartphones Samsung Galaxy',
            'Smartphones Xiaomi & Redmi',
            'Smartphones Motorola & Outras Marcas',
            'Peças, Telas & Baterias de Celular'
        ],
        aliases: ['Celulares', 'Celular', 'Celulares & Telefonia', 'Smartphones', 'iPhone', 'Android', 'Samsung', 'Xiaomi', 'Motorola']
    },
    {
        chave: 'Telefonia',
        nome: 'Telefonia',
        slug: 'telefonia',
        icone: 'fa-phone',
        descricao: 'Capinhas, películas, carregadores, cabos, smartwatches e acessórios de telefonia.',
        subcategorias: [
            'Capinhas, Películas & Suportes',
            'Carregadores, Cabos & Fontes',
            'Smartwatches & Smartbands',
            'Fones de Ouvido para Celular',
            'Rádios Comunicadores & Telefonia Fixa'
        ],
        aliases: ['Telefonia', 'Acessórios para Celular', 'Capinhas', 'Carregadores', 'Smartwatch', 'Películas', 'Celulares & Telefonia']
    },
    {
        chave: 'Eletrônicos',
        nome: 'Eletrônicos',
        slug: 'eletronicos',
        icone: 'fa-tv',
        descricao: 'Smart TVs, telas, câmeras, filmadoras, drones, projetores e TV Box.',
        subcategorias: [
            'Smart TVs & Telas',
            'Câmeras, Filmadoras & Drones',
            'Projetores & Telões',
            'Conversores, TV Box & Receptores',
            'Segurança Eletrônica & Câmeras Wi-Fi'
        ],
        aliases: ['Eletrônicos', 'Eletronicos', 'Eletrônicos, Áudio & Vídeo', 'Smart TV', 'TV', 'Televisão', 'Drones', 'Câmeras']
    },
    {
        chave: 'Áudio & Vídeo',
        nome: 'Áudio & Vídeo',
        slug: 'audio-video',
        icone: 'fa-headphones',
        descricao: 'Caixas de som bluetooth, soundbars, fones de ouvido, microfones e equipamentos de áudio.',
        subcategorias: [
            'Caixas de Som Bluetooth & Portáteis',
            'Soundbars & Home Theater',
            'Fones Bluetooth & Headphones',
            'Microfones & Mesas de Som',
            'Aparelhos de Som Potentes'
        ],
        aliases: ['Áudio & Vídeo', 'Audio & Video', 'Áudio', 'Audio', 'Som', 'Caixas de Som', 'JBL', 'Fones', 'Headphones', 'Eletrônicos, Áudio & Vídeo']
    },
    {
        chave: 'Informática',
        nome: 'Informática',
        slug: 'informatica',
        icone: 'fa-laptop',
        descricao: 'Notebooks, computadores, PCs gamer, monitores, impressoras e componentes de hardware.',
        subcategorias: [
            'Notebooks & Laptops',
            'Computadores Desktop & PCs Gamer',
            'Monitores & Telas para PC',
            'Placas de Vídeo, Processadores, Memória & SSDs',
            'Teclados, Mouses & Periféricos',
            'Impressoras, Tintas & Scanners'
        ],
        aliases: ['Informática', 'Informatica', 'Informática & Games', 'Computadores', 'Notebook', 'PC', 'Hardware', 'Impressoras']
    },
    {
        chave: 'Games',
        nome: 'Games',
        slug: 'games',
        icone: 'fa-gamepad',
        descricao: 'Consoles de videogame, jogos físicos, controles, acessórios e cadeiras gamer.',
        subcategorias: [
            'Consoles PlayStation (PS4, PS5)',
            'Consoles Xbox (One, Series S/X)',
            'Nintendo Switch & Portáteis',
            'Jogos & Mídias Físicas',
            'Controles, Volantes & Acessórios',
            'Cadeiras Gamer & Acessórios de Setup'
        ],
        aliases: ['Games', 'Videogames', 'Jogos', 'Informática & Games', 'PlayStation', 'Xbox', 'Nintendo', 'PS5', 'PS4']
    },
    {
        chave: 'Móveis',
        nome: 'Móveis',
        slug: 'moveis',
        icone: 'fa-couch',
        descricao: 'Sofás, poltronas, camas, colchões, guarda-roupas, armários, mesas e racks.',
        subcategorias: [
            'Sofás, Poltronas & Puffs',
            'Camas, Box & Colchões',
            'Guarda-Roupas, Cômodas & Armários',
            'Mesas, Cadeiras & Banquetas',
            'Armários de Cozinha & Balcões',
            'Painéis para TV, Racks & Estantes'
        ],
        aliases: ['Móveis', 'Moveis', 'Casa, Móveis & Decoração', 'Sofá', 'Cama', 'Mesa', 'Armário', 'Guarda-Roupa', 'Rack']
    },
    {
        chave: 'Decoração',
        nome: 'Decoração',
        slug: 'decoracao',
        icone: 'fa-palette',
        descricao: 'Quadros, espelhos, tapetes, cortinas, iluminação, vasos e artigos de cama, mesa e banho.',
        subcategorias: [
            'Cortinas, Persianas & Varões',
            'Tapetes & Passadeiras',
            'Quadros, Espelhos & Painéis Decorativos',
            'Luminárias, Abajures & Lustres',
            'Artigos de Cama, Mesa & Banho',
            'Vasos, Plantas Artificiais & Enfeites'
        ],
        aliases: ['Decoração', 'Decoracao', 'Casa, Móveis & Decoração', 'Tapetes', 'Cortinas', 'Quadros', 'Espelhos', 'Cama Mesa e Banho']
    },
    {
        chave: 'Eletrodomésticos',
        nome: 'Eletrodomésticos',
        slug: 'eletrodomesticos',
        icone: 'fa-blender',
        descricao: 'Geladeiras, fogões, lavadoras, ar-condicionado, micro-ondas e eletroportáteis.',
        subcategorias: [
            'Geladeiras, Refrigeradores & Freezers',
            'Fogões, Cooktops & Fornos',
            'Máquinas de Lavar, Tanquinhos & Secadoras',
            'Ar-condicionado & Climatizadores',
            'Ventiladores & Circuladores de Ar',
            'Micro-ondas & Fornos Elétricos',
            'Airfryers, Fritadeiras & Cafeteiras',
            'Liquidificadores, Batedeiras & Processadores'
        ],
        aliases: ['Eletrodomésticos', 'Eletrodomesticos', 'Geladeira', 'Freezer', 'Fogão', 'Lavadora', 'Ar Condicionado', 'Ventilador', 'Airfryer', 'Micro-ondas']
    },
    {
        chave: 'Moda',
        nome: 'Moda',
        slug: 'moda',
        icone: 'fa-shirt',
        descricao: 'Roupas masculinas, femininas, roupas íntimas, moda praia e vestuário em geral.',
        subcategorias: [
            'Roupas Femininas (Vestidos, Blusas, Calças)',
            'Roupas Masculinas (Camisas, Bermudas, Calças)',
            'Moda Praia & Moda Íntima',
            'Roupas Infantis & Juvenis',
            'Jaquetas, Casacos & Moletons'
        ],
        aliases: ['Moda', 'Roupas', 'Vestuário', 'Moda, Calçados & Acessórios', 'Camisas', 'Vestidos', 'Calças']
    },
    {
        chave: 'Calçados',
        nome: 'Calçados',
        slug: 'calcados',
        icone: 'fa-shoe-prints',
        descricao: 'Tênis esportivos, sapatos sociais, sandálias, botas, chinelos e calçados em geral.',
        subcategorias: [
            'Tênis Masculinos & Femininos',
            'Sandálias, Saltos & Rasteirinhas',
            'Botas & Coturnos',
            'Sapatos Sociais & Mocassins',
            'Chinelos, Sandálias de Dedo & Pantufas'
        ],
        aliases: ['Calçados', 'Calcados', 'Tênis', 'Tenis', 'Sapatos', 'Sandálias', 'Botas', 'Chinelos', 'Moda, Calçados & Acessórios']
    },
    {
        chave: 'Acessórios',
        nome: 'Acessórios',
        slug: 'acessorios',
        icone: 'fa-gem',
        descricao: 'Bolsas, mochilas, relógios, óculos de sol, joias, semijoias, cintos e carteiras.',
        subcategorias: [
            'Bolsas, Mochilas & Malas',
            'Relógios Masculinos & Femininos',
            'Joias, Semijoias, Bijuterias & Alianças',
            'Óculos de Sol & Armações de Grau',
            'Cintos, Bonés, Chapéus & Carteiras'
        ],
        aliases: ['Acessórios', 'Acessorios', 'Bolsas', 'Mochilas', 'Relógios', 'Joias', 'Óculos', 'Bijuterias', 'Moda, Calçados & Acessórios']
    },
    {
        chave: 'Beleza',
        nome: 'Beleza',
        slug: 'beleza',
        icone: 'fa-spray-can-sparkles',
        descricao: 'Perfumes nacionais e importados, maquiagens, cosméticos e cuidados com a pele.',
        subcategorias: [
            'Perfumes Importados & Nacionais',
            'Maquiagem, Batons & Pincéis',
            'Cuidados com a Pele (Skincare & Cremes)',
            'Tratamento Capilar (Máscaras, Shampoos)',
            'Esmaltes, Unhas em Gel & Manicure'
        ],
        aliases: ['Beleza', 'Perfumes', 'Maquiagem', 'Cosméticos', 'Cosmeticos', 'Skincare', 'Beleza & Cuidado Pessoal']
    },
    {
        chave: 'Cuidado Pessoal',
        nome: 'Cuidado Pessoal',
        slug: 'cuidado-pessoal',
        icone: 'fa-pump-soap',
        descricao: 'Secadores de cabelo, chapinhas, barbeadores, depiladores e aparelhos de higiene pessoal.',
        subcategorias: [
            'Secadores, Pranchas & Modeladores',
            'Máquinas de Cortar Cabelo & Barbeadores',
            'Depiladores & Higiene Corporal',
            'Aparelhos de Massagem & Bem-Estar',
            'Higiene Bucal & Cuidados Especiais'
        ],
        aliases: ['Cuidado Pessoal', 'Cuidados Pessoais', 'Secador', 'Chapinha', 'Barbeador', 'Higiene', 'Beleza & Cuidado Pessoal']
    },
    {
        chave: 'Infantil',
        nome: 'Infantil',
        slug: 'infantil',
        icone: 'fa-shapes',
        descricao: 'Brinquedos, jogos educativos, bonecas, carrinhos, material escolar e artigos para crianças.',
        subcategorias: [
            'Brinquedos Educativos & Jogos de Tabuleiro',
            'Bonecas, Carrinhos & Figuras de Ação',
            'Bicicletas, Patinetes & Triciclos Infantis',
            'Piscina de Bolinhas & Playgrounds',
            'Livros Infantis & Mochilas Escolares'
        ],
        aliases: ['Infantil', 'Crianças', 'Criancas', 'Brinquedos', 'Jogos Infantis', 'Infantil & Bebês']
    },
    {
        chave: 'Bebês',
        nome: 'Bebês',
        slug: 'bebes',
        icone: 'fa-baby',
        descricao: 'Carrinhos de bebê, berços, cercados, cadeirinhas para carro, enxoval e fraldas.',
        subcategorias: [
            'Carrinhos de Bebê & Moisés',
            'Berços, Cercados & Cômodas de Bebê',
            'Cadeirinhas para Carro & Bebê Conforto',
            'Roupas para Bebê & Enxoval Completo',
            'Mamadeiras, Fraldas, Banheiras & Higiene do Bebê'
        ],
        aliases: ['Bebês', 'Bebes', 'Enxoval', 'Carrinho de Bebê', 'Berço', 'Cadeirinha', 'Fraldas', 'Infantil & Bebês']
    },
    {
        chave: 'Esportes',
        nome: 'Esportes',
        slug: 'esportes',
        icone: 'fa-futbol',
        descricao: 'Artigos de futebol, bolas, chuteiras, camisas de time, ciclismo, basquete e esportes em geral.',
        subcategorias: [
            'Futebol (Bolas, Chuteiras, Uniformes)',
            'Bicicletas Esportivas & Acessórios de Ciclismo',
            'Vôlei, Basquete & Handebol',
            'Lutas, Artes Marciais & Luvas',
            'Tênis de Mesa & Raquetes'
        ],
        aliases: ['Esportes', 'Futebol', 'Ciclismo', 'Bicicleta', 'Bolas', 'Chuteiras', 'Esportes, Fitness & Lazer']
    },
    {
        chave: 'Fitness',
        nome: 'Fitness',
        slug: 'fitness',
        icone: 'fa-dumbbell',
        descricao: 'Equipamentos de musculação, halteres, anilhas, esteiras, suplementos e roupas de treino.',
        subcategorias: [
            'Halteres, Anilhas, Barras & Pesos',
            'Equipamentos de Musculação & Estações de Treino',
            'Esteiras, Bicicletas Ergométricas & Elípticos',
            'Suplementos, Whey Protein & Creatina',
            'Roupas & Acessórios Fitness (Tops, Leggings)'
        ],
        aliases: ['Fitness', 'Academia', 'Musculação', 'Musculacao', 'Halteres', 'Suplementos', 'Whey', 'Esportes, Fitness & Lazer']
    },
    {
        chave: 'Lazer',
        nome: 'Lazer',
        slug: 'lazer',
        icone: 'fa-campground',
        descricao: 'Camping, barracas, artigos de pesca, piscinas infláveis, patins, skates e lazer ao ar livre.',
        subcategorias: [
            'Camping, Barracas, Sacos de Dormir & Lanternas',
            'Pesca (Varas, Molinetes, Carretilhas & Iscas)',
            'Piscinas Infláveis, Boias & Artigos Aquáticos',
            'Skates, Patins, Patinetes & Longboards',
            'Jogos de Salão (Mesas de Sinuca, Totó & Pebolim)'
        ],
        aliases: ['Lazer', 'Camping', 'Pesca', 'Piscinas', 'Piscina', 'Acampamento', 'Sinuca', 'Esportes, Fitness & Lazer']
    },
    {
        chave: 'Construção',
        nome: 'Construção',
        slug: 'construcao',
        icone: 'fa-trowel-bricks',
        descricao: 'Materiais de construção, cimento, tijolos, pisos, tintas, fiação elétrica e encanamento.',
        subcategorias: [
            'Cimento, Argamassa, Tijolos & Blocos',
            'Pisos, Revestimentos, Porcelanatos & Azulejos',
            'Tintas, Seladores, Vernizes & Pincéis',
            'Material Elétrico, Fios, Disjuntores & Iluminação',
            'Tubos, Conexões, Caixas d’Água & Hidráulica',
            'Portas, Janelas, Telhas & Ferragens'
        ],
        aliases: ['Construção', 'Construcao', 'Materiais de Construção', 'Obras', 'Reforma', 'Cimento', 'Tintas', 'Construção & Ferramentas']
    },
    {
        chave: 'Ferramentas',
        nome: 'Ferramentas',
        slug: 'ferramentas',
        icone: 'fa-hammer',
        descricao: 'Ferramentas elétricas, manuais, furadeiras, serras, solda, compressores e maletas.',
        subcategorias: [
            'Ferramentas Elétricas (Furadeiras, Parafusadeiras, Serras, Lixadeiras)',
            'Ferramentas Manuais (Chaves, Alicates, Martelos, Níveis)',
            'Máquinas de Solda, Compressores & Lavadoras de Alta Pressão',
            'Caixas, Maletas & Organizadores de Ferramentas',
            'Escadas, Andaimes & Carrinhos de Mão'
        ],
        aliases: ['Ferramentas', 'Furadeira', 'Parafusadeira', 'Alicate', 'Martelo', 'Solda', 'Compressor', 'Construção & Ferramentas']
    },
    {
        chave: 'Comércio',
        nome: 'Comércio',
        slug: 'comercio',
        icone: 'fa-store',
        descricao: 'Balcões, vitrines, freezers comerciais, estufas, caixas registradoras e lotes para revenda.',
        subcategorias: [
            'Balcões, Vitrines & Expositores Comerciais',
            'Freezers & Geladeiras Comerciais / Câmaras Frias',
            'Chapas, Estufas, Fornos Industriais & Cozinha Comercial',
            'Balanças, Maquinetas, Caixas Registradoras & Leitores',
            'Lotes, Pontas de Estoque & Mercadorias para Revenda'
        ],
        aliases: ['Comércio', 'Comercio', 'Negócios', 'Comercial', 'Balcão', 'Freezer Comercial', 'Estufa', 'Comércio, Negócios & Escritório']
    },
    {
        chave: 'Escritório',
        nome: 'Escritório',
        slug: 'escritorio',
        icone: 'fa-building',
        descricao: 'Mesas de escritório, cadeiras giratórias ergonômicas, arquivos, cofres e material corporativo.',
        subcategorias: [
            'Mesas para Escritório & Estações de Trabalho',
            'Cadeiras Giratórias & Poltronas de Presidente',
            'Arquivos de Aço, Armários & Gaveteiros',
            'Cofres, Fragmentadoras & Calculadoras de Mesa',
            'Artigos de Papelaria Corporativa & Suprimentos'
        ],
        aliases: ['Escritório', 'Escritorio', 'Móveis de Escritório', 'Cadeira Giratória', 'Mesa de Escritório', 'Comércio, Negócios & Escritório']
    },
    {
        chave: 'Serviços',
        nome: 'Serviços',
        slug: 'servicos',
        icone: 'fa-briefcase',
        descricao: 'Fretes, reformas, pedreiros, mecânicos, eletricistas, aulas particulares e diaristas.',
        subcategorias: [
            'Fretes, Mudanças, Carretos & Viagens',
            'Pedreiros, Pintores, Eletricistas & Encanadores',
            'Mecânica, Autoelétrica & Funilaria',
            'Assistência Técnica de Celulares, PCs & Eletros',
            'Festas, Eventos, Buffets, Bolos & Salgados',
            'Aulas Particulares, Cursos & Consultorias',
            'Limpeza, Diaristas & Cuidados Pessoais'
        ],
        aliases: ['Serviços', 'Servicos', 'Profissionais', 'Trabalhos', 'Empregos', 'Frete', 'Mudança', 'Mecânico', 'Eletricista', 'Serviços & Profissionais']
    },
    {
        chave: 'Música',
        nome: 'Música',
        slug: 'musica',
        icone: 'fa-guitar',
        descricao: 'Violões, guitarras, baixos, teclados, baterias, amplificadores e instrumentos musicais.',
        subcategorias: [
            'Violões, Guitarras, Baixos & Cordas',
            'Teclados, Pianos Digitais & Órgãos',
            'Baterias, Pandeiros & Percussão',
            'Amplificadores, Cubos, Caixas & Pedais de Efeito',
            'Acessórios Musicais (Capas, Suportes, Cabos, Palhetas)'
        ],
        aliases: ['Música', 'Musica', 'Instrumentos Musicais', 'Violão', 'Guitarra', 'Teclado', 'Bateria', 'Amplificador', 'Música, Arte & Hobbies']
    },
    {
        chave: 'Hobbies',
        nome: 'Hobbies',
        slug: 'hobbies',
        icone: 'fa-brush',
        descricao: 'Livros, quadrinhos, artesanato, crochê, pinturas, colecionáveis, moedas e antiguidades.',
        subcategorias: [
            'Livros, Revistas, Quadrinhos & Mangás',
            'Artesanato, Crochê, Biscuit & Pinturas',
            'Colecionáveis, Moedas, Cédulas & Selos Antigos',
            'Antiguidades & Relíquias Históricas',
            'Jogos de Tabuleiro Avançados & Quebra-Cabeças'
        ],
        aliases: ['Hobbies', 'Arte', 'Artesanato', 'Livros', 'Colecionáveis', 'Antiguidades', 'Crochê', 'Música, Arte & Hobbies']
    },
    {
        chave: 'Animais de Estimação',
        nome: 'Animais de Estimação',
        slug: 'pets',
        icone: 'fa-paw',
        descricao: 'Cachorros, gatos, pássaros, peixes ornamentais e filhotes para adoção responsável ou venda.',
        subcategorias: [
            'Cachorros & Filhotes de Raça',
            'Gatos & Gatinhos',
            'Pássaros Canoros & Aves Domésticas',
            'Peixes Ornamentais & Espécies de Aquário'
        ],
        aliases: ['Animais de Estimação', 'Animais de Estimacao', 'Pets', 'Cachorros', 'Gatos', 'Filhotes', 'Cães', 'Animais de Estimação & Pet Shop']
    },
    {
        chave: 'Pet Shop',
        nome: 'Pet Shop',
        slug: 'pet-shop',
        icone: 'fa-bone',
        descricao: 'Rações, petiscos, casinhas, coleiras, brinquedos pet, gaiolas, aquários e medicamentos pet.',
        subcategorias: [
            'Rações, Petiscos & Vitaminas para Cães e Gatos',
            'Casinhas, Caminhas & Caixas de Transporte',
            'Coleiras, Guias, Peitorais & Roupinhas Pet',
            'Gaiolas, Viveiros & Alimentos para Pássaros',
            'Aquários, Filtros, Bombas & Rações para Peixes',
            'Shampoos, Higiene & Antipulgas Pet'
        ],
        aliases: ['Pet Shop', 'Petshop', 'Ração Pet', 'Acessórios Pet', 'Aquário', 'Casinha de Cachorro', 'Animais de Estimação & Pet Shop']
    },
    {
        chave: 'Doações',
        nome: 'Doações',
        slug: 'doacoes',
        icone: 'fa-hand-holding-heart',
        descricao: 'Itens gratuitos para doação, desapego social solidário e ajuda comunitária.',
        subcategorias: [
            'Roupas & Calçados para Doação',
            'Móveis & Utilitários Gratuitos',
            'Livros & Materiais Escolares em Doação',
            'Alimentos & Campanhas Comunitárias Solidárias'
        ],
        aliases: ['Doações', 'Doacoes', 'Doação', 'Doacao', 'Grátis', 'Gratuito', 'Desapego', 'Doações, Trocas & Solidariedade']
    },
    {
        chave: 'Trocas',
        nome: 'Trocas',
        slug: 'trocas',
        icone: 'fa-repeat',
        descricao: 'Itens abertos para troca direta, escambo, permutas de veículos, eletrônicos e imóveis.',
        subcategorias: [
            'Trocas de Celulares & Eletrônicos',
            'Trocas de Veículos & Motos (Aceito Troca)',
            'Permutas de Imóveis & Terrenos',
            'Trocas Gerais & Escambo Comunitário'
        ],
        aliases: ['Trocas', 'Troca', 'Permuta', 'Permutas', 'Aceito Troca', 'Escambo', 'Doações, Trocas & Solidariedade']
    },
    {
        chave: 'Outros',
        nome: 'Outros',
        slug: 'outros',
        icone: 'fa-boxes-stacked',
        descricao: 'Artigos variados, utilidades diárias, bazar geral, achados e diversos.',
        subcategorias: [
            'Utilidades do Dia a Dia',
            'Bazar & Garimpo Geral',
            'Lotes & Saldões Diversos'
        ],
        aliases: ['Outros', 'Diversos', 'Outros & Diversos', 'Geral', 'Variados', 'Bazar']
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CATEGORIAS };
}
if (typeof window !== 'undefined') {
    window.CATEGORIAS = CATEGORIAS;
}

