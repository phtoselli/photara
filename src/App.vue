<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DropZone from './components/DropZone.vue'
import ImagePreview from './components/ImagePreview.vue'
import ResizePanel from './components/ResizePanel.vue'
import CropPanel from './components/CropPanel.vue'
import ExpandPanel from './components/ExpandPanel.vue'
import VignettePanel from './components/VignettePanel.vue'
import ConvertPanel from './components/ConvertPanel.vue'
import { useImageProcessor } from './composables/useImageProcessor'
import { DOWNLOAD_FORMAT_OPTIONS } from './constants/formats'
import type { Tool, DownloadFormat } from './types'

const processor = useImageProcessor()
const isProcessing = ref(false)
const showOriginal = ref(false)
const openMenu = ref<'header' | 'sidebar' | null>(null)

// Force ImagePreview to re-render when edit params change
const previewTrigger = computed(() => JSON.stringify([
  processor.resizeWidth.value,
  processor.resizeHeight.value,
  processor.expandPadding.value,
  processor.expandFillColor.value,
  processor.vignetteSettings.value,
  processor.outputFormat.value,
  processor.quality.value,
]))

// Expose processImage bound to current state for preview
const boundProcessImage = () => processor.processImage()

const tools: { id: Tool; label: string; icon: string }[] = [
  {
    id: 'resize',
    label: 'Redimensionar',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  },
  {
    id: 'crop',
    label: 'Cortar',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>',
  },
  {
    id: 'expand',
    label: 'Expandir',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/></svg>',
  },
  {
    id: 'vignette',
    label: 'Vinheta',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" opacity="0.5"/><circle cx="12" cy="12" r="2" opacity="0.3"/></svg>',
  },
  {
    id: 'convert',
    label: 'Converter',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
  },
]

const downloadOptions = computed(() => {
  const origFmt = processor.originalFormat.value
  const origOpt = DOWNLOAD_FORMAT_OPTIONS.find(f => f.value === origFmt)
  const others = DOWNLOAD_FORMAT_OPTIONS.filter(f => f.value !== origFmt)
  const origLabel = origOpt ? `Original .${origOpt.extension}` : 'Original .png'
  return [
    { label: origLabel, value: origFmt },
    ...others.map(f => ({ label: `.${f.extension.toUpperCase()}`, value: f.value })),
  ]
})

async function handleFile(file: File) {
  await processor.loadImage(file)
}

function toggleMenu(location: 'header' | 'sidebar') {
  openMenu.value = openMenu.value === location ? null : location
}

