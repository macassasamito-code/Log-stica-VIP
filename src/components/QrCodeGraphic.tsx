import React from 'react';

interface QrCodeGraphicProps {
  value: string;
  size?: number;
  accentColor?: string;
}

export const QrCodeGraphic: React.FC<QrCodeGraphicProps> = ({
  value,
  size = 136,
  accentColor = '#f59e0b',
}) => {
  // Deterministic 15x15 matrix seeded by value string
  const gridSize = 15;
  const cells: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderArea = (r: number, c: number) => {
    const topLeft = r < 5 && c < 5;
    const topRight = r < 5 && c >= gridSize - 5;
    const bottomLeft = r >= gridSize - 5 && c < 5;
    return topLeft || topRight || bottomLeft;
  };

  const drawFinder = (startR: number, startC: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        cells[startR + r][startC + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, gridSize - 5);
  drawFinder(gridSize - 5, 0);

  let seed = Math.abs(hash);
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isFinderArea(r, c)) continue;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      cells[r][c] = seed % 100 < 48;
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize + 2} ${gridSize + 2}`}
      className="rounded-xl bg-slate-950 p-2 border border-slate-800 shrink-0"
      role="img"
      aria-label={`QR Code de segurança: ${value}`}
    >
      <rect width={gridSize + 2} height={gridSize + 2} fill="#090d16" rx="1.2" />
      {cells.map((row, rIdx) =>
        row.map((active, cIdx) => {
          if (!active) return null;
          const isFinder = isFinderArea(rIdx, cIdx);
          return (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx + 1}
              y={rIdx + 1}
              width={0.86}
              height={0.86}
              rx={0.18}
              fill={isFinder ? accentColor : '#f8fafc'}
            />
          );
        })
      )}
    </svg>
  );
};
