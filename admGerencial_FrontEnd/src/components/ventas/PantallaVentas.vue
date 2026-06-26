<template>
  <div class="modulo-ventas">
    <header class="cabecera-ventas">
      <div>
        <h1>Punto de Venta</h1>
        <p class="subtitulo">{{ productosInventario.length }} productos en catálogo</p>
      </div>
    </header>

    <div class="layout-ventas">
      <!-- Catálogo -->
      <section class="seccion-catalogo">
        <div class="catalogo-header">
          <div class="buscador-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icono-buscar">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              v-model="textoBusqueda"
              placeholder="Buscar producto por nombre, ID o categoría..."
              class="input-buscar"
              ref="inputBuscar"
            />
          </div>

          <div class="filtros-categoria">
            <button :class="['chip-cat', { activo: categoriaActiva === null }]" @click="categoriaActiva = null">Todos</button>
            <button
              v-for="cat in categoriasDisponibles"
              :key="cat"
              :class="['chip-cat', { activo: categoriaActiva === cat }]"
              @click="categoriaActiva = cat"
            >{{ cat }}</button>
          </div>
        </div>

        <div v-if="cargando" class="estado-mensaje">Cargando catálogo...</div>
        <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>

        <div v-else class="lista-productos">
          <div
            v-for="prod in productosFiltrados"
            :key="prod.id"
            :class="['fila-producto', { 'sin-stock': prod.stock === 0 }]"
            @click="prod.stock > 0 && agregarUnidad(prod)"
          >
            <div class="fp-info">
              <span class="fp-nombre">{{ prod.nombre }}</span>
              <span class="fp-categoria">{{ prod.tipo }}</span>
            </div>
            <span class="fp-precio">$ {{ Number(prod.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            <div class="fp-stock-col">
              <span v-if="prod.stock === 0" class="fp-stock critico">Sin stock</span>
              <span v-else-if="prod.stock <= (prod.stock_minimo || 5)" class="fp-stock bajo">{{ prod.stock }} u.</span>
              <span v-else class="fp-stock">{{ prod.stock }} u.</span>
            </div>
            <button v-if="prod.stock > 0" class="fp-btn-add" @click.stop="agregarUnidad(prod)">+</button>
            <div v-else class="fp-btn-disabled">—</div>
          </div>

          <div v-if="productosFiltrados.length === 0" class="estado-vacio">
            No se encontraron productos.
          </div>
        </div>
      </section>

      <!-- Carrito -->
      <section class="seccion-carrito">
        <div class="carrito-card">
          <div class="carrito-header">
            <h2>Detalle de Venta</h2>
            <span class="carrito-count">{{ carrito.length }}</span>
          </div>

          <div class="carrito-body">
            <div v-if="carrito.length === 0" class="carrito-vacio">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="icono-carrito-vacio">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              <p>Seleccione productos del catálogo</p>
            </div>

            <TransitionGroup name="item-carrito" tag="div" class="carrito-items" v-else>
              <div v-for="(item, index) in carrito" :key="item.id" class="carrito-item">
                <div class="ci-info">
                  <span class="ci-nombre">{{ item.nombre }}</span>
                  <span class="ci-precio-u">$ {{ Number(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }} c/u</span>
                </div>
                <div class="ci-controles">
                  <button class="ci-btn" @click="decrementar(index)">−</button>
                  <span class="ci-cantidad">{{ item.cantidad }}</span>
                  <button class="ci-btn" @click="incrementar(index)" :disabled="item.cantidad >= getStock(item.id)">+</button>
                </div>
                <span class="ci-subtotal">$ {{ (item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
                <button class="ci-eliminar" @click="eliminarDelCarrito(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </TransitionGroup>
          </div>

          <div class="carrito-footer">
            <div class="carrito-total">
              <span class="total-label">Total</span>
              <span class="total-monto">$ {{ totalCarrito.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <button class="btn-cobrar" :disabled="carrito.length === 0" @click="modalCheckoutOpen = true">
              Iniciar Cobro
            </button>
          </div>
        </div>
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
      titulo="Venta Completada"
      :mensaje="mensajeExito"
      @close="modalExitoOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productosService } from '../../services/productosService'
import { ventasService } from '../../services/ventasService'
import ModalCheckout from './ModalCheckout.vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'

const productosInventario = ref([])
const cargando = ref(true)
const errorCarga = ref(null)
const textoBusqueda = ref('')
const categoriaActiva = ref(null)
const inputBuscar = ref(null)

const carrito = ref([])
const modalCheckoutOpen = ref(false)
const modalExitoOpen = ref(false)
const mensajeExito = ref('')

const cargarDatos = async () => {
  try {
    cargando.value = true
    errorCarga.value = null
    const data = await productosService.obtenerTodos()
    productosInventario.value = Array.isArray(data) ? data : data?.data || []
  } catch (err) {
    errorCarga.value = 'No se pudieron cargar los productos.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)

const categoriasDisponibles = computed(() => {
  const tipos = new Set(productosInventario.value.map((p) => p.tipo).filter(Boolean))
  return [...tipos].sort()
})

const productosFiltrados = computed(() => {
  let lista = productosInventario.value
  if (categoriaActiva.value) lista = lista.filter((p) => p.tipo === categoriaActiva.value)
  const q = textoBusqueda.value.toLowerCase().trim()
  if (q) {
    lista = lista.filter((p) =>
      p.nombre.toLowerCase().includes(q) || p.id.toString().includes(q) || (p.tipo && p.tipo.toLowerCase().includes(q))
    )
  }
  return lista
})

const totalCarrito = computed(() => carrito.value.reduce((s, i) => s + i.precio * i.cantidad, 0))

const getStock = (prodId) => {
  const p = productosInventario.value.find((x) => x.id === prodId)
  return p ? p.stock : 0
}

const agregarUnidad = (prod) => {
  const existente = carrito.value.find((i) => i.id === prod.id)
  if (existente) {
    if (existente.cantidad < prod.stock) existente.cantidad++
  } else {
    carrito.value.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 })
  }
}

const incrementar = (index) => {
  const item = carrito.value[index]
  const stock = getStock(item.id)
  if (item.cantidad < stock) item.cantidad++
}

const decrementar = (index) => {
  const item = carrito.value[index]
  if (item.cantidad > 1) {
    item.cantidad--
  } else {
    carrito.value.splice(index, 1)
  }
}

const eliminarDelCarrito = (index) => carrito.value.splice(index, 1)

const procesarVenta = async (datosVenta) => {
  try {
    const resp = await ventasService.crear(datosVenta)
    await ventasService.descargarTicket(resp.id)
    modalCheckoutOpen.value = false
    carrito.value = []
    await cargarDatos()
    mensajeExito.value = `Venta por $${datosVenta.total.toLocaleString('es-AR')} registrada. Comprobante descargándose.`
    modalExitoOpen.value = true
  } catch (error) {
    console.error('Error al procesar la venta:', error)
    alert('Error al registrar la venta en el servidor.')
  }
}
</script>

<style scoped>
.modulo-ventas {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Inter', system-ui, sans-serif;
}

.cabecera-ventas { margin-bottom: 1.25rem; }
.cabecera-ventas h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.subtitulo { margin: 0.2rem 0 0 0; color: #94a3b8; font-size: 0.88rem; }

/* Layout */
.layout-ventas { display: flex; gap: 1.5rem; flex-grow: 1; overflow: hidden; }
.seccion-catalogo { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.seccion-carrito { width: 380px; flex-shrink: 0; }

/* Buscador y filtros */
.catalogo-header { margin-bottom: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem; }

.buscador-wrapper { position: relative; }
.icono-buscar { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #94a3b8; }
.input-buscar {
  width: 100%; padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem;
  outline: none; transition: all 0.2s; background: #ffffff; color: #0f172a;
}
.input-buscar:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.input-buscar::placeholder { color: #cbd5e1; }

.filtros-categoria { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.chip-cat {
  padding: 0.25rem 0.7rem; border: 1px solid #e2e8f0; border-radius: 20px;
  background: #ffffff; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.15s;
}
.chip-cat:hover { background: #f8fafc; border-color: #cbd5e1; }
.chip-cat.activo { background: #0f172a; border-color: #0f172a; color: #ffffff; }

/* Lista de productos */
.lista-productos { flex-grow: 1; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff; }

.fila-producto {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.7rem 1rem; border-bottom: 1px solid #f1f5f9;
  cursor: pointer; transition: background 0.12s; user-select: none;
}
.fila-producto:last-child { border-bottom: none; }
.fila-producto:hover { background: #f0f9ff; }
.fila-producto.sin-stock { opacity: 0.45; cursor: not-allowed; }
.fila-producto.sin-stock:hover { background: transparent; }

.fp-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.fp-nombre { font-weight: 600; color: #0f172a; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fp-categoria { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }

.fp-precio { font-weight: 700; color: #0f172a; font-size: 0.92rem; min-width: 90px; text-align: right; }

.fp-stock-col { min-width: 65px; text-align: center; }
.fp-stock { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.fp-stock.critico { color: #ef4444; font-weight: 700; font-size: 0.75rem; }
.fp-stock.bajo { color: #f59e0b; font-weight: 700; }

.fp-btn-add {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #ffffff; color: #3b82f6; font-size: 1.2rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0;
}
.fp-btn-add:hover { background: #3b82f6; color: #ffffff; border-color: #3b82f6; }
.fp-btn-disabled { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #d1d5db; font-size: 0.9rem; flex-shrink: 0; }

.estado-mensaje { text-align: center; padding: 3rem; color: #94a3b8; }
.estado-mensaje.error { color: #ef4444; }
.estado-vacio { text-align: center; padding: 3rem; color: #94a3b8; }

/* Carrito */
.carrito-card {
  background: #ffffff; border-radius: 12px; display: flex; flex-direction: column;
  height: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e5e7eb;
}

.carrito-header {
  padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}
.carrito-header h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.carrito-count {
  background: #f1f5f9; color: #475569; width: 26px; height: 26px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;
}

.carrito-body { flex-grow: 1; overflow-y: auto; }
.carrito-vacio { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #cbd5e1; }
.icono-carrito-vacio { width: 42px; height: 42px; margin-bottom: 0.75rem; }
.carrito-vacio p { margin: 0; font-size: 0.88rem; color: #94a3b8; }

.carrito-items { padding: 0.25rem 0; }

.carrito-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.7rem 1rem; border-bottom: 1px solid #f8fafc; transition: background 0.12s;
}
.carrito-item:hover { background: #fafbfc; }
.carrito-item:last-child { border-bottom: none; }

.ci-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.ci-nombre { font-weight: 600; color: #0f172a; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ci-precio-u { font-size: 0.72rem; color: #94a3b8; }

.ci-controles { display: flex; align-items: center; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.ci-btn {
  width: 28px; height: 28px; border: none; background: #f8fafc; color: #475569;
  font-size: 1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.ci-btn:hover:not(:disabled) { background: #e2e8f0; }
.ci-btn:disabled { color: #d1d5db; cursor: not-allowed; }
.ci-cantidad { width: 28px; text-align: center; font-size: 0.85rem; font-weight: 700; color: #0f172a; background: #ffffff; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; height: 28px; display: flex; align-items: center; justify-content: center; }

.ci-subtotal { font-weight: 700; color: #0f172a; font-size: 0.88rem; min-width: 75px; text-align: right; }

.ci-eliminar {
  background: none; border: none; color: #d1d5db; cursor: pointer; padding: 0.2rem;
  display: flex; align-items: center; justify-content: center; transition: color 0.15s; flex-shrink: 0;
}
.ci-eliminar:hover { color: #ef4444; }

/* Footer carrito */
.carrito-footer {
  padding: 1.15rem 1.25rem; border-top: 1px solid #f1f5f9;
  background: #fafbfc; border-radius: 0 0 12px 12px;
}
.carrito-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.85rem; }
.total-label { font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.total-monto { font-size: 1.5rem; font-weight: 800; color: #0f172a; }

.btn-cobrar {
  width: 100%; padding: 0.8rem; background: #10b981; color: #ffffff;
  border: none; border-radius: 10px; font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(16,185,129,0.25);
}
.btn-cobrar:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
.btn-cobrar:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }

/* Animaciones */
.item-carrito-enter-active, .item-carrito-leave-active { transition: all 0.2s ease; }
.item-carrito-enter-from { opacity: 0; transform: translateX(16px); }
.item-carrito-leave-to { opacity: 0; transform: scale(0.95); }
</style>
