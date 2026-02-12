<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDraggable } from '@vueuse/core'
import DropZone from '../components/DropZone.vue'
import ImagePreview from '../components/ImagePreview.vue'
import { useImageEditor } from '../composables/useImageEditor'
import { toolRegistry } from '../tools'
import { getDownloadFormatOptions } from '../constants/formats'
import { useTheme } from '../composables/useTheme'
import type { DownloadFormat } from '../types'

const router = useRouter()
const editor = useImageEditor()
const { theme, toggleTheme } = useTheme()
const isProcessing = ref(false)
const showOriginal = ref(false)
const openMenu = ref<'header' | 'sidebar' | null>(null)

const tools = computed(() => toolRegistry.getAll())

const previewTrigger = computed(() =>
  JSON.stringify({
    activeTool: editor.activeTool.value,
    toolState: editor.currentToolState.value,
  })
)

const boundProcessImage = () => editor.processImage()

const downloadOptions = computed(() => {
  const allFormats = getDownloadFormatOptions()
  const origFmt = editor.originalFormat.value
  const origOpt = allFormats.find(f => f.value === origFmt)
  const others = allFormats.filter(f => f.value !== origFmt)
  const origLabel = origOpt ? `Original .${origOpt.extension}` : 'Original .png'
  return [
    { label: origLabel, value: origFmt },
    ...others.map(f => ({ label: `.${f.extension.toUpperCase()}`, value: f.value })),
  ]
})

// --- Collapsible sidebar ---
const SIDEBAR_STORAGE_KEY = 'photara-sidebar-collapsed'
const sidebarCollapsed = ref(localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true')
const showFloatingPanel = ref(false)

watch(sidebarCollapsed, (val) => {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(val))
  if (!val) {
    showFloatingPanel.value = false
  }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (sidebarCollapsed.value && editor.currentTool.value) {
    showFloatingPanel.value = true
  }
}

function selectToolCollapsed(toolId: string) {
  editor.activeTool.value = toolId
  showFloatingPanel.value = true
  nextTick(() => {
    if (floatingX.value === 0 && floatingY.value === 0) {
      floatingX.value = window.innerWidth - 440
      floatingY.value = 120
    }
  })
}

function closeFloatingPanel() {
  showFloatingPanel.value = false
}

// --- Draggable floating panel ---
const floatingPanelRef = ref<HTMLElement | null>(null)
const floatingPanelHandle = ref<HTMLElement | null>(null)
const floatingX = ref(0)
const floatingY = ref(0)

const { style: floatingStyle } = useDraggable(floatingPanelRef, {
  handle: floatingPanelHandle,
  initialValue: { x: 0, y: 0 },
  onMove(pos) {
    floatingX.value = pos.x
    floatingY.value = pos.y
  },
})

// --- Handlers ---
async function handleFile(file: File) {
  await editor.loadImage(file)
}

function toggleMenu(location: 'header' | 'sidebar') {
  openMenu.value = openMenu.value === location ? null : location
}

async function handleDownloadAs(format: DownloadFormat) {
  openMenu.value = null
  isProcessing.value = true
  try {
    await editor.downloadImageAs(format)
  } finally {
    isProcessing.value = false
  }
}

function handleUpdateToolState(newState: any) {
  if (editor.currentTool.value) {
    editor.updateToolState(editor.currentTool.value.id, newState)
  }
}

function handleResetTool() {
  editor.resetActiveTool()
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.download-wrapper')) {
    openMenu.value = null
  }
}

function goHome() {
  router.push('/')
}

