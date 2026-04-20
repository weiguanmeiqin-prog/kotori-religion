const state = {
    x: 6, y: 5,
    currentMap: "shibuya_station",
    origamiCount: 0,
    isTyping: false,
    history: []
};

const MONOLOGUES = {
    1: "「1枚。指が、折り方を思い出していく。」",
    10: "「10枚。この孤独な作業が、今の私のすべてだ。」"
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    if (!screen) return;

    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    
    screen.innerHTML = ''; 

    // イベント配置
    map.events.forEach(ev => {
        if (!state.history.includes(ev.id)) {
            const div = document.createElement('div');
            div.className = 'cell';
            div.style.left = (ev.x * 32) + 'px';
            div.style.top = (ev.y * 32) + 'px';
            div.textContent = ev.char;
            screen.appendChild(div);
        }
    });

    // プレイヤー配置
    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
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
        }
    }, 30);
}

function handleInput(e) {
    if (state.isTyping) return;
    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    // エリア移動
    if (nextX >= 13 && map.exits.right) {
        const ex = map.exits.right; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX < 0 && map.exits.left) {
        const ex = map.exits.left; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY >= 12 && map.exits.down) {
        const ex = map.exits.down; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY < 0 && map.exits.up) {
        const ex = map.exits.up; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX >= 0 && nextX < 13 && nextY >= 0 && nextY < 12) {
        state.x = nextX; state.y = nextY;
        
        const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
        if (ev && !state.history.includes(ev.id)) {
            if (ev.type === 'origami') state.origamiCount++;
            state.history.push(ev.id);
            let msg = ev.msg;
            if (MONOLOGUES[state.origamiCount]) msg += "\n\n" + MONOLOGUES[state.origamiCount];
            typeWriter(msg);
        }
    }
    renderMap();
}

// 読み込み完了後に開始
window.onload = () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
};
