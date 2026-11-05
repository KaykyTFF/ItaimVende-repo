import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) + '-' + Math.random().toString(36).substring(2, 7);
}

async function main() {
  console.log('🌱 Iniciando povoamento inicial do banco de dados (Seed)...');

  // 1. Categorias Oficiais do Itaim Vende
  const categoriasData = [
    { name: 'Veículos', slug: 'veiculos', icon: 'fa-car', orderIndex: 1 },
    { name: 'Autopeças', slug: 'autopecas', icon: 'fa-gears', orderIndex: 2 },
    { name: 'Imóveis', slug: 'imoveis', icon: 'fa-house', orderIndex: 3 },
    { name: 'Terrenos', slug: 'terrenos', icon: 'fa-map-location-dot', orderIndex: 4 },
    { name: 'Agro', slug: 'agro', icon: 'fa-tractor', orderIndex: 5 },
    { name: 'Pecuária', slug: 'pecuaria', icon: 'fa-cow', orderIndex: 6 },
    { name: 'Celulares', slug: 'celulares', icon: 'fa-mobile-screen', orderIndex: 7 },
    { name: 'Telefonia', slug: 'telefonia', icon: 'fa-phone', orderIndex: 8 },
    { name: 'Eletrônicos', slug: 'eletronicos', icon: 'fa-tv', orderIndex: 9 },
    { name: 'Áudio & Vídeo', slug: 'audio-video', icon: 'fa-headphones', orderIndex: 10 },
    { name: 'Informática', slug: 'informatica', icon: 'fa-laptop', orderIndex: 11 },
    { name: 'Games', slug: 'games', icon: 'fa-gamepad', orderIndex: 12 },
    { name: 'Móveis', slug: 'moveis', icon: 'fa-couch', orderIndex: 13 },
    { name: 'Decoração', slug: 'decoracao', icon: 'fa-palette', orderIndex: 14 },
    { name: 'Eletrodomésticos', slug: 'eletrodomesticos', icon: 'fa-blender', orderIndex: 15 },
    { name: 'Moda', slug: 'moda', icon: 'fa-shirt', orderIndex: 16 },
    { name: 'Calçados', slug: 'calcados', icon: 'fa-shoe-prints', orderIndex: 17 },
    { name: 'Acessórios', slug: 'acessorios', icon: 'fa-gem', orderIndex: 18 },
    { name: 'Beleza', slug: 'beleza', icon: 'fa-spray-can-sparkles', orderIndex: 19 },
    { name: 'Cuidado Pessoal', slug: 'cuidado-pessoal', icon: 'fa-pump-soap', orderIndex: 20 },
    { name: 'Infantil', slug: 'infantil', icon: 'fa-shapes', orderIndex: 21 },
    { name: 'Bebês', slug: 'bebes', icon: 'fa-baby', orderIndex: 22 },
    { name: 'Esportes', slug: 'esportes', icon: 'fa-futbol', orderIndex: 23 },
    { name: 'Fitness', slug: 'fitness', icon: 'fa-dumbbell', orderIndex: 24 },
    { name: 'Lazer', slug: 'lazer', icon: 'fa-campground', orderIndex: 25 },
    { name: 'Construção', slug: 'construcao', icon: 'fa-trowel-bricks', orderIndex: 26 },
    { name: 'Ferramentas', slug: 'ferramentas', icon: 'fa-hammer', orderIndex: 27 },
    { name: 'Comércio', slug: 'comercio', icon: 'fa-store', orderIndex: 28 },
    { name: 'Escritório', slug: 'escritorio', icon: 'fa-building', orderIndex: 29 },
    { name: 'Serviços', slug: 'servicos', icon: 'fa-briefcase', orderIndex: 30 },
    { name: 'Música', slug: 'musica', icon: 'fa-guitar', orderIndex: 31 },
    { name: 'Hobbies', slug: 'hobbies', icon: 'fa-brush', orderIndex: 32 },
    { name: 'Animais de Estimação', slug: 'pets', icon: 'fa-paw', orderIndex: 33 },
    { name: 'Pet Shop', slug: 'pet-shop', icon: 'fa-bone', orderIndex: 34 },
    { name: 'Doações', slug: 'doacoes', icon: 'fa-hand-holding-heart', orderIndex: 35 },
    { name: 'Trocas', slug: 'trocas', icon: 'fa-repeat', orderIndex: 36 },
    { name: 'Outros', slug: 'outros', icon: 'fa-boxes-stacked', orderIndex: 37 },
  ];

  const categoryMap = {};
  for (const cat of categoriasData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, orderIndex: cat.orderIndex },
      create: cat,
    });
    categoryMap[cat.name] = upserted.id;
    categoryMap[cat.slug] = upserted.id;
  }
  console.log(`✅ ${categoriasData.length} categorias cadastradas com sucesso.`);

  // 2. Usuários Iniciais (Admin Oficial & Vendedor Verificado)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      username: 'adminfreefire',
      email: 'admin@gmail.com',
      password: adminPasswordHash,
      phone: '89999858585',
      city: 'Paulistana',
      state: 'PI',
      neighborhood: 'Centro',
      avatar: '/uploads/perfil/itaim-1791903382039-jwd9lvb.jpg',
      bio: 'Perfil oficial e verificado da administração do Itaim Vende.',
      role: 'ADMIN',
      status: 'ACTIVE',
      isVerified: true,
      ratingAverage: 5.0,
      ratingCount: 18,
      salesCount: 12,
    },
  });

  const clientePasswordHash = await bcrypt.hash('cliente123', 10);
  const clienteUser = await prisma.user.upsert({
    where: { email: 'kayky@gmail.com' },
    update: {},
    create: {
      name: 'Kayky Terles',
      username: 'kayky_dev',
      email: 'kayky@gmail.com',
      password: clientePasswordHash,
      phone: '89994000000',
      city: 'Paulistana',
      state: 'PI',
      neighborhood: 'Centro',
      role: 'SELLER',
      status: 'ACTIVE',
      isVerified: true,
      ratingAverage: 4.9,
      ratingCount: 8,
      salesCount: 5,
    },
  });
  console.log('✅ Usuários Admin e Kayky (Vendedor) configurados.');

  // 3. Produtos Reais Iniciais de Exemplo para Paulistana/PI
  const produtosIniciais = [
    {
      title: 'Moto Honda CG 160 Fan 2022 Único Dono',
      description: 'Moto conservada, revisões em dia, IPVA 2026 pago, pneus novos, pronta para transferir em Paulistana.',
      price: 14500.00,
      originalPrice: 15200.00,
      condition: 'SEMINOVO',
      categorySlug: 'veiculos',
      images: ['assets/produtos/anuncio_14.jpg'],
      isFeatured: true,
      neighborhood: 'Centro',
    },
    {
      title: 'iPhone 13 128GB Meia-Noite Bateria 89%',
      description: 'Aparelho impecável, acompanha caixa e cabo original. Sem marcas de uso, funcionando tudo perfeitamente.',
      price: 2850.00,
      originalPrice: 3100.00,
      condition: 'SEMINOVO',
      categorySlug: 'eletronicos',
      images: ['assets/produtos/anuncio_13.jpg'],
      isFeatured: true,
      neighborhood: 'Correnteza',
    },
    {
      title: 'Smart TV 50" UHD 4K Samsung Crystal',
      description: 'Smart TV 4K novinha, excelente imagem e som, sem avarias. Acompanha controle e suporte de parede.',
      price: 2199.00,
      originalPrice: 2499.00,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/produtos/anuncio_13.jpg'],
      isFeatured: true,
      neighborhood: 'Centro',
    },
    {
      title: 'Sofá Retrátil e Reclinável 3 Lugares Veludo Suede',
      description: 'Sofá muito espaçoso e confortável, tecido macio, espuma D-28. Retirada no Centro de Paulistana.',
      price: 1850.00,
      condition: 'NOVO',
      categorySlug: 'moveis',
      images: ['assets/produtos/anuncio_10.jpg'],
      isFeatured: false,
      neighborhood: 'Centro',
    },
    {
      title: 'Bicicleta Aro 29 Houston Câmbio Shimano 21 Marchas',
      description: 'Bicicleta em perfeito estado, freios a disco revisados, pneus com muita borracha.',
      price: 1100.00,
      originalPrice: 1350.00,
      condition: 'USADO',
      categorySlug: 'esportes',
      images: ['assets/produtos/anuncio_11.jpg'],
      isFeatured: false,
      neighborhood: 'Triângulo',
    },
    {
      title: 'Smartphone Galaxy S22 128GB Verde',
      description: 'Galaxy S22 em excelente estado, câmeras profissionais e tela Dynamic AMOLED 120Hz. Entrego em Acauã ou Paulistana.',
      price: 1950.00,
      originalPrice: 2200.00,
      condition: 'SEMINOVO',
      categorySlug: 'eletronicos',
      images: ['assets/produtos/anuncio_13.jpg'],
      isFeatured: true,
      city: 'Acauã',
      neighborhood: 'Centro',
    },
    {
      title: 'Fone Bluetooth ANC Over-Ear Premium',
      description: 'Fone com cancelamento ativo de ruído, som de alta fidelidade e bateria para 35 horas. Retirada em Betânia.',
      price: 320.00,
      originalPrice: 380.00,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/produtos/anuncio_10.jpg'],
      isFeatured: false,
      city: 'Betânia do Piauí',
      neighborhood: 'Centro',
    },
    {
      title: 'Bicicleta Mountain Bike Aro 29 Freio Hidráulico',
      description: 'Mountain bike com suspensão dianteira com trava e transmissão Shimano. Ideal para trilhas em Jacobina.',
      price: 1400.00,
      originalPrice: 1650.00,
      condition: 'USADO',
      categorySlug: 'esportes',
      images: ['assets/produtos/anuncio_12.jpg'],
      isFeatured: false,
      city: 'Jacobina do Piauí',
      neighborhood: 'Centro',
    },
    {
      title: 'Smartwatch Esportivo GPS Pro',
      description: 'Monitoramento cardíaco contínuo, oxigenação sanguínea e bateria para até 14 dias. Disponível em Queimada Nova.',
      price: 290.00,
      originalPrice: 350.00,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/produtos/anuncio_13.jpg'],
      isFeatured: true,
      city: 'Queimada Nova',
      neighborhood: 'Centro',
    },
  ];

  for (const p of produtosIniciais) {
    const catId = categoryMap[p.categorySlug] || categoryMap['outros'];
    const existing = await prisma.product.findFirst({
      where: { title: p.title },
    });

    if (!existing) {
      const slug = gerarSlug(p.title);
      await prisma.product.create({
        data: {
          slug,
          title: p.title,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || null,
          condition: p.condition,
          status: 'ATIVO',
          listingType: 'VENDA',
          isFeatured: p.isFeatured,
          city: p.city || 'Paulistana',
          state: 'PI',
          neighborhood: p.neighborhood || 'Centro',
          categoryId: catId,
          sellerId: adminUser.id,
          images: {
            create: p.images.map((url, idx) => ({
              url,
              orderIndex: idx,
              isCover: idx === 0,
            })),
          },
        },
      });
    }
  }

  console.log(`✅ ${produtosIniciais.length} produtos de exemplo criados.`);
  console.log('🎉 Seed inicial concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
