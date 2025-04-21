export function getColumns() {
  return [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      sortable: true,
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
        span.style.fontWeight = 'bold';
        span.style.fontSize = '14px';
        return span;
      }
    },
    {
      key: 'active',
      label: 'ACTIVE / INACTIVE',
      type: 'boolean',
      sortable: true,
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
