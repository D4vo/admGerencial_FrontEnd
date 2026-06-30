<script setup>
// Modal de confirmación genérico, reemplaza al confirm() nativo del navegador.
// Uso: <ModalConfirmacion :show="..." titulo="..." mensaje="..." @confirm="..." @cancel="..." />
defineProps({
  show: Boolean,
  titulo: {
    type: String,
    default: 'Confirmar acción',
  },
  mensaje: {
    type: String,
    required: true,
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar',
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar',
  },
  variante: {
    type: String,
    default: 'default', // 'default' | 'peligro'
  },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition name="confirmacion-fade">
      <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
        <div class="modal-confirmacion-card">
          <div class="icono-contenedor" :class="{ peligro: variante === 'peligro' }">
            <svg v-if="variante === 'peligro'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icono-signo">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icono-signo">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <div class="texto-contenedor">
            <h3>{{ titulo }}</h3>
            <p>{{ mensaje }}</p>
          </div>

          <div class="botones-contenedor">
            <button @click="emit('cancel')" class="btn-cancelar-modal">{{ textoCancelar }}</button>
            <button @click="emit('confirm')" class="btn-confirmar-modal" :class="{ peligro: variante === 'peligro' }">
              {{ textoConfirmar }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}

.modal-confirmacion-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 380px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icono-contenedor {
  background-color: #eff6ff;
  color: #3b82f6;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.icono-contenedor.peligro {
  background-color: #fef2f2;
  color: #ef4444;
}

.icono-signo {
  width: 36px;
  height: 36px;
}

.texto-contenedor h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 1.2rem;
}

.texto-contenedor p {
  margin: 0 0 25px 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.botones-contenedor {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn-cancelar-modal,
.btn-confirmar-modal {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: none;
}

.btn-cancelar-modal {
  background-color: #f3f4f6;
  color: #374151;
}
.btn-cancelar-modal:hover { background-color: #e5e7eb; }

.btn-confirmar-modal {
  background-color: #3b82f6;
  color: #ffffff;
}
.btn-confirmar-modal:hover { background-color: #2563eb; }
.btn-confirmar-modal.peligro { background-color: #ef4444; }
.btn-confirmar-modal.peligro:hover { background-color: #dc2626; }

.confirmacion-fade-enter-active, .confirmacion-fade-leave-active {
  transition: opacity 0.3s ease;
}
.confirmacion-fade-enter-from, .confirmacion-fade-leave-to {
  opacity: 0;
}
.confirmacion-fade-enter-active .modal-confirmacion-card {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
