const MAPS = {
    "shibuya_station": {
        name: "渋谷駅前広場",
        layout: Array(12).fill(Array(13).fill(0)), // 壁なしの更地
        exits: { 
            up: { map: "miyashita_park", x: 6, y: 10 },
            right: { map: "shibuya_backstreet", x: 0, y: 4 },
            down: { map: "shibuya_crossroad", x: 6, y: 0 }
        },
        events: [
            { id: 'st1', x: 2, y: 2, char: '🗑️', msg: "ゴミ箱。底に沈んだ黄色い紙は、かつて誰かが捨てた『絶望』の形だ。" },
            { id: 'o1', x: 10, y: 1, type: 'origami', char: '✨', msg: "駅看板の裏。祈るように折られた1枚を見つけた。" },
            { id: 'st2', x: 3, y: 5, char: '🐕', msg: "ハチ公像。彼はもう、誰も待っていない。ただ、風が吹くのを待っている。" }
        ]
    },
    "shibuya_crossroad": {
        name: "スクランブル交差点",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { 
            up: { map: "shibuya_station", x: 6, y: 5 },
            left: { map: "center_gai", x: 11, y: 5 },
            right: { map: "department_store", x: 1, y: 5 },
            down: { map: "shibuya_station_hall", x: 6, y: 1 }
        },
        events: [
            { id: 'o2', x: 1, y: 1, type: 'origami', char: '✨', msg: "大型ビジョンの死角に、黄金の光が挟まっていた。" },
            { id: 'n1', x: 6, y: 6, char: '📺', msg: "砂嵐のモニター。かつてここには、嘘と本当が混ざり合って流れていた。" }
        ]
    },
    "center_gai": {
        name: "センター街 - 寂寥",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { right: { map: "shibuya_crossroad", x: 1, y: 5 } },
        events: [
            { id: 'o3', x: 5, y: 10, type: 'origami', char: '✨', msg: "潰れたショップの入り口。シャッターの隙間に1枚。" },
            { id: 'n2', x: 2, y: 3, char: '🍔', msg: "古いメニュー表。『本日、全人類無料』と殴り書きされている。" }
        ]
    },
    "department_store": {
        name: "封鎖された百貨店",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { left: { map: "shibuya_crossroad", x: 11, y: 5 } },
        events: [
            { id: 'bonus1', x: 10, y: 10, type: 'origami_bonus', char: '🎁', msg: "忘れ物センターの箱。3枚の折り紙が、静かに眠っていた。" },
            { id: 'n3', x: 6, y: 2, char: '👗', msg: "マネキン。その指先は、遠い空を指差している。" }
        ]
    },
    "shibuya_backstreet": {
        name: "渋谷裏路地",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { 
            left: { map: "shibuya_station", x: 11, y: 4 },
            right: { map: "ghost_building", x: 1, y: 5 }
        },
        events: [
            { id: 'o4', x: 8, y: 8, type: 'origami', char: '✨', msg: "配電盤の中。火花が散る隣で、紙は耐えていた。" },
            { id: 'n4', x: 4, y: 1, char: '📱', msg: "スマホ。画面が割れている。'最後の着信：教祖様'" }
        ]
    },
    "ghost_building": {
        name: "幽霊ビル",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { left: { map: "shibuya_backstreet", x: 11, y: 3 } },
        events: [
            { id: 'o5', x: 6, y: 6, type: 'origami', char: '✨', msg: "エレベーターの底。奈落の縁で見つけた1枚。" }
        ]
    },
    "miyashita_park": {
        name: "宮下公園跡",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { down: { map: "shibuya_station", x: 6, y: 1 } },
        events: [
            { id: 'o6', x: 1, y: 1, type: 'origami', char: '✨', msg: "ベンチの上。誰かが忘れていった、最後の祈りだ。" },
            { id: 'n5', x: 10, y: 2, char: '⛲', msg: "枯れた噴水。水底に沈んでいるのは、大量の『後悔』だ。" }
        ]
    },
    "shibuya_station_hall": {
        name: "駅構内 - 終着点",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { 
            up: { map: "shibuya_crossroad", x: 6, y: 5 },
            down: { map: "shibuya_underground", x: 6, y: 1 }
        },
        events: [
            { id: 'o7', x: 6, y: 8, type: 'origami', char: '✨', msg: "自動券売機。行き先はすべて『無』になっている。" }
        ]
    },
    "shibuya_underground": {
        name: "渋谷地下迷宮",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { 
            up: { map: "shibuya_station_hall", x: 6, y: 4 },
            down: { map: "shibuya_sanctuary", x: 6, y: 1 }
        },
        events: [
            { id: 'o8', x: 11, y: 10, type: 'origami', char: '✨', msg: "湿った壁の隙間。暗闇の中でこれだけが光っていた。" }
        ]
    },
    "shibuya_sanctuary": {
        name: "最下層・聖域",
        layout: Array(12).fill(Array(13).fill(0)),
        exits: { up: { map: "shibuya_underground", x: 6, y: 10 } },
        events: [
            { id: 'bonus2', x: 6, y: 6, type: 'origami_bonus', char: '🕊️', msg: "聖域の祭壇。5枚の折り紙が、千羽鶴の誕生を待っている。" },
            { id: 'guide', x: 6, y: 3, char: '🐤', msg: "「教祖様。CHAPTER 1はまもなく終わります。世界の修復を信じて。」" }
        ]
    }
};
