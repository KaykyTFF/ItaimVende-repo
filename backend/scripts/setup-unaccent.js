import prisma from '../src/config/prisma.js';

async function main() {
  console.log('--- Aplicando Índices de Performance e Unaccent no PostgreSQL ---');
  try {
    // 1. Extensão unaccent
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS unaccent;');
    console.log('✅ Extensão unaccent: ativa');

    // 2. Função imutável unaccent_text
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION unaccent_text(text)
      RETURNS text AS $$
        SELECT unaccent($1);
      $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;
    `);
    console.log('✅ Função imutável unaccent_text: pronta');

    // 3. Índices de performance no modelo Product
    console.log('Criando índices de alta performance no PostgreSQL...');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_status_createdAt_idx" 
      ON "Product"("status", "createdAt" DESC);
    `);
    console.log('✅ Índice [status, createdAt DESC]: criado');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_city_categoryId_idx" 
      ON "Product"("city", "categoryId");
    `);
    console.log('✅ Índice [city, categoryId]: criado');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_status_city_idx" 
      ON "Product"("status", "city");
    `);
    console.log('✅ Índice [status, city]: criado');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_status_categoryId_idx" 
      ON "Product"("status", "categoryId");
    `);
    console.log('✅ Índice [status, categoryId]: criado');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_status_isFeatured_createdAt_idx" 
      ON "Product"("status", "isFeatured", "createdAt" DESC);
    `);
    console.log('✅ Índice [status, isFeatured, createdAt DESC]: criado');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_sellerId_status_idx" 
      ON "Product"("sellerId", "status");
    `);
    console.log('✅ Índice [sellerId, status]: criado');

    // 4. Também criamos índice funcional unaccent para buscas textuais ultrarrápidas
    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Product_title_unaccent_trgm_idx" 
        ON "Product" USING gin (unaccent_text(lower("title")) gin_trgm_ops);
      `);
      console.log('✅ Índice GIN Trigram com unaccent para títulos: criado');
    } catch (trgmErr) {
      console.log('ℹ️ Extensão pg_trgm opcional: ignorada ou já existente');
    }

    // 5. Lista os índices criados na tabela Product para confirmação
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Product';
    `);
    console.log('\nTodos os índices ativos na tabela Product:');
    indexes.forEach((idx) => console.log(` - ${idx.indexname}`));

  } catch (err) {
    console.error('❌ Erro ao aplicar índices:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
