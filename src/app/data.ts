import {
  Sparkle as IconSparkle, MagicEdit as IconMagicEdit, Moon as IconMoon,
  Potion as IconPotion, Crown as IconCrown, Lock as IconLock,
  Heart as IconHeart, Sword as IconSword, Shield as IconShield,
  Eye as IconEye, Target as IconTarget, Scale as IconScale,
  ZapOff as IconZapOff, Skull as IconSkull, BookOpen as IconBookOpen,
  Zap as IconZap, Star as IconStar, BellRing as IconBellRing,
  Globe as IconGlobe,
} from "pixelarticons/react";
import type { TCard } from "./types";

export const CARDS: TCard[] = [
  { id: 0, name: "愚者", en: "THE FOOL", img: "/cards/00-the-fool.jpg", light: "新的开始与冒险", dark: "鲁莽与缺乏方向", energy: "light", col: "#fbbf24" },
  { id: 1, name: "魔术师", en: "THE MAGICIAN", img: "/cards/01-the-magician.jpg", light: "意志力与创造", dark: "操纵与欺骗", energy: "light", col: "#a855f7" },
  { id: 2, name: "女祭司", en: "HIGH PRIESTESS", img: "/cards/02-the-high-priestess.jpg", light: "直觉与神秘智慧", dark: "隐藏的秘密", energy: "neutral", col: "#60a5fa" },
  { id: 3, name: "女皇", en: "THE EMPRESS", img: "/cards/03-the-empress.jpg", light: "丰盛与创造力", dark: "依赖与过度", energy: "light", col: "#f472b6" },
  { id: 4, name: "皇帝", en: "THE EMPEROR", img: "/cards/04-the-emperor.jpg", light: "权威与稳定", dark: "专制与僵化", energy: "light", col: "#f59e0b" },
  { id: 5, name: "教皇", en: "THE HIEROPHANT", img: "/cards/05-the-hierophant.jpg", light: "传统与精神指引", dark: "教条与保守", energy: "neutral", col: "#818cf8" },
  { id: 6, name: "恋人", en: "THE LOVERS", img: "/cards/06-the-lovers.png", light: "爱情与深层联结", dark: "冲突与选择困难", energy: "light", col: "#f43f5e" },
  { id: 7, name: "战车", en: "THE CHARIOT", img: "/cards/07-the-chariot.png", light: "胜利与掌控", dark: "失控与侵略", energy: "light", col: "#06b6d4" },
  { id: 8, name: "力量", en: "STRENGTH", img: "/cards/08-strength.jpg", light: "内在力量与耐心", dark: "软弱与自我怀疑", energy: "light", col: "#f59e0b" },
  { id: 9, name: "隐者", en: "THE HERMIT", img: "/cards/09-the-hermit.jpg", light: "内省与智慧", dark: "孤立与封闭", energy: "neutral", col: "#94a3b8" },
  { id: 10, name: "命运之轮", en: "WHEEL OF FORTUNE", img: "/cards/10-wheel-of-fortune.jpg", light: "好运与转机", dark: "厄运与阻力", energy: "neutral", col: "#8b5cf6" },
  { id: 11, name: "正义", en: "JUSTICE", img: "/cards/11-justice.jpg", light: "公正与真相", dark: "不公与逃避", energy: "neutral", col: "#6366f1" },
  { id: 12, name: "倒吊人", en: "THE HANGED MAN", img: "/cards/12-the-hanged-man.jpg", light: "暂停与新视角", dark: "固执与拖延", energy: "neutral", col: "#22c55e" },
  { id: 13, name: "死神", en: "DEATH", img: "/cards/13-death.jpg", light: "转变与重生", dark: "抗拒改变", energy: "dark", col: "#64748b" },
  { id: 14, name: "节制", en: "TEMPERANCE", img: "/cards/14-temperance.jpg", light: "平衡与调和", dark: "过度与失衡", energy: "light", col: "#14b8a6" },
  { id: 15, name: "恶魔", en: "THE DEVIL", img: "/cards/15-the-devil.jpg", light: "看见束缚", dark: "沉溺与上瘾", energy: "dark", col: "#dc2626" },
  { id: 16, name: "塔", en: "THE TOWER", img: "/cards/16-the-tower.jpg", light: "突破与启示", dark: "崩溃与混乱", energy: "dark", col: "#f97316" },
  { id: 17, name: "星星", en: "THE STAR", img: "/cards/17-the-star.jpg", light: "希望与灵感", dark: "绝望与失去方向", energy: "light", col: "#a3e635" },
  { id: 18, name: "月亮", en: "THE MOON", img: "/cards/18-the-moon.jpg", light: "直觉与潜意识", dark: "恐惧与幻觉", energy: "dark", col: "#c084fc" },
  { id: 19, name: "太阳", en: "THE SUN", img: "/cards/19-the-sun.jpg", light: "喜悦与成功", dark: "过度乐观", energy: "light", col: "#fbbf24" },
  { id: 20, name: "审判", en: "JUDGEMENT", img: "/cards/20-judgement.jpg", light: "觉醒与重生", dark: "自我怀疑与错判", energy: "light", col: "#f0abfc" },
  { id: 21, name: "世界", en: "THE WORLD", img: "/cards/21-the-world.jpg", light: "完成与整合", dark: "未完成与停滞", energy: "light", col: "#34d399" },
];

