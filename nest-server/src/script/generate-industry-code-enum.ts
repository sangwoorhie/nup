// npx ts-node src/script/generate-industry-code-enum.ts

import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as iconv from 'iconv-lite';

// Path to the CSV file
const csvFilePath = path.join(__dirname, './업종코드.csv');

// Function to read and parse the CSV file
function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('euc-kr')) // Adjust the encoding if necessary
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Function to create enum from CSV data
function createEnum(data: any[]): { [key: string]: string } {
  const enumObject: { [key: string]: string } = {};
  data.forEach((row) => {
    // Log the row to understand its structure
    console.log('Row:', row);

    // Using trimmed keys to avoid whitespace issues
    const key = row['대분류코드']?.trim(); // Using '소분류코드' as the key
    const value = row['대분류명']?.trim(); // Using '소분류명' as the value

    // Log the key and value to check if they are correctly retrieved
    console.log('Key:', key, 'Value:', value);

    if (key && value) {
      enumObject[key] = value;
    }
  });
  return enumObject;
}

// Main function to execute the script
async function main() {
  try {
    const data = await readCSV(csvFilePath);
    const enumObject = createEnum(data);
    const enumString = `export enum IndustryCode {\n${Object.entries(enumObject)
      .map(([key, value]) => `  ${key} = '${value}'`)
      .join(',\n')}\n};`;
    fs.writeFileSync(
      path.join(__dirname, '../enums/industry_code.ts'),
      enumString,
    );
    console.log('Enum created successfully:', enumObject);
  } catch (error) {
    console.error('Error reading CSV file:', error);
  }
}

main();
