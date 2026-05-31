<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th class="col-codigo">Código</th>
          <th class="col-cuenta">Cuenta Contable</th>
          <th class="col-monto">Debe</th>
          <th class="col-monto">Haber</th>
        </tr>
      </thead>
      <tbody>
        <AsientoItem 
          v-for="asiento in asientos" 
          :key="asiento.nro_asiento" 
          :asiento="asiento" 
        />

        <tr v-if="asientos.length === 0">
          <td colspan="4" class="sin-datos">No hay movimientos contables registrados en este período.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import AsientoItem from './AsientoItem.vue';

defineProps({
  asientos: { 
    type: Array, 
    required: true 
  }
});
</script>

<style scoped>
.card-tabla { 
  background: #ffffff; 
  border-radius: 12px; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
  border: 1px solid #e5e7eb; 
  overflow-x: auto; 
}

table { 
  width: 100%; 
  border-collapse: collapse; 
  text-align: left; 
}

th { 
  padding: 1rem 1.5rem; 
  background-color: #f9fafb; 
  border-bottom: 2px solid #e5e7eb; 
  color: #4b5563; 
  font-size: 0.85rem; 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
  font-weight: 700; 
}

/* Anchos de columna */
.col-codigo { width: 15%; }
.col-cuenta { width: 45%; }
.col-monto { width: 20%; text-align: right; }

.sin-datos { text-align: center; padding: 3rem; color: #9ca3af; font-style: italic; }
</style>