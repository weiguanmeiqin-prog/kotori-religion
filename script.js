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

    let nextX = state.x; 
    let nextY = state.y;
    const map = MAPS[state.currentMap];

    // キー判定
    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    const mapWidth = 13; 
    const mapHeight = 12;

    // --- エリア移動判定（全方向対応） ---
    if (nextX >= mapWidth && map.exits.right) {
        moveArea(map.exits.right);
    } else if (nextX < 0 && map.exits.left) {
        moveArea(map.exits.left);
    } else if (nextY >= mapHeight && map.exits.down) {
        moveArea(map.exits.down);
    } else if (nextY < 0 && map.exits.up) {
        moveArea(map.exits.up);
    } 
    // --- 通常の移動判定 ---
    else if (nextX >= 0 && nextX < mapWidth && nextY >= 0 && nextY < mapHeight) {
        // 壁（1）がなければ進める
        if (map.layout[nextY] && map.layout[nextY][nextX] === 0) {
            state.x = nextX;
            state.y = nextY;
            
            checkEvents(map); // ✨の取得チェック
            checkScare();    // スリル演出チェック
        }
    }
    renderMap();
}

// エリア移動の共通処理
function moveArea(exitData) {
    state.currentMap = exitData.map;
    // 迷宮に入るなら生成
    if (state.currentMap === "infinite_labyrinth") {
        enterInfiniteLabyrinth();
    }
    state.x = exitData.x;
    state.y = exitData.y;
}

// ✨などのイベントを処理する関数
function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (ev && !state.history.includes(ev.id)) {
        if (ev.type === 'origami') {
            state.origamiCount++;
            const se = document.getElementById('se-pickup');
            if(se) se.play();
        }
        
        state.history.push(ev.id);
        
        let msg = ev.msg;
        if (MONOLOGUES[state.origamiCount]) {
            msg += "\n\n" + MONOLOGUES[state.origamiCount];
        }
        typeWriter(msg);
    }
}
// テキストをカタカタ表示する関数（これがないとメッセージが出ません）
function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    dialog.textContent = "";
    
    // 10枚ごとに色を変える遊び心
    const isSpecial = state.origamiCount > 0 && state.origamiCount % 10 === 0;
    dialog.style.color = isSpecial ? "gold" : "white";
    
    let i = 0;
    const timer = setInterval(() => {
        dialog.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            state.isTyping = false;
            
            // 100枚達成時のエンディング演出
            if (state.origamiCount >= 100) {
                handleGameEnd();
            }
        }
    }, 30);
}

// エンディング演出
function handleGameEnd() {
    document.body.style.transition = "background-color 4s";
    document.body.style.backgroundColor = "white";
    setTimeout(() => {
        alert("CHAPTER 1 修復完了。\n教祖様、光の向こう側でお待ちしています。");
    }, 4000);
}

// ページ読み込み時に実行
window.onload = () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
};
