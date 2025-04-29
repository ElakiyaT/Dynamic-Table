import { NoDataFound } from './nodatafound.js';

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

class TableCell {
  constructor(content, renderFn, colKey) {
    this.element = document.createElement('div');
    this.element.className = `flex-cell col-${colKey}`;

    if (renderFn) {
      const rendered = renderFn(content);
      if (rendered instanceof Node) {
        this.element.appendChild(rendered);
      } else {
        this.element.textContent = String(rendered);
      }
    } else {
      this.element.textContent = String(content);
    }
  }

  getElement() {
    return this.element;
  }
}

class TableRow {
  constructor(data, columns) {
    this.element = document.createElement('div');
    this.element.className = 'flex-row';

    columns.forEach(col => {
      const cell = new TableCell(data[col.key], col.render, col.key);
      this.element.appendChild(cell.getElement());
    });
  }

  getElement() {
    return this.element;
  }
}

class TableComponent {
  constructor({ root, columns, fetchData, rowCount }) {
    this.root = root;
    this.columns = columns;
    this.fetchData = fetchData;
    this.rowCount = rowCount;

    this.allData = [];
    this.sortColumn = null;
    this.sortDirection = 1;
    this.bufferSize = 5;
    this.ageRangeDropdown = null;
    this.rowHeight = null;
    this.reUse = []; // row reuse 

    this.init();
  }

  init() {
    this.createStructure();
    this.loadData();
  }

  createStructure() {
    this.tableWrapper = document.createElement('div');
    this.tableWrapper.className = 'flex-table';

    this.createHeader();

    this.body = document.createElement('div');
    this.body.className = 'flex-body';

    this.content = document.createElement('div');
    this.body.appendChild(this.content);

    this.tableWrapper.appendChild(this.header);
    this.tableWrapper.appendChild(this.body);
    this.root.appendChild(this.tableWrapper);

    this.searchInput = document.getElementById('global-search');
    if (this.searchInput) {
      const debouncedSearch = debounce(() => this.renderTable(), 400);
      this.searchInput.addEventListener('input', debouncedSearch);
    }

    this.body.addEventListener('scroll', () => this.renderTable());
  }

