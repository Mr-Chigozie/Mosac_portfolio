

// ======================
// 🧠 DATA STORE
// ======================
const data = { soccer: [] };

// ======================
// 🔐 TOKEN (TEMP TEST)
// ======================
const TOKEN = "pdwdED3ClhOMI3NsOiRXqApHhOU2qhnaWfdc0zrbzqqYBSxDIYEcWCiIsS0T";



// ✅ USE FIXTURES (NOT LIVESCORES)
const url = `https://corsproxy.io/?https://api.sportmonks.com/v3/football/fixtures?api_token=${TOKEN}&include=participants;scores&per_page=10`;

// ======================
// 🚀 INIT AFTER DOM READY
// ======================
document.addEventListener("DOMContentLoaded", () => {
    loadLiveMatches();
    setInterval(loadLiveMatches, 60000);
});

function formatTime(dateStr) {
    if (!dateStr) return "--";

    const date = new Date(dateStr);

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderMatches() {
    const tbody = document.getElementById("matchesList");

    tbody.innerHTML = "";

    if (!data.soccer.length) {
        tbody.innerHTML = `<tr><td colspan="2">No matches</td></tr>`;
        return;
    }

    const now = new Date();

    data.soccer.forEach(match => {

        let status = "";

        if (match.isLive) {
            status = `🔴 ${match.scoreA} - ${match.scoreB}`;
        }
        else if (match.kickoff && match.kickoff > now) {
            status = `⏳ ${formatTime(match.kickoff)}`;
        }
        else if (match.kickoff && match.kickoff <= now) {
            status = "✔ FT";
        }
        else {
            status = "⏳ --";
        }

        const row = document.createElement("tr");

        row.innerHTML = `
      <td>${match.teamA} vs ${match.teamB}</td>
      <td>${status}</td>
    `;

        row.onclick = () => showPrediction(match);

        tbody.appendChild(row);
    });
}

function showPrediction(match) {

    const total = match.strengthA + match.strengthB;

    const probA = (match.strengthA / total) * 100;
    const probB = (match.strengthB / total) * 100;

    const diff = Math.abs(probA - probB); // ✅ FIX

    let predictedWinner = "Draw";
    if (probA > probB) predictedWinner = match.teamA;
    if (probB > probA) predictedWinner = match.teamB;

    let actualWinner = "Draw";
    if (match.scoreA > match.scoreB) actualWinner = match.teamA;
    if (match.scoreB > match.scoreA) actualWinner = match.teamB;

    document.getElementById("predictionBox").innerHTML = `
    <div class="prediction-header-row">

      <div class="team-block">
        ${getIndicator(probA)}
        <span>${match.teamA}</span>
        ${getTrend(probA, probB)}
      </div>

      <div class="vs">vs</div>

      <div class="team-block">
        ${getIndicator(probB)}
        <span>${match.teamB}</span>
        ${getTrend(probB, probA)}
      </div>

    </div>

    <div class="prediction-row">

      <div class="pred-item">
        <span class="label">Predicted</span>
        <span class="value">${predictedWinner}</span>
      </div>

      <div class="pred-item">
        <span class="label">Actual</span>
        <span class="value">${actualWinner}</span>
      </div>

      <div class="pred-item badge ${confidenceClass(diff)}">
        ${confidenceLabel(diff)}
      </div>

    </div>
  `;
}

function getIndicator(prob) {
    return prob > 50
        ? `<span class="dot win"></span>`
        : `<span class="dot lose"></span>`;
}

function getTrend(a, b) {
    if (Math.abs(a - b) < 5) return `<span class="trend neutral">→</span>`;
    return a > b
        ? `<span class="trend up">↑</span>`
        : `<span class="trend down">↓</span>`;
}

function confidenceLabel(diff) {
    if (diff > 20) return "HIGH";
    if (diff > 10) return "MEDIUM";
    return "LOW";
}

function confidenceClass(diff) {
    if (diff > 20) return "high";
    if (diff > 10) return "medium";
    return "low";
}


function getScore(scores) {
    if (!scores || !scores.length) {
        return { home: null, away: null };
    }

    // 🔥 priority order
    const priority = [
        "CURRENT",
        "LIVE",
        "FT",
        "2ND_HALF",
        "1ST_HALF",
        "HT"
    ];

    for (let type of priority) {
        const found = scores.find(s => s.description === type);
        if (found) {
            return {
                home: found.score?.home ?? null,
                away: found.score?.away ?? null
            };
        }
    }

    // fallback
    return {
        home: scores[0]?.score?.home ?? null,
        away: scores[0]?.score?.away ?? null
    };
}
// ======================
// 🔄 LOAD MATCHES
// ======================
async function loadLiveMatches() {
    const container = document.getElementById("matchesList");

    if (!container) {
        console.error("❌ matchesList not found in HTML");
        return;
    }

    // ✅ FIX: tbody needs <tr>, not <p>
    container.innerHTML = `
    <tr>
      <td colspan="2">Loading matches...</td>
    </tr>
  `;

    try {
        const res = await fetch(url);
        const dataRes = await res.json();

        console.log("RAW:", dataRes);

        const fixtures = dataRes.data || [];

        if (!fixtures.length) {
            container.innerHTML = `
        <tr>
          <td colspan="2">No matches available</td>
        </tr>
      `;
            return;
        }

        // 🔥 MAP DATA
        data.soccer = fixtures.map(fixture => {

            const participants = fixture.participants || [];

            const home = participants.find(p => p.meta?.location === "home");
            const away = participants.find(p => p.meta?.location === "away");

            const scores = fixture.scores || [];

            // ✅ USE HELPER
            const { home: scoreA, away: scoreB } = getScore(scores);

            const scoreA = scoreObj?.score?.home ?? null;
            const scoreB = scoreObj?.score?.away ?? null;

            // 🧠 MODEL
            const baseAttack = 1.2;
            const baseDefense = 1.0;

            const attackA = baseAttack + Math.random();
            const defenseA = baseDefense + Math.random();

            const attackB = baseAttack + Math.random();
            const defenseB = baseDefense + Math.random();

            const strengthA = attackA / (defenseB || 1);
            const strengthB = attackB / (defenseA || 1);

            // 🔥 FIXED TIME
            let kickoff = null;

            if (fixture.starting_at?.timestamp) {
                kickoff = new Date(fixture.starting_at.timestamp * 1000);
            } else if (fixture.starting_at) {
                kickoff = new Date(fixture.starting_at);
            }



            return {
                teamA: home?.name || "Home",
                teamB: away?.name || "Away",

                scoreA,
                scoreB,

                strengthA,
                strengthB,

                isLive: scoreA !== null && scoreB !== null,

                kickoff
            };
        });

        renderMatches();

    } catch (err) {
        console.error("FETCH ERROR:", err);

        container.innerHTML = `
      <tr>
        <td colspan="2">⚠️ Failed to load matches</td>
      </tr>
    `;
    }
}



// ======================
// 📅 RENDER
// ======================


