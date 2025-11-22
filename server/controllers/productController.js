import pool from '../database/connection.js';

/**
 * List all products with basic info, main image and stock
 */
export async function listProducts() {
  try {
    console.log('🧾 [LIST PRODUCTS] Request received');

    const connection = await pool.getConnection();

    const [products] = await connection.execute(`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.sku,
        p.price,
        p.sale_price,
        p.stock_quantity,
        p.main_image_url,
        p.status,
        p.created_at,
        p.updated_at
      FROM products p
      ORDER BY p.created_at DESC
    `);

    // Fetch categories for all products in one query
    const [productCategories] = await connection.execute(`
      SELECT 
        pc.product_id,
        c.id as category_id,
        c.name as category_name
      FROM product_categories pc
      JOIN categories c ON pc.category_id = c.id
    `);

    // Group categories by product
    const categoriesByProduct = {};
    for (const row of productCategories) {
      if (!categoriesByProduct[row.product_id]) {
        categoriesByProduct[row.product_id] = [];
      }
      categoriesByProduct[row.product_id].push({
        id: row.category_id,
        name: row.category_name,
      });
    }

    // Attach categories
    const result = products.map((p) => ({
      ...p,
      categories: categoriesByProduct[p.id] || [],
    }));

    connection.release();

    console.log('✅ [LIST PRODUCTS] Found', result.length, 'products');
    return { success: true, products: result };
  } catch (error) {
    console.error('❌ [LIST PRODUCTS] Error:', error.message);
    return { success: false, error: 'Server error while listing products' };
  }
}

/**
 * Helper: upsert product categories
 */
async function upsertProductCategories(connection, productId, categoryIds = []) {
  // Remove existing
  await connection.execute('DELETE FROM product_categories WHERE product_id = ?', [productId]);

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return;

  const values = categoryIds.map((cid) => [productId, cid]);
  await connection.query(
    'INSERT INTO product_categories (product_id, category_id) VALUES ?;',
    [values]
  );
}

/**
 * Helper: upsert product images
 * For now we expect an array of image URLs from the admin UI.
 */
async function upsertProductImages(connection, productId, images = []) {
  // Remove existing
  await connection.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);

  if (!Array.isArray(images) || images.length === 0) return;

  const values = images.map((url, index) => [
    productId,
    url,
    null, // alt_text (optional for now)
    index === 0, // is_primary
    index, // sort_order
  ]);

  await connection.query(
    'INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES ?;',
    [values]
  );
}

/**
 * Create a new product with categories and images
 */
export async function createProduct(productData) {
  const connection = await pool.getConnection();

  try {
    console.log('📝 [CREATE PRODUCT] Request received');
    console.log('   Product data:', productData);

    const {
      name,
      slug,
      description,
      sku,
      price,
      sale_price,
      stock_quantity,
      status = 'active',
      category = '',
      sub_category = '',
      for_gender = '',
      is_customized = false,
      image_urls = [],
    } = productData;

    if (!name || price === undefined) {
      return { success: false, error: 'Name and price are required' };
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO products 
       (name, slug, description, sku, price, sale_price, stock_quantity, category, sub_category, for_gender, is_customized, main_image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug || null,
        description || null,
        sku || null,
        price,
        sale_price || null,
        stock_quantity ||0,
        category || null,
        sub_category || null,
        for_gender || null,
        is_customized || false,
        image_urls[0] || null,
        status,
      ]
    );

    const productId = result.insertId;

    // Images
    await upsertProductImages(connection, productId, image_urls);

    await connection.commit();
    connection.release();

    console.log('✅ [CREATE PRODUCT] Product created with ID', productId);
    return { success: true, product_id: productId, message: 'Product created successfully' };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('❌ [CREATE PRODUCT] Error:', error);

    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('slug')) {
        return { success: false, error: 'A product with this URL slug already exists. Please change the Name or Slug.' };
      }
      if (error.message.includes('sku')) {
        return { success: false, error: 'A product with this SKU already exists.' };
      }
      return { success: false, error: 'This product already exists (duplicate entry).' };
    }

    return { success: false, error: 'Server error while creating product' };
  }
}

/**
 * Get single product with categories and images
 */
