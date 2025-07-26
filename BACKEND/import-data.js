const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Data validation and cleaning functions
const cleanString = (str) => {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.trim();
  return cleaned.length > 0 ? cleaned : null;
};

const cleanCollegeData = (college) => {
  const name = cleanString(college['College Name']);
  const district = cleanString(college['District']);
  const state = cleanString(college['State']);
  
  // Only return data if required fields are present
  if (!name || !district || !state) {
    return null;
  }
  
  return {
    collegeId: college['College ID'] && !isNaN(college['College ID']) ? parseInt(college['College ID']) : null,
    name: name,
    addressLine1: cleanString(college['Address Line 1']) || null,
    addressLine2: cleanString(college['Address Line 2']) || null,
    city: cleanString(college['City']) || null,
    district: district,
    state: state,
    pincode: college['Pincode'] && !isNaN(college['Pincode']) ? parseInt(college['Pincode']) : null
  };
};

const cleanDegreeData = (degree) => {
  return {
    name: cleanString(degree['Degree Program'])
  };
};

// Mapping from short degree names to full degree names
const degreeNameMapping = {
  'B.Tech': 'Bachelor of Technology (B.Tech)',
  'MCA': 'Master of Computer Applications (MCA)',
  'BCA': 'Bachelor of Computer Applications (BCA)',
  'MBA': 'Master of Business Administration (MBA)',
  'M.Tech': 'Master of Technology (M.Tech)',
  'B.Sc': 'Bachelor of Science (B.Sc)',
  'M.Sc': 'Master of Science (M.Sc)',
  'BA': 'Bachelor of Arts (BA)',
  'MA': 'Master of Arts (MA)',
  'B.Com': 'Bachelor of Commerce (B.Com)',
  'M.Com': 'Master of Commerce (M.Com)',
  'BBA': 'Bachelor of Business Administration (BBA)',
  'BDS': 'Bachelor of Dental Surgery (BDS)',
  'MBBS': 'Bachelor of Medicine',
  'BAMS': 'Bachelor of Ayurvedic Medicine and Surgery (BAMS)',
  'MD': 'Doctor of Medicine (MD)',
  'BFA': 'Bachelor of Fine Arts (BFA)',
  'MFA': 'Master of Fine Arts (MFA)',
  'B.Des': 'Bachelor of Design (B.Des)',
  'M.Des': 'Master of Design (M.Des)',
  'LLB': 'Bachelor of Laws (LLB)',
  'LLM': 'Master of Laws (LLM)',
  'B.Ed': 'Bachelor of Education (B.Ed)',
  'M.Ed': 'Master of Education (M.Ed)',
  'B.VSc': 'Bachelor of Veterinary Science (B.VSc)',
  'M.VSc': 'Master of Veterinary Science (M.VSc)',
  'BPT': 'Bachelor of Physiotherapy (BPT)',
  'MPT': 'Master of Physiotherapy (MPT)',
  'BHMS': 'Bachelor of Homoeopathic Medicine and Surgery (BHMS)',
  'B.Lib': 'Bachelor of Library Science (B.Lib)',
  'M.Lib': 'Master of Library Science (M.Lib)',
  'BHM': 'Bachelor of Hotel Management (BHM)',
  'MHM': 'Master of Hotel Management (MHM)'
};

const cleanSpecializationData = (specialization) => {
  const shortDegreeName = cleanString(specialization['Degree Program']);
  const fullDegreeName = degreeNameMapping[shortDegreeName] || shortDegreeName;
  
  return {
    degreeName: fullDegreeName,
    specializationName: cleanString(specialization['Specialization'])
  };
};

