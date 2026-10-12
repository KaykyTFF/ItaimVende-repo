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
    { name: 'Veículos & Peças', slug: 'veiculos', icon: 'fa-car', orderIndex: 1 },
    { name: 'Imóveis & Terrenos', slug: 'imoveis', icon: 'fa-home', orderIndex: 2 },
    { name: 'Eletrônicos & Celulares', slug: 'eletronicos', icon: 'fa-mobile-screen', orderIndex: 3 },
    { name: 'Moda & Vestuário', slug: 'moda', icon: 'fa-shirt', orderIndex: 4 },
    { name: 'Móveis & Casa', slug: 'moveis', icon: 'fa-couch', orderIndex: 5 },
    { name: 'Agro & Animais', slug: 'agro', icon: 'fa-tractor', orderIndex: 6 },
    { name: 'Esportes & Lazer', slug: 'esportes', icon: 'fa-bicycle', orderIndex: 7 },
    { name: 'Infantil & Brinquedos', slug: 'infantil', icon: 'fa-baby', orderIndex: 8 },
    { name: 'Serviços & Negócios', slug: 'servicos', icon: 'fa-briefcase', orderIndex: 9 },
    { name: 'Outros & Geral', slug: 'outros', icon: 'fa-boxes-stacked', orderIndex: 10 },
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
      name: 'Raili',
      username: 'rsstore',
      email: 'admin@gmail.com',
      password: adminPasswordHash,
      phone: '89999858585',
      city: 'Paulistana',
      state: 'PI',
      neighborhood: 'Centro',
      avatar: 'assets/icon-user.png',
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
  console.log('✅ Usuários Raili (Admin) e Kayky (Vendedor) configurados.');

  // 3. Produtos Reais Iniciais de Exemplo para Paulistana/PI
  const produtosIniciais = [
    {
      title: 'Moto Honda CG 160 Fan 2022 Único Dono',
      description: 'Moto conservada, revisões em dia, IPVA 2026 pago, pneus novos, pronta para transferir em Paulistana.',
      price: 14500.00,
      originalPrice: 15200.00,
      condition: 'SEMINOVO',
      categorySlug: 'veiculos',
      images: ['assets/produtos/anuncio_15.jpg'],
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
      images: ['assets/produtos/anuncio_15.jpg'],
      isFeatured: false,
      neighborhood: 'Triângulo',
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
          city: 'Paulistana',
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
