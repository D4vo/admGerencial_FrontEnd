<script setup>
import { ref } from 'vue'

const emit = defineEmits(['navegar'])

const seccionesMenu = [
  {
    titulo: 'Operaciones',
    icono: 'operaciones',
    color: '#10b981',
    items: [
      { id: 'Ventas', label: 'Punto de Venta', icono: 'ventas' },
      { id: 'Compras', label: 'Compras', icono: 'compras' },
      { id: 'Gastos', label: 'Gastos', icono: 'gastos' },
    ],
  },
  {
    titulo: 'Inventario y Terceros',
    icono: 'inventario',
    color: '#3b82f6',
    items: [
      { id: 'Productos', label: 'Productos', icono: 'productos' },
      { id: 'Clientes', label: 'Clientes', icono: 'clientes' },
      { id: 'Proveedores', label: 'Proveedores', icono: 'proveedores' },
      { id: 'Deudas Proveedores', label: 'Ctas. a Pagar', icono: 'deudas' },
    ],
  },
  {
    titulo: 'Contabilidad',
    icono: 'contabilidad',
    color: '#8b5cf6',
    items: [
      { id: 'Cuentas', label: 'Plan de Cuentas', icono: 'cuentas' },
      { id: 'Asiento Manual', label: 'Asiento Manual', icono: 'asiento' },
      { id: 'Libro Diario', label: 'Libro Diario', icono: 'diario' },
      { id: 'Libro Mayor', label: 'Libro Mayor', icono: 'mayor' },
      { id: 'Documentos', label: 'Documentos', icono: 'documentos' },
      { id: 'Cierres', label: 'Cierres Mensuales', icono: 'cierres' },
    ],
  },
  {
    titulo: 'Inicio',
    icono: 'inicio',
    color: '#f59e0b',
    items: [
      { id: 'Inicio Actividades', label: 'Inicio de Actividades', icono: 'inicio_act' },
    ],
  },
  {
    titulo: 'Sistema',
    icono: 'sistema',
    color: '#64748b',
    items: [
      { id: 'Config Cuentas', label: 'Cuentas del Sistema', icono: 'config' },
    ],
  },
]

const botonActivo = ref('Ventas')

const seccionesAbiertas = ref({
  Operaciones: true,
  'Inventario y Terceros': false,
  Contabilidad: false,
  Inicio: false,
  Sistema: false,
})

const toggleSeccion = (titulo) => {
  seccionesAbiertas.value[titulo] = !seccionesAbiertas.value[titulo]
}

const emitirNavegacion = (botonId) => {
  botonActivo.value = botonId
  emit('navegar', botonId)
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="logo-area">
      <div class="logo-marca">
        <div class="logo-icono">K</div>
        <div class="logo-textos">
          <span class="logo-nombre">KusKus</span>
          <span class="logo-sub">Sistema Contable</span>
        </div>
      </div>
    </div>

    <!-- Navegación -->
    <nav class="nav-area">
      <div v-for="seccion in seccionesMenu" :key="seccion.titulo" class="seccion">
        <button class="seccion-btn" @click="toggleSeccion(seccion.titulo)">
          <div class="seccion-left">
            <span class="seccion-dot" :style="{ background: seccion.color }"></span>
            <span class="seccion-label">{{ seccion.titulo }}</span>
          </div>
          <svg
            class="seccion-chevron"
            :class="{ rotado: seccionesAbiertas[seccion.titulo] }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <div class="seccion-body" :class="{ abierta: seccionesAbiertas[seccion.titulo] }">
          <div class="seccion-inner">
            <button
              v-for="item in seccion.items"
              :key="item.id"
              :class="['nav-item', { activo: botonActivo === item.id }]"
              @click="emitirNavegacion(item.id)"
            >
              <span class="nav-line" :style="{ background: seccion.color }"></span>
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="botonActivo === item.id" class="nav-active-dot" :style="{ background: seccion.color }"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-usuario">
        <div class="footer-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div class="footer-info">
          <span class="footer-rol">Administrador</span>
          <span class="footer-estado">
            <span class="estado-dot"></span>
            En línea
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 270px;
  height: 100vh;
  background: #0c1222;
  color: #8896ab;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, sans-serif;
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
}

/* ===== LOGO ===== */
.logo-area {
  padding: 1.5rem 1.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-marca {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-icono {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.logo-textos {
  display: flex;
  flex-direction: column;
}

.logo-nombre {
  font-size: 1.25rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.logo-sub {
  font-size: 0.65rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* ===== NAVEGACIÓN ===== */
.nav-area {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-area::-webkit-scrollbar { width: 3px; }
.nav-area::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
.nav-area::-webkit-scrollbar-track { background: transparent; }

/* Sección */
.seccion {
  margin-bottom: 0.15rem;
}

.seccion-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0.6rem 0.65rem;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
}

.seccion-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #94a3b8;
}

.seccion-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.seccion-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.seccion-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.seccion-chevron {
  width: 14px;
  height: 14px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}

.seccion-chevron.rotado {
  transform: rotate(90deg);
  opacity: 0.8;
}

/* Acordeón animado */
.seccion-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.seccion-body.abierta {
  grid-template-rows: 1fr;
}

.seccion-inner {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-left: 0.35rem;
}

/* Items del menú */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  margin: 1px 0;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #7a8ba0;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  position: relative;
}

.nav-line {
  width: 3px;
  height: 18px;
  border-radius: 3px;
  opacity: 0.2;
  flex-shrink: 0;
  transition: all 0.2s;
}

.nav-label {
  flex: 1;
  transition: color 0.2s;
}

.nav-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: dotAppear 0.3s ease-out;
}

/* Hover */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  transform: translateX(3px);
}

.nav-item:hover .nav-line {
  opacity: 0.6;
  height: 22px;
}

/* Activo */
.nav-item.activo {
  background: rgba(255, 255, 255, 0.06);
  color: #f1f5f9;
}

.nav-item.activo .nav-line {
  opacity: 1;
  height: 22px;
  box-shadow: 0 0 8px currentColor;
}

.nav-item.activo .nav-label {
  font-weight: 600;
}

/* ===== FOOTER ===== */
.sidebar-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(12, 18, 34, 0.95);
}

.footer-usuario {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.footer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e293b, #334155);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-avatar svg {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.footer-info {
  display: flex;
  flex-direction: column;
}

.footer-rol {
  color: #e2e8f0;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.2;
}

.footer-estado {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: #10b981;
  font-weight: 500;
}

.estado-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

/* ===== ANIMACIONES ===== */
@keyframes dotAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
}
</style>
