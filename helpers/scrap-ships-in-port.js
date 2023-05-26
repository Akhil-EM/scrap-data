const axios = require("axios");
const { JSDOM } = require("jsdom");
const XLSX = require("xlsx");
const scrapShipsInPort = async (portId, vesselsCount) => {
  console.log("5 =>",portId,vesselsCount);
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  const tableData = [];
  console.log(vesselsCount);

  const iterations = Math.round(parseInt(vesselsCount) / 50);
  console.log("12 =>",iterations);
  for (let i = 1; i <= iterations; i++) {
    console.log("14 =>",i);
    const url = `https://www.myshiptracking.com/inport?sort=TIME&page=${iterations}&pid=${portId}`;
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

  tableData.unshift(["Vessel", "Arrived", "DWT", "GRT", "Built", "Size"]);
  XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: -1 });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelFilePath = "generated/vessels-in-ports.xlsx"; // Path and filename for the output Excel file
  XLSX.writeFile(workbook, excelFilePath);
  return tableData;
};

module.exports = scrapShipsInPort;
