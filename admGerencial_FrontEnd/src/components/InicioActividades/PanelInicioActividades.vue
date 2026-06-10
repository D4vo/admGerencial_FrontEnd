<template>
  <div class="card-inicio">
    <div class="card-header">
      <h3>Saldos Iniciales</h3>
      <p class="text-muted">Ingrese el dinero disponible al momento de iniciar las operaciones.</p>
    </div>

    <div class="card-body">
      <div class="form-grupo">
        <label>Monto en Efectivo (Caja) *</label>
        <div class="input-con-prefijo">
          <span class="prefijo">$</span>
          <input 
            type="number" 
            v-model.number="saldos.monto_caja" 
            placeholder="0.00" 
            min="0"
            step="0.01"
            :class="{'error-borde': errorValidacion && saldos.monto_caja < 0}"
          />
        </div>
      </div>

      <div class="form-grupo">
        <label>Monto en Cuenta Bancaria (Banco) *</label>
        <div class="input-con-prefijo">
          <span class="prefijo">$</span>
          <input 
            type="number" 
            v-model.number="saldos.monto_banco" 
            placeholder="0.00" 
            min="0"
            step="0.01"
            :class="{'error-borde': errorValidacion && saldos.monto_banco < 0}"
          />
        </div>
      </div>

      <span v-if="errorValidacion" class="msj-error">Los montos no pueden ser negativos.</span>
    </div>

    <div class="card-footer">
      <div class="resumen-total">
        <span>Capital Total Inicial:</span>
        <span class="monto-total">$ {{ capitalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
      </div>
      <button 
        class="btn-confirmar" 
        @click="emitirConfirmacion" 
        :disabled="cargando"
      >
        {{ cargando ? 'Registrando...' : 'Registrar Inicio' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

defineProps({
  cargando: { type: Boolean, default: false }
});

const emit = defineEmits(['confirmar']);

const saldos = ref({
  monto_caja: 0,
  monto_banco: 0
});

const errorValidacion = ref(false);

const capitalTotal = computed(() => {
  const caja = Number(saldos.value.monto_caja) || 0;
  const banco = Number(saldos.value.monto_banco) || 0;
  return caja + banco;
});

const emitirConfirmacion = () => {
  if (saldos.value.monto_caja < 0 || saldos.value.monto_banco < 0) {
    errorValidacion.value = true;
    return;
  }
  
  errorValidacion.value = false;
  // Emitimos una copia de los valores asegurándonos de que sean números
  emit('confirmar', { 
    monto_caja: Number(saldos.value.monto_caja), 
    monto_banco: Number(saldos.value.monto_banco) 
  });
};

const resetearFormulario = () => {
  saldos.value = { monto_caja: 0, monto_banco: 0 };
  errorValidacion.value = false;
};

// Exponemos el método para que el padre pueda limpiar el form tras el éxito
defineExpose({ resetearFormulario });
</script>

<style scoped>
.card-inicio {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  max-width: 500px; /* Mantiene la tarjeta en un tamaño legible */
}

.card-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.card-header h3 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
}

.text-muted {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grupo {
  display: flex;
  flex-direction: column;
}

.form-grupo label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-con-prefijo {
  position: relative;
  display: flex;
  align-items: center;
}

.prefijo {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
  outline: none;
  transition: all 0.2s;
}

input:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-borde { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.msj-error { color: #ef4444; font-size: 0.8rem; font-weight: 500; }

.card-footer {
  padding: 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.resumen-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #eff6ff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-weight: 600;
}

.monto-total {
  font-size: 1.25rem;
  font-weight: 800;
}

.btn-confirmar {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirmar:hover:not(:disabled) {
  background: #059669;
}

.btn-confirmar:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  color: #9ca3af;
}
</style>