async function handleDownloadAs(format: DownloadFormat) {
  openMenu.value = null
  isProcessing.value = true
  try {
    await processor.downloadImageAs(format)
  } finally {
    isProcessing.value = false
  }
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.download-wrapper')) {
    openMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
        <span class="logo-text">Image<span class="logo-accent">Tools</span></span>
      </div>
      <div class="header-right" v-if="processor.hasImage.value">
        <button class="btn-clear" @click="processor.clearImage()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Nova imagem
        </button>
        <div class="download-wrapper">
          <button
            class="btn-download"
            :disabled="isProcessing"
            @click.stop="toggleMenu('header')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {{ isProcessing ? 'Processando...' : 'Baixar' }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="download-menu" v-if="openMenu === 'header'">
            <button
              v-for="opt in downloadOptions"
              :key="opt.value"
              class="download-menu-item"
              @click="handleDownloadAs(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main" v-if="!processor.hasImage.value">
      <div class="upload-screen">
        <div class="upload-hero">
          <h1>Edite suas imagens <span class="hero-accent">direto no navegador</span></h1>
          <p>Redimensione, corte e converta imagens sem enviar para nenhum servidor. Tudo roda localmente.</p>
        </div>
        <DropZone @file="handleFile" />
        <div class="features">
          <div class="feature" v-for="tool in tools" :key="tool.id">
            <div class="feature-icon" v-html="tool.icon" />
            <span>{{ tool.label }}</span>
          </div>
        </div>
      </div>
    </main>

    <main class="main editor" v-else>
      <div class="editor-layout">
        <div class="preview-area">
          <div class="preview-toolbar">
            <div class="preview-toggle">
              <button
                class="toggle-btn"
                :class="{ active: !showOriginal }"
                @click="showOriginal = false"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editada
              </button>
              <button
                class="toggle-btn"
                :class="{ active: showOriginal }"
                @click="showOriginal = true"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Original
              </button>
            </div>
            <span v-if="showOriginal" class="preview-badge">Visualizando original</span>
          </div>
          <ImagePreview
            :image="processor.originalImage.value"
            :active-tool="processor.activeTool.value"
            :crop-area="processor.cropArea.value"
            :show-original="showOriginal"
            :process-image="boundProcessImage"
            :preview-trigger="previewTrigger"
            @update:crop-area="processor.cropArea.value = $event"
          />
          <div class="image-info-bar">
            <span class="file-name">{{ processor.fileName.value }}</span>
            <span class="file-dims">
              {{ processor.originalDimensions.value.width }} × {{ processor.originalDimensions.value.height }}
            </span>
          </div>
        </div>

        <aside class="sidebar">
          <nav class="tool-tabs">
            <button
              v-for="tool in tools"
              :key="tool.id"
              class="tool-tab"
              :class="{ active: processor.activeTool.value === tool.id }"
              @click="processor.activeTool.value = tool.id"
            >
              <span class="tool-icon" v-html="tool.icon" />
              <span class="tool-label">{{ tool.label }}</span>
            </button>
          </nav>

          <div class="tool-content">
            <ResizePanel
              v-if="processor.activeTool.value === 'resize'"
              :width="processor.resizeWidth.value"
              :height="processor.resizeHeight.value"
              :original-dimensions="processor.originalDimensions.value"
              :lock-aspect-ratio="processor.lockAspectRatio.value"
              @update:width="processor.updateResizeWidth($event)"
              @update:height="processor.updateResizeHeight($event)"
              @update:lock-aspect-ratio="processor.lockAspectRatio.value = $event"
              @reset="processor.resetResize()"
              @apply-percent="processor.applyResizePercent($event)"
            />

            <CropPanel
              v-if="processor.activeTool.value === 'crop'"
              :crop-area="processor.cropArea.value"
              :original-dimensions="processor.originalDimensions.value"
              @update:crop-area="processor.cropArea.value = $event"
              @reset="processor.resetCrop()"
            />

            <ExpandPanel
              v-if="processor.activeTool.value === 'expand'"
              :padding="processor.expandPadding.value"
              :fill-color="processor.expandFillColor.value"
              :original-dimensions="processor.originalDimensions.value"
              :link-sides="processor.expandLinkSides.value"
              @update:padding="processor.expandPadding.value = $event"
              @update:fill-color="processor.expandFillColor.value = $event"
              @update:link-sides="processor.expandLinkSides.value = $event"
              @reset="processor.resetExpand()"
            />

            <VignettePanel
              v-if="processor.activeTool.value === 'vignette'"
              :settings="processor.vignetteSettings.value"
              @update:settings="processor.vignetteSettings.value = $event"
              @reset="processor.resetVignette()"
            />

            <ConvertPanel
              v-if="processor.activeTool.value === 'convert'"
              :output-format="processor.outputFormat.value"
              :quality="processor.quality.value"
              :file-name="processor.fileName.value"
              :file-size="processor.fileSize.value"
              @update:output-format="processor.outputFormat.value = $event"
              @update:quality="processor.quality.value = $event"
            />
          </div>

          <div class="sidebar-download">
            <div class="download-wrapper up">
              <button
                class="btn-download full"
                :disabled="isProcessing"
                @click.stop="toggleMenu('sidebar')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {{ isProcessing ? 'Processando...' : 'Baixar imagem' }}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 15 12 9 18 15" />
                </svg>
              </button>
              <div class="download-menu" v-if="openMenu === 'sidebar'">
                <button
                  v-for="opt in downloadOptions"
                  :key="opt.value"
                  class="download-menu-item"
                  @click="handleDownloadAs(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-base);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.logo-accent {
  color: var(--accent);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-download:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 121, 73, 0.3);
}

.btn-download:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.btn-download.full {
  width: 100%;
  justify-content: center;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 10px;
}

/* Upload screen */
.main {
  flex: 1;
  display: flex;
}

.upload-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 60px 32px;
  max-width: 640px;
  margin: 0 auto;
}

.upload-hero {
  text-align: center;
}

.upload-hero h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.hero-accent {
  color: var(--accent);
}

.upload-hero p {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 460px;
  margin: 0 auto;
}

.features {
  display: flex;
  gap: 32px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--surface-raised);
  border-radius: 8px;
  color: var(--accent);
}

/* Editor layout */
.editor-layout {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100vh - 65px);
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.preview-area > .preview-container,
.preview-area > :nth-child(2) {
  flex: 1;
  min-height: 0;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-base);
}

.preview-toggle {
  display: flex;
  background: var(--surface-sunken);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid var(--border-subtle);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: var(--text-secondary);
}

.toggle-btn.active {
  background: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.preview-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--accent);
  padding: 4px 10px;
  background: rgba(232, 121, 73, 0.1);
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.image-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-base);
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-dims {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
}

/* Sidebar */
.sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-subtle);
  background: var(--surface-base);
  overflow-y: auto;
}

.tool-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;
  -webkit-overflow-scrolling: touch;
}

.tool-tabs::-webkit-scrollbar {
  height: 3px;
}

.tool-tabs::-webkit-scrollbar-track {
  background: transparent;
}

.tool-tabs::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 3px;
}

.tool-tab {
  flex: 0 0 auto;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 12px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-tab:hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.02);
}

.tool-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tool-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-download {
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}

/* Download dropdown */
.download-wrapper {
  position: relative;
}

.download-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 180px;
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 6px;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  animation: menu-in 0.15s ease-out;
}

.download-wrapper.up .download-menu {
  top: auto;
  bottom: calc(100% + 6px);
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.download-wrapper.up .download-menu {
  animation-name: menu-in-up;
}

@keyframes menu-in-up {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.download-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.download-menu-item:first-child {
  color: var(--accent);
  font-weight: 600;
}

.download-menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
}

.download-menu-item:first-child:hover {
  background: rgba(232, 121, 73, 0.12);
  color: var(--accent);
}
</style>