// Import functions
async function importColleges(jsonFilePath) {
  console.log('🏫 Starting college data import...');
  
  try {
    // Clear existing college data
    console.log('🗑️ Clearing existing college data...');
    await prisma.college.deleteMany({});
    console.log('✅ Existing college data cleared');

    // Read and parse JSON
    console.log(`📖 Reading college data from: ${jsonFilePath}`);
    const collegeData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log(`📊 Found ${collegeData.length} colleges in JSON`);

    // Clean and validate data
    const validColleges = collegeData
      .map(cleanCollegeData)
      .filter(college => college !== null);

    console.log(`✅ Valid colleges after cleaning: ${validColleges.length}`);

    // Import in batches
    const batchSize = 100;
    let importedCount = 0;
    
    for (let i = 0; i < validColleges.length; i += batchSize) {
      const batch = validColleges.slice(i, i + batchSize);
      
      await prisma.college.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      importedCount += batch.length;
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validColleges.length / batchSize)} (${importedCount}/${validColleges.length})`);
    }

    // Verify import
    const totalColleges = await prisma.college.count();
    console.log(`🎉 Successfully imported ${totalColleges} colleges`);

    // Show statistics
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

    return { success: true, count: totalColleges };

  } catch (error) {
    console.error('❌ College import failed:', error);
    throw error;
  }
}

async function importDegrees(jsonFilePath) {
  console.log('🎓 Starting degree data import...');
  
  try {
    // Clear existing degree and specialization data
    console.log('🗑️ Clearing existing degree and specialization data...');
    await prisma.specialization.deleteMany({});
    await prisma.degree.deleteMany({});
    console.log('✅ Existing degree and specialization data cleared');

    // Read and parse JSON
    console.log(`📖 Reading degree data from: ${jsonFilePath}`);
    const degreeData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log(`📊 Found ${degreeData.length} degrees in JSON`);

    // Clean and validate data
    const validDegrees = degreeData
      .map(cleanDegreeData)
      .filter(degree => degree.name);

    console.log(`✅ Valid degrees after cleaning: ${validDegrees.length}`);

    // Import degrees
    const importedDegrees = await prisma.degree.createMany({
      data: validDegrees,
      skipDuplicates: true
    });

    console.log(`🎉 Successfully imported ${importedDegrees.count} degrees`);

    return { success: true, count: importedDegrees.count };

  } catch (error) {
    console.error('❌ Degree import failed:', error);
    throw error;
  }
}

async function importSpecializations(jsonFilePath) {
  console.log('🔬 Starting specialization data import...');
  
  try {
    // Read and parse JSON
    console.log(`📖 Reading specialization data from: ${jsonFilePath}`);
    const specializationData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    console.log(`📊 Found ${specializationData.length} specializations in JSON`);

    // Clean and validate data
    const validSpecializations = specializationData
      .map(cleanSpecializationData)
      .filter(spec => spec.degreeName && spec.specializationName);

    console.log(`✅ Valid specializations after cleaning: ${validSpecializations.length}`);

    // Get all degrees for mapping
    const degrees = await prisma.degree.findMany();
    const degreeMap = new Map(degrees.map(d => [d.name, d.id]));

    // Create specializations with proper degree mapping
    const specializationsToCreate = validSpecializations
      .map(spec => {
        const degreeId = degreeMap.get(spec.degreeName);
        if (!degreeId) {
          console.warn(`⚠️ Degree not found: ${spec.degreeName}`);
          return null;
        }
        return {
          name: spec.specializationName,
          degreeId: degreeId
        };
      })
      .filter(spec => spec !== null);

    console.log(`✅ Specializations with valid degree mapping: ${specializationsToCreate.length}`);

    // Import in batches
    const batchSize = 100;
    let importedCount = 0;
    
    for (let i = 0; i < specializationsToCreate.length; i += batchSize) {
      const batch = specializationsToCreate.slice(i, i + batchSize);
      
      await prisma.specialization.createMany({
        data: batch,
        skipDuplicates: true
      });
      
      importedCount += batch.length;
      console.log(`✅ Imported specialization batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(specializationsToCreate.length / batchSize)} (${importedCount}/${specializationsToCreate.length})`);
    }

    // Verify import
    const totalSpecializations = await prisma.specialization.count();
    console.log(`🎉 Successfully imported ${totalSpecializations} specializations`);

    return { success: true, count: totalSpecializations };

  } catch (error) {
    console.error('❌ Specialization import failed:', error);
    throw error;
  }
}

// Main import function
async function importAllData() {
  console.log('🚀 Starting comprehensive data import...');
  
  try {
    const basePath = path.join(__dirname, '..', 'FRONTEND', 'public', 'assets');
    
    // Import colleges
    const collegeResult = await importColleges(path.join(basePath, 'College.json'));
    
    // Import degrees
    const degreeResult = await importDegrees(path.join(basePath, 'Degree.json'));
    
    // Import specializations
    const specializationResult = await importSpecializations(path.join(basePath, 'Degree Specialisation.json'));
    
    console.log('\n🎉 All data imported successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Colleges: ${collegeResult.count}`);
    console.log(`   - Degrees: ${degreeResult.count}`);
    console.log(`   - Specializations: ${specializationResult.count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI usage
if (require.main === module) {
  importAllData()
    .then(() => {
      console.log('✅ Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importAllData, importColleges, importDegrees, importSpecializations }; 