onMounted(() => {
  floatingX.value = window.innerWidth - 440
  floatingY.value = 120
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="editor">
    <header class="header">
      <div class="logo" @click="goHome" style="cursor: pointer">
        <span class="logo-phi">φ</span>
        <span class="logo-text">Photara</span>
      </div>
      <div class="header-center">
        <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'">
          <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
      <div class="header-right">
        <template v-if="editor.hasImage.value">
          <button class="btn-clear" @click="editor.clearImage()">
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
        </template>
      </div>
    </header>

    <!-- Always show editor layout (dashboard-first) -->
    <main class="main editor-main">
      <div class="editor-layout">
        <!-- Canvas / Preview area -->
        <div class="preview-area">
          <!-- Toolbar (only when image loaded) -->
          <div class="preview-toolbar" v-if="editor.hasImage.value">
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

          <!-- Image loaded: show preview -->
          <ImagePreview
            v-if="editor.hasImage.value"
            :image="editor.originalImage.value"
            :active-tool="editor.activeTool.value"
            :crop-area="editor.currentToolState.value"
            :show-original="showOriginal"
            :process-image="boundProcessImage"
            :preview-trigger="previewTrigger"
            @update:crop-area="handleUpdateToolState($event)"
          />

          <!-- No image: show upload area in the canvas space -->
          <div v-else class="upload-area">
            <div class="upload-area-inner">
              <div class="upload-phi" aria-hidden="true">φ</div>
              <DropZone @file="handleFile" />
            </div>
          </div>

          <!-- Info bar (only when image loaded) -->
          <div class="image-info-bar" v-if="editor.hasImage.value">
            <span class="file-name">{{ editor.fileName.value }}</span>
            <span class="file-dims">
              {{ editor.originalDimensions.value.width }} × {{ editor.originalDimensions.value.height }}
            </span>
          </div>
        </div>

        <!-- Sidebar: always visible -->
        <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'no-image': !editor.hasImage.value }">
          <!-- Collapse toggle -->
          <button class="sidebar-toggle" @click="toggleSidebar" :title="sidebarCollapsed ? 'Expandir painel' : 'Recolher painel'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ flipped: sidebarCollapsed }">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <!-- Expanded: horizontal tabs + content + download -->
          <template v-if="!sidebarCollapsed">
            <nav class="tool-tabs">
              <button
                v-for="tool in tools"
                :key="tool.id"
                class="tool-tab"
                :class="{ active: editor.activeTool.value === tool.id }"
                :disabled="!editor.hasImage.value"
                @click="editor.activeTool.value = tool.id"
              >
                <span class="tool-icon" v-html="tool.icon" />
                <span class="tool-label">{{ tool.label }}</span>
              </button>
            </nav>

            <div class="tool-content">
              <template v-if="editor.hasImage.value">
                <component
                  v-if="editor.currentTool.value && editor.currentToolState.value"
                  :is="editor.currentTool.value.component"
                  :state="editor.currentToolState.value"
                  :original-image="editor.originalImage.value"
                  :original-dimensions="editor.originalDimensions.value"
                  @update:state="handleUpdateToolState"
                  @reset="handleResetTool"
                />
              </template>
              <div v-else class="tool-empty">
                <div class="tool-empty-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <p>Faça upload de uma imagem para começar a editar</p>
              </div>
            </div>

            <div class="sidebar-download" v-if="editor.hasImage.value">
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
          </template>

          <!-- Collapsed: vertical icon strip -->
          <template v-else>
            <nav class="tool-strip">
              <button
                v-for="tool in tools"
                :key="tool.id"
                class="strip-btn"
                :class="{ active: editor.activeTool.value === tool.id }"
                :title="tool.label"
                :disabled="!editor.hasImage.value"
                @click="selectToolCollapsed(tool.id)"
              >
                <span class="strip-icon" v-html="tool.icon" />
              </button>
            </nav>
          </template>
        </aside>

        <!-- Floating draggable panel (collapsed mode) -->
        <Transition name="float">
          <div
            v-if="sidebarCollapsed && showFloatingPanel && editor.currentTool.value && editor.hasImage.value"
            ref="floatingPanelRef"
            class="floating-panel"
            :style="floatingStyle"
          >
            <div ref="floatingPanelHandle" class="floating-handle">
              <span class="floating-title">{{ editor.currentTool.value.label }}</span>
              <button class="floating-close" @click="closeFloatingPanel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="floating-body">
              <component
                v-if="editor.currentToolState.value"
                :is="editor.currentTool.value.component"
                :state="editor.currentToolState.value"
                :original-image="editor.originalImage.value"
                :original-dimensions="editor.originalDimensions.value"
                @update:state="handleUpdateToolState"
                @reset="handleResetTool"
              />
            </div>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Layout shell
   ═══════════════════════════════════════════ */
.editor {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ═══════════════════════════════════════════
   Header
   ═══════════════════════════════════════════ */
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

.logo-phi {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-center {
  display: flex;
  align-items: center;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  justify-content: flex-end;
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
  box-shadow: 0 4px 12px var(--accent-glow);
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

/* ═══════════════════════════════════════════
   Main & Layout
   ═══════════════════════════════════════════ */
.main {
  flex: 1;
  display: flex;
}

.editor-layout {
  display: flex;
  flex: 1;
  width: 100%;
  height: calc(100vh - 65px);
  position: relative;
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ═══════════════════════════════════════════
   Upload area (in-dashboard)
   ═══════════════════════════════════════════ */
.upload-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-sunken);
  position: relative;
  overflow: hidden;

  background-image:
    linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}

.upload-area-inner {
  position: relative;
  width: 100%;
  max-width: 520px;
  padding: 40px;
}

.upload-phi {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-family: var(--font-display);
  font-size: 240px;
  font-weight: 300;
  color: var(--accent);
  opacity: 0.03;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* ═══════════════════════════════════════════
   Preview toolbar & info bar
   ═══════════════════════════════════════════ */
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
  background: var(--accent-dim);
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
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════
   Sidebar — collapsible
   ═══════════════════════════════════════════ */
.sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-subtle);
  background: var(--surface-base);
  overflow-y: auto;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: 64px;
  overflow: hidden;
}

/* Collapse toggle button */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.sidebar-toggle svg {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle svg.flipped {
  transform: rotate(180deg);
}

/* ═══════════════════════════════════════════
   Expanded sidebar — tool tabs
   ═══════════════════════════════════════════ */
.tool-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto;
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

.tool-tab:hover:not(:disabled) {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.02);
}

.tool-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tool-tab:disabled {
  opacity: 0.4;
  cursor: default;
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

/* Empty state for tool content */
.tool-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
}

.tool-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--accent-dim);
  border-radius: 14px;
  color: var(--accent);
}

