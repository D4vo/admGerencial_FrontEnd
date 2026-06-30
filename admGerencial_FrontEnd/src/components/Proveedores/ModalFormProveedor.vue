<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor effecto-aparecer">
      <header class="modal-header">
        <h3>{{ proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
        <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
      </header>
      <main class="modal-cuerpo">
        <div class="form-grupo">
          <label>Nombre <span class="req">*</span></label>
          <input type="text" v-model="formulario.nombre" placeholder="Razón social o nombre" :class="{'error-borde': errores.nombre}" />
          <span v-if="errores.nombre" class="msj-error">El nombre es obligatorio.</span>
        </div>
        <div class="form-grupo"><label>CUIT</label><input type="text" v-model="formulario.cuit" placeholder="XX-XXXXXXXX-X" /></div>
        <div class="form-grupo"><label>Domicilio</label><input type="text" v-model="formulario.domicilio" placeholder="Dirección" /></div>
        <div class="form-grupo"><label>Teléfono</label><input type="text" v-model="formulario.telefono" placeholder="Teléfono" /></div>
      </main>
      <footer class="modal-footer">
        <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
        <button class="btn-confirmar" @click="confirmarGuardado">{{ proveedor ? 'Actualizar' : 'Guardar Proveedor' }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  proveedor: { type: Object, default: null }, // si viene, es edición
})

const emit = defineEmits(['close', 'guardar'])

const formularioVacio = () => ({ nombre: '', cuit: '', domicilio: '', telefono: '' })
const formulario = ref(formularioVacio())
const errores = ref({ nombre: false })

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    formulario.value = props.proveedor
      ? {
          nombre: props.proveedor.nombre || '',
          cuit: props.proveedor.cuit || '',
          domicilio: props.proveedor.domicilio || '',
          telefono: props.proveedor.telefono || '',
        }
      : formularioVacio()
    errores.value = { nombre: false }
  }
})

const confirmarGuardado = () => {
  errores.value = { nombre: false }
  if (!formulario.value.nombre.trim()) {
    errores.value.nombre = true
    return
  }

  const payload = {
    nombre: formulario.value.nombre.trim(),
    cuit: formulario.value.cuit.trim() || null,
    domicilio: formulario.value.domicilio.trim() || null,
    telefono: formulario.value.telefono.trim() || null,
  }

  emit('guardar', payload)
}

const cerrarModal = () => { emit('close') }
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); z-index: 1100; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal-contenedor { background: #ffffff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }
.modal-cuerpo { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.15rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
.req { color: #ef4444; }
input { padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: all 0.2s; width: 100%; box-sizing: border-box; }
input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
.error-borde { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.msj-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 500; }
.modal-footer { padding: 1rem 1.5rem; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-confirmar { background: #10b981; border: none; color: white; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-confirmar:hover { background: #059669; }
.effecto-aparecer { animation: fadeInDown 0.2s ease-out; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>
