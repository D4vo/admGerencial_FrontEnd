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

<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, computed, onMounted } from 'vue';
import { productosService } from '../../services/productosService'; 
import { ventasService } from '../../services/ventasService'; // Importamos el servicio de ventas

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
const productosInventario = ref([]); 
const cargando = ref(true);          
const errorCarga = ref(null);        
const textoBusqueda = ref('');

// ==========================================
// 3. ESTADO DEL CARRITO Y MODALES
// ==========================================
const carrito = ref([]);
const modalOpen = ref(false);
const productoSeleccionadoParaModal = ref(null);
const modalCheckoutOpen = ref(false);
const modalExitoOpen = ref(false);
const mensajeExito = ref('');

// ==========================================
// 4. INICIALIZACIÓN (LLAMADAS A LA API)
// ==========================================
const cargarDatos = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    const data = await productosService.obtenerTodos();
    // Validación segura de array
    productosInventario.value = Array.isArray(data) ? data : (data?.data || []);
    
  } catch (err) {
    console.error('Error obteniendo productos:', err);
    errorCarga.value = 'No se pudieron cargar los productos. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarDatos);

// ==========================================
// 5. LÓGICA COMPUTADA (FILTROS Y TOTALES)
// ==========================================
const productosFiltrados = computed(() => {
  const query = textoBusqueda.value.toLowerCase().trim();
  if (!query) return productosInventario.value;

  return productosInventario.value.filter(p => 
    p.nombre.toLowerCase().includes(query) ||
    p.id.toString().includes(query) ||
    (p.tipo && p.tipo.toLowerCase().includes(query)) // Verificación de seguridad extra en 'tipo'
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
  const itemExistente = carrito.value.find(item => item.id === prod.id);

  if (itemExistente) {
    const nuevaCantidad = itemExistente.cantidad + cantidad;
    if (nuevaCantidad <= prod.stock) {
        itemExistente.cantidad = nuevaCantidad;
    } else {
        alert('No hay stock suficiente para sumar esa cantidad.');
    }
  } else {
    carrito.value.push({
      id: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: cantidad
    });
  }

  modalOpen.value = false;
  productoSeleccionadoParaModal.value = null;
};

const eliminarDelCarrito = (index) => {
  carrito.value.splice(index, 1);
};

// ==========================================
// 7. MÉTODOS DE VENTA (CHECKOUT API)
// ==========================================
const procesarVenta = async (datosVenta) => {
  try {
    console.log('📦 ENVIANDO VENTA AL BACKEND:', JSON.stringify(datosVenta, null, 2));

    // Enviamos la estructura completa y exacta que generó el modal y espera la API
    await ventasService.crear(datosVenta);
    
    // Si sale bien, cerramos el checkout y limpiamos el carrito para la próxima venta
    modalCheckoutOpen.value = false;
    carrito.value = [];
    
    // Refrescamos el catálogo para actualizar el stock en tiempo real
    await cargarDatos();
    
    // Preparamos el mensaje de éxito
    mensajeExito.value = `La venta por un total de $${datosVenta.total.toLocaleString('es-AR')} abonada con ${datosVenta.metodoPago} se ha registrado correctamente en el sistema.`;
    
    modalExitoOpen.value = true;

  } catch (error) {
    console.error('Error al procesar la venta:', error);
    alert('Hubo un error al registrar la venta en el servidor.');
  }
};
</script>

<style scoped>
.modulo-ventas {
  display: flex;
  flex-direction: column;
  height: 100%; 
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
  flex-grow: 1; 
  overflow: hidden; 
}

.seccion-catalogo {
  flex: 1; 
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}

.seccion-carrito {
  width: 380px; 
  flex-shrink: 0; 
}

:deep(.tabla-container) {
  flex-grow: 1;
  overflow-y: auto;
}
</style>