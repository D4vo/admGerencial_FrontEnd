<template>
  <div class="modulo-clientes">
    <header class="cabecera-modulo">
      <div>
        <h1>Gestión de Clientes</h1>
        <p class="subtitulo">Directorio de entidades para facturación y cuentas corrientes</p>
      </div>
      <button class="btn-nuevo" @click="mostrarModalForm = true">+ Nuevo Cliente</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando directorio...</div>
    
    <div v-else class="layout-contenido">
      <TablaClientes :clientes="listaClientes" />
    </div>

    <ModalFormCliente 
      :show="mostrarModalForm"
      @close="mostrarModalForm = false"
      @guardar="procesarNuevoCliente"
    />

    <ModalExito 
      :show="mostrarExito" 
      titulo="¡Cliente Registrado!"
      mensaje="La entidad fue añadida correctamente al directorio del sistema."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TablaClientes from './TablaClientes.vue';
import ModalFormCliente from './ModalFormCliente.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';
import { clientesService } from '../../services/clientesService'; // Importamos el servicio real de la API

// ==========================================
// ESTADOS REACTIVOS
// ==========================================
const listaClientes = ref([]);
const cargando = ref(true);
const mostrarModalForm = ref(false);
const mostrarExito = ref(false);

// ==========================================
// FUNCIÓN DE CARGA (GET)
// ==========================================
const traerDirectorioClientes = async () => {
  try {
    cargando.value = true;
    const datos = await clientesService.obtenerClientes();
    listaClientes.value = datos;
  } catch (error) {
    console.error("Error al conectar con el endpoint GET /clientes/:", error);
    alert("Hubo un problema al cargar el listado de clientes desde el servidor.");
  } finally {
    cargando.value = false;
  }
};

// Disparamos la carga real apenas se monta la pantalla en el Kiosco
onMounted(traerDirectorioClientes);

// ==========================================
// PROCESAMIENTO DE GUARDADO (POST)
// ==========================================
const procesarNuevoCliente = async (payloadCliente) => {
  console.log("🚀 ENVIANDO EN TIEMPO REAL A POST /clientes/:", JSON.stringify(payloadCliente, null, 2));
  
  try {
    cargando.value = true;
    
    // Petición HTTP sincrónica hacia la API de Python
    await clientesService.crearCliente(payloadCliente);
    
    // Si impactó bien en la base de datos, cerramos el formulario y levantamos el modal premium de éxito
    mostrarModalForm.value = false;
    mostrarExito.value = true;

    // REGLA CLAVE ERP: Volvemos a consultar la lista para traer los datos limpios y sincronizados desde la DB
    await traerDirectorioClientes();

  } catch (error) {
    console.error("Error al registrar el cliente en el backend:", error);
    alert("El servidor rechazó el registro. Verifique que el CUIT no esté duplicado.");
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.modulo-clientes { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; letter-spacing: -0.02em; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }
.btn-nuevo { background: #10b981; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
.btn-nuevo:hover { background: #059669; }
.estado-mensaje { text-align: center; padding: 40px; color: #64748b; }
.layout-contenido { display: flex; flex-direction: column; gap: 20px; }
</style>