const state = {
    // ... 既存の項目 ...
    eventCounts: {}, // 何回調べたかを記録
};

function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (!ev) return;

    // 初めて調べる場合はカウントを0で初期化
    if (!state.eventCounts[ev.id]) state.eventCounts[ev.id] = 0;
    
    // カウントアップ
    state.eventCounts[ev.id]++;
    const count = state.eventCounts[ev.id];

    // ✨（折り紙）の場合は今まで通り1回きり
    if (ev.type === 'origami') {
        if (!state.history.includes(ev.id)) {
            state.origamiCount++;
            state.history.push(ev.id);
            const se = document.getElementById('se-pickup');
            if(se) se.play().catch(()=>{});
            typeWriter(ev.msg + (MONOLOGUES[state.origamiCount] ? "\n\n" + MONOLOGUES[state.origamiCount] : ""));
        }
        return;
    }

    // 一般イベント（NPCや看板など）は回数に応じてメッセージ変化！
    let displayMsg = "";
    if (Array.isArray(ev.msg)) {
        // メッセージが配列なら、回数に応じて進む（最後はループ）
        const index = Math.min(count - 1, ev.msg.length - 1);
        displayMsg = ev.msg[index];
    } else {
        displayMsg = ev.msg;
    }

    // 特定回数でSEを鳴らすなどの演出も可
    if (count >= 3 && ev.specialSe) {
        const se = document.getElementById(ev.specialSe);
        if(se) se.play().catch(()=>{});
    }

    typeWriter(displayMsg);
}

const MONOLOGUES = {
    1: "「1枚。指が、折り方を思い出していく。」",
    10: "「10枚。この孤独な作業が、今の私のすべてだ。」",
    13: "「……今、後ろで足音がしなかったか？」",
    20: "「20枚。かつてここには数えきれないほどの『声』があった。」",
    50: "「50枚。半分だ。世界のノイズが少し静かになった気がする。」",
    100: "「100枚。……千羽鶴が完成した。 CHAPTER 1 END」"
};

function generateRandomRuins() {
    const layout = [];
    for (let y = 0; y < 12; y++) {
        const row = [];
        for (let x = 0; x < 13; x++) {
            row.push(Math.random() < 0.2 ? 1 : 0);
        }
        layout.push(row);
    }
    // プレイヤーの初期地点を確保
    layout[5][6] = 0; layout[4][6] = 0; layout[6][6] = 0; layout[5][5] = 0; layout[5][7] = 0;
    return layout;
}

// ノイズの狭間専用：拾った時のランダムメッセージ集
const LABYRINTH_MESSAGES = [
    "ノイズの狭間に、震える1枚があった。",
    "誰かの「助けて」という文字が、折り紙の形を保っている。",
    "黄金の紙だ。これだけは、この世界の腐食を拒んでいる。",
    "「……みつ……けた……」 どこからか声がした気がした。",
    "0と1の隙間に、物理的な感触を持った紙が落ちている。",
    "これ以上拾ってはいけない。そんな気がしたが、手が動いた。",
    "かつての若者が綴った、愛の告白が書かれた折り紙だ。"
];

function enterInfiniteLabyrinth() {
    const map = MAPS["infinite_labyrinth"];
    map.layout = generateRandomRuins();
    
    if (Math.random() < 0.05) { // 確率を少し絞ってレア感をアップ
        map.events = [{ 
            id: 'shrine', x: 6, y: 6, char: '⛩️', 
            msg: ["「教祖様の祭壇」を見つけた。", "🐥「よく来たね」と声がした気がした。", "ここは、すべてのノイズが消える場所だ。"] 
        }];
    } else {
        const rx = Math.floor(Math.random() * 11) + 1;
        const ry = Math.floor(Math.random() * 10) + 1;
        // メッセージをランダムに抽選
        const randomMsg = LABYRINTH_MESSAGES[Math.floor(Math.random() * LABYRINTH_MESSAGES.length)];
        
        map.events = [{ 
            id: 'random_' + Date.now(), 
            x: rx, y: ry, 
            type: 'origami', 
            char: '✨', 
            msg: randomMsg 
        }];
    }
}

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    if (!screen) return;

    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    screen.innerHTML = ''; 

    // 1. イベント配置
    if (map.events) {
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
    }

    // 2. 瓦礫(壁)配置
    if (map.layout) {
        map.layout.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 1) {
                    const wall = document.createElement('div');
                    wall.className = 'cell';
                    wall.style.left = (x * 32) + 'px';
                    wall.style.top = (y * 32) + 'px';
                    wall.textContent = '🧱';
                    wall.style.opacity = "0.3";
                    screen.appendChild(wall);
                }
            });
        });
    }

    // 3. 小鳥(🐥)配置
    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.position = 'absolute';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    p.style.width = '32px';
    p.style.height = '32px';
    p.style.display = 'flex';
    p.style.justifyContent = 'center';
    p.style.alignItems = 'center';
    p.style.zIndex = "999";
    screen.appendChild(p);
}

