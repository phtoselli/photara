<script setup lang="ts">
import { computed } from 'vue'
import type { Dimensions } from '../types'

const props = defineProps<{
  width: number
  height: number
  originalDimensions: Dimensions
  lockAspectRatio: boolean
}>()

const emit = defineEmits<{
  'update:width': [value: number]
  'update:height': [value: number]
  'update:lockAspectRatio': [value: boolean]
  reset: []
  applyPercent: [value: number]
}>()

const scalePercent = computed(() => {
  if (props.originalDimensions.width === 0) return 100
  return Math.round((props.width / props.originalDimensions.width) * 100)
})

const presets = [25, 50, 75, 100, 150, 200]

function onWidthInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value) || 1
  emit('update:width', val)
}

function onHeightInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value) || 1
  emit('update:height', val)
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
          :value="width"
          @input="onWidthInput"
          min="1"
          max="10000"
        />
      </div>

      <button
        class="lock-btn"
        :class="{ active: lockAspectRatio }"
        @click="emit('update:lockAspectRatio', !lockAspectRatio)"
        :title="lockAspectRatio ? 'Desbloquear proporção' : 'Bloquear proporção'"
      >
        <svg v-if="lockAspectRatio" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          :value="height"
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
          @click="emit('applyPercent', p)"
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
        <span class="info-value accent">{{ width }} × {{ height }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resize-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.btn-ghost {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
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
  background: rgba(232, 121, 73, 0.1);
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

.preset-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 6px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.preset-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.info-row {
  display: flex;
  gap: 16px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: var(--surface-sunken);
  border-radius: 8px;
}

.info-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.info-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text-secondary);
}

.info-value.accent {
  color: var(--accent);
}
</style>
