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
const MAPS = {
    "shibuya_station": {
        name: "渋谷駅前広場",
        exits: { right: "shibuya_backstreet", down: "shibuya_crossroad" }, // 簡易記述例
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { 
                id: 'npc_shadow', x: 3, y: 7, char: '👥', 
                msg: [
                    "影が立っている。スマホを覗き込んでいるようだ。",
                    "「……あ、電波入った？」\n彼は100年前の通信障害をまだ気にしている。",
                    "「再起動してもダメか……」\n彼のスマホは、ただの黒い石板にしか見えない。",
                    "彼はもう、こちらを見ていない。指だけが虚空をスワイプし続けている。"
                ]
            },
            {
                id: 'station_radio', x: 1, y: 3, char: '📻',
                msg: [
                    "古いラジオ。ノイズが混じっている。",
                    "……ｶﾞｶﾞ……本日……渋谷駅前は……静穏……ﾃﾞｽ……",
                    "……聞こえて……ますか……？……逃げ……て……",
                    "（ただの不快な高周波だけが流れている）"
                ],
                specialSe: 'se-glitch' // 3回目以降でノイズを鳴らす
            }
        ]
    },
    "shibuya_backstreet": {
        name: "渋谷裏路地",
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            {
                id: 'sns_ghost', x: 8, y: 2, char: '📱',
                msg: [
                    "[通知] 100年前の今日の思い出があります。",
                    "画面が割れているが、通知が見える。\n『@shibuya_love: 誰もいないんだけどｗｗｗ』",
                    "連投されている。\n『@shibuya_love: ねえ誰か返信して』",
                    "最後の投稿：\n『すごく……きれいな鳥が、こっちを見てる』"
                ]
            }
        ]
    }
};
