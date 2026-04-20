const state = {
    x: 6, y: 5,
    currentMap: "shibuya_station",
    origamiCount: 0,
    isTyping: false,
    history: []
};

const MONOLOGUES = {
    1: "「1枚。指先が、紙の角に馴染んできた。」",
    5: "「5枚。かつてここには多くの音が溢れていたという。今は、私の足音だけ。」",
    10: "「10枚。この紙を折る時だけ、私は自分が人間だったことを思い出す。」",
    15: "「15枚。2XXX年の風は、どこか遠い海のような匂いがする。」",
    20: "「20枚。……誰かが後ろを歩いている気がした。でも、振り返れば空虚な街だけ。」",
    100: "「100枚。……千羽鶴への最初の1ページが書き終わった。CHAPTER 1 END.」"
};
function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    
    screen.innerHTML = ''; // 一旦クリア

    // 1. イベントオブジェクト（ゴミ箱や折り紙）を座標に直接配置
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

    // 2. プレイヤーを配置
    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.position = 'absolute';
    p.style.width = '32px';
    p.style.height = '32px';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    screen.appendChild(p);

    // 3. 影のグリッチ演出（稀に後ろに誰かいる）
    if (Math.random() < 0.10) {
        const shadow = document.createElement('div');
        shadow.className = 'cell';
        shadow.textContent = '👤';
        shadow.style.left = (state.x * 32) + 'px';
        shadow.style.top = ((state.y + 1) * 32) + 'px'; // 一歩後ろ
        shadow.style.opacity = "0.3";
        screen.appendChild(shadow);
        setTimeout(() => shadow.remove(), 200);
    }
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    dialog.textContent = "";
    dialog.style.color = (state.origamiCount % 10 === 0 && state.origamiCount > 0) ? "gold" : "white";
    
    let i = 0;
    const timer = setInterval(() => {
        dialog.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            state.isTyping = false;
            if (state.origamiCount >= 100) handleGameEnd();
        }
    }, 30);
}

function showPhantomVision() {
    const screen = document.getElementById('game-screen');
    const originalBg = screen.style.backgroundColor;
    screen.style.backgroundColor = "#d2b48c"; // セピア色
    setTimeout(() => { screen.style.backgroundColor = originalBg; }, 100);
}

function handleInput(e) {
    if (state.isTyping) return;
    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    const mapWidth = map.layout[0].length;
    const mapHeight = map.layout.length;

    // エリア移動
    if (nextX >= mapWidth && map.exits.right) {
        const ex = map.exits.right; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX < 0 && map.exits.left) {
        const ex = map.exits.left; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY >= mapHeight && map.exits.down) {
        const ex = map.exits.down; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY < 0 && map.exits.up) {
        const ex = map.exits.up; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (map.layout[nextY] && map.layout[nextY][nextX] === 0) {
        state.x = nextX; state.y = nextY;
        
        // 幻影演出
        if (Math.random() < 0.02) showPhantomVision();

        const ev = map.events.find(e => e.x === state.x && e.y === state.y);
        if (ev && !state.history.includes(ev.id)) {
            if (ev.type === 'origami') state.origamiCount += 1;
            else if (ev.type === 'origami_bonus') {
                state.origamiCount += (ev.id === 'bonus1') ? 3 : 5;
            }
            
            if (ev.type === 'origami' || ev.type === 'origami_bonus') state.history.push(ev.id);
            
            let msg = ev.msg;
            if (MONOLOGUES[state.origamiCount]) msg += "\n\n" + MONOLOGUES[state.origamiCount];
            typeWriter(msg);
        }
    }
    renderMap();
}

function handleGameEnd() {
    document.body.style.transition = "background-color 3s";
    document.body.style.backgroundColor = "white";
    setTimeout(() => {
        alert("CHAPTER 1 修復完了。……教祖様、次は新宿でお会いしましょう。");
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
});
