<script setup lang="ts">
import { computed } from 'vue'
import type { ExpandPadding, Dimensions } from '../types'

const props = defineProps<{
  padding: ExpandPadding
  fillColor: string
  originalDimensions: Dimensions
  linkSides: boolean
}>()

const emit = defineEmits<{
  'update:padding': [padding: ExpandPadding]
  'update:fillColor': [color: string]
  'update:linkSides': [value: boolean]
  reset: []
}>()

const finalDimensions = computed(() => ({
  width: props.originalDimensions.width + props.padding.left + props.padding.right,
  height: props.originalDimensions.height + props.padding.top + props.padding.bottom,
}))

function updateSide(side: keyof ExpandPadding, value: number) {
  const v = Math.max(0, Math.round(value))
  if (props.linkSides) {
    emit('update:padding', { top: v, right: v, bottom: v, left: v })
  } else {
    emit('update:padding', { ...props.padding, [side]: v })
  }
}

function applyPreset(px: number) {
  emit('update:padding', { top: px, right: px, bottom: px, left: px })
}

const presetColors = [
  '#000000',
  '#ffffff',
  '#1a1a1a',
  '#333333',
  '#666666',
  '#E8794A',
  '#3b82f6',
  '#22c55e',
  '#ef4444',
  '#a855f7',
]

const paddingPresets = [0, 10, 20, 50, 100, 200]
</script>

<template>
  <div class="expand-panel">
    <div class="panel-header">
      <h3>Expandir</h3>
      <button class="btn-ghost" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Resetar
      </button>
    </div>

    <p class="hint">Adicione bordas coloridas ao redor da imagem para expandi-la</p>

    <!-- Visual padding diagram -->
    <div class="padding-diagram">
      <div class="diagram-box">
        <div class="diagram-label top">
          <input
            type="number"
            :value="padding.top"
            @input="updateSide('top', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
        <div class="diagram-middle">
          <div class="diagram-label left">
            <input
              type="number"
              :value="padding.left"
              @input="updateSide('left', parseInt(($event.target as HTMLInputElement).value) || 0)"
              min="0"
            />
          </div>
          <div class="diagram-center" :style="{ backgroundColor: fillColor }">
            <div class="diagram-image">IMG</div>
          </div>
          <div class="diagram-label right">
            <input
              type="number"
              :value="padding.right"
              @input="updateSide('right', parseInt(($event.target as HTMLInputElement).value) || 0)"
              min="0"
            />
          </div>
        </div>
        <div class="diagram-label bottom">
          <input
            type="number"
            :value="padding.bottom"
            @input="updateSide('bottom', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
      </div>
    </div>

    <!-- Link sides toggle -->
    <button
      class="link-btn"
      :class="{ active: linkSides }"
      @click="emit('update:linkSides', !linkSides)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {{ linkSides ? 'Lados vinculados' : 'Lados independentes' }}
    </button>

    <!-- Padding presets -->
    <div class="presets-section">
      <span class="section-label">Predefinições</span>
      <div class="preset-btns">
        <button
          v-for="p in paddingPresets"
          :key="p"
          class="preset-btn"
          :class="{ active: padding.top === p && padding.right === p && padding.bottom === p && padding.left === p }"
          @click="applyPreset(p)"
        >
          {{ p }}px
        </button>
      </div>
    </div>

    <!-- Fill color -->
    <div class="color-section">
      <div class="color-header">
        <span class="section-label">Cor de preenchimento</span>
        <div class="color-current">
          <div class="color-swatch-big" :style="{ backgroundColor: fillColor }" />
          <span class="color-hex">{{ fillColor }}</span>
        </div>
      </div>
      <div class="color-grid">
        <button
          v-for="c in presetColors"
          :key="c"
          class="color-swatch"
          :class="{ active: fillColor === c }"
          :style="{ backgroundColor: c }"
          @click="emit('update:fillColor', c)"
        />
        <label class="color-custom">
          <input
            type="color"
            :value="fillColor"
            @input="emit('update:fillColor', ($event.target as HTMLInputElement).value)"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </label>
      </div>
    </div>

    <!-- Result info -->
    <div class="info-row">
      <div class="info-item">
        <span class="info-label">Original</span>
        <span class="info-value">{{ originalDimensions.width }} × {{ originalDimensions.height }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Expandida</span>
        <span class="info-value accent">{{ finalDimensions.width }} × {{ finalDimensions.height }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.hint {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Padding diagram */
.padding-diagram {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.diagram-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.diagram-middle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.diagram-center {
  width: 80px;
  height: 56px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  transition: background-color 0.2s;
}

.diagram-image {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  opacity: 0.7;
}

.diagram-label input {
  width: 56px;
  padding: 5px 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}

.diagram-label input::-webkit-outer-spin-button,
.diagram-label input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.diagram-label input:focus {
  border-color: var(--accent);
}

/* Link button */
.link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.link-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-secondary);
}

.link-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(232, 121, 73, 0.08);
}

/* Presets */
.presets-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
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
  padding: 6px 12px;
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

/* Color section */
.color-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-current {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch-big {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.color-hex {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.color-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-swatch::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch.active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(232, 121, 73, 0.3);
}

.color-custom {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px dashed var(--border-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.color-custom:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.color-custom input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

/* Info */
.info-row {
  display: flex;
  gap: 12px;
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
