import path, { join } from "path";
import { pathToFileURL } from "url";
import * as xlsx from "xlsx";
const fs = require("fs");


const writeFileXLSX = async (data: any) => {
  try {
    const dirName = path.dirname(__filename);
    // Define the part you want to remove
    const partToRemove = "/app/utilities";
    // Check if the partToRemove exists in the dirName and remove it
    const modifiedDirName = dirName.includes(partToRemove) ? dirName.replace(partToRemove, '') : dirName;
    const pathString = modifiedDirName;
    const fileName =  `${Date.now()}.xlsx`;
    
    if (!fs.existsSync(pathString)) {
      fs.mkdirSync(pathString, { recursive: true });
    }
    
    const filePath = path.join(pathString, fileName);
    const workbook = xlsx.utils.book_new();
    var ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, ws, "Results");
    xlsx.writeFile(workbook, filePath);

    return filePath;
  } catch (error) {
    console.log("Error ", error);
  }
};
const readFile = async (filepath: any) => {
  const file = await xlsx.readFile(filepath);
  const sheetName = file.SheetNames[0];
  const sheet = file.Sheets[sheetName];
  const sheetData: any = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  return sheetData;
};
const exportXlFile = async (data: any, sheetname: string) => {
  // try {

  const pathString = "./public/xlsx";
  console.log("pathString", pathString)
  const fileName = sheetname + ".xlsx";
  let pathName = pathString + "/" + fileName;
  pathName = pathName.substring(1);

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // const excelBuffer = xlsx.write(workbook, {
  //   type: "buffer",
  //   bookType: "xlsx",
  // });
  // console.log(excelBuffer);
  // console.log(pathName)
  // const fileWrite = await xlsx.writeFile(workbook, pathName, { type: "file" });
  // console.log(fileWrite)
  //  console.log(pathName);
  xlsx.writeFile(workbook, pathName, { type: "file" });
  return pathName;
  // } catch (e) {
  //   console.error("Error occurred while exporting Excel file:", e);
  //   throw e;
  // }
};

export { writeFileXLSX, readFile, exportXlFile };