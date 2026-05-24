import { ref } from "vue";

const centerX = ref<number>(-0.5);
const centerY = ref<number>(0);
const viewWidth = ref<number>(3);
const maxIterationCount = ref<number>(100);
const extractImageFromCanvas = ref(false);
const JuliaSetCr = ref(0);
const JuliaSetCi = ref(0);

function iterationCountSurvived(
  cr: number,
  ci: number,
  isZoomingOrPanning = false,
): number {
  let zr = 0;
  let zi = 0;

  if (JuliaSetCr.value !== 0 || JuliaSetCi.value !== 0) {
    zr = cr;
    zi = ci
    cr = JuliaSetCr.value;
    ci = JuliaSetCi.value;
  }
  const iterationCount = isZoomingOrPanning ? Math.max(0.2*maxIterationCount.value,100) : maxIterationCount.value;

  for (let i = 0; i < iterationCount; i++) {
    const newZr = zr * zr - zi * zi + cr;
    const newZi = 2 * zr * zi + ci;
    if (newZr * newZr + newZi * newZi > 4) {
      return i + 1;
    }
    zr = newZr;
    zi = newZi;
  }
  return maxIterationCount.value;
}

export function useMandelBrot() {
  return {
    centerX,
    centerY,
    viewWidth,
    maxIterationCount,
    extractImageFromCanvas,
    iterationCountSurvived,
    JuliaSetCr,
    JuliaSetCi
  };
}
