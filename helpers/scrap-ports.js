const axios = require("axios");
const { JSDOM } = require("jsdom");
const XLSX = require("xlsx");
const scrapPort = async () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  const tableData = [];
  for (let i = 1; i <= 144; i++) {
    const url = `https://www.myshiptracking.com/ports?sort=ID&page=${i}`;
    const { data } = await axios.get(url);
    const dom = new JSDOM(data);
    const document = dom.window.document;
    const table = document.querySelector("table");
    const rows = table.querySelectorAll("tr");
    let portId;
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = [];
      cells.forEach((cell) => {
        const href = cell.childNodes[0].href;
        if (href !== undefined) {
          const splitted = href.split("#inport");
          if (splitted.length === 2) portId = splitted[0].split("-id-")[1];
        }
        const cellContent = cell.textContent.trim();
        //if(rowData.length = 0) rowData.push(href);
        if (cellContent.length > 0 && cellContent.length < 50) {
          rowData.push(cellContent);
          if (rowData.length === 7){
            rowData.unshift(portId);
            rowData.push(`/in-port/${portId}`,`/arrivals/${portId}`)
          };
        }
      });
      if (rowData.length > 0) tableData.push(rowData);
      console.log('====================================');
      console.log('writing data ',i);
      console.log('====================================');
    });
  }
  
  tableData.unshift([
    "Port Id",
    "Port Name",
    "Type",
    "Size",
    "Vessels In Port",
    "Arrivals",
    "Departures",
    "Excepted Arrivals",
    "View Vessels In port",
    "View Expected Arrivals"
  ]);
  XLSX.utils.sheet_add_aoa(worksheet, tableData, { origin: -1 });
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelFilePath = "generated/ports.xlsx"; // Path and filename for the output Excel file
  XLSX.writeFile(workbook, excelFilePath);
  return tableData;
};

module.exports = scrapPort;
