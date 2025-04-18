// app.js
import { getColumns } from './column.js';
import { createTable } from './script.js';

async function fetchData(start, limit) {
  const response = await fetch("http://localhost:3000/users");
  const allData = await response.json();
  console.log("data", allData); // Will show if it's an array
  return allData; // instead of allData.users
}


function init() {
  const columns = getColumns();
  const root = document.getElementById('table-root');
  createTable({
    root,
    columns,
    fetchData,
    rowCount: 10000,
    pageSize: 100
  });
}

document.addEventListener('DOMContentLoaded', init);



