import { describe, it, expect, beforeAll } from 'vitest';
import {
  parseGazeFlowFromObservation,
  getCoordinatesFromElements,
  createGazeFlowArrow,
} from '../features/gazeFlow';
import { UIElement } from '../../UsabilityTester.type';

describe('GazeFlow', () => {
  // Minimal figma mock for createGazeFlowArrow
  const figmaMock = {
    createVector: () => ({
      name: '',
      strokes: [],
      strokeWeight: 0,
      opacity: 1,
      strokeCap: 'ROUND',
      strokeJoin: 'ROUND',
      fills: [],
      vectorPaths: [],
    }),
  };

  beforeAll(() => {
    (globalThis as any).figma = figmaMock;
  });

  it('관찰 텍스트에서 UI 요소 번호를 순서대로 파싱', () => {
    const observation = '[1] 로고를 먼저 보고, [4] 메인 이미지로 이동한 후, [5] CTA 버튼에 주목합니다.';
    const gazeFlow = parseGazeFlowFromObservation(observation);
    expect(gazeFlow).toEqual([1, 4, 5]);
  });

  it('공백이 있어도 정상 파싱', () => {
    const observation = '[ 1 ] 로고를 보고, [  3] 이동합니다.';
    const gazeFlow = parseGazeFlowFromObservation(observation);
    expect(gazeFlow).toEqual([1, 3]);
  });

  it('연속 중복 번호는 제거', () => {
    const observation = '[1] 먼저 보고, [1] 다시 보고, [2] 이동합니다.';
    const gazeFlow = parseGazeFlowFromObservation(observation);
    expect(gazeFlow).toEqual([1, 2]);
  });

  it('elemList에서 좌표 추출', () => {
    const elemList: UIElement[] = [
      { id: '1', type: 'RECTANGLE', name: 'A', bbox: { x: 10, y: 20, width: 100, height: 50 } },
      { id: '2', type: 'RECTANGLE', name: 'B', bbox: { x: 50, y: 100, width: 200, height: 100 } },
    ];

    const coords = getCoordinatesFromElements([1, 2], elemList, 0, 0);
    expect(coords[0]).toEqual({ x: 60, y: 45 });
    expect(coords[1]).toEqual({ x: 150, y: 150 });
  });

  it('arrow strokeCap은 ROUND', () => {
    const arrow = createGazeFlowArrow(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { arrowColor: { r: 0, g: 0, b: 0 }, minThickness: 2, maxThickness: 4, opacity: 1 }
    );
    expect(arrow.strokeCap).toBe('ROUND');
  });
});
