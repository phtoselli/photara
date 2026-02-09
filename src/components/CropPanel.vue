<script setup lang="ts">
import { computed } from 'vue'
import type { CropArea, Dimensions } from '../types'

const props = defineProps<{
  cropArea: CropArea
  originalDimensions: Dimensions
}>()

const emit = defineEmits<{
  'update:cropArea': [area: CropArea]
  reset: []
}>()

const cropPercent = computed(() => {
  const { width, height } = props.cropArea
  const { width: ow, height: oh } = props.originalDimensions
  if (ow === 0 || oh === 0) return 0
  return Math.round((width * height) / (ow * oh) * 100)
})

function updateField(field: keyof CropArea, value: number) {
  const v = Math.max(0, Math.round(value))
  const area = { ...props.cropArea, [field]: v }

  if (field === 'x') area.x = Math.min(v, props.originalDimensions.width - area.width)
  if (field === 'y') area.y = Math.min(v, props.originalDimensions.height - area.height)
  if (field === 'width') area.width = Math.min(v, props.originalDimensions.width - area.x)
  if (field === 'height') area.height = Math.min(v, props.originalDimensions.height - area.y)

  emit('update:cropArea', area)
}

function applyAspectPreset(ratioW: number, ratioH: number) {
  const { width: ow, height: oh } = props.originalDimensions
  const targetRatio = ratioW / ratioH
  let w: number, h: number

  if (ow / oh > targetRatio) {
    h = oh
    w = Math.round(oh * targetRatio)
  } else {
    w = ow
    h = Math.round(ow / targetRatio)
  }

  emit('update:cropArea', {
    x: Math.round((ow - w) / 2),
    y: Math.round((oh - h) / 2),
    width: w,
    height: h,
  })
}

const aspectPresets = [
  { label: 'Livre', w: 0, h: 0 },
  { label: '1:1', w: 1, h: 1 },
  { label: '4:3', w: 4, h: 3 },
  { label: '16:9', w: 16, h: 9 },
  { label: '3:2', w: 3, h: 2 },
  { label: '2:3', w: 2, h: 3 },
]
</script>

<template>
  <div class="crop-panel">
    <div class="panel-header">
      <h3>Cortar</h3>
      <button class="btn-ghost" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Resetar
      </button>
    </div>

    <p class="hint">Arraste as bordas na imagem para ajustar a área de corte</p>

    <div class="aspect-presets">
      <span class="presets-label">Proporção</span>
      <div class="preset-btns">
        <button
          v-for="p in aspectPresets"
          :key="p.label"
          class="preset-btn"
          @click="p.w === 0 ? emit('reset') : applyAspectPreset(p.w, p.h)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="crop-fields">
      <div class="field-row">
        <div class="field">
          <label>X</label>
          <input
            type="number"
            :value="cropArea.x"
            @input="updateField('x', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
        <div class="field">
          <label>Y</label>
          <input
            type="number"
            :value="cropArea.y"
            @input="updateField('y', parseInt(($event.target as HTMLInputElement).value) || 0)"
            min="0"
          />
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Largura</label>
          <input
            type="number"
            :value="cropArea.width"
            @input="updateField('width', parseInt(($event.target as HTMLInputElement).value) || 20)"
            min="20"
          />
        </div>
        <div class="field">
          <label>Altura</label>
          <input
            type="number"
            :value="cropArea.height"
            @input="updateField('height', parseInt(($event.target as HTMLInputElement).value) || 20)"
            min="20"
          />
        </div>
      </div>
    </div>

    <div class="info-row">
      <div class="info-item">
        <span class="info-label">Área selecionada</span>
        <span class="info-value">{{ cropArea.width }} × {{ cropArea.height }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Da imagem</span>
        <span class="info-value accent">{{ cropPercent }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crop-panel {
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

.aspect-presets {
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

.crop-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-row {
  display: flex;
  gap: 10px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field input {
  width: 100%;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}

.field input::-webkit-outer-spin-button,
.field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.field input:focus {
  border-color: var(--accent);
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
