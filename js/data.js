/* ============================================================
 * SIDE B · 独立黑胶唱片店 —— 商品数据（全部虚构，仅供演示）
 * ------------------------------------------------------------
 * 本文件是唯一的数据源：
 *   - 商品 / 曲目 / 版本 / 库存 / 限量编号
 *   - 封面路径（assets.coverBase + record.cover）
 *   - 试听资源路径（assets.audioBase + record.preview）
 *   - 优惠码
 * 替换真实内容时，只需修改本文件并替换 assets/ 下同名文件。
 * ============================================================ */
window.SIDEB = {

  store: {
    name: "SIDE B",
    tagline: "B面也有好歌",
    slogan: "一间只卖「第二好听」的黑胶唱片店",
    currency: "¥",
    freeShippingOver: 350,
    shippingFee: 18,
    openedYear: 2017,
    address: "退线市旧港街 33⅓ 号",
    hours: "每天 13:00 – 23:00（下雨天照常营业）",
    email: "hello@sideb.example",
    phone: "000-3333-033"
  },

  /* 静态资源根路径 —— 换成真实素材时改这里即可 */
  assets: {
    coverBase: "./assets/covers/",
    audioBase: "./assets/audio/"
  },

  /* 筛选维度配置 */
  facets: {
    genres: ["摇滚", "爵士", "电子", "民谣", "灵魂放克", "嘻哈"],
    decades: ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
    priceBands: [
      { key: "all",     label: "全部价格" },
      { key: "lt150",   label: "¥150 以下" },
      { key: "150-250", label: "¥150 – 250" },
      { key: "250-500", label: "¥250 – 500" },
      { key: "gte500",  label: "¥500 以上" }
    ],
    conditions: [
      { key: "all",     label: "全部品相" },
      { key: "sealed",  label: "全新未拆" },
      { key: "new",     label: "全新拆封" },
      { key: "used",    label: "二手收藏" }
    ],
    sorts: [
      { key: "featured", label: "店主推荐" },
      { key: "priceAsc", label: "价格从低到高" },
      { key: "priceDesc", label: "价格从高到低" },
      { key: "yearDesc", label: "年代新 → 旧" },
      { key: "yearAsc",  label: "年代旧 → 新" }
    ]
  },

  /* 优惠码 —— 结算页输入，大小写不敏感 */
  promoCodes: {
    "SIDEB10":   { type: "percent",  value: 10, label: "全场 9 折",            desc: "店内任意唱片立减 10%" },
    "FIRSTSPIN": { type: "fixed",    value: 20, label: "首单立减 ¥20",         desc: "满 ¥100 可用，每单限一张码" },
    "B面彩蛋":   { type: "fixed",    value: 33, label: "B 面彩蛋 · 减 ¥33",    desc: "店庆彩蛋码，满 ¥233 可用" },
    "FREESHIP":  { type: "shipping", value: 0,  label: "免运费",               desc: "本单运费由店里承担" }
  },

  /* ------------------------------------------------------------ */
  records: [
    {
      id: "sb-001",
      artist: "赤潮电台",
      album: "午夜环线",
      year: 2021, decade: "2020s", genre: "摇滚",
      label: "灯塔唱片", catalog: "LB-021",
      price: 219, originalPrice: null, stock: 12,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "透明红 180g", hex: "#a63243" },
      edition: "首版 · 限量 500 张 · 附歌词海报",
      tracks: 10,
      tracklist: {
        A: [["午夜环线","3:42"],["站台吸烟区","4:05"],["末班车信箱","3:28"],["隧道回声","5:11"],["换乘，幻觉","3:57"]],
        B: [["出站口的雨","4:18"],["第三轨道","3:33"],["自动扶梯上的星期一","4:44"],["终点站前请勿下车","5:02"],["环线（返程）","6:15"]]
      },
      description: "一张写给末班车换乘乘客的摇滚专辑。合成器与失真吉他沿着地铁路线图交替闪烁，B面的七分钟返程曲是店内最常被点播的「出神曲」。",
      limited: { total: 500, remaining: 88, note: "现存编号 #413 – #500，售完不再版" },
      cover: "sb-001.svg", preview: "sb-001.wav",
      coverStyle: { layout: "rings", bg: "#1d1420", fg: "#f1e6cf", accent: "#a63243" },
      featured: 2
    },
    {
      id: "sb-002",
      artist: "蓝屿爵士五重奏",
      album: "港口灯火",
      year: 1974, decade: "1970s", genre: "爵士",
      label: "潮汐唱片", catalog: "TC-074",
      price: 259, originalPrice: null, stock: 5,
      condition: "nm", conditionLabel: "二手 · 近乎全新 (NM)",
      vinyl: { name: "黑胶 180g 复刻", hex: "#121110" },
      edition: "2020 复刻版 · 原母带重制",
      tracks: 7,
      tracklist: {
        A: [["港口灯火","6:12"],["雾号","5:24"],["慢船去内湾","7:03"],["缆绳与酒","4:45"]],
        B: [["凌晨四点的鱼市","5:58"],["塔顶旋转灯","6:31"],["归航","8:07"]]
      },
      description: "传奇冷爵士五重奏在渔港录音室的一晚录完的专辑。萨克斯像雾号一样悠长，适合任何下雨的夜晚。《归航》的贝斯走线被无数乐手抄过谱。",
      limited: null,
      cover: "sb-002.svg", preview: "sb-002.wav",
      coverStyle: { layout: "type", bg: "#173042", fg: "#f1e6cf", accent: "#c9a86a" },
      featured: 5
    },
    {
      id: "sb-003",
      artist: "波形记忆",
      album: "慢速未来",
      year: 1988, decade: "1980s", genre: "电子",
      label: "环形实验室", catalog: "RL-088",
      price: 189, originalPrice: null, stock: 9,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "黑胶 · 银色丝印", hex: "#121110" },
      edition: "重压版 · 附原版内页海报",
      tracks: 7,
      tracklist: {
        A: [["系统待机","4:44"],["慢速未来","5:20"],["荧光走廊","4:02"],["调制解调","6:15"]],
        B: [["数据雨","5:33"],["午夜缓存","4:48"],["关机前的舞步","7:01"]]
      },
      description: "上世纪合成器浪潮的遗珠。整张专辑用一台快报废的鼓机和两台模拟合成器完成，封面上的荧光走廊据说原型是本地老电视塔的地下通道。",
      limited: null,
      cover: "sb-003.svg", preview: "sb-003.wav",
      coverStyle: { layout: "grid", bg: "#101b26", fg: "#8fd0d8", accent: "#e8b04b" },
      featured: 8
    },
    {
      id: "sb-004",
      artist: "山谷来信",
      album: "篝火与邮戳",
      year: 2019, decade: "2010s", genre: "民谣",
      label: "邮差音乐", catalog: "PM-019",
      price: 169, originalPrice: null, stock: 14,
      condition: "new", conditionLabel: "全新 · 已拆封试听",
      vinyl: { name: "焦糖棕胶", hex: "#7c4a2d" },
      edition: "标准版 · 手写编号内页",
      tracks: 7,
      tracklist: {
        A: [["篝火与邮戳","3:51"],["松针信","4:07"],["山径编号","3:29"],["炉边口述","5:12"]],
        B: [["背包客旅馆","3:58"],["雪线以上","4:35"],["寄回山谷","4:44"]]
      },
      description: "主唱在山里当了一年邮递员后写下的歌。木吉他、口琴和篝火采样，每一首都能闻到松针味。店里试音时播这张，客人普遍走不动路。",
      limited: null,
      cover: "sb-004.svg", preview: "sb-004.wav",
      coverStyle: { layout: "sun", bg: "#e9dcbc", fg: "#3a2a1c", accent: "#b3542e" },
      featured: null
    },
    {
      id: "sb-005",
      artist: "晚风乐团",
      album: "丝绒舞池",
      year: 1977, decade: "1970s", genre: "灵魂放克",
      label: "夜场唱片", catalog: "NC-077",
      price: 239, originalPrice: null, stock: 6,
      condition: "vg+", conditionLabel: "二手 · 佳品 (VG+)",
      vinyl: { name: "日落橙胶", hex: "#c96f2f" },
      edition: "复刻版 · 舞池修复母带",
      tracks: 7,
      tracklist: {
        A: [["丝绒舞池","5:44"],["周末姓什么","4:31"],["蜜糖慢递","6:08"],["镜子舞伴","4:17"]],
        B: [["迪斯科消防演习","5:52"],["天鹅绒电梯","4:29"],["舞池清场之后","7:21"]]
      },
      description: "迪斯科时代的湿漉漉的心跳。铜管组与弦乐铺得像丝绒，《舞池清场之后》是全场慢四步专用——老板娘说这是她 1980 年的定情曲。",
      limited: null,
      cover: "sb-005.svg", preview: "sb-005.wav",
      coverStyle: { layout: "arc", bg: "#5c1f2e", fg: "#f1e6cf", accent: "#c9a86a" },
      featured: null
    },
    {
      id: "sb-006",
      artist: "词不达意",
      album: "采样手记",
      year: 2016, decade: "2010s", genre: "嘻哈",
      label: "口误工作室", catalog: "MW-016",
      price: 199, originalPrice: null, stock: 8,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "泼墨白胶", hex: "#e8e0cd" },
      edition: "首版 · 附采样来源清单",
      tracks: 7,
      tracklist: {
        A: [["采样手记","3:12"],["鼓机日记","3:45"],["老唱片行的下午","4:02"],["拼贴旁听席","3:38"]],
        B: [["地下室存款","4:11"],["失眠节拍","3:26"],["未署名的信","4:40"]]
      },
      description: "制作人把三年里在旧唱片行淘到的碎片全部拼进这张「手记」。内页印着每一处采样的来源清单——包括他自己只卖了一天的那盘磁带。",
      limited: null,
      cover: "sb-006.svg", preview: "sb-006.wav",
      coverStyle: { layout: "collage", bg: "#211a14", fg: "#f1e6cf", accent: "#a63243" },
      featured: 7
    },
    {
      id: "sb-007",
      artist: "白鲸导航",
      album: "北纬回声",
      year: 2023, decade: "2020s", genre: "摇滚",
      label: "航海日志唱片", catalog: "SJ-023",
      price: 179, originalPrice: null, stock: 16,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "冰蓝透明胶", hex: "#7fa8c9" },
      edition: "标准版 · 首批带 OBI 侧标",
      tracks: 7,
      tracklist: {
        A: [["北纬回声","4:21"],["冰川邮局","3:47"],["桅杆上的诗人","4:55"],["鲸落之前","5:08"]],
        B: [["灯塔值班员","3:39"],["盐渍风琴","4:26"],["靠岸","6:02"]]
      },
      description: "四人乐队在北方的渔村排练房写完了这批航海题材的歌。巨型混响吉他像海雾一样涌进来，《靠岸》的最后一段合唱是去年音乐节万人跟唱的名场面。",
      limited: null,
      cover: "sb-007.svg", preview: "sb-007.wav",
      coverStyle: { layout: "discs", bg: "#12222e", fg: "#e8e0cd", accent: "#7fa8c9" },
      featured: 3
    },
    {
      id: "sb-008",
      artist: "银盐冲印所",
      album: "显影之夜",
      year: 1968, decade: "1960s", genre: "爵士",
      label: "暗房唱片", catalog: "DA-008",
      price: 680, originalPrice: null, stock: 1,
      condition: "vg+", conditionLabel: "二手 · 佳品 (VG+)",
      vinyl: { name: "原版黑胶", hex: "#121110" },
      edition: "1968 首版原压 · 深槽刻片",
      tracks: 7,
      tracklist: {
        A: [["显影之夜","7:14"],["定影","5:47"],["放大机下的华尔兹","6:22"],["曝光过度","4:58"]],
        B: [["红灯暗房","8:03"],["相纸上的月光","5:36"],["收藏进底片册","6:44"]]
      },
      description: "店里镇店级藏品。1968 年首压深槽盘，封套右下角有当年店主手写的价签残留。钢琴三重奏在暗房里即兴了一整夜，据说录音间隙他们真的在洗照片。",
      limited: null,
      cover: "sb-008.svg", preview: "sb-008.wav",
      coverStyle: { layout: "type", bg: "#181518", fg: "#d9d2c2", accent: "#a63243" },
      featured: 1
    },
    {
      id: "sb-009",
      artist: "电动萤火虫",
      album: "发光的复杂度",
      year: 1995, decade: "1990s", genre: "电子",
      label: "萤火电波", catalog: "FR-095",
      price: 149, originalPrice: null, stock: 11,
      condition: "new", conditionLabel: "全新 · 已拆封试听",
      vinyl: { name: "荧光黄胶", hex: "#d8c04a" },
      edition: "再版 · 附贴纸一张",
      tracks: 7,
      tracklist: {
        A: [["发光的复杂度","5:12"],["电池与诗","4:03"],["频闪捕手","4:57"],["夏夜电压","3:48"]],
        B: [["慢闪","6:20"],["萤火虫的数学题","4:41"],["黎明断电","5:29"]]
      },
      description: "九十年代卧室电子的天真之作。一台卡西欧键盘加一台四轨磁带机，《慢闪》至今仍是夏夜歌单的常驻曲目。再版胶是罕见的荧光黄。",
      limited: null,
      cover: "sb-009.svg", preview: "sb-009.wav",
      coverStyle: { layout: "grid", bg: "#14210f", fg: "#d8c04a", accent: "#e8e0cd" },
      featured: null
    },
    {
      id: "sb-010",
      artist: "麦浪合唱团",
      album: "丰收悖论",
      year: 1982, decade: "1980s", genre: "民谣",
      label: "谷仓唱片", catalog: "BC-082",
      price: 129, originalPrice: null, stock: 7,
      condition: "vg", conditionLabel: "二手 · 良好 (VG)",
      vinyl: { name: "黑胶", hex: "#121110" },
      edition: "原版 · 无歌词纸（当年即缺）",
      tracks: 7,
      tracklist: {
        A: [["丰收悖论","4:18"],["谷仓顶上的合唱","3:52"],["镰刀与月光","4:35"],["晒场会议","3:21"]],
        B: [["麦芒情书","4:02"],["佃户谣","5:14"],["谷壳飞走之后","3:47"]]
      },
      description: "十二人合唱团的丰收季现场录音，背景里真的有打谷机和狗叫。年代久远，唱面有几声轻微爆豆，属于「越旧越好听」的那一类。",
      limited: null,
      cover: "sb-010.svg", preview: "sb-010.wav",
      coverStyle: { layout: "sun", bg: "#d9b24a", fg: "#33260f", accent: "#7a4020" },
      featured: null
    },
    {
      id: "sb-011",
      artist: "深红晚祷",
      album: "酒神车站",
      year: 2020, decade: "2020s", genre: "摇滚",
      label: "酒神厂牌", catalog: "DG-020",
      price: 329, originalPrice: null, stock: 6,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "深酒红半透明 200g", hex: "#7a1f2b" },
      edition: "限量 300 张 · 手工浇铸彩胶 · 编号发售",
      tracks: 7,
      tracklist: {
        A: [["酒神车站","4:58"],["葡萄藤下的电机","5:23"],["举杯前的独白","4:11"],["醉汉与霓虹","6:02"]],
        B: [["末班渡轮弥撒","5:47"],["车站钟楼的阴影","4:33"],["敬残余的火","7:18"]]
      },
      description: "半透明的深酒红胶体在唱机上转起来像一杯晃动的红酒。乐队只 press 了 300 张，卖完后母带锁进了车站旁的储物柜——他们说钥匙丢了。",
      limited: { total: 300, remaining: 41, note: "现存编号 #260 – #300，手工浇铸每张纹理不同" },
      cover: "sb-011.svg", preview: "sb-011.wav",
      coverStyle: { layout: "arc", bg: "#2a0f14", fg: "#e8cfc0", accent: "#c95b4a" },
      featured: 4
    },
    {
      id: "sb-012",
      artist: "午夜台球厅",
      album: "九号球蔷薇",
      year: 1979, decade: "1970s", genre: "灵魂放克",
      label: "夜场唱片", catalog: "NC-079",
      price: 209, originalPrice: null, stock: 4,
      condition: "nm", conditionLabel: "二手 · 近乎全新 (NM)",
      vinyl: { name: "黑胶 · 烫金编号", hex: "#121110" },
      edition: "原版 · 烫金编号第 0884 号",
      tracks: 7,
      tracklist: {
        A: [["九号球蔷薇","5:26"],["绿呢桌面上的行星","4:44"],["巧粉与香槟","5:01"],["一杆清台","3:58"]],
        B: [["记分员","4:37"],["打烊前最后一局","6:12"],["台灯下的慢舞","7:05"]]
      },
      description: "台球厅驻场乐队的唯一一张专辑，录完第二年台球厅就拆迁了。鼓点像清脆的碰撞声，贝斯线是一根永远打不进的九号球。《台灯下的慢舞》请闭眼听。",
      limited: null,
      cover: "sb-012.svg", preview: "sb-012.wav",
      coverStyle: { layout: "discs", bg: "#0f2318", fg: "#c9a86a", accent: "#e8e0cd" },
      featured: null
    },
    {
      id: "sb-013",
      artist: "低空飞行乐团",
      album: "云层之下",
      year: 2004, decade: "2000s", genre: "摇滚",
      label: "云梯唱片", catalog: "YT-004",
      price: 139, originalPrice: null, stock: 13,
      condition: "vg+", conditionLabel: "二手 · 佳品 (VG+)",
      vinyl: { name: "雾霾蓝胶", hex: "#6f89a6" },
      edition: "原版 · 附航班明信片",
      tracks: 7,
      tracklist: {
        A: [["云层之下","4:44"],["颠簸情歌","3:56"],["舷窗看海","4:21"],["气流与心跳","5:03"]],
        B: [["失联广播","4:12"],["降落前的合唱","3:47"],["地面欢迎我们","5:56"]]
      },
      description: " 千禧年后的独立摇滚清爽之作。整张专辑按一次飞行顺序排列：登机、颠簸、失联、落地。《地面欢迎我们》适合刚搬进新城市的人。",
      limited: null,
      cover: "sb-013.svg", preview: "sb-013.wav",
      coverStyle: { layout: "rings", bg: "#25344a", fg: "#e8e0cd", accent: "#c95b4a" },
      featured: null
    },
    {
      id: "sb-014",
      artist: "环形公路",
      album: "绕圈",
      year: 2013, decade: "2010s", genre: "电子",
      label: "环形实验室", catalog: "RL-013",
      price: 159, originalPrice: null, stock: 10,
      condition: "new", conditionLabel: "全新 · 已拆封试听",
      vinyl: { name: "水泥灰胶", hex: "#8a8578" },
      edition: "标准版 · 封底印路线图",
      tracks: 7,
      tracklist: {
        A: [["绕圈","6:04"],["匝道月光","5:18"],["收费站的日落","4:46"],["无限循环驾驶","7:02"]],
        B: [["服务区诗人","4:39"],["里程与失眠","5:55"],["驶出环线","6:23"]]
      },
      description: "一辆车、一条环线、六十四圈。极简节拍铺在长途驾驶的引擎声下，封底印着那条著名的绕城路线图——据说有人真的按图开了一整夜。",
      limited: null,
      cover: "sb-014.svg", preview: "sb-014.wav",
      coverStyle: { layout: "grid", bg: "#2b2b28", fg: "#d9d2c2", accent: "#c9a86a" },
      featured: null
    },
    {
      id: "sb-015",
      artist: "拾荒者爵士三重奏",
      album: "废品场布鲁斯",
      year: 1959, decade: "1950s", genre: "爵士",
      label: "铁皮唱片", catalog: "TP-059",
      price: 980, originalPrice: null, stock: 1,
      condition: "vg", conditionLabel: "二手 · 良好 (VG)",
      vinyl: { name: "原版黑胶 · 平底刻纹", hex: "#121110" },
      edition: "1959 首版 · 全店年代最久藏品",
      tracks: 7,
      tracklist: {
        A: [["废品场布鲁斯","8:16"],["铜锈摇椅","5:44"],["秤上的慢板","6:03"],["马口铁月光","4:57"]],
        B: [["压扁的汽车圆舞曲","5:38"],["旧轮胎摇摆","4:49"],["收工前的告别","7:26"]]
      },
      description: "全店最老也最贵的一张。三位乐手白天在废品场工作，晚上把扳手和铁皮罐写进了歌里。封套的磨痕是六十七年的手泽——我们只是这一站的保管员。",
      limited: null,
      cover: "sb-015.svg", preview: "sb-015.wav",
      coverStyle: { layout: "type", bg: "#3a2d1c", fg: "#e8c784", accent: "#a63243" },
      featured: 6
    },
    {
      id: "sb-016",
      artist: "少年望远",
      album: "夏夜观测指南",
      year: 2024, decade: "2020s", genre: "民谣",
      label: "观星台唱片", catalog: "OT-024",
      price: 189, originalPrice: null, stock: 15,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "夜空蓝胶", hex: "#2c3e6b" },
      edition: "标准版 · 附星图海报",
      tracks: 7,
      tracklist: {
        A: [["夏夜观测指南","4:12"],["猎户座信箱","3:47"],["萤火虫坐标","4:29"],["天台望远镜","5:06"]],
        B: [["流星备案","3:38"],["星图背面","4:44"],["拂晓收镜","5:51"]]
      },
      description: "去年夏天全店卖得最快的新民谣。整张专辑是一份写给城市天台的观星手册，B面最后一首《拂晓收镜》结尾收录了真实的黎明鸟叫。",
      limited: null,
      cover: "sb-016.svg", preview: "sb-016.wav",
      coverStyle: { layout: "discs", bg: "#141d38", fg: "#e8e0cd", accent: "#e8b04b" },
      featured: null
    },
    {
      id: "sb-017",
      artist: "街角邮局",
      album: "平信与回声",
      year: 1991, decade: "1990s", genre: "嘻哈",
      label: "邮戳唱片", catalog: "PS-091",
      price: 175, originalPrice: null, stock: 6,
      condition: "nm", conditionLabel: "二手 · 近乎全新 (NM)",
      vinyl: { name: "牛皮纸色胶", hex: "#b09a6e" },
      edition: "原版 · 附真实邮戳内页",
      tracks: 7,
      tracklist: {
        A: [["平信与回声","4:20"],["邮票节奏","3:44"],["绿邮筒上的涂鸦","4:07"],["挂号信布鲁斯","3:52"]],
        B: [["分拣机之夜","4:33"],["退回寄件人","3:59"],["盖戳，出发","5:14"]]
      },
      description: "采样全部来自邮局：盖戳声、分拣机、老式电话铃。九十年代地下嘻哈最温柔的一张，《退回寄件人》写给所有寄不出去的信。",
      limited: null,
      cover: "sb-017.svg", preview: "sb-017.wav",
      coverStyle: { layout: "collage", bg: "#8a6f3e", fg: "#f5ecd7", accent: "#2f4a3c" },
      featured: null
    },
    {
      id: "sb-018",
      artist: "涡电流",
      album: "感应加热",
      year: 2018, decade: "2010s", genre: "电子",
      label: "环形实验室", catalog: "RL-018",
      price: 429, originalPrice: null, stock: 3,
      condition: "sealed", conditionLabel: "全新未拆",
      vinyl: { name: "透明琥珀胶 200g", hex: "#d8862a" },
      edition: "限量 200 张 · 透明琥珀胶 · 编号发售",
      tracks: 7,
      tracklist: {
        A: [["感应加热","6:44"],["涡流损耗","5:21"],["电磁炉上的即兴","4:38"],["法拉第假想舞","6:07"]],
        B: [["铁芯合唱","5:12"],["集肤效应","4:56"],["冷却塔的黄昏","8:03"]]
      },
      description: "用真正的工业电流声做的电子乐。透明琥珀色胶体在灯下像一块融化的糖。限量 200 张，店里只剩最后几本编号——这是本店涨得最快的唱片，没有之一。",
      limited: { total: 200, remaining: 12, note: "现存编号 #189 – #200，含调试音轨彩蛋" },
      cover: "sb-018.svg", preview: "sb-018.wav",
      coverStyle: { layout: "arc", bg: "#26150a", fg: "#f0dfc0", accent: "#d8862a" },
      featured: 9
    },
    {
      id: "sb-019",
      artist: "野蜂剧场",
      album: "无人生还之夜",
      year: 1966, decade: "1960s", genre: "摇滚",
      label: "野蜂唱片", catalog: "WB-066",
      price: 289, originalPrice: null, stock: 5,
      condition: "vg+", conditionLabel: "二手 · 佳品 (VG+)",
      vinyl: { name: "黄黑漩纹胶", hex: "#d3a72e" },
      edition: "原版 · 漩纹压盘（难压易废，存世少）",
      tracks: 7,
      tracklist: {
        A: [["无人生还之夜","4:48"],["蜂鸣前奏曲","3:32"],["阁楼里的和声","5:07"],["蜇一下","2:59"]],
        B: [["剧院散场","4:26"],["黄黑条纹西装","3:53"],["翅膀收起的安可","6:11"]]
      },
      description: " garage rock 时代的剧场概念专辑，六首歌讲完一场没有观众散场的演出。漩纹压盘当年报废率极高，能转到你手里的每一张都是幸存者。",
      limited: null,
      cover: "sb-019.svg", preview: "sb-019.wav",
      coverStyle: { layout: "rings", bg: "#33280a", fg: "#f0dfc0", accent: "#d3a72e" },
      featured: null
    },
    {
      id: "sb-020",
      artist: "棉花与铁",
      album: "纺车谣",
      year: 1971, decade: "1970s", genre: "民谣",
      label: "织造唱片", catalog: "ZZ-071",
      price: 119, originalPrice: null, stock: 9,
      condition: "vg", conditionLabel: "二手 · 良好 (VG)",
      vinyl: { name: "黑胶", hex: "#121110" },
      edition: "原版 · 双女主唱对唱版",
      tracks: 7,
      tracklist: {
        A: [["纺车谣","4:34"],["棉田午睡","3:41"],["铁轨摇篮曲","4:18"],["布票上的名字","3:29"]],
        B: [["织机二重唱","4:52"],["缝进衣领的歌声","3:56"],["晾衣绳上的风","4:27"]]
      },
      description: "两位纺织女工的对唱专辑，和声织得像布。店里最便宜也最常被人买走的一张——很多客人说，这是给妈妈挑的。",
      limited: null,
      cover: "sb-020.svg", preview: "sb-020.wav",
      coverStyle: { layout: "sun", bg: "#c9b8a0", fg: "#3a2a1c", accent: "#7a1f2b" },
      featured: 10
    }
  ]
};

/* 按 id 取唱片 */
window.SIDEB.find = function (id) {
  return this.records.find(r => r.id === id) || null;
};
