const MAPS = {
    "shibuya_station": {
        name: "渋谷駅前広場",
        // 全方位に無限廃墟への入り口を配置するのもアリ！
        exits: { 
            right: { map: "shibuya_backstreet", x: 0, y: 5 },
            down: { map: "shibuya_crossroad", x: 6, y: 0 },
            left: { map: "infinite_labyrinth", x: 12, y: 5 }, // 左に行くと迷宮
            up: { map: "infinite_labyrinth", x: 6, y: 11 }    // 上に行くと迷宮
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)), // 初期マップは更地
        events: [
            { id: 'st1', x: 2, y: 2, char: '🗑️', msg: "ゴミ箱。底には古びた折り紙が捨てられている。" },
            { id: 'o1', x: 10, y: 3, type: 'origami', char: '✨', msg: "看板の裏に、黄金の紙を見つけた。" }
        ]
    },
    "shibuya_crossroad": {
        name: "スクランブル交差点",
        exits: { 
            up: { map: "shibuya_station", x: 6, y: 11 },
            down: { map: "shibuya_station_hall", x: 6, y: 0 } 
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'o2', x: 5, y: 6, type: 'origami', char: '✨', msg: "アスファルトの隙間に、一筋の光。" }
        ]
    },
    "shibuya_backstreet": {
        name: "渋谷裏路地",
        exits: { left: { map: "shibuya_station", x: 12, y: 5 } },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'o3', x: 8, y: 4, type: 'origami', char: '✨', msg: "誰かの祈りが、ここに取り残されている。" }
        ]
    },
    "shibuya_station_hall": {
        name: "駅構内ホール",
        exits: { 
            up: { map: "shibuya_crossroad", x: 6, y: 11 },
            down: { map: "infinite_labyrinth", x: 6, y: 0 } // 地下深くは迷宮へ
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'o4', x: 6, y: 6, type: 'origami', char: '✨', msg: "改札の横。静かに光る紙の翼。" }
        ]
    },
    "infinite_labyrinth": {
        name: "ノイズの狭間（無限廃墟）",
        layout: [], // script.js の generateRandomRuins() で生成
        exits: { 
            // 迷宮の四方どこから出ても「駅前広場」のどこかに戻される設定（脱出感！）
            up: { map: "shibuya_station", x: 6, y: 11 },
            down: { map: "shibuya_station", x: 6, y: 0 },
            left: { map: "shibuya_station", x: 12, y: 5 },
            right: { map: "shibuya_station", x: 0, y: 5 }
        },
        events: []
    }
};
