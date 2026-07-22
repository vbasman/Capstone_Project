const data = {
  cpu: [
    {
      id: 'amd-ryzen-5',
      name: 'AMD Ryzen 5',
      info: 'Good for gaming and everyday use.',
      compatible: { mainboard: ['am5-b650', 'am5-x670'] }
    },
    {
      id: 'amd-ryzen-7',
      name: 'AMD Ryzen 7',
      info: 'More cores for productivity.',
      compatible: { mainboard: ['am5-b650', 'am5-x670'] }
    },
    {
      id: 'intel-core-i5',
      name: 'Intel Core i5',
      info: 'Balanced performance.',
      compatible: { mainboard: ['lga1700-b760', 'lga1700-z790'] }
    },
    {
      id: 'intel-core-i7',
      name: 'Intel Core i7',
      info: 'Strong all-round performance.',
      compatible: { mainboard: ['lga1700-b760', 'lga1700-z790'] }
    }
  ],
  mainboard: [
    {
      id: 'am5-b650',
      name: 'B650 AM5',
      info: 'Supports AMD Ryzen 7000 series.',
      compatible: { ram: ['ddr5-16', 'ddr5-32'] }
    },
    {
      id: 'am5-x670',
      name: 'X670 AM5',
      info: 'Premium AMD platform.',
      compatible: { ram: ['ddr5-16', 'ddr5-32', 'ddr5-64'] }
    },
    {
      id: 'lga1700-b760',
      name: 'B760 LGA1700',
      info: 'Mainstream Intel board.',
      compatible: { ram: ['ddr5-16', 'ddr5-32'] }
    },
    {
      id: 'lga1700-z790',
      name: 'Z790 LGA1700',
      info: 'Higher-end Intel board.',
      compatible: { ram: ['ddr5-16', 'ddr5-32', 'ddr5-64'] }
    }
  ],
  gpu: [
    { id: 'rtx-4060', name: 'NVIDIA RTX 4060', info: 'Efficient 1080p gaming.' },
    { id: 'rtx-4070', name: 'NVIDIA RTX 4070', info: 'Great 1440p performance.' },
    { id: 'rx-7600', name: 'AMD Radeon RX 7600', info: 'Strong value option.' },
    { id: 'rx-7800xt', name: 'AMD Radeon RX 7800 XT', info: 'Excellent higher-resolution gaming.' }
  ],
  ram: [
    { id: 'ddr5-16', name: '16GB DDR5', info: 'Good starter capacity.' },
    { id: 'ddr5-32', name: '32GB DDR5', info: 'Recommended for most users.' },
    { id: 'ddr5-64', name: '64GB DDR5', info: 'For heavy multitasking.' }
  ]
};

const state = { cpu: null, mainboard: null, gpu: null, ram: null };

const codeInput = document.getElementById('configCode');
const toast = document.getElementById('toast');

const summaryMap = {
  cpu: document.getElementById('selectedCpu'),
  mainboard: document.getElementById('selectedMainboard'),
  gpu: document.getElementById('selectedGpu'),
  ram: document.getElementById('selectedRam')
};

function makeCode() {
  const bits = ['cpu', 'mainboard', 'gpu', 'ram'].map(key =>
    state[key] ? state[key].id.slice(0, 3).toUpperCase() : '---'
  );
  return `CFG-${bits.join('-')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function updateSummary() {
  Object.keys(summaryMap).forEach(key => {
    summaryMap[key].textContent = state[key] ? state[key].name : 'None';
  });
  codeInput.value = makeCode();
}

function isCompatible(type, item) {
  if (type === 'mainboard' && state.cpu) {
    return state.cpu.compatible.mainboard.includes(item.id);
  }

  if (type === 'ram' && state.mainboard) {
    return state.mainboard.compatible.ram.includes(item.id);
  }

  return true;
}

function renderMenus() {
  document.querySelectorAll('.component-card').forEach(card => {
    const type = card.dataset.component;
    const menu = card.querySelector('.component-menu');
    menu.innerHTML = '';

    data[type].forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';

      if (!isCompatible(type, item)) btn.classList.add('disabled');
      if (state[type] && state[type].id === item.id) btn.classList.add('selected');

      btn.textContent = item.name;
      btn.title = item.info;
      btn.dataset.id = item.id;

      btn.addEventListener('click', () => {
        if (!isCompatible(type, item)) return;

        state[type] = item;

        if (type === 'cpu') state.mainboard = null;
        if (type === 'mainboard') state.ram = null;

        renderMenus();
        updateSummary();
        showToast(`${type.toUpperCase()} selected: ${item.name}`);
      });

      menu.appendChild(btn);
    });
  });
}

document.querySelectorAll('.component-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.component-card');
    const open = card.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
});

document.getElementById('restartBtn').addEventListener('click', () => {
  state.cpu = null;
  state.mainboard = null;
  state.gpu = null;
  state.ram = null;
  renderMenus();
  updateSummary();
  showToast('Configuration reset');
});

document.getElementById('saveBtn').addEventListener('click', () => {
  showToast(`Saved as ${codeInput.value}`);
});

renderMenus();
updateSummary();