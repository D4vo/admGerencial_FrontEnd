<template>
  <div class="card-resumen">
    <h3 class="titulo-panel">Resumen y Documento</h3>
    
    <div class="form-documento">
      <div class="grupo">
        <label>Tipo de Comprobante</label>
        <select v-model="cabecera.tipo_comprobante">
          <option value="Factura A">Factura A</option>
          <option value="Factura B">Factura B</option>
          <option value="Factura C">Factura C</option>
          <option value="Remito">Remito</option>
          <option value="Ticket">Ticket</option>
        </select>
      </div>
      <div class="grupo">
        <label>Nº de Comprobante *</label>
        <input 
          type="text" 
          v-model="cabecera.nro_comprobante" 
          placeholder="Ej: 0001-00001234" 
          :class="{'error-borde': errorValidacion}"
        />
        <span v-if="errorValidacion" class="msj-error">Obligatorio para guardar</span>
      </div>
    </div>

    <hr class="divisor" />

    <div class="total-fila">
      <span class="label-total">Total a Pagar</span>
      <span class="monto-total">$ {{ total.toFixed(2) }}</span>
    </div>
    
    <button 
      class="btn-confirmar" 
      @click="emitirConfirmacion" 
      :disabled="cargando || total === 0"
    >
      {{ cargando ? 'Guardando...' : 'Confirmar Compra' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  total: { type: Number, required: true },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits(['confirmar-compra'])

const cabecera = ref({ tipo_comprobante: 'Factura A', nro_comprobante: '' })
const errorValidacion = ref(false)

const emitirConfirmacion = () => {
  if (!cabecera.value.nro_comprobante || cabecera.value.nro_comprobante.trim() === '') {
    errorValidacion.value = true
    return
  }
  errorValidacion.value = false
  emit('confirmar-compra', { ...cabecera.value })
}

const resetearFormulario = () => {
  cabecera.value = { tipo_comprobante: 'Factura A', nro_comprobante: '' }
  errorValidacion.value = false
}

defineExpose({ resetearFormulario })
</script>

<style scoped>
.card-resumen { 
  background: #ffffff; 
  padding: 1.5rem; 
  border-radius: 12px; 
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); 
  border: 1px solid #f3f4f6;
}
.titulo-panel { margin-top: 0; margin-bottom: 1.5rem; color: #111827; font-size: 1.15rem; font-weight: 600; }
.form-documento { display: flex; flex-direction: column; gap: 1.25rem; }
.grupo { display: flex; flex-direction: column; }
label { font-size: 0.85rem; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem; }
input, select { 
  padding: 0.65rem 0.8rem; 
  border: 1px solid #e5e7eb; 
  border-radius: 8px; 
  font-size: 0.95rem; 
  background-color: #f9fafb;
  color: #1f2937;
  outline: none; 
  transition: all 0.2s;
}
input:focus, select:focus { border-color: #10b981; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.error-borde { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.msj-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.4rem; font-weight: 500; }
.divisor { border: 0; border-top: 1px dashed #e5e7eb; margin: 1.5rem 0; }
.total-fila { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 2rem; }
.label-total { font-size: 0.9rem; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.monto-total { font-size: 2.2rem; font-weight: 700; color: #111827; line-height: 1; }
.btn-confirmar { 
  width: 100%; 
  padding: 0.85rem; 
  background: #10b981; /* Verde característico */
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-size: 1.05rem; 
  font-weight: 600; 
  cursor: pointer; 
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}
.btn-confirmar:hover:not(:disabled) { background: #059669; }
.btn-confirmar:active:not(:disabled) { transform: scale(0.98); }
.btn-confirmar:disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; color: #9ca3af; }
</style>