function checkScare() {
    state.steps++;
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
            if(Math.random() < 0.3) {
                state.x = Math.floor(Math.random() * 10) + 1;
                state.y = Math.floor(Math.random() * 10) + 1;
                renderMap();
                typeWriter("「……逃げなきゃ。何かが、すぐ後ろにいる。」");
            }
        }, 1000);
    }
}

function handleInput(e) {
    if (state.isTyping) return;
    const bgm = document.getElementById('bgm-wind');
    if (bgm && bgm.paused) bgm.play().catch(()=>{});

    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    const mapWidth = 13; const mapHeight = 12;

    if (nextX >= mapWidth && map.exits.right) {
        moveArea(map.exits.right);
    } else if (nextX < 0 && map.exits.left) {
        moveArea(map.exits.left);
    } else if (nextY >= mapHeight && map.exits.down) {
        moveArea(map.exits.down);
    } else if (nextY < 0 && map.exits.up) {
        moveArea(map.exits.up);
    } else if (nextX >= 0 && nextX < mapWidth && nextY >= 0 && nextY < mapHeight) {
        if (map.layout && map.layout[nextY] && map.layout[nextY][nextX] === 0) {
            state.x = nextX;
            state.y = nextY;
            checkEvents(map);
            checkScare();
        }
    }
    renderMap();
}

function moveArea(exitData) {
    state.currentMap = exitData.map;
    if (state.currentMap === "infinite_labyrinth") enterInfiniteLabyrinth();
    state.x = exitData.x;
    state.y = exitData.y;
}

function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (ev && !state.history.includes(ev.id)) {
        if (ev.type === 'origami') {
            state.origamiCount++;
            const se = document.getElementById('se-pickup');
            if(se) se.play().catch(()=>{});
        }
        state.history.push(ev.id);
        let msg = ev.msg;
        if (MONOLOGUES[state.origamiCount]) msg += "\n\n" + MONOLOGUES[state.origamiCount];
        typeWriter(msg);
    }
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    if(!dialog) return;
    dialog.textContent = "";
    const isSpecial = state.origamiCount > 0 && state.origamiCount % 10 === 0;
    dialog.style.color = isSpecial ? "gold" : "white";
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

function handleGameEnd() {
    document.body.style.transition = "background-color 4s";
    document.body.style.backgroundColor = "white";
    setTimeout(() => { alert("CHAPTER 1 修復完了。"); }, 4000);
}

window.onload = () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
};
// checkEvents内に追加（メタ発言なし、純粋な怪奇現象）
function applyWeirdEffect(evId, count) {
    const screen = document.getElementById('game-screen');
    const p = document.getElementById('player');

    // 「逆回転時計」を調べすぎると時間が狂う
    if (evId === 'broken_clock' && count === 4) {
        screen.style.filter = "sepia(1) hue-rotate(180deg)"; // 画面が腐食したような色に
        setTimeout(() => { screen.style.filter = "none"; }, 3000);
    }

    // 「階段」を調べすぎると🐥が震え出す
    if (evId === 'infinite_stairs' && count === 3) {
        p.style.animation = "glitch-anim 0.1s infinite";
        setTimeout(() => { p.style.animation = "none"; }, 2000);
    }
}

// これを checkEvents(map) の最後の方で呼び出す
// applyWeirdEffect(ev.id, count);
