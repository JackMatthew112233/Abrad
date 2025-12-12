import ExcelJS from 'exceljs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeExcel() {
  const excelPath = path.join(
    __dirname,
    '../../frontend/public/data/Data santri abrad 2025.xlsx'
  );
  
  console.log(`📂 Reading file: ${excelPath}\n`);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  
  const worksheet = workbook.getWorksheet(1);
  
  if (!worksheet) {
    console.error('❌ Worksheet not found!');
    return;
  }
  
  console.log(`📊 Total rows: ${worksheet.rowCount}`);
  console.log(`📊 Total columns: ${worksheet.columnCount}\n`);
  
  // Cari header row yang sebenarnya
  console.log('🔍 Analyzing first 10 rows to find headers...\n');
  
  for (let rowNumber = 1; rowNumber <= Math.min(10, worksheet.rowCount); rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ROW ${rowNumber}:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    let hasData = false;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      hasData = true;
      const value = cell.value;
      const type = typeof value;
      console.log(`  [${colNumber}] ${value} (${type})`);
    });
    
    if (!hasData) {
      console.log('  (Empty row)');
    }
  }
  
  // Show sample data rows
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 DETAILED SAMPLE DATA ROWS (5 rows):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (let rowNumber = 4; rowNumber <= Math.min(8, worksheet.rowCount); rowNumber++) {
    console.log(`\n▼ ROW ${rowNumber}`);
    console.log('─'.repeat(60));
    
    const row = worksheet.getRow(rowNumber);
    const maxCol = 30; // Check up to column 30
    
    for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
      const cell = row.getCell(colNumber);
      if (cell.value) {
        console.log(`  Col ${String(colNumber).padStart(2, '0')}: ${cell.value}`);
      }
    }
  }
}

analyzeExcel().catch(console.error);
