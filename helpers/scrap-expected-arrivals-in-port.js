const axios = require("axios");
const { JSDOM } = require("jsdom");
const XLSX = require("xlsx");

const scrapExpectedArrivalsInPort = async (portId) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  const tableData = [];
  
  const url = `https://www.myshiptracking.com/estimate?pid=${portId}`;
  const { data } = await axios.get(url);
  const dom = new JSDOM(data);
  const document = dom.window.document;
  const iterations = Math.round(
    parseInt(
      document
        .getElementsByClassName("pb-2")[0]
        .querySelectorAll("div")[0]
        .textContent.split(" ")[5]
    ) / 50
  );

  for (let i = 1; i <= iterations; i++) {
    const url = `https://www.myshiptracking.com/estimate?sort=TIME&page=${iterations}&pid=${portId}`;
    const { data } = await axios.get(url);
    const dom = new JSDOM(data);
    const document = dom.window.document;
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = [];
      cells.forEach((cell) => {
        const cellContent = cell.textContent.trim();
        //if(rowData.length = 0) rowData.push(href);
        if (cellContent.length > 0 && cellContent.length < 50) {
          rowData.push(cellContent);
          if (rowData.length === 7) rowData.unshift(portId);
        }
      });
      console.log("writing data..", i);

      if (rowData.length > 0) tableData.push(rowData);
    });
    
  }

  tableData.unshift(["MMSI", "Vessel", "PORT", "Estimated Arrival"]);
  XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: -1 });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelFilePath = "generated/excepted-arrivals-in-ports.xlsx"; // Path and filename for the output Excel file
  XLSX.writeFile(workbook, excelFilePath);
  return tableData;
};

module.exports = scrapExpectedArrivalsInPort;
