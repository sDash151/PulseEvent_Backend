const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const prisma = new PrismaClient();

async function importColleges(csvFilePath) {
  console.log('🚀 Starting college data import...');
  
  try {
    // Clear existing college data
    console.log('🗑️ Clearing existing college data...');
    await prisma.college.deleteMany({});
    console.log('✅ Existing college data cleared');

    const colleges = [];
    
    // Read CSV file
    console.log(`📖 Reading CSV file: ${csvFilePath}`);
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to database fields
          // Adjust these field names based on your CSV structure
          const college = {
            name: row['College Name'] || row['Name'] || row['college_name'] || '',
            address: row['Address'] || row['address'] || null,
            city: row['City'] || row['city'] || null,
            district: row['District'] || row['district'] || '',
            state: row['State'] || row['state'] || ''
          };
          
          // Only add if we have at least name, district, and state
          if (college.name && college.district && college.state) {
            colleges.push(college);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Found ${colleges.length} colleges in CSV`);

    // Insert colleges in batches
    const batchSize = 100;
    for (let i = 0; i < colleges.length; i += batchSize) {
      const batch = colleges.slice(i, i + batchSize);
      await prisma.college.createMany({
        data: batch,
        skipDuplicates: true
      });
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(colleges.length / batchSize)}`);
    }

    // Verify import
    const totalColleges = await prisma.college.count();
    console.log(`🎉 Successfully imported ${totalColleges} colleges`);

    // Show some statistics
    const states = await prisma.college.findMany({
      select: { state: true },
      distinct: ['state']
    });
    console.log(`📈 Total states: ${states.length}`);

    const districts = await prisma.college.findMany({
      select: { district: true },
      distinct: ['district']
    });
    console.log(`📈 Total districts: ${districts.length}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Usage instructions
if (require.main === module) {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.log('❌ Please provide the path to your CSV file');
    console.log('Usage: node import-colleges.js <path-to-csv-file>');
    console.log('');
    console.log('Expected CSV columns:');
    console.log('- College Name (or Name, college_name)');
    console.log('- Address (optional)');
    console.log('- City (optional)');
    console.log('- District');
    console.log('- State');
    process.exit(1);
  }

  if (!fs.existsSync(csvFilePath)) {
    console.log(`❌ CSV file not found: ${csvFilePath}`);
    process.exit(1);
  }

  importColleges(csvFilePath)
    .then(() => {
      console.log('✅ Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importColleges }; 