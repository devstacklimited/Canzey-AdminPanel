import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import productUpload from '../middleware/productUpload.js';
import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  updateProductStatus,
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
 *  - images: files (up to 10)
 */
router.post('/', authenticateToken, requireAdmin, productUpload.array('images', 10), async (req, res) => {
  try {
    const productData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.image_urls = req.files.map(file => `/uploads/products/${file.filename}`);
    } else {
      productData.image_urls = [];
    }
    
    // Parse category_ids if sent as string
    if (typeof productData.category_ids === 'string') {
      productData.category_ids = JSON.parse(productData.category_ids);
    }
    
    const result = await createProduct(productData);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/admin/products/:id
 * Update product (admin)
 */
router.put('/:id', authenticateToken, requireAdmin, productUpload.array('images', 10), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    
    // Handle uploaded images (new images)
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      
      // If there are existing images, combine them
      if (productData.existing_images) {
        const existingImages = typeof productData.existing_images === 'string' 
          ? JSON.parse(productData.existing_images) 
          : productData.existing_images;
        productData.image_urls = [...existingImages, ...newImageUrls];
      } else {
        productData.image_urls = newImageUrls;
      }
    } else if (productData.existing_images) {
      // No new images, keep existing ones
      productData.image_urls = typeof productData.existing_images === 'string'
        ? JSON.parse(productData.existing_images)
        : productData.existing_images;
    }
    
    // Parse category_ids if sent as string
    if (typeof productData.category_ids === 'string') {
      productData.category_ids = JSON.parse(productData.category_ids);
    }
    
    const result = await updateProduct(productId, productData);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/admin/products/:id/status
 * Update product status only (admin)
 */
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await updateProductStatus(productId, status);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/admin/products/:id
 * Soft delete product (admin)
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
