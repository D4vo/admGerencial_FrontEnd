<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor effecto-aparecer">
      <header class="modal-header">
        <h2>{{ cliente ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}</h2>
        <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
      </header>

      <main class="modal-cuerpo">
        <div class="grid-form">
          <div class="form-grupo">
            <label>CUIT / DNI <span class="req">*</span></label>
            <input
              type="text"
              v-model="formulario.cuit"
              placeholder="Ej: 20123456789"
              :class="{'error-borde': errores.cuit}"
              :disabled="!!cliente"
            />
            <span v-if="errores.cuit" class="msj-error">El CUIT es obligatorio.</span>
          </div>

          <div class="form-grupo">
            <label>Razón Social / Nombre <span class="req">*</span></label>
            <input 
              type="text" 
              v-model="formulario.razon_social" 
              placeholder="Ej: Juan Pérez o Empresa SRL" 
              :class="{'error-borde': errores.razon_social}"
            />
            <span v-if="errores.razon_social" class="msj-error">El nombre es obligatorio.</span>
          </div>
        </div>

        <div class="grid-form mt-1">
          <div class="form-grupo">
            <label>Condición frente al IVA <span class="req">*</span></label>
            <select v-model="formulario.condicion_iva">
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Exento">Exento</option>
            </select>
          </div>

          <div class="form-grupo">
            <label>Domicilio Fiscal</label>
            <input
              type="text"
              v-model="formulario.domicilio_fiscal"
              placeholder="Ej: Av. San Martín 1234, Chaco"
            />
          </div>
        </div>

        <div class="grid-form mt-1">
          <div class="form-grupo">
            <label>Teléfono</label>
            <input
              type="text"
              v-model="formulario.telefono"
              placeholder="Ej: 3624123456"
            />
          </div>
        </div>
      </main>

      <footer class="modal-footer">
        <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
        <button class="btn-confirmar" @click="confirmarGuardado">{{ cliente ? 'Actualizar Cliente' : 'Guardar Cliente' }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  cliente: { type: Object, default: null } // si viene, es edición
});

const emit = defineEmits(['close', 'guardar']);

const formularioVacio = () => ({ cuit: '', razon_social: '', domicilio_fiscal: '', condicion_iva: 'Consumidor Final', telefono: '' });
const formulario = ref(formularioVacio());

const errores = ref({ cuit: false, razon_social: false });

// Cada vez que se abre el modal, prellenamos si es edición o limpiamos si es alta
watch(() => props.show, (isOpen) => {
  if (isOpen) {
    formulario.value = props.cliente
      ? {
          cuit: props.cliente.cuit || '',
          razon_social: props.cliente.razon_social || '',
          domicilio_fiscal: props.cliente.domicilio_fiscal || '',
          condicion_iva: props.cliente.condicion_iva || 'Consumidor Final',
          telefono: props.cliente.telefono || '',
        }
      : formularioVacio();
    errores.value = { cuit: false, razon_social: false };
  }
});

const confirmarGuardado = () => {
  errores.value = { cuit: false, razon_social: false };
  let hayError = false;

  if (!formulario.value.cuit.trim()) { errores.value.cuit = true; hayError = true; }
  if (!formulario.value.razon_social.trim()) { errores.value.razon_social = true; hayError = true; }

  if (hayError) return;

  const payload = {
    cuit: formulario.value.cuit.trim(),
    razon_social: formulario.value.razon_social.trim(),
    domicilio_fiscal: formulario.value.domicilio_fiscal.trim() || null,
    condicion_iva: formulario.value.condicion_iva,
    telefono: formulario.value.telefono.trim() || null
  };

  emit('guardar', payload);
};

const cerrarModal = () => { emit('close'); };
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal-contenedor { background: #ffffff; border-radius: 16px; width: calc(100% - 2rem); max-width: 600px; max-height: 90vh; min-height: 0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.modal-header h2 { margin: 0; font-size: 1.25rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }
.modal-cuerpo { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1; min-height: 0; }
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.mt-1 { margin-top: 0.5rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }
.req { color: #ef4444; }
input, select { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: all 0.2s; width: 100%; box-sizing: border-box; }
input:focus, select:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
input:disabled { background-color: #f1f5f9; color: #64748b; cursor: not-allowed; }
.error-borde { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.msj-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; font-weight: 500; }
.modal-footer { padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0; }
.btn-cancelar { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-confirmar { background: #10b981; border: none; color: white; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-confirmar:hover { background: #059669; }
.effecto-aparecer { animation: fadeInDown 0.3s ease-out; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>