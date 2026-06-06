<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th>Código Cuenta</th>
          <th>Proveedor / Cuenta</th>
          <th class="col-monto">Saldo Pendiente</th>
          <th class="col-accion">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="deuda in deudas" :key="deuda.cuenta_id">
          <td class="texto-codigo">{{ deuda.cuenta_codigo }}</td>
          <td class="font-medium">{{ deuda.proveedor_cuenta }}</td>
          <td class="font-bold col-monto">$ {{ deuda.saldo_pendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
          <td class="col-accion">
            <button class="btn-pagar" @click="emit('pagar', deuda)">
              Pagar Deuda
            </button>
          </td>
        </tr>
        <tr v-if="deudas.length === 0">
          <td colspan="4" class="sin-datos">No registrás deudas pendientes con proveedores.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  deudas: { type: Array, required: true }
});

const emit = defineEmits(['pagar']);
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
  color: #6b7280;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
td { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
tr:last-child td { border-bottom: none; }

.font-medium { font-weight: 500; color: #111827; }
.font-bold { font-weight: 600; color: #111827; }
.texto-codigo { font-family: 'Courier New', Courier, monospace; color: #6b7280; font-size: 0.9rem; }

.col-monto { text-align: right; }
.col-accion { text-align: right; }

.btn-pagar {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-pagar:hover { background: #059669; }
.sin-datos { text-align: center; padding: 3rem; color: #9ca3af; font-style: italic; }
</style>