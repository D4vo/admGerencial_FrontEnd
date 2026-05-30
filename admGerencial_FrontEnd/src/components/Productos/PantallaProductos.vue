<template>
  <div class="modulo-productos">
    <header class="cabecera-modulo">
      <h1>Catálogo de Productos</h1>
      <button class="btn-nuevo" @click="abrirModalNuevo">+ Nuevo Producto</button>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando catálogo y categorías...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>
    
    <TablaProductos 
      v-else
      :productos="productosInventario" 
      @editar="abrirModalEditar" 
    />

    <ModalFormProducto 
      :visible="mostrarModalForm"
      :categorias="categoriasLista"
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

<script setup>
import { ref, onMounted } from 'vue';
import { productosService } from '../../services/productosService'; 
import { categoriasService } from '../../services/categoriasService';

// Componentes Hijos
import TablaProductos from './TablaProductos.vue';
import ModalFormProducto from './ModalFormProducto.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// ==========================================
// ESTADO REACTIVO
// ==========================================
const productosInventario = ref([]);
const categoriasLista = ref([]); 
const cargando = ref(true);
const errorCarga = ref(null);

const mostrarModalForm = ref(false);
const mostrarExito = ref(false);
const tituloExito = ref('');
const productoSeleccionado = ref(null);

// ==========================================
// INICIALIZACIÓN (LLAMADAS A LA API)
// ==========================================
const cargarDatos = async () => {
  try {
    cargando.value = true;
    errorCarga.value = null;
    
    const [productosData, categoriasData] = await Promise.all([
      productosService.obtenerTodos(),
      categoriasService.obtenerTodas()
    ]);

    // CORRECCIÓN APLICADA: NavData reemplazado por categoriasData
    productosInventario.value = Array.isArray(productosData) ? productosData : (productosData?.data || []);
    categoriasLista.value = Array.isArray(categoriasData) ? categoriasData : (categoriasData?.data || []);

  } catch (err) {
    console.error('Error al cargar datos:', err);
    errorCarga.value = 'No se pudieron cargar los datos. Verifique la conexión con el servidor.';
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarDatos);

// ==========================================
// MÉTODOS DE GESTIÓN
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
    if (datos.id) {
      // 1. Armamos la estructura limpia para la actualización incluyendo el costo
      const payloadEditar = {
        nombre: datos.nombre,
        costo: datos.costo,
        precio: datos.precio,
        stock: datos.stock,
        tipo: datos.tipo
      };

      // 2. LLAMADO REAL A LA API DE EDICIÓN
      await productosService.actualizar(datos.id, payloadEditar);
      
      console.log("📦 CAMBIOS GUARDADOS EN BD PARA EL ID:", datos.id, JSON.stringify(payloadEditar, null, 2));
      tituloExito.value = "¡Producto Actualizado!";
      
    } else {
      // Inserción de producto nuevo incluyendo el costo
      const payloadNuevo = {
        nombre: datos.nombre,
        costo: datos.costo,
        precio: datos.precio,
        stock: datos.stock,
        tipo: datos.tipo
      };

      await productosService.crear(payloadNuevo);
      console.log("📦 PRODUCTO NUEVO GUARDADO EN BD:", JSON.stringify(payloadNuevo, null, 2));
      tituloExito.value = "¡Producto Creado!";
    }
    
    mostrarModalForm.value = false;
    await cargarDatos(); 
    mostrarExito.value = true;
    
  } catch (err) {
    console.error('Error al guardar producto:', err);
    alert('Hubo un error al guardar los cambios en el servidor.');
  }
};
</script>

<style scoped>
.modulo-productos { padding: 20px; }
.cabecera-modulo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.6rem; color: #1a1c23; }
.btn-nuevo { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.btn-nuevo:hover { background: #059669; }
.estado-mensaje { text-align: center; padding: 40px; color: #6b7280; }
.error { color: #ef4444; }
</style>