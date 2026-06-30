<template>
  <div class="pantalla-gastos">
    <header class="header">
      <h2>Gastos y Facturas Recibidas</h2>
      <p>Registre facturas de servicios, activos fijos y otros gastos que no son mercadería</p>
    </header>

    <div class="layout-grid">
      <!-- FORMULARIO -->
      <div class="card-form">
        <h3 class="titulo-card">Nuevo Gasto</h3>

        <div class="form-body">
          <div class="fila-doble">
            <div class="grupo">
              <label>Fecha *</label>
              <input type="date" v-model="form.fecha" />
            </div>
            <div class="grupo">
              <label>Monto *</label>
              <input
                type="number"
                v-model.number="form.monto"
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="grupo">
            <label>Descripción *</label>
            <input
              type="text"
              v-model="form.descripcion"
              placeholder="Ej: Reparación de aire acondicionado"
            />
          </div>

          <div class="grupo">
            <label>Cuenta al Debe *</label>
            <select v-model.number="form.cuenta_debe_id">
              <option :value="null" disabled>-- Seleccione la cuenta contable --</option>
              <optgroup v-for="tipo in tiposCuenta" :key="tipo" :label="tipo">
                <option
                  v-for="cuenta in cuentasPorTipo[tipo]"
                  :key="cuenta.id"
                  :value="cuenta.id"
                >
                  {{ cuenta.codigo }} - {{ cuenta.nombre }}
                </option>
              </optgroup>
            </select>
          </div>

          <hr class="divisor-suave" />

          <div class="fila-doble">
            <div class="grupo">
              <label>Tipo de Comprobante *</label>
              <select v-model="form.tipo_comprobante">
                <option value="Factura A">Factura A</option>
                <option value="Factura B">Factura B</option>
                <option value="Factura C">Factura C</option>
                <option value="Ticket">Ticket</option>
                <option value="Recibo">Recibo</option>
              </select>
            </div>
            <div class="grupo">
              <label>Nº Comprobante</label>
              <input
                type="text"
                v-model="form.nro_comprobante"
                placeholder="Ej: 0001-00001234"
              />
            </div>
          </div>

          <hr class="divisor-suave" />

          <div class="grupo">
            <label>Método de Pago *</label>
            <select v-model="form.metodo_pago">
              <option value="Efectivo">Efectivo (Cuenta Caja)</option>
              <option value="Transferencia">Transferencia (Cuenta Banco)</option>
              <option value="Cuenta Corriente">Cuenta Corriente (Deuda a proveedor)</option>
            </select>
          </div>

          <div class="grupo">
            <label>Proveedor {{ form.metodo_pago === 'Cuenta Corriente' ? '*' : '(opcional, para seguimiento)' }}</label>
            <div class="fila-proveedor">
              <select v-model="form.proveedor_id">
                <option :value="null">Sin proveedor asignado</option>
                <option v-for="prov in cuentasProveedores" :key="prov.id" :value="prov.id">
                  {{ prov.nombre }}{{ prov.cuit ? ` (${prov.cuit})` : '' }}
                </option>
              </select>
              <button type="button" class="btn-nuevo-prov" @click="mostrarModalProveedor = true">+ Nuevo</button>
            </div>
          </div>
        </div>

        <button
          class="btn-confirmar"
          :disabled="!formularioValido || enviando"
          @click="enviarGasto"
        >
          {{ enviando ? 'Registrando...' : 'Registrar Gasto' }}
        </button>
      </div>

      <!-- TABLA DE GASTOS REGISTRADOS -->
      <div class="card-historial">
        <h3 class="titulo-card">Gastos Registrados</h3>

        <div v-if="cargandoHistorial" class="estado-mensaje">Cargando...</div>
        <div v-else-if="gastos.length === 0" class="estado-mensaje">No hay gastos registrados</div>

        <div v-else class="tabla-scroll">
          <table class="tabla-gastos">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Cuenta</th>
                <th class="col-monto">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in gastos" :key="g.id">
                <td class="celda-fecha">{{ formatearFecha(g.fecha) }}</td>
                <td>{{ g.descripcion }}</td>
                <td class="celda-cuenta">{{ g.cuenta_codigo }} - {{ g.cuenta_nombre }}</td>
                <td class="col-monto">$ {{ Number(g.monto).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalExito
      :show="mostrarExito"
      titulo="Gasto Registrado"
      mensaje="El asiento contable fue generado automáticamente."
      @close="mostrarExito = false"
    />

    <ModalFormProveedor
      :show="mostrarModalProveedor"
      @close="mostrarModalProveedor = false"
      @guardar="crearProveedorInline"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import ModalFormProveedor from '../Proveedores/ModalFormProveedor.vue'
import { gastosService } from '../../services/gastosService'
import { cuentasService } from '../../services/cuentasService'
import { proveedoresService } from '../../services/proveedoresService'

const tiposCuenta = ['Activo', 'Pasivo', 'Patrimonio Neto', 'Ingreso', 'Egreso']

const todasLasCuentas = ref([])
const cuentasProveedores = ref([])
const gastos = ref([])
const cargandoHistorial = ref(true)
const enviando = ref(false)
const mostrarExito = ref(false)
const mostrarModalProveedor = ref(false)

const formInicial = () => ({
  fecha: new Date().toISOString().split('T')[0],
  descripcion: '',
  cuenta_debe_id: null,
  monto: null,
  tipo_comprobante: 'Factura A',
  nro_comprobante: '',
  metodo_pago: 'Efectivo',
  proveedor_id: null,
})

const form = ref(formInicial())

const cuentasPorTipo = computed(() => {
  const agrupadas = {}
  for (const tipo of tiposCuenta) {
    agrupadas[tipo] = todasLasCuentas.value.filter((c) => c.tipo === tipo)
  }
  return agrupadas
})

const formularioValido = computed(() => {
  const f = form.value
  if (!f.fecha || !f.descripcion.trim() || !f.cuenta_debe_id || !f.monto || f.monto <= 0) return false
  if (!f.tipo_comprobante) return false
  if (f.metodo_pago === 'Cuenta Corriente' && !f.proveedor_id) return false
  return true
})

const crearProveedorInline = async (payload) => {
  try {
    const nuevo = await proveedoresService.crear(payload)
    cuentasProveedores.value.push(nuevo)
    form.value.proveedor_id = nuevo.id
    mostrarModalProveedor.value = false
  } catch (err) {
    alert('Error al crear el proveedor: ' + err.message)
  }
}

const cargarDatos = async () => {
  try {
    const [cuentasData, gastosData, provData] = await Promise.all([
      cuentasService.obtenerTodas(),
      gastosService.obtenerTodos(),
      proveedoresService.obtenerTodos(),
    ])

    const cuentas = Array.isArray(cuentasData) ? cuentasData : cuentasData?.data || []
    todasLasCuentas.value = cuentas
    cuentasProveedores.value = Array.isArray(provData) ? provData : []
    gastos.value = Array.isArray(gastosData) ? gastosData : []
  } catch (err) {
    console.error('Error cargando datos:', err)
  } finally {
    cargandoHistorial.value = false
  }
}

const enviarGasto = async () => {
  enviando.value = true

  const payload = {
    fecha: form.value.fecha,
    descripcion: form.value.descripcion.trim(),
    cuenta_debe_id: form.value.cuenta_debe_id,
    monto: form.value.monto,
    tipo_comprobante: form.value.tipo_comprobante,
    nro_comprobante: form.value.nro_comprobante.trim() || 'S/N',
    metodo_pago: form.value.metodo_pago,
    proveedor_id: form.value.proveedor_id || null,
  }

  try {
    await gastosService.crear(payload)
    mostrarExito.value = true
    form.value = formInicial()
    const gastosData = await gastosService.obtenerTodos()
    gastos.value = Array.isArray(gastosData) ? gastosData : []
  } catch (err) {
    console.error('Error al registrar gasto:', err)
    alert('Error al registrar el gasto: ' + err.message)
  } finally {
    enviando.value = false
  }
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-AR')
}

onMounted(cargarDatos)
</script>

<style scoped>
.pantalla-gastos {
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
}

@media (max-width: 900px) {
  .layout-grid { grid-template-columns: 1fr; }
}

.card-form,
.card-historial {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f3f4f6;
}

.titulo-card {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #111827;
  font-size: 1.15rem;
  font-weight: 600;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.fila-doble {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.grupo {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

input,
select {
  padding: 0.65rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9fafb;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

input:focus,
select:focus {
  border-color: #10b981;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.divisor-suave {
  border: 0;
  border-top: 1px solid #f3f4f6;
  margin: 0.25rem 0;
}

.btn-confirmar {
  width: 100%;
  padding: 0.85rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-confirmar:hover:not(:disabled) { background: #059669; }
.btn-confirmar:active:not(:disabled) { transform: scale(0.98); }
.btn-confirmar:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  color: #9ca3af;
}

.estado-mensaje {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
  font-size: 0.95rem;
}

.tabla-scroll {
  overflow-x: auto;
}

.tabla-gastos {
  width: 100%;
  border-collapse: collapse;
}

.tabla-gastos th {
  text-align: left;
  padding: 0.7rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tabla-gastos td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #1f2937;
}

.tabla-gastos tr:last-child td { border-bottom: none; }

.celda-fecha {
  white-space: nowrap;
  color: #6b7280;
}

.celda-cuenta {
  font-size: 0.8rem;
  color: #64748b;
}

.col-monto {
  text-align: right;
  font-weight: 600;
  white-space: nowrap;
}

.fila-proveedor {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fila-proveedor select {
  flex: 1;
}

.btn-nuevo-prov {
  white-space: nowrap;
  padding: 0.6rem 0.9rem;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-nuevo-prov:hover {
  background: #e0e7ff;
}

.effecto-aparecer {
  animation: fadeInDown 0.3s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
