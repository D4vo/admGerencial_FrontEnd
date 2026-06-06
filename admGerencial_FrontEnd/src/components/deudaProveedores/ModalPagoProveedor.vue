<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h3>Registrar Pago a Proveedor</h3>
        <button class="btn-cerrar-X" @click="emit('close')">&times;</button>
      </header>

      <main class="modal-cuerpo" v-if="deuda">
        <div class="info-proveedor">
          <p><strong>Proveedor:</strong> {{ deuda.proveedor_cuenta }}</p>
          <p><strong>Código de Cuenta:</strong> {{ deuda.cuenta_codigo }}</p>
          <p><strong>Saldo Pendiente:</strong> <span class="saldo-resaltado">$ {{ deuda.saldo_pendiente.toFixed(2) }}</span></p>
        </div>

        <div class="form-grupo">
          <label>Monto a Pagar *</label>
          <div class="input-con-prefijo">
            <span class="prefijo">$</span>
            <input 
              type="number" 
              v-model.number="form.monto_pagado" 
              step="0.01" 
              placeholder="0.00"
              :class="{ 'error-borde': errorMonto }"
            />
          </div>
          <span v-if="errorMonto" class="txt-error">{{ mensajeErrorMonto }}</span>
        </div>

        <div class="form-grupo">
          <label>Método de Pago</label>
          <select v-model="form.metodo_pago">
            <option value="Efectivo">Efectivo (Cuenta Caja)</option>
            <option value="Transferencia">Transferencia (Cuenta Banco)</option>
          </select>
        </div>

        <div class="form-grupo">
          <label>Observaciones / Notas</label>
          <textarea 
            v-model="form.observaciones" 
            rows="3" 
            placeholder="Ej: Entrega a cuenta al preventista..."
          ></textarea>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="emit('close')">Cancelar</button>
        <button class="btn-confirmar" @click="confirmarPago">Confirmar Pago</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  deuda: { type: Object, default: null }
});

const emit = defineEmits(['close', 'confirm']);

const form = ref({
  monto_pagado: 0,
  metodo_pago: 'Efectivo',
  observaciones: ''
});

const errorMonto = ref(false);
const mensajeErrorMonto = ref('');

// Cada vez que se abre el modal con un proveedor, pre-cargamos el total del saldo pendiente
watch(() => props.deuda, (nuevaDeuda) => {
  if (nuevaDeuda) {
    form.value.monto_pagado = nuevaDeuda.saldo_pendiente;
    form.value.metodo_pago = 'Efectivo';
    form.value.observaciones = '';
    errorMonto.value = false;
  }
}, { immediate: true });

const confirmarPago = () => {
  if (!form.value.monto_pagado || form.value.monto_pagado <= 0) {
    errorMonto.value = true;
    mensajeErrorMonto.value = 'El monto debe ser mayor a cero.';
    return;
  }
  
  if (form.value.monto_pagado > props.deuda.saldo_pendiente) {
    errorMonto.value = true;
    mensajeErrorMonto.value = 'El monto no puede superar el saldo pendiente.';
    return;
  }

  errorMonto.value = false;
  emit('confirm', { ...form.value });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-contenedor {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #111827; font-weight: 600; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; }
.btn-cerrar-X:hover { color: #374151; }

.modal-cuerpo { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.info-proveedor {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  font-size: 0.95rem;
}
.info-proveedor p { margin: 0 0 0.5rem 0; color: #4b5563; }
.info-proveedor p:last-child { margin-bottom: 0; }
.saldo-resaltado { color: #111827; font-weight: 700; }

.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem; }
input, select, textarea {
  padding: 0.65rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9fafb;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}
input:focus, select:focus, textarea:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.input-con-prefijo { position: relative; display: flex; align-items: center; }
.prefijo { position: absolute; left: 0.8rem; color: #6b7280; font-weight: 500; }
.input-con-prefijo input { padding-left: 1.8rem; width: 100%; }

.error-borde { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.txt-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.4rem; font-weight: 500; }

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn-cancelar {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancelar:hover { background: #f3f4f6; }
.btn-confirmar {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-confirmar:hover { background: #2563eb; }
</style>