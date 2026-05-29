<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-card">
      <header class="modal-header">
        <h3>{{ esEdicion ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable' }}</h3>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </header>
      
      <div class="modal-body">
        <div class="grupo">
          <label>Código Contable</label>
          <input 
            type="text" 
            v-model="form.codigo" 
            placeholder="Ej: 1.01.01" 
            :disabled="esEdicion" 
          />
        </div>
        
        <div class="grupo">
          <label>Nombre de la Cuenta</label>
          <input 
            type="text" 
            v-model="form.nombre" 
            placeholder="Ej: Banco Nación C/C" 
          />
        </div>
        
        <div class="grupo">
          <label>Tipo de Cuenta (Estructura Contable)</label>
          <select v-model="form.tipo">
            <option disabled value="">Seleccione un tipo...</option>
            <option v-for="t in tiposDisponibles" :key="t" :value="t">
              {{ t }}
            </option>
          </select>
        </div>
      </div>
      
      <footer class="modal-footer">
        <button class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
        <button class="btn-guardar" @click="guardar" :disabled="!formularioValido">
          Guardar Cuenta
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  cuentaOriginal: { type: Object, default: null }
})

const emit = defineEmits(['cerrar', 'guardar'])

const esEdicion = computed(() => props.cuentaOriginal !== null)
const tiposDisponibles = ['Activo', 'Pasivo', 'Patrimonio Neto', 'Ingreso', 'Egreso']

const form = ref({ id: null, codigo: '', nombre: '', tipo: '' })

// CORREGIDO: Se eliminó la referencia a productoOriginal que causaba el error
watch(() => props.visible, (estaVisible) => {
  if (estaVisible) {
    if (props.cuentaOriginal) {
      form.value = { ...props.cuentaOriginal }
    } else {
      form.value = { id: null, codigo: '', nombre: '', tipo: 'Activo' }
    }
  }
})

const formularioValido = computed(() => {
  return form.value.codigo && form.value.codigo.trim() !== '' && 
         form.value.nombre && form.value.nombre.trim() !== '' && 
         form.value.tipo !== ''
})

const guardar = () => emit('guardar', { ...form.value })
</script>

<style scoped>
.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.4); 
  backdrop-filter: blur(4px);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1100; 
}

.modal-card { 
  background: #ffffff; 
  width: 100%; 
  max-width: 450px; 
  border-radius: 12px; 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); 
  overflow: hidden; 
}

.modal-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 1.25rem 1.5rem; 
  border-bottom: 1px solid #f3f4f6; 
}

.modal-header h3 { 
  margin: 0; 
  font-size: 1.15rem; 
  color: #111827; 
  font-weight: 600;
}

.btn-cerrar { 
  background: none; 
  border: none; 
  font-size: 1.2rem; 
  color: #9ca3af; 
  cursor: pointer; 
}

.modal-body { 
  padding: 1.5rem; 
  display: flex; 
  flex-direction: column; 
  gap: 1.25rem; 
}

.grupo { 
  display: flex; 
  flex-direction: column; 
}

label { 
  font-size: 0.85rem; 
  font-weight: 500; 
  color: #4b5563; 
  margin-bottom: 0.4rem; 
}

input, select { 
  padding: 0.7rem 0.8rem; 
  border: 1px solid #d1d5db; 
  border-radius: 8px; 
  font-size: 0.95rem; 
  outline: none; 
  transition: all 0.2s; 
  background-color: #f9fafb;
  color: #111827;
}

input:focus, select:focus { 
  border-color: #3b82f6; 
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.modal-footer { 
  padding: 1rem 1.5rem; 
  border-top: 1px solid #f3f4f6; 
  display: flex; 
  justify-content: flex-end; 
  gap: 0.75rem; 
  background: #f9fafb; 
}

.btn-cancelar { 
  padding: 0.6rem 1.2rem; 
  background: #ffffff; 
  border: 1px solid #d1d5db; 
  border-radius: 8px; 
  color: #374151; 
  font-weight: 500; 
  cursor: pointer; 
  transition: background 0.2s;
}

.btn-cancelar:hover {
  background: #f9fafb;
}

.btn-guardar { 
  padding: 0.6rem 1.2rem; 
  background: #3b82f6; 
  border: none; 
  border-radius: 8px; 
  color: #ffffff; 
  font-weight: 600; 
  cursor: pointer; 
  transition: background 0.2s;
}

.btn-guardar:hover:not(:disabled) { 
  background: #2563eb; 
}

.btn-guardar:disabled { 
  background: #9ca3af; 
  cursor: not-allowed; 
}
</style>