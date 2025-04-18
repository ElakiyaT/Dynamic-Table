function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

function createFlexCell(content, renderFn) {
  const cell = document.createElement('div');
  cell.className = 'flex-cell';

  if (renderFn) {
    const rendered = renderFn(content);
    if (rendered instanceof Node) {
      cell.appendChild(rendered);
    } else {
      cell.textContent = String(rendered);
    }
  } else {
    cell.textContent = String(content);
  }

  return cell;
}

function createFlexRow(data, columns) {
  const row = document.createElement('div');
  row.className = 'flex-row';

  columns.forEach(col => {
    row.appendChild(createFlexCell(data[col.key], col.render));
  });

  return row;
}

export function createTable({ root, columns, fetchData, rowCount, pageSize }) {
  let allData = [];
  let sortColumn = null;
  let sortDirection = 1;
  const rowHeight = 40;
  const bufferSize = 5;

  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'flex-table';

  const header = document.createElement('div');
  header.className = 'flex-header';

  columns.forEach(col => {
    const th = document.createElement('div');
    th.className = 'flex-cell';
    const label = document.createElement('span');
    label.textContent = col.label;

    const icon = document.createElement('span');
    icon.className = 'sort-icon';
    icon.textContent = '▲';
    icon.style.marginLeft = '5px';
    icon.style.opacity = '0.3';

    th.appendChild(label);
    th.appendChild(icon);
    th.style.cursor = 'pointer';

    th.addEventListener('click', () => {
      if (sortColumn === col.key) {
        sortDirection *= -1;
      } else {
        sortColumn = col.key;
        sortDirection = 1;
      }
      renderTable();
    });

    header.appendChild(th);
  });

  const body = document.createElement('div');
  body.className = 'flex-body';
  body.style.height = '400px';
  body.style.overflowY = 'auto';
  body.style.position = 'relative';

  const content = document.createElement('div');
  content.style.position = 'relative';
  body.appendChild(content);

  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderTable());
  }

  async function loadData() {
    allData = await fetchData(0, rowCount);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        renderTable();
      });
    });
  }

  function renderTable() {
    let filtered = allData;

    if (searchInput && searchInput.value.trim() !== '') {
      const searchTerm = searchInput.value.trim().toLowerCase();
      filtered = allData.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      );
    }

    if (sortColumn) {
      const columnMeta = columns.find(col => col.key === sortColumn);
      const isNumber = columnMeta?.type === 'number';

      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (isNumber) {
          return (parseFloat(aVal) - parseFloat(bVal)) * sortDirection;
        } else {
          return aVal.toString().localeCompare(bVal.toString()) * sortDirection;
        }
      });
    }

    const headers = header.querySelectorAll('.flex-cell');
    headers.forEach((cell, index) => {
      const icon = cell.querySelector('.sort-icon');
      const col = columns[index];
      if (col.key === sortColumn) {
        icon.textContent = sortDirection === 1 ? '▲' : '▼';
        icon.style.opacity = '1';
      } else {
        icon.textContent = '▲';
        icon.style.opacity = '0.3';
      }
    });

    clearElement(content);

    // Virtual height to enable scrollbar
    content.style.height = `${filtered.length * rowHeight}px`;

    const visibleRowsCount = Math.ceil(body.clientHeight / rowHeight);
    const startIndex = Math.max(0, Math.floor(body.scrollTop / rowHeight) - bufferSize);
    const endIndex = Math.min(filtered.length - 1, startIndex + visibleRowsCount + bufferSize);

    for (let i = startIndex; i <= endIndex; i++) {
      const rowData = filtered[i];
      const row = createFlexRow(rowData, columns);
      row.style.position = 'absolute';
      row.style.top = `${i * rowHeight}px`;
      row.style.left = '0';
      row.style.right = '0';
      content.appendChild(row);
    }
  }

  body.addEventListener('scroll', renderTable);

  tableWrapper.appendChild(header);
  tableWrapper.appendChild(body);
  root.appendChild(tableWrapper);

  loadData();
}
