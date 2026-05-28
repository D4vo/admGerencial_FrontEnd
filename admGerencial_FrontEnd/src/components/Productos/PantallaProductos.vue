<script setup>
// ==========================================
// 1. IMPORTS
// ==========================================
import { ref, computed, onMounted } from 'vue';
import { productosService } from '../../services/productosService'; // Tu servicio real

// Componentes Hijos
import TablaProductos from './TablaProductos.vue';
import ModalFormProducto from './ModalFormProducto.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// ==========================================
// 2. ESTADO
// ==========================================
const productosInventario = ref([]);
const cargando = ref(true);
const errorCarga = ref(null);

// Estados de modales
const mostrarModalForm = ref(false);
const mostrarExito = ref(false);
const tituloExito = ref('');
const productoSeleccionado = ref(null); // Si es null, es un producto nuevo

// Categorías estáticas (tal como pediste)
const categoriasEstaticas = ref([
  { nombre: 'Bebidas' },
  { nombre: 'Snacks' },
  { nombre: 'Golosinas' },
  { nombre: 'Limpieza' }
]);

// ==========================================
// 3. INICIALIZACIÓN (LLAMADAS A LA API)
// ==========================================

const cargarDatos = async () => {
  
    const categoriasEstaticas = ref([
    { nombre: 'Bebidas' },
    { nombre: 'Snacks' },
    { nombre: 'Golosinas' },
    { nombre: 'Limpieza' }
    ]);

    try {
    cargando.value = true;
    errorCarga.value = null;
    productosInventario.value = await productosService.obtenerTodos();
  } catch (err) {
    console.error('Error al cargar productos:', err);
    errorCarga.value = 'No se pudieron cargar los productos.';
  } finally {
    cargando.value = false;
  }
};
onMounted(cargarDatos);

// ==========================================
// 4. MÉTODOS DE GESTIÓN (POST/PUT)
// ==========================================
const abrirModalNuevo = () => {
  productoSeleccionado.value = null;
  mostrarModalForm.value = true;
};

const abrirModalEditar = (producto) => {
  productoSeleccionado.value = { ...producto };
  mostrarModalForm.value = true;
};

const guardarProducto = async (datos) => {
  try {
    // Aquí es donde usas el servicio que ya tienes preparado
    if (datos.id) {
      //await productosService.actualizar(datos.id, datos);
      console.log("📦 ESTRUCTURA JSON A ENVIAR (editar):", JSON.stringify(datos, null, 2));
      tituloExito.value = "¡Producto Actualizado!";
    } else {
      await productosService.crear(datos);
      console.log("📦 ESTRUCTURA JSON A ENVIAR(nuevo):", JSON.stringify(datos, null, 2));
      tituloExito.value = "¡Producto Creado!";
    }
    
    // Éxito: cerramos modal, recargamos y mostramos confirmación
    mostrarModalForm.value = false;
    await cargarProductos();
    mostrarExito.value = true;
    
  } catch (err) {
    console.error('Error al guardar producto:', err);
    alert('Hubo un error al guardar los cambios.');
  }
};
</script>

<template>
  <div class="modulo-productos">
    <header class="cabecera-modulo">
      <h1>Catálogo de Productos</h1>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nuevo Producto</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando catálogo...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>
    
    <TablaProductos 
      v-else
      :productos="productosInventario" 
      @editar="abrirModalEditar" 
    />

    <ModalFormProducto 
      :visible="mostrarModalForm"
      :categorias="categoriasEstaticas"
      :productoOriginal="productoSeleccionado"
      @cerrar="mostrarModalForm = false"
      @guardar="guardarProducto"
    />

    <ModalExito 
      v-if="mostrarExito"
      :show="mostrarExito"
      :titulo="tituloExito"
      mensaje="Los cambios se han guardado correctamente en el servidor."
      @close="mostrarExito = false"
    />
  </div>
</template>

<style scoped>
.modulo-productos { padding: 20px; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.6rem; color: #1a1c23; }
.btn-nuevo { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-nuevo:hover { background: #059669; }
.estado-mensaje { text-align: center; padding: 40px; color: #6b7280; }
</style>