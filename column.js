export function getColumns() {
  return [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      sortable: true,
      resizable: true,
      sortIcon: '▲',
      render: (value) => {
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontWeight = 'bold';
        return span;
      }
    },
    {
      key: 'name',
      label: 'NAME',
      type: 'string',
      sortable: true,
      resizable: true,
      sortIcon: '▲',
      render: (value) => {
        const span = document.createElement('span');
        span.textContent = value;
        span.style.fontWeight = 'bold';
        return span;
      }
    },
    {
      key: 'age',
      label: 'AGE',
      type: 'number',
      sortable: true,
      resizable: true,
      customSortRanges: [
        { min: 0, max: 10 },
        { min: 10, max: 20 },
        { min: 20, max: 30 },
        { min: 30, max: 40 },
        { min: 40, max: 50 },
        { min: 50, max: 60 },
        { min: 60, max: Infinity }
      ],
      render: (value) => {
        const span = document.createElement('span');
        let emoji = '';
        let label = '';
    
        if (value > 60) {
          emoji = '👴';
          label = 'Senior';
        } else if (value > 40) {
          emoji = '🧓';
          label = 'Mature Adult';
        } else if (value > 30) {
          emoji = '🧔';
          label = 'Adult';
        } else if (value > 20) {
          emoji = '🧑';
          label = 'Young Adult';
        } else {
          emoji = '👶';
          label = 'Teen/Child';
        }
    
        span.textContent = `${emoji} ${value} (${label})`;
        span.className = 'age-label';
        return span;
      }
    },
    
    {
      key: 'active',
      label: 'ACTIVE / INACTIVE',
      type: 'boolean',
      sortable: true,
      resizable: true,
      sortIcon: '▲',
      render: (value) => {
        const span = document.createElement('span');
        span.textContent = value ? '✅ Active' : '❌ Inactive';
        span.style.color = value ? '#2ECC71' : '#E74C3C';
        span.style.fontWeight = 'bold';
        return span;
      }
    }
  ];
}
