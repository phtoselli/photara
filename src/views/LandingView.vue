<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { toolRegistry } from '../tools'

const router = useRouter()
const { theme, toggleTheme } = useTheme()
const tools = computed(() => toolRegistry.getAll())
const navScrolled = ref(false)

function goToEditor() {
  router.push('/editor')
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function handleScroll() {
  navScrolled.value = window.scrollY > 60
}

// Scroll reveal custom directive
const vReveal = {
  mounted(el: HTMLElement, binding: { value?: number }) {
    el.classList.add('rv')
    const delay = binding.value || 0
    if (delay) el.style.transitionDelay = `${delay}ms`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => el.classList.add('rv-visible'))
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
  },
}

// Marketing descriptions for tools
const toolDesc: Record<string, string> = {
  resize: 'Altere largura e altura com proporção travada ou livre. Presets rápidos de 25% a 200%.',
  crop: 'Recorte interativo com guias de regra dos terços. Arraste os cantos direto na imagem.',
  expand: 'Adicione bordas coloridas com controle independente para cada lado da imagem.',
  vignette: 'Efeito de vinheta elegante para direcionar o foco ao centro da composição.',
  convert: 'Exporte em PNG, JPEG, WebP, AVIF, BMP ou ICO com controle fino de qualidade.',
}

const advantages = [
  {
    title: 'Privacidade Total',
    desc: 'Suas imagens são processadas localmente e nunca são enviadas para nenhum servidor.',
    icon: 'shield',
  },
  {
    title: '100% Gratuito',
    desc: 'Sem planos premium, sem limites de uso. Todas as ferramentas disponíveis para todos.',
    icon: 'heart',
  },
  {
    title: 'Sem Cadastro',
    desc: 'Use imediatamente. Sem criar conta, sem e-mail, sem senhas, sem burocracia.',
    icon: 'zap',
  },
  {
    title: 'Ultra Rápido',
    desc: 'Processamento instantâneo usando o poder do seu próprio navegador.',
    icon: 'bolt',
  },
  {
    title: 'Sem Anúncios',
    desc: 'Interface limpa e focada na edição. Zero distrações, zero pop-ups.',
    icon: 'eye-off',
  },
  {
    title: 'Múltiplos Formatos',
    desc: 'Importe e exporte em PNG, JPEG, WebP, AVIF, BMP, ICO, GIF e TIFF.',
    icon: 'layers',
  },
]

