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

// 迷宮のランダムメッセージ
const LABYRINTH_MESSAGES = [
    "ノイズの狭間に、震える1枚があった。",
    "誰かの「助けて」という文字が、折り紙の形を保っている。",
    "黄金の紙だ。これだけは、この世界の腐食を拒んでいる。",
    "「……みつ……けた……」 どこからか声がした気がした。",
    "0と1の隙間に、物理的な感触を持った紙が落ちている。",
    "これ以上拾ってはいけない。そんな気がしたが、手が動いた。",
    "かつての若者が綴った、愛の告白が書かれた折り紙だ。"
];

// 2. イベント処理（ここが心臓部です）
function checkEvents(map) {
    const ev = map.events.find(ev => ev.x === state.x && ev.y === state.y);
    if (!ev) return;

    // 回数カウント
    if (!state.eventCounts[ev.id]) state.eventCounts[ev.id] = 0;
    state.eventCounts[ev.id]++;
    const count = state.eventCounts[ev.id];

    // ✨ 折り紙の処理
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
        }
        return;
    }

    // 一般メッセージの抽選
    let displayMsg = Array.isArray(ev.msg) ? 
        ev.msg[Math.min(count - 1, ev.msg.length - 1)] : ev.msg;

    // 特殊演出
    applyWeirdEffect(ev.id, count);

    typeWriter(displayMsg);
}

// 特殊演出
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
function renderMap() {
    const screen = document.getElementById('game-screen');
    screen.innerHTML = '';
    const mapData = MAPS[currentMap];
    
    // --- 【追加】折り紙のランダム復活ロジック ---
    // エリアに入った時、30%の確率で新しい折り紙がどこかに現れる
    if (Math.random() < 0.3) { 
        const randomX = Math.floor(Math.random() * 13);
        const randomY = Math.floor(Math.random() * 12);
        
        // すでにイベントがある場所には作らない
        const exists = mapData.events.find(e => e.x === randomX && e.y === randomY);
        if (!exists) {
            mapData.events.push({
                id: 'gen_' + Date.now(), // 重複しないID
                x: randomX,
                y: randomY,
                type: 'origami',
                char: '✨',
                msg: "ノイズの隙間に、新たな折り紙が結実していた。"
            });
        }
    }
    // ---------------------------------------

    // 以下、元々の描画処理 ...
    mapData.events.forEach(event => {
        const div = document.createElement('div');
        div.className = 'cell';
        div.style.left = (event.x * 32) + 'px';
        div.style.top = (event.y * 32) + 'px';
        div.textContent = event.char;
        screen.appendChild(div);
    });
    
    // 🐥を表示
    const playerDiv = document.createElement('div');
    playerDiv.id = 'player';
    playerDiv.textContent = '🐥';
    updatePlayerPosition(playerDiv);
    screen.appendChild(playerDiv);
    
    document.getElementById('map-name').textContent = mapData.name;
}

function moveArea(exitData) {
    if (typeof exitData === 'string') {
        state.currentMap = exitData;
        state.x = 6; state.y = 5;
    } else if (exitData && exitData.map) {
        state.currentMap = exitData.map;
        state.x = exitData.x ?? 6;
        state.y = exitData.y ?? 5;
    } else {
        state.currentMap = "shibuya_station";
        state.x = 6; state.y = 5;
    }

    if (state.currentMap === "infinite_labyrinth") enterInfiniteLabyrinth();
    renderMap();
}

// 4. 入力とシステム
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

function checkScare() {
    state.steps++;
    if (state.steps > 30 && Math.random() < 0.1 && !state.isGlitching) {
        state.isGlitching = true;
        const screen = document.getElementById('game-screen');
        const se = document.getElementById('se-glitch');
        if(screen) screen.classList.add('glitch-active');
        if(se) se.play().catch(()=>{});
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
