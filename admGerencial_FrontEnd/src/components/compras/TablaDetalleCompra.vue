<template>
  <div class="card-tabla" v-if="detalles.length > 0">
    <table>
      <thead>
        <tr>
          <th>Producto ID</th>
          <th>Cantidad</th>
          <th>Costo Unit.</th>
          <th>Subtotal</th>
          <th class="col-accion"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in detalles" :key="index">
          <td class="font-medium text-gray">#{{ item.producto_id }}</td>
          <td>{{ item.cantidad }}</td>
          <td>$ {{ item.costo_unitario.toFixed(2) }}</td>
          <td class="font-bold">$ {{ (item.cantidad * item.costo_unitario).toFixed(2) }}</td>
          <td class="col-accion">
            <button class="btn-borrar" @click="emit('eliminar-item', index)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({ detalles: { type: Array, required: true } })
const emit = defineEmits(['eliminar-item'])
</script>

<style scoped>
.card-tabla { 
  background: #ffffff; 
  padding: 1.5rem; 
  border-radius: 12px; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #f3f4f6;
  overflow-x: auto;
}
table { width: 100%; border-collapse: collapse; text-align: left; }
th { 
  padding: 0.75rem 1rem; 
  border-bottom: 1px solid #e5e7eb; 
  color: #6b7280; 
  font-size: 0.8rem; 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
  font-weight: 600;
}
td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; color: #111827; }
.text-gray { color: #6b7280; }
.col-accion { text-align: right; width: 50px; }
.btn-borrar { 
  background: #fee2e2; 
  color: #ef4444; 
  border: none; 
  border-radius: 6px;
  padding: 0.4rem; 
  cursor: pointer; 
  display: inline-flex;
  transition: all 0.2s;
}
.btn-borrar:hover { background: #fca5a5; color: #991b1b; }
</style>