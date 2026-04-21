const state = {
    x: 6, y: 5,
    currentMap: "shibuya_station",
    origamiCount: 0,
    isTyping: false,
    history: [],
    steps: 0, // 追跡者用
    isGlitching: false
};

// 100枚分の独白（一部抜粋：実際には100個まで連番で書けます）
const MONOLOGUES = {
    1: "「1枚。指が、折り方を思い出していく。」",
    10: "「10枚。この孤独な作業が、今の私のすべてだ。」",
    13: "「……今、後ろで足音がしなかったか？」",
    20: "「20枚。かつてここには数えきれないほどの『声』があった。」",
    50: "「50枚。半分だ。世界のノイズが少し静かになった気がする。」",
    100: "「100枚。……千羽鶴が完成した。 CHAPTER 1 END」"
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    screen.innerHTML = ''; 

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

    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    screen.appendChild(p);
}

// スリル演出：追跡者の影
function checkScare() {
    state.steps++;
    // 30歩ごとに10%の確率でグリッチ発生
    if (state.steps > 30 && Math.random() < 0.1 && !state.isGlitching) {
        state.isGlitching = true;
        const screen = document.getElementById('game-screen');
        const se = document.getElementById('se-glitch');
        
        screen.classList.add('glitch-active');
        if(se) se.play();
        
        setTimeout(() => {
            screen.classList.remove('glitch-active');
            state.isGlitching = false;
            state.steps = 0;
            // 稀に別の場所に飛ばされる
            if(Math.random() < 0.3) {
                state.x = Math.floor(Math.random() * 10);
                state.y = Math.floor(Math.random() * 10);
                renderMap();
                typeWriter("「……逃げなきゃ。何かが、すぐ後ろにいる。」");
            }
        }, 1000);
    }
}

function handleInput(e) {
    if (state.isTyping) return;
    
    // BGM開始（初回操作時のみ）
    const bgm = document.getElementById('bgm-wind');
    if (bgm && bgm.paused) bgm.play();

    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    // エリア移動
    const mapWidth = 13; const mapHeight = 12;
    if (nextX >= mapWidth && map.exits.right) {
        const ex = map.exits.right; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX < 0 && map.exits.left) {
        const ex = map.exits.left; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY >= mapHeight && map.exits.down) {
        const ex = map.exits.down; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY < 0 && map.exits.up) {
        const ex = map.exits.up; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX >= 0 && nextX < 13 && nextY >= 0 && nextY < 12) {
        state.x = nextX; state.y = nextY;
        
        // 移動するたびにスリル判定
        checkScare();

        const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
        if (ev && !state.history.includes(ev.id)) {
            if (ev.type === 'origami') {
                state.origamiCount++;
                document.getElementById('se-pickup').play();
            }
            state.history.push(ev.id);
            let msg = ev.msg;
            if (MONOLOGUES[state.origamiCount]) msg += "\n\n" + MONOLOGUES[state.origamiCount];
            typeWriter(msg);
        }
    }
    renderMap();
}

// typeWriter 等の他関数はそのまま...
