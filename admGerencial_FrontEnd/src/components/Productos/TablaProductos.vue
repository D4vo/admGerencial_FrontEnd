<template>
  <div class="card-tabla">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre del Producto</th>
          <th>Categoría</th>
          <th>Costo</th>
          <th>Precio</th>
          <th>Stock</th>
          <th class="col-accion">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="prod in productos" :key="prod.id">
          <td class="text-gray">#{{ prod.id }}</td>
          <td class="font-medium">{{ prod.nombre }}</td>
          <td>
            <span class="badge-categoria">{{ prod.tipo || 'Sin Categoría' }}</span>
          </td>
          <td class="text-costo">$ {{ Number(prod.costo || 0).toFixed(2) }}</td>
          <td class="font-bold">$ {{ Number(prod.precio).toFixed(2) }}</td>
          <td>{{ prod.stock }}</td>
          <td class="col-accion">
            <button class="btn-editar" @click="emit('editar', prod)">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  productos: { type: Array, required: true }
})

const emit = defineEmits(['editar'])
</script>

<style scoped>
.card-tabla { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 1rem; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
.font-medium { font-weight: 500; color: #111827; }
.font-bold { font-weight: 600; color: #111827; }
.text-gray { color: #6b7280; }
.text-costo { color: #4b5563; font-weight: 500; }
.badge-categoria { background: #f3f4f6; color: #4b5563; padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
.col-accion { text-align: right; }
.btn-editar { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-editar:hover { background: #e5e7eb; color: #111827; }
</style>