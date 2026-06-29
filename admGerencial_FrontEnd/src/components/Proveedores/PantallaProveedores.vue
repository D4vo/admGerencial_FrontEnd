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

    <div v-if="cargando" class="estado-mensaje">Cargando proveedores...</div>

    <div v-else class="card-tabla">
      <table>
        <thead>
          <tr>
            <th class="col-expand"></th>
            <th>Proveedor</th>
            <th>CUIT</th>
            <th>Teléfono</th>
            <th class="right">Saldo pendiente</th>
            <th class="col-acciones"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="prov in proveedoresEnriquecidos" :key="prov.id">
            <tr class="fila-prov" :class="{ 'fila-con-deuda': prov.saldo > 0 }" @click="toggleDetalle(prov.id)">
              <td class="col-expand">
                <span class="chevron" :class="{ abierto: expandido === prov.id }">›</span>
              </td>
              <td class="td-nombre">{{ prov.nombre }}</td>
              <td class="td-cuit">{{ prov.cuit || '-' }}</td>
              <td class="td-telefono">{{ prov.telefono || '-' }}</td>
              <td class="right">
                <span v-if="prov.saldo > 0" class="saldo-badge deuda">$ {{ prov.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
                <span v-else class="saldo-badge ok">Sin deuda</span>
              </td>
              <td class="col-acciones" @click.stop>
                <button class="btn-edit" @click="abrirModalEditar(prov)">Editar</button>
                <button v-if="prov.saldo > 0" class="btn-pagar" @click="abrirModalPago(prov)">Pagar</button>
              </td>
            </tr>

            <!-- Detalle expandido -->
            <tr v-if="expandido === prov.id" class="fila-detalle">
              <td colspan="6">
                <div class="detalle-prov">
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
              </td>
            </tr>
          </template>

          <tr v-if="proveedoresEnriquecidos.length === 0">
            <td colspan="6" class="sin-datos">No hay proveedores registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo/Editar -->
    <div v-if="mostrarModalForm" class="modal-overlay">
      <div class="modal-contenedor">
        <header class="modal-header">
          <h3>{{ editando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
          <button class="btn-cerrar-X" @click="mostrarModalForm = false">&times;</button>
        </header>
        <main class="modal-cuerpo">
          <div class="form-grupo"><label>Nombre *</label><input type="text" v-model="form.nombre" placeholder="Razón social o nombre" /></div>
          <div class="form-grupo"><label>CUIT</label><input type="text" v-model="form.cuit" placeholder="XX-XXXXXXXX-X" /></div>
          <div class="form-grupo"><label>Domicilio</label><input type="text" v-model="form.domicilio" placeholder="Dirección" /></div>
          <div class="form-grupo"><label>Teléfono</label><input type="text" v-model="form.telefono" placeholder="Teléfono" /></div>
        </main>
        <footer class="modal-footer">
          <button class="btn-cancelar" @click="mostrarModalForm = false">Cancelar</button>
          <button class="btn-confirmar" :disabled="!form.nombre.trim()" @click="guardar">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
        </footer>
      </div>
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalPagoProveedor from '../deudaProveedores/ModalPagoProveedor.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
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
const deudaSeleccionada = ref(null)

const formVacio = () => ({ nombre: '', cuit: '', domicilio: '', telefono: '' })
const form = ref(formVacio())

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

const deudaTotal = computed(() => proveedoresEnriquecidos.value.reduce((s, p) => s + p.saldo, 0))
const proveedoresConDeuda = computed(() => proveedoresEnriquecidos.value.filter((p) => p.saldo > 0).length)

const cargarDatos = async () => {
  try {
    cargando.value = true
    const [provData, deudasData] = await Promise.all([
      proveedoresService.obtenerTodos(),
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

const toggleDetalle = (id) => { expandido.value = expandido.value === id ? null : id }

const abrirModalNuevo = () => { editando.value = null; form.value = formVacio(); mostrarModalForm.value = true }
const abrirModalEditar = (p) => { editando.value = p.id; form.value = { nombre: p.nombre, cuit: p.cuit || '', domicilio: p.domicilio || '', telefono: p.telefono || '' }; mostrarModalForm.value = true }

const guardar = async () => {
  const payload = { nombre: form.value.nombre.trim(), cuit: form.value.cuit.trim() || null, domicilio: form.value.domicilio.trim() || null, telefono: form.value.telefono.trim() || null }
  try {
    if (editando.value) { await proveedoresService.actualizar(editando.value, payload); tituloExito.value = 'Proveedor actualizado' }
    else { await proveedoresService.crear(payload); tituloExito.value = 'Proveedor registrado' }
    mensajeExito.value = 'Los datos fueron guardados correctamente.'
    mostrarModalForm.value = false
    mostrarExito.value = true
    await cargarDatos()
  } catch (e) { alert('Error: ' + e.message) }
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
.detalle-prov { padding: 1rem 1.25rem 1.25rem 3rem; border-top: 1px solid #e2e8f0; display: flex; gap: 2rem; animation: slideDown 0.2s ease-out; }

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

/* Modales */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-contenedor { background: #fff; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #111827; font-weight: 600; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; }
.modal-cuerpo { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.15rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
input, select, textarea { padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.modal-footer { padding: 1rem 1.5rem; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-confirmar { background: #10b981; border: none; color: white; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-confirmar:hover { background: #059669; }
.btn-confirmar:disabled { background: #d1d5db; cursor: not-allowed; }

@keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
</style>
