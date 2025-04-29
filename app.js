import { getColumns } from './column.js';
import { TableComponent } from './table.js';


async function fetchData(start, limit) {
  const response = await fetch("http://localhost:3000/users");
  const allData = await response.json();
  console.log(allData);
  return allData;
}

function init() {
  const columns = getColumns();
  const root = document.getElementById('table-root');

  // Use the class instead of function
  new TableComponent({
    root,
    columns,
    fetchData,
    rowCount: 10000
  });
}

document.addEventListener('DOMContentLoaded', init);
