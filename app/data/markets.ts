export const markets = [
  {
    name: "胜平负",
    options: [
      { name: "主胜", odds: 2 },
      { name: "平", odds: 4 },
      { name: "主负", odds: 6 },
    ],
  },

  {
    name: "波胆",
    options: [
      { name: "1:0", odds: 7 },
      { name: "2:0", odds: 8 },
      { name: "2:1", odds: 8 },
      { name: "3:0", odds: 12 },
      { name: "3:1", odds: 14 },
      { name: "3:2", odds: 26 },
      { name: "4:0", odds: 28 },
      { name: "4:1", odds: 34 },
      { name: "4:2", odds: 51 },
      { name: "5:0", odds: 67 },
      { name: "5:1", odds: 81 },
      { name: "5:2", odds: 101 },
      { name: "胜其它", odds: 35 },

      { name: "0:0", odds: 10 },
      { name: "1:1", odds: 7 },
      { name: "2:2", odds: 15 },
      { name: "3:3", odds: 46 },
      { name: "平其它", odds: 80 },

      { name: "0:1", odds: 11 },
      { name: "0:2", odds: 23 },
      { name: "1:2", odds: 13 },
      { name: "0:3", odds: 61 },
      { name: "1:3", odds: 41 },
      { name: "2:3", odds: 51 },
      { name: "0:4", odds: 151 },
      { name: "1:4", odds: 101 },
      { name: "2:4", odds: 126 },
      { name: "0:5", odds: 301 },
      { name: "1:5", odds: 251 },
      { name: "2:5", odds: 251 },
      { name: "负其它", odds: 45 },
    ],
  },

  {
    name: "总进球数",
    options: [
      { name: "0球", odds: 10 },
      { name: "1球", odds: 5 },
      { name: "2球", odds: 4 },
      { name: "3球", odds: 4 },
      { name: "4球", odds: 6 },
      { name: "5球", odds: 9 },
      { name: "6球", odds: 18 },
      { name: "7+球", odds: 32 },
    ],
  },

  {
    name: "双方进球",
    options: [
      { name: "是", odds: 2 },
      { name: "否", odds: 2 },
    ],
  },

  {
    name: "半场胜平负",
    options: [
      { name: "半场主胜", odds: 3 },
      { name: "半场平", odds: 3 },
      { name: "半场主负", odds: 6 },
    ],
  },

  {
    name: "半全场",
    options: [
      { name: "胜胜", odds: 3 },
      { name: "胜平", odds: 16 },
      { name: "胜负", odds: 45 },
      { name: "平胜", odds: 5 },
      { name: "平平", odds: 7 },
      { name: "平负", odds: 16 },
      { name: "负胜", odds: 51 },
      { name: "负平", odds: 23 },
      { name: "负负", odds: 14 },
    ],
  },

  {
    name: "上半场比分",
    options: [
      { name: "0:0", odds: 3 },
      { name: "1:0", odds: 4 },
      { name: "0:1", odds: 6 },
      { name: "1:1", odds: 7 },
      { name: "2:0", odds: 9 },
      { name: "0:2", odds: 18 },
      { name: "2:1", odds: 21 },
      { name: "1:2", odds: 26 },
      { name: "其它", odds: 30 },
    ],
  },

  {
    name: "大小球",
    options: [
      { name: "大 1.5", odds: 2 },
      { name: "小 1.5", odds: 3 },
      { name: "大 2.5", odds: 2 },
      { name: "小 2.5", odds: 2 },
      { name: "大 3.5", odds: 3 },
      { name: "小 3.5", odds: 2 },
    ],
  },

  {
    name: "奇偶球",
    options: [
      { name: "单", odds: 2 },
      { name: "双", odds: 2 },
    ],
  },

  {
    name: "冠军竞猜",
    options: [
      { name: "巴西冠军", odds: 6 },
      { name: "法国冠军", odds: 7 },
      { name: "阿根廷冠军", odds: 8 },
      { name: "英格兰冠军", odds: 9 },
      { name: "西班牙冠军", odds: 9 },
      { name: "葡萄牙冠军", odds: 12 },
      { name: "德国冠军", odds: 13 },
      { name: "荷兰冠军", odds: 16 },
      { name: "意大利冠军", odds: 19 },
      { name: "其它球队冠军", odds: 21 },
    ],
  },

  {
    name: "小组出线竞猜",
    options: [
      { name: "法国出线", odds: 2 },
      { name: "塞内加尔出线", odds: 3 },
      { name: "阿根廷出线", odds: 2 },
      { name: "葡萄牙出线", odds: 2 },
      { name: "英格兰出线", odds: 2 },
      { name: "巴西出线", odds: 2 },
      { name: "德国出线", odds: 2 },
      { name: "西班牙出线", odds: 2 },
      { name: "日本出线", odds: 4 },
      { name: "韩国出线", odds: 5 },
    ],
  },

  {
    name: "金靴竞猜",
    options: [
      { name: "姆巴佩金靴", odds: 6 },
      { name: "哈兰德金靴", odds: 7 },
      { name: "凯恩金靴", odds: 8 },
      { name: "梅西金靴", odds: 10 },
      { name: "C罗金靴", odds: 12 },
      { name: "维尼修斯金靴", odds: 15 },
      { name: "贝林厄姆金靴", odds: 19 },
      { name: "其它球员金靴", odds: 21 },
    ],
  },
];