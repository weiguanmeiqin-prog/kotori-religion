const MAPS = {
    "shibuya_station": {
        name: "渋谷駅前広場",
        exits: { 
            right: { map: "shibuya_backstreet", x: 0, y: 5 },
            down: { map: "shibuya_crossroad", x: 6, y: 0 },
            up: { map: "shibuya_109", x: 6, y: 11 } // 109へ
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'npc_shadow', x: 3, y: 7, char: '👥', msg: ["影が立っている。スマホを覗き込んでいるようだ。", "「……あ、電波入った？」"] },
            { id: 'station_radio', x: 1, y: 3, char: '📻', msg: ["古いラジオ。ノイズが混じっている。"] },
            { id: 'o1', x: 10, y: 3, type: 'origami', char: '✨', msg: "看板の裏に、黄金の紙を見つけた。" }
        ]
    },
    "shibuya_109": {
        name: "崩落の109内部",
        exits: { down: { map: "shibuya_station", x: 6, y: 1 } },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'o109', x: 6, y: 5, type: 'origami', char: '✨', msg: "エスカレーターの残骸の上に、誰かが残した1枚。" },
            { id: 'mirror', x: 2, y: 2, char: '🪞', msg: ["鏡の破片。映っているのは、🐥ではなく……？", "……見なかったことにしよう。"] }
        ]
    },
    "shibuya_crossroad": {
        name: "スクランブル交差点",
        exits: { 
            up: { map: "shibuya_station", x: 6, y: 11 },
            left: { map: "shinjuku_entrance", x: 12, y: 5 } // 新宿方面へ
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [{ id: 'o2', x: 5, y: 6, type: 'origami', char: '✨', msg: "アスファルトの隙間に、一筋の光。" }]
    },
    "shinjuku_entrance": {
        name: "新宿への境界線",
        exits: { 
            right: { map: "shibuya_crossroad", x: 0, y: 5 },
            left: { map: "infinite_labyrinth", x: 6, y: 5 } // 迷宮へ吸い込まれる
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [
            { id: 'warning', x: 4, y: 4, char: '⚠️', msg: "「ここから先、世界の整合性は失われている」と書かれている。" }
        ]
    },
    "shibuya_backstreet": {
        name: "渋谷裏路地",
        exits: { 
            left: { map: "shibuya_station", x: 12, y: 5 },
            right: { map: "ikebukuro_line", x: 0, y: 5 } // 池袋方面へ
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [{ id: 'sns_phone', x: 8, y: 2, char: '📱', msg: ["通知が見える……。"] }]
    },
    "ikebukuro_line": {
        name: "廃線：池袋行き",
        exits: { 
            left: { map: "shibuya_backstreet", x: 12, y: 5 },
            down: { map: "infinite_labyrinth", x: 6, y: 5 } // ここも迷宮へ
        },
        layout: Array(12).fill(null).map(() => Array(13).fill(0)),
        events: [{ id: 'train', x: 3, y: 8, char: '🚃', msg: ["扉は開かない。中に誰もいないことだけが救いだ。"] }]
    },
    "infinite_labyrinth": {
        name: "ノイズの狭間（無限廃墟）",
        layout: [],
        exits: { up: { map: "shibuya_station", x: 6, y: 11 } },
        events: []
    }
};
// MAPSオブジェクトの中に、この「shinjuku_golden_gai」を追加してください
"shinjuku_golden_gai": {
    name: "新宿ゴールデン街（跡）",
    exits: { 
        right: { map: "shinjuku_entrance", x: 0, y: 5 },
        left: { map: "infinite_labyrinth", x: 12, y: 5 } 
    },
    layout: Array(12).fill(null).map(() => Array(13).fill(0)),
    events: [
        {
            id: 'broken_clock', x: 2, y: 2, char: '🕒',
            msg: [
                "時計の針が、ものものしい速さで逆回転している。",
                "よく見ると、針ではなく『細長い指』が回っているようだ。",
                "耳を澄ますと、時計の中から『おやすみなさい』とささやきが聞こえる。",
                "（針が止まった。今は、存在しないはずの13時62分を指している）"
            ]
        },
        {
            id: 'ghost_party', x: 9, y: 9, char: '🥂',
            msg: [
                "誰もいないテーブルに、注ぎたてのワインが置かれている。",
                "グラスの中で、気泡が『助けて』という形になって消えた。",
                "「乾杯」……背後で、重なり合う大勢の乾杯の声がした。",
                "（ふりかえると、ワイングラスは砂に変わっていた）"
            ]
        },
        {
            id: 'infinite_stairs', x: 1, y: 1, char: '🪜',
            msg: [
                "上へと続く階段。しかし、見上げても天井に吸い込まれている。",
                "一段登るごとに、自分の足音が『笑い声』に変わっていく。",
                "「どこへ行くの？」と階段が喋った。",
                "（これ以上登ると、🐥であることを忘れてしまいそうだ）"
            ]
        },
        {
            id: 'mystery_flower', x: 10, y: 10, char: '🌷',
            msg: [
                "アスファルトに咲く、青い花。良い香りがする。",
                "花の蜜を吸おうとしたが、逆に指先を甘く噛まれた気がした。",
                "花が震えながら、かつての流行歌をハミングしている。",
                "（花びらが散った。そこには、小さな人間の歯が落ちていた）"
            ]
        }
    ]
},
"akihabara_graveyard": {
    name: "秋葉原：電脳の墓場",
    exits: { left: { map: "shibuya_station", x: 12, y: 5 } }, // 渋谷へ戻る
    layout: Array(12).fill(null).map(() => Array(13).fill(0)),
    events: [
        {
            id: 'broken_android', x: 5, y: 3, char: '🤖',
            msg: [
                "メイド服を着たロボットが倒れている。内部の配線が剥き出しだ。",
                "調べると、スピーカーから『オカエリナサイ……』とノイズが漏れた。",
                "彼女の手が、ガタガタと震えながら🐥の羽を掴もうとした。",
                "（彼女の瞳の奥に、誰かのログインパスワードが映し出されている）"
            ]
        },
        {
            id: 'monitor_wall', x: 10, y: 8, char: '🖥️',
            msg: [
                "積み上げられた古いモニターの山。すべて真っ暗だ。",
                "一瞬、すべての画面に『あなたの顔』が映った気がした。",
                "画面の中から、キーボードを叩く音だけが聞こえてくる。",
                "（……一箇所だけ、ドット抜けで『サヨナラ』と表示されている）"
            ]
        }
    ]
},
"ikebukuro_resume_street": {
    name: "池袋：履歴書の降る街",
    exits: { up: { map: "shibuya_backstreet", x: 6, y: 11 } },
    layout: Array(12).fill(null).map(() => Array(13).fill(0)),
    events: [
        {
            id: 'falling_paper', x: 3, y: 4, char: '📄',
            msg: [
                "空から紙が降ってきた。……誰かの履歴書だ。写真は剥がされている。",
                "別の紙を拾った。特技の欄に『呼吸を止めること』と書かれている。",
                "さらに別の紙には、血の跡で大きく『不採用』とだけ書かれていた。",
                "（見上げると、ビルの屋上から膨大な量の紙が雪のように溢れ出している）"
            ]
        },
        {
            id: 'owl_statue', x: 6, y: 10, char: '🦉',
            msg: [
                "池袋の象徴、フクロウの像だ。なぜか首が180度回っている。",
                "像の足元には、本物のフクロウの羽が山積みにされている。",
                "「ホー、ホー」と鳴いた。……像の口から、生々しい呼吸音がする。",
                "（あなたが目を離すたびに、像の位置が1マスずつ近づいている気がする）"
            ]
        }
    ]
}
