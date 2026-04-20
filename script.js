const state = {
    x: 1,
    y: 1,
    currentMap: "shibuya_station",
    isTyping: false,
    garbageSearchCount: 0
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    if (!screen) return;
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
        if (cell) cell.textContent = ev.char;
    });

    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.position = 'absolute';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    p.style.width = '32px';
    p.style.height = '32px';
    screen.appendChild(p);
}

function typeWriter(text) {
    if (state.isTyping) return;
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
    }, 40);
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

    if (nextX >= 13 && map.exits.right) {
        state.currentMap = map.exits.right.map;
        state.x = map.exits.right.x; state.y = map.exits.right.y;
        renderMap(); return;
    }
    if (nextX < 0 && map.exits.left) {
        state.currentMap = map.exits.left.map;
        state.x = map.exits.left.x; state.y = map.exits.left.y;
        renderMap(); return;
    }

    if (map.layout[nextY] && map.layout[nextY][nextX] === 0) {
        state.x = nextX;
        state.y = nextY;
        const event = map.events.find(ev => ev.x === state.x && ev.y === state.y);
        if (event) {
            let message = event.msg;
            if (event.id === 'garbage') {
                state.garbageSearchCount++;
                if (state.garbageSearchCount > 3) message = "ゴミ箱の底に、小さな『ありがとう』が見えた。";
            }
            typeWriter(message);
        }
    }
    renderMap();
}

// 起動！
document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
});
