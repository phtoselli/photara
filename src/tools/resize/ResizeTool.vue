<script setup lang="ts">
import { computed } from 'vue'
import type { ResizeState } from './resize.types'
import type { IToolPanelProps, IToolPanelEmits } from '../core/tool.types'

const props = defineProps<IToolPanelProps<ResizeState>>()
const emit = defineEmits<IToolPanelEmits<ResizeState>>()

const scalePercent = computed(() => {
  if (props.originalDimensions.width === 0) return 100
  return Math.round((props.state.width / props.originalDimensions.width) * 100)
})

const presets = [25, 50, 75, 100, 150, 200]

function updateWidth(w: number) {
  const newWidth = Math.max(1, Math.round(w))
  let newHeight = props.state.height

  if (props.state.lockAspectRatio) {
    newHeight = Math.max(1, Math.round(newWidth / props.state.aspectRatio))
  }

  emit('update:state', {
    ...props.state,
    width: newWidth,
    height: newHeight,
  })
}

function updateHeight(h: number) {
  const newHeight = Math.max(1, Math.round(h))
  let newWidth = props.state.width

  if (props.state.lockAspectRatio) {
    newWidth = Math.max(1, Math.round(newHeight * props.state.aspectRatio))
  }

  emit('update:state', {
    ...props.state,
    width: newWidth,
    height: newHeight,
  })
}

function toggleLock() {
  emit('update:state', {
    ...props.state,
    lockAspectRatio: !props.state.lockAspectRatio,
  })
}

function applyPercent(percent: number) {
  const w = Math.round(props.originalDimensions.width * percent / 100)
  const h = Math.round(props.originalDimensions.height * percent / 100)

  emit('update:state', {
    ...props.state,
    width: Math.max(1, w),
    height: Math.max(1, h),
  })
}

function onWidthInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value) || 1
  updateWidth(val)
}

function onHeightInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value) || 1
  updateHeight(val)
}
</script>

<template>
  <div class="resize-panel">
    <div class="panel-header">
      <h3>Redimensionar</h3>
      <button class="btn-ghost" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Resetar
      </button>
    </div>

    <div class="dimensions-row">
      <div class="dim-field">
        <label>Largura <span class="unit">px</span></label>
        <input
          type="number"
          :value="state.width"
          @input="onWidthInput"
          min="1"
          max="10000"
        />
      </div>

      <button
        class="lock-btn"
        :class="{ active: state.lockAspectRatio }"
        @click="toggleLock"
        :title="state.lockAspectRatio ? 'Desbloquear proporção' : 'Bloquear proporção'"
      >
        <svg v-if="state.lockAspectRatio" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      </button>

      <div class="dim-field">
        <label>Altura <span class="unit">px</span></label>
        <input
          type="number"
          :value="state.height"
          @input="onHeightInput"
          min="1"
          max="10000"
        />
      </div>
    </div>

    <div class="scale-indicator">
      <span class="scale-label">Escala atual</span>
      <span class="scale-value">{{ scalePercent }}%</span>
    </div>

    <div class="presets">
      <span class="presets-label">Predefinições</span>
      <div class="preset-btns">
        <button
          v-for="p in presets"
          :key="p"
          class="preset-btn"
          :class="{ active: scalePercent === p }"
          @click="applyPercent(p)"
        >
          {{ p }}%
        </button>
      </div>
    </div>

    <div class="info-row">
      <div class="info-item">
        <span class="info-label">Original</span>
        <span class="info-value">{{ originalDimensions.width }} × {{ originalDimensions.height }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Novo</span>
        <span class="info-value accent">{{ state.width }} × {{ state.height }}</span>
      </div>
    </div>
  </div>
</template>

<style src="../core/tool-shared.css"></style>

<style scoped>
.resize-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dimensions-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.dim-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dim-field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.dim-field .unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  opacity: 0.6;
}

.dim-field input {
  width: 100%;
  padding: 10px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}

.dim-field input::-webkit-outer-spin-button,
.dim-field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dim-field input:focus {
  border-color: var(--accent);
}

.lock-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0;
}

.lock-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

.lock-btn:hover {
  border-color: var(--text-muted);
}

.scale-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--surface-sunken);
  border-radius: 8px;
}

.scale-label {
  font-size: 12px;
  color: var(--text-muted);
}

.scale-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent);
}

.presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.presets-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}
</style>
