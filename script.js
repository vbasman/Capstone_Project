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

// Generate unique configuration code
function makeCode() {
  const bits = ['cpu', 'mainboard', 'gpu', 'ram'].map(key =>
    state[key] ? state[key].id.slice(0, 3).toUpperCase() : '---'
  );
  return `CFG-${bits.join('-')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Display Toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');
  
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 1800);
}

// Update Google Calendar Link
function updateCalendarLink() {
  const code = codeInput.value;
  const calendarLink = document.getElementById('calendarLink');
  if (calendarLink) {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=PC+Build+${code}&details=Your+PC+configuration+code:+${code}`;
    calendarLink.href = url;
  }
}

// Update summary text and config code
function updateSummary() {
  Object.keys(summaryMap).forEach(key => {
    summaryMap[key].textContent = state[key] ? state[key].name : 'None';
  });
  codeInput.value = makeCode();
  updateCalendarLink();
}

// Check component compatibility
function isCompatible(type, item) {
  if (type === 'mainboard' && state.cpu) {
    return state.cpu.compatible.mainboard.includes(item.id);
  }

  if (type === 'ram' && state.mainboard) {
    return state.mainboard.compatible.ram.includes(item.id);
  }

  return true;
}

// Render component option buttons dynamically
function renderMenus() {
  document.querySelectorAll('.component-card').forEach(card => {
    const type = card.dataset.component;
    const menu = card.querySelector('.component-menu');
    menu.innerHTML = '';

    data[type].forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';

      let btnClasses = "w-full text-left px-3 py-2 text-xs rounded-md border transition ";

      if (!isCompatible(type, item)) {
        btnClasses += "opacity-30 cursor-not-allowed border-slate-800 text-slate-500 line-through";
      } else if (state[type] && state[type].id === item.id) {
        btnClasses += "bg-indigo-600 text-white border-indigo-500 font-medium";
      } else {
        btnClasses += "bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500";
      }

      btn.className = btnClasses;
      btn.textContent = item.name;
      btn.title = item.info;

      btn.addEventListener('click', () => {
        if (!isCompatible(type, item)) return;

        state[type] = item;

        if (type === 'cpu') { state.mainboard = null; state.ram = null; }
        if (type === 'mainboard') state.ram = null;

        renderMenus();
        updateSummary();
        showToast(`${type.toUpperCase()} selected: ${item.name}`);
      });

      menu.appendChild(btn);
    });
  });
}

// Accordion menu toggle buttons
document.querySelectorAll('.component-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.component-card');
    const menu = card.querySelector('.component-menu');
    const arrow = btn.querySelector('span:last-child');
    
    const isHidden = menu.classList.contains('hidden');
    
    if (isHidden) {
      menu.classList.remove('hidden');
      menu.classList.add('flex');
      if (arrow) arrow.style.transform = 'rotate(180deg)';
      btn.setAttribute('aria-expanded', 'true');
    } else {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});

// Restart configuration buttons (handles both primary & secondary restart buttons)
document.querySelectorAll('#restartBtn, .action-bar button:last-child').forEach(btn => {
  btn.addEventListener('click', () => {
    state.cpu = null;
    state.mainboard = null;
    state.gpu = null;
    state.ram = null;
    renderMenus();
    updateSummary();
    showToast('Configuration reset');
  });
});

// Save configuration button
document.getElementById('saveBtn').addEventListener('click', () => {
  showToast(`Saved as ${codeInput.value}`);
});

// Verify component compatibility button
document.getElementById('verifyBtn').addEventListener('click', () => {
  const { cpu, mainboard, ram } = state;

  if (!cpu || !mainboard || !ram) {
    showToast("Please select CPU, Mainboard and RAM first.");
    return;
  }

  const cpuOk = cpu.compatible.mainboard.includes(mainboard.id);
  const ramOk = mainboard.compatible.ram.includes(ram.id);

  if (cpuOk && ramOk) {
    showToast("All components are fully compatible!");
  } else {
    showToast("Warning: Some components may not be compatible.");
  }
});

// Carousel image slider logic
const carouselImages = document.querySelectorAll('.carousel img');
let currentSlide = 0;

function showSlide(index) {
  carouselImages.forEach((img, i) => {
    if (i === index) {
      img.classList.remove('hidden');
      img.classList.add('block');
    } else {
      img.classList.remove('block');
      img.classList.add('hidden');
    }
  });
}

document.getElementById('nextBtn').addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % carouselImages.length;
  showSlide(currentSlide);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + carouselImages.length) % carouselImages.length;
  showSlide(currentSlide);
});

// Initial execution on page load
renderMenus();
updateSummary();
showSlide(currentSlide);
