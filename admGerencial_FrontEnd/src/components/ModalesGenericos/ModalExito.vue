<script setup>
// Definimos las props. 'show' controla la visibilidad, 
// 'titulo' y 'mensaje' son los textos personalizables.
defineProps({
  show: Boolean,
  titulo: {
    type: String,
    default: '¡Operación Exitosa!' // Un título por defecto por si te olvidás de pasarlo
  },
  mensaje: {
    type: String,
    required: true
  }
});

defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <Transition name="exito-fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        
        <div class="modal-exito-card">
          <div class="icono-contenedor">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icono-check">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>

          <div class="texto-contenedor">
            <h3>{{ titulo }}</h3>
            <p>{{ mensaje }}</p>
          </div>

          <button @click="$emit('close')" class="btn-aceptar">
            Aceptar
          </button>
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
  z-index: 2000; /* Z-index bien alto para quedar sobre cualquier otro modal */
}

.modal-exito-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 350px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icono-contenedor {
  background-color: #f0fdf4; /* Fondo verde muy suave */
  color: #22c55e; /* Verde éxito */
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.icono-check {
  width: 36px;
  height: 36px;
}

.texto-contenedor h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.texto-contenedor p {
  margin: 0 0 25px 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.btn-aceptar {
  width: 100%;
  padding: 12px;
  background-color: #22c55e;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-aceptar:hover {
  background-color: #16a34a;
}

/* Animaciones */
.exito-fade-enter-active, .exito-fade-leave-active {
  transition: opacity 0.3s ease;
}
.exito-fade-enter-from, .exito-fade-leave-to {
  opacity: 0;
}
.exito-fade-enter-active .modal-exito-card {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Efecto rebote suave */
}

@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>