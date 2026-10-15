import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../../config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const UPLOADS_VENDAS = path.join(UPLOADS_DIR, 'vendas');
const UPLOADS_PERFIL = path.join(UPLOADS_DIR, 'perfil');

/**
 * Lê arquivos de um diretório de forma segura
 */
function readFilesSafe(dirPath) {
    if (!fs.existsSync(dirPath)) return [];
    try {
        return fs.readdirSync(dirPath).filter((f) => {
            const fullPath = path.join(dirPath, f);
            try {
                return fs.statSync(fullPath).isFile() && !f.startsWith('.');
            } catch {
                return false;
            }
        });
    } catch {
        return [];
    }
}

/**
 * Retorna o tamanho em bytes de um arquivo
 */
function getFileSizeSafe(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch {
        return 0;
    }
}

/**
 * Normaliza caminho/nome de arquivo para comparação
 */
function extractBasename(urlOrPath) {
    if (!urlOrPath) return '';
    return path.basename(urlOrPath.replace(/\\/g, '/'));
}

/**
 * 1. AUDITORIA DE ARQUIVOS ÓRFÃOS NO STORAGE
 */
export async function auditStorageOrphans() {
    const vendasFiles = readFilesSafe(UPLOADS_VENDAS);
    const perfilFiles = readFilesSafe(UPLOADS_PERFIL);

    // Consulta referências no banco
    const [productImages, users] = await Promise.all([
        prisma.productImage.findMany({ select: { url: true, thumbnailUrl: true } }),
        prisma.user.findMany({ select: { avatar: true } }),
    ]);

    const activeImageNames = new Set();
    productImages.forEach((img) => {
        if (img.url) activeImageNames.add(extractBasename(img.url));
        if (img.thumbnailUrl) activeImageNames.add(extractBasename(img.thumbnailUrl));
    });

    users.forEach((u) => {
        if (u.avatar) activeImageNames.add(extractBasename(u.avatar));
    });

    const orphans = [];
    let totalOrphanBytes = 0;

    // Checa vendas
    vendasFiles.forEach((file) => {
        if (!activeImageNames.has(file)) {
            const fullPath = path.join(UPLOADS_VENDAS, file);
            const size = getFileSizeSafe(fullPath);
            totalOrphanBytes += size;
            orphans.push({
                folder: 'vendas',
                filename: file,
                sizeBytes: size,
                sizeFormatted: `${(size / 1024).toFixed(1)} KB`,
                path: fullPath,
            });
        }
    });

    // Checa perfil
    perfilFiles.forEach((file) => {
        if (!activeImageNames.has(file)) {
            const fullPath = path.join(UPLOADS_PERFIL, file);
            const size = getFileSizeSafe(fullPath);
            totalOrphanBytes += size;
            orphans.push({
                folder: 'perfil',
                filename: file,
                sizeBytes: size,
                sizeFormatted: `${(size / 1024).toFixed(1)} KB`,
                path: fullPath,
            });
        }
    });

    const totalFilesOnDisk = vendasFiles.length + perfilFiles.length;

    return {
        totalFilesOnDisk,
        referencedCount: totalFilesOnDisk - orphans.length,
        orphanCount: orphans.length,
        totalOrphanBytes,
        totalOrphanMb: Number((totalOrphanBytes / (1024 * 1024)).toFixed(2)),
        orphans: orphans.slice(0, 50), // Amostra de até 50
    };
}

/**
 * 2. LIMPEZA SEGURA DE ARQUIVOS ÓRFÃOS
 */
export async function cleanStorageOrphans() {
    const audit = await auditStorageOrphans();
    let deletedCount = 0;
    let freedBytes = 0;
    const errors = [];

    for (const item of audit.orphans) {
        try {
            if (fs.existsSync(item.path)) {
                fs.unlinkSync(item.path);
                deletedCount++;
                freedBytes += item.sizeBytes;
            }
        } catch (err) {
            errors.push({ file: item.filename, error: err.message });
        }
    }

    return {
        success: true,
        deletedCount,
        freedBytes,
        freedMb: Number((freedBytes / (1024 * 1024)).toFixed(2)),
        errors,
    };
}

/**
 * 3. GERADOR DE PRODUTOS DE DEMONSTRAÇÃO (DEMO SEED)
 */
