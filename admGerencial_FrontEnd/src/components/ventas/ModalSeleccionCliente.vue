<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-contenedor effecto-aparecer">
      <header class="modal-header">
        <h3>Seleccionar Cliente Existente</h3>
        <button class="btn-cerrar-X" @click="emit('close')">&times;</button>
      </header>

      <main class="modal-cuerpo">
        <div class="form-grupo input-buscador">
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="🔍 Buscar por Nombre, Razón Social o CUIT..." 
            class="input-busqueda"
          />
        </div>

        <div v-if="cargando" class="cargando-txt">Cargando directorio de clientes...</div>
        
        <div v-else class="tabla-scroll">
          <table class="tabla-seleccion">
            <thead>
              <tr>
                <th>CUIT / DNI</th>
                <th>Razón Social / Nombre</th>
                <th>Condición IVA</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cliente, index) in clientesFiltrados" :key="index">
                <td class="font-mono">{{ cliente.cuit }}</td>
                <td class="font-bold">{{ cliente.razon_social }}</td>
                <td><span class="badge">{{ cliente.condicion_iva }}</span></td>
                <td class="text-right">
                  <button class="btn-seleccionar-item" @click="seleccionar(cliente)">
                    Seleccionar
                  </button>
                </td>
              </tr>
              <tr v-if="clientesFiltrados.length === 0">
                <td colspan="4" class="sin-datos">No se encontraron clientes coincidentes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { clientesService } from '../../services/clientesService';

const props = defineProps({
  show: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'seleccionar']);

const listaClientes = ref([]);
const cargando = ref(true);
const busqueda = ref('');

const cargarClientes = async () => {
  try {
    cargando.value = true;
    const datos = await clientesService.obtenerClientes();
    listaClientes.value = Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error al traer clientes en Checkout:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarClientes);

const clientesFiltrados = computed(() => {
  return listaClientes.value.filter(cliente => {
    // Regala de exclusión: Ocultar Consumidor Final de la lista de selección Factura A
    if (cliente.cuit === '00000000000') return false;

    const query = busqueda.value.toLowerCase().trim();
    if (!query) return true;

    return (
      cliente.razon_social.toLowerCase().includes(query) ||
      cliente.cuit.includes(query)
    );
  });
});

const seleccionar = (cliente) => {
  emit('seleccionar', cliente);
};
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); z-index: 1100; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.modal-contenedor { background: #ffffff; border-radius: 14px; width: 100%; max-width: 580px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; max-height: 85vh; display: flex; flex-direction: column; }
.modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.15rem; color: #0f172a; font-weight: 700; }
.btn-cerrar-X { background: none; border: none; font-size: 1.4rem; color: #94a3b8; cursor: pointer; }
.btn-cerrar-X:hover { color: #ef4444; }
.modal-cuerpo { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; overflow: hidden; }
.input-busqueda { padding: 0.6rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; width: 100%; outline: none; }
.input-busqueda:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.tabla-scroll { overflow-y: auto; max-height: 50vh; border: 1px solid #e2e8f0; border-radius: 8px; }
.tabla-seleccion { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.tabla-seleccion th { padding: 0.75rem 1rem; background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 700; }
.tabla-seleccion td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.font-mono { font-family: monospace; color: #475569; }
.font-bold { font-weight: 600; color: #0f172a; }
.badge { background: #e2e8f0; color: #475569; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.text-right { text-align: right; }
.btn-seleccionar-item { background: #3b82f6; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-seleccionar-item:hover { background: #1d4ed8; }
.cargando-txt, .sin-datos { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; }
.effecto-aparecer { animation: fadeInDown 0.2s ease-out; }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>