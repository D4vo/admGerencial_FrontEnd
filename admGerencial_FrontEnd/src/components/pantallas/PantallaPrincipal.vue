<script setup>
import { shallowRef } from 'vue';
import BarraDeNavegacion from '../layout/BarraDeNavegacion.vue';
import PantallaVentas from '../ventas/PantallaVentas.vue';
import PantallaCompras from '../compras/PantallaCompras.vue';
import PantallaProductos from '../Productos/PantallaProductos.vue';
import PantallaPlanCuentas from '../Cuentas/PantallaPlanCuentas.vue';
import PantallaLibroDiario from '../LibroDiario/PantallaLibroDiario.vue';
import PantallaDeudasProveedores from '../deudaProveedores/PantallaDeudasProveedores.vue';
// Mapeamos los nombres de los botones con sus componentes reales.
// A medida que crees más pantallas, las importás y las agregás acá.
const mapaPantallas = {
  'Ventas': PantallaVentas,
  'Compras': PantallaCompras,
  'Productos': PantallaProductos,
  'Cuentas': PantallaPlanCuentas,
  'Libro Diario': PantallaLibroDiario,
  'Deudas Proveedores': PantallaDeudasProveedores,
  // 'Libro Diario': PantallaLibroDiario,
  // 'Balance': PantallaBalance
};

// shallowRef es mejor que ref para guardar componentes enteros (optimiza el rendimiento)
const pantallaActual = shallowRef(mapaPantallas['Ventas']);

const cambiarPantalla = (nombrePantalla) => {
  if (mapaPantallas[nombrePantalla]) {
    pantallaActual.value = mapaPantallas[nombrePantalla];
  }
};
</script>

<template>
  <div class="contenedor-principal">
    <BarraDeNavegacion @navegar="cambiarPantalla" />
    
    <main class="area-contenido">
      <component :is="pantallaActual" />
    </main>
  </div>
</template>

<style scoped>
.contenedor-principal {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f4f7f6; /* Fondo gris muy claro y profesional */
  overflow: hidden;
}

.area-contenido {
  flex-grow: 1;
  padding: 40px;
  overflow-y: auto;
}
</style>