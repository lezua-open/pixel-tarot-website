/** 塔罗牌能量类型 */
export type EnergyType = "light" | "neutral" | "dark";

/** 牌位方向 */
export type CardOrientation = "upright" | "reversed";

/** 三牌阵位置 */
export type SpreadPosition = "past" | "present" | "future";

/** 塔罗牌基础数据 */
export interface TCard {
  id: number;
  name: string;        // 中文名
  en: string;          // 英文名
  img: string;         // 图片路径
  light: string;       // 正位含义
  dark: string;        // 逆位含义
  energy: EnergyType;
  col: string;         // 主题色 hex
}

/** 抽出的牌（含方向） */
export interface DrawnCard extends TCard {
  reversed: boolean;
  position?: SpreadPosition;  // 三牌阵时有值
}

/** 牌面图标映射 */
export type CardIconMap = Record<number, React.ComponentType<{ style?: React.CSSProperties }>>;