const steps = [
  { num: '01', title: 'Faça upload', desc: 'Arraste sua imagem ou selecione do computador.' },
  { num: '02', title: 'Edite', desc: 'Use as ferramentas para transformar sua imagem.' },
  { num: '03', title: 'Baixe', desc: 'Exporte no formato e qualidade ideais para você.' },
]

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="landing">
    <!-- Navigation -->
    <nav class="nav" :class="{ scrolled: navScrolled }">
      <div class="nav-inner">
        <div class="nav-brand" @click="scrollTo('hero')">
          <span class="nav-phi">φ</span>
          <span class="nav-name">Photara</span>
        </div>
        <div class="nav-links">
          <a @click.prevent="scrollTo('ferramentas')">Ferramentas</a>
          <a @click.prevent="scrollTo('vantagens')">Vantagens</a>
          <a @click.prevent="scrollTo('como-funciona')">Como funciona</a>
        </div>
        <div class="nav-actions">
          <button class="nav-theme" @click="toggleTheme" :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'">
            <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <button class="nav-cta" @click="goToEditor">
            Comece a Editar
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section id="hero" class="hero">
      <div class="hero-glow"></div>
      <div class="hero-phi-bg" aria-hidden="true">φ</div>
      <div class="hero-content">
        <div class="hero-badge" v-reveal>
          <span class="badge-dot"></span>
          100% gratuito · Sem login · Sem anúncios
        </div>
        <h1 v-reveal="80">
          Edite suas fotos com<br/>total <span class="accent-text">liberdade</span>
        </h1>
        <p class="hero-desc" v-reveal="160">
          Redimensione, corte, expanda e converta suas imagens direto no navegador.
          Processamento 100% local — suas fotos nunca saem do seu dispositivo.
        </p>
        <div class="hero-actions" v-reveal="240">
          <button class="btn-primary" @click="goToEditor">
            Comece a Editar
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
          <span class="hero-note">Nenhum cadastro necessário</span>
        </div>
        <div class="hero-formats" v-reveal="320">
          <span>PNG</span>
          <span class="format-sep">·</span>
          <span>JPEG</span>
          <span class="format-sep">·</span>
          <span>WebP</span>
          <span class="format-sep">·</span>
          <span>AVIF</span>
          <span class="format-sep">·</span>
          <span>BMP</span>
          <span class="format-sep">·</span>
          <span>ICO</span>
        </div>
      </div>
    </section>

    <!-- Tools -->
    <section id="ferramentas" class="section">
      <div class="section-inner">
        <span class="section-label" v-reveal>φ Ferramentas</span>
        <h2 class="section-title" v-reveal="80">
          Tudo que você precisa,<br/>direto no navegador
        </h2>
        <p class="section-desc" v-reveal="140">
          Ferramentas profissionais de edição sem instalar nada. Simples, rápido e poderoso.
        </p>
        <div class="tools-grid">
          <div
            v-for="(tool, index) in tools"
            :key="tool.id"
            class="tool-card"
            v-reveal="200 + index * 80"
          >
            <div class="tool-card-header">
              <div class="tool-card-icon" v-html="tool.icon" />
              <span class="tool-card-num">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <h3>{{ tool.label }}</h3>
            <p>{{ toolDesc[tool.id] || tool.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages -->
    <section id="vantagens" class="section advantages-section">
      <div class="section-inner">
        <span class="section-label" v-reveal>φ Vantagens</span>
        <h2 class="section-title" v-reveal="80">
          Por que escolher<br/>o Photara?
        </h2>
        <p class="section-desc" v-reveal="140">
          Projetado para quem valoriza privacidade, simplicidade e qualidade.
        </p>
        <div class="adv-grid">
          <div
            v-for="(adv, i) in advantages"
            :key="adv.title"
            class="adv-card"
            v-reveal="200 + i * 60"
          >
            <div class="adv-icon">
              <!-- Shield -->
              <svg v-if="adv.icon === 'shield'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <!-- Heart -->
              <svg v-else-if="adv.icon === 'heart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <!-- Zap -->
              <svg v-else-if="adv.icon === 'zap'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <!-- Bolt / Gauge -->
              <svg v-else-if="adv.icon === 'bolt'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <!-- Eye Off -->
              <svg v-else-if="adv.icon === 'eye-off'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <!-- Layers -->
              <svg v-else-if="adv.icon === 'layers'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <h3>{{ adv.title }}</h3>
            <p>{{ adv.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section id="como-funciona" class="section">
      <div class="section-inner">
        <span class="section-label" v-reveal>φ Como funciona</span>
        <h2 class="section-title" v-reveal="80">
          Simples assim
        </h2>
        <p class="section-desc" v-reveal="140">
          Três passos. Sem complicação. Sem espera.
        </p>
        <div class="steps-row">
          <div
            v-for="(step, i) in steps"
            :key="step.num"
            class="step-card"
            v-reveal="200 + i * 100"
          >
            <div class="step-num">{{ step.num }}</div>
            <div class="step-connector" v-if="i < steps.length - 1" aria-hidden="true"></div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="section final-section">
      <div class="final-inner">
        <div class="final-glow"></div>
        <div class="final-phi" aria-hidden="true">φ</div>
        <h2 v-reveal>Pronto para começar?</h2>
        <p v-reveal="80">
          Comece a editar agora mesmo. É gratuito, privado e não precisa de cadastro.
        </p>
        <button class="btn-primary btn-lg" @click="goToEditor" v-reveal="160">
          Comece a Editar
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-phi">φ</span>
          <span>Photara</span>
        </div>
        <span class="footer-sep">·</span>
        <span class="footer-note">Processamento 100% local</span>
        <span class="footer-sep">·</span>
        <span class="footer-note">Do grego φῶς — luz</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════ */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 40px;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}

.nav.scrolled {
  background: rgba(26, 22, 37, 0.85);
  backdrop-filter: blur(20px) saturate(1.4);
  border-bottom-color: var(--border-subtle);
}

:root[data-theme="light"] .nav.scrolled {
  background: rgba(250, 250, 254, 0.85);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.nav-phi {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.nav-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 36px;
}

.nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
}

.nav-links a:hover {
  color: var(--text-primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-theme {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-theme:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-dim);
}

.nav-cta {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-cta:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

/* ═══════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 120px 40px 80px;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 700px;
  height: 700px;
  background: radial-gradient(
    ellipse at center,
    rgba(167, 139, 250, 0.12) 0%,
    rgba(139, 92, 246, 0.06) 35%,
    transparent 70%
  );
  pointer-events: none;
  animation: glow-pulse 6s ease-in-out infinite alternate;
}

:root[data-theme="light"] .hero-glow {
  background: radial-gradient(
    ellipse at center,
    rgba(124, 58, 237, 0.08) 0%,
    rgba(124, 58, 237, 0.03) 35%,
    transparent 70%
  );
}

@keyframes glow-pulse {
  from { opacity: 0.8; transform: translate(-50%, -55%) scale(1); }
  to { opacity: 1; transform: translate(-50%, -55%) scale(1.08); }
}

.hero-phi-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -52%);
  font-family: var(--font-display);
  font-size: clamp(280px, 40vw, 500px);
  font-weight: 300;
  color: var(--accent);
  opacity: 0.04;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  animation: phi-float 8s ease-in-out infinite alternate;
}

@keyframes phi-float {
  from { transform: translate(-50%, -52%); }
  to { transform: translate(-50%, -54%); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 100px;
  margin-bottom: 32px;
  letter-spacing: 0.01em;
}

:root[data-theme="light"] .hero-badge {
  border-color: rgba(124, 58, 237, 0.15);
}

.badge-dot {
  width: 7px;
  height: 7px;
  background: var(--accent);
  border-radius: 50%;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.accent-text {
  color: var(--accent);
  font-style: italic;
}

.hero-desc {
  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.25s;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.2);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-lg {
  padding: 18px 48px;
  font-size: 17px;
  border-radius: 16px;
}

.hero-note {
  font-size: 13px;
  color: var(--text-muted);
}

.hero-formats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-disabled);
  letter-spacing: 0.04em;
}

.format-sep {
  color: var(--border-medium);
}

/* ═══════════════════════════════════════════
   Shared Section Styles
   ═══════════════════════════════════════════ */
.section {
  padding: 120px 40px;
  position: relative;
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.section-label {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(32px, 4.5vw, 52px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-desc {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto 56px;
}

/* ═══════════════════════════════════════════
   Tools Grid
   ═══════════════════════════════════════════ */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  text-align: left;
}

.tool-card {
  padding: 32px 28px;
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.tool-card:hover {
  border-color: var(--border-medium);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border-subtle);
}

.tool-card:hover::before {
  opacity: 1;
}

.tool-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tool-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--accent-dim);
  border: 1px solid rgba(167, 139, 250, 0.12);
  border-radius: 12px;
  color: var(--accent);
}

:root[data-theme="light"] .tool-card-icon {
  border-color: rgba(124, 58, 237, 0.12);
}

.tool-card-num {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-disabled);
}

.tool-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.tool-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════
   Advantages
   ═══════════════════════════════════════════ */
.advantages-section {
  background: var(--surface-raised);
}

.adv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  text-align: left;
}

.adv-card {
  padding: 28px 24px;
  background: var(--surface-base);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.adv-card:hover {
  border-color: var(--border-medium);
  transform: translateY(-2px);
}

.adv-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--accent-dim);
  border-radius: 11px;
  color: var(--accent);
  margin-bottom: 16px;
}

.adv-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.adv-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════
   How it Works — Steps
   ═══════════════════════════════════════════ */
.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;
  position: relative;
}

.step-card {
  padding: 40px 24px;
  position: relative;
}

.step-num {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.2;
  line-height: 1;
  margin-bottom: 16px;
}

.step-connector {
  position: absolute;
  top: 52px;
  right: -12px;
  width: calc(100% - 60px);
  height: 2px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.15;
  transform: translateX(50%);
}

.step-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.step-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* ═══════════════════════════════════════════
   Final CTA
   ═══════════════════════════════════════════ */
.final-section {
  padding: 140px 40px;
}

.final-inner {
  position: relative;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  overflow: hidden;
}

.final-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(
    ellipse at center,
    rgba(167, 139, 250, 0.1) 0%,
    transparent 65%
  );
  pointer-events: none;
}

