import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameSettings,
  LevelProgress,
  KoiState,
  LevelConfig,
  DailyScoreRecord,
} from './game/types';
import { GAME_LEVELS } from './game/levels';
import {
  getTodayDateString,
  generateDailyLevelConfig,
  getDailyLeaderboard,
  saveDailyScore,
} from './game/dailyChallenge';
import { sensorManager } from './game/sensorManager';
import { koiPhysics } from './game/physics';
import { soundManager } from './game/audio';

import { GameCanvas } from './game/GameCanvas';
import { HomeScreen } from './components/HomeScreen';
import { HUD } from './components/HUD';
import { VirtualJoystick } from './components/VirtualJoystick';
import { LevelSelect } from './components/LevelSelect';
import { CalibrationModal } from './components/CalibrationModal';
import { PauseModal } from './components/PauseModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelFailedModal } from './components/LevelFailedModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { DailyLeaderboardModal } from './components/DailyLeaderboardModal';

const DEFAULT_SETTINGS: GameSettings = {
  controlMode: 'both',
  sensitivity: 'MEDIUM',
  invertX: false,
  invertY: false,
  shakeEnabled: false,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  vibration: true,
  showJoystickOnTouch: true,
  playerName: 'MasterKoi',
};

export default function App() {
  // Game Navigation State
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [currentLevelId, setCurrentLevelId] = useState(1);

  // Daily Challenge State
  const [isPlayingDaily, setIsPlayingDaily] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState(() => getTodayDateString());
  const [dailyConfig, setDailyConfig] = useState<LevelConfig>(() =>
    generateDailyLevelConfig(todayDateStr)
  );
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyScoreRecord[]>(() =>
    getDailyLeaderboard(todayDateStr)
  );

  // Active level config during gameplay (campaign or daily)
  const activeLevelConfig: LevelConfig = isPlayingDaily
    ? dailyConfig
    : GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];

  // Settings & Progress Persistence
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('koi_maze_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [progressList, setProgressList] = useState<LevelProgress[]>(() => {
    try {
      const saved = localStorage.getItem('koi_maze_progress');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback initial progress
    }
    return GAME_LEVELS.map((lvl) => ({
      levelId: lvl.id,
      unlocked: lvl.id === 1,
      stars: 0,
      bestTime: null,
      bestScore: 0,
      bestMoves: null,
    }));
  });

  // Gameplay Live State
  const [koiState, setKoiState] = useState<KoiState>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    tailPhase: 0,
    speed: 0,
    radius: 14,
  });

  const [timeRemaining, setTimeRemaining] = useState(120);
  const [movesCount, setMovesCount] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showHintPath, setShowHintPath] = useState(false);
  const [failReason, setFailReason] = useState<'timeout' | 'wrong_exit'>('timeout');

  // Completion stats
  const [lastCompletedStats, setLastCompletedStats] = useState({
    stars: 3,
    timeTaken: 0,
    moves: 0,
    score: 1000,
  });

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(false);

  // Refresh daily config if date changes
  useEffect(() => {
    const today = getTodayDateString();
    if (today !== todayDateStr) {
      setTodayDateStr(today);
      setDailyConfig(generateDailyLevelConfig(today));
      setDailyLeaderboard(getDailyLeaderboard(today));
    }
  }, [todayDateStr]);

  // Save Settings to LocalStorage
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('koi_maze_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      soundManager.setVolumes(updated.sfxVolume, updated.musicVolume);
      return updated;
    });
  }, []);

  // Save Progress
  const saveProgress = useCallback(
    (levelId: number, stars: number, timeTaken: number, moves: number, score: number) => {
      if (isPlayingDaily) return; // Daily scores handled separately

      setProgressList((prev) => {
        const updated = prev.map((item) => {
          if (item.levelId === levelId) {
            return {
              ...item,
              stars: Math.max(item.stars, stars),
              bestScore: Math.max(item.bestScore, score),
              bestTime: item.bestTime === null ? timeTaken : Math.min(item.bestTime, timeTaken),
              bestMoves: item.bestMoves === null ? moves : Math.min(item.bestMoves, moves),
            };
          }
          // Unlock next level
          if (item.levelId === levelId + 1) {
            return { ...item, unlocked: true };
          }
          return item;
        });

        try {
          localStorage.setItem('koi_maze_progress', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [isPlayingDaily]
  );

  // Start / Init Level (Campaign or Daily)
  const initLevel = useCallback(
    (levelId: number, isDaily = false) => {
      setIsPlayingDaily(isDaily);
      const config = isDaily
        ? dailyConfig
        : GAME_LEVELS.find((l) => l.id === levelId) || GAME_LEVELS[0];

      if (!isDaily) {
        setCurrentLevelId(levelId);
      }

      setTimeRemaining(config.timeLimit);
      setMovesCount(0);
      setHintsRemaining(config.hintsAllowed);
      setShowHintPath(false);

      koiPhysics.reset(0, 0);
      setKoiState(koiPhysics.getKoi());
    },
    [dailyConfig]
  );

  // Start Playing Flow (Campaign)
  const handlePlayClicked = useCallback(async () => {
    soundManager.playClick();
    soundManager.startAmbientBGM();

    const granted = await sensorManager.requestMotionPermission();
    if (granted) {
      setGameState('CALIBRATING');
    } else {
      initLevel(currentLevelId, false);
      setGameState('PLAYING');
    }
  }, [currentLevelId, initLevel]);

  // Start Playing Flow (Daily Challenge)
  const handleStartDailyChallenge = useCallback(async () => {
    soundManager.playClick();
    soundManager.startAmbientBGM();

    const granted = await sensorManager.requestMotionPermission();
    if (granted) {
      setIsPlayingDaily(true);
      setGameState('CALIBRATING');
    } else {
      initLevel(9999, true);
      setGameState('PLAYING');
    }
  }, [initLevel]);

  const handleCalibrateAndStart = useCallback(() => {
    soundManager.playClick();
    sensorManager.calibrate();
    initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
    setGameState('PLAYING');
  }, [currentLevelId, isPlayingDaily, initLevel]);

  const handleSkipToTouch = useCallback(() => {
    soundManager.playClick();
    initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
    setGameState('PLAYING');
  }, [currentLevelId, isPlayingDaily, initLevel]);

  // Main 60 FPS Game Physics & Input Loop
  const lastTimeRef = useRef(performance.now());
  const timerAccRef = useRef(0);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;

    const gameLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Update timer every second
      timerAccRef.current += dt;
      if (timerAccRef.current >= 1.0) {
        timerAccRef.current -= 1.0;
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time out!
            setFailReason('timeout');
            setGameState('LEVEL_FAILED');
            soundManager.playWrongExit();
            return 0;
          }
          return prev - 1;
        });
      }

      // Read Input & Update Physics
      const input = sensorManager.updateAndGetInput(settings, dt);
      const updateResult = koiPhysics.update(input, activeLevelConfig, dt, settings.vibration);

      setKoiState(updateResult.state);
      setMovesCount(updateResult.moves);

      // Check Exit Reached
      if (updateResult.exitReached !== null) {
        if (updateResult.exitReached === activeLevelConfig.targetExit) {
          // 🎉 CORRECT TARGET EXIT REACHED!
          soundManager.playLevelWin();
          soundManager.triggerHaptic('success', settings.vibration);

          const timeTaken = activeLevelConfig.timeLimit - timeRemaining;

          // Calculate Star Rating
          let starsEarned = 1;
          if (timeTaken <= activeLevelConfig.timeLimit * 0.5) starsEarned = 3;
          else if (timeTaken <= activeLevelConfig.timeLimit * 0.75) starsEarned = 2;

          const baseScore = 1000;
          const timeBonus = Math.max(0, timeRemaining * 10);
          const movePenalty = updateResult.moves * 5;
          const score = Math.max(100, baseScore + timeBonus - movePenalty);

          setLastCompletedStats({
            stars: starsEarned,
            timeTaken,
            moves: updateResult.moves,
            score,
          });

          if (isPlayingDaily) {
            // Save Daily Leaderboard Score
            const record: DailyScoreRecord = {
              id: `player_${Date.now()}`,
              date: todayDateStr,
              playerName: settings.playerName || 'MasterKoi',
              score,
              stars: starsEarned,
              timeTaken,
              moves: updateResult.moves,
              timestamp: Date.now(),
            };
            const updatedLeaderboard = saveDailyScore(record);
            setDailyLeaderboard(updatedLeaderboard);
          } else {
            saveProgress(currentLevelId, starsEarned, timeTaken, updateResult.moves, score);
          }

          setGameState('LEVEL_COMPLETE');
          return;
        } else {
          // WRONG EXIT REACHED
          soundManager.playWrongExit();
          soundManager.triggerHaptic('warning', settings.vibration);
          setFailReason('wrong_exit');
          setGameState('LEVEL_FAILED');
          return;
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    gameState,
    activeLevelConfig,
    timeRemaining,
    settings,
    currentLevelId,
    isPlayingDaily,
    todayDateStr,
    saveProgress,
  ]);

  // Recenter Motion Tilt
  const handleRecenter = useCallback(() => {
    sensorManager.calibrate();
    soundManager.playClick();
  }, []);

  // Hint Trigger
  const handleTriggerHint = useCallback(() => {
    if (hintsRemaining > 0) {
      setHintsRemaining((prev) => prev - 1);
      setShowHintPath(true);
      soundManager.playHintSound();

      setTimeout(() => {
        setShowHintPath(false);
      }, 4000);
    }
  }, [hintsRemaining]);

  const totalStarsCount = progressList.reduce((acc, p) => acc + p.stars, 0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none">
      {/* Game Canvas Board Background */}
      {(gameState === 'PLAYING' ||
        gameState === 'PAUSED' ||
        gameState === 'LEVEL_COMPLETE' ||
        gameState === 'LEVEL_FAILED') && (
        <GameCanvas
          levelConfig={activeLevelConfig}
          koiState={koiState}
          showHintPath={showHintPath}
        />
      )}

      {/* Touch Virtual Joystick Fallback */}
      {gameState === 'PLAYING' &&
        (settings.controlMode === 'touch' || settings.controlMode === 'both') && (
          <VirtualJoystick
            onMove={(x, y) => sensorManager.setTouchInput(x, y)}
            onEnd={() => sensorManager.setTouchInput(0, 0)}
          />
        )}

      {/* Top HUD Controls Header */}
      {gameState === 'PLAYING' && (
        <HUD
          levelConfig={activeLevelConfig}
          timeRemaining={timeRemaining}
          movesCount={movesCount}
          hintsRemaining={hintsRemaining}
          isMuted={isMuted}
          onToggleMute={() => {
            setIsMuted(!isMuted);
            soundManager.setVolumes(isMuted ? 0.8 : 0, isMuted ? 0.5 : 0);
          }}
          onPause={() => {
            soundManager.playClick();
            setGameState('PAUSED');
          }}
          onHint={handleTriggerHint}
          onRecenter={handleRecenter}
          onRestart={() => {
            soundManager.playClick();
            initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
            setGameState('PLAYING');
          }}
        />
      )}

      {/* Screens & Modals Overlays */}
      {gameState === 'HOME' && (
        <HomeScreen
          onPlay={handlePlayClicked}
          onDailyChallenge={() => {
            soundManager.playClick();
            setGameState('DAILY_LEADERBOARD');
          }}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onSettings={() => setGameState('SETTINGS')}
          currentLevelId={currentLevelId}
          totalStars={totalStarsCount}
        />
      )}

      {gameState === 'DAILY_LEADERBOARD' && (
        <DailyLeaderboardModal
          dailyConfig={dailyConfig}
          leaderboard={dailyLeaderboard}
          todayDateStr={todayDateStr}
          onPlayDaily={handleStartDailyChallenge}
          onBack={() => setGameState('HOME')}
        />
      )}

      {gameState === 'CALIBRATING' && (
        <CalibrationModal
          onCalibrate={handleCalibrateAndStart}
          onSkipToTouch={handleSkipToTouch}
        />
      )}

      {gameState === 'LEVEL_SELECT' && (
        <LevelSelect
          progressList={progressList}
          onSelectLevel={(id) => {
            soundManager.playClick();
            initLevel(id, false);
            setGameState('PLAYING');
          }}
          onBack={() => setGameState('HOME')}
        />
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => setGameState('PLAYING')}
          onRestart={() => {
            initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
            setGameState('PLAYING');
          }}
          onLevelSelect={() => setGameState('LEVEL_SELECT')}
          onSettings={() => setGameState('SETTINGS')}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
        />
      )}

      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          levelId={isPlayingDaily ? 9999 : currentLevelId}
          stars={lastCompletedStats.stars}
          timeTaken={lastCompletedStats.timeTaken}
          moves={lastCompletedStats.moves}
          score={lastCompletedStats.score}
          isLastLevel={isPlayingDaily || currentLevelId >= GAME_LEVELS.length}
          onNextLevel={() => {
            soundManager.playClick();
            if (isPlayingDaily) {
              setGameState('DAILY_LEADERBOARD');
            } else {
              const nextId = currentLevelId + 1;
              if (nextId <= GAME_LEVELS.length) {
                initLevel(nextId, false);
                setGameState('PLAYING');
              } else {
                setGameState('LEVEL_SELECT');
              }
            }
          }}
          onReplay={() => {
            soundManager.playClick();
            initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
            setGameState('PLAYING');
          }}
          onLevelSelect={() =>
            setGameState(isPlayingDaily ? 'DAILY_LEADERBOARD' : 'LEVEL_SELECT')
          }
        />
      )}

      {gameState === 'LEVEL_FAILED' && (
        <LevelFailedModal
          reason={failReason}
          targetExit={activeLevelConfig.targetExit}
          onTryAgain={() => {
            soundManager.playClick();
            initLevel(isPlayingDaily ? 9999 : currentLevelId, isPlayingDaily);
            setGameState('PLAYING');
          }}
          onLevelSelect={() =>
            setGameState(isPlayingDaily ? 'DAILY_LEADERBOARD' : 'LEVEL_SELECT')
          }
        />
      )}

      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onRecenter={handleRecenter}
          onClose={() => setGameState('HOME')}
        />
      )}

      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setGameState('HOME')} />
      )}
    </div>
  );
}
