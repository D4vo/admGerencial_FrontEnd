<template>
  <div class="modulo-documentos">
    <header class="cabecera-modulo">
      <div>
        <h1>Documentos Contables</h1>
        <p class="subtitulo">Historial unificado de comprobantes, notas de crédito y débito</p>
      </div>
    </header>

    <!-- Buscador + Filtros -->
    <div class="barra-busqueda">
      <input
        type="text"
        v-model="textoBusqueda"
        placeholder="Buscar por N° comprobante, entidad, tipo, fecha..."
        class="input-buscador"
      />
    </div>

    <div class="barra-filtros">
      <button
        v-for="filtro in filtros"
        :key="filtro.valor"
        :class="['filtro-btn', { activo: filtroActivo === filtro.valor }]"
        @click="filtroActivo = filtro.valor"
      >
        {{ filtro.label }}
        <span v-if="conteo(filtro.valor) > 0" class="filtro-count">{{ conteo(filtro.valor) }}</span>
      </button>
    </div>

    <div v-if="cargando" class="estado-mensaje">Cargando documentos contables...</div>

    <div v-else class="layout-contenido">
      <TablaDocumentos
        :documentos="documentosFiltrados"
        @generarNota="abrirModal"
      />
    </div>

    <ModalNotaContable
      :show="mostrarModal"
      :documento="documentoSeleccionado"
      @close="mostrarModal = false"
      @confirmar="procesarNotaAPI"
    />

    <ModalExito
      :show="mostrarExito"
      titulo="Nota Contable Registrada"
      mensaje="El asiento fue generado y el Libro Diario actualizado correctamente."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TablaDocumentos from './TablaDocumentos.vue'
import ModalNotaContable from './ModalNotaContable.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import { documentosService } from '../../services/documentosService'

const listaDocumentos = ref([])
const cargando = ref(true)
const mostrarModal = ref(false)
const mostrarExito = ref(false)
const documentoSeleccionado = ref(null)
const filtroActivo = ref('Todos')
const textoBusqueda = ref('')

const filtros = [
  { label: 'Todos', valor: 'Todos' },
  { label: 'Ventas', valor: 'Venta' },
  { label: 'Compras', valor: 'Compra' },
  { label: 'Gastos', valor: 'Gasto' },
  { label: 'Pagos', valor: 'Pago' },
  { label: 'Notas', valor: 'Ajuste/Nota' },
]

const documentosBuscados = computed(() => {
  const q = textoBusqueda.value.trim().toLowerCase()
  if (!q) return listaDocumentos.value
  return listaDocumentos.value.filter((d) => {
    const campos = [
      d.nro_comprobante,
      d.tipo_comprobante,
      d.entidad_nombre,
      d.tipo_operacion,
      String(d.total),
      d.fecha_emision,
      d.proveedor_nombre || '',
      d.nota_motivo || '',
    ].join(' ').toLowerCase()
    return campos.includes(q)
  })
})

const conteo = (valor) => {
  const base = documentosBuscados.value
  if (valor === 'Todos') return base.length
  return base.filter((d) => d.tipo_operacion === valor).length
}

const documentosFiltrados = computed(() => {
  const base = documentosBuscados.value
  if (filtroActivo.value === 'Todos') return base
  return base.filter((d) => d.tipo_operacion === filtroActivo.value)
})

const cargarHistorial = async () => {
  try {
    cargando.value = true
    const data = await documentosService.obtenerHistorial()
    listaDocumentos.value = Array.isArray(data) ? data : data?.data || []
  } catch (error) {
    console.error('Error al cargar documentos:', error)
    alert('No se pudo cargar el historial de comprobantes.')
  } finally {
    cargando.value = false
  }
}

onMounted(cargarHistorial)

const abrirModal = (doc) => {
  documentoSeleccionado.value = doc
  mostrarModal.value = true
}

const procesarNotaAPI = async ({ payload, tipoOperacion }) => {
  try {
    if (tipoOperacion === 'Venta') {
      await documentosService.emitirNotaVenta(payload)
    } else if (tipoOperacion === 'Compra') {
      await documentosService.registrarNotaCompra(payload)
    }

    mostrarModal.value = false
    mostrarExito.value = true
    await cargarHistorial()
  } catch (error) {
    console.error('Error al registrar la nota:', error)
    alert('Ocurrió un error al procesar la nota contable.')
  }
}
</script>

<style scoped>
.modulo-documentos {
  padding: 20px;
  max-width: 1300px;
  margin: 0 auto;
}

.cabecera-modulo {
  margin-bottom: 1.5rem;
}

.cabecera-modulo h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitulo {
  margin: 5px 0 0 0;
  color: #64748b;
  font-size: 0.95rem;
}

.barra-busqueda {
  margin-bottom: 1rem;
}

.input-buscador {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.92rem;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: all 0.2s;
}

.input-buscador:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-buscador::placeholder {
  color: #94a3b8;
}

.barra-filtros {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filtro-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filtro-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filtro-btn.activo {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}

.filtro-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.05rem 0.45rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.filtro-btn:not(.activo) .filtro-count {
  background: #f1f5f9;
  color: #475569;
}

.estado-mensaje {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.layout-contenido {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
