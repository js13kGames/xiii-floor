export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

export const createObjectPool = <T>(
  create: () => T,
  reset?: (obj: T) => void,
): {
  free(obj: T): void;
  alloc(): T;
  getSize(): number;
  dispose(): void;
} => {
  const objects: Array<T> = [];
  // let allocCount = 0;
  // let freeCount = 0;
  return {
    free(obj: T) {
      if (reset) reset(obj);
      // freeCount++;
      objects.push(obj);
    },
    alloc(): T {
      if (objects.length > 0) {
        return objects.pop()!;
      }
      // allocCount++;
      return create();
    },
    getSize() {
      return objects.length;
    },
    dispose() {
      objects.length = 0;
    },
  };
};

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function logDebug(...messages: unknown[]): void {
  l.value += [...messages].join(" ") + "\n";
  l.scrollTop = l.scrollHeight;
}
