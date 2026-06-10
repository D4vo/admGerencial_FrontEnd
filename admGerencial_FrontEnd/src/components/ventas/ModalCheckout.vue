<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor">
      <header class="modal-header">
        <h2>Confirmar Cobro Venta</h2>
        <button class="btn-cerrar-X" @click="emit('close')">&times;</button>
      </header>

      <main class="modal-cuerpo">
        <div class="bloque-total">
          <span class="total-label">TOTAL A COBRAR</span>
          <span class="total-monto">$ {{ total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
        </div>

        <div class="form-grupo">
          <label>Método de Pago</label>
          <div class="selector-pago">
            <button 
              class="pilula-pago cash" 
              :class="{ 'activa': metodoPago === 'Efectivo' }" 
              @click="setMetodo('Efectivo')"
            >
              <span class="icono">💵</span>
              <span class="texto">Efectivo</span>
            </button>
            <button 
              class="pilula-pago transfer" 
              :class="{ 'activa': metodoPago === 'Transferencia' }" 
              @click="setMetodo('Transferencia')"
            >
              <span class="icono">📲</span>
              <span class="texto">Transferencia</span>
            </button>
          </div>
        </div>

        <div v-if="metodoPago === 'Efectivo'" class="bloque-entrada effecto-aparecer">
          <div class="form-grupo">
            <label>Monto Recibido (Caja)</label>
            <div class="input-con-prefijo">
              <span class="prefijo">$</span>
              <input 
                ref="inputRecibido"
                type="number" 
                v-model.number="montoRecibido" 
                placeholder="0.00" 
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div class="bloque-vuelto" v-if="montoRecibido >= total">
            <div class="vuelto-item recibio">
              <span class="label">Recibió:</span>
              <span class="monto">$ {{ montoRecibido.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="vuelto-item cambio">
              <span class="label">Vuelto:</span>
              <span class="monto-final">$ {{ vuelto.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <div class="advertencia" v-if="montoRecibido < total && montoRecibido > 0">
            ⚠ El monto recibido es menor al total.
          </div>
        </div>

        <div v-if="metodoPago === 'Transferencia'" class="bloque-entrada transfer-info effecto-aparecer">
          <p>Se asume cobro completo por transferencia contable a Banco.</p>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="emit('close')">Cancelar</button>
        <button 
          class="btn-confirmar" 
          :class="claseBotonConfirmar"
          :disabled="!puedeConfirmar" 
          @click="confirmar"
        >
          {{ textoBotonConfirmar }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  carrito: { type: Array, required: true },
  total: { type: Number, required: true }
});

const emit = defineEmits(['close', 'confirmarVenta']);

// Estados reactivos
const metodoPago = ref('Efectivo');
const montoRecibido = ref(0);
const inputRecibido = ref(null);

// Reinicio del formulario y auto-focus al abrir
watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    metodoPago.value = 'Efectivo';
    montoRecibido.value = props.total;
    // Esperamos un "tick" de Vue para que el input sea visible y le damos foco
    await nextTick();
    inputRecibido.value?.focus();
    inputRecibido.value?.select(); // Seleccionamos el texto para sobreescribir rápido
  }
});

// Lógica de cambio de método (Sustituye al 'watch' anterior)
const setMetodo = (metodo) => {
  metodoPago.value = metodo;
  if (metodo === 'Transferencia') {
    montoRecibido.value = props.total;
  } else {
    // Si vuelve a efectivo, pre-cargamos el total y damos foco
    montoRecibido.value = props.total;
    nextTick(() => inputRecibido.value?.focus());
  }
};

// Cálculo exacto del vuelto
const vuelto = computed(() => {
  if (metodoPago.value === 'Transferencia') return 0;
  return Math.max(0, montoRecibido.value - props.total);
});

// Validación dinámica
const puedeConfirmar = computed(() => {
  if (metodoPago.value === 'Transferencia') return true;
  return montoRecibido.value >= props.total;
});

// Estilos dinámicos del botón
const claseBotonConfirmar = computed(() => {
  if (metodoPago.value === 'Transferencia') return 'btn-transfer';
  return 'btn-cash';
});

const textoBotonConfirmar = computed(() => {
  if (metodoPago.value === 'Transferencia') return 'Confirmar Transferencia';
  return 'Confirmar Cobro Efectivo';
});

const confirmar = () => {
  if (!puedeConfirmar.value) return;

  const datosVenta = {
    fecha: new Date().toISOString(),
    metodoPago: metodoPago.value,
    montoRecibido: Number(montoRecibido.value),
    vuelto: Number(vuelto.value),
    total: Number(props.total),
    items: props.carrito.map(item => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    }))
  };

  emit('confirmarVenta', datosVenta);
};
</script>

