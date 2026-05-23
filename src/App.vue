<script setup lang="ts">
import ControlPanel from './components/ControlPanel.vue';
import PlayGround from './components/PlayGround.vue';

</script>

<template>
  <div class="app-container">
    <ControlPanel/>
    <PlayGround />
  </div>
</template>

<style scoped>
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
