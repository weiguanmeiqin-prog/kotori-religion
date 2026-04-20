const MAPS = {
    "shibuya_station": {
        name: "渋谷駅前広場",
        exits: { 
            right: { map: "shibuya_backstreet", x: 0, y: 5 },
            down: { map: "shibuya_crossroad", x: 6, y: 0 }
        },
        events: [
            { id: 'st1', x: 2, y: 2, char: '🗑️', msg: "ゴミ箱。底には古びた折り紙が捨てられている。" },
            { id: 'o1', x: 10, y: 3, type: 'origami', char: '✨', msg: "看板の裏に、黄金の紙を見つけた。" }
        ]
    },
    "shibuya_crossroad": {
        name: "スクランブル交差点",
        exits: { up: { map: "shibuya_station", x: 6, y: 11 } },
        events: [
            { id: 'o2', x: 5, y: 6, type: 'origami', char: '✨', msg: "アスファルトの隙間に、一筋の光。" }
        ]
    },
    "shibuya_backstreet": {
        name: "渋谷裏路地",
        exits: { left: { map: "shibuya_station", x: 12, y: 5 } },
        events: [
            { id: 'o3', x: 8, y: 4, type: 'origami', char: '✨', msg: "誰かの祈りが、ここに取り残されている。" }
        ]
    }
    // ※エリアは同様の形式で増やせます！
};
