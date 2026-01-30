import { useState, useEffect } from 'react';
import { GameTile } from './GameTile';

type Grid = number[][];

const GRID_SIZE = 4;

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(() => initializeGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bestScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function initializeGrid(): Grid {
    const newGrid: Grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  }

  function addRandomTile(grid: Grid) {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  // 한 행을 왼쪽으로 이동 및 합치기
  function slideRow(row: number[]): { row: number[]; points: number } {
    // 0이 아닌 숫자만 추출
    let arr = row.filter(val => val !== 0);
    let points = 0;

    // 같은 숫자 합치기
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        points += arr[i];
        arr[i + 1] = 0;
      }
    }

    // 다시 0 제거
    arr = arr.filter(val => val !== 0);

    // 빈 공간 채우기
    while (arr.length < GRID_SIZE) {
      arr.push(0);
    }

    return { row: arr, points };
  }

  function moveLeft(grid: Grid): { newGrid: Grid; moved: boolean; points: number } {
    const newGrid: Grid = [];
    let totalPoints = 0;
    let moved = false;

    for (let i = 0; i < GRID_SIZE; i++) {
      const { row, points } = slideRow(grid[i]);
      newGrid.push(row);
      totalPoints += points;

      // 행이 변경되었는지 확인
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] !== row[j]) {
          moved = true;
        }
      }
    }

    return { newGrid, moved, points: totalPoints };
  }

  function moveRight(grid: Grid): { newGrid: Grid; moved: boolean; points: number } {
    const newGrid: Grid = [];
    let totalPoints = 0;
    let moved = false;

    for (let i = 0; i < GRID_SIZE; i++) {
      const reversed = [...grid[i]].reverse();
      const { row, points } = slideRow(reversed);
      const finalRow = row.reverse();
      newGrid.push(finalRow);
      totalPoints += points;

      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] !== finalRow[j]) {
          moved = true;
        }
      }
    }

    return { newGrid, moved, points: totalPoints };
  }

  function moveUp(grid: Grid): { newGrid: Grid; moved: boolean; points: number } {
    const newGrid: Grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    let totalPoints = 0;
    let moved = false;

    // 각 열을 행처럼 처리
    for (let j = 0; j < GRID_SIZE; j++) {
      const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
      const { row, points } = slideRow(column);
      totalPoints += points;

      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i][j] = row[i];
        if (grid[i][j] !== row[i]) {
          moved = true;
        }
      }
    }

    return { newGrid, moved, points: totalPoints };
  }

  function moveDown(grid: Grid): { newGrid: Grid; moved: boolean; points: number } {
    const newGrid: Grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    let totalPoints = 0;
    let moved = false;

    // 각 열을 아래에서 위로 처리
    for (let j = 0; j < GRID_SIZE; j++) {
      const column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
      const reversed = column.reverse();
      const { row, points } = slideRow(reversed);
      const finalColumn = row.reverse();
      totalPoints += points;

      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i][j] = finalColumn[i];
        if (grid[i][j] !== finalColumn[i]) {
          moved = true;
        }
      }
    }

    return { newGrid, moved, points: totalPoints };
  }

  function handleMove(direction: 'left' | 'right' | 'up' | 'down') {
    if (gameOver) return;

    let result: { newGrid: Grid; moved: boolean; points: number };

    switch (direction) {
      case 'left':
        result = moveLeft(grid);
        break;
      case 'right':
        result = moveRight(grid);
        break;
      case 'up':
        result = moveUp(grid);
        break;
      case 'down':
        result = moveDown(grid);
        break;
    }

    if (result.moved) {
      addRandomTile(result.newGrid);
      setGrid(result.newGrid);

      const newScore = score + result.points;
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('bestScore', newScore.toString());
      }

      // 2048 달성 확인
      if (!won) {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (result.newGrid[i][j] === 2048) {
              setWon(true);
              break;
            }
          }
        }
      }

      // 게임 오버 확인
      if (isGameOver(result.newGrid)) {
        setGameOver(true);
      }
    }
  }

  function isGameOver(grid: Grid): boolean {
    // 빈 칸이 있으면 게임 계속
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return false;
      }
    }

    // 합칠 수 있는 타일이 있는지 확인
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = grid[i][j];
        // 오른쪽 확인
        if (j < GRID_SIZE - 1 && current === grid[i][j + 1]) return false;
        // 아래 확인
        if (i < GRID_SIZE - 1 && current === grid[i + 1][j]) return false;
      }
    }

    return true;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        switch (e.key) {
          case 'ArrowLeft':
            handleMove('left');
            break;
          case 'ArrowRight':
            handleMove('right');
            break;
          case 'ArrowUp':
            handleMove('up');
            break;
          case 'ArrowDown':
            handleMove('down');
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  function resetGame() {
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-[#7e22ce] mb-4">도히가 만든 2048</h1>
        <p className="text-[#6b21a8] mb-4">키보드 화살표 키로 타일을 움직여서 <strong>2048</strong>을 만드세요!</p>
      </div>

      <div className="flex gap-4">
        <div className="bg-[#a855f7] rounded-lg p-4 min-w-[120px]">
          <div className="text-[#e9d5ff] text-sm font-bold uppercase">점수</div>
          <div className="text-white text-2xl font-bold">{score}</div>
        </div>
        <div className="bg-[#a855f7] rounded-lg p-4 min-w-[120px]">
          <div className="text-[#e9d5ff] text-sm font-bold uppercase">최고점수</div>
          <div className="text-white text-2xl font-bold">{bestScore}</div>
        </div>
        <button
          onClick={resetGame}
          className="bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          새 게임
        </button>
      </div>

      <div className="relative">
        <div className="bg-[#a855f7] p-4 rounded-xl">
          <div className="grid grid-cols-4 gap-4">
            {grid.map((row, i) =>
              row.map((cell, j) => (
                <div key={`${i}-${j}`} className="w-24 h-24">
                  <GameTile value={cell} />
                </div>
              ))
            )}
          </div>
        </div>

        {won && (
          <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center pointer-events-auto z-10">
            <div className="text-5xl font-bold text-[#7e22ce] mb-4">승리!</div>
            <div className="text-2xl text-[#6b21a8] mb-6">2048을 달성했습니다!</div>
            <button
              onClick={() => setWon(false)}
              className="bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold py-3 px-6 rounded-lg transition-colors mr-2"
            >
              계속하기
            </button>
            <button
              onClick={resetGame}
              className="bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2"
            >
              새 게임
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center pointer-events-auto z-10">
            <div className="text-5xl font-bold text-[#7e22ce] mb-4">게임 종료!</div>
            <div className="text-2xl text-[#6b21a8] mb-6">점수: {score}</div>
            <button
              onClick={resetGame}
              className="bg-[#7e22ce] hover:bg-[#6b21a8] text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              다시 시작
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[#6b21a8] max-w-md">
        <p className="text-sm">
          <strong>게임 방법:</strong> 화살표 키(←↑→↓)로 타일을 움직이세요. 
          같은 숫자의 타일이 만나면 합쳐집니다! (2+2=4, 4+4=8, 8+8=16...)
        </p>
      </div>
    </div>
  );
}