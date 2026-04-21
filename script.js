// --- 状態管理 ---
const state = {
    x: 6,
    y: 5,
    currentMap: "shibuya_station",
    origamiCount: 0,
    isTyping: false,
    history: [],
    steps: 0,
    isGlitching: false,
    eventCounts: {}, 
};

// 1. 【こだわり】折り紙の枚数に応じた独白
const MONOLOGUES = {
    1: "「1枚。指が、折り方を思い出していく。正しい儀式が必要だ。」",
    5: "「5枚。角と角を合わせる。ズレは許されない。世界がズレてしまうから。」",
    10: "「10枚。この孤独な作業が、今の私のすべてだ。誰も褒めてはくれない。」",
    15: "「15枚。……さっきから、誰かが私の背中を数えていないか？」",
    20: "「20枚。かつてここには数えきれないほどの『声』があった。今は紙の擦れる音だけ。」",
    25: "「25枚。指先が少し赤い。紙で切ったのか、それとも最初から……？」",
    30: "「30枚。ノイズの中に音楽が聞こえる。100年前の、安っぽい流行歌だ。」",
    35: "「35枚。……ねえ、君も一緒に折る？ 振り返っても、誰もいないのに。」",
    40: "「40枚。もう指の感覚がない。代わりに、紙の方が私の指を覚えている。」",
    45: "「45枚。昨日折ったはずの鶴が、朝起きたら全部『黒い灰』になっていた。」",
    50: "「50枚。半分だ。世界のノイズが少し静かになった気がする。私の心臓も。」",
    55: "「55枚。……外から『帰して』と叩く音がする。でも、鍵なんて最初からない。」",
    60: "「60枚。私の名前は何だったか。思い出そうとすると、喉に紙が詰まる。」",
    70: "「70枚。街が溶けている。ビルが、アスファルトが、全部巨大な折り紙に見える。」",
    80: "「80枚。折らなきゃ。折らなきゃ。折らなきゃ。折らなきゃ。折らなきゃ。」",
    90: "「90枚。あと10枚。完成したら、私は『人間』に戻れるのだろうか？」",
    95: "「95枚。……ああ、そうか。私は最初から、紙の一部だったんだ。」",
    99: "「99枚。最後の一枚は、私の『心臓』で折ることにした。痛くはない。」",
    100: "「100枚。……千羽鶴が完成した。 CHAPTER 1 END（静かなノイズ）」"
};

// --- 2. イベント処理（心臓部） ---
function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (!ev) return;

    if (!state.eventCounts[ev.id]) state.eventCounts[ev.id] = 0;
    state.eventCounts[ev.id]++;
    const count = state.eventCounts[ev.id];

    if (ev.type === 'origami') {
        if (!state.history.includes(ev.id)) {
            state.origamiCount++;
            state.history.push(ev.id);
            const se = document.getElementById('se-pickup');
            if(se) se.play().catch(()=>{});
            
            let msg = ev.msg;
            if (MONOLOGUES[state.origamiCount]) {
                msg += "\n\n" + MONOLOGUES[state.origamiCount];
            }
            typeWriter(msg);
            
            // 折り紙の枚数表示を更新
            const countEl = document.getElementById('origami-count');
            if (countEl) countEl.textContent = state.origamiCount;
        }
        return;
    }

    let displayMsg = Array.isArray(ev.msg) ? 
        ev.msg[Math.min(count - 1, ev.msg.length - 1)] : ev.msg;

    applyWeirdEffect(ev.id, count);
    typeWriter(displayMsg);
}

function applyWeirdEffect(evId, count) {
    const screen = document.getElementById('game-screen');
    const p = document.getElementById('player');
    if (!screen || !p) return;

    if (evId === 'broken_clock' && count === 4) {
        screen.style.filter = "sepia(1) hue-rotate(180deg)";
        setTimeout(() => screen.style.filter = "none", 3000);
    }
    if (evId === 'infinite_stairs' && count === 3) {
        p.style.animation = "glitch-anim 0.1s infinite";
        setTimeout(() => p.style.animation = "none", 2000);
    }
}

// --- 3. 描画処理 ---
function renderMap() {
    const screen = document.getElementById('game-screen');
    if (!screen) return;
    screen.innerHTML = '';
    
    const mapData = MAPS[state.currentMap];
    if (!mapData) return;
    
    // 【復活ロジック】エリア侵入時にランダム生成
    if (Math.random() < 0.5) { 
        const randomX = Math.floor(Math.random() * 13);
        const randomY = Math.floor(Math.random() * 12);
        const exists = mapData.events.find(e => e.x === randomX && e.y === randomY);
        if (!exists) {
            mapData.events.push({
                id: 'gen_' + Date.now(),
                x: randomX, y: randomY,
                type: 'origami', char: '✨',
                msg: "ノイズの隙間に、新たな折り紙が結実していた。"
            });
        }
    }

    mapData.events.forEach(event => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.style.left = (event.x * 32) + 'px';
        div.style.top = (event.y * 32) + 'px';
        div.textContent = event.char;
        screen.appendChild(div);
    });
    
    const playerDiv = document.createElement('div');
    playerDiv.id = 'player';
    playerDiv.style.left = (state.x * 32) + 'px';
    playerDiv.style.top = (state.y * 32) + 'px';
    playerDiv.textContent = '🐥';
    screen.appendChild(playerDiv);
    
    const nameEl = document.getElementById('map-name');
    if (nameEl) nameEl.textContent = mapData.name;
}

