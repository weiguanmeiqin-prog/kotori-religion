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
    20: "「20枚。……誰かが後ろを歩いている気がした。でも、振り返れば空虚な街だけ。」",
    50: "「50枚。半分まで来た。世界の輪郭が、少しずつ鮮明になっていく。」",
    100: "「100枚。……千羽鶴への最初の1ページが書き終わった。CHAPTER 1 END.」"
};

function renderMap() {
    const map = MAPS[state.currentMap];
    const screen = document.getElementById('game-screen');
    if (!screen) return;

    // 画面の基本色を強制的に「廃墟の色」に戻す（ホワイトアウト防止）
    screen.style.backgroundColor = "#1a1a1a";
    document.getElementById('map-name').textContent = map.name;
    document.getElementById('count-display').textContent = `ORIGAMI: ${state.origamiCount}/100`;
    
    screen.innerHTML = ''; 

    // イベントオブジェクトを配置
    map.events.forEach(ev => {
        if (!state.history.includes(ev.id)) {
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.width = '32px';
            div.style.height = '32px';
            div.style.left = (ev.x * 32) + 'px';
            div.style.top = (ev.y * 32) + 'px';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignSelf = 'center';
            div.textContent = ev.char;
            screen.appendChild(div);
        }
    });

    // プレイヤー配置
    const p = document.createElement('div');
    p.id = 'player';
    p.textContent = '🐥';
    p.style.position = 'absolute';
    p.style.width = '32px';
    p.style.height = '32px';
    p.style.left = (state.x * 32) + 'px';
    p.style.top = (state.y * 32) + 'px';
    p.style.display = 'flex';
    p.style.justifyContent = 'center';
    p.style.alignItems = 'center';
    screen.appendChild(p);
}

function typeWriter(text) {
    state.isTyping = true;
    const dialog = document.getElementById('dialogue-text');
    dialog.textContent = "";
    
    // 金色にするのは「10枚ごと」かつ「0枚じゃない」ときだけ！
    const isSpecial = state.origamiCount > 0 && state.origamiCount % 10 === 0;
    dialog.style.color = isSpecial ? "gold" : "white";
    
    let i = 0;
    const timer = setInterval(() => {
        dialog.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            state.isTyping = false;
            // 100枚達成時のみ、ホワイトアウトさせる
            if (state.origamiCount >= 100) {
                setTimeout(handleGameEnd, 1000);
            }
        }
    }, 30);
}

function handleInput(e) {
    if (state.isTyping) return;
    let nextX = state.x; let nextY = state.y;
    const map = MAPS[state.currentMap];

    if (e.key === "ArrowUp") nextY--;
    if (e.key === "ArrowDown") nextY++;
    if (e.key === "ArrowLeft") nextX--;
    if (e.key === "ArrowRight") nextX++;

    const mapWidth = 13; // 固定幅
    const mapHeight = 12; // 固定高

    if (nextX >= mapWidth && map.exits.right) {
        const ex = map.exits.right; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextX < 0 && map.exits.left) {
        const ex = map.exits.left; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY >= mapHeight && map.exits.down) {
        const ex = map.exits.down; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else if (nextY < 0 && map.exits.up) {
        const ex = map.exits.up; state.currentMap = ex.map; state.x = ex.x; state.y = ex.y;
    } else {
        // 壁（1）の概念を無視してどこでも歩ける
        state.x = nextX; state.y = nextY;
        
        // 幻影演出（低確率）
        if (Math.random() < 0.02) {
            const scr = document.getElementById('game-screen');
            scr.style.backgroundColor = "#443322"; 
            setTimeout(() => { scr.style.backgroundColor = "#1a1a1a"; }, 100);
        }

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
    document.body.style.transition = "background-color 4s";
    document.body.style.backgroundColor = "white";
    alert("CHAPTER 1 修復完了。\n教祖様、光の向こう側でお待ちしています。");
}

document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    window.addEventListener('keydown', handleInput);
});
