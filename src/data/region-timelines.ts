import type { RegionTimelineEvent } from '#/lib/region-history-types.ts'

/** 省级地名沿革（教学示意，可与方志对照补充） */
export const PROVINCE_TIMELINES: Record<string, RegionTimelineEvent[]> = {
  '110000': [
    {
      year: -1045,
      period: '西周',
      title: '蓟城',
      description: '北京地区始见「蓟」作为燕国重镇，地处华北平原北端。',
    },
    {
      year: 1153,
      period: '金',
      title: '中都',
      description: '金改燕京为中都，成为北方政治中心之一。',
    },
    {
      year: 1403,
      period: '明',
      title: '北京',
      description: '明永乐元年改北平为北京，「京」意为京师，为全国都城。',
    },
    {
      year: 1949,
      period: '新中国',
      title: '中华人民共和国首都',
      description: '北京成为新中国首都，直辖市体制延续至今。',
    },
  ],
  '650000': [
    {
      year: 1884,
      period: '清',
      title: '新疆建省',
      description: '清政府设新疆省，取「故土新归」之意，巩固西北边疆。',
    },
    {
      year: 1955,
      period: '新中国',
      title: '新疆维吾尔自治区',
      description: '实行民族区域自治，首府乌鲁木齐。',
    },
    {
      year: 1984,
      period: '新中国',
      title: '改革开放沿边开放',
      description: '成为向西开放重要门户，口岸与口岸经济快速发展。',
    },
  ],
  '440000': [
    {
      year: -214,
      period: '秦',
      title: '岭南置郡',
      description: '秦统一后在此设南海等郡，「粤」源于古百越之地。',
    },
    {
      year: 1368,
      period: '明',
      title: '广东承宣布政使司',
      description: '明初设广东布政司，「广东」之名渐成定制。',
    },
    {
      year: 1979,
      period: '新中国',
      title: '改革开放前沿',
      description: '毗邻港澳，率先设立经济特区，外向型经济崛起。',
    },
  ],
  '310000': [
    {
      year: 1291,
      period: '元',
      title: '上海县',
      description: '元代设上海县，因黄浦江下游「海」潮可达而得名。',
    },
    {
      year: 1843,
      period: '近代',
      title: '开埠',
      description: '被迫开埠后迅速成为远东贸易与金融重镇。',
    },
    {
      year: 1949,
      period: '新中国',
      title: '直辖市',
      description: '上海为中央直辖市，形成国际经济、金融、贸易中心。',
    },
  ],
  '510000': [
    {
      year: -316,
      period: '战国',
      title: '蜀国',
      description: '巴蜀之地，成都平原农业发达，「蜀」名沿用千年。',
    },
    {
      year: 1286,
      period: '元',
      title: '四川行省',
      description: '元代设四川行省，「川」指巴蜀四周山川环绕。',
    },
    {
      year: 1997,
      period: '新中国',
      title: '重庆直辖',
      description: '原川东重镇重庆另设直辖市，四川仍省会成都。',
    },
  ],
  '540000': [
    {
      year: 633,
      period: '唐',
      title: '吐蕃',
      description: '青藏高原形成独特政教文化格局，藏语地名广泛沿用。',
    },
    {
      year: 1965,
      period: '新中国',
      title: '西藏自治区',
      description: '实行民族区域自治，拉萨为自治区首府。',
    },
  ],
  '410000': [
    {
      year: -206,
      period: '汉',
      title: '河南郡',
      description: '汉代设河南郡，「河南」意为黄河以南，为中原核心地带。',
    },
    {
      year: 1227,
      period: '元',
      title: '河南行省',
      description: '元代确立行省体制，河南成为中原行政中心之一。',
    },
    {
      year: 1954,
      period: '新中国',
      title: '省会迁郑州',
      description: '河南省会由开封迁至郑州，形成现代省域格局。',
    },
  ],
}

/** 部分地级市沿革 */
export const CITY_TIMELINES: Record<string, RegionTimelineEvent[]> = {
  '654200': [
    {
      year: 1762,
      period: '清',
      title: '塔尔巴哈台',
      description: '清代设塔尔巴哈台参赞大臣，为北疆边防重镇。',
    },
    {
      year: 1984,
      period: '新中国',
      title: '塔城地区',
      description: '取「塔尔巴哈台」之「塔」字，今为新疆塔城地区。',
    },
  ],
  '650100': [
    {
      year: 1755,
      period: '清',
      title: '迪化',
      description: '清设迪化县，意为「开导教化」，为新疆军政中心。',
    },
    {
      year: 1954,
      period: '新中国',
      title: '乌鲁木齐',
      description: '蒙古语意为「优美的牧场」，现为自治区首府。',
    },
  ],
  '440300': [
    {
      year: 1979,
      period: '新中国',
      title: '深圳建市',
      description: '由宝安县建制调整，因深圳河得名，经济特区设立后迅速城市化。',
    },
  ],
  '410200': [
    {
      year: -364,
      period: '战国',
      title: '大梁城',
      description: '战国魏都大梁，为开封地区最早著名都城之一。',
    },
    {
      year: 960,
      period: '宋',
      title: '北宋东京汴梁',
      description:
        '北宋定都于此，称东京汴梁，取「开」拓、「封」疆之意，为当时世界最大都市之一。',
    },
    {
      year: 1368,
      period: '明',
      title: '河南省城',
      description: '明代为河南省会，七朝古都地位延续，城垣与漕运仍盛。',
    },
    {
      year: 1644,
      period: '清',
      title: '漕运重镇',
      description: '清代仍为中原重镇，漕运与商业繁荣，《清明上河图》描绘北宋汴梁盛景。',
    },
    {
      year: 1954,
      period: '新中国',
      title: '省辖市',
      description: '河南省会迁至郑州后，开封为省辖市，文化旅游与教育资源突出。',
    },
  ],
  '410100': [
    {
      year: -1600,
      period: '商',
      title: '商都遗址',
      description:
        '郑州一带为早期商文明重要区域，商城遗址、青铜器文化闻名天下。',
    },
    {
      year: -770,
      period: '春秋',
      title: '郑国都城',
      description:
        '春秋时郑国都城新郑，「郑州」之名与「郑」国故地密切相关。',
    },
    {
      year: 581,
      period: '隋',
      title: '郑州名始见',
      description: '隋开皇年间郑州之名见于史籍，成为中原交通要冲。',
    },
    {
      year: 1908,
      period: '近代',
      title: '铁路枢纽',
      description: '京汉、陇海等干线交汇，被誉为「中国铁路心脏」。',
    },
    {
      year: 1954,
      period: '新中国',
      title: '河南省会',
      description: '省会由开封迁至郑州，现代城市与工业体系快速形成。',
    },
    {
      year: 2000,
      period: '当代',
      title: '中原城市群核心',
      description: '国家中心城市之一，中原城市群核心，科创与物流产业集聚。',
    },
  ],
}
