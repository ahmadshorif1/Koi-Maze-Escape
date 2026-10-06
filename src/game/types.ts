export type ControlMode = 'motion' | 'touch' | 'both';

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GameSettings {
  controlMode: ControlMode;
  sensitivity: SensitivityLevel;
  invertX: boolean;
  invertY: boolean;
  shakeEnabled: boolean;
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  vibration: boolean;
  showJoystickOnTouch: boolean;
  playerName?: string;
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  stars: number; // 0 to 3
  bestTime: number | null; // in seconds
  bestScore: number;
  bestMoves: number | null;
}

export interface WallArc {
  ringIndex: number; // 0 = inner boundary, N = outer ring
  startAngle: number; // radians (0 to 2PI)
  endAngle: number; // radians
  isRotating?: boolean;
  rotationSpeed?: number; // rad/sec
}

export interface WallRadial {
  ringIndex: number; // from ring k to ring k+1
  angle: number; // radians
}

export interface CircularMaze {
  ringsCount: number;
  innerRadius: number; // logical units e.g. 80
  outerRadius: number; // logical units e.g. 420
  ringWidth: number;
  arcWalls: WallArc[];
  radialWalls: WallRadial[];
  exits: {
    number: number; // 1 to 6
    angle: number; // angle around outer radius
  }[];
  startPos: { x: number; y: number };
}

export type MazeMaterialTheme =
  | 'wood'
  | 'stone'
  | 'mossy_stone'
  | 'ice'
  | 'crystal'
  | 'coral'
  | 'sandstone'
  | 'temple_gold'
  | 'glowing_magic'
  | 'ebony_wood'
  | 'maple_wood'
  | 'basalt'
  | 'deep_shells'
  | 'jungle_vines'
  | 'obsidian'
  | 'plasma'
  | 'bioluminescent'
  | 'imperial_marble'
  | 'celestial';

export type BackgroundCreature =
  | 'turtle'
  | 'frog'
  | 'butterfly'
  | 'crane'
  | 'dragon'
  | 'firefly'
  | 'penguin'
  | 'dolphin'
  | 'desert_fox'
  | 'spirit'
  | 'lotus_fairy'
  | 'water_sprite'
  | 'ancient_dragon'
  | 'phoenix'
  | 'seahorse'
  | 'koi_companion';

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  worldName: string;
  mazeTheme: MazeMaterialTheme;
  backgroundCreature: BackgroundCreature;
  targetExit: number; // 1 to 6
  ringsCount: number;
  timeLimit: number; // seconds
  playerSpeed: number; // speed scalar
  waterCurrentSpeed?: number;
  rotatingRings?: number[];
  waterColorTop: string;
  waterColorBottom: string;
  accentColor: string;
  description: string;
  hintsAllowed: number;
  isDailyChallenge?: boolean;
  dateString?: string;
}

export interface DailyScoreRecord {
  id: string;
  date: string;
  playerName: string;
  score: number;
  stars: number;
  timeTaken: number;
  moves: number;
  timestamp: number;
}

export interface KoiState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // movement heading direction
  tailPhase: number;
  speed: number;
  radius: number; // collision radius
}

export interface InputVector {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

export type GameState =
  | 'HOME'
  | 'LEVEL_SELECT'
  | 'CALIBRATING'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'LEVEL_FAILED'
  | 'SETTINGS'
  | 'HOW_TO_PLAY'
  | 'DAILY_LEADERBOARD';