.tool-empty p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 200px;
}

.sidebar-download {
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}

/* ═══════════════════════════════════════════
   Collapsed sidebar — vertical icon strip
   ═══════════════════════════════════════════ */
.tool-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
}

.strip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  border-radius: 10px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
}

.strip-btn:hover:not(:disabled) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.strip-btn.active {
  color: var(--accent);
  background: var(--accent-dim);
}

.strip-btn.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent);
  border-radius: 0 3px 3px 0;
}

.strip-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.strip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════════════════════════════════
   Floating draggable panel
   ═══════════════════════════════════════════ */
.floating-panel {
  position: fixed;
  width: 320px;
  max-height: 70vh;
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(167, 139, 250, 0.08);
  backdrop-filter: blur(16px);
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.floating-handle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--accent-dim);
  border-bottom: 1px solid var(--border-subtle);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.floating-handle:active {
  cursor: grabbing;
}

.floating-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.floating-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.floating-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.floating-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

/* Floating panel transition */
.float-enter-active {
  animation: float-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.float-leave-active {
  animation: float-out 0.16s ease-in;
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes float-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(6px);
  }
}

/* ═══════════════════════════════════════════
   Download dropdown (shared)
   ═══════════════════════════════════════════ */
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
  animation-name: menu-in-up;
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
  background: var(--accent-dim);
  color: var(--accent);
}
</style>
