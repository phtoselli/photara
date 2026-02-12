<script setup lang="ts">
import { computed } from 'vue'
import type { ExpandState, ExpandPadding } from './expand.types'
import type { IToolPanelProps, IToolPanelEmits } from '../core/tool.types'

const props = defineProps<IToolPanelProps<ExpandState>>()
const emit = defineEmits<IToolPanelEmits<ExpandState>>()

const finalDimensions = computed(() => ({
  width: props.originalDimensions.width + props.state.padding.left + props.state.padding.right,
  height: props.originalDimensions.height + props.state.padding.top + props.state.padding.bottom,
}))

function updateSide(side: keyof ExpandPadding, value: number) {
  const v = Math.max(0, Math.round(value))
  if (props.state.linkSides) {
    emit('update:state', {
      ...props.state,
      padding: { top: v, right: v, bottom: v, left: v }
    })
  } else {
    emit('update:state', {
      ...props.state,
      padding: { ...props.state.padding, [side]: v }
    })
  }
}

function applyPreset(px: number) {
  emit('update:state', {
    ...props.state,
    padding: { top: px, right: px, bottom: px, left: px }
  })
}

function updateFillColor(color: string) {
  emit('update:state', {
    ...props.state,
    fillColor: color
  })
}

function toggleLinkSides() {
  emit('update:state', {
    ...props.state,
    linkSides: !props.state.linkSides
  })
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
            :value="state.padding.top"
            @input="updateSide('top', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
        <div class="diagram-middle">
          <div class="diagram-label left">
            <input
              type="number"
              :value="state.padding.left"
              @input="updateSide('left', parseInt(($event.target as HTMLInputElement).value) || 0)"
              min="0"
            />
          </div>
          <div class="diagram-center" :style="{ backgroundColor: state.fillColor }">
            <div class="diagram-image">IMG</div>
          </div>
          <div class="diagram-label right">
            <input
              type="number"
              :value="state.padding.right"
              @input="updateSide('right', parseInt(($event.target as HTMLInputElement).value) || 0)"
              min="0"
            />
          </div>
        </div>
        <div class="diagram-label bottom">
          <input
            type="number"
            :value="state.padding.bottom"
            @input="updateSide('bottom', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
      </div>
    </div>

    <!-- Link sides toggle -->
    <button
      class="link-btn"
      :class="{ active: state.linkSides }"
      @click="toggleLinkSides"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      {{ state.linkSides ? 'Lados vinculados' : 'Lados independentes' }}
    </button>

    <!-- Padding presets -->
    <div class="presets-section">
      <span class="section-label">Predefinições</span>
      <div class="preset-btns">
        <button
          v-for="p in paddingPresets"
          :key="p"
          class="preset-btn"
          :class="{ active: state.padding.top === p && state.padding.right === p && state.padding.bottom === p && state.padding.left === p }"
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
          <div class="color-swatch-big" :style="{ backgroundColor: state.fillColor }" />
          <span class="color-hex">{{ state.fillColor }}</span>
        </div>
      </div>
      <div class="color-grid">
        <button
          v-for="c in presetColors"
          :key="c"
          class="color-swatch"
          :class="{ active: state.fillColor === c }"
          :style="{ backgroundColor: c }"
          @click="updateFillColor(c)"
        />
        <label class="color-custom">
          <input
            type="color"
            :value="state.fillColor"
            @input="updateFillColor(($event.target as HTMLInputElement).value)"
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

<style src="../core/tool-shared.css"></style>

<style scoped>
.expand-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  background: var(--accent-dim);
}

/* Presets */
.presets-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Color section */
.color-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
