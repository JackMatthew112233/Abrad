import ExcelJS from 'exceljs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function previewExcel() {
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
  
  console.log(`📊 Total rows: ${worksheet.rowCount}\n`);
  
  // Show header row
  console.log('📋 HEADER ROW (Row 1):');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    console.log(`Column ${colNumber}: ${cell.value}`);
  });
  
  // Show first 3 data rows
  console.log('\n📝 SAMPLE DATA (Rows 2-4):');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  for (let rowNumber = 2; rowNumber <= Math.min(4, worksheet.rowCount); rowNumber++) {
    console.log(`--- ROW ${rowNumber} ---`);
    const row = worksheet.getRow(rowNumber);
    row.eachCell((cell, colNumber) => {
      if (cell.value) {
        console.log(`  Col ${colNumber}: ${cell.value}`);
      }
    });
    console.log('');
  }
}

previewExcel().catch(console.error);
