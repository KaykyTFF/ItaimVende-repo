/**
 * ITAIM VENDE - LISTA OFICIAL DE CATEGORIAS
 * Arquivo: frontend/js/core/categorias/categorias-lista.js
 * 
 * Concentra o nome exibido, a chave usada na URL (?cat=...),
 * slugs oficiais do banco de dados e nomes alternativos (aliases).
 */

const CATEGORIAS = [
    { chave: 'Eletrônicos', nome: 'Eletrônicos & Celulares', slug: 'eletronicos',
      aliases: ['Eletrônicos', 'Eletrônicos & Celulares', 'Celulares e Smartphones', 'Eletrônicos e Áudio', 'Computadores e Informática', 'Informática & PC', 'Tecnologia'] },
    { chave: 'Veículos', nome: 'Veículos & Peças', slug: 'veiculos',
      aliases: ['Veículos', 'Veículos & Peças', 'Carros e Motos', 'Motos', 'Carros', 'Automóveis', 'Peças'] },
    { chave: 'Móveis', nome: 'Móveis & Casa', slug: 'moveis',
      aliases: ['Móveis', 'Móveis & Casa', 'Móveis e Decoração', 'Casa', 'Eletrodomésticos'] },
    { chave: 'Decoração', nome: 'Decoração & Casa', slug: 'decoracao',
      aliases: ['Decoração', 'Móveis e Decoração', 'Cama, Mesa e Banho'] },
    { chave: 'Moda', nome: 'Moda & Vestuário', slug: 'moda',
      aliases: ['Moda', 'Moda & Vestuário', 'Moda e Acessórios', 'Moda e Calçados', 'Roupas', 'Calçados'] },
    { chave: 'Esportes', nome: 'Esportes & Lazer', slug: 'esportes',
      aliases: ['Esportes', 'Esportes & Lazer', 'Bicicletas', 'Fitness', 'Ciclismo'] },
    { chave: 'Infantil', nome: 'Infantil & Brinquedos', slug: 'infantil',
      aliases: ['Infantil', 'Infantil & Brinquedos', 'Infantil & Bebês', 'Bebês', 'Games e Brinquedos', 'Brinquedos'] },
    { chave: 'Hobbies', nome: 'Hobbies & Games', slug: 'hobbies',
      aliases: ['Hobbies', 'Hobbies & Games', 'Games e Brinquedos', 'Jogos', 'Instrumentos'] },
    { chave: 'Agro', nome: 'Agro & Animais', slug: 'agro',
      aliases: ['Agro', 'Agro & Animais', 'Animais', 'Fazenda', 'Agricultura', 'Pecuária'] },
    { chave: 'Imóveis', nome: 'Imóveis & Terrenos', slug: 'imoveis',
      aliases: ['Imóveis', 'Imóveis & Terrenos', 'Casas', 'Terrenos', 'Aluguel', 'Venda de Imóveis'] },
    { chave: 'Serviços', nome: 'Serviços & Negócios', slug: 'servicos',
      aliases: ['Serviços', 'Serviços & Negócios', 'Serviços e Trabalhos', 'Negócios', 'Empregos'] },
    { chave: 'Outros', nome: 'Outros & Geral', slug: 'outros',
      aliases: ['Outros', 'Outros & Geral', 'Outros Produtos', 'Geral', 'Diversos'] }
];