// --- 4. 移動処理（ここを修正しました） ---
function moveArea(exitData) {
    if (!exitData || !exitData.map) return;

    // 行き先のマップがなければ生成
    if (!MAPS[exitData.map]) {
        generateInfiniteMap(exitData.map);
    }

    state.currentMap = exitData.map;
    state.x = exitData.x ?? 6;
    state.y = exitData.y ?? 5;

    renderMap();
}

function handleInput(e) {
    if (state.isTyping) return;
    const map = MAPS[state.currentMap];
    if (!map) return;

    let nextX = state.x;
    let nextY = state.y;

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    if (nextX >= 13) { moveArea(map.exits?.right); return; }
    if (nextX < 0) { moveArea(map.exits?.left); return; }
    if (nextY >= 12) { moveArea(map.exits?.down); return; }
    if (nextY < 0) { moveArea(map.exits?.up); return; }

    if (map.layout && map.layout[nextY] && map.layout[nextY][nextX] === 0) {
        state.x = nextX;
        state.y = nextY;
        checkEvents(map);
        checkScare();
    }
    renderMap();
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    if(!dialog) return;
    dialog.textContent = "";
    
    // こだわりの特別な色演出
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

// --- 【魂を刻んだ無限生成エンジン】 ---
function generateInfiniteMap(mapId) {
    if (MAPS[mapId]) return;

    const prefixes = ["廃墟の", "誰もいない", "記憶の", "電子の", "虚無の", "歪んだ", "灰色の", "沈黙する"];
    const suffixes = ["路地裏", "観測点", "信号機", "ビル群", "境界線", "掃き溜め", "公園跡", "地下道"];
    const randomName = prefixes[Math.floor(Math.random() * prefixes.length)] + 
                       suffixes[Math.floor(Math.random() * suffixes.length)];

    const soulFragments = [
        "「空が、あんなに低かったっけ……？」",
        "「誰のログインパスワードも、もう意味をなさない」",
        "「🐥の羽が、一枚、アスファルトに溶けていった」",
        "「整合性は死んだ。ノイズだけが正しい」",
        "「昨日会った影は、今日はもう砂になっていた」",
        "「13時62分。終わらないティータイムの始まり」",
        "「履歴書を燃やして、その灰で折り紙を折ろう」",
        "「君が🐥なら、僕はただのバグでいい」",
        "「このノイズの向こう側に、誰かいるの？」"
    ];

    MAPS[mapId] = {
        name: randomName,
        exits: {
            up:    { map: mapId + "_u", x: 6, y: 11 },
            down:  { map: mapId + "_d", x: 6, y: 0 },
            left:  { map: mapId + "_l", x: 12, y: 5 },
            right: { map: mapId + "_r", x: 0, y: 5 }
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: []
    };

    if (Math.random() < 0.4) {
        MAPS[mapId].events.push({
            id: 'fragment_' + Date.now(),
            x: Math.floor(Math.random() * 13), y: Math.floor(Math.random() * 12),
            char: Math.random() > 0.5 ? '👤' : '💾', 
            msg: [soulFragments[Math.floor(Math.random() * soulFragments.length)]]
        });
    }

    if (Math.random() < 0.5) {
        MAPS[mapId].events.push({
            id: 'gen_origami_' + Date.now(),
            x: Math.floor(Math.random() * 13), y: Math.floor(Math.random() * 12),
            type: 'origami', char: '✨',
            msg: "世界のノイズの中から、祈りの結晶を拾い上げた。"
        });
    }
}

function checkScare() {
    state.steps++;
    if (state.steps > 30 && Math.random() < 0.1 && !state.isGlitching) {
        state.isGlitching = true;
        const screen = document.getElementById('game-screen');
        if(screen) screen.classList.add('glitch-active');
        
        setTimeout(() => {
            if(screen) screen.classList.remove('glitch-active');
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

function handleGameEnd() {
    document.body.style.transition = "background-color 4s";
    document.body.style.backgroundColor = "white";
    setTimeout(() => { alert("CHAPTER 1 修復完了。"); }, 4000);
}

window.onload = () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
};
