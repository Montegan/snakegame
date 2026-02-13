export const DEFAULT_GRID_SIZE = 20;

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function isOutOfBounds(pos, gridSize) {
  return pos.x < 0 || pos.y < 0 || pos.x >= gridSize || pos.y >= gridSize;
}

function hitsBody(head, snake) {
  for (let i = 0; i < snake.length; i += 1) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  return false;
}

export function placeFood(snake, gridSize = DEFAULT_GRID_SIZE, rng = Math.random) {
  const occupied = new Set(snake.map((part) => `${part.x},${part.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
}

export function createInitialState(gridSize = DEFAULT_GRID_SIZE, rng = Math.random) {
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize,
    snake,
    direction: "right",
    queuedDirection: "right",
    food: placeFood(snake, gridSize, rng),
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function canTurn(currentDirection, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return false;
  }

  const current = DIRECTIONS[currentDirection];
  const next = DIRECTIONS[nextDirection];
  return !(current.x + next.x === 0 && current.y + next.y === 0);
}

export function setQueuedDirection(state, nextDirection) {
  if (state.gameOver || !canTurn(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }
  return {
    ...state,
    paused: !state.paused,
  };
}

export function restart(state, rng = Math.random) {
  return createInitialState(state.gridSize, rng);
}

export function step(state, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.queuedDirection;
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  const nextBody = state.snake.slice(0, -1);
  if (isOutOfBounds(nextHead, state.gridSize) || hitsBody(nextHead, nextBody)) {
    return {
      ...state,
      direction,
      gameOver: true,
    };
  }

  const ateFood =
    state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;

  const nextSnake = ateFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...nextBody];

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: ateFood ? placeFood(nextSnake, state.gridSize, rng) : state.food,
    score: ateFood ? state.score + 1 : state.score,
  };
}
