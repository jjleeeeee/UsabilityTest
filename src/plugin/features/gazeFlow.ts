import { UIElement } from '../../UsabilityTester.type';

export interface GazeFlowConfig {
  arrowColor: { r: number; g: number; b: number };
  minThickness: number;
  maxThickness: number;
  opacity: number;
}

// 관찰 텍스트에서 UI 요소 번호([1], [2], ...) 추출
export function parseGazeFlowFromObservation(observation: string): number[] {
  if (!observation) return [];

  const matches = observation.match(/\[\s*(\d+)\s*\]/g) || [];
  const numbers = matches
    .map((m) => parseInt(m.replace(/\[|\]/g, ''), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  // 연속 중복 제거 (시선 흐름 유지)
  const deduped: number[] = [];
  for (const n of numbers) {
    if (deduped[deduped.length - 1] !== n) deduped.push(n);
  }

  return deduped;
}

// elemList에서 좌표 가져오기
export function getCoordinatesFromElements(
  elementNumbers: number[],
  elemList: UIElement[],
  elementStartX: number,
  elementStartY: number
): { x: number; y: number }[] {
  return elementNumbers
    .map((num) => {
      const elem = elemList[num - 1];
      if (!elem) return null;
      return {
        x: elem.bbox.x + elem.bbox.width / 2 + (elementStartX || 0),
        y: elem.bbox.y + elem.bbox.height / 2 + (elementStartY || 0),
      };
    })
    .filter((p): p is { x: number; y: number } => Boolean(p));
}

function computeThickness(
  from: { x: number; y: number },
  to: { x: number; y: number },
  minThickness: number,
  maxThickness: number
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const t = Math.min(1, Math.max(0, distance / 320));
  return minThickness + (maxThickness - minThickness) * t;
}

// 화살표 생성
export function createGazeFlowArrow(
  from: { x: number; y: number },
  to: { x: number; y: number },
  config: GazeFlowConfig
): VectorNode {
  const arrow = figma.createVector();
  arrow.name = `gazeArrow_${Math.round(from.x)}_${Math.round(from.y)}_${Math.round(to.x)}_${Math.round(to.y)}`;

  // Bézier curve 경로 계산
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const controlPoint = {
    x: (from.x + to.x) / 2 + nx * 30,
    y: (from.y + to.y) / 2 + ny * 30,
  };

  arrow.vectorPaths = [
    {
      windingRule: 'NONZERO',
      data: `M ${from.x} ${from.y} Q ${controlPoint.x} ${controlPoint.y} ${to.x} ${to.y}`,
    },
  ];

  arrow.strokes = [{ type: 'SOLID', color: config.arrowColor }];
  arrow.strokeWeight = computeThickness(from, to, config.minThickness, config.maxThickness);
  arrow.opacity = config.opacity;
  arrow.strokeCap = 'ROUND';
  arrow.strokeJoin = 'ROUND';
  arrow.fills = [];

  return arrow;
}
