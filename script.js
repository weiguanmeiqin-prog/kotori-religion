const state = {
    x: 6, y: 11, // スタート位置
    currentMap: "shibuya_crossroad",
    origamiCount: 0,
    isTyping: false,
    history: [] // 調べた場所を記録
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    screen.innerHTML = '';

    // マップが広い場合、プレイヤーを中心に表示（カメラ追従の簡易版）
    map.layout.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            if (cell === 1) div.className = 'wall';
            div.id = `cell-${x}-${y}`;
            screen.appendChild(div);
        });
    });

    // イベント配置
    map.events.forEach(ev => {
        const cell = document.getElementById(`cell-${ev.x}-${ev.y}`);
        if (cell) {
            // すでに拾った折り紙は表示しない
            if (ev.type === 'origami' && state.history.includes(ev.id)) {
                cell.textContent = '';
            } else {
                cell.textContent = ev.char;
            }
        }
    });

    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.position = 'absolute';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    screen.appendChild(p);
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    dialog.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
        dialog.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            state.isTyping = false;
            // 100枚達成チェック
            if(state.origamiCount >= 100) {
                setTimeout(() => alert("「千羽鶴まで、あと900枚…」 CHAPTER 1 CLEAR"), 1000);
            }
        }
    }, 30);
}

function handleInput(e) {
    if (state.isTyping) return;
    let nextX = state.x;
    let nextY = state.y;

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    const map = MAPS[state.currentMap];

    // マップ移動
    if (nextY < 0 && map.exits.up) {
        state.currentMap = map.exits.up.map; state.y = 12; renderMap(); return;
    }
    if (nextY > 12 && map.exits.down) {
        state.currentMap = map.exits.down.map; state.y = 0; renderMap(); return;
    }

    if (map.layout[nextY] && map.layout[nextY][nextX] === 0) {
        state.x = nextX; state.y = nextY;
        const event = map.events.find(ev => ev.x === state.x && ev.y === state.y);
        
        if (event && !state.history.includes(event.id)) {
            if (event.type === 'origami') {
                state.origamiCount++;
                state.history.push(event.id);
                typeWriter(`${event.msg}（現在の折り紙: ${state.origamiCount}/100）`);
            } else {
                typeWriter(event.msg);
            }
        }
    }
    renderMap();
}
