import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * GET /api/admin/products
 * List all products (admin)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const result = await listProducts();

  if (!result.success) {
    return res.status(500).json({ success: false, message: result.error });
  }

  res.json(result);
});

/**
 * GET /api/admin/products/:id
 * Get single product details (admin)
 */
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);
  const result = await getProductById(productId);

  if (!result.success) {
    return res.status(404).json({ success: false, message: result.error });
  }

  res.json(result);
});

/**
 * POST /api/admin/products
 * Create product (admin)
 * Body expects JSON with:
 *  - name, slug, description, sku, price, sale_price, stock_quantity, status
 *  - category_ids: number[]
 *  - image_urls: string[]
 */
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const result = await createProduct(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.status(201).json(result);
});

/**
 * PUT /api/admin/products/:id
 * Update product (admin)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);
  const result = await updateProduct(productId, req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.json(result);
});

/**
 * DELETE /api/admin/products/:id
 * Soft delete product (set inactive)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const productId = parseInt(req.params.id);
  const result = await deleteProduct(productId);

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.json(result);
});

/**
 * GET /api/admin/products/categories
 * List categories for dropdowns
 */
router.get('/categories/list/all', authenticateToken, requireAdmin, async (req, res) => {
  const result = await listCategories();

  if (!result.success) {
    return res.status(500).json({ success: false, message: result.error });
  }

  res.json(result);
});

/**
 * POST /api/admin/products/categories
 * Create new category
 */
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  const result = await createCategory(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.status(201).json(result);
});

export default router;
