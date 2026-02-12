<script setup lang="ts">
import { computed } from 'vue'
import type { ConvertState, ImageFormat } from './convert.types'
import type { IToolPanelProps, IToolPanelEmits } from '../core/tool.types'
import { getFormatOptions } from '../../constants/formats'

const FORMAT_OPTIONS = computed(() => getFormatOptions())

const props = defineProps<IToolPanelProps<ConvertState>>()
const emit = defineEmits<IToolPanelEmits<ConvertState>>()

function updateFormat(format: ImageFormat) {
  emit('update:state', { ...props.state, outputFormat: format })
}

function updateQuality(quality: number) {
  emit('update:state', { ...props.state, quality })
}

const showQuality = computed(() => props.state.outputFormat !== 'image/png')
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
          :class="{ active: state.outputFormat === fmt.value }"
          @click="updateFormat(fmt.value)"
        >
          <span class="format-ext">.{{ fmt.extension }}</span>
          <span class="format-name">{{ fmt.label }}</span>
        </button>
      </div>
    </div>

    <div class="quality-section" v-if="showQuality">
      <div class="quality-header">
        <span class="section-label">Qualidade</span>
        <span class="quality-value">{{ state.quality }}%</span>
      </div>
      <div class="quality-slider-wrap">
        <input
          type="range"
          :value="state.quality"
          @input="updateQuality(parseInt(($event.target as HTMLInputElement).value))"
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

    <!-- Size info removed - will be re-implemented in converter system -->
    <div class="info-note">
      <span class="info-text">O tamanho final dependerá do formato e qualidade escolhidos.</span>
    </div>
  </div>
</template>

<style src="../core/tool-shared.css"></style>

<style scoped>
.convert-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  background: var(--accent-dim);
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

.info-note {
  padding: 12px 14px;
  background: var(--surface-sunken);
  border-radius: 8px;
  text-align: center;
}

.info-text {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
