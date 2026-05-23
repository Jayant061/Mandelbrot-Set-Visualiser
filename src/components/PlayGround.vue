<script setup lang="ts">
import { useMandelBrot } from '@/composables/useMandelBrot';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapperRef = ref<HTMLDivElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const resizetimeOutToken = ref<ReturnType<typeof setTimeout> | null>(null);
const { centerX, centerY, viewWidth, maxIterationCount, iterationCountSurvived, extractImageFromCanvas } = useMandelBrot();
const createImageArrayBuffer = ref<ImageData | null>(null);

const panStartX = ref(0);
const panStartY = ref(0);
const isPanning = ref(false);
const animationFrameId = ref(0);

watch([centerX, centerY, viewWidth, maxIterationCount, isPanning], () => {

    if (animationFrameId.value) return;

    animationFrameId.value = requestAnimationFrame(() => {
        animationFrameId.value = 0;
        renderMandelbrot();
    })
})

watch([extractImageFromCanvas], () => {
    if (!extractImageFromCanvas.value) return;
    handlextractImageFromCanvas();
})
onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    context.value = canvas.getContext('2d') ?? null;
    resizeObserver.value = new ResizeObserver((entries) => {
        if (resizetimeOutToken.value) {
            clearTimeout(resizetimeOutToken.value);
        }
        resizetimeOutToken.value = setTimeout(() => {
            if (!entries.length) return;
            const entry = entries[0]!;
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            canvas.width = width;
            canvas.height = height;
            createImageArrayBuffer.value = context.value?.createImageData(width, height) ?? null;
            renderMandelbrot();
        }, 300);
    })
    const canvasWrapper = canvasWrapperRef.value;
    if (canvasWrapper) {

        resizeObserver.value.observe(canvasWrapper)
    }

    globalThis.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });
})

function renderMandelbrot() {
    const canvas = canvasRef.value;
    const ctx = context.value;
    if (!canvas || !ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const viewHeight = (viewWidth.value * height) / width;

    const minX = centerX.value - viewWidth.value / 2
    const maxY = centerY.value + viewHeight / 2;

    const arrayBuffer = createImageArrayBuffer.value;
    if (!arrayBuffer) return;



    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cr = minX + (x / width) * viewWidth.value;
            const ci = maxY - (y / height) * viewHeight;
            const totalItertionSurvived = iterationCountSurvived(cr, ci, isPanning.value)
            const index = (y * width + x) * 4;
            const intensity = (totalItertionSurvived / maxIterationCount.value) * 255;

            arrayBuffer.data[index + 0] = intensity * 0.25;
            arrayBuffer.data[index + 1] = intensity * 0.5;
            arrayBuffer.data[index + 2] = intensity * 0.75;
            arrayBuffer.data[index + 3] = 255;

        }
    }

    ctx.putImageData(arrayBuffer, 0, 0);

    updateDynamicFavicon()

}



function handleMouseDown(event: MouseEvent) {
    panStartX.value = event.offsetX;
    panStartY.value = event.offsetY;
    isPanning.value = true;
}

function handleMouseMove(event: MouseEvent) {
    if (!isPanning.value) return;
    const canvas = canvasRef.value;
    if (!canvas) return;

    const diffX = ((panStartX.value - event.offsetX) / canvas.width) * viewWidth.value;

    const viewHeight = (viewWidth.value * canvas.height) / canvas.width;
    const diffY = ((event.offsetY - panStartY.value) / canvas.height) * viewHeight;

    centerX.value = centerX.value + diffX;
    panStartX.value = event.offsetX;

    centerY.value = centerY.value + diffY;
    panStartY.value = event.offsetY;

}

function handleMouseUp() {
    isPanning.value = false;
}

function handleMouseWheel(event: WheelEvent) {
    const currentX = event.offsetX;
    const currentY = event.offsetY;
    const delta = event.deltaY;
    const canvas = canvasRef.value;
    if (!canvas) return;
    const viewWidthOld = viewWidth.value;
    const viewHeightOld = (viewWidthOld * canvas.height) / canvas.width;

    const pixelCenterX = canvas.width / 2;
    const pixelCenterY = canvas.height / 2;

    const ratioX = (currentX - pixelCenterX) / canvas.width;
    const ratioY = (pixelCenterY - currentY) / canvas.height;

    const scalingFactor = delta < 0 ? 0.8 : 1.25;

    const viewWidthNew = viewWidthOld * scalingFactor;
    const viewHeightNew = viewHeightOld * scalingFactor;

    const newCenterX = centerX.value + (ratioX * (viewWidthOld - viewWidthNew));
    const newCenterY = centerY.value + (ratioY * (viewHeightOld - viewHeightNew));

    centerX.value = newCenterX;
    centerY.value = newCenterY;
    viewWidth.value = viewWidthNew;

}

function handlextractImageFromCanvas() {
    const canvas = canvasRef.value;
    if (!canvas) return;
    canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = "Mandelbrot-set-visualiser-snapshot.png";
        a.click();
        extractImageFromCanvas.value = false;
    })
}

function updateDynamicFavicon() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    // Find or programmatically target your HTML head's icon link
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");

    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }

    // Set the browser tab icon directly to your live mathematical canvas render!
    link.type = 'image/png';
    link.href = canvas.toDataURL("image/png");
}

onBeforeUnmount(() => {
    if (resizetimeOutToken.value) {
        clearTimeout(resizetimeOutToken.value);
    }
    resizeObserver.value?.disconnect();
    globalThis.removeEventListener('mouseup', handleMouseUp);
    if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
        animationFrameId.value = 0;
    }

    canvasRef.value?.removeEventListener('wheel', handleMouseWheel);
})

</script>

<template>
    <div class="playground" ref="canvasWrapperRef">
        <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove"></canvas>
        <!-- @wheel="handleMouseWheel" -->
    </div>
</template>

<style scoped>
.playground {
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
}

canvas {
    width: 100%;
    height: 100%;
    box-sizing: content-box;
    border: 1px solid black;
}
</style>