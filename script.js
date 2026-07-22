// --- Component Data Database ---
const COMPONENTS = {
  cpu: [
    { id: "cpu_i5", name: "Intel Core i5-13600K", socket: "LGA1700" },
    { id: "cpu_i7", name: "Intel Core i7-13700K", socket: "LGA1700" },
    { id: "cpu_ryzen7", name: "AMD Ryzen 7 7800X3D", socket: "AM5" },
    { id: "cpu_ryzen9", name: "AMD Ryzen 9 7900X", socket: "AM5" }
  ],
  mainboard: [
    { id: "mb_z790", name: "ASUS ROG Strix Z790-F", socket: "LGA1700", ramType: "DDR5" },
    { id: "mb_b660", name: "MSI MAG B660 Tomahawk", socket: "LGA1700", ramType: "DDR4" },
    { id: "mb_x670", name: "GIGABYTE X670E AORUS", socket: "AM5", ramType: "DDR5" },
    { id: "mb_b650", name: "ASRock B650 Pro RS", socket: "AM5", ramType: "DDR5" }
  ],
  gpu: [
    { id: "gpu_rtx4070", name: "NVIDIA GeForce RTX 4070 Ti" },
    { id: "gpu_rtx4080", name: "NVIDIA GeForce RTX 4080" },
    { id: "gpu_rx7800", name: "AMD Radeon RX 7800 XT" },
    { id: "gpu_rx7900", name: "AMD Radeon RX 7900 XTX" }
  ],
  ram: [
    { id: "ram_ddr5_32", name: "Corsair Vengeance 32GB (2x16GB) DDR5", type: "DDR5" },
    { id: "ram_ddr5_64", name: "G.Skill Trident Z5 64GB (2x32GB) DDR5", type: "DDR5" },
    { id: "ram_ddr4_32", name: "Kingston Fury 32GB (2x16GB) DDR4", type: "DDR4" },
    { id: "ram_ddr4_16", name: "Corsair Vengeance 16GB (2x8GB) DDR4", type: "DDR4" }
  ]
};

// --- Application State ---
const state = {
  cpu: null,
  mainboard: null,
  gpu: null,
  ram: null
};

// --- DOM Elements ---
const configCodeInput = document.getElementById("configCode");
const selectedCpuSpan = document.getElementById("selectedCpu");
const selectedMbSpan = document.getElementById("selectedMainboard");
const selectedGpuSpan = document.getElementById("selectedGpu");
const selectedRamSpan = document.getElementById("selectedRam");
const toastEl = document.getElementById("toast");
const calendarLink = document.getElementById("calendarLink");

// --- Render Component Menus ---
function initComponentMenus() {
  Object.keys(COMPONENTS).forEach((type) => {
    const menuEl = document.getElementById(`${type === 'mainboard' ? 'mb' : type}Menu`);
    if (!menuEl) return;

    menuEl.innerHTML = "";
    COMPONENTS[type].forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.dataset.type = type;
      btn.dataset.id = item.id;
      btn.innerHTML = `<span>${item.name}</span>`;

      btn.addEventListener("click", () => selectComponent(type, item));
      menuEl.appendChild(btn);
    });
  });
}

// --- Accordion Toggle Handlers ---
function initAccordion() {
  document.querySelectorAll(".component-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const card = toggle.closest(".component-card");
      const menu = card.querySelector(".component-menu");
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      card.classList.toggle("open");
      menu.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", !isExpanded);
    });
  });
}

// --- Select Component & Filter Logic ---
function selectComponent(type, item) {
  // Deselect if clicking the currently selected item
  if (state[type] && state[type].id === item.id) {
    state[type] = null;
  } else {
    state[type] = item;
  }

  validateAndFilter();
  updateUI();
}

// --- Compatibility Rules Engine ---
function validateAndFilter() {
  // If CPU changes, verify motherboard socket compatibility
  if (state.cpu && state.mainboard) {
    if (state.mainboard.socket !== state.cpu.socket) {
      state.mainboard = null;
      showToast("Motherboard reset due to CPU socket mismatch!", "warning");
    }
  }

  // If Mainboard changes, verify RAM type compatibility
  if (state.mainboard && state.ram) {
    if (state.ram.type !== state.mainboard.ramType) {
      state.ram = null;
      showToast("RAM reset due to Motherboard RAM type mismatch!", "warning");
    }
  }

  updateOptionStates();
}