  createHeader() {
    this.header = document.createElement('div');
    this.header.className = 'flex-header';

    this.columns.forEach(col => {
      const th = document.createElement('div');
      th.className = `flex-cell col-${col.key}`;

      const labelContainer = document.createElement('div');
      labelContainer.style.display = 'flex';
      labelContainer.style.alignItems = 'center';

      const label = document.createElement('span');
      label.textContent = col.label;
      labelContainer.appendChild(label);

      if (col.sortable) {
        const icon = document.createElement('span');
        icon.classList.add('sort-icon');
        icon.innerHTML = '<span class="arrow up">↑</span><span class="arrow down">↓</span>';
        labelContainer.appendChild(icon);

        icon.addEventListener('click', (event) => {
          event.stopPropagation();
          this.header.querySelectorAll('.sort-icon .arrow').forEach(arrow => arrow.classList.remove('active'));

          if (this.sortColumn === col.key) {
            this.sortDirection *= -1;
          } else {
            this.sortColumn = col.key;
            this.sortDirection = 1;
          }

          const arrows = icon.querySelectorAll('.arrow');
          arrows[this.sortDirection === 1 ? 0 : 1].classList.add('active');

          this.renderTable();
        });

        if (this.sortColumn === col.key) {
          const arrows = icon.querySelectorAll('.arrow');
          arrows[this.sortDirection === 1 ? 0 : 1].classList.add('active');
        }
      }

      if (col.key === 'age' && col.customSortRanges) {
        const dropdown = document.createElement('select');
        dropdown.className = 'age-range-dropdown';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All';
        dropdown.appendChild(defaultOption);

        col.customSortRanges.forEach((range, index) => {
          const option = document.createElement('option');
          option.value = index;
          option.textContent = `${range.min} - ${range.max === Infinity ? '+' : range.max}`;
          dropdown.appendChild(option);
        });

        dropdown.addEventListener('change', () => {
          this.ageRangeDropdown.value = dropdown.value;
          this.renderTable();
        });

        this.ageRangeDropdown = dropdown;
        labelContainer.appendChild(dropdown);
      }

      th.appendChild(labelContainer);

      if (col.resizable) {
        th.classList.add('resizable');
        const resizer = document.createElement('div');
        resizer.className = 'resizer';

        resizer.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = th.offsetWidth;

          const colClass = `col-${col.key}`;
          const allCells = document.querySelectorAll(`.${colClass}`);

          const onMouseMove = (eMove) => {
            const delta = eMove.clientX - startX;
            const newWidth = Math.max(startWidth + delta, 50);
            allCells.forEach(cell => {
              cell.style.flex = `0 0 ${newWidth}px`;
            });
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });

        th.appendChild(resizer);
      }

      this.header.appendChild(th);
    });
  }

  async loadData() {
    this.allData = await this.fetchData(0, this.rowCount);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.calculateRowHeight();
        this.renderTable();
      });
    });
  }

  calculateRowHeight() {
    const tempRow = new TableRow(this.allData[0], this.columns);
    const rowElement = tempRow.getElement();
    rowElement.classList.add('measure-row');
    document.body.appendChild(rowElement);
    this.rowHeight = rowElement.offsetHeight;
    document.body.removeChild(rowElement);
  }

  recycleRows() {
    const children = Array.from(this.content.children);
    for (const child of children) {
      this.reUse.push(child);
      this.content.removeChild(child);
    }
  }

  filter(str, search) {
    const s = str.toLowerCase();
    const t = search.toLowerCase();
    for (let i = 0; i <= s.length - t.length; i++) {
      let match = true;
      for (let j = 0; j < t.length; j++) {
        if (s[i + j] !== t[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  }

  renderTable() {
    let filtered = this.allData;

    if (this.searchInput && this.searchInput.value.trim() !== '') {
      const searchTerm = this.searchInput.value.trim();
      filtered = this.allData.filter(item => this.filter(item.name, searchTerm));
    }

    if (this.ageRangeDropdown && this.ageRangeDropdown.value !== '') {
      const selectedIndex = parseInt(this.ageRangeDropdown.value, 10);
      const ageColumn = this.columns.find(col => col.key === 'age');
      const selectedRange = ageColumn.customSortRanges[selectedIndex];

      filtered = filtered.filter(item => item.age >= selectedRange.min && item.age < selectedRange.max);
    }

    if (this.sortColumn) {
      const columnMeta = this.columns.find(col => col.key === this.sortColumn);
      const isNumber = columnMeta?.type === 'number';

      filtered.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        if (this.sortColumn === 'age') {
          return (aVal - bVal) * this.sortDirection;
        }

        if (isNumber) {
          return (parseFloat(aVal) - parseFloat(bVal)) * this.sortDirection;
        } else {
          return aVal.toString().localeCompare(bVal.toString()) * this.sortDirection;
        }
      });
    }

    this.recycleRows(); // Use recycling instead of clearing

    if (filtered.length === 0) {
      const noData = new NoDataFound();
      this.content.appendChild(noData.getElement());
      return;
    }

    if (this.rowHeight === null) {
      this.calculateRowHeight();
    }

    this.content.style.height = `${filtered.length * this.rowHeight}px`;

    const visibleRowsCount = Math.ceil(this.body.clientHeight / this.rowHeight);
    const scrollTopIndex = Math.floor(this.body.scrollTop / this.rowHeight);

    const startIndex = Math.max(0, scrollTopIndex - this.bufferSize);
    const endIndex = Math.min(filtered.length - 1, scrollTopIndex + visibleRowsCount + this.bufferSize);

    for (let i = startIndex; i <= endIndex; i++) {
      const rowData = filtered[i];
      let rowElement = this.reUse.pop();

      if (!rowElement) {
        const row = new TableRow(rowData, this.columns);
        rowElement = row.getElement();
      } else {
        rowElement.innerHTML = ''; // clear existing cells
        this.columns.forEach(col => {
          const cell = new TableCell(rowData[col.key], col.render, col.key);
          rowElement.appendChild(cell.getElement());
        });
      }

      rowElement.style.top = `${i * this.rowHeight}px`;
      this.content.appendChild(rowElement);
    }
  }
}

export { TableComponent };
