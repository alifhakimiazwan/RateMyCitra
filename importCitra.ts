const { connectDB } = require("@/lib/db/mongodb");
const { Citra } = require("@/lib/db/schema");
const xlsx = require("xlsx");
const fs = require("fs");

interface CitraData {
  name: string;
  courseCode: string;
  citraType: string;
  faculty: string;
}

async function importCitraData() {
  await connectDB();

  const filePath = "./CitraList.xlsx";
  if (!fs.existsSync(filePath)) {
    console.log("Excel file not found!");
    return;
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data: CitraData[] = xlsx.utils.sheet_to_json<CitraData>(
    workbook.Sheets[sheetName]
  );

  const formattedData = data.map((row: CitraData) => ({
    name: row.name,
    courseCode: row.courseCode,
    citraType: row.citraType,
    faculty: row.faculty,
  }));

  const result = await Citra.insertMany(formattedData);
  console.log(`${formattedData.length} Citra subjects added!`);
}

importCitraData().catch(console.error);
