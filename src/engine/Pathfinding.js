/**
 * A* Pathfinding Algorithm
 */

const MAX_NODES = 2000;

function getKey(p) {
  return `${p.x},${p.y}`;
}

function getPoint(key) {
  const [x, y] = key.split(',').map(Number);
  return { x: x || 0, y: y || 0 };
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function findPath(start, end, width, height, isWalkable) {
  const openSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const startKey = getKey(start);
  const endKey = getKey(end);

  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));

  let visited = 0;

  while (openSet.size > 0) {
    if (++visited > MAX_NODES) return [];

    let currentKey = '';
    let lowestF = Infinity;

    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = key;
      }
    }

    if (currentKey === '') break;

    if (currentKey === endKey) {
      const path = [];
      let curr = currentKey;
      while (cameFrom.has(curr)) {
        path.unshift(getPoint(curr));
        curr = cameFrom.get(curr);
      }
      return path; // Returns array of points to walk to, excluding start
    }

    openSet.delete(currentKey);
    const current = getPoint(currentKey);

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const n of neighbors) {
      if (n.x < 0 || n.x >= width || n.y < 0 || n.y >= height) continue;
      // Pass fromX, fromY to check directional blocks if needed
      if (!isWalkable(n.x, n.y, current.x, current.y)) continue;

      const nKey = getKey(n);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + heuristic(n, end));
        if (!openSet.has(nKey)) {
          openSet.add(nKey);
        }
      }
    }
  }

  return [];
}
