const state = {
    x: 6, y: 5,
    currentMap: "shibuya_station",
    origamiCount: 0,
    isTyping: false,
    history: []
};

const MONOLOGUES = {
    10: "「10枚。指先が、紙の角に馴染んできた。」",
    20: "「20枚。かつてここには100万人がいたという。今は私と、この紙だけ。」",
    30: "「30枚。2XXX年の風は冷たい。でも、この紙は少し温かい気がする。」",
    100: "「100枚。……千羽鶴への、最初の1ページが書き終わった。\n（CHAPTER 1 END: 遠くで、誰かが呼ぶ声がした。）」"
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    screen.innerHTML = '';

    map.layout.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            if (cell === 1) div.className = 'wall';
            div.id = `cell-${x}-${y}`;
            screen.appendChild(div);
        });
    });

    map.events.forEach(ev => {
        const cell = document.getElementById(`cell-${ev.x}-${ev.y}`);
        if (cell && !state.history.includes(ev.id)) {
            cell.textContent = ev.char;
        }
    });

    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    p.style.position = 'absolute';
    screen.appendChild(p);
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    dialog.textContent = "";
    
    // 10枚ごとの演出：色を変える
    dialog.style.color = (state.origamiCount % 10 === 0 && state.origamiCount > 0) ? "gold" : "white";
    
    let i = 0;
    const timer = setInterval(() => {
        dialog.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            state.isTyping = false;
            if(state.origamiCount >= 100) {
                setTimeout(() => { document.body.style.backgroundColor = "black"; alert("CHAPTER 2 制作決定..."); }, 2000);
            }
        }
    }, 40);
}

function handleInput(e) {
    if (state.isTyping) return;
    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    // マップ移動処理
    if (nextX >= 13 && map.exits.right) {
        const ex = map.exits.right; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX < 0 && map.exits.left) {
        const ex = map.exits.left; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY >= 12 && map.exits.down) {
        const ex = map.exits.down; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY < 0 && map.exits.up) {
        const ex = map.exits.up; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (map.layout[nextY] && map.layout[nextY][nextX] === 0) {
        state.x = nextX; state.y = nextY;
        const ev = map.events.find(e => e.x === state.x && e.y === state.y);
        if (ev && !state.history.includes(ev.id)) {
            if (ev.type === 'origami') state.origamiCount += 1;
            if (ev.type === 'origami_bonus') state.origamiCount += 3;
            
            state.history.push(ev.id);
            let finalMsg = ev.msg + ` (${state.origamiCount}/100)`;
            if (MONOLOGUES[state.origamiCount]) finalMsg += "\n\n" + MONOLOGUES[state.origamiCount];
            typeWriter(finalMsg);
        }
    }
    renderMap();
}

document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
});
