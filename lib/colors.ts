export const LIGHT = {
  canvas: '#ffffff',
  surface: '#f6f5f4',
  surfaceSoft: '#fafaf9',
  charcoal: '#37352f',
  slate: '#5d5b54',
  steel: '#787671',
  stone: '#a4a097',
  muted: '#bbb8b1',
  hairline: '#e5e3df',
  hairlineSoft: '#ede9e4',
  hairlineStrong: '#c8c4be',
  error: '#e03131',
  catCode: '#5645d4',
  catHealth: '#1aae39',
  catFood: '#dd5b00',
  catWork: '#0075de',
  catStudy: '#7b3ff2',
  catOther: '#787671',
};

export const DARK = {
  canvas: '#191919',
  surface: '#252525',
  surfaceSoft: '#1f1f1f',
  charcoal: '#ececec',
  slate: '#aeada9',
  steel: '#888582',
  stone: '#5c5b58',
  muted: '#3d3b38',
  hairline: '#2e2e2e',
  hairlineSoft: '#252525',
  hairlineStrong: '#3a3a3a',
  error: '#ff6b6b',
  catCode: '#7b6ee0',
  catHealth: '#3dc45a',
  catFood: '#f07020',
  catWork: '#2e90f0',
  catStudy: '#9b5ff5',
  catOther: '#888582',
};

export type Colors = typeof LIGHT;

// 後方互換用（静的にC.xxxを使っている箇所向け）
export const C = LIGHT;
