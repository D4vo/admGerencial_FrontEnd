<template>
  <tr class="fila-separador">
    <td colspan="4">
      <span class="badge-asiento">Asiento N° {{ asiento.nro_asiento }}</span>
      <span class="fecha-asiento">{{ formatearFecha(asiento.fecha) }}</span>
    </td>
  </tr>

  <tr v-for="(det, index) in asiento.detalles" :key="index" class="fila-detalle">
    <td class="texto-codigo">{{ det.cuenta_codigo }}</td>
    <td :class="{'cuenta-haber': det.haber > 0, 'cuenta-debe': det.debe > 0}">
      {{ det.cuenta_nombre }}
    </td>
    <td class="monto">
      {{ det.debe > 0 ? '$ ' + det.debe.toLocaleString('es-AR', {minimumFractionDigits: 2}) : '' }}
    </td>
    <td class="monto">
      {{ det.haber > 0 ? '$ ' + det.haber.toLocaleString('es-AR', {minimumFractionDigits: 2}) : '' }}
    </td>
  </tr>

  <tr class="fila-totales">
    <td colspan="2" class="leyenda">
      <em>Según: {{ asiento.descripcion }}</em>
    </td>
    <td class="monto total-sum">$ {{ asiento.total_debe.toLocaleString('es-AR', {minimumFractionDigits: 2}) }}</td>
    <td class="monto total-sum">$ {{ asiento.total_haber.toLocaleString('es-AR', {minimumFractionDigits: 2}) }}</td>
  </tr>
</template>

<script setup>
defineProps({
  asiento: { 
    type: Object, 
    required: true 
  }
});

const formatearFecha = (fechaString) => {
  if (!fechaString) return '';
  
  // Extraemos la fecha cortando cualquier posible "T" de tiempo 
  // y luego dividimos por los guiones para rearmarlo en formato DD/MM/YYYY
  const fechaSolo = fechaString.split('T')[0];
  const [year, month, day] = fechaSolo.split('-');
  
  return `${day}/${month}/${year}`;
};
</script>

<style scoped>
td { 
  padding: 0.75rem 1.5rem; 
  color: #374151; 
  vertical-align: middle; 
}

/* Tipografía y alineaciones */
.texto-codigo { font-family: 'Courier New', Courier, monospace; color: #6b7280; font-size: 0.9rem; }
.monto { text-align: right; font-variant-numeric: tabular-nums; font-weight: 500; }

/* Sangría contable clásica: Las cuentas del haber se empujan a la derecha */
.cuenta-debe { font-weight: 600; color: #111827; }
.cuenta-haber { padding-left: 2.5rem !important; font-style: italic; color: #4b5563; }

/* Separadores de Asientos */
.fila-separador td { 
  background-color: #f3f4f6; 
  padding: 0.5rem 1.5rem; 
  border-top: 2px solid #d1d5db;
  border-bottom: 1px solid #e5e7eb;
}

.badge-asiento { 
  background: #3b82f6; 
  color: white; 
  padding: 0.2rem 0.6rem; 
  border-radius: 4px; 
  font-size: 0.75rem; 
  font-weight: 700; 
  margin-right: 1rem;
}

.fecha-asiento { font-size: 0.85rem; font-weight: 600; color: #4b5563; }

/* Totales y Leyendas */
.fila-totales td { 
  background-color: #fafafa; 
  border-bottom: 2px solid #e5e7eb; 
  padding-bottom: 1.5rem;
}

.leyenda { color: #6b7280; font-size: 0.9rem; }
.total-sum { font-weight: 700; color: #111827; border-top: 1px solid #d1d5db; }
</style>