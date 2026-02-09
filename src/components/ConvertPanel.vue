<script setup lang="ts">
import { computed } from 'vue'
import type { ImageFormat } from '../types'
import { FORMAT_OPTIONS } from '../constants/formats'

const props = defineProps<{
  outputFormat: ImageFormat
  quality: number
  fileName: string
  fileSize: number
}>()

const emit = defineEmits<{
  'update:outputFormat': [value: ImageFormat]
  'update:quality': [value: number]
}>()

const estimatedSize = computed(() => {
  if (props.fileSize === 0) return '—'
  let factor = 1
  if (props.outputFormat === 'image/jpeg') factor = props.quality / 100 * 0.7
  else if (props.outputFormat === 'image/webp') factor = props.quality / 100 * 0.5
  else factor = 1.1

  const bytes = props.fileSize * factor
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

const originalSizeFormatted = computed(() => {
  if (props.fileSize === 0) return '—'
  if (props.fileSize < 1024) return `${props.fileSize} B`
  if (props.fileSize < 1024 * 1024) return `${(props.fileSize / 1024).toFixed(1)} KB`
  return `${(props.fileSize / (1024 * 1024)).toFixed(2)} MB`
})

const showQuality = computed(() => props.outputFormat !== 'image/png')

function onQualityInput(e: Event) {
  emit('update:quality', parseInt((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="convert-panel">
    <div class="panel-header">
      <h3>Converter</h3>
    </div>

    <div class="format-section">
      <span class="section-label">Formato de saída</span>
      <div class="format-grid">
        <button
          v-for="fmt in FORMAT_OPTIONS"
          :key="fmt.value"
          class="format-card"
          :class="{ active: outputFormat === fmt.value }"
          @click="emit('update:outputFormat', fmt.value)"
        >
          <span class="format-ext">.{{ fmt.extension }}</span>
          <span class="format-name">{{ fmt.label }}</span>
        </button>
      </div>
    </div>

    <div class="quality-section" v-if="showQuality">
      <div class="quality-header">
        <span class="section-label">Qualidade</span>
        <span class="quality-value">{{ quality }}%</span>
      </div>
      <div class="quality-slider-wrap">
        <input
          type="range"
          :value="quality"
          @input="onQualityInput"
          min="1"
          max="100"
          class="quality-slider"
        />
        <div class="quality-marks">
          <span>Menor</span>
          <span>Maior</span>
        </div>
      </div>
    </div>

    <div v-if="!showQuality" class="png-note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>PNG utiliza compressão sem perda — a qualidade é sempre máxima.</span>
    </div>

    <div class="info-row">
      <div class="info-item">
        <span class="info-label">Tamanho original</span>
        <span class="info-value">{{ originalSizeFormatted }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Estimativa</span>
        <span class="info-value accent">≈ {{ estimatedSize }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.convert-panel {
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

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.format-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.format-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  background: var(--surface-sunken);
  border: 2px solid var(--border-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-card:hover {
  border-color: var(--text-muted);
}

.format-card.active {
  border-color: var(--accent);
  background: rgba(232, 121, 73, 0.08);
}

.format-ext {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.format-card.active .format-ext {
  color: var(--accent);
}

.format-name {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.quality-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quality-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quality-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent);
}

.quality-slider-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quality-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--surface-sunken);
  outline: none;
  border: 1px solid var(--border-subtle);
}

.quality-slider::-webkit-slider-thumb {
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

.quality-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface-base);
  box-shadow: 0 2px 6px rgba(232, 121, 73, 0.3);
}

.quality-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
}

.png-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  font-size: 12px;
  color: var(--text-muted);
  background: rgba(100, 180, 255, 0.06);
  border: 1px solid rgba(100, 180, 255, 0.15);
  border-radius: 8px;
  line-height: 1.5;
}

.png-note svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: rgba(100, 180, 255, 0.6);
}

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
