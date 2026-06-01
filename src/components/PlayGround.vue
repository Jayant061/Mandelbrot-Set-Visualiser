<script setup lang="ts">
import { useMandelBrot } from "@/composables/useMandelBrot";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapperRef = ref<HTMLDivElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const resizetimeOutToken = ref<ReturnType<typeof setTimeout> | null>(null);
const {
  centerX,
  centerY,
  viewWidth,
  maxIterationCount,
  iterationCountSurvived,
  extractImageFromCanvas,
  JuliaSetCi,
  JuliaSetCr,
} = useMandelBrot();
const createImageArrayBuffer = ref<ImageData | null>(null);

const panStartX = ref(0);
const panStartY = ref(0);
const isPanning = ref(false);
const isZooming = ref(false);
const animationFrameId = ref(0);

watch(
  [
    centerX,
    centerY,
    viewWidth,
    maxIterationCount,
    isPanning,
    isZooming,
    JuliaSetCi,
    JuliaSetCr,
  ],
  () => {
    if (animationFrameId.value) return;

    animationFrameId.value = requestAnimationFrame(() => {
      animationFrameId.value = 0;
      renderMandelbrot();
    });
  },
);

watch([extractImageFromCanvas], () => {
  if (!extractImageFromCanvas.value) return;
  handlextractImageFromCanvas();
});
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  context.value = canvas.getContext("2d") ?? null;
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
      createImageArrayBuffer.value =
        context.value?.createImageData(width, height) ?? null;
      renderMandelbrot();
    }, 300);
  });
  const canvasWrapper = canvasWrapperRef.value;
  if (canvasWrapper) {
    resizeObserver.value.observe(canvasWrapper);
  }

  globalThis.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("wheel", handleMouseWheel, { passive: false });
});

function renderMandelbrot() {
  const canvas = canvasRef.value;
  const ctx = context.value;
  if (!canvas || !ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  const viewHeight = (viewWidth.value * height) / width;

  const minX = centerX.value - viewWidth.value / 2;
  const maxY = centerY.value + viewHeight / 2;

  const arrayBuffer = createImageArrayBuffer.value;
  if (!arrayBuffer) return;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cr = minX + (x / width) * viewWidth.value;
      const ci = maxY - (y / height) * viewHeight;
      const totalItertionSurvived = iterationCountSurvived(
        cr,
        ci,
        isPanning.value || isZooming.value,
      );
      const index = (y * width + x) * 4;
      const intensity = (totalItertionSurvived / maxIterationCount.value) * 255;

      arrayBuffer.data[index + 0] = intensity * 0.25;
      arrayBuffer.data[index + 1] = intensity * 0.5;
      arrayBuffer.data[index + 2] = intensity * 0.75;
      arrayBuffer.data[index + 3] = 255;
    }
  }

  ctx.putImageData(arrayBuffer, 0, 0);

  updateDynamicFavicon();
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

  const diffX =
    ((panStartX.value - event.offsetX) / canvas.width) * viewWidth.value;

  const viewHeight = (viewWidth.value * canvas.height) / canvas.width;
  const diffY =
    ((event.offsetY - panStartY.value) / canvas.height) * viewHeight;

  centerX.value = centerX.value + diffX;
  panStartX.value = event.offsetX;

  centerY.value = centerY.value + diffY;
  panStartY.value = event.offsetY;
}

function handleMouseUp() {
  isPanning.value = false;
}

const mouseWheelTimeOutToken = ref<ReturnType<typeof setTimeout> | null>(null);

