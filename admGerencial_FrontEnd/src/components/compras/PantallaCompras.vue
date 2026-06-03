<template>
  <div class="pantalla-compras">
    <header class="header">
      <h2>Ingreso de Mercadería</h2>
      <p>Registre las compras a proveedores y sus comprobantes</p>
    </header>

    <div class="layout-grid">
      <div class="col-principal">
        <FormularioItemCompra :productos="productosInventario" @agregar-item="onAgregarItem" />
        <TablaDetalleCompra :detalles="detallesCompra" @eliminar-item="onEliminarItem" />
      </div>

      <div class="col-lateral">
        <PanelResumenCompra
          ref="panelRef"
          :total="totalCompra" 
          :cargando="cargando"
          :proveedores="cuentasProveedores"
          @confirmar-compra="enviarAlBackend" 
        />
      </div>
    </div>

    <ModalExito 
      :show="mostrarModal" 
      titulo="¡Compra Registrada!"
      mensaje="El stock y los libros contables han sido actualizados."
      @close="cerrarModalYLimpiar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productosService } from '../../services/productosService'
import { cuentasService } from '../../services/cuentasService'
import { comprasService } from '../../services/comprasService'
import FormularioItemCompra from './FormularioItemCompra.vue'
import TablaDetalleCompra from './TablaDetalleCompra.vue'
import PanelResumenCompra from './PanelResumenCompra.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'

// Estados
const productosInventario = ref([])
const cuentasProveedores = ref([]) // Nuevo estado para los proveedores
const errorCarga = ref(null)
const detallesCompra = ref([])
const cargando = ref(false)
const mostrarModal = ref(false) 
const panelRef = ref(null)

// Llamada centralizada a la API para cargar productos y cuentas
onMounted(async () => {
  try {
    // Traemos ambos catálogos en paralelo
    const [productosData, cuentasData] = await Promise.all([
      productosService.obtenerTodos(),
      cuentasService.obtenerTodas()
    ])

    // Asignación segura
    productosInventario.value = Array.isArray(productosData) ? productosData : (productosData?.data || [])
    
    const todasLasCuentas = Array.isArray(cuentasData) ? cuentasData : (cuentasData?.data || [])
    
    // Filtramos para quedarnos solo con cuentas del pasivo que representen proveedores
    cuentasProveedores.value = todasLasCuentas.filter(cuenta => 
      cuenta.tipo === 'Pasivo' && cuenta.nombre.toLowerCase().includes('proveedor')
    )

  } catch (err) {
    console.error('Error obteniendo datos iniciales:', err)
    errorCarga.value = 'Error al cargar catálogos.'
  }
})

const totalCompra = computed(() => {
  return detallesCompra.value.reduce((acc, item) => acc + (item.cantidad * item.costo_unitario), 0)
})

const onAgregarItem = (nuevoItem) => detallesCompra.value.push(nuevoItem)
const onEliminarItem = (index) => detallesCompra.value.splice(index, 1)

const enviarAlBackend = async (datosCabecera) => {
  if (detallesCompra.value.length === 0) return

  cargando.value = true

  // 1. Limpiamos los detalles
  const detallesFormateados = detallesCompra.value.map(item => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    costo_unitario: item.costo_unitario
  }))

  // 2. Base del payload
  const payload = {
    fecha: new Date().toISOString().split('T')[0],
    tipo_comprobante: datosCabecera.tipo_comprobante,
    total: totalCompra.value,
    detalles: detallesFormateados
  }

  // 3. Condicional para la estructura del JSON
  if (datosCabecera.tipo_comprobante === 'Cuenta Corriente') {
    payload.cuenta_proveedor_id = datosCabecera.cuenta_proveedor_id
  } else {
    payload.nro_comprobante = datosCabecera.nro_comprobante
    payload.metodo_pago = datosCabecera.metodo_pago
  }
 
  try {
    console.log("📦 ENVIANDO COMPRA AL BACKEND:", JSON.stringify(payload, null, 2))
    
    // Llamado real a la API
    await comprasService.crear(payload)
    
    mostrarModal.value = true
  } catch (error) {
    console.error("Error en la API de compras:", error)
    alert('Hubo un error al registrar la compra en el servidor.')
  } finally {
    cargando.value = false
  }
}

const cerrarModalYLimpiar = () => {
  mostrarModal.value = false
  detallesCompra.value = []
  
  if (panelRef.value) {
    panelRef.value.resetearFormulario()
  }
}
</script>

<style scoped>
.pantalla-compras { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif; 
}
.header { margin-bottom: 2rem; }
.header h2 { margin: 0 0 0.5rem 0; font-size: 1.8rem; color: #111827; font-weight: 700; }
.header p { margin: 0; color: #6b7280; font-size: 1rem; }
.layout-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); 
  gap: 2rem; 
  align-items: start; 
}

@media (max-width: 900px) {
  .layout-grid { grid-template-columns: 1fr; }
}
</style>