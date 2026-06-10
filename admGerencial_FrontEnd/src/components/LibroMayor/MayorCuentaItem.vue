<template>
  <div class="card-mayor">
    <header class="cuenta-header">
      <div class="info-cuenta">
        <span class="codigo">{{ cuenta.cuenta_codigo }}</span>
        <h3 class="nombre">{{ cuenta.cuenta_nombre }}</h3>
      </div>
      <div class="saldo-final-badge">
        <span class="label">Saldo Final:</span>
        <span class="monto">$ {{ cuenta.saldo_final.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
      </div>
    </header>

    <div class="tabla-container">
      <table>
        <thead>
          <tr>
            <th class="col-fecha">Fecha</th>
            <th class="col-ref">Ref.</th>
            <th class="col-desc">Descripción</th>
            <th class="col-monto">Debe</th>
            <th class="col-monto">Haber</th>
            <th class="col-saldo">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mov, index) in cuenta.movimientos" :key="index">
            <td class="col-fecha">{{ formatearFecha(mov.fecha) }}</td>
            <td class="col-ref">As. #{{ mov.asiento_id }}</td>
            <td class="col-desc">{{ mov.descripcion }}</td>
            
            <td class="col-monto" :class="{'texto-muted': mov.debe === 0}">
              {{ mov.debe > 0 ? '$ ' + mov.debe.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '-' }}
            </td>
            
            <td class="col-monto" :class="{'texto-muted': mov.haber === 0}">
              {{ mov.haber > 0 ? '$ ' + mov.haber.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '-' }}
            </td>
            
            <td class="col-saldo font-bold">
              $ {{ mov.saldo_acumulado.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cuenta: {
    type: Object,
    required: true
  }
});

const formatearFecha = (fechaString) => {
  if (!fechaString) return '';
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
</script>

<style scoped>
.card-mayor {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 2rem;
}

.cuenta-header {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-cuenta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.codigo {
  font-family: 'Courier New', Courier, monospace;
  background: #e2e8f0;
  color: #475569;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
}

.nombre {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.saldo-final-badge {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.saldo-final-badge .label {
  font-size: 0.85rem;
  color: #166534;
  font-weight: 600;
  text-transform: uppercase;
}

.saldo-final-badge .monto {
  font-size: 1.25rem;
  color: #15803d;
  font-weight: 800;
}

.tabla-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

td {
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.95rem;
  vertical-align: middle;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background-color: #f8fafc;
}

/* Anchos y alineaciones */
.col-fecha { width: 12%; color: #64748b; }
.col-ref { width: 10%; color: #94a3b8; font-size: 0.85rem; }
.col-desc { width: 38%; font-weight: 500; }
.col-monto { width: 13%; text-align: right; font-variant-numeric: tabular-nums; }
.col-saldo { width: 14%; text-align: right; font-variant-numeric: tabular-nums; background-color: #fafaf9; }

.font-bold { font-weight: 600; color: #0f172a; }
.texto-muted { color: #cbd5e1 !important; text-align: center; }
</style>