function handleMouseWheel(event: WheelEvent) {
  const currentX = event.offsetX;
  const currentY = event.offsetY;
  const delta = event.deltaY;
  const canvas = canvasRef.value;
  if (!canvas) return;
  if (event.ctrlKey) {
    event.preventDefault();
  }
  const viewWidthOld = viewWidth.value;
  const viewHeightOld = (viewWidthOld * canvas.height) / canvas.width;

  const pixelCenterX = canvas.width / 2;
  const pixelCenterY = canvas.height / 2;

  const ratioX = (currentX - pixelCenterX) / canvas.width;
  const ratioY = (pixelCenterY - currentY) / canvas.height;

  const scalingFactor = delta < 0 ? 0.8 : 1.25;

  const viewWidthNew = viewWidthOld * scalingFactor;
  const viewHeightNew = viewHeightOld * scalingFactor;

  const newCenterX = centerX.value + ratioX * (viewWidthOld - viewWidthNew);
  const newCenterY = centerY.value + ratioY * (viewHeightOld - viewHeightNew);
  isZooming.value = true;
  centerX.value = newCenterX;
  centerY.value = newCenterY;
  viewWidth.value = viewWidthNew;
  if (mouseWheelTimeOutToken.value) {
    clearTimeout(mouseWheelTimeOutToken.value);
  }
  mouseWheelTimeOutToken.value = setTimeout(() => {
    isZooming.value = false;
  }, 100);
}

const lastTouchDistance = ref(0);

function getTouchDistance(t1: Touch, t2: Touch) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

function handleTouchStart(event: TouchEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Single finger → pan
  if (event.touches.length === 1) {
    const touch = event.touches[0]!;
    const rect = canvas.getBoundingClientRect();

    panStartX.value = touch.clientX - rect.left;
    panStartY.value = touch.clientY - rect.top;

    isPanning.value = true;
  }

  // Two fingers → zoom
  if (event.touches.length === 2) {
    lastTouchDistance.value = getTouchDistance(
      event.touches[0]!,
      event.touches[1]!,
    );
  }
}

function handleTouchMove(event: TouchEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();

  // ---------------- PAN ----------------
  if (event.touches.length === 1 && isPanning.value) {
    const touch = event.touches[0]!;

    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    const diffX =
      ((panStartX.value - currentX) / canvas.width) * viewWidth.value;

    const viewHeight = (viewWidth.value * canvas.height) / canvas.width;

    const diffY = ((currentY - panStartY.value) / canvas.height) * viewHeight;

    centerX.value += diffX;
    centerY.value += diffY;

    panStartX.value = currentX;
    panStartY.value = currentY;
  }

  // ---------------- PINCH ZOOM ----------------
  if (event.touches.length === 2) {
    event.preventDefault();

    const touch1 = event.touches[0]!;
    const touch2 = event.touches[1]!;

    const newDistance = getTouchDistance(touch1, touch2);

    const scale = lastTouchDistance.value / newDistance;

    const centerTouchX = (touch1.clientX + touch2.clientX) / 2 - rect.left;

    const centerTouchY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

    const viewWidthOld = viewWidth.value;
    const viewHeightOld = (viewWidthOld * canvas.height) / canvas.width;

    const pixelCenterX = canvas.width / 2;
    const pixelCenterY = canvas.height / 2;

    const ratioX = (centerTouchX - pixelCenterX) / canvas.width;

    const ratioY = (pixelCenterY - centerTouchY) / canvas.height;

    const viewWidthNew = viewWidthOld * scale;

    const viewHeightNew = viewHeightOld * scale;

    centerX.value += ratioX * (viewWidthOld - viewWidthNew);

    centerY.value += ratioY * (viewHeightOld - viewHeightNew);

    viewWidth.value = viewWidthNew;

    lastTouchDistance.value = newDistance;
  }
}

function handleTouchEnd() {
  isPanning.value = false;
}

function handlextractImageFromCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "Mandelbrot-set-visualiser-snapshot.png";
    a.click();
    extractImageFromCanvas.value = false;
  });
}

function updateDynamicFavicon() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // Find or programmatically target your HTML head's icon link
  let link: HTMLLinkElement | null =
    document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  // Set the browser tab icon directly to your live mathematical canvas render!
  link.type = "image/png";
  link.href = canvas.toDataURL("image/png");
}

onBeforeUnmount(() => {
  if (resizetimeOutToken.value) {
    clearTimeout(resizetimeOutToken.value);
  }
  resizeObserver.value?.disconnect();
  globalThis.removeEventListener("mouseup", handleMouseUp);
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = 0;
  }

  canvasRef.value?.removeEventListener("wheel", handleMouseWheel);
});
</script>

<template>
  <div class="playground" ref="canvasWrapperRef">
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></canvas>
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
