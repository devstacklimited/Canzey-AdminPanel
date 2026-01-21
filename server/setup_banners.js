import { createBannersTable, insertSampleBanners } from './database/add_banners_table.js';

console.log('🚀 Setting up Banners system...');

async function setupBanners() {
  try {
    console.log('📋 Creating banners table...');
    const tableCreated = await createBannersTable();
    
    if (tableCreated) {
      console.log('📝 Inserting sample banners...');
      await insertSampleBanners();
      console.log('✅ Banners setup completed successfully!');
    } else {
      console.log('❌ Failed to create banners table');
    }
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupBanners();
