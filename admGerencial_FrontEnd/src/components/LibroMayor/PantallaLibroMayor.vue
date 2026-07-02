<template>
  <div class="modulo-libro-mayor">
    <header class="cabecera-modulo">
      <div>
        <h1>Libro Mayor</h1>
        <p class="subtitulo">Análisis detallado y saldos por cuenta contable</p>
      </div>
      <button class="btn-exportar" :disabled="exportando" @click="exportarExcel">
        {{ exportando ? 'Generando...' : '⬇ Exportar Excel' }}
      </button>
    </header>

    <!-- Filtros -->
    <div class="barra-filtros">
      <div class="filtro-grupo">
        <label>Período</label>
        <input type="month" v-model="filtroPeriodo" @change="filtroDesde = ''; filtroHasta = ''" />
      </div>
      <span class="filtro-separador">ó</span>
      <div class="filtro-grupo">
        <label>Desde</label>
        <input type="date" v-model="filtroDesde" @change="filtroPeriodo = ''" />
      </div>
      <div class="filtro-grupo">
        <label>Hasta</label>
        <input type="date" v-model="filtroHasta" @change="filtroPeriodo = ''" />
      </div>
      <button class="btn-filtrar" @click="cargarLibroMayor">Filtrar</button>
      <button v-if="hayFiltros" class="btn-limpiar" @click="limpiarFiltros">Limpiar</button>

      <div class="filtro-separador-v"></div>

      <div class="filtro-grupo">
        <label>Buscar cuenta</label>
        <input type="text" v-model="filtroCuenta" placeholder="Código o nombre..." class="input-buscar-cuenta" />
      </div>
    </div>

    <div v-if="cargando" class="estado-mensaje">Generando Libro Mayor...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>

    <div v-else class="layout-contenido">
      <div class="info-resultados" v-if="hayFiltros">
        {{ cuentasFiltradas.length }} cuenta{{ cuentasFiltradas.length !== 1 ? 's' : '' }} con movimientos
      </div>

      <MayorCuentaItem
        v-for="cuenta in cuentasFiltradas"
        :key="cuenta.cuenta_id"
        :cuenta="cuenta"
      />

      <div v-if="cuentasFiltradas.length === 0" class="estado-mensaje">
        No se encontraron cuentas con movimientos para los filtros aplicados.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { contabilidadService } from '../../services/contabilidadService'
import MayorCuentaItem from './MayorCuentaItem.vue'

const cuentasMayor = ref([])
const cargando = ref(true)
const errorCarga = ref(null)
const filtroCuenta = ref('')
const filtroPeriodo = ref('')
const filtroDesde = ref('')
const filtroHasta = ref('')
const exportando = ref(false)

const hayFiltros = computed(() => filtroPeriodo.value || filtroDesde.value || filtroHasta.value)

const cargarLibroMayor = async () => {
  try {
    cargando.value = true
    errorCarga.value = null
    const filtros = {}
    if (filtroPeriodo.value) filtros.periodo = filtroPeriodo.value
    if (filtroDesde.value) filtros.fecha_desde = filtroDesde.value
    if (filtroHasta.value) filtros.fecha_hasta = filtroHasta.value
    const data = await contabilidadService.obtenerLibroMayor(filtros)
    cuentasMayor.value = Array.isArray(data) ? data : data?.data || []
  } catch (err) {
    console.error('Error al cargar el Libro Mayor:', err)
    errorCarga.value = 'No se pudo cargar el Libro Mayor.'
  } finally {
    cargando.value = false
  }
}

const limpiarFiltros = () => {
  filtroPeriodo.value = ''
  filtroDesde.value = ''
  filtroHasta.value = ''
  cargarLibroMayor()
}

const exportarExcel = async () => {
  try {
    exportando.value = true
    const filtros = {}
    if (filtroPeriodo.value) filtros.periodo = filtroPeriodo.value
    if (filtroDesde.value) filtros.fecha_desde = filtroDesde.value
    if (filtroHasta.value) filtros.fecha_hasta = filtroHasta.value
    await contabilidadService.descargarLibroMayorExcel(filtros)
  } catch (err) {
    console.error('Error al exportar el Libro Mayor:', err)
    alert('No se pudo generar el Excel del Libro Mayor.')
  } finally {
    exportando.value = false
  }
}

onMounted(cargarLibroMayor)

const cuentasFiltradas = computed(() => {
  const q = filtroCuenta.value.toLowerCase().trim()
  if (!q) return cuentasMayor.value
  return cuentasMayor.value.filter(
    (c) =>
      (c.cuenta_codigo && c.cuenta_codigo.toLowerCase().includes(q)) ||
      (c.cuenta_nombre && c.cuenta_nombre.toLowerCase().includes(q)),
  )
})
</script>

<style scoped>
.modulo-libro-mayor { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }

.btn-exportar { padding: 0.6rem 1.1rem; background: #10b981; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2); }
.btn-exportar:hover:not(:disabled) { background: #059669; }
.btn-exportar:disabled { background: #d1d5db; cursor: not-allowed; }

.barra-filtros {
  display: flex; align-items: flex-end; gap: 0.85rem; margin-bottom: 1.5rem;
  background: #ffffff; padding: 1rem 1.25rem; border-radius: 10px;
  border: 1px solid #e5e7eb; flex-wrap: wrap;
}
.filtro-grupo { display: flex; flex-direction: column; }
.filtro-grupo label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3rem; }
.filtro-grupo input { padding: 0.5rem 0.7rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.88rem; outline: none; transition: border-color 0.2s; }
.filtro-grupo input:focus { border-color: #3b82f6; }
.input-buscar-cuenta { width: 200px; }
.filtro-separador { color: #cbd5e1; font-size: 0.85rem; padding-bottom: 0.5rem; }
.filtro-separador-v { width: 1px; height: 32px; background: #e2e8f0; align-self: flex-end; margin-bottom: 0.25rem; }
.btn-filtrar { padding: 0.5rem 1rem; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-filtrar:hover { background: #1e293b; }
.btn-limpiar { padding: 0.5rem 1rem; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-limpiar:hover { background: #f8fafc; }

.info-resultados { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; }
.estado-mensaje { text-align: center; padding: 40px; color: #64748b; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
.error { color: #ef4444; border-color: #fca5a5; background: #fef2f2; }
.layout-contenido { display: flex; flex-direction: column; }
</style>
