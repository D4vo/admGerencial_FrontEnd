<script setup>
import { shallowRef } from 'vue';
import BarraDeNavegacion from '../layout/BarraDeNavegacion.vue';
import PantallaVentas from '../ventas/PantallaVentas.vue';

// Mapeamos los nombres de los botones con sus componentes reales.
// A medida que crees más pantallas, las importás y las agregás acá.
const mapaPantallas = {
  'Ventas': PantallaVentas,
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