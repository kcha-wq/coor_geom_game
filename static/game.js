/**
 * Coordinate Plane Geometry – RPG
 * Use move / rotate / reflect commands to move your character and collect treasures.
 */
(function () {
  "use strict";

  var LOCALE = {
    en: {
      title: "Coordinate Quest",
      namePrompt: "Enter your name to start",
      yourName: "Your name",
      startGame: "Start game",
      subtitle: "Collect all gems. You can only move using the command given each turn.",
      gemsLevel: "Gems: {gems} · Level {level}",
      gemsLeft: "This level: {n} gem(s) left — collect all",
      chooseMove: "1. Choose your move",
      pickCloser: "Pick the movement that brings you closer to a gem.",
      mapLabel: "Map (you · gems · where you'll land)",
      pickFromLeft: "Pick a move from the left.",
      executeMove: "2. Execute the move",
      whereLand: "Where does this move take you? Pick or type the coordinates.",
      coordPlaceholder: "e.g. 2, -1 or (2, -1)",
      moveBtn: "Move!",
      loading: "Loading...",
      errorConsole: "Check the browser console (F12) for details.",
      correct: "Correct!",
      correctGem: "Correct! Gem collected!",
      wrongMove: "That move doesn't reach a gem. Choose another move.",
      wrongCoords: "Wrong. Correct coordinates: {coords}",
      levelGems: "Level {level}! Collect all gems.",
      allGems: "All gems collected!",
      collected: "You collected {gems} gems in {moves} moves!",
      saveScore: "Save your score to the leaderboard:",
      saveRank: "Save & view rankings",
      playAgain: "Play again",
      viewRank: "View rankings",
      right: "right", left: "left", up: "up", down: "down", and: "and",
      move: "Move",
      rotate_90_cw: "Rotate 90° clockwise (about origin)",
      rotate_90_ccw: "Rotate 90° anticlockwise (about origin)",
      rotate_180: "Rotate 180° (about origin)",
      rotate_270_cw: "Rotate 270° clockwise (about origin)",
      rotate_270_ccw: "Rotate 270° anticlockwise (about origin)",
      reflect_x: "Reflect in the x-axis",
      reflect_y: "Reflect in the y-axis",
      reflect_line_x: "Reflect in the line x = {k}",
      reflect_line_y: "Reflect in the line y = {k}",
      you: "YOU",
      langEn: "EN",
      langZh: "中文",
    },
    zh: {
      title: "坐標探險",
      namePrompt: "輸入你的名字開始",
      yourName: "你的名字",
      startGame: "開始遊戲",
      subtitle: "收集所有寶石。每回合只能依指令移動。",
      gemsLevel: "寶石：{gems} · 第 {level} 關",
      gemsLeft: "本關剩 {n} 個寶石 — 全部收集",
      chooseMove: "1. 選擇移動方式",
      pickCloser: "選一個能讓你更靠近寶石的移動。",
      mapLabel: "地圖（你 · 寶石 · 落點）",
      pickFromLeft: "請從左側選擇一個移動。",
      executeMove: "2. 執行移動",
      whereLand: "這一步會到哪裡？選擇或輸入座標。",
      coordPlaceholder: "例如 2, -1 或 (2, -1)",
      moveBtn: "移動！",
      loading: "載入中…",
      errorConsole: "請打開瀏覽器主控台 (F12) 查看詳情。",
      correct: "正確！",
      correctGem: "正確！獲得寶石！",
      wrongMove: "這一步到不了寶石。請選別的移動。",
      wrongCoords: "錯誤。正確座標：{coords}",
      levelGems: "第 {level} 關！收集所有寶石。",
      allGems: "寶石全部收集完成！",
      collected: "你用 {moves} 步收集了 {gems} 個寶石！",
      saveScore: "將成績存到排行榜：",
      saveRank: "儲存並查看排行榜",
      playAgain: "再玩一次",
      viewRank: "查看排行榜",
      right: "右", left: "左", up: "上", down: "下", and: "與",
      move: "移動",
      rotate_90_cw: "繞原點順時針旋轉 90°",
      rotate_90_ccw: "繞原點逆時針旋轉 90°",
      rotate_180: "繞原點旋轉 180°",
      rotate_270_cw: "繞原點順時針旋轉 270°",
      rotate_270_ccw: "繞原點逆時針旋轉 270°",
      reflect_x: "以 x 軸為對稱軸反射",
      reflect_y: "以 y 軸為對稱軸反射",
      reflect_line_x: "以直線 x = {k} 為對稱軸反射",
      reflect_line_y: "以直線 y = {k} 為對稱軸反射",
      you: "你",
      langEn: "EN",
      langZh: "中文",
    },
  };

  function t(key, vars) {
    var s = (LOCALE[state.lang] || LOCALE.en)[key] || LOCALE.en[key] || key;
    if (vars) for (var k in vars) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    return s;
  }

  var loadingEl = document.getElementById("move-options");
  if (loadingEl) loadingEl.innerHTML = "";

  function showError(msg) {
    var el = document.getElementById("move-options");
    if (el) el.innerHTML = "<p class=\"feedback wrong\">Error: " + msg + "</p>";
    var fb = document.getElementById("feedback");
    if (fb) { fb.textContent = t("errorConsole"); fb.className = "feedback wrong"; }
  }

  function updateUIText() {
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      var vars = els[i].getAttribute("data-i18n-vars");
      var v = vars ? JSON.parse(vars) : {};
      var text = t(key, v);
      if (els[i].tagName === "INPUT" && els[i].placeholder !== undefined) els[i].placeholder = text;
      else els[i].textContent = text;
    }
    var langSwitchers = document.querySelectorAll("[data-lang]");
    for (var j = 0; j < langSwitchers.length; j++) {
      var btn = langSwitchers[j];
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    }
  }

  // --- Geometry (transform from current position) ---
  function movePoint(x, y, dx, dy) {
    return [x + dx, y + dy];
  }
  function rotate90CW(x, y) {
    return [y, -x];
  }
  function rotate90CCW(x, y) {
    return [-y, x];
  }
  function rotate180(x, y) {
    return [-x, -y];
  }
  function rotate270CW(x, y) {
    return [-y, x];
  }
  function rotate270CCW(x, y) {
    return [y, -x];
  }
  function reflectX(x, y) {
    return [x, -y];
  }
  function reflectY(x, y) {
    return [-x, y];
  }
  function reflectVerticalLine(x, y, k) {
    return [2 * k - x, y];
  }
  function reflectHorizontalLine(x, y, k) {
    return [x, 2 * k - y];
  }

  function formatCoord(x, y) {
    return "(" + x + ", " + y + ")";
  }
  function parseCoord(s) {
    if (typeof s !== "string") return null;
    s = s.replace(/\s/g, "").replace(/[()]/g, "");
    const parts = s.split(",");
    if (parts.length !== 2) return null;
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    return [a, b];
  }
  function coordEqual(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  // --- RPG state ---
  var savedLang = (typeof localStorage !== "undefined" && localStorage.getItem("coordQuestLang")) || "en";
  const state = {
    lang: savedLang === "zh" ? "zh" : "en",
    playerName: "",
    character: [0, 0],
    treasures: [],
    level: 1,
    treasuresCollected: 0,
    totalMoves: 0,
    answered: false,
    currentCommand: null,
    useInput: false,
  };
  if (typeof localStorage !== "undefined") localStorage.setItem("coordQuestLang", state.lang);

  const CONFIG = {
    treasuresPerLevel: [3, 4, 5],
    maxLevel: 3,
    gridMin: -5,
    gridMax: 4,
    useInputRatio: 0.35,
  };

  function placeTreasures(count) {
    const list = [];
    const avoid = [state.character[0] + "," + state.character[1]];
    while (list.length < count) {
      const x = randInt(CONFIG.gridMin, CONFIG.gridMax);
      const y = randInt(CONFIG.gridMin, CONFIG.gridMax);
      const key = x + "," + y;
      if (avoid.indexOf(key) >= 0) continue;
      avoid.push(key);
      list.push([x, y]);
    }
    return list;
  }

  function inBounds(nx, ny) {
    return nx >= CONFIG.gridMin && nx <= CONFIG.gridMax && ny >= CONFIG.gridMin && ny <= CONFIG.gridMax;
  }

  function cellHasGem(nx, ny) {
    return state.treasures.some(function (tr) { return tr && tr[0] === nx && tr[1] === ny; });
  }

  function generateMoveOptions() {
    var x = state.character[0], y = state.character[1];
    var options = [];

    var activeTreasures = state.treasures.filter(Boolean);

    activeTreasures.forEach(function (treasure) {
      var tx = treasure[0], ty = treasure[1];
      var added = false;

      if (!added && (x !== 0 || y !== 0)) {
        var rots = [
          { fn: rotate90CW, key: "rotate_90_cw" },
          { fn: rotate90CCW, key: "rotate_90_ccw" },
          { fn: rotate180, key: "rotate_180" },
          { fn: rotate270CW, key: "rotate_270_cw" },
          { fn: rotate270CCW, key: "rotate_270_ccw" }
        ];
        rots = shuffle(rots.slice());
        for (var i = 0; i < rots.length; i++) {
          var rp = rots[i].fn(x, y);
          var nx = rp[0], ny = rp[1];
          if (nx === tx && ny === ty) {
            options.push({ type: "rotate", result: [tx, ty], text: t(rots[i].key) });
            added = true;
            break;
          }
        }
      }

      if (!added) {
        var refls = [];
        if (reflectX(x, y)[0] === tx && reflectX(x, y)[1] === ty) refls.push({ text: t("reflect_x") });
        if (reflectY(x, y)[0] === tx && reflectY(x, y)[1] === ty) refls.push({ text: t("reflect_y") });
        if (y === ty && (x + tx) % 2 === 0) {
          var kVert = (x + tx) / 2;
          if (kVert >= CONFIG.gridMin && kVert <= CONFIG.gridMax) refls.push({ text: t("reflect_line_x", { k: kVert }) });
        }
        if (x === tx && (y + ty) % 2 === 0) {
          var kHorz = (y + ty) / 2;
          if (kHorz >= CONFIG.gridMin && kHorz <= CONFIG.gridMax) refls.push({ text: t("reflect_line_y", { k: kHorz }) });
        }
        if (refls.length > 0) {
          var chosen = randChoice(refls);
          options.push({ type: "reflect", result: [tx, ty], text: chosen.text });
          added = true;
        }
      }

      if (!added) {
        var dx = tx - x, dy = ty - y;
        var hor = dx > 0 ? dx + " " + t("right") : dx < 0 ? -dx + " " + t("left") : "";
        var ver = dy > 0 ? dy + " " + t("up") : dy < 0 ? -dy + " " + t("down") : "";
        options.push({ type: "move", result: [tx, ty], text: t("move") + " " + [hor, ver].filter(Boolean).join(" " + t("and") + " ") });
      }
    });

    var gemResultKeys = {};
    options.forEach(function (cmd) {
      var key = cmd.result[0] + "," + cmd.result[1];
      gemResultKeys[key] = true;
    });

    var numDecoys = Math.min(2, Math.max(0, 4 - options.length));
    for (var d = 0; d < numDecoys; d++) {
      var decoy = null;
      for (var tryCount = 0; tryCount < 30; tryCount++) {
        var dx = randInt(-5, 5), dy = randInt(-5, 5);
        if (dx === 0 && dy === 0) continue;
        var np = movePoint(x, y, dx, dy);
        var nx = np[0], ny = np[1];
        if (!inBounds(nx, ny)) continue;
        var key = nx + "," + ny;
        if (gemResultKeys[key]) continue;
        if (cellHasGem(nx, ny)) continue;
        var hor = dx > 0 ? dx + " " + t("right") : dx < 0 ? -dx + " " + t("left") : "";
        var ver = dy > 0 ? dy + " " + t("up") : dy < 0 ? -dy + " " + t("down") : "";
        decoy = { type: "move", result: [nx, ny], text: t("move") + " " + [hor, ver].filter(Boolean).join(" " + t("and") + " "), decoy: true };
        gemResultKeys[key] = true;
        break;
      }
      if (decoy) options.push(decoy);
    }

    options = shuffle(options);

    options.forEach(function (cmd) {
      var answer = formatCoord(cmd.result[0], cmd.result[1]);
      var wrongs = new Set([answer]);
      while (wrongs.size < 4) {
        wrongs.add(formatCoord(randInt(CONFIG.gridMin, CONFIG.gridMax), randInt(CONFIG.gridMin, CONFIG.gridMax)));
      }
      cmd.answerStr = answer;
      cmd.answer = cmd.result.slice ? cmd.result.slice() : [cmd.result[0], cmd.result[1]];
      var wrongArr = Array.from(wrongs).filter(function (c) { return c !== answer; });
      cmd.choices = [answer].concat(shuffle(wrongArr).slice(0, 3));
      shuffle(cmd.choices);
    });

    return options;
  }

  var MAP_SIZE = 420;

  // --- Map drawing (character + treasures); optional 4th arg = destination (where the move takes you) ---
  function drawMap(canvas, character, treasures, destination) {
    if (!canvas || !canvas.getContext) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = MAP_SIZE;
    const h = MAP_SIZE;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const padding = 28;
    const size = Math.min(w, h) - 2 * padding;
    const ox = w / 2;
    const oy = h / 2;
    const range = CONFIG.gridMax - CONFIG.gridMin + 1;
    const scale = size / range;
    function toPx(px, py) {
      return [ox + (px - CONFIG.gridMin - (range - 1) / 2) * scale, oy - (py - CONFIG.gridMin - (range - 1) / 2) * scale];
    }

    var bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#2d3548");
    bg.addColorStop(1, "#1e2433");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    for (var i = 0; i <= range; i++) {
      var v1 = toPx(CONFIG.gridMin + i, CONFIG.gridMin);
      var v2 = toPx(CONFIG.gridMin + i, CONFIG.gridMax);
      ctx.beginPath();
      ctx.moveTo(v1[0], v1[1]);
      ctx.lineTo(v2[0], v2[1]);
      ctx.stroke();
      var h1 = toPx(CONFIG.gridMin, CONFIG.gridMin + i);
      var h2 = toPx(CONFIG.gridMax, CONFIG.gridMin + i);
      ctx.beginPath();
      ctx.moveTo(h1[0], h1[1]);
      ctx.lineTo(h2[0], h2[1]);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(108, 158, 248, 0.75)";
    ctx.lineWidth = 2.5;
    var originPx = toPx(0, 0);
    var ox0 = originPx[0], oy0 = originPx[1];
    ctx.beginPath();
    ctx.moveTo(ox0, oy);
    ctx.lineTo(ox0 + (CONFIG.gridMax - CONFIG.gridMin + 1) * scale, oy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy0);
    ctx.lineTo(ox, oy0 - (CONFIG.gridMax - CONFIG.gridMin + 1) * scale);
    ctx.stroke();

    (treasures || []).filter(Boolean).forEach(function (tr) {
      var tp = toPx(tr[0], tr[1]);
      var gx = tp[0], gy = tp[1];
      ctx.fillStyle = "#c4b5fd";
      ctx.beginPath();
      ctx.arc(gx, gy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7c3aed";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("◆", gx, gy);
    });

    if (destination && destination[0] !== undefined && destination[1] !== undefined) {
      var sameAsChar = character && character[0] === destination[0] && character[1] === destination[1];
      if (!sameAsChar) {
        var dp = toPx(destination[0], destination[1]);
        ctx.strokeStyle = "rgba(74, 222, 128, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(dp[0], dp[1], 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "#4ade80";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", dp[0], dp[1]);
      }
    }

    if (character) {
      var cp = toPx(character[0], character[1]);
      var cx = cp[0], cy = cp[1];
      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t("you"), cx, cy);
    }
  }

  function get(id) {
    return document.getElementById(id);
  }

  function updateHUD() {
    var el = get("score-display");
    if (el) el.textContent = t("gemsLevel", { gems: state.treasuresCollected, level: state.level });
    var lvlEl = get("level-treasures");
    if (lvlEl) lvlEl.textContent = t("gemsLeft", { n: state.treasures.filter(Boolean).length });
  }

  function showTurn(optionsData) {
    state.currentCommand = null;
    state.answered = false;

    var moveOptionsEl = get("move-options");
    if (moveOptionsEl) moveOptionsEl.innerHTML = "";
    var coordPhase = get("coordinate-phase");
    if (coordPhase) {
      coordPhase.classList.remove("visible");
      var placeholder = get("placeholder-prompt");
      var phase2 = get("phase-2-content");
      if (placeholder) placeholder.style.display = "block";
      if (phase2) phase2.style.display = "none";
    }

    var feedback = get("feedback");
    if (feedback) { feedback.textContent = ""; feedback.className = "feedback"; }

    var canvas = get("grid-canvas");
    if (canvas) drawMap(canvas, state.character, state.treasures);

    optionsData.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", function () {
        selectMove(opt, moveOptionsEl, btn);
      });
      if (moveOptionsEl) moveOptionsEl.appendChild(btn);
    });
  }

  function selectMove(selectedCmd, containerEl, selectedBtn) {
    if (state.answered) return;
    state.currentCommand = selectedCmd;

    var btns = containerEl ? containerEl.querySelectorAll(".option-btn") : [];
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (btns[i] === selectedBtn) btns[i].style.borderColor = "var(--accent)";
    }

    var coordPhase = get("coordinate-phase");
    if (coordPhase) {
      coordPhase.classList.add("visible");
      var placeholder = get("placeholder-prompt");
      var phase2 = get("phase-2-content");
      if (placeholder) placeholder.style.display = "none";
      if (phase2) phase2.style.display = "block";
    }

    var canvas = get("grid-canvas");
    if (canvas) drawMap(canvas, state.character, state.treasures, selectedCmd.answer);

    var optionsList = get("options-list");
    var inputBlock = get("input-block");
    var submitBtn = get("submit-answer");

    if (state.useInput) {
      if (optionsList) optionsList.style.display = "none";
      if (inputBlock) inputBlock.style.display = "block";
      var input = get("input-answer");
      if (input) {
        input.value = "";
        input.className = "input-answer";
        input.disabled = false;
        input.focus();
      }
      if (submitBtn) submitBtn.disabled = false;
    } else {
      if (inputBlock) inputBlock.style.display = "none";
      if (optionsList) {
        optionsList.style.display = "block";
        optionsList.innerHTML = "";
        selectedCmd.choices.forEach(function (choice) {
          var li = document.createElement("li");
          var btn = document.createElement("button");
          btn.className = "option-btn";
          btn.textContent = choice;
          btn.addEventListener("click", function () { onAnswer(choice, selectedCmd); });
          li.appendChild(btn);
          optionsList.appendChild(li);
        });
      }
    }
  }

  function onAnswer(choice, cmdData) {
    if (state.answered) return;
    state.answered = true;

    var raw = typeof choice === "string" ? choice : (get("input-answer") && get("input-answer").value);
    var parsed = parseCoord(raw);
    var correct = parsed && coordEqual(parsed, cmdData.answer);

    var optionsList = get("options-list");
    var buttons = optionsList ? optionsList.querySelectorAll(".option-btn") : [];
    buttons.forEach(function (btn) {
      btn.disabled = true;
      var p = parseCoord(btn.textContent);
      if (p && coordEqual(p, cmdData.answer)) btn.classList.add("correct");
      else if (choice && btn.textContent === choice && !correct) btn.classList.add("wrong");
    });

    var input = get("input-answer");
    if (input) {
      input.disabled = true;
      input.className = "input-answer " + (correct ? "correct" : "wrong");
    }
    var sub = get("submit-answer");
    if (sub) sub.disabled = true;

    var feedback = get("feedback");
    var landedOnGem = correct && cellHasGem(cmdData.answer[0], cmdData.answer[1]);

    if (feedback) {
      if (correct) {
        if (landedOnGem) {
          state.totalMoves += 1;
          state.character = cmdData.answer.slice();
          var idx = state.treasures.findIndex(function (tr) { return tr && tr[0] === state.character[0] && tr[1] === state.character[1]; });
          if (idx >= 0) {
            state.treasures[idx] = null;
            state.treasuresCollected += 1;
          }
          feedback.textContent = t("correctGem");
          feedback.className = "feedback correct";
        } else {
          feedback.textContent = t("wrongMove");
          feedback.className = "feedback wrong";
        }
      } else {
        state.totalMoves += 1;
        feedback.textContent = t("wrongCoords", { coords: cmdData.answerStr });
        feedback.className = "feedback wrong";
      }
    }

    updateHUD();
    var canvas = get("grid-canvas");
    if (canvas) drawMap(canvas, state.character, state.treasures);

    if (correct && landedOnGem) {
      setTimeout(nextTurn, 1400);
    } else if (correct && !landedOnGem) {
      setTimeout(function () {
        state.answered = false;
        showTurn(generateMoveOptions());
      }, 1800);
    } else {
      setTimeout(nextTurn, 1200);
    }
  }

  function nextTurn() {
    var left = state.treasures.filter(Boolean).length;
    if (left === 0) {
      if (state.level >= CONFIG.maxLevel) {
        showEndScreen();
        return;
      }
      state.level += 1;
      state.character = [0, 0];
      state.treasures = placeTreasures(CONFIG.treasuresPerLevel[state.level - 1] || 3);
      var fb = get("feedback");
      if (fb) { fb.textContent = t("levelGems", { level: state.level }); fb.className = "feedback correct"; }
      updateHUD();
      setTimeout(function () {
        state.useInput = Math.random() < CONFIG.useInputRatio;
        showTurn(generateMoveOptions());
      }, 1500);
      return;
    }
    state.useInput = Math.random() < CONFIG.useInputRatio;
    showTurn(generateMoveOptions());
  }

  function showEndScreen() {
    var gameArea = get("game-area");
    if (gameArea) gameArea.style.display = "none";
    var end = get("end-screen");
    if (end) {
      end.style.display = "block";
      var finalScoreEl = end.querySelector(".final-score");
      if (finalScoreEl) finalScoreEl.textContent = t("collected", { gems: state.treasuresCollected, moves: state.totalMoves });
      var nameInput = get("end-player-name");
      if (nameInput) nameInput.value = state.playerName || "";
    }
    var form = get("end-name-form");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var nameInput = form.querySelector('input[name="player_name"]');
        var name = nameInput ? nameInput.value.trim() : state.playerName;
        submitScore(name || "Anonymous", state.treasuresCollected, state.totalMoves);
      };
    }
  }

  function submitScore(playerName, score, total) {
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: playerName || "Anonymous",
        score: score,
        total: total,
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) window.location.href = "/rank";
        else alert(data.error || "Failed to save score.");
      })
      .catch(function () { alert("Network error. Score not saved."); });
  }

  function startGame() {
    state.level = 1;
    state.character = [0, 0];
    state.treasures = placeTreasures(CONFIG.treasuresPerLevel[0] || 3);
    state.treasuresCollected = 0;
    state.totalMoves = 0;

    var endEl = get("end-screen");
    if (endEl) endEl.style.display = "none";
    var gameEl = get("game-area");
    if (gameEl) gameEl.style.display = "block";

    updateHUD();
    state.useInput = Math.random() < CONFIG.useInputRatio;
    setTimeout(function () {
      try {
        showTurn(generateMoveOptions());
      } catch (e) {
        showError("showTurn: " + (e.message || e));
      }
    }, 0);
  }

  function init() {
    updateUIText();

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang !== "en" && lang !== "zh") return;
        state.lang = lang;
        if (typeof localStorage !== "undefined") localStorage.setItem("coordQuestLang", state.lang);
        updateUIText();
        if (get("game-area") && get("game-area").style.display !== "none") updateHUD();
        var canvas = get("grid-canvas");
        if (canvas && state.character) drawMap(canvas, state.character, state.treasures, state.currentCommand ? state.currentCommand.result : null);
      });
    });

    var nameEntry = get("name-entry");
    var nameForm = get("name-entry-form");
    if (nameForm) {
      nameForm.onsubmit = function (e) {
        e.preventDefault();
        var input = get("player-name-input");
        var name = input ? input.value.trim() : "";
        if (!name) return;
        state.playerName = name.slice(0, 80);
        if (nameEntry) nameEntry.style.display = "none";
        var header = get("game-header");
        if (header) header.style.display = "";
        var gameArea = get("game-area");
        if (gameArea) gameArea.style.display = "block";
        startGame();
      };
    }

    var submitBtn = get("submit-answer");
    if (submitBtn) submitBtn.addEventListener("click", function () {
      var cmd = state.currentCommand;
      if (cmd) onAnswer(null, cmd);
    });
    var input = get("input-answer");
    if (input) input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var cmd = state.currentCommand;
        if (cmd) onAnswer(null, cmd);
      }
    });
  }

  function runInit() {
    try {
      init();
    } catch (e) {
      showError("init: " + (e.message || e));
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
  } else {
    setTimeout(runInit, 0);
  }

  window.CoordinateGame = { startGame, drawMap: drawMap };
})();
