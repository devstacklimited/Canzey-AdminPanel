import { createProductPrizesTable, insertSampleProductPrizes } from './database/add_product_prizes.js';

console.log('🚀 Setting up Product-Prize system...');

async function setupProductPrizes() {
  try {
    console.log('📋 Creating product_prizes table...');
    const tableCreated = await createProductPrizesTable();
    
    if (tableCreated) {
      console.log('📝 Inserting sample product-prize mappings...');
      await insertSampleProductPrizes();
      console.log('✅ Product-Prize setup completed successfully!');
    } else {
      console.log('❌ Failed to create product_prizes table');
    }
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupProductPrizes();