<style scoped>
/* GENERAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(17, 24, 39, 0.5); /* Fondo ligeramente azulado oscuro */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px); /* Blur más intenso */
}

.modal-contenedor {
  background: #ffffff;
  border-radius: 16px; /* Más redondeado */
  width: 100%;
  max-width: 480px; /* Un poco más ancho para las pills */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); /* Sombra más suave y premium */
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* HEADER */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { 
  margin: 0; 
  font-size: 1.25rem; 
  color: #111827; 
  font-weight: 700; 
  letter-spacing: -0.025em;
}

.btn-cerrar-X { 
  background: none; border: none; 
  font-size: 1.75rem; color: #9ca3af; 
  cursor: pointer; 
  transition: color 0.2s;
}

.btn-cerrar-X:hover { color: #ef4444; }

/* CUERPO */
.modal-cuerpo { 
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; /* Más espacio entre elementos */
}

/* 1. Bloque Total (Diseño destacado) */
.bloque-total {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.total-label { 
  font-size: 0.75rem; 
  font-weight: 600; 
  color: #6b7280; 
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.total-monto { 
  font-size: 2.25rem; 
  font-weight: 800; 
  color: #111827; 
  letter-spacing: -0.05em;
}

/* Formulario General */
.form-grupo { display: flex; flex-direction: column; }

.form-grupo label { 
  font-size: 0.875rem; 
  font-weight: 600; 
  color: #374151; 
  margin-bottom: 0.75rem; 
}

/* 2. Selector de Pago Visual (PILLS) - MODIFICACIÓN PRINCIPAL */
.selector-pago {
  display: flex;
  gap: 1rem;
}

.pilula-pago {
  flex: 1;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.pilula-pago .icono { font-size: 1.75rem; }
.pilula-pago .texto { font-size: 0.95rem; font-weight: 600; color: #4b5563; }

/* Efecto hover */
.pilula-pago:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

/* Estilo para Caja (Verde) */
.pilula-pago.cash.activa {
  background: #ecfdf5;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}
.pilula-pago.cash.activa .texto { color: #065f46; }

/* Estilo para Transferencia (Azul) */
.pilula-pago.transfer.activa {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.pilula-pago.transfer.activa .texto { color: #1e40af; }


/* Entradas y Vuelto */
input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #f9fafb;
  color: #111827;
  outline: none;
  transition: all 0.2s;
  width: 100%;
}

input:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.input-con-prefijo { position: relative; display: flex; align-items: center; }
.prefijo { position: absolute; left: 1rem; color: #9ca3af; font-weight: 500; }
.input-con-prefijo input { padding-left: 2rem; }

/* Info Transferencia */
.transfer-info {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 0.9rem;
  text-align: center;
}

/* Bloque Vuelto (Diseño destacado) */
.bloque-vuelto {
  background: #ecfdf5;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #a7f3d0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.vuelto-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vuelto-item.recibio { font-size: 0.9rem; color: #065f46; }
.vuelto-item.recibio .monto { font-weight: 600; }

.vuelto-item.cambio { font-size: 1rem; color: #065f46; border-top: 1px dashed #a7f3d0; padding-top: 0.75rem; }
.vuelto-item.cambio .label { font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;}
.vuelto-item.cambio .monto-final { font-size: 1.75rem; font-weight: 800; color: #047857; letter-spacing: -0.05em; }


.advertencia {
  color: #b45309;
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-top: 1rem;
}

/* FOOTER */
.modal-footer {
  padding: 1.25rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancelar {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancelar:hover { background: #f3f4f6; border-color: #c7d2fe; }

.btn-confirmar {
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

/* Colores dinámicos del botón */
.btn-cash { background: #10b981; }
.btn-cash:hover:not(:disabled) { background: #059669; }

.btn-transfer { background: #3b82f6; }
.btn-transfer:hover:not(:disabled) { background: #2563eb; }

.btn-confirmar:disabled { 
  background: #d1d5db; 
  color: #9ca3af; 
  cursor: not-allowed; 
}

/* Animaciones */
.effecto-aparecer {
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>