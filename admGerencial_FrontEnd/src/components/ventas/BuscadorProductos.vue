<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="buscador-container">
    <div class="input-wrapper">
      <svg class="icono-lupa" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input 
        type="text" 
        placeholder="Buscar por Nombre, ID o Categoría..."
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input-minimalist"
      />
    </div>
  </div>
</template>

<style scoped>
.buscador-container {
  margin-bottom: 25px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icono-lupa {
  position: absolute;
  left: 15px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  transition: color 0.3s ease;
}

.input-minimalist {
  width: 100%;
  padding: 15px 15px 15px 50px; /* Padding extra a la izquierda para el ícono */
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #ffffff;
  color: #2d3748;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
}

.input-minimalist:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.input-minimalist:focus + .icono-lupa {
  color: #3182ce;
}
</style>