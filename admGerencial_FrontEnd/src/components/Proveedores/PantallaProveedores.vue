<template>
  <div class="modulo-proveedores">
    <header class="cabecera-modulo">
      <div>
        <h1>Maestro de Proveedores</h1>
        <p class="subtitulo">Administre los proveedores del sistema</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nuevo Proveedor</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando proveedores...</div>

    <div v-else class="layout-contenido">
      <div class="card-tabla">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Domicilio</th>
              <th>Teléfono</th>
              <th class="col-accion">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prov in listaProveedores" :key="prov.id">
              <td class="font-medium">{{ prov.nombre }}</td>
              <td class="texto-codigo">{{ prov.cuit || '-' }}</td>
              <td>{{ prov.domicilio || '-' }}</td>
              <td>{{ prov.telefono || '-' }}</td>
              <td class="col-accion">
                <button class="btn-editar" @click="abrirModalEditar(prov)">Editar</button>
              </td>
            </tr>
            <tr v-if="listaProveedores.length === 0">
              <td colspan="5" class="sin-datos">No hay proveedores registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal-contenedor">
        <header class="modal-header">
          <h3>{{ editando ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h3>
          <button class="btn-cerrar-X" @click="cerrarModal">&times;</button>
        </header>

        <main class="modal-cuerpo">
          <div class="form-grupo">
            <label>Nombre *</label>
            <input type="text" v-model="form.nombre" placeholder="Razón social o nombre" />
          </div>
          <div class="form-grupo">
            <label>CUIT</label>
            <input type="text" v-model="form.cuit" placeholder="XX-XXXXXXXX-X" />
          </div>
          <div class="form-grupo">
            <label>Domicilio</label>
            <input type="text" v-model="form.domicilio" placeholder="Dirección del proveedor" />
          </div>
          <div class="form-grupo">
            <label>Teléfono</label>
            <input type="text" v-model="form.telefono" placeholder="Teléfono de contacto" />
          </div>
        </main>

        <footer class="modal-footer">
          <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          <button class="btn-confirmar" :disabled="!form.nombre.trim()" @click="guardar">
            {{ editando ? 'Actualizar' : 'Guardar' }}
          </button>
        </footer>
      </div>
    </div>

    <ModalExito
      :show="mostrarExito"
      :titulo="tituloExito"
      mensaje="El directorio de proveedores fue actualizado correctamente."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import { proveedoresService } from '../../services/proveedoresService'

const listaProveedores = ref([])
const cargando = ref(true)
const mostrarModal = ref(false)
const mostrarExito = ref(false)
const tituloExito = ref('')
const editando = ref(null)

const formVacio = () => ({ nombre: '', cuit: '', domicilio: '', telefono: '' })
const form = ref(formVacio())

const cargarProveedores = async () => {
  try {
    cargando.value = true
    const data = await proveedoresService.obtenerTodos()
    listaProveedores.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error cargando proveedores:', err)
    alert('No se pudo cargar el listado de proveedores.')
  } finally {
    cargando.value = false
  }
}

onMounted(cargarProveedores)

const abrirModalNuevo = () => {
  editando.value = null
  form.value = formVacio()
  mostrarModal.value = true
}

const abrirModalEditar = (prov) => {
  editando.value = prov.id
  form.value = {
    nombre: prov.nombre,
    cuit: prov.cuit || '',
    domicilio: prov.domicilio || '',
    telefono: prov.telefono || '',
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const guardar = async () => {
  const payload = {
    nombre: form.value.nombre.trim(),
    cuit: form.value.cuit.trim() || null,
    domicilio: form.value.domicilio.trim() || null,
    telefono: form.value.telefono.trim() || null,
  }

  try {
    if (editando.value) {
      await proveedoresService.actualizar(editando.value, payload)
      tituloExito.value = 'Proveedor actualizado'
    } else {
      await proveedoresService.crear(payload)
      tituloExito.value = 'Proveedor registrado'
    }

    mostrarModal.value = false
    mostrarExito.value = true
    await cargarProveedores()
  } catch (err) {
    console.error('Error al guardar proveedor:', err)
    alert('Error al guardar el proveedor: ' + err.message)
  }
}
</script>

<style scoped>
.modulo-proveedores { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }
.btn-nuevo { background: #10b981; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
.btn-nuevo:hover { background: #059669; }
.estado-mensaje { text-align: center; padding: 40px; color: #64748b; }
.layout-contenido { display: flex; flex-direction: column; gap: 20px; }

.card-tabla { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 1rem 1.5rem; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
td { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.font-medium { font-weight: 500; color: #111827; }
.texto-codigo { font-family: 'Courier New', monospace; color: #6b7280; font-size: 0.9rem; }
.col-accion { text-align: right; }
.sin-datos { text-align: center; padding: 3rem; color: #9ca3af; font-style: italic; }
.btn-editar { background: #3b82f6; color: white; border: none; border-radius: 6px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-editar:hover { background: #2563eb; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(2px); }
.modal-contenedor { background: #ffffff; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden; }
.modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #111827; font-weight: 600; }
.btn-cerrar-X { background: none; border: none; font-size: 1.5rem; color: #9ca3af; cursor: pointer; }
.btn-cerrar-X:hover { color: #374151; }
.modal-cuerpo { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem; }
input { padding: 0.65rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; background-color: #f9fafb; color: #1f2937; outline: none; transition: all 0.2s; }
input:focus { border-color: #10b981; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
.modal-footer { padding: 1rem 1.5rem; background: #f9fafb; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 0.75rem; }
.btn-cancelar { background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 500; cursor: pointer; }
.btn-cancelar:hover { background: #f3f4f6; }
.btn-confirmar { background: #10b981; border: none; color: white; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-confirmar:hover { background: #059669; }
.btn-confirmar:disabled { background: #d1d5db; cursor: not-allowed; }
</style>