export const CARDS_ICONS: Record<number, React.ComponentType<{ style?: React.CSSProperties }>> = {
  0: IconSparkle,    1: IconMagicEdit,  2: IconMoon,
  3: IconPotion,     4: IconCrown,      5: IconLock,
  6: IconHeart,      7: IconSword,      8: IconShield,
  9: IconEye,        10: IconTarget,    11: IconScale,
  12: IconZapOff,    13: IconSkull,     14: IconBookOpen,
  15: IconLock,      16: IconZap,       17: IconStar,
  18: IconMoon,      19: IconSparkle,   20: IconBellRing,
  21: IconGlobe,
};

export const WEEKLY = [
  { day: "MON", date: "6/24", card: CARDS[17], q: "今天适合开始新项目吗？", reversed: false },
  { day: "TUE", date: "6/25", card: CARDS[6], q: "感情方面有什么需要注意？", reversed: false },
  { day: "WED", date: "6/26", card: CARDS[12], q: "该继续等待还是主动出击？", reversed: true },
  { day: "THU", date: "6/27", card: CARDS[7], q: "谈判能获得好结果吗？", reversed: false },
  { day: "FRI", date: "6/28", card: CARDS[10], q: "本周财运如何？", reversed: false },
  { day: "SAT", date: "6/29", card: CARDS[16], q: "突变该如何应对？", reversed: false },
  { day: "SUN", date: "6/30", card: CARDS[18], q: "如何从迷茫中走出？", reversed: true },
];

export const TREND_DATA = [
  { name: "星星", count: 12, col: "#a3e635" },
  { name: "太阳", count: 9, col: "#fbbf24" },
  { name: "恋人", count: 8, col: "#f43f5e" },
  { name: "战车", count: 7, col: "#06b6d4" },
  { name: "月亮", count: 6, col: "#c084fc" },
  { name: "正义", count: 5, col: "#6366f1" },
  { name: "死神", count: 4, col: "#64748b" },
];

export const PLAZA = [
  { id: 1, user: "PIXEL_WITCH", q: "撑了三年了，该换工作吗？", card: CARDS[16], reversed: false, likes: 42, time: "2H AGO" },
  { id: 2, user: "MOON_RIDER", q: "他还会回来吗", card: CARDS[18], reversed: true, likes: 38, time: "3H AGO" },
  { id: 3, user: "STAR_SEEKER", q: "创业的时机到了吗？", card: CARDS[1], reversed: false, likes: 31, time: "5H AGO" },
  { id: 4, user: "TAROT_CAT", q: "这段友谊还值得维持吗？", card: CARDS[11], reversed: false, likes: 27, time: "6H AGO" },
  { id: 5, user: "VOID_MAGE", q: "什么时候能遇到真正适合的人？", card: CARDS[6], reversed: false, likes: 89, time: "8H AGO" },
  { id: 6, user: "CRYSTAL_FOX", q: "今年考研能过吗？", card: CARDS[8], reversed: false, likes: 24, time: "12H AGO" },
  { id: 7, user: "NEON_SEER", q: "要不要接受那个offer？", card: CARDS[7], reversed: false, likes: 19, time: "1D AGO" },
];

export const READING_TEMPLATES = [
  "命运之轮已转动。{CARD}现身于你的问题之前。\n\n【{POS} · {ASPECT}】\n\n此刻宇宙低语：{ASPECT}。不必强求，顺势而为。你已拥有所需的一切力量，只是尚未察觉。\n\n✦ 行动建议：静下心来，听从内心最深处的那个声音。",
  "星辰已为你校准方向。{CARD}带来了宇宙的答案。\n\n【{POS} · {ASPECT}】\n\n这张牌揭示的能量是{ASPECT}。接受它，与之共舞，而非对抗。\n\n✦ 行动建议：不必急于求成，时机到来时一切自然显现。",
  "神秘之门已为你开启。{CARD}向你低声述说。\n\n【{POS} · {ASPECT}】\n\n宇宙的信息清晰而坚定：{ASPECT}。在混沌之中寻找秩序，在黑暗之中寻找那一点光。\n\n✦ 行动建议：信任你的直觉，它比任何逻辑都更接近真相。",
];
