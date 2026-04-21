const state = {
    // ... 既存の項目 ...
    eventCounts: {}, // 何回調べたかを記録
};

function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (!ev) return;

    // 1. 調べた回数をカウント
    if (!state.eventCounts[ev.id]) state.eventCounts[ev.id] = 0;
    state.eventCounts[ev.id]++;
    const count = state.eventCounts[ev.id];

    // 2. ✨ 折り紙（1回きり）の処理
    if (ev.type === 'origami') {
        if (!state.history.includes(ev.id)) {
            state.origamiCount++;
            state.history.push(ev.id);
            const se = document.getElementById('se-pickup');
            if(se) se.play().catch(()=>{});
            
            // 独白を合成
            let msg = ev.msg;
            if (MONOLOGUES[state.origamiCount]) {
                msg += "\n\n" + MONOLOGUES[state.origamiCount];
            }
            typeWriter(msg);
        }
        return;
    }

    // 3. 一般イベント（NPCや看板など）のメッセージ抽選
    let displayMsg = "";
    if (Array.isArray(ev.msg)) {
        const index = Math.min(count - 1, ev.msg.length - 1);
        displayMsg = ev.msg[index];
    } else {
        displayMsg = ev.msg;
    }

    // 4. 特殊演出（時計や階段など）の呼び出し
    applyWeirdEffect(ev.id, count);

    // 5. メッセージ表示
    typeWriter(displayMsg);
}

  
const MONOLOGUES = {
    // 【Phase 1: 執着】
    1: "「1枚。指が、折り方を思い出していく。正しい儀式が必要だ。」",
    5: "「5枚。角と角を合わせる。ズレは許されない。世界がズレてしまうから。」",
    10: "「10枚。この孤独な作業が、今の私のすべてだ。誰も褒めてはくれない。」",
    15: "「15枚。……さっきから、誰かが私の背中を数えていないか？」",

    // 【Phase 2: 幻聴】
    20: "「20枚。かつてここには数えきれないほどの『声』があった。今は紙の擦れる音だけ。」",
    25: "「25枚。指先が少し赤い。紙で切ったのか、それとも最初から……？」",
    30: "「30枚。ノイズの中に音楽が聞こえる。100年前の、安っぽい流行歌だ。」",
    35: "「35枚。……ねえ、君も一緒に折る？ 振り返っても、誰もいないのに。」",

    // 【Phase 3: 腐食】
    40: "「40枚。もう指の感覚がない。代わりに、紙の方が私の指を覚えている。」",
    45: "「45枚。昨日折ったはずの鶴が、朝起きたら全部『黒い灰』になっていた。」",
    50: "「50枚。半分だ。世界のノイズが少し静かになった気がする。私の心臓も。」",
    55: "「55枚。……外から『帰して』と叩く音がする。でも、鍵なんて最初からない。」",

    // 【Phase 4: 忘却】
    60: "「60枚。私の名前は何だったか。思い出そうとすると、喉に紙が詰まる。」",
    70: "「70枚。街が溶けている。ビルが、アスファルトが、全部巨大な折り紙に見える。」",
    80: "「80枚。折らなきゃ。折らなきゃ。折らなきゃ。折らなきゃ。折らなきゃ。」",
    90: "「90枚。あと10枚。完成したら、私は『人間』に戻れるのだろうか？」",

    // 【Final Phase: 終焉】
    95: "「95枚。……ああ、そうか。私は最初から、紙の一部だったんだ。」",
    99: "「99枚。最後の一枚は、私の『心臓』で折ることにした。痛くはない。」",
    100: "「100枚。……千羽鶴が完成した。 CHAPTER 1 END（静かなノイズ）」"
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


// エリア移動の共通処理（安全装置付き）
function moveArea(exitData) {
    // もしexitDataが名前（文字列）だけだった場合のケア
    if (typeof exitData === 'string') {
        const targetMapName = exitData;
        state.currentMap = targetMapName;
        state.x = 6; // 安全な中央位置
        state.y = 5;
    } else if (exitData && exitData.map) {
        // 通常のオブジェクト形式の場合
        state.currentMap = exitData.map;
        state.x = (exitData.x !== undefined) ? exitData.x : 6;
        state.y = (exitData.y !== undefined) ? exitData.y : 5;
    } else {
        // 万が一データが壊れていたら渋谷駅前に強制送還
        console.error("エリアデータが壊れています。渋谷に送還します。");
        state.currentMap = "shibuya_station";
        state.x = 6;
        state.y = 5;
    }

    // 迷宮生成のトリガー
    if (state.currentMap === "infinite_labyrinth") {
        enterInfiniteLabyrinth();
    }

    // 移動先の壁判定（埋まり防止）
    const map = MAPS[state.currentMap];
    if (map && map.layout && map.layout[state.y] && map.layout[state.y][state.x] === 1) {
        state.x = 6; 
        state.y = 5;
    }

    renderMap();
}

// renderMapをさらに強化（絶対に🐥を出す！）
function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    if (!screen) return;

    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    screen.innerHTML = ''; 

    // 1. イベント（✨など）
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

    // 2. 瓦礫（🧱）
    if (map.layout) {
        map.layout.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 1) {
                    const wall = document.createElement('div');
                    wall.className = 'cell';
                    wall.style.left = (x * 32) + 'px';
                    wall.style.top = (y * 32) + 'px';
                    wall.textContent = '🧱';
                    wall.style.opacity = "0.2";
                    screen.appendChild(wall);
                }
            });
        });
    }

    // 3. 🐥（教祖様）を最前面に召喚
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
    p.style.zIndex = "9999"; // 絶対に一番上！
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
