<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-card">
      <header class="modal-header">
        <h3>{{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </header>
      
      <div class="modal-body">
        <div class="grupo">
          <label>Nombre del Producto</label>
          <input type="text" v-model="form.nombre" placeholder="Ej: Alfajor Triple" />
        </div>
        
        <div class="grupo">
          <label>Categoría</label>
          <select v-model="form.tipo">
            <option disabled value="">Seleccione una categoría...</option>
            <option v-for="cat in categorias" :key="cat.nombre" :value="cat.nombre">
              {{ cat.nombre }}
            </option>
          </select>
        </div>
        
        <div class="inputs-fila">
          <div class="grupo">
            <label>Precio de Venta ($)</label>
            <input type="number" v-model.number="form.precio" step="0.01" />
          </div>
          <div class="grupo">
            <label>Stock Actual</label>
            <input type="number" v-model.number="form.stock" />
          </div>
        </div>
      </div>
      
      <footer class="modal-footer">
        <button class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
        <button class="btn-guardar" @click="guardar" :disabled="!formularioValido || cargando">
          {{ cargando ? 'Guardando...' : 'Guardar Producto' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  categorias: { type: Array, required: true },
  productoOriginal: { type: Object, default: null },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits(['cerrar', 'guardar'])

const esEdicion = computed(() => props.productoOriginal !== null)

const form = ref({ id: null, nombre: '', tipo: '', precio: null, stock: 0 })

watch(() => props.visible, (estaVisible) => {
  if (estaVisible) {
    if (props.productoOriginal) {
      form.value = { ...props.productoOriginal }
      // Aseguramos de pre-seleccionar la primera categoría si el producto viejo no tenía ninguna
      if (!form.value.tipo && props.categorias.length > 0) {
        form.value.tipo = props.categorias[0].nombre
      }
    } else {
      // Limpiamos el formulario para un producto nuevo
      form.value = { id: null, nombre: '', tipo: props.categorias.length > 0 ? props.categorias[0].nombre : '', precio: null, stock: 0 }
    }
  }
})

// VALIDACIÓN CORREGIDA: Apunta a "tipo" y valida que "nombre" exista
const formularioValido = computed(() => {
  return form.value.nombre && 
         form.value.nombre.trim() !== '' && 
         form.value.tipo !== '' && 
         form.value.precio > 0
})

const guardar = () => emit('guardar', { ...form.value })
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal-card { background: white; width: 100%; max-width: 500px; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #f3f4f6; }
.modal-header h3 { margin: 0; font-size: 1.2rem; color: #111827; }
.btn-cerrar { background: none; border: none; font-size: 1.2rem; color: #9ca3af; cursor: pointer; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.inputs-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.grupo { display: flex; flex-direction: column; }
label { font-size: 0.85rem; font-weight: 500; color: #4b5563; margin-bottom: 0.4rem; }
input, select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
input:focus, select:focus { border-color: #10b981; }
.modal-footer { padding: 1.5rem; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 1rem; background: #f9fafb; }
.btn-cancelar { padding: 0.75rem 1.5rem; background: white; border: 1px solid #d1d5db; border-radius: 8px; color: #374151; font-weight: 500; cursor: pointer; }
.btn-guardar { padding: 0.75rem 1.5rem; background: #10b981; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; }
.btn-guardar:disabled { background: #9ca3af; cursor: not-allowed; }
</style>