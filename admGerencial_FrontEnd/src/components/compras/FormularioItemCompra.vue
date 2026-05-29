<template>
  <div class="card-formulario">
    <div class="inputs-grid">
      <div class="grupo">
        <label>Producto</label>
        <select v-model="item.producto_id">
          <option disabled value="">Seleccionar producto...</option>
          <option v-for="p in productos" :key="p.id" :value="p.id">
            {{ p.nombre }}
          </option>
        </select>
      </div>
      
      <div class="grupo">
        <label>Cantidad</label>
        <input type="number" v-model.number="item.cantidad" min="1" placeholder="0" />
      </div>
      
      <div class="grupo">
        <label>Costo Unit. ($)</label>
        <input type="number" v-model.number="item.costo_unitario" step="0.01" placeholder="0.00" />
      </div>
      
      <div class="grupo grupo-boton">
        <button class="btn-agregar" @click="emitirItem" :disabled="!esValido">
          Agregar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  productos: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['agregar-item'])

const item = ref({ producto_id: '', cantidad: null, costo_unitario: null })

const esValido = computed(() => item.value.producto_id !== '' && item.value.cantidad > 0 && item.value.costo_unitario >= 0)

const emitirItem = () => {
  if (!esValido.value) return
  emit('agregar-item', { ...item.value })
  item.value = { producto_id: '', cantidad: null, costo_unitario: null }
}
</script>

<style scoped>
.card-formulario {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb; /* Borde un poco más suave */
}

.inputs-grid { 
  display: grid; 
  /* Le damos un poco más de aire al producto y menos al botón */
  grid-template-columns: 2.5fr 1fr 1fr 120px; 
  gap: 1.25rem; 
}

.grupo { 
  display: flex; 
  flex-direction: column; 
  justify-content: flex-end; /* Empuja todo hacia abajo para alinear */
}

label { 
  font-size: 0.85rem; 
  font-weight: 500; 
  color: #4b5563; 
  margin-bottom: 0.4rem; 
}

/* Forzamos la misma altura (42px) y box-sizing para inputs, selects y el botón */
input, select, .btn-agregar { 
  height: 42px; 
  box-sizing: border-box; 
}

input, select { 
  padding: 0 0.8rem; 
  border: 1px solid #d1d5db; 
  border-radius: 8px; 
  font-size: 0.95rem; 
  color: #111827;
  background-color: #f9fafb;
  outline: none;
  transition: all 0.2s;
  width: 100%; /* Asegura que llenen su columna */
}

input:focus, select:focus { 
  border-color: #10b981; 
  background-color: #ffffff; 
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); 
}

.btn-agregar { 
  padding: 0;
  width: 100%;
  background: #1f2937; 
  color: #fff; 
  border: none; 
  border-radius: 8px; 
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer; 
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-agregar:hover:not(:disabled) { 
  background: #374151; 
}

.btn-agregar:disabled { 
  background: #e5e7eb; 
  color: #9ca3af; 
  cursor: not-allowed; 
}
</style>