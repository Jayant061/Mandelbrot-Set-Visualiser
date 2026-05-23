import { ref } from "vue";

const centerX = ref<number>(-0.5);
const centerY = ref<number>(0);
const viewWidth = ref<number>(3);
const maxIterationCount = ref<number>(100);
const extractImageFromCanvas = ref(false);

function iterationCountSurvived(cr: number, ci: number, isPanning = false): number {
    let zr = 0;
    let zi = 0;
    const iterationCount = isPanning ? 0.5 * maxIterationCount.value : maxIterationCount.value;

    for (let i = 0; i < iterationCount; i++) {
        const newZr = (zr * zr) - (zi * zi) + cr;
        const newZi = 2 * zr * zi + ci;
        if (((newZr * newZr) + (newZi * newZi)) > 4) {
            return i + 1;
        }
        zr = newZr;
        zi = newZi;
    }
    return maxIterationCount.value;
}

export function useMandelBrot() {
    return { centerX, centerY, viewWidth, maxIterationCount, extractImageFromCanvas, iterationCountSurvived }
}