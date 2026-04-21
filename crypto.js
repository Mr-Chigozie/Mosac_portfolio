// ======================
// 🌐 CONFIG
// ======================
let allCoins = [];
let currentSearch = "";
let currentPage = 1;
let lastFetch = 0;
let isSorted = false;
const sortBtn = document.getElementById("sortBtn");

function getUrl() {
  return `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20&page=${currentPage}&sparkline=false`;
}

// ======================
// 🚀 DOM READY
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const sortBtn = document.getElementById("sortBtn");
  const searchInput = document.getElementById("cryptoSearch");
  const nextBtn = document.getElementById("nextPage");
  const prevBtn = document.getElementById("prevPage");

  if (!sortBtn || !searchInput || !nextBtn || !prevBtn) {
    console.error("Missing DOM elements");
    return;
  }

  // 🔽 SORT
  sortBtn.addEventListener("click", sortByPrice);

  // 🔍 SEARCH
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase();
    currentPage = 1;
    updatePageUI();
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

  // 🚀 INITIAL LOAD
  loadCoins(true);
});

// ======================
// 🚨 ERROR UI
// ======================
function showError() {
  const tbody = document.getElementById("cryptoBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; color:#ff6b6b;">
        ⚠️ API limit reached. Try again later.
      </td>
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

  const tbody = document.getElementById("cryptoBody");

  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;">
          Loading...
        </td>
      </tr>
    `;
  }

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
      updateSummary(data);
      updateReport(data);
    })
    .catch(() => {
      showError();
    });

    
}

// ======================
// 📊 DISPLAY TABLE
// ======================
function displayCoins(coins) {
  const tbody = document.getElementById("cryptoBody");

  if (!tbody) return;

  if (!coins.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No results</td></tr>";
    return;
  }

  let html = "";

  // 🔥 IMPORTANT: slice AFTER sorting/filtering
  const visibleCoins = coins.slice(0, 20);

  visibleCoins.forEach((coin, index) => {
    const change = coin.price_change_percentage_24h || 0;
    const rowClass = change > 0 ? "gainer" : "loser";

    html += `
      <tr class="${rowClass}">
        <td>${(currentPage - 1) * 20 + index + 1}</td>

        <td style="display:flex; align-items:center; gap:8px;">
          <img src="${coin.image}" width="20" height="20" />
          <div>
            ${coin.name}
            <span style="opacity:0.6; font-size:12px;">
              (${coin.symbol.toUpperCase()})
            </span>
          </div>
        </td>

        <td>$${coin.current_price.toLocaleString()}</td>

        <td style="color:${change > 0 ? 'lime' : 'red'}">
          ${change.toFixed(2)}%
        </td>

        <td>$${coin.market_cap.toLocaleString()}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ======================
// 🔍 FILTER
// ======================
function applyFilters() {
  let result = [...allCoins];

  if (currentSearch) {
    result = result.filter(coin =>
      coin.name.toLowerCase().includes(currentSearch) ||
      coin.symbol.toLowerCase().includes(currentSearch)
    );
  }

  displayCoins(result);
}

// ======================
// 🔽 SORT
// ======================


function sortByPrice() {
  isSorted = !isSorted;

  const btn = document.getElementById("sortBtn");

  if (isSorted) {
    allCoins = [...allCoins].sort(
      (a, b) => b.current_price - a.current_price
    );
    btn.textContent = "Reset";
  } else {
    btn.textContent = "Sort by Price";
    loadCoins(true);
    return;
  }

  applyFilters();
}


// function sortByPrice() {
//   console.log("SORT CLICKED"); // 👈 test
// }

// ======================
// 📄 PAGE UI
// ======================
function updatePageUI() {
  const page = document.getElementById("pageNumber");
  const prev = document.getElementById("prevPage");

  if (page) page.textContent = `Page ${currentPage}`;

  if (prev) {
    prev.disabled = currentPage === 1;
    prev.style.opacity = currentPage === 1 ? "0.4" : "1";
  }
}

// ======================
// 🔄 AUTO REFRESH
// ======================
setInterval(() => {
  loadCoins(); // respects cooldown
}, 60000);

// ======================
// 🚀 SUMMARY
// ======================
function updateSummary(coins) {
  if (!coins || !coins.length) return;

  const sorted = [...coins].sort(
    (a, b) =>
      (b.price_change_percentage_24h || 0) -
      (a.price_change_percentage_24h || 0)
  );

  const gainer = sorted[0];
  const loser = sorted[sorted.length - 1];

  document.getElementById("topGainer").textContent =
    `🚀 ${gainer.name} (+${(gainer.price_change_percentage_24h || 0).toFixed(2)}%)`;

  document.getElementById("topLoser").textContent =
    `📉 ${loser.name} (${(loser.price_change_percentage_24h || 0).toFixed(2)}%)`;
}


function updateReport(coins) {
  if (!coins.length) return;

  // 🔝 Gainer / Loser
  const sorted = [...coins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  );

  const gainer = sorted[0];
  const loser = sorted[sorted.length - 1];

  // 💰 Average Price
  const avg =
    coins.reduce((sum, coin) => sum + coin.current_price, 0) /
    coins.length;

  // 🏦 Total Market Cap
  const totalCap = coins.reduce(
    (sum, coin) => sum + coin.market_cap,
    0
  );

  // 🎯 UPDATE UI
  document.getElementById("reportGainer").textContent =
    `${gainer.name} (+${gainer.price_change_percentage_24h.toFixed(2)}%)`;

  document.getElementById("reportLoser").textContent =
    `${loser.name} (${loser.price_change_percentage_24h.toFixed(2)}%)`;

  document.getElementById("avgPrice").textContent =
    `$${avg.toFixed(2)}`;

  document.getElementById("totalMarketCap").textContent =
    `$${totalCap.toLocaleString()}`;
}