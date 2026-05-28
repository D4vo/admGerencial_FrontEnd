<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  carrito: Array,
  total: Number
});

const emit = defineEmits(['close', 'confirmarVenta']);

// Estado del formulario de pago
const metodoPago = ref('Efectivo');
const montoRecibido = ref('');
const inputMonto = ref(null);

// Resetear los valores cada vez que se abre el modal
watch(() => props.show, async (newVal) => {
  if (newVal) {
    metodoPago.value = 'Efectivo';
    montoRecibido.value = '';
    
    // Si es efectivo, hacemos auto-focus en el input de monto al abrir
    if (metodoPago.value === 'Efectivo') {
      await nextTick();
      inputMonto.value?.focus();
    }
  }
});

// Cambiar método de pago y manejar auto-focus
const setMetodoPago = async (metodo) => {
  metodoPago.value = metodo;
  if (metodo === 'Efectivo') {
    await nextTick();
    inputMonto.value?.focus();
  } else {
    montoRecibido.value = ''; // Limpiamos si elige tarjeta
  }
};

const vuelto = computed(() => {
  if (metodoPago.value !== 'Efectivo' || !montoRecibido.value) return 0;
  const recibido = parseFloat(montoRecibido.value);
  return recibido > props.total ? recibido - props.total : 0;
});

const puedeConfirmar = computed(() => {
  if (props.carrito.length === 0) return false;
  if (metodoPago.value === 'Efectivo') {
    return parseFloat(montoRecibido.value) >= props.total;
  }
  return true; // Para tarjeta u otros, asumimos que se aprobó en el posnet físico
});

const confirmar = () => {
  if (!puedeConfirmar.value) return;

  // Armamos la estructura de datos limpia para mandarle al padre
  const resumenVenta = {
    items: [...props.carrito],
    total: props.total,
    metodoPago: metodoPago.value,
    montoRecibido: metodoPago.value === 'Efectivo' ? parseFloat(montoRecibido.value) : props.total,
    vuelto: vuelto.value,
    fecha: new Date().toISOString()
  };

  emit('confirmarVenta', resumenVenta);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        
        <div class="modal-checkout-card">
          <div class="modal-header">
            <h3>Finalizar Venta</h3>
            <button @click="emit('close')" class="btn-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="columna-resumen">
              <h4>Resumen del Pedido</h4>
              <div class="lista-resumen">
                <div v-for="item in carrito" :key="item.id" class="item-resumen">
                  <span>{{ item.cantidad }}x {{ item.nombre }}</span>
                  <span>$ {{ (item.precio * item.cantidad).toLocaleString('es-AR') }}</span>
                </div>
              </div>
              <div class="total-resumen">
                <span>Total a Pagar</span>
                <span class="monto-destacado">$ {{ total.toLocaleString('es-AR') }}</span>
              </div>
            </div>

            <div class="columna-pago">
              <h4>Método de Pago</h4>
              <div class="selector-metodos">
                <button 
                  :class="['btn-metodo', { activo: metodoPago === 'Efectivo' }]"
                  @click="setMetodoPago('Efectivo')"
                >
                  💵 Efectivo
                </button>
                <button 
                  :class="['btn-metodo', { activo: metodoPago === 'Tarjeta' }]"
                  @click="setMetodoPago('Tarjeta')"
                >
                  💳 Tarjeta / Débito
                </button>
              </div>

              <div v-if="metodoPago === 'Efectivo'" class="seccion-efectivo">
                <label>Monto recibido del cliente:</label>
                <div class="input-dinero">
                  <span class="simbolo">$</span>
                  <input 
                    ref="inputMonto"
                    type="number" 
                    v-model="montoRecibido"
                    placeholder="0.00"
                    min="0"
                    @keyup.enter="confirmar"
                  />
                </div>

                <div :class="['info-vuelto', { 'vuelto-positivo': vuelto > 0 }]">
                  <span>Vuelto a entregar:</span>
                  <span class="monto-vuelto">$ {{ vuelto.toLocaleString('es-AR') }}</span>
                </div>
              </div>

              <div v-else class="seccion-tarjeta">
                <p>Pase la tarjeta por el lector y aguarde la confirmación antes de registrar la venta en el sistema.</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="emit('close')" class="btn-cancelar">Volver</button>
            <button 
              @click="confirmar" 
              class="btn-confirmar"
              :disabled="!puedeConfirmar"
            >
              Registrar Venta
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Contenedor principal con desenfoque */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1050;
}

