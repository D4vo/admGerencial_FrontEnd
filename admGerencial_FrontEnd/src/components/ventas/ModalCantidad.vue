<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
  producto: Object
});

const emit = defineEmits(['close', 'confirm']);

const cantidad = ref(1);
const inputCantidad = ref(null); // Referencia para auto-focus

// Cada vez que se abre el modal para un producto nuevo, reseteamos la cantidad a 1 y hacemos focus
watch(() => props.show, async (newVal) => {
  if (newVal) {
    cantidad.value = 1;
    await nextTick(); // Esperamos a que Vue renderice el DOM
    inputCantidad.value?.focus(); // Focus automático para rapidez
    inputCantidad.value?.select(); // Selecciona el texto para sobrescribir rápido
  }
});

const confirmar = () => {
  const cantNum = parseInt(cantidad.value);
  if (cantNum > 0 && cantNum <= props.producto.stock) {
    emit('confirm', cantNum);
  } else {
    // Aquí podrías poner una alerta visual de stock insuficiente
    alert('Cantidad inválida o supera el stock disponible.');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        
        <div class="modal-card">
          <div class="modal-header">
            <h3>Añadir al Carrito</h3>
            <button @click="emit('close')" class="btn-close-modal">&times;</button>
          </div>
          
          <div class="modal-body" v-if="producto">
            <p class="pregunt-producto">¿Qué cantidad de <strong>{{ producto.nombre }}</strong> desea llevar?</p>
            <p class="stock-disponible">Stock disponible: {{ producto.stock }} unidades.</p>
            
            <input 
              ref="inputCantidad"
              type="number" 
              v-model="cantidad" 
              min="1" 
              :max="producto.stock"
              class="input-cantidad-minimal"
              @keyup.enter="confirmar"
            />
          </div>
          
          <div class="modal-footer">
            <button @click="emit('close')" class="btn-cancelar">Cancelar</button>
            <button @click="confirmar" class="btn-confirmar">Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4); /* Fondo oscuro suave */
  backdrop-filter: blur(4px); /* EFECTO DE DESENFOQUE (muy pro) */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 25px;
  text-align: center;
}

.pregunt-producto {
  color: #4a5568;
  margin: 0 0 10px 0;
}

.stock-disponible {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 20px;
}

.input-cantidad-minimal {
  font-size: 2rem;
  font-weight: 700;
  width: 120px;
  text-align: center;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  color: #3182ce;
  transition: border-color 0.2s;
}

.input-cantidad-minimal:focus {
  outline: none;
  border-color: #3182ce;
}

.modal-footer {
  padding: 15px 25px;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancelar {
  padding: 10px 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #718096;
  cursor: pointer;
  font-weight: 500;
}

.btn-confirmar {
  padding: 10px 20px;
  background-color: #3182ce;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirmar:hover { background-color: #2b6cb0; }
.btn-cancelar:hover { background-color: #f7fafc; }

/* --- ANIMACIÓN DEL MODAL --- */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Animación interna de la tarjeta (zoom in/out) */
.modal-fade-enter-from .modal-card {
  transform: scale(0.9) translateY(-20px);
}

.modal-fade-leave-to .modal-card {
  transform: scale(0.9) translateY(20px);
}

.modal-card {
  transition: transform 0.3s ease;
}
</style>