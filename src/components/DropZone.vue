<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  file: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('file', file)
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    emit('file', file)
    input.value = ''
  }
}

function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="openPicker"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      hidden
      @change="onFileChange"
    />

    <div class="dropzone-content">
      <div class="dropzone-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p class="dropzone-title">Solte sua imagem aqui</p>
      <p class="dropzone-subtitle">ou clique para selecionar um arquivo</p>
      <div class="dropzone-formats">PNG, JPG, WebP, GIF, BMP, TIFF</div>
    </div>
  </div>
</template>

<style scoped>
.dropzone {
  position: relative;
  border: 2px dashed var(--border-subtle);
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--surface-raised);
}

.dropzone:hover {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.dropzone.dragging {
  border-color: var(--accent);
  background: var(--accent-dim);
  transform: scale(1.01);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.dropzone-icon {
  color: var(--text-muted);
  margin-bottom: 8px;
  transition: color 0.3s, transform 0.3s;
}

.dropzone:hover .dropzone-icon {
  color: var(--accent);
  transform: translateY(-4px);
}

.dropzone.dragging .dropzone-icon {
  color: var(--accent);
  transform: translateY(-8px);
}

.dropzone-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.dropzone-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.dropzone-formats {
  margin-top: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  padding: 6px 16px;
  background: var(--surface-sunken);
  border-radius: 20px;
}
</style>
