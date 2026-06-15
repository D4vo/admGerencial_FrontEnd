<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th class="col-fecha">Fecha</th>
          <th class="col-operacion">Operación</th>
          <th class="col-comprobante">Comprobante</th>
          <th class="col-entidad">Entidad (Cliente/Proveedor)</th>
          <th class="col-monto">Total</th>
          <th class="col-accion">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documentos" :key="doc.id">
          <td class="col-fecha">{{ formatearFecha(doc.fecha_emision) }}</td>
          <td class="col-operacion">
            <span :class="['badge', doc.tipo_operacion === 'Venta' ? 'badge-venta' : 'badge-compra']">
              {{ doc.tipo_operacion }}
            </span>
          </td>
          <td class="col-comprobante">
            <span class="tipo">{{ doc.tipo_comprobante }}</span>
            <br>
            <span class="numero">{{ doc.nro_comprobante }}</span>
          </td>
          <td class="col-entidad">{{ doc.entidad_nombre }}</td>
          <td class="col-monto font-bold">
            $ {{ doc.total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
          </td>
          <td class="col-accion">
            <button class="btn-accion" @click="emit('generarNota', doc)">
              Generar Nota
            </button>
          </td>
        </tr>
        <tr v-if="documentos.length === 0">
          <td colspan="6" class="sin-datos">No hay documentos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  documentos: { type: Array, required: true }
});

const emit = defineEmits(['generarNota']);

const formatearFecha = (fechaString) => {
  if (!fechaString) return '';
  const fecha = new Date(fechaString);
  // Al sumar la zona horaria garantizamos que el día coincida con el string
  fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
  return fecha.toLocaleDateString('es-AR');
};
</script>

<style scoped>
.card-tabla {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  overflow-x: auto;
}
table { width: 100%; border-collapse: collapse; text-align: left; }
th {
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background-color: #f8fafc; }

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.badge-venta { background: #dcfce7; color: #166534; }
.badge-compra { background: #fee2e2; color: #991b1b; }

.tipo { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
.numero { font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; color: #64748b; }

.col-monto { text-align: right; }
.col-accion { text-align: right; }

.font-bold { font-weight: 700; color: #0f172a; }

.btn-accion {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #3b82f6;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-accion:hover { background: #eff6ff; border-color: #bfdbfe; }

.sin-datos { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }
</style>