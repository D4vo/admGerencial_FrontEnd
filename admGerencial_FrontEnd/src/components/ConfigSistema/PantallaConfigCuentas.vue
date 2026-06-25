<template>
  <div class="modulo-contabilidad">
    <header class="cabecera-modulo">
      <div>
        <h1>Cuentas del Sistema</h1>
        <p class="subtitulo">Asigne qué cuenta contable cumple cada rol funcional</p>
      </div>
    </header>

    <div v-if="cargando" class="estado-mensaje">Cargando configuración...</div>
    <div v-else-if="errorCarga" class="estado-mensaje error">{{ errorCarga }}</div>

    <div v-else class="tabla-container">
      <table class="tabla-config">
        <thead>
          <tr>
            <th>Rol</th>
            <th>Cuenta asignada</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rol in rolesDisponibles" :key="rol">
            <td class="celda-rol">
              <span class="badge-rol">{{ rol }}</span>
              <span class="descripcion-rol">{{ descripcionesRoles[rol] }}</span>
            </td>
            <td>
              <select v-model="selecciones[rol]" class="select-cuenta">
                <option :value="null" disabled>-- Seleccione una cuenta --</option>
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
            </td>
            <td>
              <button
                class="btn-guardar-fila"
                :disabled="guardando[rol] || selecciones[rol] === asignacionOriginal[rol]"
                @click="guardarRol(rol)"
              >
                {{ guardando[rol] ? 'Guardando...' : 'Guardar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalExito
      :show="mostrarExito"
      titulo="Configuración actualizada"
      :mensaje="mensajeExito"
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import ModalExito from '../ModalesGenericos/ModalExito.vue'
import { cuentaSistemaService } from '../../services/cuentaSistemaService'
import { cuentasService } from '../../services/cuentasService'

const descripcionesRoles = {
  CAJA: 'Cuenta de efectivo',
  BANCO: 'Cuenta bancaria',
  MERCADERIAS: 'Inventario de mercaderías',
  VENTAS: 'Ingresos por ventas',
  CMV: 'Costo de mercadería vendida',
  CAPITAL: 'Capital social / patrimonio',
}

const cargando = ref(true)
const errorCarga = ref(null)
const rolesDisponibles = ref([])
const todasLasCuentas = ref([])
const selecciones = reactive({})
const asignacionOriginal = reactive({})
const guardando = reactive({})
const mostrarExito = ref(false)
const mensajeExito = ref('')

const tiposCuenta = ['Activo', 'Pasivo', 'Patrimonio Neto', 'Ingreso', 'Egreso']

const cuentasPorTipo = computed(() => {
  const agrupadas = {}
  for (const tipo of tiposCuenta) {
    agrupadas[tipo] = todasLasCuentas.value.filter((c) => c.tipo === tipo)
  }
  return agrupadas
})

const cargarDatos = async () => {
  try {
    cargando.value = true
    errorCarga.value = null

    const [configResp, cuentasResp] = await Promise.all([
      cuentaSistemaService.obtenerConfiguracion(),
      cuentasService.obtenerTodas(),
    ])

    rolesDisponibles.value = configResp.roles_disponibles
    todasLasCuentas.value = Array.isArray(cuentasResp) ? cuentasResp : cuentasResp.data || []

    for (const rol of configResp.roles_disponibles) {
      selecciones[rol] = null
      asignacionOriginal[rol] = null
      guardando[rol] = false
    }

    for (const item of configResp.data) {
      selecciones[item.rol] = item.cuenta_id
      asignacionOriginal[item.rol] = item.cuenta_id
    }
  } catch (err) {
    console.error('Error al cargar configuración:', err)
    errorCarga.value = 'No se pudo cargar la configuración. Verifique la conexión con el servidor.'
  } finally {
    cargando.value = false
  }
}

const guardarRol = async (rol) => {
  if (!selecciones[rol]) return
  guardando[rol] = true
  try {
    await cuentaSistemaService.actualizarRol(rol, selecciones[rol])
    asignacionOriginal[rol] = selecciones[rol]
    mensajeExito.value = `El rol "${rol}" fue asignado correctamente.`
    mostrarExito.value = true
  } catch (err) {
    alert(`Error al guardar el rol ${rol}: ${err.message}`)
  } finally {
    guardando[rol] = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.modulo-contabilidad {
  max-width: 900px;
}

.cabecera-modulo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.cabecera-modulo h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.subtitulo {
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.estado-mensaje {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 1rem;
}

.estado-mensaje.error {
  color: #ef4444;
}

.tabla-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.tabla-config {
  width: 100%;
  border-collapse: collapse;
}

.tabla-config thead {
  background: #f8fafc;
}

.tabla-config th {
  text-align: left;
  padding: 0.85rem 1.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.tabla-config td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.tabla-config tr:last-child td {
  border-bottom: none;
}

.celda-rol {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge-rol {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  font-family: monospace;
}

.descripcion-rol {
  font-size: 0.8rem;
  color: #94a3b8;
}

.select-cuenta {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-cuenta:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.btn-guardar-fila {
  padding: 0.5rem 1.25rem;
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-guardar-fila:hover:not(:disabled) {
  background: #059669;
}

.btn-guardar-fila:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>
