<script setup lang="ts">
import { useMandelBrot } from "@/composables/useMandelBrot";

const {
  centerX,
  centerY,
  viewWidth,
  maxIterationCount,
  extractImageFromCanvas,
  JuliaSetCi,
  JuliaSetCr,
} = useMandelBrot();

function handleUpdateCrAndCi(cr: number, ci: number) {
  JuliaSetCi.value = ci;
  JuliaSetCr.value = cr;
  centerX.value = -0.5;
  centerY.value = 0;
  viewWidth.value = 3;
}

function handleExtractImage() {
  extractImageFromCanvas.value = true;
}
</script>
<template>
  <div class="control-panel">
    <div class="input-container">
      <label for="centerX">Center X</label>
      <input
        type="number"
        name="center-x"
        id="centerX"
        step="0.1"
        v-model.lazy.number="centerX"
      />
    </div>
    <div class="input-container">
      <label for="centerY">Center Y</label>
      <input
        type="number"
        name="center-y"
        id="centerY"
        step="0.1"
        v-model.lazy.number="centerY"
      />
    </div>
    <div class="input-container">
      <label for="viewWidth">View Width</label>
      <input
        type="number"
        name="view-width"
        id="viewWidth"
        step="0.1"
        v-model.lazy.number="viewWidth"
      />
    </div>
    <div class="input-container">
      <label
        for="maxIterationCount"
        title="Higher value means higher precision and sharpness"
        >Max iteration Count</label
      >
      <input
        type="number"
        name="max-iteration-count"
        id="maxIterationCount"
        step="1"
        v-model.lazy.number="maxIterationCount"
      />
    </div>
    <div class="input-container">
      <label for="juliaSetCr">Cr For Julia set</label>
      <input
        type="number"
        name="julia-set-cr"
        id="juliaSetCr"
        step="0.01"
        v-model.lazy.number="JuliaSetCr"
      />
    </div>
    <div class="input-container">
      <label for="juliaSetCi">Ci For Julia set</label>
      <input
        type="number"
        name="julia-set-ci"
        id="juliaSetCi"
        step="0.01"
        v-model.lazy.number="JuliaSetCi"
      />
    </div>
    <div class="input-container">
      <label for="note">Note:</label>
      <button @click="() => handleUpdateCrAndCi(-0.123, 0.745)">
        Please use Cr = -0.123 & Ci = 0.745 for Douady Rabbit
      </button>
      <button @click="() => handleUpdateCrAndCi(0, 0)">
        Please use Cr = 0 & Ci = 0 for Classic Mandelbrot set
      </button>
      <button @click="() => handleUpdateCrAndCi(-0.8, 0.156)">
        Please use Cr = -0.8 & Ci = 0.156 for Classic Julia Set
      </button>
      <button @click="() => handleUpdateCrAndCi(-0.5251993, -0.5251993)">
        Please use Cr = -0.5251993 & Ci = -0.5251993 for Spiral Julia Set
      </button>
      <button @click="() => handleUpdateCrAndCi(-0.75, 0.1)">
        Please use Cr = -0.75 & Ci = 0.1 for Sea Horse Valley
      </button>
    </div>

    <button class="btn" @click="handleExtractImage">Extract Image</button>
    <span class="footer">Developed by Jayant Thakur</span>
  </div>
</template>

<style scoped>
.control-panel {
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0.5rem;
  width: 30%;
  max-height: 100%;
  height: 100%;
  overflow: auto;
  background-color: #2626264a;

  .input-container {
    padding: 0.5rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.25rem;
    border: 1px solid #6c6969ba;
    border-radius: 0.5rem;

    &:focus-within {
      border: 1px solid #262626d7;
    }

    input {
      padding: 0.5rem;
      font-family: sans-serif;
      font-weight: normal;
      font-size: 1rem;
      line-height: 1rem;
      color: #262626;
      width: 100%;
      border: 1px solid #2626268f;
      outline: none;
      border-radius: 0.25rem;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type="number"] {
      appearance: textfield;
      -moz-appearance: textfield;
    }

    label {
      width: 100%;
      overflow: hidden;
      font-size: 1rem;
      line-height: 1.25rem;
      font-family: sans-serif;
      font-weight: bold;
      color: #262626;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    button {
      all: unset;
      box-sizing: border-box;
      cursor: pointer;
      width: 100%;
      padding: 0.25rem 0.125rem;
      &:hover {
        background-color: #6c696960;
      }
    }
  }

  .btn {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    padding: 0.75rem 0.5rem;
    border: 1px solid;
    border-radius: 0.5rem;
    background-color: #262626;
    color: white;
    font-family: sans-serif;
    font-weight: 700;
    font-size: 1rem;
    width: 100%;
    margin-top: 1rem;
    text-align: center;
  }

  .footer {
    margin-top: auto;
    padding-top: 1rem;
    font-family: sans-serif;
    font-size: 0.75rem;
  }
}
</style>
