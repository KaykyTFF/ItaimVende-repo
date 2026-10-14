/**
 * ITAIM VENDE - PRODUCT SERVICE
 * Re-exporta os submódulos especializados do domínio de Produtos:
 * - product/product.formatter.js (Geração de Slugs e Formatação DTO)
 * - product/product.query.service.js (Consultas, Busca Paginada, Filtros e Detalhes)
 * - product/product.mutation.service.js (Criação, Edição, Deleção e Mudança de Status)
 * - product/product.seller.service.js (Painel do Anunciante e Vitrine Pública)
 */

export * from './product/index.js';
