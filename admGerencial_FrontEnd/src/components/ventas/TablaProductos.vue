<script setup>
defineProps({
  productos: {
    type: Array,
    required: true
  }
});

defineEmits(['seleccionarProducto']);
</script>

<template>
  <div class="tabla-container">
    <div class="encabezado-tabla">
      <div class="col col-id">ID</div>
      <div class="col col-nombre">Producto</div>
      <div class="col col-tipo">Categoría</div>
      <div class="col col-precio">Precio</div>
      <div class="col col-stock">Stock</div>
      <div class="col col-accion">Acción</div>
    </div>

    <TransitionGroup name="fila-producto" tag="div" class="cuerpo-tabla">
      <div v-for="prod in productos" :key="prod.id" class="fila-tabla">
        <div class="col col-id id-text">{{ prod.id }}</div>
        <div class="col col-nombre nombre-text">{{ prod.nombre }}</div>
        <div class="col col-tipo">
          <span class="badge-tipo">{{ prod.tipo }}</span>
        </div>
        <div class="col col-precio precio-text">$ {{ prod.precio.toLocaleString('es-AR') }}</div>
        <div class="col col-stock">{{ prod.stock }} u.</div>
        <div class="col col-accion">
          <button @click="$emit('seleccionarProducto', prod)" class="btn-add">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icono-plus">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>

    <Transition name="fade">
      <div v-if="productos.length === 0" class="sin-resultados">
        <p>No se encontraron productos.</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tabla-container {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.encabezado-tabla {
  display: flex;
  background-color: #f8fafc;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  color: #718096;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cuerpo-tabla {
  min-height: 100px; /* Evita colapso visual */
}

.fila-tabla {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.fila-tabla:last-child {
  border-bottom: none;
}

.fila-tabla:hover {
  background-color: #f1f9ff; /* Azul muy suave al pasar el mouse */
}

/* Columnas y Tipografía */
.col { flex: 1; padding: 0 10px; }
.col-id { flex: 0 0 60px; color: #a0aec0; font-family: monospace; }
.col-nombre { flex: 2; font-weight: 500; color: #2d3748; }
.col-tipo { flex: 1; }
.col-precio { flex: 1; text-align: right; font-weight: 600; color: #3182ce; }
.col-stock { flex: 0 0 80px; text-align: center; color: #718096; }
.col-accion { flex: 0 0 70px; text-align: center; }

.badge-tipo {
  background-color: #edf2f7;
  color: #4a5568;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-add {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #3182ce;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-add:hover {
  background-color: #3182ce;
  color: #ffffff;
  border-color: #3182ce;
  transform: scale(1.05);
}

.icono-plus {
  width: 18px;
  height: 18px;
}

.sin-resultados {
  padding: 40px;
  text-align: center;
  color: #a0aec0;
}

/* --- ANIMACIONES DE LA TABLA --- */

/* Transición para las filas (v-for) */
.fila-producto-enter-active,
.fila-producto-leave-active {
  transition: all 0.4s ease;
}

.fila-producto-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fila-producto-leave-to {
  opacity: 0;
  transform: translateX(-30px); /* Se deslizan hacia la izquierda al salir */
}

/* Para asegurar que los elementos que se quedan se muevan suavemente */
.fila-producto-move {
  transition: transform 0.4s ease;
}

/* Transición simple para el estado vacío */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>