.modal-checkout-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 800px; /* Modal más grande para las dos columnas */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Cabecera */
.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  background-color: #f8fafc;
}
.modal-header h3 { margin: 0; font-size: 1.3rem; color: #1a202c; }
.btn-close { background: none; border: none; font-size: 1.8rem; color: #a0aec0; cursor: pointer; }

/* Cuerpo de dos columnas */
.modal-body {
  display: flex;
  padding: 30px;
  gap: 40px;
}

.columna-resumen, .columna-pago {
  flex: 1;
  display: flex;
  flex-direction: column;
}

h4 { margin: 0 0 20px 0; color: #4a5568; font-size: 1.1rem; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; }

/* Estilos de la columna izquierda (Resumen) */
.lista-resumen {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 250px;
  margin-bottom: 20px;
}
.item-resumen {
  display: flex; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px dashed #e2e8f0;
  color: #4a5568; font-size: 0.95rem;
}
.total-resumen {
  display: flex; justify-content: space-between; align-items: center;
  background-color: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;
  font-weight: 600; color: #2d3748;
}
.monto-destacado { font-size: 1.4rem; color: #3182ce; font-weight: 700; }

/* Estilos de la columna derecha (Pago) */
.selector-metodos {
  display: flex; gap: 10px; margin-bottom: 25px;
}
.btn-metodo {
  flex: 1; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;
  background-color: #ffffff; color: #4a5568; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
}
.btn-metodo:hover { border-color: #cbd5e0; }
.btn-metodo.activo { border-color: #3182ce; background-color: #ebf8ff; color: #2b6cb0; }

.seccion-efectivo label { display: block; margin-bottom: 8px; color: #4a5568; font-weight: 500; font-size: 0.95rem; }
.input-dinero {
  position: relative; display: flex; align-items: center; margin-bottom: 20px;
}
.simbolo { position: absolute; left: 15px; font-size: 1.5rem; color: #a0aec0; font-weight: 600; }
.input-dinero input {
  width: 100%; padding: 15px 15px 15px 45px; font-size: 1.5rem; font-weight: 700;
  border: 2px solid #e2e8f0; border-radius: 10px; color: #2d3748;
}
.input-dinero input:focus { outline: none; border-color: #3182ce; }

.info-vuelto {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; background-color: #edf2f7; border-radius: 10px; color: #4a5568; font-weight: 600;
}
.info-vuelto.vuelto-positivo { background-color: #c6f6d5; color: #22543d; }
.monto-vuelto { font-size: 1.3rem; }

.seccion-tarjeta {
  padding: 20px; background-color: #edf2f7; border-radius: 10px; color: #4a5568; text-align: center;
  border: 1px dashed #cbd5e0;
}

/* Footer */
.modal-footer {
  padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 15px;
}
.btn-cancelar { padding: 12px 24px; background: none; border: 1px solid #cbd5e0; border-radius: 8px; color: #4a5568; font-weight: 600; cursor: pointer; }
.btn-confirmar { padding: 12px 24px; background-color: #48bb78; border: none; border-radius: 8px; color: #ffffff; font-weight: 600; cursor: pointer; font-size: 1rem; }
.btn-confirmar:disabled { background-color: #cbd5e0; cursor: not-allowed; }
.btn-confirmar:hover:not(:disabled) { background-color: #38a169; }

/* Animaciones */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-checkout-card { animation: slide-up 0.3s ease-out; }

@keyframes slide-up {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>