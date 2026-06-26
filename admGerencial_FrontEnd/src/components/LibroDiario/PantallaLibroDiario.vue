<template>
  <div class="modulo-libro-diario">
    <header class="cabecera-modulo">
      <div>
        <h1>Libro Diario</h1>
        <p class="subtitulo">Registro cronológico de operaciones contables</p>
      </div>
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
      <button class="btn-filtrar" @click="cargarLibroDiario">Filtrar</button>
      <button v-if="hayFiltros" class="btn-limpiar" @click="limpiarFiltros">Limpiar</button>
    </div>

    <div v-if="cargando" class="estado-mensaje">Generando Libro Diario...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>

    <div v-else class="layout-contenido">
      <div class="info-resultados" v-if="hayFiltros">
        {{ listaAsientos.length }} asiento{{ listaAsientos.length !== 1 ? 's' : '' }} encontrado{{ listaAsientos.length !== 1 ? 's' : '' }}
      </div>
      <TablaLibroDiario :asientos="listaAsientos" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { contabilidadService } from '../../services/contabilidadService'
import TablaLibroDiario from './TablaLibroDiario.vue'

const listaAsientos = ref([])
const cargando = ref(true)
const errorCarga = ref(null)
const filtroPeriodo = ref('')
const filtroDesde = ref('')
const filtroHasta = ref('')

const hayFiltros = computed(() => filtroPeriodo.value || filtroDesde.value || filtroHasta.value)

const cargarLibroDiario = async () => {
  try {
    cargando.value = true
    errorCarga.value = null
    const filtros = {}
    if (filtroPeriodo.value) filtros.periodo = filtroPeriodo.value
    if (filtroDesde.value) filtros.fecha_desde = filtroDesde.value
    if (filtroHasta.value) filtros.fecha_hasta = filtroHasta.value
    const data = await contabilidadService.obtenerLibroDiario(filtros)
    listaAsientos.value = Array.isArray(data) ? data : data?.data || []
  } catch (err) {
    console.error('Error al cargar el Libro Diario:', err)
    errorCarga.value = 'No se pudieron cargar los registros contables.'
  } finally {
    cargando.value = false
  }
}

const limpiarFiltros = () => {
  filtroPeriodo.value = ''
  filtroDesde.value = ''
  filtroHasta.value = ''
  cargarLibroDiario()
}

onMounted(cargarLibroDiario)
</script>

<style scoped>
.modulo-libro-diario { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }

.barra-filtros {
  display: flex; align-items: flex-end; gap: 0.85rem; margin-bottom: 1.5rem;
  background: #ffffff; padding: 1rem 1.25rem; border-radius: 10px;
  border: 1px solid #e5e7eb; flex-wrap: wrap;
}
.filtro-grupo { display: flex; flex-direction: column; }
.filtro-grupo label { font-size: 0.72rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.3rem; }
.filtro-grupo input { padding: 0.5rem 0.7rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.88rem; outline: none; transition: border-color 0.2s; }
.filtro-grupo input:focus { border-color: #3b82f6; }
.filtro-separador { color: #cbd5e1; font-size: 0.85rem; padding-bottom: 0.5rem; }
.btn-filtrar { padding: 0.5rem 1rem; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-filtrar:hover { background: #1e293b; }
.btn-limpiar { padding: 0.5rem 1rem; background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.btn-limpiar:hover { background: #f8fafc; }

.info-resultados { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; }
.estado-mensaje { text-align: center; padding: 40px; color: #6b7280; background: #f9fafb; border-radius: 8px; border: 1px dashed #d1d5db; }
.error { color: #ef4444; border-color: #fca5a5; background: #fef2f2; }
.layout-contenido { display: flex; flex-direction: column; gap: 20px; }
</style>