export async function getProductById(productId) {
  try {
    const connection = await pool.getConnection();

    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      connection.release();
      return { success: false, error: 'Product not found' };
    }

    const product = products[0];

    // We no longer use product_categories table, categories are in the product table
    // But we keep the structure for compatibility if needed, or just return empty array
    const categories = []; 

    const [images] = await connection.execute(
      `SELECT id, image_url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY sort_order ASC, id ASC`,
      [productId]
    );

    connection.release();

    return {
      success: true,
      product: {
        ...product,
        categories,
        images,
      },
    };
  } catch (error) {
    console.error('❌ [GET PRODUCT] Error:', error.message);
    return { success: false, error: 'Server error while fetching product' };
  }
}

/**
 * Update product
 */
export async function updateProduct(productId, productData) {
  const connection = await pool.getConnection();

  try {
    console.log('📝 [UPDATE PRODUCT] Request received');
    console.log('   Product ID:', productId);
    console.log('   Product data:', productData);

    const {
      name,
      slug,
      description,
      sku,
      price,
      sale_price,
      stock_quantity,
      status,
      category = '',
      sub_category = '',
      for_gender = '',
      is_customized = false,
      image_urls = [],
    } = productData;

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE products
       SET name = ?, slug = ?, description = ?, sku = ?, price = ?, sale_price = ?,
           stock_quantity = ?, category = ?, sub_category = ?, for_gender = ?, is_customized = ?, main_image_url = ?, status = ?
       WHERE id = ?`,
      [
        name,
        slug || null,
        description || null,
        sku || null,
        price,
        sale_price || null,
        stock_quantity || 0,
        category || null,
        sub_category || null,
        for_gender || null,
        is_customized || false,
        image_urls[0] || null,
        status || 'active',
        productId,
      ]
    );

    // Images
    await upsertProductImages(connection, productId, image_urls);

    await connection.commit();
    connection.release();

    console.log('✅ [UPDATE PRODUCT] Product updated');
    return { success: true };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('❌ [UPDATE PRODUCT] Error:', error.message);
    return { success: false, error: 'Server error while updating product' };
  }
}

/**
 * Soft delete / deactivate product
 */
export async function deleteProduct(productId) {
  try {
    const connection = await pool.getConnection();

    await connection.execute(
      `UPDATE products SET status = 'inactive' WHERE id = ?`,
      [productId]
    );

    connection.release();

    console.log('✅ [DELETE PRODUCT] Product set to inactive');
    return { success: true };
  } catch (error) {
    console.error('❌ [DELETE PRODUCT] Error:', error.message);
    return { success: false, error: 'Server error while deleting product' };
  }
}

/**
 * List categories for dropdowns
 */
export async function listCategories() {
  try {
    const connection = await pool.getConnection();

    const [categories] = await connection.execute(
      `SELECT id, name, slug, parent_id, status, sort_order
       FROM categories
       ORDER BY sort_order ASC, name ASC`
    );

    connection.release();

    return { success: true, categories };
  } catch (error) {
    console.error('❌ [LIST CATEGORIES] Error:', error.message);
    return { success: false, error: 'Server error while listing categories' };
  }
}

/**
 * Create category
 */
export async function createCategory(data) {
  try {
    const connection = await pool.getConnection();

    const { name, slug, parent_id = null, description = null, status = 'active', sort_order = 0 } = data;

    if (!name) {
      return { success: false, error: 'Name is required' };
    }

    const [result] = await connection.execute(
      `INSERT INTO categories (name, slug, parent_id, description, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, slug || null, parent_id || null, description, status, sort_order]
    );

    connection.release();

    return { success: true, category_id: result.insertId };
  } catch (error) {
    console.error('❌ [CREATE CATEGORY] Error:', error.message);
    return { success: false, error: 'Server error while creating category' };
  }
}

/**
 * Update product status only
 */
export async function updateProductStatus(productId, status) {
  try {
    const connection = await pool.getConnection();

    await connection.execute(
      `UPDATE products SET status = ? WHERE id = ?`,
      [status, productId]
    );

    connection.release();

    console.log(`✅ [UPDATE STATUS] Product ${productId} status set to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('❌ [UPDATE STATUS] Error:', error.message);
    return { success: false, error: 'Server error while updating product status' };
  }
}
