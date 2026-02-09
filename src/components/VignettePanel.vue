<script setup lang="ts">
import { computed } from 'vue'
import type { VignetteSettings, VignetteDirection } from '../types'

const props = defineProps<{
  settings: VignetteSettings
}>()

const emit = defineEmits<{
  'update:settings': [settings: VignetteSettings]
  reset: []
}>()

function update(partial: Partial<VignetteSettings>) {
  emit('update:settings', { ...props.settings, ...partial })
}

const directions: { id: VignetteDirection; label: string; icon: string }[] = [
  {
    id: 'radial',
    label: 'Circular',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" stroke-dasharray="2 2"/></svg>',
  },
  {
    id: 'left',
    label: 'Esquerda',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21" stroke-dasharray="2 2"/></svg>',
  },
  {
    id: 'right',
    label: 'Direita',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21" stroke-dasharray="2 2"/></svg>',
  },
  {
    id: 'top',
    label: 'Topo',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9" stroke-dasharray="2 2"/></svg>',
  },
  {
    id: 'bottom',
    label: 'Base',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="15" x2="21" y2="15" stroke-dasharray="2 2"/></svg>',
  },
]

const presetColors = [
  '#000000',
  '#1a1a2e',
  '#0f0f0f',
  '#1b0a2e',
  '#0a1628',
  '#ffffff',
  '#E8794A',
  '#3b82f6',
]

const miniPreviewStyle = computed(() => {
  const { direction, color, intensity, spread } = props.settings
  const alpha = Math.min(intensity / 100, 1)
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  const colorA = `rgba(${r},${g},${b},${alpha})`
  const colorT = `rgba(${r},${g},${b},0)`

  const pct = Math.max(0, Math.round(100 - spread))

  if (direction === 'radial') {
    return {
      background: `radial-gradient(ellipse at center, ${colorT} ${pct}%, ${colorA} 100%), var(--surface-sunken)`,
    }
  }

  const spreadPct = Math.min(spread, 100)
  const dirMap: Record<string, string> = {
    left: `linear-gradient(to right, ${colorA} 0%, ${colorT} ${spreadPct}%)`,
    right: `linear-gradient(to left, ${colorA} 0%, ${colorT} ${spreadPct}%)`,
    top: `linear-gradient(to bottom, ${colorA} 0%, ${colorT} ${spreadPct}%)`,
    bottom: `linear-gradient(to top, ${colorA} 0%, ${colorT} ${spreadPct}%)`,
  }

  return {
    background: `${dirMap[direction]}, var(--surface-sunken)`,
  }
})
</script>

<template>
  <div class="vignette-panel">
    <div class="panel-header">
      <h3>Vinheta</h3>
      <button class="btn-ghost" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Resetar
      </button>
    </div>

    <p class="hint">Adicione um degradê nas bordas da imagem para criar um efeito de vinheta</p>

    <!-- Direction selector -->
    <div class="section">
      <span class="section-label">Direção</span>
      <div class="direction-grid">
        <button
          v-for="dir in directions"
          :key="dir.id"
          class="direction-btn"
          :class="{ active: settings.direction === dir.id }"
          @click="update({ direction: dir.id })"
        >
          <span class="direction-icon" v-html="dir.icon" />
          <span class="direction-label">{{ dir.label }}</span>
        </button>
      </div>
    </div>

    <!-- Intensity slider -->
    <div class="section">
      <div class="slider-header">
        <span class="section-label">Intensidade</span>
        <span class="slider-value">{{ settings.intensity }}%</span>
      </div>
      <input
        type="range"
        :value="settings.intensity"
        @input="update({ intensity: parseInt(($event.target as HTMLInputElement).value) })"
        min="0"
        max="200"
        class="slider"
      />
      <div class="slider-marks">
        <span>Suave</span>
        <span>Forte</span>
      </div>
    </div>

    <!-- Spread slider -->
    <div class="section">
      <div class="slider-header">
        <span class="section-label">Alcance</span>
        <span class="slider-value">{{ settings.spread }}%</span>
      </div>
      <input
        type="range"
        :value="settings.spread"
        @input="update({ spread: parseInt(($event.target as HTMLInputElement).value) })"
        min="5"
        max="200"
        class="slider"
      />
      <div class="slider-marks">
        <span>Borda</span>
        <span>Centro</span>
      </div>
    </div>

    <!-- Color -->
    <div class="section">
      <div class="color-header">
        <span class="section-label">Cor</span>
        <div class="color-current">
          <div class="color-swatch-big" :style="{ backgroundColor: settings.color }" />
          <span class="color-hex">{{ settings.color }}</span>
        </div>
      </div>
      <div class="color-grid">
        <button
          v-for="c in presetColors"
          :key="c"
          class="color-swatch"
          :class="{ active: settings.color === c }"
          :style="{ backgroundColor: c }"
          @click="update({ color: c })"
        />
        <label class="color-custom">
          <input
            type="color"
            :value="settings.color"
            @input="update({ color: ($event.target as HTMLInputElement).value })"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </label>
      </div>
    </div>

    <!-- Mini preview -->
    <div class="mini-preview">
      <div
        class="mini-preview-box"
        :style="miniPreviewStyle"
      >
        <div class="mini-img-placeholder">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vignette-panel {
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

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

/* Direction grid */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.direction-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px 8px;
  background: var(--surface-sunken);
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-muted);
}

.direction-btn:hover {
  border-color: var(--text-muted);
  color: var(--text-secondary);
}

.direction-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(232, 121, 73, 0.08);
}

.direction-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.direction-label {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Sliders */
.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slider-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--surface-sunken);
  outline: none;
  border: 1px solid var(--border-subtle);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface-base);
  box-shadow: 0 2px 6px rgba(232, 121, 73, 0.3);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface-base);
  box-shadow: 0 2px 6px rgba(232, 121, 73, 0.3);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
}

/* Color section */
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

/* Mini preview */
.mini-preview {
  display: flex;
  justify-content: center;
}

.mini-preview-box {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
  overflow: hidden;
}

.mini-img-placeholder {
  color: var(--text-muted);
}
</style>
