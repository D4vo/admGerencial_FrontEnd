<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h2>{{ esCompra ? 'Registrar' : 'Emitir' }} Nota Contable</h2>
        <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
      </header>

      <main class="modal-cuerpo" v-if="documento">
        <!-- Contexto del comprobante original -->
        <div class="bloque-contexto">
          <div class="contexto-titulo">Comprobante Original</div>
          <div class="contexto-grid">
            <div class="info-doc">
              <span class="label">Comprobante:</span>
              <span class="valor">{{ documento.tipo_comprobante }} N° {{ documento.nro_comprobante }}</span>
            </div>
            <div class="info-doc">
              <span class="label">Operación:</span>
              <span class="valor">{{ documento.tipo_operacion }}</span>
            </div>
            <div class="info-doc">
              <span class="label">Entidad:</span>
              <span class="valor">{{ documento.entidad_nombre || '-' }}</span>
            </div>
            <div class="info-doc">
              <span class="label">Total original:</span>
              <span class="valor">$ {{ Number(documento.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Tipo de nota y datos -->
        <div class="grid-form">
          <div class="form-grupo">
            <label>Tipo de Nota *</label>
            <select v-model="formulario.tipoNota">
              <option value="Nota de Crédito">Nota de Crédito</option>
              <option value="Nota de Débito">Nota de Débito</option>
            </select>
            <span class="hint">{{ hintTipoNota }}</span>
          </div>

          <div class="form-grupo" v-if="esCompra">
            <label>N° Comprobante Recibido *</label>
            <input type="text" v-model="formulario.nro_comprobante_recibido" placeholder="Ej: 0004-00008891" />
          </div>
        </div>

        <div class="form-grupo">
          <label>Motivo *</label>
          <input type="text" v-model="formulario.motivo" placeholder="Ej: Devolución por producto dañado" />
        </div>

        <hr class="divisor" />

        <!-- Selector de naturaleza del ajuste -->
        <div class="form-grupo">
          <label>Naturaleza del ajuste</label>
          <div class="selector-naturaleza">
            <button
              :class="['opcion-naturaleza', { activa: tipoAjuste === 'stock' }]"
              @click="tipoAjuste = 'stock'"
            >
              <span class="opcion-icono">📦</span>
              <div class="opcion-textos">
                <span class="opcion-titulo">Ajuste físico</span>
                <span class="opcion-desc">{{ esCredito ? 'Devolución de mercadería' : 'Mercadería adicional' }}</span>
              </div>
            </button>
            <button
              :class="['opcion-naturaleza', { activa: tipoAjuste === 'precio' }]"
              @click="tipoAjuste = 'precio'"
            >
              <span class="opcion-icono">💲</span>
              <div class="opcion-textos">
                <span class="opcion-titulo">Ajuste financiero</span>
                <span class="opcion-desc">Modificación de {{ esCompra ? 'costo' : 'precio' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- ========== AJUSTE FÍSICO ========== -->
        <div v-if="tipoAjuste === 'stock'" class="seccion-items effecto-aparecer">
          <div class="stock-contexto" :class="esCredito ? 'ctx-credito' : 'ctx-debito'">
            <span class="ctx-icono">{{ esCredito ? '↩' : '↪' }}</span>
            <span class="ctx-texto">{{ descripcionAjusteFisico }}</span>
          </div>
          <div class="items-header">
            <h4>{{ esCredito ? 'Productos a devolver' : 'Productos adicionales' }}</h4>
            <button v-if="esCredito" class="btn-atajo" @click="aplicarDevolucionTotal">Devolución total</button>
          </div>
          <div class="tabla-items-scroll">
            <table class="tabla-items">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant. original</th>
                  <th class="text-center">{{ esCredito ? 'Cant. a devolver' : 'Cant. adicional' }}</th>
                  <th class="text-right">{{ labelPrecio }}</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsAfectados" :key="item.producto_id">
                  <td>{{ item.nombre }}</td>
                  <td class="text-center text-muted">{{ item.cantidad }}</td>
                  <td class="td-input">
                    <input
                      type="number"
                      v-model.number="item.cantidad_devolver"
                      min="0"
                      :max="esCredito ? item.cantidad : 9999"
                      class="input-cant"
                    />
                  </td>
                  <td class="text-right text-muted">$ {{ Number(item.precio_unitario).toFixed(2) }}</td>
                  <td class="text-right font-semi">$ {{ (item.cantidad_devolver * item.precio_unitario).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========== AJUSTE FINANCIERO ========== -->
        <div v-else class="seccion-financiera effecto-aparecer">
          <div class="form-grupo">
            <label>Producto a ajustar *</label>
            <select v-model="productoSeleccionadoPrecio" @change="nuevoValorCatalogo = null">
              <option :value="null" disabled>Seleccionar producto...</option>
              <option v-for="item in itemsAfectados" :key="item.producto_id" :value="item">
                {{ item.nombre }} — {{ labelPrecio }} actual: $ {{ Number(item.precio_unitario).toFixed(2) }} × {{ item.cantidad }} u.
              </option>
            </select>
          </div>

          <template v-if="productoSeleccionadoPrecio">
            <div class="detalle-producto-seleccionado">
              <div class="info-fila">
                <span class="info-label">{{ labelPrecio }} original:</span>
                <span class="info-valor">$ {{ Number(productoSeleccionadoPrecio.precio_unitario).toFixed(2) }}</span>
              </div>
              <div class="info-fila">
                <span class="info-label">Cantidad en comprobante:</span>
                <span class="info-valor">{{ productoSeleccionadoPrecio.cantidad }} unidades</span>
              </div>
            </div>

            <div class="form-grupo">
              <label>Nuevo {{ labelPrecio.toLowerCase() }} unitario *</label>
              <input
                type="number"
                v-model.number="nuevoValorCatalogo"
                step="0.01"
                min="0"
                placeholder="Ingrese el valor corregido"
                :class="{ 'input-error': errorFinanciero }"
              />
              <span v-if="errorFinanciero" class="error-msg">{{ errorFinanciero }}</span>
            </div>

            <!-- Cálculo automático -->
            <div v-if="diferenciaCalculada !== null && !errorFinanciero" class="calculo-automatico">
              <div class="calculo-fila">
                <span>Diferencia unitaria:</span>
                <span>$ {{ Math.abs(diferenciaUnitaria).toFixed(2) }} {{ diferenciaUnitaria > 0 ? '(aumento)' : '(disminución)' }}</span>
              </div>
              <div class="calculo-fila">
                <span>× {{ productoSeleccionadoPrecio.cantidad }} unidades</span>
                <span></span>
              </div>
              <div class="calculo-fila calculo-total">
                <span>Total de la nota:</span>
                <span>$ {{ diferenciaCalculada.toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Resumen -->
        <div class="resumen-total" :class="{ 'resumen-error': totalModificado <= 0 && tieneIntento }">
          <span>Total de la nota:</span>
          <span class="monto-total">$ {{ totalModificado.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
        <button class="btn-confirmar" :disabled="!puedeConfirmar" @click="confirmarNota">
          Confirmar y registrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  documento: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirmar'])

const formulario = ref({ tipoNota: 'Nota de Crédito', motivo: '', nro_comprobante_recibido: '' })
const tipoAjuste = ref('stock')
const productoSeleccionadoPrecio = ref(null)
const nuevoValorCatalogo = ref(null)
const itemsAfectados = ref([])
const tieneIntento = ref(false)

const esCompra = computed(() => props.documento?.tipo_operacion === 'Compra')
const esCredito = computed(() => formulario.value.tipoNota === 'Nota de Crédito')
const labelPrecio = computed(() => (esCompra.value ? 'Costo unit.' : 'Precio unit.'))

const descripcionAjusteFisico = computed(() => {
  if (esCompra.value) {
    return esCredito.value
      ? 'Devolvemos mercadería al proveedor. El stock se reduce y nuestra deuda/pago disminuye.'
      : 'El proveedor nos envía mercadería adicional. El stock aumenta y nuestra deuda/pago aumenta.'
  }
  return esCredito.value
    ? 'El cliente nos devuelve mercadería. Nuestro stock aumenta y devolvemos dinero al cliente.'
    : 'Enviamos mercadería adicional al cliente. Nuestro stock disminuye y el cliente nos debe más.'
})

const hintTipoNota = computed(() => {
  if (esCompra.value) {
    return esCredito.value
      ? 'NC del proveedor: devolvemos mercadería o se reduce el costo/deuda.'
      : 'ND del proveedor: aumenta el costo o nos envía mercadería adicional.'
  }
  return esCredito.value
    ? 'NC al cliente: recibimos devolución o reducimos el precio cobrado.'
    : 'ND al cliente: cargo adicional por aumento de precio o faltante.'
})

// Diferencia unitaria: nuevo - original
const diferenciaUnitaria = computed(() => {
  if (!productoSeleccionadoPrecio.value || nuevoValorCatalogo.value == null) return null
  return nuevoValorCatalogo.value - productoSeleccionadoPrecio.value.precio_unitario
})

// Validación: NC exige que el nuevo valor sea MENOR, ND exige que sea MAYOR
const errorFinanciero = computed(() => {
  if (!productoSeleccionadoPrecio.value || nuevoValorCatalogo.value == null) return null
  const diff = diferenciaUnitaria.value
  if (diff === 0) return 'El nuevo valor es igual al original. No hay ajuste.'

  if (esCredito.value && diff > 0) {
    return `Una Nota de Crédito implica una disminución. El nuevo ${esCompra.value ? 'costo' : 'precio'} debe ser menor al original.`
  }
  if (!esCredito.value && diff < 0) {
    return `Una Nota de Débito implica un aumento. El nuevo ${esCompra.value ? 'costo' : 'precio'} debe ser mayor al original.`
  }
  if (nuevoValorCatalogo.value < 0) return 'El valor no puede ser negativo.'
  return null
})

// Diferencia total calculada automáticamente
const diferenciaCalculada = computed(() => {
  if (diferenciaUnitaria.value == null || errorFinanciero.value) return null
  return Math.abs(diferenciaUnitaria.value) * productoSeleccionadoPrecio.value.cantidad
})

const totalModificado = computed(() => {
  if (tipoAjuste.value === 'stock') {
    return itemsAfectados.value.reduce(
      (acc, item) => acc + item.cantidad_devolver * item.precio_unitario,
      0,
    )
  }
  return diferenciaCalculada.value ?? 0
})

const puedeConfirmar = computed(() => {
  if (!formulario.value.motivo.trim()) return false
  if (esCompra.value && !formulario.value.nro_comprobante_recibido.trim()) return false
  if (tipoAjuste.value === 'precio') {
    if (!productoSeleccionadoPrecio.value) return false
    if (errorFinanciero.value) return false
    if (diferenciaCalculada.value == null || diferenciaCalculada.value <= 0) return false
  }
  return totalModificado.value > 0
})

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen && props.documento) {
      formulario.value = { tipoNota: 'Nota de Crédito', motivo: '', nro_comprobante_recibido: '' }
      tipoAjuste.value = 'stock'
      itemsAfectados.value = (props.documento.items_originales || []).map((item) => ({
        ...item,
        cantidad_devolver: 0,
      }))
      productoSeleccionadoPrecio.value = null
      nuevoValorCatalogo.value = null
      tieneIntento.value = false
    }
  },
)

watch(() => formulario.value.tipoNota, () => {
  nuevoValorCatalogo.value = null
  itemsAfectados.value.forEach((i) => (i.cantidad_devolver = 0))
})

const aplicarDevolucionTotal = () =>
  itemsAfectados.value.forEach((item) => (item.cantidad_devolver = item.cantidad))

const confirmarNota = () => {
  tieneIntento.value = true
  if (!puedeConfirmar.value) return

  const letraOriginal = props.documento.tipo_comprobante.split(' ').pop()
  const tipoDocumentoFinal = `${formulario.value.tipoNota} ${letraOriginal}`

  const payload = {
    comprobante_padre_id: props.documento.id,
    tipo_comprobante: tipoDocumentoFinal,
    motivo: formulario.value.motivo.trim(),
    total_modificado: totalModificado.value,
  }

  if (esCompra.value) {
    payload.nro_comprobante_recibido = formulario.value.nro_comprobante_recibido.trim()
  }

  if (tipoAjuste.value === 'stock') {
    payload.items_afectados = itemsAfectados.value
      .filter((p) => p.cantidad_devolver > 0)
      .map((p) => ({
        producto_id: p.producto_id,
        cantidad: p.cantidad_devolver,
        precio_unitario: p.precio_unitario,
      }))
  } else {
    const itemFinanciero = {
      producto_id: productoSeleccionadoPrecio.value.producto_id,
      cantidad: 0,
      precio_unitario: productoSeleccionadoPrecio.value.precio_unitario,
    }
    if (esCompra.value) {
      itemFinanciero.nuevo_costo = nuevoValorCatalogo.value
    } else {
      itemFinanciero.nuevo_precio = nuevoValorCatalogo.value
    }
    payload.items_afectados = [itemFinanciero]
  }

  emit('confirmar', { payload, tipoOperacion: props.documento.tipo_operacion })
}

const cerrarModal = () => emit('close')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.modal-contenedor {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  max-height: 90vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-cuerpo {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
  min-height: 0;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 700;
}

.btn-cerrar-X {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
}
.btn-cerrar-X:hover { color: #ef4444; }

/* Contexto */
.bloque-contexto {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.contexto-titulo {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 0.6rem;
}

.contexto-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem 1.5rem;
}

.info-doc .label {
  font-size: 0.82rem;
  color: #64748b;
  margin-right: 0.35rem;
}

.info-doc .valor {
  font-size: 0.88rem;
  color: #0f172a;
  font-weight: 600;
}

/* Form */
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-grupo {
  display: flex;
  flex-direction: column;
}

.form-grupo label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.3rem;
  line-height: 1.3;
}

input,
select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  background: #ffffff;
}

input:focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-msg {
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 0.35rem;
  line-height: 1.3;
  font-weight: 500;
}

.divisor {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0;
}

/* Selector de naturaleza */
.selector-naturaleza {
  display: flex;
  gap: 0.75rem;
}

.opcion-naturaleza {
  flex: 1;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  text-align: left;
}

.opcion-naturaleza:hover {
  border-color: #d1d5db;
  background: #f8fafc;
}

.opcion-naturaleza.activa {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.opcion-icono { font-size: 1.3rem; }

.opcion-textos {
  display: flex;
  flex-direction: column;
}

.opcion-titulo {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.opcion-desc {
  font-size: 0.73rem;
  color: #94a3b8;
}

/* Items - Ajuste Físico */
.stock-contexto {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}
.ctx-credito { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.ctx-debito { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
.ctx-icono { font-size: 1.1rem; flex-shrink: 0; }
.ctx-texto { font-weight: 500; }

.seccion-items {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.tabla-items-scroll {
  max-height: 280px;
  overflow-y: auto;
}

.items-header {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-header h4 {
  margin: 0;
  font-size: 0.88rem;
  color: #0f172a;
  font-weight: 600;
}

.btn-atajo {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #10b981;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-atajo:hover {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.tabla-items {
  width: 100%;
  border-collapse: collapse;
}

.tabla-items th {
  padding: 0.6rem 0.85rem;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.tabla-items td {
  padding: 0.6rem 0.85rem;
  font-size: 0.88rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-muted { color: #94a3b8; }
.font-semi { font-weight: 600; }

.td-input { text-align: center; }

.input-cant {
  width: 70px;
  text-align: center;
  padding: 0.35rem;
  border-radius: 6px;
}

/* Ajuste Financiero */
.seccion-financiera {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detalle-producto-seleccionado {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.info-label {
  color: #64748b;
  font-weight: 500;
}

.info-valor {
  color: #0f172a;
  font-weight: 600;
}

.calculo-automatico {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.calculo-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #475569;
}

.calculo-total {
  border-top: 1px solid #bbf7d0;
  padding-top: 0.4rem;
  margin-top: 0.2rem;
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
}

/* Resumen */
.resumen-total {
  background: #f1f5f9;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}

.resumen-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.monto-total {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancelar {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar:hover { background: #f3f4f6; }

.btn-confirmar {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirmar:hover:not(:disabled) { background: #2563eb; }
.btn-confirmar:disabled { background: #cbd5e1; cursor: not-allowed; }

.effecto-aparecer {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
