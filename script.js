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
// マップを自動生成する関数（13x12のランダム廃墟）
function generateRandomRuins() {
    const layout = [];
    for (let y = 0; y < 12; y++) {
        const row = [];
        for (let x = 0; x < 13; x++) {
            // 20%の確率で「崩れた瓦礫(1)」を配置、それ以外は「通路(0)」
            row.push(Math.random() < 0.2 ? 1 : 0);
        }
        layout.push(row);
    }
    
    // プレイヤーの周り(6,5)だけは必ず通路にする
    layout[5][6] = 0;
    layout[4][6] = 0;
    layout[6][6] = 0;
    layout[5][5] = 0;
    layout[5][7] = 0;
    
    return layout;
}

// エリア移動時に「迷宮」だった場合、マップを再構築する
function enterInfiniteLabyrinth() {
    const map = MAPS["infinite_labyrinth"];
    map.layout = generateRandomRuins();
    
    // ランダムな位置に折り紙を1枚配置
    const rx = Math.floor(Math.random() * 11) + 1;
    const ry = Math.floor(Math.random() * 10) + 1;
    map.events = [
        { id: 'random_' + Date.now(), x: rx, y: ry, type: 'origami', char: '✨', msg: "ノイズの狭間に、震える1枚があった。" }
    ];
}
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
