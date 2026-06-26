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
        <tr v-for="prod in productos" :key="prod.id" :class="claseFilaStock(prod)">
          <td class="text-gray">#{{ prod.id }}</td>
          <td class="font-medium">{{ prod.nombre }}</td>
          <td>
            <span class="badge-categoria">{{ prod.tipo || 'Sin Categoría' }}</span>
          </td>
          <td class="text-costo">$ {{ Number(prod.costo || 0).toFixed(2) }}</td>
          <td class="font-bold">$ {{ Number(prod.precio).toFixed(2) }}</td>
          <td>
            <div class="celda-stock">
              <span v-if="prod.stock === 0" class="stock-badge stock-critico">
                <span class="punto-pulso"></span> Sin stock
              </span>
              <span v-else-if="prod.stock <= (prod.stock_minimo || 5)" class="stock-badge stock-bajo">
                {{ prod.stock }} u.
              </span>
              <span v-else class="stock-normal">{{ prod.stock }} u.</span>
              <span v-if="prod.stock > 0 && prod.stock <= (prod.stock_minimo || 5)" class="stock-hint">
                mín: {{ prod.stock_minimo || 5 }}
              </span>
            </div>
          </td>
          <td class="col-accion">
            <button class="btn-editar" @click="emit('editar', prod)">Editar</button>
          </td>
        </tr>
        <tr v-if="productos.length === 0">
          <td colspan="7" class="sin-datos">No hay productos registrados.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  productos: { type: Array, required: true },
})

const emit = defineEmits(['editar'])

const claseFilaStock = (prod) => {
  if (prod.stock === 0) return 'fila-critica'
  if (prod.stock <= (prod.stock_minimo || 5)) return 'fila-bajo'
  return ''
}
</script>

<style scoped>
.card-tabla { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f3f4f6; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 1rem; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
tr:last-child td { border-bottom: none; }

.fila-critica { background: #fef2f2; }
.fila-critica:hover { background: #fee2e2; }
.fila-bajo { background: #fffbeb; }
.fila-bajo:hover { background: #fef3c7; }

.font-medium { font-weight: 500; color: #111827; }
.font-bold { font-weight: 600; color: #111827; }
.text-gray { color: #6b7280; }
.text-costo { color: #4b5563; font-weight: 500; }
.badge-categoria { background: #f3f4f6; color: #4b5563; padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }

.celda-stock { display: flex; flex-direction: column; gap: 0.2rem; }

.stock-normal { color: #374151; }

.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  width: fit-content;
}

.stock-critico { background: #fecaca; color: #991b1b; }
.stock-bajo { background: #fef3c7; color: #92400e; }

.stock-hint { font-size: 0.7rem; color: #94a3b8; }

.punto-pulso {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

.col-accion { text-align: right; }
.btn-editar { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-editar:hover { background: #e5e7eb; color: #111827; }

.sin-datos { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