// --- Enable/Disable Options based on selections ---
function updateOptionStates() {
  // Disable motherboards incompatible with selected CPU
  document.querySelectorAll('#mbMenu .option-btn').forEach((btn) => {
    const mbItem = COMPONENTS.mainboard.find(m => m.id === btn.dataset.id);
    if (state.cpu && mbItem.socket !== state.cpu.socket) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  });

  // Disable RAM modules incompatible with selected motherboard
  document.querySelectorAll('#ramMenu .option-btn').forEach((btn) => {
    const ramItem = COMPONENTS.ram.find(r => r.id === btn.dataset.id);
    if (state.mainboard && ramItem.type !== state.mainboard.ramType) {
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  });
}

// --- Update UI Text & Highlights ---
function updateUI() {
  selectedCpuSpan.textContent = state.cpu ? state.cpu.name : "None";
  selectedMbSpan.textContent = state.mainboard ? state.mainboard.name : "None";
  selectedGpuSpan.textContent = state.gpu ? state.gpu.name : "None";
  selectedRamSpan.textContent = state.ram ? state.ram.name : "None";

  // Generate Configuration Code
  const codeParts = [
    state.cpu ? state.cpu.id : "0",
    state.mainboard ? state.mainboard.id : "0",
    state.gpu ? state.gpu.id : "0",
    state.ram ? state.ram.id : "0"
  ];
  const code = codeParts.join("-");
  configCodeInput.value = code === "0-0-0-0" ? "" : `PCC-${code.toUpperCase()}`;

  // Highlight active buttons
  document.querySelectorAll(".option-btn").forEach((btn) => {
    const type = btn.dataset.type;
    const id = btn.dataset.id;
    if (state[type] && state[type].id === id) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });

  updateCalendarLink();
}

// --- Google Calendar Link Generator ---
function updateCalendarLink() {
  const title = encodeURIComponent("PC Build & Order Schedule");
  const details = encodeURIComponent(`Config Code: ${configCodeInput.value || "Custom Build"}\nComponents:\n- CPU: ${selectedCpuSpan.textContent}\n- Mainboard: ${selectedMbSpan.textContent}\n- GPU: ${selectedGpuSpan.textContent}\n- RAM: ${selectedRamSpan.textContent}`);
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  calendarLink.href = calendarUrl;
}

// --- Reset Configuration ---
function resetConfig() {
  state.cpu = null;
  state.mainboard = null;
  state.gpu = null;
  state.ram = null;
  validateAndFilter();
  updateUI();
  showToast("Configuration has been reset.");
}

// --- Check Compatibility Action Button ---
function checkCompatibility() {
  if (!state.cpu && !state.mainboard && !state.gpu && !state.ram) {
    showToast("Please select components first.");
    return;
  }

  const issues = [];
  if (state.cpu && state.mainboard && state.cpu.socket !== state.mainboard.socket) {
    issues.push("Incompatible CPU & Motherboard socket.");
  }
  if (state.mainboard && state.ram && state.mainboard.ramType !== state.ram.type) {
    issues.push("Incompatible RAM & Motherboard type.");
  }

  if (issues.length === 0) {
    showToast("✅ All selected components are fully compatible!");
  } else {
    showToast(`⚠️ Warning: ${issues.join(" ")}`);
  }
}

// --- Toast Notification Helper ---
let toastTimeout;
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 3500);
}

// --- Image Carousel Logic ---
function initCarousel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  if (!slides.length) return;

  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.remove("hidden");
      } else {
        slide.classList.add("hidden");
      }
    });
  }

  // Ensure first image is visible on load
  showSlide(currentIndex);

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  });
}

// --- Event Listeners Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initComponentMenus();
  initAccordion();
  initCarousel();

  document.getElementById("restartBtn")?.addEventListener("click", resetConfig);
  document.getElementById("saveBtn")?.addEventListener("click", () => {
    if (!configCodeInput.value) {
      showToast("Select components before saving.");
    } else {
      showToast(`Build saved successfully! Code: ${configCodeInput.value}`);
    }
  });
  document.getElementById("verifyBtn")?.addEventListener("click", checkCompatibility);

  document.getElementById("helpBtn")?.addEventListener("click", () => {
    showToast("Click a component card to expand options.");
  });

  document.getElementById("aboutBtn")?.addEventListener("click", () => {
    showToast("PC Configurator v2.0 - Build your dream PC.");
  });
});
