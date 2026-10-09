import prisma from '../config/prisma.js';

/**
 * Lista todos os produtos com filtros avançados
 */
export async function listProducts(req, res, next) {
  try {
    const {
      search,
      categoryId,
      category,
      minPrice,
      maxPrice,
      condition,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: 'ATIVO',
    };

    // Filtro por texto (título ou descrição)
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    // Filtro por categoria (por ID ou slug/nome)
    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    } else if (category && category !== 'todos') {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category.toLowerCase() },
            { name: { contains: category } },
          ],
        },
      });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    // Filtro por faixa de preço
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filtro por condição
    if (condition && ['NOVO', 'USADO'].includes(condition.toUpperCase())) {
      where.condition = condition.toUpperCase();
    }

    // Ordenação
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              city: true,
              neighborhood: true,
              avatar: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    // Desserializa imagens JSON para array de strings
    const formattedProducts = products.map((p) => {
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(p.images);
      } catch (e) {
        parsedImages = [p.images];
      }
      return {
        ...p,
        images: parsedImages,
        imagem: parsedImages[0] || 'assets/images/produtos/anuncio_13.jpg',
        fotos: parsedImages,
        titulo: p.title,
        preco: p.price,
        descricao: p.description,
        categoria: p.category.name,
        cidade: p.seller.city || 'Paulistana',
        bairro: p.seller.neighborhood || 'Centro',
        vendedor: p.seller.name,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtém produto por ID
 */
export async function getProductById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID do produto inválido.' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            city: true,
            neighborhood: true,
            phone: true,
            avatar: true,
            bio: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    let parsedImages = [];
    try {
      parsedImages = JSON.parse(product.images);
    } catch (e) {
      parsedImages = [product.images];
    }

    res.status(200).json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        imagem: parsedImages[0] || 'assets/images/produtos/anuncio_13.jpg',
        fotos: parsedImages,
        titulo: product.title,
        preco: product.price,
        descricao: product.description,
        categoria: product.category.name,
        cidade: product.seller.city,
        bairro: product.seller.neighborhood,
        vendedor: product.seller.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cadastra um novo anúncio de produto
 */
export async function createProduct(req, res, next) {
  try {
    const sellerId = req.user.id;
    const {
      title,
      description,
      price,
      originalPrice,
      categoryId,
      condition,
      isFeatured,
      images,
    } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(400).json({ success: false, message: 'Categoria informada não existe.' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        originalPrice: originalPrice || null,
        categoryId,
        condition: condition || 'NOVO',
        isFeatured: Boolean(isFeatured),
        images: JSON.stringify(images),
        sellerId,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            city: true,
            neighborhood: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Anúncio publicado com sucesso!',
      data: {
        ...product,
        images,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualiza um produto existente
 */
export async function updateProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    // Apenas o vendedor proprietário ou um admin podem alterar
    if (existing.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão para alterar este anúncio.' });
    }

    const { images, ...otherData } = req.body;
    const updateData = { ...otherData };
    if (images) {
      updateData.images = JSON.stringify(images);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove / Exclui um produto
 */
export async function deleteProduct(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    if (existing.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissão para remover este anúncio.' });
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Anúncio removido com sucesso.',
    });
  } catch (error) {
    next(error);
  }
}
