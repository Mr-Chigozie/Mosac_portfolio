// ======================
// 🌐 CONFIG
// ======================
const PER_PAGE = 20;

let allCoins = [];
let currentSearch = "";
let currentPage = 1;
let lastFetch = 0;
let sortMode = 0;
let cryptoChart = null; // Chart instance tracker

const SORT_MODES = [
  { label: "Rank", compare: (a, b) => a.market_cap_rank - b.market_cap_rank },
  { label: "Price ↓", compare: (a, b) => b.current_price - a.current_price },
  { label: "24h ↓", compare: (a, b) => change24h(b) - change24h(a) },
  { label: "24h ↑", compare: (a, b) => change24h(a) - change24h(b) }
];

const COLORS = {
  accent: "#00f7ff",
  up: "#34d399",
  down: "#f87171",
  ink: "#e2e8f0",
  muted: "#94a3b8",
  grid: "rgba(255, 255, 255, 0.06)"
};

function getUrl() {
  return `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=${PER_PAGE}&page=${currentPage}&sparkline=true&price_change_percentage=24h,7d`;
}

// ======================
// 🔢 FORMATTERS
// ======================
const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2
});

function change24h(coin) {
  return coin.price_change_percentage_24h || 0;
}

function formatPrice(value) {
  if (value == null) return "--";
  const digits = value >= 1000 ? 0 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: Math.min(digits, 2),
    maximumFractionDigits: digits
  });
}

function formatChange(value) {
  const arrow = value >= 0 ? "▲" : "▼";
  return `${arrow} ${Math.abs(value).toFixed(2)}%`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ======================
// 🚀 DOM READY
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const sortBtn = document.getElementById("sortBtn");
  const searchInput = document.getElementById("cryptoSearch");
  const nextBtn = document.getElementById("nextPage");
  const prevBtn = document.getElementById("prevPage");
  const metricSelect = document.getElementById("chartMetric");

  if (!sortBtn || !searchInput || !nextBtn || !prevBtn) {
    console.error("Missing DOM elements");
    return;
  }

  // 🔽 SORT (cycles through modes, no refetch needed)
  sortBtn.addEventListener("click", () => {
    sortMode = (sortMode + 1) % SORT_MODES.length;
    sortBtn.textContent = `Sort: ${SORT_MODES[sortMode].label}`;
    applyFilters();
  });

  // 🔍 SEARCH
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  // ➡️ NEXT PAGE
  nextBtn.addEventListener("click", () => {
    currentPage++;
    updatePageUI();
    loadCoins(true);
  });

  // ⬅️ PREV PAGE
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updatePageUI();
      loadCoins(true);
    }
  });

  // 📊 CHART METRIC CHANGE LISTENER
  if (metricSelect) {
    metricSelect.addEventListener("change", applyFilters);
  }

  // 🚀 INITIAL LOAD
  updatePageUI();
  loadCoins(true);
});

