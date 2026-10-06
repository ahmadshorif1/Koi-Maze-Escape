import { LevelConfig, DailyScoreRecord, MazeMaterialTheme, BackgroundCreature } from './types';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatNiceDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Simple seedable PRNG (Mulberry32)
function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 8), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 9999;
}

const MAZE_THEMES: MazeMaterialTheme[] = [
  'wood',
  'stone',
  'mossy_stone',
  'ice',
  'crystal',
  'coral',
  'sandstone',
  'temple_gold',
  'glowing_magic',
  'ebony_wood',
  'maple_wood',
  'basalt',
  'deep_shells',
  'jungle_vines',
  'obsidian',
  'plasma',
  'bioluminescent',
  'imperial_marble',
  'celestial',
];

const CREATURES: BackgroundCreature[] = [
  'turtle',
  'frog',
  'butterfly',
  'crane',
  'dragon',
  'firefly',
  'penguin',
  'dolphin',
  'desert_fox',
  'spirit',
  'lotus_fairy',
  'water_sprite',
  'ancient_dragon',
  'phoenix',
  'seahorse',
  'koi_companion',
];

const WATER_PALETTES = [
  { top: '#0f766e', bottom: '#0369a1', accent: '#38bdf8' },
  { top: '#7e22ce', bottom: '#1e3a8a', accent: '#c084fc' },
  { top: '#047857', bottom: '#0f172a', accent: '#34d399' },
  { top: '#c2410c', bottom: '#18181b', accent: '#fb923c' },
  { top: '#b45309', bottom: '#1e293b', accent: '#f59e0b' },
  { top: '#0369a1', bottom: '#0f172a', accent: '#f43f5e' },
  { top: '#6d28d9', bottom: '#090d16', accent: '#e879f9' },
  { top: '#15803d', bottom: '#020617', accent: '#facc15' },
];

export function generateDailyLevelConfig(dateStr: string = getTodayDateString()): LevelConfig {
  const seed = stringToSeed(dateStr);
  const rand = seededRandom(seed);

  const themeIdx = Math.floor(rand() * MAZE_THEMES.length);
  const creatureIdx = Math.floor(rand() * CREATURES.length);
  const paletteIdx = Math.floor(rand() * WATER_PALETTES.length);

  const targetExit = Math.floor(rand() * 6) + 1; // 1 to 6
  const ringsCount = Math.floor(rand() * 3) + 4; // 4 to 6 rings
  const timeLimit = Math.floor(rand() * 30) + 60; // 60 to 90 seconds
  const playerSpeed = 1.25 + rand() * 0.3; // 1.25 to 1.55

  const palette = WATER_PALETTES[paletteIdx];
  const niceDate = formatNiceDate(dateStr);

  return {
    id: 9999, // Special Daily ID
    title: `Daily Challenge`,
    subtitle: niceDate,
    worldName: `Sanctuary of ${niceDate}`,
    mazeTheme: MAZE_THEMES[themeIdx],
    backgroundCreature: CREATURES[creatureIdx],
    targetExit,
    ringsCount,
    timeLimit,
    playerSpeed,
    waterCurrentSpeed: rand() > 0.5 ? 0.12 : undefined,
    waterColorTop: palette.top,
    waterColorBottom: palette.bottom,
    accentColor: palette.accent,
    description: `Procedural Daily Maze for ${niceDate}! Target Exit: ${targetExit}. Compete on the Global Leaderboard!`,
    hintsAllowed: 2,
    isDailyChallenge: true,
    dateString: dateStr,
  };
}

// Global Leaderboard Storage Helpers
const LEADERBOARD_KEY = 'koi_daily_leaderboards';

const SAMPLE_BOT_NAMES = [
  'AquaMaster',
  'ZenKoi_99',
  'LotusSwimmer',
  'DragonStream',
  'RiverPaddler',
  'GoldenFins',
  'OceanGlider',
  'MysticTide',
  'CrystalPond',
  'WhisperingReef',
];

export function getDailyLeaderboard(dateStr: string = getTodayDateString()): DailyScoreRecord[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const store: Record<string, DailyScoreRecord[]> = raw ? JSON.parse(raw) : {};

    if (store[dateStr] && store[dateStr].length > 0) {
      return store[dateStr].sort((a, b) => b.score - a.score);
    }

    // Seed mock entries if empty for current day
    const seed = stringToSeed(dateStr);
    const rand = seededRandom(seed);
    const mockList: DailyScoreRecord[] = [];

    for (let i = 0; i < 5; i++) {
      const name = SAMPLE_BOT_NAMES[Math.floor(rand() * SAMPLE_BOT_NAMES.length)];
      const score = Math.floor(1100 + rand() * 400);
      const stars = rand() > 0.3 ? 3 : 2;
      const timeTaken = Math.floor(25 + rand() * 25);
      const moves = Math.floor(40 + rand() * 30);

      mockList.push({
        id: `bot_${dateStr}_${i}`,
        date: dateStr,
        playerName: name,
        score,
        stars,
        timeTaken,
        moves,
        timestamp: Date.now() - (i + 1) * 3600000,
      });
    }

    store[dateStr] = mockList;
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(store));
    return mockList.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('Leaderboard load error:', err);
    return [];
  }
}

export function saveDailyScore(record: DailyScoreRecord): DailyScoreRecord[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const store: Record<string, DailyScoreRecord[]> = raw ? JSON.parse(raw) : {};

    const list = store[record.date] || [];

    // Check if player already submitted a score today, update if higher score
    const existingIndex = list.findIndex(
      (r) => r.id === record.id || (r.playerName === record.playerName && r.playerName !== 'Player')
    );

    if (existingIndex >= 0) {
      if (record.score > list[existingIndex].score) {
        list[existingIndex] = record;
      }
    } else {
      list.push(record);
    }

    list.sort((a, b) => b.score - a.score);
    store[record.date] = list.slice(0, 50); // Keep top 50

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(store));
    return store[record.date];
  } catch (err) {
    console.warn('Leaderboard save error:', err);
    return [];
  }
}
