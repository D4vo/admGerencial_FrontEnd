<template>
  <div class="modulo-documentos">
    <header class="cabecera-modulo">
      <div>
        <h1>Gestor de Comprobantes</h1>
        <p class="subtitulo">Historial unificado de Ventas y Compras, y emisión de Notas Contables</p>
      </div>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando historial de documentos...</div>
    
    <div v-else class="layout-contenido">
      <TablaDocumentos 
        :documentos="listaDocumentos" 
        @generarNota="abrirModal"
      />
    </div>

    <ModalNotaContable 
      :show="mostrarModal"
      :documento="documentoSeleccionado"
      @close="mostrarModal = false"
      @confirmar="procesarNotaAPI"
    />

    <ModalExito 
      :show="mostrarExito" 
      titulo="¡Operación Exitosa!"
      mensaje="La nota contable ha sido registrada y el Libro Diario actualizado."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TablaDocumentos from './TablaDocumentos.vue';
import ModalNotaContable from './ModalNotaContable.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';
import { documentosService } from '../../services/documentosService'; // Importamos la API real

// ==========================================
// ESTADOS REACTIVOS
// ==========================================
const listaDocumentos = ref([]);
const cargando = ref(true);
const mostrarModal = ref(false);
const mostrarExito = ref(false);
const documentoSeleccionado = ref(null);

// ==========================================
// CARGA INICIAL (GET)
// ==========================================
const cargarHistorial = async () => {
  try {
    cargando.value = true;
    const data = await documentosService.obtenerHistorial();
    listaDocumentos.value = Array.isArray(data) ? data : (data?.data || []);
  } catch (error) {
    console.error("Error al cargar el historial de documentos:", error);
    alert("No se pudo cargar el historial de comprobantes. Verifique la conexión.");
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarHistorial);

const abrirModal = (doc) => {
  documentoSeleccionado.value = doc;
  mostrarModal.value = true;
};

// ==========================================
// LOGICA DE ENVÍO Y ENRUTAMIENTO DINÁMICO (POST)
// ==========================================
const procesarNotaAPI = async ({ payload, tipoOperacion }) => {
  // Mantenemos el log para que valides la estructura
  console.log(`🚀 PAYLOAD GENERADO PARA ENDPOINT DE ${tipoOperacion.toUpperCase()}:`, JSON.stringify(payload, null, 2));

  try {
    // Enrutamos dinámicamente según el tipo de operación original
    if (tipoOperacion === 'Venta') {
      await documentosService.emitirNotaVenta(payload);
    } else if (tipoOperacion === 'Compra') {
      await documentosService.registrarNotaCompra(payload);
    }

    // Cerramos el modal de edición y mostramos el de éxito
    mostrarModal.value = false;
    mostrarExito.value = true;

    // Recargamos la grilla para que el nuevo documento (la nota) aparezca instantáneamente arriba
    await cargarHistorial();

  } catch (error) {
    console.error("Error al registrar la nota:", error);
    alert("Ocurrió un error al intentar procesar la nota en el servidor.");
  }
};
</script>

<style scoped>
.modulo-documentos { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { margin-bottom: 25px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; letter-spacing: -0.02em; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }
.estado-mensaje { text-align: center; padding: 40px; color: #64748b; }
.layout-contenido { display: flex; flex-direction: column; gap: 20px; }
</style>