:root[data-theme="light"] .final-glow {
  background: radial-gradient(
    ellipse at center,
    rgba(124, 58, 237, 0.06) 0%,
    transparent 65%
  );
}

.final-phi {
  font-family: var(--font-display);
  font-size: 200px;
  font-weight: 300;
  color: var(--accent);
  opacity: 0.05;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
}

.final-inner h2 {
  position: relative;
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.final-inner p {
  position: relative;
  font-size: 17px;
  color: var(--text-muted);
  margin-bottom: 36px;
  line-height: 1.6;
}

.final-inner .btn-primary {
  position: relative;
}

/* ═══════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════ */
.footer {
  padding: 32px 40px;
  border-top: 1px solid var(--border-subtle);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-secondary);
}

.footer-phi {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1;
}

.footer-sep {
  color: var(--text-disabled);
}

.footer-note {
  font-size: 13px;
  color: var(--text-muted);
}

/* ═══════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .nav {
    padding: 0 20px;
  }

  .nav-links {
    display: none;
  }

  .hero {
    padding: 100px 20px 60px;
  }

  .section {
    padding: 80px 20px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .adv-grid {
    grid-template-columns: 1fr;
  }

  .steps-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .step-connector {
    display: none;
  }

  .step-card {
    padding: 24px;
  }

  .final-section {
    padding: 80px 20px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 8px;
  }

  .footer-sep {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 36px;
  }

  .hero-badge {
    font-size: 11px;
    padding: 6px 14px;
  }

  .btn-primary {
    padding: 14px 32px;
    font-size: 15px;
  }

  .hero-formats {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-cta {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
