
import { ContentItem, EffectType } from './types';

export const STORAGE_KEY = 'achievetrack_content_schedule';

export const INITIAL_MOCK_DATA: ContentItem[] = [
  {
    id: '1',
    date: '10 May 2024',
    type: 'Holiday',
    icon: 'https://cdn-icons-png.flaticon.com/512/2550/2550260.png',
    text1: 'Believe in yourself and all that you are.',
    text2: 'Education is the most powerful weapon.',
    text3: 'The future depends on what you do today.',
    effect: EffectType.NONE
  },
  {
    id: '2',
    date: '25 Dec 2024',
    type: 'Festive',
    icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256346.png',
    text1: 'Merry Christmas! Keep shining bright!',
    text2: 'Joy to the world and success to your exams.',
    text3: 'A season of giving and a season of learning.',
    effect: EffectType.SNOW
  }
];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const formatDate = (date: Date): string => {
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

export const parseDateString = (dateStr: string): Date | null => {
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const monthIdx = MONTHS.indexOf(parts[1]);
  const year = parseInt(parts[2]);
  if (isNaN(day) || monthIdx === -1 || isNaN(year)) return null;
  return new Date(year, monthIdx, day);
};