// ======================
// 🚨 TABLE MESSAGES
// ======================
function showTableMessage(text, isError = false) {
  const tbody = document.getElementById("cryptoBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="table-message${isError ? " error" : ""}">${text}</td>
    </tr>
  `;
}

// ======================
// 🔄 LOAD DATA
// ======================
function loadCoins(force = false) {
  const now = Date.now();

  if (!force && now - lastFetch < 60000) {
    console.log("⛔ Skipping fetch (cooldown)");
    return;
  }

  // keep the current rows visible during background refreshes
  if (force) showTableMessage("Loading market data...");

  lastFetch = now;

  fetch(getUrl())
    .then(res => {
      if (res.status === 429) throw new Error("Rate limit hit");
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    })
    .then(data => {
      if (!data || !data.length) throw new Error("Invalid data");

      allCoins = data;

      applyFilters();
      updateReport(data);
      updateMovers(data);
      updateTimestamp();
    })
    .catch(() => {
      showTableMessage("⚠️ API limit reached. Try again in a minute.", true);
    });
}

// ======================
// 🔍 FILTER + SORT
// ======================
function applyFilters() {
  let result = [...allCoins];

  if (currentSearch) {
    result = result.filter(coin =>
      coin.name.toLowerCase().includes(currentSearch) ||
      coin.symbol.toLowerCase().includes(currentSearch)
    );
  }

  result.sort(SORT_MODES[sortMode].compare);

  displayCoins(result);
  initCryptoChart(result);
}

// ======================
// 📊 DISPLAY TABLE
// ======================
function sparklineSvg(prices) {
  if (!prices || prices.length < 2) return "";

  const w = 100;
  const h = 28;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = w / (prices.length - 1);

  const points = prices
    .map((p, i) => `${(i * step).toFixed(1)},${(h - 2 - ((p - min) / range) * (h - 4)).toFixed(1)}`)
    .join(" ");

  const color = prices[prices.length - 1] >= prices[0] ? COLORS.up : COLORS.down;

  return `
    <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"
        stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    </svg>
  `;
}

function displayCoins(coins) {
  const tbody = document.getElementById("cryptoBody");
  if (!tbody) return;

  if (!allCoins.length) return;

  if (!coins.length) {
    showTableMessage("No coins match your search on this page.");
    return;
  }

  tbody.innerHTML = coins.map(coin => {
    const change = change24h(coin);
    const dir = change >= 0 ? "up" : "down";

    return `
      <tr>
        <td class="rank">${coin.market_cap_rank ?? "--"}</td>

        <td>
          <div class="coin-cell">
            <img src="${coin.image}" alt="" loading="lazy" />
            <span>
              ${escapeHtml(coin.name)}
              <span class="coin-symbol">${escapeHtml(coin.symbol.toUpperCase())}</span>
            </span>
          </div>
        </td>

        <td class="num">${formatPrice(coin.current_price)}</td>

        <td class="num">
          <span class="change-pill ${dir}">${formatChange(change)}</span>
        </td>

        <td class="num">${coin.market_cap ? compactUsd.format(coin.market_cap) : "--"}</td>

        <td class="spark-col">${sparklineSvg(coin.sparkline_in_7d?.price)}</td>
      </tr>
    `;
  }).join("");
}

// ======================
// 📈 CRYPTO CHART RENDERING
// ======================
function initCryptoChart(coins) {
  const canvas = document.getElementById("cryptoChart");
  if (!canvas || typeof Chart === "undefined") return;

  const metricSelect = document.getElementById("chartMetric");
  const metric = metricSelect ? metricSelect.value : "current_price";
  const isChange = metric === "price_change_percentage_24h";

  // Top 10 of whatever is currently shown (follows search + sort)
  const topCoins = coins.slice(0, 10);
  const labels = topCoins.map(coin => coin.symbol.toUpperCase());
  const values = topCoins.map(coin => coin[metric] || 0);

  const barColors = isChange
    ? values.map(v => (v >= 0 ? COLORS.up : COLORS.down))
    : COLORS.accent;

  const formatValue = (v) => {
    if (isChange) return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
    if (metric === "market_cap") return compactUsd.format(v);
    return formatPrice(v);
  };

  if (cryptoChart) {
    cryptoChart.destroy(); // Clear old chart instance before rebuilding
  }

  cryptoChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: barColors,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.9
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0b1220",
          borderColor: "rgba(0, 247, 255, 0.3)",
          borderWidth: 1,
          titleColor: COLORS.ink,
          bodyColor: COLORS.ink,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (items) => topCoins[items[0].dataIndex].name,
            label: (item) => formatValue(item.raw)
          }
        }
      },
      scales: {
        x: {
          // prices span from $0.0001 to $100k – a log scale keeps every bar readable
          type: isChange ? "linear" : "logarithmic",
          grid: { color: COLORS.grid },
          border: { display: false },
          ticks: {
            color: COLORS.muted,
            font: { size: 11 },
            maxTicksLimit: 6,
            callback: (v) => isChange ? `${v}%` : compactUsd.format(v)
          }
        },
        y: {
          grid: { display: false },
          border: { color: "rgba(255, 255, 255, 0.15)" },
          ticks: { color: COLORS.ink, font: { size: 11, weight: "600" } }
        }
      }
    }
  });
}

// ======================
// 📄 PAGE UI
// ======================
function updatePageUI() {
  const page = document.getElementById("pageNumber");
  const prev = document.getElementById("prevPage");

  if (page) page.textContent = `Page ${currentPage}`;
  if (prev) prev.disabled = currentPage === 1;
}

function updateTimestamp() {
  const el = document.getElementById("lastUpdated");
  if (!el) return;

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  el.textContent = `Updated ${time} · refreshes every minute`;
}

// ======================
// 🔄 AUTO REFRESH
// ======================
setInterval(() => {
  loadCoins(); // respects cooldown
}, 60000);

// ======================
// 🚀 KPI REPORT + MOVERS
// ======================
function updateReport(coins) {
  if (!coins.length) return;

  const sorted = [...coins].sort((a, b) => change24h(b) - change24h(a));
  const gainer = sorted[0];
  const loser = sorted[sorted.length - 1];

  const totalCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const upCount = coins.filter(coin => change24h(coin) >= 0).length;
  const upShare = Math.round((upCount / coins.length) * 100);

  document.getElementById("totalMarketCap").textContent = compactUsd.format(totalCap);

  document.getElementById("reportGainer").innerHTML =
    `${escapeHtml(gainer.symbol.toUpperCase())}<small>${formatChange(change24h(gainer))}</small>`;

  document.getElementById("reportLoser").innerHTML =
    `${escapeHtml(loser.symbol.toUpperCase())}<small>${formatChange(change24h(loser))}</small>`;

  document.getElementById("marketBreadth").innerHTML =
    `<span class="up">${upCount} ▲</span> <span class="down">${coins.length - upCount} ▼</span>`;

  const fill = document.getElementById("breadthFill");
  if (fill) fill.style.width = `${upShare}%`;
}

function updateMovers(coins) {
  const sorted = [...coins].sort((a, b) => change24h(b) - change24h(a));

  const renderList = (list, id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = list.map(coin => {
      const change = change24h(coin);
      return `
        <li>
          <img src="${coin.image}" alt="" loading="lazy" />
          <span class="mover-name">${escapeHtml(coin.name)}</span>
          <span class="change-pill ${change >= 0 ? "up" : "down"}">${formatChange(change)}</span>
        </li>
      `;
    }).join("");
  };

  renderList(sorted.slice(0, 5), "gainersList");
  renderList(sorted.slice(-5).reverse(), "losersList");
}
