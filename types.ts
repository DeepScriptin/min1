
export enum EffectType {
  NONE = 'None',
  SNOW = 'Snow',
  CONFETTI = 'Confetti',
  FIREWORKS = 'Fireworks'
}

export interface ContentItem {
  id: string;
  date: string; // Format: d Mmm yyyy
  type: string;
  icon: string; // Hyperlink or Base64
  text1: string;
  text2: string;
  text3: string;
  effect: EffectType;
  themeColor?: string;
}

export interface User {
  username: string;
  role: 'student' | 'admin';
}
