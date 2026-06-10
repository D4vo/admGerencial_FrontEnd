<template>
  <div class="modulo-deudas">
    <header class="cabecera-modulo">
      <div>
        <h1>Control de Deudas a Proveedores</h1>
        <p class="subtitulo">Gestione los saldos en cuenta corriente y registre los pagos realizados</p>
      </div>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando deudas pendientes...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>
    
    <div v-else class="layout-contenido">
      <TablaDeudasProveedores 
        :deudas="listaDeudas" 
        @pagar="abrirModalPago" 
      />
    </div>

    <ModalPagoProveedor
      :show="mostrarModalPago"
      :deuda="deudaSeleccionada"
      @close="mostrarModalPago = false"
      @confirm="procesarPagoAPI"
    />

    <ModalExito 
      :show="mostrarModalExito" 
      titulo="¡Pago Registrado Exitosamente!"
      mensaje="El comprobante de pago fue generado y el asiento contable impactó en el Libro Diario."
      @close="mostrarModalExito = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { proveedoresService } from '../../services/proveedoresService'; // <-- Servicio Corregido
import TablaDeudasProveedores from './TablaDeudasProveedores.vue';
import ModalPagoProveedor from './ModalPagoProveedor.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// ==========================================
// ESTADO REACTIVO REAL
// ==========================================
const listaDeudas = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);

const mostrarModalPago = ref(false);
const mostrarModalExito = ref(false);
const deudaSeleccionada = ref(null);

// ==========================================
// LLAMADA EN VIVO A LA API (GET)
// ==========================================
const cargarDeudas = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    const data = await proveedoresService.obtenerDeudas();
    // Validación segura para garantizar la lectura del array
    listaDeudas.value = Array.isArray(data) ? data : (data?.data || []);
    
  } catch (err) {
    console.error('Error al cargar las deudas de proveedores:', err);
    errorCarga.value = 'No se pudieron cargar los saldos de deudas. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarDeudas);

const abrirModalPago = (deuda) => {
  deudaSeleccionada.value = deuda;
  mostrarModalPago.value = true;
};

// ==========================================
// PROCESAMIENTO DEL COBRO (POST)
// ==========================================
const procesarPagoAPI = async (datosPagoForm) => {
  // Armamos el JSON con el formato exacto requerido por el modelo del backend
  const payloadPago = {
    fecha: new Date().toISOString(), 
    cuenta_proveedor_id: deudaSeleccionada.value.cuenta_id,
    monto_pagado: datosPagoForm.monto_pagado,
    metodo_pago: datosPagoForm.metodo_pago,
    observaciones: datosPagoForm.observaciones || ""
  };

  console.log("🚀 ENVIANDO ESTRUCTURA DE PAGO AL BACKEND:", JSON.stringify(payloadPago, null, 2));

  try {
    // Petición HTTP POST real hacia la base de datos usando el nuevo servicio
    await proveedoresService.registrarPago(payloadPago);

    // Si la operación es exitosa en el servidor, cerramos el formulario flotante
    mostrarModalPago.value = false;
    mostrarModalExito.value = true;

    // Volvemos a consultar la lista del servidor para refrescar los saldos actualizados automáticamente
    await cargarDeudas();

  } catch (error) {
    console.error("Error al registrar el pago en el servidor:", error);
    alert("Hubo un problema al procesar el pago en el servidor. Verifique los campos enviados.");
  }
};
</script>

<style scoped>
.modulo-deudas { padding: 20px; max-width: 1200px; margin: 0 auto; }
.cabecera-modulo { margin-bottom: 25px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.6rem; color: #111827; font-weight: 700; }
.subtitulo { margin: 5px 0 0 0; color: #6b7280; font-size: 0.95rem; }
.estado-mensaje { text-align: center; padding: 40px; color: #6b7280; }
.error { color: #ef4444; }
.layout-contenido { display: flex; flex-direction: column; gap: 20px; }
</style>