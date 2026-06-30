<template>
  <div class="modulo-proveedores">
    <header class="cabecera-modulo">
      <div>
        <h1>Proveedores</h1>
        <p class="subtitulo">Maestro de proveedores y cuentas a pagar</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nuevo Proveedor</button>
    </header>

    <!-- Resumen de deuda -->
    <div class="resumen-deuda" v-if="!cargando && deudaTotal > 0">
      <div class="rd-info">
        <span class="rd-label">Deuda total pendiente</span>
        <span class="rd-monto">$ {{ deudaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
      </div>
      <span class="rd-count">{{ proveedoresConDeuda }} proveedor{{ proveedoresConDeuda !== 1 ? 'es' : '' }} con saldo</span>
    </div>

    <div class="filtro-estado">
      <button v-for="opcion in opcionesFiltro" :key="opcion.valor" class="chip-filtro" :class="{ activo: filtroEstado === opcion.valor }" @click="filtroEstado = opcion.valor">
        {{ opcion.label }}
      </button>
    </div>

    <div v-if="cargando" class="estado-mensaje">Cargando proveedores...</div>

    <div v-else class="card-tabla">
      <table>
        <thead>
          <tr>
            <th class="col-expand"></th>
            <th>Proveedor</th>
            <th>CUIT</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th class="right">Saldo pendiente</th>
            <th class="col-acciones"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="prov in proveedoresFiltrados" :key="prov.id">
            <tr class="fila-prov" :class="{ 'fila-con-deuda': prov.saldo > 0, 'fila-inactiva': !prov.activo }" @click="toggleDetalle(prov.id)">
              <td class="col-expand">
                <span class="chevron" :class="{ abierto: expandido === prov.id }">›</span>
              </td>
              <td class="td-nombre">{{ prov.nombre }}</td>
              <td class="td-cuit">{{ prov.cuit || '-' }}</td>
              <td class="td-telefono">{{ prov.telefono || '-' }}</td>
              <td>
                <span class="badge-estado" :class="prov.activo ? 'badge-activo' : 'badge-inactivo'">{{ prov.activo ? 'Activo' : 'Inactivo' }}</span>
              </td>
              <td class="right">
                <span v-if="prov.saldo > 0" class="saldo-badge deuda">$ {{ prov.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
                <span v-else class="saldo-badge ok">Sin deuda</span>
              </td>
              <td class="col-acciones" @click.stop>
                <button class="btn-edit" @click="abrirModalEditar(prov)">Editar</button>
                <button v-if="prov.saldo > 0" class="btn-pagar" @click="abrirModalPago(prov)">Pagar</button>
                <button v-if="prov.activo" class="btn-baja" @click="confirmarCambioEstado(prov, false)">Dar de baja</button>
                <button v-else class="btn-reactivar" @click="confirmarCambioEstado(prov, true)">Reactivar</button>
              </td>
            </tr>

            <!-- Detalle expandido -->
            <tr v-if="expandido === prov.id" class="fila-detalle">
              <td colspan="7">
                <div class="detalle-prov">
                  <div class="detalle-prov-fila">
                    <div class="det-datos">
                      <div class="det-titulo">Datos del proveedor</div>
                      <div class="det-grid">
                        <div class="det-campo"><span class="det-label">Nombre:</span><span>{{ prov.nombre }}</span></div>
                        <div class="det-campo"><span class="det-label">CUIT:</span><span>{{ prov.cuit || 'No registrado' }}</span></div>
                        <div class="det-campo"><span class="det-label">Domicilio:</span><span>{{ prov.domicilio || 'No registrado' }}</span></div>
                        <div class="det-campo"><span class="det-label">Teléfono:</span><span>{{ prov.telefono || 'No registrado' }}</span></div>
                      </div>
                    </div>

                    <div v-if="prov.saldo > 0" class="det-deuda">
                      <div class="det-titulo">Cuenta corriente</div>
                      <div class="det-saldo-box">
                        <div class="dsb-fila">
                          <span>Saldo pendiente</span>
                          <span class="dsb-monto">$ {{ prov.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
                        </div>
                        <button class="btn-pagar-grande" @click="abrirModalPago(prov)">Registrar Pago</button>
                      </div>
                    </div>
                    <div v-else class="det-deuda-ok">Sin saldo pendiente con este proveedor.</div>
                  </div>

                  <div class="det-movimientos">
                    <div class="det-titulo">Detalle de movimientos (cuenta corriente)</div>
                    <div v-if="cargandoMovimientos === prov.id" class="mov-estado">Cargando movimientos...</div>
                    <div v-else-if="(movimientosPorProveedor[prov.id] || []).length === 0" class="mov-estado">No hay movimientos de cuenta corriente registrados.</div>
                    <table v-else class="tabla-movimientos">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th class="right">Monto</th>
                          <th class="right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(mov, i) in movimientosPorProveedor[prov.id]" :key="i">
                          <td class="celda-fecha">{{ formatearFecha(mov.fecha) }}</td>
                          <td><span class="tipo-mov" :class="claseTipoMov(mov.tipo)">{{ mov.tipo }}</span></td>
                          <td class="texto-muted">{{ mov.descripcion }}</td>
                          <td class="right" :class="mov.monto >= 0 ? 'monto-deuda' : 'monto-pago'">
                            {{ mov.monto >= 0 ? '+' : '' }}$ {{ mov.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
                          </td>
                          <td class="right">$ {{ mov.saldo_acumulado.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="7" class="sin-datos">No hay proveedores para mostrar.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo/Editar -->
    <ModalFormProveedor
      :show="mostrarModalForm"
      :proveedor="proveedorEditando"
      @close="mostrarModalForm = false"
      @guardar="guardar"
    />

    <!-- Modal Pago -->
    <ModalPagoProveedor
      :show="mostrarModalPago"
      :deuda="deudaSeleccionada"
      @close="mostrarModalPago = false"
      @confirm="procesarPago"
    />

    <ModalExito
      :show="mostrarExito"
      :titulo="tituloExito"
      :mensaje="mensajeExito"
      @close="mostrarExito = false"
    />

    <ModalConfirmacion
      :show="mostrarConfirmacion"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :variante="confirmacion.variante"
      :texto-confirmar="confirmacion.textoConfirmar"
      @confirm="ejecutarConfirmacion"
      @cancel="mostrarConfirmacion = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalPagoProveedor from '../deudaProveedores/ModalPagoProveedor.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import ModalConfirmacion from '../ModalesGenericos/ModalConfirmacion.vue'
import ModalFormProveedor from './ModalFormProveedor.vue'
import { proveedoresService } from '../../services/proveedoresService'

const listaProveedores = ref([])
const listaDeudas = ref([])
const cargando = ref(true)
const expandido = ref(null)

const mostrarModalForm = ref(false)
const mostrarModalPago = ref(false)
const mostrarExito = ref(false)
const tituloExito = ref('')
const mensajeExito = ref('')
const editando = ref(null)
const proveedorEditando = ref(null)
const deudaSeleccionada = ref(null)

const movimientosPorProveedor = ref({})
const cargandoMovimientos = ref(null)

const mostrarConfirmacion = ref(false)
const confirmacion = ref({ titulo: '', mensaje: '', variante: 'default', textoConfirmar: 'Confirmar', accion: null })

const filtroEstado = ref('activos')
const opcionesFiltro = [
  { valor: 'activos', label: 'Activos' },
  { valor: 'inactivos', label: 'Inactivos' },
  { valor: 'todos', label: 'Todos' },
]

const proveedoresEnriquecidos = computed(() => {
  const deudasMap = new Map()
  for (const d of listaDeudas.value) {
    deudasMap.set(d.id, d.saldo_pendiente)
  }
  return listaProveedores.value.map((p) => ({
    ...p,
    saldo: deudasMap.get(p.id) || 0,
  })).sort((a, b) => b.saldo - a.saldo)
})

const proveedoresFiltrados = computed(() => {
  if (filtroEstado.value === 'activos') return proveedoresEnriquecidos.value.filter((p) => p.activo)
  if (filtroEstado.value === 'inactivos') return proveedoresEnriquecidos.value.filter((p) => !p.activo)
  return proveedoresEnriquecidos.value
})

const deudaTotal = computed(() => proveedoresEnriquecidos.value.reduce((s, p) => s + p.saldo, 0))
const proveedoresConDeuda = computed(() => proveedoresEnriquecidos.value.filter((p) => p.saldo > 0).length)

const cargarDatos = async () => {
  try {
    cargando.value = true
    const [provData, deudasData] = await Promise.all([
      proveedoresService.obtenerTodos(true),
      proveedoresService.obtenerDeudas(),
    ])
    listaProveedores.value = Array.isArray(provData) ? provData : []
    listaDeudas.value = Array.isArray(deudasData) ? deudasData : []
  } catch (e) {
    console.error('Error:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha)
  return Number.isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-AR')
}

const claseTipoMov = (tipo) => {
  if (tipo === 'Pago') return 'tipo-pago'
  if (tipo === 'Gasto') return 'tipo-gasto'
  return 'tipo-compra'
}

const cargarMovimientos = async (id) => {
  if (movimientosPorProveedor.value[id]) return
  try {
    cargandoMovimientos.value = id
    const movimientos = await proveedoresService.obtenerMovimientos(id)
    movimientosPorProveedor.value = { ...movimientosPorProveedor.value, [id]: Array.isArray(movimientos) ? movimientos : [] }
  } catch (e) {
    console.error('Error al cargar movimientos del proveedor:', e)
    movimientosPorProveedor.value = { ...movimientosPorProveedor.value, [id]: [] }
  } finally {
    cargandoMovimientos.value = null
  }
}

const toggleDetalle = (id) => {
  expandido.value = expandido.value === id ? null : id
  if (expandido.value === id) cargarMovimientos(id)
}

const abrirModalNuevo = () => { editando.value = null; proveedorEditando.value = null; mostrarModalForm.value = true }
const abrirModalEditar = (p) => { editando.value = p.id; proveedorEditando.value = p; mostrarModalForm.value = true }

const guardar = async (payload) => {
  try {
    if (editando.value) { await proveedoresService.actualizar(editando.value, payload); tituloExito.value = 'Proveedor actualizado' }
    else { await proveedoresService.crear(payload); tituloExito.value = 'Proveedor registrado' }
    mensajeExito.value = 'Los datos fueron guardados correctamente.'
    mostrarModalForm.value = false
    mostrarExito.value = true
    await cargarDatos()
  } catch (e) { alert('Error: ' + e.message) }
}

const confirmarCambioEstado = (prov, activo) => {
  confirmacion.value = {
    titulo: activo ? 'Reactivar proveedor' : 'Dar de baja proveedor',
    mensaje: `¿Seguro que querés ${activo ? 'reactivar' : 'dar de baja a'} "${prov.nombre}"?`,
    variante: activo ? 'default' : 'peligro',
    textoConfirmar: activo ? 'Reactivar' : 'Dar de baja',
    accion: async () => {
      try {
        await proveedoresService.cambiarEstado(prov.id, activo)
        await cargarDatos()
      } catch (e) {
        alert('Error al cambiar el estado del proveedor: ' + e.message)
      }
    },
  }
  mostrarConfirmacion.value = true
}

const ejecutarConfirmacion = async () => {
  mostrarConfirmacion.value = false
  if (confirmacion.value.accion) await confirmacion.value.accion()
}

const abrirModalPago = (prov) => {
  deudaSeleccionada.value = { id: prov.id, nombre: prov.nombre, cuit: prov.cuit, saldo_pendiente: prov.saldo }
  mostrarModalPago.value = true
}

const procesarPago = async (datosPago) => {
  try {
    await proveedoresService.registrarPago({ ...datosPago, fecha: new Date().toISOString() })
    mostrarModalPago.value = false
    tituloExito.value = 'Pago Registrado'
    mensajeExito.value = 'El pago fue contabilizado y el saldo actualizado.'
    mostrarExito.value = true
    delete movimientosPorProveedor.value[datosPago.proveedor_id]
    await cargarDatos()
  } catch (e) { alert('Error al procesar el pago: ' + e.message) }
}
</script>

<style scoped>
.modulo-proveedores { padding: 20px; max-width: 1200px; margin: 0 auto; font-family: 'Inter', system-ui, sans-serif; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }
.btn-nuevo { background: #10b981; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2); }
.btn-nuevo:hover { background: #059669; }
.estado-mensaje { text-align: center; padding: 3rem; color: #64748b; }

/* Resumen deuda */
.resumen-deuda { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 0.85rem 1.25rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.rd-label { font-size: 0.8rem; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.04em; }
.rd-monto { display: block; font-size: 1.3rem; font-weight: 800; color: #dc2626; }
.rd-count { font-size: 0.82rem; color: #991b1b; }

/* Filtro de estado */
.filtro-estado { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.chip-filtro { background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; padding: 0.35rem 0.9rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.chip-filtro:hover { background: #e2e8f0; }
.chip-filtro.activo { background: #0f172a; border-color: #0f172a; color: #fff; }

/* Estado activo/inactivo */
.badge-estado { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; }
.badge-activo { background: #dcfce7; color: #166534; }
.badge-inactivo { background: #f1f5f9; color: #64748b; }
.fila-inactiva td { opacity: 0.65; }
.btn-baja { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-left: 0.4rem; }
.btn-baja:hover { background: #ffe4e6; }
.btn-reactivar { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-left: 0.4rem; }
.btn-reactivar:hover { background: #d1fae5; }

/* Tabla */
.card-tabla { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; overflow: hidden; }
table { width: 100%; border-collapse: collapse; text-align: left; }
thead th { padding: 0.8rem 1rem; background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
tbody td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 0.9rem; vertical-align: middle; }

.fila-prov { cursor: pointer; transition: background 0.12s; }
.fila-prov:hover td { background: #f8fafc; }
.fila-con-deuda { border-left: 3px solid #ef4444; }

.col-expand { width: 32px; text-align: center; }
.chevron { display: inline-block; font-size: 1.1rem; font-weight: bold; color: #94a3b8; transition: transform 0.2s; }
.chevron.abierto { transform: rotate(90deg); color: #3b82f6; }

.td-nombre { font-weight: 600; color: #0f172a; }
.td-cuit { font-family: monospace; color: #64748b; font-size: 0.85rem; }
.td-telefono { color: #64748b; }
.right { text-align: right; }

.saldo-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 700; }
.saldo-badge.deuda { background: #fee2e2; color: #991b1b; }
.saldo-badge.ok { background: #f1f5f9; color: #94a3b8; font-weight: 500; }

.col-acciones { text-align: right; white-space: nowrap; }
.btn-edit { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; margin-right: 0.4rem; }
.btn-edit:hover { background: #e5e7eb; }
.btn-pagar { background: #3b82f6; color: #fff; border: none; border-radius: 6px; padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-pagar:hover { background: #2563eb; }

/* Detalle expandido */
.fila-detalle td { padding: 0; background: #fafbfc; }
.detalle-prov { padding: 1rem 1.25rem 1.25rem 3rem; border-top: 1px solid #e2e8f0; animation: slideDown 0.2s ease-out; }
.detalle-prov-fila { display: flex; gap: 2rem; }

.det-movimientos { width: 100%; margin-top: 1.25rem; }
.mov-estado { color: #94a3b8; font-style: italic; font-size: 0.85rem; padding: 0.5rem 0; }
.tabla-movimientos { width: 100%; border-collapse: collapse; font-size: 0.85rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.tabla-movimientos th { padding: 0.55rem 0.75rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; }
.tabla-movimientos td { padding: 0.55rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
.tabla-movimientos tr:last-child td { border-bottom: none; }
.tipo-mov { padding: 0.15rem 0.5rem; border-radius: 5px; font-size: 0.72rem; font-weight: 700; }
.tipo-compra { background: #dbeafe; color: #1e40af; }
.tipo-gasto { background: #fef3c7; color: #92400e; }
.tipo-pago { background: #dcfce7; color: #166534; }
.monto-deuda { color: #dc2626; font-weight: 600; }
.monto-pago { color: #16a34a; font-weight: 600; }

.det-datos, .det-deuda { flex: 1; }
.det-titulo { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 0.65rem; }
.det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1.5rem; }
.det-campo { font-size: 0.85rem; color: #334155; }
.det-label { font-weight: 600; color: #64748b; margin-right: 0.35rem; }

.det-saldo-box { background: #fff; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; }
.dsb-fila { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.9rem; color: #334155; }
.dsb-monto { font-size: 1.2rem; font-weight: 800; color: #dc2626; }
.btn-pagar-grande { width: 100%; padding: 0.6rem; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer; }
.btn-pagar-grande:hover { background: #2563eb; }
.det-deuda-ok { flex: 1; display: flex; align-items: center; color: #94a3b8; font-size: 0.88rem; font-style: italic; }

.sin-datos { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
</style>
