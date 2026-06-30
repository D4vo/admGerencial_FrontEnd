<template>
  <div class="modulo-clientes">
    <header class="cabecera-modulo">
      <div>
        <h1>Gestión de Clientes</h1>
        <p class="subtitulo">Directorio de entidades para facturación y cuentas corrientes</p>
      </div>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nuevo Cliente</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando directorio...</div>
    
    <div v-else class="layout-contenido">
      <TablaClientes :clientes="listaClientes" @cambiar-estado="cambiarEstadoCliente" @editar="abrirModalEditar" />
    </div>

    <ModalFormCliente
      :show="mostrarModalForm"
      :cliente="clienteEditando"
      @close="mostrarModalForm = false"
      @guardar="procesarGuardadoCliente"
    />

    <ModalExito
      :show="mostrarExito"
      :titulo="tituloExito"
      :mensaje="mensajeExito"
      @close="mostrarExito = false"
    />

    <ModalConfirmacion
      :show="mostrarConfirmacion"
      :titulo="confirmacion.titulo"
      :mensaje="confirmacion.mensaje"
      :variante="confirmacion.variante"
      :texto-confirmar="confirmacion.textoConfirmar"
      @confirm="ejecutarConfirmacion"
      @cancel="mostrarConfirmacion = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TablaClientes from './TablaClientes.vue';
import ModalFormCliente from './ModalFormCliente.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';
import ModalConfirmacion from '../ModalesGenericos/ModalConfirmacion.vue';
import { clientesService } from '../../services/clientesService'; // Importamos el servicio real de la API

// ==========================================
// ESTADOS REACTIVOS
// ==========================================
const listaClientes = ref([]);
const cargando = ref(true);
const mostrarModalForm = ref(false);
const mostrarExito = ref(false);
const mostrarConfirmacion = ref(false);
const confirmacion = ref({ titulo: '', mensaje: '', variante: 'default', textoConfirmar: 'Confirmar', accion: null });
const clienteEditando = ref(null);
const tituloExito = ref('¡Cliente Registrado!');
const mensajeExito = ref('La entidad fue añadida correctamente al directorio del sistema.');

// ==========================================
// FUNCIÓN DE CARGA (GET)
// ==========================================
const traerDirectorioClientes = async () => {
  try {
    cargando.value = true;
    // Pantalla de mantenimiento: trae también los inactivos para poder reactivarlos
    const datos = await clientesService.obtenerClientes(true);
    listaClientes.value = datos;
  } catch (error) {
    console.error("Error al conectar con el endpoint GET /clientes/:", error);
    alert("Hubo un problema al cargar el listado de clientes desde el servidor.");
  } finally {
    cargando.value = false;
  }
};

const cambiarEstadoCliente = (cliente) => {
  const activo = !cliente.activo;
  confirmacion.value = {
    titulo: activo ? 'Reactivar cliente' : 'Dar de baja cliente',
    mensaje: `¿Seguro que querés ${activo ? 'reactivar' : 'dar de baja a'} "${cliente.razon_social}"?`,
    variante: activo ? 'default' : 'peligro',
    textoConfirmar: activo ? 'Reactivar' : 'Dar de baja',
    accion: async () => {
      try {
        await clientesService.cambiarEstado(cliente.cuit, activo);
        await traerDirectorioClientes();
      } catch (error) {
        console.error("Error al cambiar el estado del cliente:", error);
        alert("No se pudo actualizar el estado del cliente.");
      }
    },
  };
  mostrarConfirmacion.value = true;
};

const ejecutarConfirmacion = async () => {
  mostrarConfirmacion.value = false;
  if (confirmacion.value.accion) await confirmacion.value.accion();
};

// Disparamos la carga real apenas se monta la pantalla en el Kiosco
onMounted(traerDirectorioClientes);

const abrirModalNuevo = () => { clienteEditando.value = null; mostrarModalForm.value = true; };
const abrirModalEditar = (cliente) => { clienteEditando.value = cliente; mostrarModalForm.value = true; };

// ==========================================
// PROCESAMIENTO DE GUARDADO (POST / PUT)
// ==========================================
const procesarGuardadoCliente = async (payloadCliente) => {
  try {
    cargando.value = true;

    if (clienteEditando.value) {
      await clientesService.actualizarCliente(clienteEditando.value.cuit, payloadCliente);
      tituloExito.value = '¡Cliente Actualizado!';
      mensajeExito.value = 'Los datos del cliente fueron actualizados correctamente.';
    } else {
      await clientesService.crearCliente(payloadCliente);
      tituloExito.value = '¡Cliente Registrado!';
      mensajeExito.value = 'La entidad fue añadida correctamente al directorio del sistema.';
    }

    mostrarModalForm.value = false;
    mostrarExito.value = true;

    // REGLA CLAVE ERP: Volvemos a consultar la lista para traer los datos limpios y sincronizados desde la DB
    await traerDirectorioClientes();

  } catch (error) {
    console.error("Error al guardar el cliente en el backend:", error);
    alert(clienteEditando.value
      ? "No se pudo actualizar el cliente."
      : "El servidor rechazó el registro. Verifique que el CUIT no esté duplicado.");
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