export async function seedDemoProducts() {
    // Busca ou define o vendedor padrão
    const seller = await prisma.user.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
    });

    if (!seller) {
        throw new Error('Nenhum usuário ativo encontrado no banco para ser o vendedor.');
    }

    // Busca categorias disponíveis
    const categories = await prisma.category.findMany({ take: 5 });
    if (!categories || categories.length === 0) {
        throw new Error('Nenhuma categoria cadastrada no banco.');
    }

    const demoItems = [
        {
            title: `[DEMO] Smartphone Galaxy S22 128GB`,
            description: `Aparelho em excelente estado de conservação, sem riscos na tela, bateria 94%, com caixa original e carregador. Usado por 6 meses.`,
            price: 1850.00,
            condition: 'SEMINOVO',
            listingType: 'VENDA',
            categoryIndex: 0,
            isFeatured: true,
            acceptsTrade: true,
        },
        {
            title: `[DEMO] Bicicleta Mountain Bike Aro 29`,
            description: `Bicicleta aro 29 com 21 velocidades Shimano, freios a disco mecânicos, suspensão dianteira 100mm. Pouco usada, revisada recentemente.`,
            price: 980.00,
            condition: 'USADO',
            listingType: 'VENDA',
            categoryIndex: Math.min(1, categories.length - 1),
            isFeatured: false,
            acceptsTrade: true,
        },
        {
            title: `[DEMO] Fone Bluetooth ANC Over-Ear`,
            description: `Fone sem fio com cancelamento ativo de ruído (ANC), bateria para até 35 horas, conexão multiponto e áudio Hi-Res. Produto novo lacrado na caixa.`,
            price: 320.00,
            condition: 'NOVO',
            listingType: 'VENDA',
            categoryIndex: Math.min(2, categories.length - 1),
            isFeatured: true,
            acceptsTrade: false,
        },
    ];

    const created = [];
    for (const item of demoItems) {
        const cat = categories[item.categoryIndex] || categories[0];
        const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const slug = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${uniqueSuffix}`.replace(/-+/g, '-');

        const product = await prisma.product.create({
            data: {
                slug,
                title: item.title,
                description: item.description,
                price: item.price,
                condition: item.condition,
                listingType: item.listingType,
                status: 'ATIVO',
                isFeatured: item.isFeatured,
                acceptsTrade: item.acceptsTrade,
                city: 'Paulistana',
                state: 'PI',
                neighborhood: 'Centro',
                sellerId: seller.id,
                categoryId: cat.id,
                viewsCount: Math.floor(Math.random() * 50) + 10,
            },
        });
        created.push({ id: product.id, title: product.title, price: product.price, slug: product.slug });
    }

    return {
        count: created.length,
        products: created,
    };
}

/**
 * 4. REMOÇÃO DE PRODUTOS DE DEMONSTRAÇÃO
 */
export async function cleanDemoProducts() {
    const deleted = await prisma.product.deleteMany({
        where: {
            title: {
                startsWith: '[DEMO]',
            },
        },
    });

    return {
        deletedCount: deleted.count,
    };
}

/**
 * 5. VISÃO GERAL DE DADOS PARA MODERAÇÃO RÁPIDA
 */
export async function getRecentDataOverview() {
    const [recentProducts, recentUsers] = await Promise.all([
        prisma.product.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                price: true,
                status: true,
                createdAt: true,
                category: { select: { name: true } },
                seller: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma.user.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                isVerified: true,
                _count: { select: { products: true } },
            },
        }),
    ]);

    return {
        products: recentProducts,
        users: recentUsers,
    };
}

/**
 * 6. ALTERNA STATUS DE PRODUTO (ATIVO <-> PAUSADO)
 */
export async function toggleProductStatus(productId) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, status: true, title: true },
    });

    if (!product) {
        throw new Error('Produto não encontrado');
    }

    const newStatus = product.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO';

    const updated = await prisma.product.update({
        where: { id: productId },
        data: { status: newStatus },
        select: { id: true, status: true, title: true },
    });

    return updated;
}

/**
 * 7. ALTERNA STATUS DE USUÁRIO (ACTIVE <-> SUSPENDED)
 */
export async function toggleUserStatus(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, status: true, name: true },
    });

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
        select: { id: true, status: true, name: true },
    });

    return updated;
}
