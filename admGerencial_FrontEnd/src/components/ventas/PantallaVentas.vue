<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, computed, onMounted } from 'vue';
import { productosService } from '../../services/productosService'; // Servicio para la API

// Componentes Hijos
import BuscadorProductos from './BuscadorProductos.vue';
import TablaProductos from './TablaProductos.vue';
import PanelCarrito from './PanelCarrito.vue';

// Modales
import ModalCantidad from './ModalCantidad.vue';
import ModalCheckout from './ModalCheckout.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// ==========================================
// 2. ESTADO DEL CATÁLOGO Y BÚSQUEDA
// ==========================================
const productosInventario = ref([]); // Inicia vacío, se llena desde la API
const cargando = ref(true);          // Controla el cartel de "Cargando..."
const errorCarga = ref(null);        // Guarda el mensaje de error si falla la API
const textoBusqueda = ref('');

// ==========================================
// 3. ESTADO DEL CARRITO Y MODALES
// ==========================================
const carrito = ref([]);

// Estados: Modal de Cantidad (Añadir al carrito)
const modalOpen = ref(false);
const productoSeleccionadoParaModal = ref(null);

// Estados: Modal de Checkout (Cobro)
const modalCheckoutOpen = ref(false);

// Estados: Modal de Éxito (Global)
const modalExitoOpen = ref(false);
const mensajeExito = ref('');

// ==========================================
// 4. INICIALIZACIÓN (LLAMADAS A LA API)
// ==========================================
onMounted(async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    // Llamada al backend a través de la capa de servicios
    const data = await productosService.obtenerTodos();
    productosInventario.value = data;
    
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    errorCarga.value = 'No se pudieron cargar los productos. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
});

// ==========================================
// 5. LÓGICA COMPUTADA (FILTROS Y TOTALES)
// ==========================================
const productosFiltrados = computed(() => {
  const query = textoBusqueda.value.toLowerCase().trim();
  if (!query) return productosInventario.value;

  return productosInventario.value.filter(p => 
    p.nombre.toLowerCase().includes(query) ||
    p.id.toString().includes(query) ||
    p.tipo.toLowerCase().includes(query)
  );
});

const totalCarrito = computed(() => {
  return carrito.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
});

// ==========================================
// 6. MÉTODOS DEL CARRITO
// ==========================================
const abrirModalCantidad = (producto) => {
  productoSeleccionadoParaModal.value = producto;
  modalOpen.value = true;
};

const añadirAlCarritoConfirmado = (cantidad) => {
  const prod = productoSeleccionadoParaModal.value;

  // Verificamos si ya está en el carrito para sumar cantidad en lugar de duplicar fila
  const itemExistente = carrito.value.find(item => item.id === prod.id);

  if (itemExistente) {
    const nuevaCantidad = itemExistente.cantidad + cantidad;
    if (nuevaCantidad <= prod.stock) {
        itemExistente.cantidad = nuevaCantidad;
    } else {
        alert('No hay stock suficiente para sumar esa cantidad.');
    }
  } else {
    // Añadimos nueva fila al carrito
    carrito.value.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: cantidad
    });
  }

  // Cerramos modal
  modalOpen.value = false;
  productoSeleccionadoParaModal.value = null;
};

const eliminarDelCarrito = (index) => {
  carrito.value.splice(index, 1);
};

// ==========================================
// 7. MÉTODOS DE VENTA (CHECKOUT)
// ==========================================
const procesarVenta = (datosVenta) => {
  // Acá en el futuro harás el "await ventasService.crearVenta(datosVenta)"
  console.log('ESTRUCTURA LISTA PARA LA API:', datosVenta);
  
  // 1. Cerramos el modal de checkout grande
  modalCheckoutOpen.value = false;
  
  // 2. Limpiamos el carrito para el siguiente cliente
  carrito.value = [];
  
  // 3. Preparamos el mensaje dinámico para el modal de éxito
  mensajeExito.value = `La venta por un total de $${datosVenta.total.toLocaleString('es-AR')} abonada con ${datosVenta.metodoPago} se ha registrado correctamente en el sistema.`;
  
  // 4. Abrimos el modal de éxito
  modalExitoOpen.value = true;
};
</script>

<template>
  <div class="modulo-ventas">
    <header class="cabecera-modulo">
      <h1>Punto de Venta (Kiosco)</h1>
    </header>

    <div class="layout-ventas">
      <section class="seccion-catalogo">
        <BuscadorProductos v-model="textoBusqueda" />
        <div v-if="cargando" class="estado-mensaje">Cargando productos...</div>
        <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>
        <TablaProductos 
          :productos="productosFiltrados" 
          @seleccionarProducto="abrirModalCantidad"
        />
      </section>

      <section class="seccion-carrito">
        <PanelCarrito 
          :carrito="carrito" 
          @eliminarItem="eliminarDelCarrito"
          @iniciarCobro="modalCheckoutOpen = true"
        />
      </section>
    </div>
    <ModalCheckout
        :show="modalCheckoutOpen"
        :carrito="carrito"
        :total="totalCarrito"
        @close="modalCheckoutOpen = false"
        @confirmarVenta="procesarVenta"
    />
    <ModalExito
      :show="modalExitoOpen"
      titulo="¡Venta Completada!"
      :mensaje="mensajeExito"
      @close="modalExitoOpen = false"
    />
    <ModalCantidad 
      :show="modalOpen" 
      :producto="productoSeleccionadoParaModal"
      @close="modalOpen = false"
      @confirm="añadirAlCarritoConfirmado"
    />
  </div>
</template>

<style scoped>
.modulo-ventas {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ocupa el alto del contenedor principal */
}

.cabecera-modulo {
  margin-bottom: 20px;
}

.cabecera-modulo h1 {
  margin: 0;
  font-size: 1.6rem;
  color: #1a1c23;
  font-weight: 700;
}

.layout-ventas {
  display: flex;
  gap: 25px;
  flex-grow: 1; /* Ocupa el espacio restante verticalmente */
  overflow: hidden; /* Para que las secciones internas manejen su scroll */
}

.seccion-catalogo {
  flex: 1; /* Toma aprox 70% (dependiendo del gap y flex del carrito) */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Importante para que la tabla no rompa el layout */
}

.seccion-carrito {
  width: 380px; /* Ancho fijo para el ticket */
  flex-shrink: 0; /* No dejes que se achique */
}

/* Asegurar que la tabla dentro de catálogo tenga scroll propio si es muy larga */
:deep(.tabla-container) {
  flex-grow: 1;
  overflow-y: auto;
}
</style>