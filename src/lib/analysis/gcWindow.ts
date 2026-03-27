import type { GCWindowPoint } from '../../types/analysis';

export function computeGCWindow(
  seq: string,
  windowSize: number = 100,
  stepSize: number = 10
): GCWindowPoint[] {
  if (seq.length < windowSize) {
    let gc = 0;
    for (let i = 0; i < seq.length; i++) {
      if (seq[i] === 'G' || seq[i] === 'C') gc++;
    }
    return [{ position: 0, gcContent: gc / seq.length }];
  }

  const points: GCWindowPoint[] = [];

  let gc = 0;
  for (let i = 0; i < windowSize; i++) {
    if (seq[i] === 'G' || seq[i] === 'C') gc++;
  }
  points.push({ position: 0, gcContent: gc / windowSize });

  for (let start = stepSize; start + windowSize <= seq.length; start += stepSize) {
    for (let i = start - stepSize; i < start; i++) {
      if (seq[i] === 'G' || seq[i] === 'C') gc--;
    }
    for (let i = start + windowSize - stepSize; i < start + windowSize; i++) {
      if (seq[i] === 'G' || seq[i] === 'C') gc++;
    }
    points.push({ position: start, gcContent: gc / windowSize });
  }

  return points;
}
