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
import TablaDeudasProveedores from './TablaDeudasProveedores.vue';
import ModalPagoProveedor from './ModalPagoProveedor.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// ==========================================
// ESTADO ESTÁTICO (Estructura provista del Back)
// ==========================================
const deudasEstaticas = [
  {
    "cuenta_id": 48,
    "cuenta_codigo": "211001",
    "proveedor_cuenta": "Proveedores DonJose",
    "saldo_pendiente": 25000.00
  },
  {
    "cuenta_id": 49,
    "cuenta_codigo": "211002",
    "proveedor_cuenta": "Proveedores Gonzales",
    "saldo_pendiente": 12000.00
  }
];

// ==========================================
// ESTADO REACTIVO
// ==========================================
const listaDeudas = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);

const mostrarModalPago = ref(false);
const mostrarModalExito = ref(false);
const deudaSeleccionada = ref(null);

// Simulación de carga inicial
onMounted(async () => {
  try {
    cargando.value = true;
    await new Promise(resolve => setTimeout(resolve, 600)); // Feedback visual rápido
    listaDeudas.value = deudasEstaticas;
  } catch (err) {
    console.error(err);
    errorCarga.value = 'No se pudieron cargar los saldos.';
  } finally {
    cargando.value = false;
  }
});

const abrirModalPago = (deuda) => {
  deudaSeleccionada.value = deuda;
  mostrarModalPago.value = true;
};

// ==========================================
// GESTIÓN DE LA API Y PAYLOADS
// ==========================================
const procesarPagoAPI = async (datosPagoForm) => {
  // 1. Armamos el JSON estricto tal cual lo requiere el backend
  const payloadPago = {
    fecha: new Date().toISOString(), // Genera el formato ISO Completo (Ej: "2026-06-06T15:30:00.000Z")
    cuenta_proveedor_id: deudaSeleccionada.value.cuenta_id,
    monto_pagado: datosPagoForm.monto_pagado,
    metodo_pago: datosPagoForm.metodo_pago,
    observaciones: datosPagoForm.observaciones || ""
  };

  // 2. LOG EXIGIDO: Revisión visual en consola de la estructura exacta antes de enviar
  console.log("🚀 ESTRUCTURA LISTA PARA ENVIAR AL BACKEND (POST /compras/pagos):", JSON.stringify(payloadPago, null, 2));

  try {
    // ======================================================================
    // UBICACIÓN DE LA LLAMADA A LA API:
    // Aquí debés descomentar e incluir tu llamado real mediante el servicio.
    // Ejemplo:
    // await comprasService.registrarPagoProveedor(payloadPago);
    // ======================================================================
    
    // Simulación temporal de éxito
    await new Promise(resolve => setTimeout(resolve, 500));

    // Descontamos localmente el saldo de la lista para ver el cambio inmediato en la grilla
    const index = listaDeudas.value.findIndex(d => d.cuenta_id === payloadPago.cuenta_proveedor_id);
    if (index !== -1) {
      listaDeudas.value[index].saldo_pendiente -= payloadPago.monto_pagado;
      // Si el saldo pendiente quedó en 0, podrías optar por removerlo de la lista
      if (listaDeudas.value[index].saldo_pendiente <= 0) {
        listaDeudas.value.splice(index, 1);
      }
    }

    // Cerramos el formulario e indicamos éxito global
    mostrarModalPago.value = false;
    mostrarModalExito.value = true;

  } catch (error) {
    console.error("Error al registrar el pago en el servidor:", error);
    alert("Hubo un problema de conexión al asentar el pago.");
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