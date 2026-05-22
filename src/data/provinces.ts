/** 省级行政区知识卡片（MVP 种子数据） */
export interface ProvinceMeta {
  adcode: string
  name: string
  capital: string
  /** 地名由来（简要） */
  nameOrigin: string
  /** 机动车号牌简称 */
  platePrefix: string
  /** 代表性名人（姓名 + 一句话） */
  notablePeople: string[]
}

export const PROVINCE_BY_ADCODE: Record<string, ProvinceMeta> = {
  '110000': {
    adcode: '110000',
    name: '北京市',
    capital: '北京',
    platePrefix: '京',
    nameOrigin:
      '明永乐元年（1403）改北平为北京，意为「北方京师」；「京」本义为国都、大邑。',
    notablePeople: ['曹雪芹 — 《红楼梦》', '老舍 — 《骆驼祥祥》《茶馆》'],
  },
  '120000': {
    adcode: '120000',
    name: '天津市',
    capital: '天津',
    platePrefix: '津',
    nameOrigin:
      '明永乐二年设天津卫，取「天子渡口」之意；因漕运枢纽而兴，近代开埠后成北方商埠。',
    notablePeople: ['霍元甲 — 武术家', '李叔同 — 艺术家、教育家'],
  },
  '130000': {
    adcode: '130000',
    name: '河北省',
    capital: '石家庄',
    platePrefix: '冀',
    nameOrigin:
      '「冀」为古九州之一，因地处黄河以北，汉设冀州，后世以「河北」泛指黄河以北之地。',
    notablePeople: ['赵云 — 三国名将', '张之洞 — 洋务派代表'],
  },
  '140000': {
    adcode: '140000',
    name: '山西省',
    capital: '太原',
    platePrefix: '晋',
    nameOrigin:
      '春秋属晋国，战国韩赵魏分晋后仍称「晋」；「山西」因太行以西得名。',
    notablePeople: ['关羽 — 三国名将', '王维 — 诗人、画家'],
  },
  '150000': {
    adcode: '150000',
    name: '内蒙古自治区',
    capital: '呼和浩特',
    platePrefix: '蒙',
    nameOrigin:
      '「内蒙古」相对外蒙古，意为漠南蒙古诸部；清设内蒙古札萨克盟。',
    notablePeople: ['嘎达梅林 — 民族英雄', '尹湛纳希 — 学者'],
  },
  '210000': {
    adcode: '210000',
    name: '辽宁省',
    capital: '沈阳',
    platePrefix: '辽',
    nameOrigin: '因境内辽河得名；辽河古称「辽水」，契丹在此建辽。',
    notablePeople: ['张学良 — 近代政治人物', '曹雪芹祖籍辽东'],
  },
  '220000': {
    adcode: '220000',
    name: '吉林省',
    capital: '长春',
    platePrefix: '吉',
    nameOrigin:
      '清康熙年间设吉林乌拉，满语「乌拉」意为江，因松花江沿岸柳林得名吉林。',
    notablePeople: ['杨靖宇 — 抗日英雄', '南仁东 — 天文学家（籍贯关联）'],
  },
  '230000': {
    adcode: '230000',
    name: '黑龙江省',
    capital: '哈尔滨',
    platePrefix: '黑',
    nameOrigin: '因黑龙江（阿穆尔河）水色深黑得名；清末设黑将军。',
    notablePeople: ['萧红 — 作家', '赵尚志 — 抗日英雄'],
  },
  '310000': {
    adcode: '310000',
    name: '上海市',
    capital: '上海',
    platePrefix: '沪',
    nameOrigin:
      '「沪」本指吴淞江下游竹木排筏，宋元称沪渎；1843 开埠后成国际都市。',
    notablePeople: ['鲁迅 — 文学家', '徐光启 — 科学家'],
  },
  '320000': {
    adcode: '320000',
    name: '江苏省',
    capital: '南京',
    platePrefix: '苏',
    nameOrigin:
      '清初设江宁省，康熙六年取「江宁」与「苏州」各一字合称江苏。',
    notablePeople: ['苏轼 — 文学家', '徐霞客 — 地理学家'],
  },
  '330000': {
    adcode: '330000',
    name: '浙江省',
    capital: '杭州',
    platePrefix: '浙',
    nameOrigin:
      '因钱塘江古称浙江得名；「浙」为江名，非「之江」简称的民间说法。',
    notablePeople: ['鲁迅 — 文学家（绍兴）', '陆游 — 诗人'],
  },
  '340000': {
    adcode: '340000',
    name: '安徽省',
    capital: '合肥',
    platePrefix: '皖',
    nameOrigin:
      '清初设安庆府、徽州府，取两地各一字合称安徽；「皖」为古皖国。',
    notablePeople: ['曹操 — 政治家、军事家', '李鸿章 — 近代政治家'],
  },
  '350000': {
    adcode: '350000',
    name: '福建省',
    capital: '福州',
    platePrefix: '闽',
    nameOrigin:
      '因境内闽江得名；先秦闽越族居此，汉设闽中郡，唐设福建观察使。',
    notablePeople: ['朱熹 — 理学家', '冰心 — 作家'],
  },
  '360000': {
    adcode: '360000',
    name: '江西省',
    capital: '南昌',
    platePrefix: '赣',
    nameOrigin:
      '唐设江南西道，简称「江西」；「赣」因赣江贯穿全省，古称赣水。',
    notablePeople: ['陶渊明 — 诗人', '王安石 — 政治家、文学家'],
  },
  '370000': {
    adcode: '370000',
    name: '山东省',
    capital: '济南',
    platePrefix: '鲁',
    nameOrigin:
      '春秋鲁国故地，因孔子故里；「山东」相对太行以东，金设山东东路。',
    notablePeople: ['孔子 — 思想家', '李清照 — 词人'],
  },
  '410000': {
    adcode: '410000',
    name: '河南省',
    capital: '郑州',
    platePrefix: '豫',
    nameOrigin:
      '古豫州之地，简称「豫」；「河南」意为黄河以南，汉设河南郡。',
    notablePeople: ['老子 — 哲学家', '杜甫 — 诗人'],
  },
  '420000': {
    adcode: '420000',
    name: '湖北省',
    capital: '武汉',
    platePrefix: '鄂',
    nameOrigin:
      '因鄂国故地得名，简称「鄂」；清设湖北省，省会武昌，今武汉三镇。',
    notablePeople: ['屈原 — 诗人', '张居正 — 政治家'],
  },
  '430000': {
    adcode: '430000',
    name: '湖南省',
    capital: '长沙',
    platePrefix: '湘',
    nameOrigin:
      '因湘江贯穿得名，简称「湘」；「湖南」相对洞庭湖以南。',
    notablePeople: ['毛泽东 — 革命家', '曾国藩 — 政治家'],
  },
  '440000': {
    adcode: '440000',
    name: '广东省',
    capital: '广州',
    platePrefix: '粤',
    nameOrigin:
      '古百越之地，汉设南海郡；「粤」为古粤人，广府文化核心在珠江三角洲。',
    notablePeople: ['孙中山 — 革命家', '康有为 — 思想家'],
  },
  '450000': {
    adcode: '450000',
    name: '广西壮族自治区',
    capital: '南宁',
    platePrefix: '桂',
    nameOrigin:
      '「桂」因秦汉桂林郡得名，非仅指桂林市；1958 成立壮族自治区。',
    notablePeople: ['李宗仁 — 军事家', '刘三姐 — 民间歌仙传说'],
  },
  '460000': {
    adcode: '460000',
    name: '海南省',
    capital: '海口',
    platePrefix: '琼',
    nameOrigin:
      '因琼州海峡、琼州得名；古称崖州，1988 建省成为中国最大经济特区之一。',
    notablePeople: ['海瑞 — 明代名臣', '黄道婆 — 纺织技术传播（传说关联）'],
  },
  '500000': {
    adcode: '500000',
    name: '重庆市',
    capital: '重庆',
    platePrefix: '渝',
    nameOrigin:
      '简称「渝」因嘉陵江古称渝水；隋设渝州，1997 成为直辖市。',
    notablePeople: ['巴蔓子 — 古代名将', '聂荣臻 — 开国元帅'],
  },
  '510000': {
    adcode: '510000',
    name: '四川省',
    capital: '成都',
    platePrefix: '川 / 蜀',
    nameOrigin:
      '宋置川峡四路，简称四川；「蜀」因三国蜀汉与古蜀国得名。',
    notablePeople: ['李白 — 诗人', '苏轼 — 文学家（眉山）'],
  },
  '520000': {
    adcode: '520000',
    name: '贵州省',
    capital: '贵阳',
    platePrefix: '贵 / 黔',
    nameOrigin:
      '明设贵州布政使司，因贵山（贵阳）得名；「黔」因黔江（乌江）古称。',
    notablePeople: ['王阳明 — 哲学家（龙场悟道）', '吴文俊 — 数学家'],
  },
  '530000': {
    adcode: '530000',
    name: '云南省',
    capital: '昆明',
    platePrefix: '云 / 滇',
    nameOrigin:
      '因省内有彩云之南传说得名；「滇」因滇池与古滇国。',
    notablePeople: ['聂耳 — 音乐家', '和志强 — 植物学家'],
  },
  '540000': {
    adcode: '540000',
    name: '西藏自治区',
    capital: '拉萨',
    platePrefix: '藏',
    nameOrigin:
      '「西藏」意为卫藏地区（前藏、后藏）；藏语「卫藏」音译演变，元明称乌思藏。',
    notablePeople: ['文成公主 — 唐和亲', '仓央嘉措 — 诗人达赖'],
  },
  '610000': {
    adcode: '610000',
    name: '陕西省',
    capital: '西安',
    platePrefix: '陕 / 秦',
    nameOrigin:
      '因陕塬（今陕县）得名；简称「秦」因战国秦国都咸阳。',
    notablePeople: ['秦始皇 — 帝王', '张骞 — 外交家'],
  },
  '620000': {
    adcode: '620000',
    name: '甘肃省',
    capital: '兰州',
    platePrefix: '甘 / 陇',
    nameOrigin:
      '元设甘肃行省，因甘州（张掖）与肃州（酒泉）各取一字；「陇」因陇山。',
    notablePeople: ['伏羲 — 人文始祖传说', '李广 — 汉代名将'],
  },
  '630000': {
    adcode: '630000',
    name: '青海省',
    capital: '西宁',
    platePrefix: '青',
    nameOrigin: '因境内青海湖得名；1928 正式设青海省。',
    notablePeople: ['文成公主 — 唐和亲（途经）', '格萨尔 — 史诗英雄'],
  },
  '640000': {
    adcode: '640000',
    name: '宁夏回族自治区',
    capital: '银川',
    platePrefix: '宁',
    nameOrigin:
      '「宁夏」意为西夏故地安宁；西夏元昊定都兴庆府（今银川）。',
    notablePeople: ['李元昊 — 西夏开国皇帝', '马本斋 — 抗日英雄'],
  },
  '650000': {
    adcode: '650000',
    name: '新疆维吾尔自治区',
    capital: '乌鲁木齐',
    platePrefix: '新',
    nameOrigin:
      '「新疆」清平定准噶尔后设，意为新归版图；古丝绸之路要冲。',
    notablePeople: ['左宗棠 — 收复新疆', '马赫木提 — 民间诗人（传说）'],
  },
  '710000': {
    adcode: '710000',
    name: '台湾省',
    capital: '台北',
    platePrefix: '台',
    nameOrigin:
      '「台湾」一说因台南一带土人称呼；一说因台风频发海湾得名，明清设府县。',
    notablePeople: ['郑成功 — 收复台湾', '林语堂 — 作家'],
  },
  '810000': {
    adcode: '810000',
    name: '香港特别行政区',
    capital: '香港',
    platePrefix: '港',
    nameOrigin:
      '「香港」传说因莞香木转运港口得名；1842 后成为英国殖民地，1997 回归。',
    notablePeople: ['金庸 — 作家', '孙中山 — 曾在此求学活动'],
  },
  '820000': {
    adcode: '820000',
    name: '澳门特别行政区',
    capital: '澳门',
    platePrefix: '澳',
    nameOrigin:
      '「澳门」一说因妈阁庙（葡文 Macao）；明嘉靖年间葡萄牙人逐渐租占，1999 回归。',
    notablePeople: ['马万祺 — 工商界代表', '冼星海 — 音乐家（幼时居此）'],
  },
}

/**
 * 按行政区划代码获取省份元数据。
 * @param adcode - 六位省级 adcode
 * @returns 省份信息，未知代码返回 undefined
 */
export function getProvinceMeta(adcode: string): ProvinceMeta | undefined {
  return PROVINCE_BY_ADCODE[adcode]
}
