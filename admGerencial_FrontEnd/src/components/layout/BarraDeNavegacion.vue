<script setup>
import { ref } from 'vue';

const emit = defineEmits(['navegar']);

const botones = ['Ventas', 'Compras', 'Productos', 'Cuentas'];
const botonActivo = ref('Ventas');

const emitirNavegacion = (boton) => {
  botonActivo.value = boton;
  emit('navegar', boton);
};
</script>

<template>
  <nav class="sidebar">
    <div class="logo-container">
      <h2>Sistema Contable</h2>
    </div>
    
    <ul class="menu">
      <li 
        v-for="boton in botones" 
        :key="boton"
        :class="{ activo: botonActivo === boton }"
        @click="emitirNavegacion(boton)"
      >
        {{ boton }}
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #1a1c23; /* Tono oscuro, casi negro, muy elegante */
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.logo-container {
  padding: 30px 20px;
  border-bottom: 1px solid #2d3748;
  margin-bottom: 20px;
}

.logo-container h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 15px 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: #a0aec0;
}

.menu li:hover {
  background-color: #2d3748;
  color: #ffffff;
}

.menu li.activo {
  background-color: #3182ce; /* Acento azul profesional */
  color: #ffffff;
  border-left: 4px solid #63b3ed;
  padding-left: 26px; /* Ajuste para compensar el borde */
}
</style>