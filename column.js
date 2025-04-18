export function getColumns() {
    return [
      {
        key: 'id',
        label: 'ID',
        type: 'number',
        sortable: true
      },
      {
        key: 'name',
        label: 'Name',
        type: 'string',
        sortable: true
      },
      {
        key: 'age',
        label: 'Age',
        type: 'number',
        sortable: true,
        render: (value) => {
          const span = document.createElement('span');
          span.textContent = value;
  
          if (value > 40) {
            span.style.color = '#27AE60';  // 🟢 Fresh Green – energetic, optimistic
          } else if (value > 30) {
            span.style.color = '#FF69B4';  // 💖 Hot Pink – vibrant, stylish
          } else if (value > 20) {
            span.style.color = '#2980B9';  // 🔵 Blue – cool, calm, youthful
          } else {
            span.style.color =  '#C0392B';  // 🔴 Dark Red – mature, serious
          }
          
          
          span.style.fontWeight = 'bold';
          return span;
        }
      },
      {
        key: 'active',
        label: 'Active',
        type: 'boolean',
        sortable: true,
        render: (value) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.disabled = true;
          checkbox.checked = value;
          return checkbox;
        }
      }
    ];
  }
  