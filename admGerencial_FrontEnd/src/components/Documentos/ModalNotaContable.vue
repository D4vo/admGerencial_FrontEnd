<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h2>{{ documento?.tipo_operacion === 'Compra' ? 'Registrar' : 'Emitir' }} Nota Contable</h2>
        <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
      </header>

      <main class="modal-cuerpo" v-if="documento">
        <div class="bloque-contexto">
          <div class="info-doc">
            <span class="label">Comprobante Original:</span>
            <span class="valor">{{ documento.tipo_comprobante }} N° {{ documento.nro_comprobante }}</span>
          </div>
          <div class="info-doc">
            <span class="label">Operación:</span>
            <span class="valor">{{ documento.tipo_operacion }} a {{ documento.entidad_nombre }}</span>
          </div>
        </div>

        <div class="grid-form">
          <div class="form-grupo">
            <label>Tipo de Documento</label>
            <select v-model="formulario.tipoNota">
              <option value="Nota de Crédito">Nota de Crédito</option>
              <option value="Nota de Débito">Nota de Débito</option>
            </select>
          </div>

          <div class="form-grupo" v-if="documento.tipo_operacion === 'Compra'">
            <label>N° Comprobante Recibido <span class="req">*</span></label>
            <input type="text" v-model="formulario.nro_comprobante_recibido" placeholder="Ej: 0004-00008891" />
          </div>
        </div>

        <div class="form-grupo">
          <label>Motivo <span class="req">*</span></label>
          <input type="text" v-model="formulario.motivo" placeholder="Ej: Devolución por empaque dañado" />
        </div>

        <hr class="divisor" />

        <div class="form-grupo">
          <label>Naturaleza del Ajuste</label>
          <div class="selector-pago">
            <button class="pilula-pago cash" :class="{ 'activa': tipoAjuste === 'stock' }" @click="tipoAjuste = 'stock'">
              <span class="icono">📦</span>
              <span class="texto">Ajuste Físico<br><small>(Devolución Stock)</small></span>
            </button>
            <button class="pilula-pago transfer" :class="{ 'activa': tipoAjuste === 'precio' }" @click="tipoAjuste = 'precio'">
              <span class="icono">💰</span>
              <span class="texto">Ajuste Financiero<br><small>(Solo Dinero/Precio)</small></span>
            </button>
          </div>
        </div>

        <div class="seccion-items effecto-aparecer" v-if="tipoAjuste === 'stock'">
          <div class="items-header">
            <h4>Ítems Afectados</h4>
            <button class="btn-atajo" @click="aplicarDevolucionTotal">Devolución Total</button>
          </div>
          <div class="tabla-items">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant. Orig.</th>
                  <th>Cant. a Modificar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsAfectados" :key="item.producto_id">
                  <td>{{ item.nombre }}</td>
                  <td class="text-center">{{ item.cantidad }}</td>
                  <td class="td-input"><input type="number" v-model.number="item.cantidad_devolver" min="0" :max="item.cantidad" class="input-cant"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="seccion-financiera effecto-aparecer" v-else>
          <div class="form-grupo">
            <label>Seleccionar Producto a Ajustar *</label>
            <select v-model="productoSeleccionadoPrecio">
              <option :value="null" disabled>Elegir producto...</option>
              <option v-for="item in itemsAfectados" :key="item.producto_id" :value="item">
                {{ item.nombre }}
              </option>
            </select>
          </div>
          
          <div class="grid-form">
            <div class="form-grupo">
              <label>{{ documento.tipo_operacion === 'Compra' ? 'Nuevo Costo' : 'Nuevo Precio' }} *</label>
              <input type="number" v-model.number="nuevoValorCatalogo" placeholder="0.00" />
            </div>
            <div class="form-grupo">
              <label>Diferencia Total ($) *</label>
              <input type="number" v-model.number="montoAjusteLibre" placeholder="0.00" />
            </div>
          </div>
        </div>

        <div class="resumen-total">
          <span>Total Modificado:</span>
          <span class="monto-total">$ {{ totalModificado.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
        <button class="btn-confirmar" :disabled="!puedeConfirmar" @click="confirmarNota">Confirmar y Guardar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  documento: { type: Object, default: null }
});

const emit = defineEmits(['close', 'confirmar']);

const formulario = ref({ tipoNota: 'Nota de Crédito', motivo: '', nro_comprobante_recibido: '' });
const tipoAjuste = ref('stock');
const productoSeleccionadoPrecio = ref(null);
const nuevoValorCatalogo = ref(0);
const montoAjusteLibre = ref(0);
const itemsAfectados = ref([]);

watch(() => props.show, (isOpen) => {
  if (isOpen && props.documento) {
    formulario.value = { tipoNota: 'Nota de Crédito', motivo: '', nro_comprobante_recibido: '' };
    tipoAjuste.value = 'stock';
    itemsAfectados.value = props.documento.items_originales.map(item => ({ ...item, cantidad_devolver: 0 }));
    productoSeleccionadoPrecio.value = null;
    nuevoValorCatalogo.value = 0;
    montoAjusteLibre.value = 0;
  }
});

