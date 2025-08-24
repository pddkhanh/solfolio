import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
  console.log('🚀 Starting performance index optimization...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'add_performance_indexes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split SQL statements and execute them one by one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        console.log(`\n📊 Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Success');
        successCount++;
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log('⏭️  Skipped (already exists)');
          skipCount++;
        } else {
          console.error('❌ Error:', error.message);
          errorCount++;
        }
      }
    }
    
    console.log('\n📈 Performance Index Optimization Results:');
    console.log(`✅ Successfully created: ${successCount} indexes`);
    console.log(`⏭️  Skipped (existing): ${skipCount} indexes`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Verify critical indexes exist
    console.log('\n🔍 Verifying critical indexes...');
    const criticalIndexes = [
      { table: 'Position', columns: ['walletId', 'lastUpdated'] },
      { table: 'Balance', columns: ['walletId', 'lastUpdated'] },
      { table: 'TokenPrice', columns: ['lastUpdated'] },
      { table: 'Cache', columns: ['expiresAt'] },
      { table: 'Transaction', columns: ['walletAddress', 'blockTime'] },
    ];
    
    for (const index of criticalIndexes) {
      const result = await prisma.$queryRaw`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = ${index.table} 
        AND indexdef LIKE ${`%${index.columns.join('%')}%`}
        LIMIT 1
      `;
      
      if (Array.isArray(result) && result.length > 0) {
        console.log(`✅ ${index.table}: Index on (${index.columns.join(', ')}) exists`);
      } else {
        console.log(`⚠️  ${index.table}: Index on (${index.columns.join(', ')}) might be missing`);
      }
    }
    
    // Get database size and index statistics
    console.log('\n📊 Database Statistics:');
    
    const dbSize = await prisma.$queryRaw<any[]>`
      SELECT pg_database_size(current_database()) as size
    `;
    console.log(`Database size: ${(dbSize[0].size / 1024 / 1024).toFixed(2)} MB`);
    
    const indexStats = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as index_count,
        SUM(pg_relation_size(indexrelid)) as total_index_size
      FROM pg_indexes
      JOIN pg_class ON pg_class.relname = indexname
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY total_index_size DESC
    `;
    
    console.log('\nIndex statistics by table:');
    for (const stat of indexStats) {
      const sizeInMB = (stat.total_index_size / 1024 / 1024).toFixed(2);
      console.log(`  ${stat.tablename}: ${stat.index_count} indexes (${sizeInMB} MB)`);
    }
    
    console.log('\n✨ Performance index optimization complete!');
    
  } catch (error) {
    console.error('Fatal error during index optimization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
applyPerformanceIndexes().catch(console.error);