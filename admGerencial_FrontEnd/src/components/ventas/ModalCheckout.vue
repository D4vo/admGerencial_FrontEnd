<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h2>Confirmar Cobro</h2>
        <button class="btn-cerrar-X" @click="emit('close')">&times;</button>
      </header>

      <main class="modal-cuerpo">
        <!-- Columna izquierda: resumen de items -->
        <div class="col-resumen">
          <div class="resumen-titulo">Resumen de venta</div>
          <div class="resumen-items">
            <div v-for="item in carrito" :key="item.id" class="resumen-item">
              <span class="ri-nombre">{{ item.nombre }}</span>
              <span class="ri-cant">{{ item.cantidad }} u.</span>
              <span class="ri-sub">$ {{ (item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
          <div class="resumen-total-fila">
            <span>Total</span>
            <span class="resumen-total-monto">$ {{ total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <!-- Columna derecha: configuración de cobro -->
        <div class="col-cobro">
          <div class="form-grupo">
            <label>Documento a Emitir</label>
            <select v-model="tipoComprobante">
              <option value="Ticket">Ticket (Consumidor Final)</option>
              <option value="Factura B">Factura B (Consumidor Final)</option>
              <option value="Factura A">Factura A</option>
            </select>
          </div>

          <FormDatosFiscales
            v-if="tipoComprobante === 'Factura A'"
            v-model="clienteFactura"
            @abrirBuscador="mostrarBuscadorClientes = true"
          />

          <hr class="divisor" />

          <div class="form-grupo">
            <label>Método de Pago</label>
            <div class="selector-pago">
              <button :class="['pilula-pago', { activa: metodoPago === 'Efectivo' }]" @click="setMetodo('Efectivo')">
                <span class="pilula-icono">💵</span> Efectivo
              </button>
              <button :class="['pilula-pago', { activa: metodoPago === 'Transferencia' }]" @click="setMetodo('Transferencia')">
                <span class="pilula-icono">📲</span> Transferencia
              </button>
            </div>
          </div>

          <div v-if="metodoPago === 'Efectivo'" class="bloque-efectivo effecto-aparecer">
            <div class="form-grupo">
              <label>Monto Recibido</label>
              <div class="input-con-prefijo">
                <span class="prefijo">$</span>
                <input ref="inputRecibido" type="number" v-model.number="montoRecibido" step="0.01" min="0" />
              </div>
            </div>
            <div v-if="montoRecibido >= total" class="bloque-vuelto">
              <div class="vuelto-fila"><span>Recibido:</span><span class="v-monto">$ {{ montoRecibido.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span></div>
              <div class="vuelto-fila vuelto-final"><span>Vuelto:</span><span class="v-monto-final">$ {{ vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span></div>
            </div>
            <div v-else-if="montoRecibido > 0" class="advertencia">El monto recibido es menor al total.</div>
          </div>

          <div v-if="metodoPago === 'Transferencia'" class="bloque-transfer effecto-aparecer">
            Cobro completo por transferencia a Banco.
          </div>

          <button
            class="btn-confirmar-cobro"
            :class="metodoPago === 'Transferencia' ? 'btn-transfer' : 'btn-cash'"
            :disabled="!puedeConfirmar"
            @click="confirmar"
          >
            {{ metodoPago === 'Transferencia' ? 'Confirmar Transferencia' : 'Confirmar Cobro' }}
          </button>
        </div>
      </main>
    </div>
  </div>

  <ModalSeleccionCliente
    :show="mostrarBuscadorClientes"
    @close="mostrarBuscadorClientes = false"
    @seleccionar="aplicarClienteSeleccionado"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import FormDatosFiscales from './FormDatosFiscales.vue'
import ModalSeleccionCliente from './ModalSeleccionCliente.vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  carrito: { type: Array, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['close', 'confirmarVenta'])

const tipoComprobante = ref('Ticket')
const metodoPago = ref('Efectivo')
const montoRecibido = ref(0)
const inputRecibido = ref(null)
const mostrarBuscadorClientes = ref(false)
const clienteFactura = ref({ cuit: '', razon_social: '', domicilio: '', condicion_iva: 'Responsable Inscripto' })

watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    tipoComprobante.value = 'Ticket'
    metodoPago.value = 'Efectivo'
    montoRecibido.value = props.total
    clienteFactura.value = { cuit: '', razon_social: '', domicilio: '', condicion_iva: 'Responsable Inscripto' }
    mostrarBuscadorClientes.value = false
    await nextTick()
    inputRecibido.value?.focus()
    inputRecibido.value?.select()
  }
})

const aplicarClienteSeleccionado = (c) => {
  clienteFactura.value = { cuit: c.cuit, razon_social: c.razon_social, domicilio: c.domicilio_fiscal || '', condicion_iva: c.condicion_iva || 'Responsable Inscripto' }
  mostrarBuscadorClientes.value = false
}

const setMetodo = (m) => {
  metodoPago.value = m
  montoRecibido.value = props.total
  if (m === 'Efectivo') nextTick(() => inputRecibido.value?.focus())
}

const vuelto = computed(() => Math.max(0, montoRecibido.value - props.total))

const puedeConfirmar = computed(() => {
  const pagoOk = metodoPago.value === 'Transferencia' || montoRecibido.value >= props.total
  if (tipoComprobante.value === 'Factura A') {
    const c = clienteFactura.value
    if (!c.cuit.trim() || !c.razon_social.trim() || !c.domicilio.trim()) return false
  }
  return pagoOk
})

const confirmar = () => {
  if (!puedeConfirmar.value) return
  const payload = {
    fecha: new Date().toISOString(),
    tipo_comprobante: tipoComprobante.value,
    metodoPago: metodoPago.value,
    montoRecibido: Number(montoRecibido.value),
    vuelto: Number(vuelto.value),
    total: Number(props.total),
    items: props.carrito.map((i) => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
  }
  if (tipoComprobante.value === 'Factura B') {
    payload.cliente = { condicion_iva: 'Consumidor Final', identificacion: '0' }
  } else if (tipoComprobante.value === 'Factura A') {
    payload.cliente = { condicion_iva: clienteFactura.value.condicion_iva, cuit: clienteFactura.value.cuit.trim(), razon_social: clienteFactura.value.razon_social.trim(), domicilio: clienteFactura.value.domicilio.trim() }
    const neto = Number((props.total / 1.21).toFixed(2))
    payload.impuestos = { subtotal_neto: neto, iva_21: Number((props.total - neto).toFixed(2)) }
  }
  emit('confirmarVenta', payload)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-contenedor {
  background: #ffffff; border-radius: 16px;
  width: 100%; max-width: 860px; max-height: 90vh;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
  border: 1px solid #e2e8f0; overflow: hidden;
  display: flex; flex-direction: column;
}

.modal-header {
  padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-header h2 { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }

/* Layout horizontal */
.modal-cuerpo {
  display: flex; overflow-y: auto;
}

/* Columna izquierda - resumen */
.col-resumen {
  width: 320px; flex-shrink: 0;
  background: #f8fafc; border-right: 1px solid #f1f5f9;
  padding: 1.25rem; display: flex; flex-direction: column;
}

.resumen-titulo {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 0.85rem;
}

.resumen-items { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.1rem; }

.resumen-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0; border-bottom: 1px solid #e8ecf0;
}
.resumen-item:last-child { border-bottom: none; }
.ri-nombre { flex: 1; font-size: 0.85rem; color: #334155; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ri-cant { font-size: 0.78rem; color: #94a3b8; min-width: 35px; text-align: center; }
.ri-sub { font-size: 0.85rem; font-weight: 600; color: #0f172a; min-width: 80px; text-align: right; }

.resumen-total-fila {
  display: flex; justify-content: space-between; align-items: baseline;
  padding-top: 0.85rem; margin-top: 0.85rem; border-top: 2px solid #e2e8f0;
  font-size: 0.9rem; font-weight: 600; color: #475569;
}
.resumen-total-monto { font-size: 1.3rem; font-weight: 800; color: #0f172a; }

/* Columna derecha - cobro */
.col-cobro {
  flex: 1; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1.1rem;
}

.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }

input, select {
  padding: 0.65rem 0.85rem; border: 1px solid #cbd5e1; border-radius: 8px;
  font-size: 0.9rem; outline: none; transition: all 0.2s; width: 100%; background: #ffffff; color: #1e293b;
}
input:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
select { cursor: pointer; }

.divisor { border: 0; border-top: 1px dashed #e5e7eb; margin: 0; }

.selector-pago { display: flex; gap: 0.75rem; }
.pilula-pago {
  flex: 1; background: #ffffff; border: 2px solid #e5e7eb; border-radius: 10px;
  padding: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; transition: all 0.15s; font-size: 0.88rem; font-weight: 600; color: #475569;
}
.pilula-pago:hover { border-color: #d1d5db; background: #f9fafb; }
.pilula-pago.activa { background: #eff6ff; border-color: #3b82f6; color: #1e40af; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
.pilula-icono { font-size: 1.1rem; }

.input-con-prefijo { position: relative; display: flex; align-items: center; }
.prefijo { position: absolute; left: 0.85rem; color: #9ca3af; font-weight: 500; }
.input-con-prefijo input { padding-left: 1.8rem; font-weight: 600; }

.bloque-vuelto {
  background: #ecfdf5; padding: 0.75rem; border-radius: 8px; border: 1px solid #a7f3d0;
  display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.4rem;
}
.vuelto-fila { display: flex; justify-content: space-between; font-size: 0.85rem; color: #065f46; }
.v-monto { font-weight: 600; }
.vuelto-final { border-top: 1px dashed #a7f3d0; padding-top: 0.4rem; }
.v-monto-final { font-size: 1.2rem; font-weight: 800; color: #047857; }

.advertencia { color: #b45309; background: #fffbeb; border: 1px solid #fef3c7; padding: 0.6rem; border-radius: 8px; font-size: 0.82rem; margin-top: 0.25rem; }

.bloque-transfer {
  background: #eff6ff; padding: 0.75rem; border-radius: 8px; border: 1px solid #bfdbfe;
  color: #1e40af; font-size: 0.85rem; text-align: center;
}

.btn-confirmar-cobro {
  width: 100%; padding: 0.8rem; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; color: #ffffff; cursor: pointer;
  transition: all 0.2s; margin-top: auto;
}
.btn-cash { background: #10b981; box-shadow: 0 4px 10px rgba(16,185,129,0.25); }
.btn-cash:hover:not(:disabled) { background: #059669; }
.btn-transfer { background: #3b82f6; box-shadow: 0 4px 10px rgba(59,130,246,0.25); }
.btn-transfer:hover:not(:disabled) { background: #2563eb; }
.btn-confirmar-cobro:disabled { background: #cbd5e1; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

.effecto-aparecer { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
