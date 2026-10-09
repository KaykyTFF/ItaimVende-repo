import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando povoamento inicial do banco de dados (Seed)...');

  // 1. Categorias Oficiais
  const categoriasData = [
    { name: 'Eletrônicos', slug: 'eletronicos', icon: 'assets/images/cat-eletronicos.png' },
    { name: 'Moda & Vestuário', slug: 'moda', icon: 'assets/images/cat-moda.png' },
    { name: 'Móveis', slug: 'moveis', icon: 'assets/images/cat-moveis.png' },
    { name: 'Decoração', slug: 'decoracao', icon: 'assets/images/cat-decoracao.png' },
    { name: 'Esportes & Lazer', slug: 'esportes', icon: 'assets/images/cat-esportes.png' },
    { name: 'Infantil & Bebês', slug: 'infantil', icon: 'assets/images/cat-infantil.png' },
    { name: 'Hobbies & Games', slug: 'hobbies', icon: 'assets/images/cat-hobbies.png' },
    { name: 'Serviços', slug: 'servicos', icon: 'assets/images/cat-servicos.png' },
  ];

  const categoryMap = {};
  for (const cat of categoriasData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = upserted.id;
    categoryMap[cat.slug] = upserted.id;
  }
  console.log(`✅ ${categoriasData.length} categorias cadastradas.`);

  // 2. Usuários Iniciais (Admin & Cliente Teste)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'Raili',
      username: 'rsstore',
      email: 'admin@gmail.com',
      password: adminPasswordHash,
      phone: '(85) 99985-8585',
      city: 'Paulistana',
      neighborhood: 'Centro',
      avatar: 'assets/images/icon-user.png',
      bio: 'Perfil oficial e verificado no Itaim Vende.',
      role: 'admin',
    },
  });

  const clientePasswordHash = await bcrypt.hash('cliente123', 10);
  const clienteUser = await prisma.user.upsert({
    where: { email: 'cliente@gmail.com' },
    update: {},
    create: {
      name: 'Kayky',
      username: 'kayky_dev',
      email: 'cliente@gmail.com',
      password: clientePasswordHash,
      phone: '(89) 99400-0000',
      city: 'Paulistana',
      neighborhood: 'Itaim',
      role: 'buyer',
    },
  });
  console.log('✅ Usuários Admin e Cliente de teste cadastrados.');

  // 3. Produtos Base do Catálogo
  const produtosIniciais = [
    {
      title: 'Smart TV 4K 50" UHD HDR Dolby Audio Crystal',
      description: 'Smart TV 4K novinha, excelente estado de conservação, tela sem riscos com suporte e controle original.',
      price: 2199.00,
      originalPrice: 2499.00,
      discount: 12,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/images/produtos/anuncio_13.jpg'],
      isFeatured: true,
    },
    {
      title: 'Controle Sem Fio DualSense Midnight Black',
      description: 'Controle sem fio com resposta tátil imersiva e gatilhos adaptáveis. Na caixa com manuais.',
      price: 389.90,
      originalPrice: 450.00,
      discount: 13,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/images/banner-controle.png'],
      isFeatured: true,
    },
    {
      title: 'Bicicleta Mountain Bike Aro 29 Câmbio Shimano 21V',
      description: 'Mountain Bike seminova com freios a disco mecânicos e amortecedor dianteiro revisado.',
      price: 1350.00,
      originalPrice: 1600.00,
      discount: 15,
      condition: 'USADO',
      categorySlug: 'esportes',
      images: ['assets/images/produtos/anuncio_15.jpg'],
      isFeatured: false,
    },
    {
      title: 'Sofá Retrátil e Reclinável 3 Lugares Veludo',
      description: 'Sofá super confortável em veludo suede, retrátil e reclinável com espumas D28.',
      price: 1899.90,
      condition: 'NOVO',
      categorySlug: 'moveis',
      images: ['assets/images/produtos/anuncio_10.jpg'],
      isFeatured: false,
    },
    {
      title: 'Kit Jaqueta Casual Premium + Calça Slim Streetwear',
      description: 'Conjunto moderno e versátil para o dia a dia, tecido confortável e acabamento impecável.',
      price: 249.00,
      originalPrice: 299.00,
      discount: 16,
      condition: 'NOVO',
      categorySlug: 'moda',
      images: ['assets/images/produtos/anuncio_11.jpg'],
      isFeatured: true,
    },
    {
      title: 'Notebook Ultrafino Core i7 16GB RAM SSD 512GB',
      description: 'Notebook potente e ultraleve, bateria durando mais de 8 horas, ideal para trabalho e estudos.',
      price: 4299.00,
      originalPrice: 4899.00,
      discount: 12,
      condition: 'NOVO',
      categorySlug: 'eletronicos',
      images: ['assets/images/pc.png'],
      isFeatured: true,
    },
  ];

  for (const p of produtosIniciais) {
    const catId = categoryMap[p.categorySlug] || categoryMap['eletronicos'];
    const existing = await prisma.product.findFirst({
      where: { title: p.title },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice || null,
          discount: p.discount || 0,
          condition: p.condition,
          isFeatured: p.isFeatured,
          images: JSON.stringify(p.images),
          categoryId: catId,
          sellerId: adminUser.id,
        },
      });
    }
  }

  console.log(`✅ Produtos base inseridos com sucesso!`);
  console.log('🎉 Seed finalizado.');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
