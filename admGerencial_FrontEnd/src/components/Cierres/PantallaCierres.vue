<template>
  <div class="modulo-cierres">
    <header class="cabecera-modulo">
      <div>
        <h1>Cierres Contables</h1>
        <p class="subtitulo">Cierre mensual de cuentas de resultado y registro histórico</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalCierre">Ejecutar Cierre Mensual</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando historial de cierres...</div>

    <div v-else class="historial">
      <div v-if="cierres.length === 0" class="estado-vacio">
        No se han realizado cierres mensuales. Ejecute su primer cierre para comenzar.
      </div>

      <div class="tabla-cierres" v-else>
        <table>
          <thead>
            <tr>
              <th class="col-expand"></th>
              <th>Período</th>
              <th>Fecha de cierre</th>
              <th class="text-right">Ingresos</th>
              <th class="text-right">Egresos</th>
              <th class="text-right">Resultado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="cierre in cierres" :key="cierre.id">
              <tr class="fila-cierre" @click="toggleDetalle(cierre)">
                <td class="col-expand">
                  <span class="chevron" :class="{ abierto: detalleAbierto === cierre.id }">›</span>
                </td>
                <td class="periodo-cell">{{ formatPeriodo(cierre.periodo) }}</td>
                <td class="fecha-cell">{{ formatFecha(cierre.fecha_cierre) }}</td>
                <td class="text-right monto-ingreso">$ {{ Number(cierre.total_ingresos).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
                <td class="text-right monto-egreso">$ {{ Number(cierre.total_egresos).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
                <td class="text-right">
                  <span :class="['resultado-badge', cierre.resultado >= 0 ? 'ganancia' : 'perdida']">
                    {{ cierre.resultado >= 0 ? '+' : '' }}$ {{ Number(cierre.resultado).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
                  </span>
                </td>
                <td class="obs-cell">{{ cierre.observaciones || '—' }}</td>
              </tr>

              <tr v-if="detalleAbierto === cierre.id && detalleData" class="fila-detalle">
                <td :colspan="7">
                  <div class="detalle-cierre">
                    <div class="detalle-seccion">
                      <h4>Cuentas de Ingreso cerradas</h4>
                      <div v-for="d in detalleIngresos" :key="d.cuenta_id" class="detalle-cuenta-fila">
                        <span class="dc-codigo">{{ d.codigo }}</span>
                        <span class="dc-nombre">{{ d.nombre }}</span>
                        <span class="dc-monto">$ {{ Number(d.debe).toFixed(2) }}</span>
                      </div>
                      <div v-if="detalleIngresos.length === 0" class="detalle-vacio">Sin movimientos</div>
                    </div>
                    <div class="detalle-seccion">
                      <h4>Cuentas de Egreso cerradas</h4>
                      <div v-for="d in detalleEgresos" :key="d.cuenta_id" class="detalle-cuenta-fila">
                        <span class="dc-codigo">{{ d.codigo }}</span>
                        <span class="dc-nombre">{{ d.nombre }}</span>
                        <span class="dc-monto">$ {{ Number(d.haber).toFixed(2) }}</span>
                      </div>
                      <div v-if="detalleEgresos.length === 0" class="detalle-vacio">Sin movimientos</div>
                    </div>
                    <div class="detalle-resultado">
                      <span>Resultado del Ejercicio:</span>
                      <span :class="detalleData.resultado >= 0 ? 'ganancia' : 'perdida'">
                        {{ detalleData.resultado >= 0 ? 'Ganancia' : 'Pérdida' }} $ {{ Math.abs(Number(detalleData.resultado)).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de cierre -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-contenedor">
        <header class="modal-header">
          <h2>Ejecutar Cierre Mensual</h2>
          <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
        </header>

        <main class="modal-cuerpo">
          <!-- Paso 1: selección de período -->
          <div v-if="paso === 1" class="paso-seleccion">
            <div class="form-grupo">
              <label>Período a cerrar *</label>
              <input type="month" v-model="periodoSeleccionado" />
            </div>
            <button class="btn-preview" :disabled="!periodoSeleccionado || cargandoPreview" @click="cargarPreview">
              {{ cargandoPreview ? 'Calculando...' : 'Ver Vista Previa' }}
            </button>
          </div>

          <!-- Paso 2: vista previa -->
          <div v-if="paso === 2 && previewData" class="paso-preview">
            <div class="preview-header">
              <span class="preview-periodo">{{ formatPeriodo(previewData.periodo) }}</span>
              <span class="preview-label">Estado de Resultados</span>
            </div>

            <div class="preview-seccion">
              <div class="preview-seccion-titulo ingreso-titulo">Ingresos</div>
              <div v-for="ing in previewData.ingresos" :key="ing.cuenta_id" class="preview-fila">
                <span class="pf-codigo">{{ ing.cuenta_codigo }}</span>
                <span class="pf-nombre">{{ ing.cuenta_nombre }}</span>
                <span class="pf-monto">$ {{ Number(ing.saldo).toFixed(2) }}</span>
              </div>
              <div v-if="previewData.ingresos.length === 0" class="preview-vacio">Sin ingresos en el período</div>
              <div class="preview-subtotal">
                <span>Total Ingresos</span>
                <span>$ {{ Number(previewData.total_ingresos).toFixed(2) }}</span>
              </div>
            </div>

            <div class="preview-seccion">
              <div class="preview-seccion-titulo egreso-titulo">Egresos</div>
              <div v-for="egr in previewData.egresos" :key="egr.cuenta_id" class="preview-fila">
                <span class="pf-codigo">{{ egr.cuenta_codigo }}</span>
                <span class="pf-nombre">{{ egr.cuenta_nombre }}</span>
                <span class="pf-monto">$ {{ Number(egr.saldo).toFixed(2) }}</span>
              </div>
              <div v-if="previewData.egresos.length === 0" class="preview-vacio">Sin egresos en el período</div>
              <div class="preview-subtotal">
                <span>Total Egresos</span>
                <span>$ {{ Number(previewData.total_egresos).toFixed(2) }}</span>
              </div>
            </div>

            <div :class="['preview-resultado', previewData.resultado >= 0 ? 'resultado-ganancia' : 'resultado-perdida']">
              <span>{{ previewData.resultado >= 0 ? 'Ganancia del período' : 'Pérdida del período' }}</span>
              <span class="pr-monto">$ {{ Math.abs(Number(previewData.resultado)).toFixed(2) }}</span>
            </div>

            <div class="form-grupo">
              <label>Observaciones (opcional)</label>
              <input type="text" v-model="observaciones" placeholder="Ej: Cierre ordinario del mes" />
            </div>

            <div class="preview-acciones">
              <button class="btn-volver" @click="paso = 1">Volver</button>
              <button class="btn-ejecutar" :disabled="ejecutando" @click="ejecutarCierre">
                {{ ejecutando ? 'Cerrando...' : 'Confirmar y Cerrar Período' }}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <ModalExito
      :show="mostrarExito"
      titulo="Cierre Ejecutado"
      :mensaje="mensajeExito"
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import { cierresService } from '../../services/cierresService'

const cierres = ref([])
const cargando = ref(true)
const mostrarModal = ref(false)
const mostrarExito = ref(false)
const mensajeExito = ref('')
const paso = ref(1)
const periodoSeleccionado = ref('')
const previewData = ref(null)
const cargandoPreview = ref(false)
const ejecutando = ref(false)
const observaciones = ref('')
const detalleAbierto = ref(null)
const detalleData = ref(null)

const detalleIngresos = computed(() => (detalleData.value?.detalles || []).filter((d) => d.tipo === 'Ingreso'))
const detalleEgresos = computed(() => (detalleData.value?.detalles || []).filter((d) => d.tipo === 'Egreso'))

const cargarHistorial = async () => {
  try {
    cargando.value = true
    const data = await cierresService.obtenerHistorial()
    cierres.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error cargando cierres:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarHistorial)

const abrirModalCierre = () => {
  paso.value = 1
  periodoSeleccionado.value = ''
  previewData.value = null
  observaciones.value = ''
  mostrarModal.value = true
}

const cerrarModal = () => { mostrarModal.value = false }

const cargarPreview = async () => {
  if (!periodoSeleccionado.value) return
  cargandoPreview.value = true
  try {
    previewData.value = await cierresService.preview(periodoSeleccionado.value)
    paso.value = 2
  } catch (e) {
    alert(e.message || 'Error al generar la vista previa.')
  } finally {
    cargandoPreview.value = false
  }
}

const ejecutarCierre = async () => {
  ejecutando.value = true
  try {
    const resp = await cierresService.ejecutar({
      periodo: periodoSeleccionado.value,
      observaciones: observaciones.value.trim() || null,
    })
    mostrarModal.value = false
    mensajeExito.value = `El período ${formatPeriodo(resp.periodo)} fue cerrado. Resultado: ${resp.resultado >= 0 ? 'Ganancia' : 'Pérdida'} $${Math.abs(resp.resultado).toFixed(2)}`
    mostrarExito.value = true
    await cargarHistorial()
  } catch (e) {
    alert(e.message || 'Error al ejecutar el cierre.')
  } finally {
    ejecutando.value = false
  }
}

const toggleDetalle = async (cierre) => {
  if (detalleAbierto.value === cierre.id) {
    detalleAbierto.value = null
    detalleData.value = null
    return
  }
  try {
    detalleData.value = await cierresService.detalle(cierre.id)
    detalleAbierto.value = cierre.id
  } catch (e) {
    console.error('Error cargando detalle:', e)
  }
}

const formatPeriodo = (p) => {
  if (!p) return ''
  const [y, m] = p.split('-')
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[parseInt(m) - 1]} ${y}`
}

const formatFecha = (f) => {
  if (!f) return ''
  const d = new Date(f)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
  return d.toLocaleDateString('es-AR')
}
</script>

<style scoped>
.modulo-cierres { padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.75rem; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }
.btn-nuevo { background: #0f172a; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-nuevo:hover { background: #1e293b; }
.estado-mensaje { text-align: center; padding: 3rem; color: #64748b; }
.estado-vacio { text-align: center; padding: 4rem 2rem; color: #94a3b8; font-size: 0.95rem; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; }

/* Tabla de cierres */
.tabla-cierres { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; overflow: hidden; }
table { width: 100%; border-collapse: collapse; text-align: left; }
thead th { padding: 0.85rem 1rem; background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
tbody td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; vertical-align: middle; }

.fila-cierre { cursor: pointer; transition: background 0.12s; }
.fila-cierre:hover td { background: #f8fafc; }

.col-expand { width: 32px; text-align: center; }
.chevron { display: inline-block; font-size: 1.1rem; font-weight: bold; color: #94a3b8; transition: transform 0.2s; }
.chevron.abierto { transform: rotate(90deg); color: #3b82f6; }

.periodo-cell { font-weight: 700; color: #0f172a; }
.fecha-cell { color: #64748b; font-size: 0.85rem; }
.text-right { text-align: right; }
.monto-ingreso { color: #059669; font-weight: 600; }
.monto-egreso { color: #dc2626; font-weight: 600; }
.obs-cell { color: #94a3b8; font-size: 0.85rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.resultado-badge { display: inline-block; padding: 0.2rem 0.65rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
.ganancia { background: #dcfce7; color: #166534; }
.perdida { background: #fee2e2; color: #991b1b; }

/* Detalle expandido */
.fila-detalle td { padding: 0; background: #fafbfc; }
.detalle-cierre { padding: 1.25rem 1.5rem 1.5rem 3.5rem; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; animation: slideDown 0.2s ease-out; }
.detalle-seccion h4 { margin: 0 0 0.5rem 0; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
.detalle-cuenta-fila { display: flex; align-items: center; gap: 0.75rem; padding: 0.35rem 0; font-size: 0.88rem; }
.dc-codigo { font-family: monospace; color: #64748b; min-width: 70px; }
.dc-nombre { flex: 1; color: #334155; }
.dc-monto { font-weight: 600; color: #0f172a; min-width: 100px; text-align: right; }
.detalle-vacio { color: #cbd5e1; font-size: 0.85rem; font-style: italic; padding: 0.25rem 0; }
.detalle-resultado { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: #f1f5f9; border-radius: 8px; font-weight: 700; font-size: 0.95rem; color: #334155; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal-contenedor { background: #ffffff; border-radius: 16px; width: 100%; max-width: 620px; max-height: 90vh; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 1.15rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }
.modal-cuerpo { padding: 1.5rem; overflow-y: auto; }

/* Paso 1 */
.paso-seleccion { display: flex; flex-direction: column; gap: 1rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
input, select { padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; outline: none; transition: all 0.2s; width: 100%; }
input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.btn-preview { padding: 0.7rem; background: #0f172a; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.btn-preview:hover:not(:disabled) { background: #1e293b; }
.btn-preview:disabled { background: #cbd5e1; cursor: not-allowed; }

/* Paso 2 - Preview */
.paso-preview { display: flex; flex-direction: column; gap: 1rem; }
.preview-header { text-align: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.preview-periodo { display: block; font-size: 1.15rem; font-weight: 800; color: #0f172a; }
.preview-label { font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }

.preview-seccion { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.preview-seccion-titulo { padding: 0.5rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.ingreso-titulo { background: #ecfdf5; color: #065f46; }
.egreso-titulo { background: #fef2f2; color: #991b1b; }
.preview-fila { display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 1rem; border-bottom: 1px solid #f8fafc; font-size: 0.88rem; }
.preview-fila:last-of-type { border-bottom: none; }
.pf-codigo { font-family: monospace; color: #64748b; min-width: 65px; font-size: 0.82rem; }
.pf-nombre { flex: 1; color: #334155; }
.pf-monto { font-weight: 600; color: #0f172a; text-align: right; min-width: 90px; }
.preview-vacio { padding: 0.75rem 1rem; color: #cbd5e1; font-style: italic; font-size: 0.85rem; }
.preview-subtotal { display: flex; justify-content: space-between; padding: 0.6rem 1rem; background: #f8fafc; border-top: 1px solid #e5e7eb; font-weight: 700; font-size: 0.9rem; color: #334155; }

.preview-resultado { display: flex; justify-content: space-between; padding: 0.85rem 1rem; border-radius: 8px; font-weight: 700; font-size: 1rem; }
.resultado-ganancia { background: #dcfce7; color: #166534; }
.resultado-perdida { background: #fee2e2; color: #991b1b; }
.pr-monto { font-size: 1.15rem; }

.preview-acciones { display: flex; gap: 0.75rem; }
.btn-volver { flex: 1; padding: 0.7rem; background: #ffffff; border: 1px solid #cbd5e1; color: #475569; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-volver:hover { background: #f3f4f6; }
.btn-ejecutar { flex: 2; padding: 0.7rem; background: #dc2626; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.btn-ejecutar:hover:not(:disabled) { background: #b91c1c; }
.btn-ejecutar:disabled { background: #cbd5e1; cursor: not-allowed; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
</style>