const aplicarDevolucionTotal = () => itemsAfectados.value.forEach(item => item.cantidad_devolver = item.cantidad);

const totalModificado = computed(() => {
  if (tipoAjuste.value === 'stock') {
    return itemsAfectados.value.reduce((acc, item) => acc + (item.cantidad_devolver * item.precio_unitario), 0);
  }
  return Number(montoAjusteLibre.value) || 0;
});

const puedeConfirmar = computed(() => {
  if (!formulario.value.motivo.trim()) return false;
  if (props.documento?.tipo_operacion === 'Compra' && !formulario.value.nro_comprobante_recibido.trim()) return false;
  if (tipoAjuste.value === 'precio' && !productoSeleccionadoPrecio.value) return false;
  return totalModificado.value > 0;
});

const confirmarNota = () => {
  if (!puedeConfirmar.value) return;

  const letraOriginal = props.documento.tipo_comprobante.split(' ').pop();
  const tipoDocumentoFinal = `${formulario.value.tipoNota} ${letraOriginal}`;

  let payload = {
    comprobante_padre_id: props.documento.id,
    tipo_comprobante: tipoDocumentoFinal,
    motivo: formulario.value.motivo.trim(),
    total_modificado: totalModificado.value
  };

  if (props.documento.tipo_operacion === 'Compra') {
    payload.nro_comprobante_recibido = formulario.value.nro_comprobante_recibido.trim();
  }

  if (tipoAjuste.value === 'stock') {
    payload.items_afectados = itemsAfectados.value
      .filter(p => p.cantidad_devolver > 0)
      .map(p => ({ producto_id: p.producto_id, cantidad: p.cantidad_devolver, precio_unitario: p.precio_unitario }));
  } else {
    // ESCENARIO FINANCIERO (cantidad: 0 indica no mover stock)
    let itemFinanciero = {
      producto_id: productoSeleccionadoPrecio.value.producto_id,
      cantidad: 0,
      precio_unitario: productoSeleccionadoPrecio.value.precio_unitario
    };
    
    if (props.documento.tipo_operacion === 'Compra') {
      itemFinanciero.nuevo_costo = nuevoValorCatalogo.value;
    } else {
      itemFinanciero.nuevo_precio = nuevoValorCatalogo.value;
    }
    payload.items_afectados = [itemFinanciero];
  }

  emit('confirmar', { payload, tipoOperacion: props.documento.tipo_operacion });
};

const cerrarModal = () => emit('close');
</script>

<style scoped>
/* Estilos actualizados */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal-contenedor { background: #ffffff; border-radius: 16px; width: 100%; max-width: 680px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; overflow: hidden; max-height: 95vh; display: flex; flex-direction: column; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }
.modal-cuerpo { padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; }
.bloque-contexto { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 0.5rem; }
.info-doc .label { font-size: 0.85rem; color: #64748b; margin-right: 0.5rem; }
.info-doc .valor { font-size: 0.95rem; color: #0f172a; font-weight: 600; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.5rem; }
.req { color: #ef4444; }
.divisor { border: 0; border-top: 1px dashed #e5e7eb; margin: 0.25rem 0; }
.selector-pago { display: flex; gap: 1rem; }
.pilula-pago { flex: 1; background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s ease; text-align: left; }
.pilula-pago .icono { font-size: 1.5rem; }
.pilula-pago .texto { font-size: 0.85rem; font-weight: 600; color: #4b5563; line-height: 1.2; }
.pilula-pago .texto small { font-weight: 500; color: #94a3b8; }
.pilula-pago:hover { border-color: #d1d5db; background: #f8fafc; }
.pilula-pago.cash.activa { background: #eff6ff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.pilula-pago.cash.activa .texto { color: #1e40af; }
.pilula-pago.transfer.activa { background: #fef2f2; border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
.pilula-pago.transfer.activa .texto { color: #991b1b; }
input, select { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: all 0.2s; width: 100%; }
input:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.seccion-items { margin-top: 0.5rem; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.items-header { padding: 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.items-header h4 { margin: 0; font-size: 1rem; color: #0f172a; }
.btn-atajo { background: #ffffff; border: 1px solid #cbd5e1; color: #10b981; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.btn-atajo:hover { background: #ecfdf5; border-color: #a7f3d0; }
.tabla-items table { width: 100%; border-collapse: collapse; text-align: left; }
.tabla-items th { padding: 0.75rem 1rem; font-size: 0.8rem; color: #64748b; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
.tabla-items td { padding: 0.75rem 1rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.text-center { text-align: center; } .text-right { text-align: right; }
.td-input { padding: 0.5rem 1rem !important; }
.input-cant { width: 80px; text-align: center; padding: 0.4rem; }
.resumen-total { background: #f1f5f9; padding: 1rem; display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: #334155; }
.monto-total { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.seccion-financiera { margin-top: 0.5rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 1.25rem; }
.modal-footer { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-cancelar { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-confirmar { background: #3b82f6; border: none; color: white; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-confirmar:hover:not(:disabled) { background: #2563eb; }
.btn-confirmar:disabled { background: #cbd5e1; cursor: not-allowed; }
.effecto-aparecer { animation: fadeInDown 0.3s ease-out; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>