<template>
  <div class="modulo-asiento-manual">
    <header class="cabecera-modulo">
      <div>
        <h1>Nuevo Asiento Manual</h1>
        <p class="subtitulo">Registro de movimientos contables directos en el Libro Diario</p>
      </div>
    </header>

    <main class="layout-contenido">
      <div class="card-formulario">
        <div class="grid-cabecera">
          <div class="form-grupo">
            <label>Fecha de Registración *</label>
            <input type="date" v-model="fecha" class="input-fecha" />
          </div>
          <div class="form-grupo descripcion-full">
            <label>Descripción / Leyenda del Asiento *</label>
            <input 
              type="text" 
              v-model="descripcion" 
              placeholder="Ej: Provisión de honorarios contables del mes..." 
            />
          </div>
        </div>

        <hr class="divisor" />

        <div class="cabecera-grilla">
          <h3>Detalle de Cuentas</h3>
          <button class="btn-agregar" @click="agregarFila">+ Agregar Cuenta</button>
        </div>

        <div class="tabla-container">
          <table>
            <thead>
              <tr>
                <th class="col-cuenta">Cuenta Contable</th>
                <th class="col-monto">Debe</th>
                <th class="col-monto">Haber</th>
                <th class="col-accion"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fila, index) in detalles" :key="fila.id" class="fila-animada">
                
                <td class="col-cuenta">
                  <div class="buscador-contenedor">
                    <input 
                      type="text" 
                      v-model="fila.busqueda_visible" 
                      placeholder="🔍 Buscar por código o nombre..." 
                      @focus="fila.dropdownAbierto = true"
                      @input="reiniciarSeleccion(fila)"
                      @blur="cerrarDropdown(fila)"
                      class="input-buscador-cuenta"
                      :class="{'error-borde': !fila.cuenta_id && fila.busqueda_visible}"
                    />
                    
                    <ul v-if="fila.dropdownAbierto" class="dropdown-cuentas">
                      <li 
                        v-for="cuenta in filtrarCuentas(fila.busqueda_visible)" 
                        :key="cuenta.id"
                        @mousedown.prevent="seleccionarCuenta(fila, cuenta)"
                      >
                        <div class="cuenta-info-principal">
                          <span class="cuenta-codigo">{{ cuenta.codigo }}</span>
                          <span class="cuenta-nombre">{{ cuenta.nombre }}</span>
                        </div>
                        <span class="cuenta-tipo badge-tipo" :class="obtenerClaseTipo(cuenta.naturaleza)">
                          {{ cuenta.tipo || 'Desconocido' }}
                        </span>
                      </li>
                      <li v-if="filtrarCuentas(fila.busqueda_visible).length === 0" class="dropdown-vacio">
                        No se encontraron cuentas
                      </li>
                    </ul>
                  </div>
                </td>
                
                <td class="col-monto">
                  <div class="input-monto">
                    <span class="prefijo">$</span>
                    <input 
                      type="number" 
                      v-model.number="fila.debe" 
                      min="0" step="0.01" 
                      @input="validarCruce(fila, 'debe')"
                      :disabled="fila.haber > 0"
                      :class="{'disabled-input': fila.haber > 0}"
                    />
                  </div>
                </td>

                <td class="col-monto">
                  <div class="input-monto">
                    <span class="prefijo">$</span>
                    <input 
                      type="number" 
                      v-model.number="fila.haber" 
                      min="0" step="0.01" 
                      @input="validarCruce(fila, 'haber')"
                      :disabled="fila.debe > 0"
                      :class="{'disabled-input': fila.debe > 0}"
                    />
                  </div>
                </td>

                <td class="col-accion">
                  <button class="btn-eliminar" @click="eliminarFila(index)" v-if="detalles.length > 2" title="Eliminar fila">
                    &times;
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer-totales" :class="{'cuadra-perfecto': partidaDobleOk}">
          <div class="estado-partida">
            <span v-if="partidaDobleOk">✅ Partida doble balanceada</span>
            <span v-else class="error-balance">❌ El asiento está descuadrado o incompleto</span>
          </div>
          <div class="bloque-sumas">
            <div class="suma-item">
              <span class="label">Total Debe:</span>
              <span class="monto">$ {{ totalDebe.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="suma-item">
              <span class="label">Total Haber:</span>
              <span class="monto">$ {{ totalHaber.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="botonera-final">
          <button 
            class="btn-confirmar" 
            :disabled="!puedeGuardar || cargando" 
            @click="guardarAsiento"
          >
            {{ cargando ? 'Registrando...' : 'Registrar Asiento' }}
          </button>
        </div>
      </div>
    </main>

    <ModalExito 
      :show="mostrarExito" 
      titulo="¡Asiento Registrado!"
      mensaje="El asiento manual fue ingresado exitosamente en la contabilidad."
      @close="mostrarExito = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { cuentasService } from '../../services/cuentasService';
import { contabilidadService } from '../../services/contabilidadService';
import ModalExito from '../ModalesGenericos/ModalExito.vue';

// --- ESTADOS REACTIVOS PRINCIPALES ---
const fecha = ref(new Date().toISOString().split('T')[0]);
const descripcion = ref('');
const planDeCuentas = ref([]);
const cargando = ref(false);
const mostrarExito = ref(false);

// El asiento arranca con 2 filas vacías por ley de partida doble.
const generarFilaVacia = (idExtra) => ({
  id: Date.now() + idExtra,
  cuenta_id: '',
  busqueda_visible: '',
  dropdownAbierto: false,
  debe: 0,
  haber: 0
});

const detalles = ref([
  generarFilaVacia(0),
  generarFilaVacia(1)
]);

// --- CICLO DE VIDA (GET CUENTAS) ---
onMounted(async () => {
  try {
    const datosCuentas = await cuentasService.obtenerTodas();
    planDeCuentas.value = Array.isArray(datosCuentas) ? datosCuentas : [];
  } catch (error) {
    console.error("Error al cargar plan de cuentas:", error);
  }
});

// --- LÓGICA DEL BUSCADOR PREDICTIVO ---
const filtrarCuentas = (texto) => {
  if (!texto) return planDeCuentas.value;
  const busqueda = texto.toLowerCase();
  return planDeCuentas.value.filter(c => 
    (c.codigo && c.codigo.toLowerCase().includes(busqueda)) || 
    (c.nombre && c.nombre.toLowerCase().includes(busqueda))
  );
};

const seleccionarCuenta = (fila, cuenta) => {
  fila.cuenta_id = cuenta.id;
  fila.busqueda_visible = `${cuenta.codigo} - ${cuenta.nombre}`;
  fila.dropdownAbierto = false;
};

const reiniciarSeleccion = (fila) => {
  fila.cuenta_id = '';
  fila.dropdownAbierto = true;
};

const cerrarDropdown = (fila) => {
  setTimeout(() => {
    fila.dropdownAbierto = false;
    if (!fila.cuenta_id) fila.busqueda_visible = '';
  }, 150);
};

// NUEVO: Función para determinar el color del badge según el tipo de cuenta
const obtenerClaseTipo = (tipo) => {
  const tipoLimpio = tipo ? tipo.toLowerCase() : '';
  if (tipoLimpio.includes('activo')) return 'badge-activo';
  if (tipoLimpio.includes('pasivo')) return 'badge-pasivo';
  if (tipoLimpio.includes('patrimonio') || tipoLimpio.includes('pn')) return 'badge-pn';
  if (tipoLimpio.includes('ingreso') || tipoLimpio.includes('resultado positivo')) return 'badge-ingreso';
  if (tipoLimpio.includes('egreso') || tipoLimpio.includes('gasto') || tipoLimpio.includes('resultado negativo')) return 'badge-egreso';
  return 'badge-default';
};

// --- LÓGICA DE GRILLA Y MONTOS ---
const agregarFila = () => { detalles.value.push(generarFilaVacia(detalles.value.length)); };

const eliminarFila = (index) => {
  if (detalles.value.length > 2) detalles.value.splice(index, 1);
};

const validarCruce = (fila, campoModificado) => {
  if (campoModificado === 'debe' && fila.debe > 0) fila.haber = 0;
  else if (campoModificado === 'haber' && fila.haber > 0) fila.debe = 0;
};

// --- COMPUTADAS Y VALIDACIÓN DE PARTIDA DOBLE ---
const totalDebe = computed(() => detalles.value.reduce((acc, fila) => acc + (Number(fila.debe) || 0), 0));
const totalHaber = computed(() => detalles.value.reduce((acc, fila) => acc + (Number(fila.haber) || 0), 0));

const partidaDobleOk = computed(() => {
  return totalDebe.value > 0 && totalHaber.value > 0 && (totalDebe.value === totalHaber.value);
});

const puedeGuardar = computed(() => {
  const descripcionOk = descripcion.value.trim() !== '';
  const cuentasOk = detalles.value.every(fila => fila.cuenta_id !== '');
  return partidaDobleOk.value && descripcionOk && cuentasOk;
});

// --- ENVÍO AL BACKEND (POST) ---
const guardarAsiento = async () => {
  if (!puedeGuardar.value) return;

  const payload = {
    fecha: fecha.value,
    descripcion: descripcion.value.trim(),
    total: totalDebe.value,
    detalles: detalles.value.filter(fila => fila.debe > 0 || fila.haber > 0).map(fila => ({
      cuenta_id: fila.cuenta_id,
      debe: Number(fila.debe) || 0,
      haber: Number(fila.haber) || 0
    }))
  };

  console.log("🚀 Payload Asiento Manual (Con IDs Correctos):", JSON.stringify(payload, null, 2));

  try {
    cargando.value = true;
    await contabilidadService.registrarAsientoManual(payload);
    
    fecha.value = new Date().toISOString().split('T')[0];
    descripcion.value = '';
    detalles.value = [generarFilaVacia(0), generarFilaVacia(1)];
    
    mostrarExito.value = true;
  } catch (error) {
    console.error("Error al registrar asiento:", error);
    alert("Hubo un error al registrar el asiento en el servidor.");
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.modulo-asiento-manual { padding: 20px; max-width: 1050px; margin: 0 auto; }
.cabecera-modulo { margin-bottom: 25px; }
.cabecera-modulo h1 { margin: 0; font-size: 1.8rem; color: #0f172a; font-weight: 800; letter-spacing: -0.02em; }
.subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 0.95rem; }

.card-formulario {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.grid-cabecera { display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .grid-cabecera { grid-template-columns: 1fr; } }
.form-grupo { display: flex; flex-direction: column; }
.form-grupo label { font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.4rem; }

input { padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem; outline: none; transition: all 0.2s; }
input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.error-borde { border-color: #ef4444; background-color: #fef2f2; }

.divisor { border: 0; border-top: 1px dashed #e2e8f0; margin: 1.5rem 0; }

.cabecera-grilla { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.cabecera-grilla h3 { margin: 0; font-size: 1.1rem; color: #0f172a; }
.btn-agregar { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-agregar:hover { background: #dbeafe; }

.tabla-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: visible; margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background: #f8fafc; padding: 0.75rem 1rem; font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
td { padding: 0.5rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; position: relative; }

.col-cuenta { width: 45%; }
.col-monto { width: 22.5%; }
.col-accion { width: 10%; text-align: right; }

/* ESTILOS DEL BUSCADOR FLOTANTE */
.buscador-contenedor { position: relative; width: 100%; }
.input-buscador-cuenta { width: 100%; font-weight: 600; color: #1e293b; }
.dropdown-cuentas {
  position: absolute; top: 100%; left: 0; width: 100%; max-height: 250px; overflow-y: auto;
  background: white; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  margin-top: 0.25rem; padding: 0; list-style: none; z-index: 50;
}

/* Modificado para que la lista use flexbox para acomodar el badge a la derecha */
.dropdown-cuentas li { 
  padding: 0.6rem 1rem; 
  cursor: pointer; 
  border-bottom: 1px solid #f1f5f9; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; /* Empuja el badge a la derecha */
  gap: 0.5rem; 
}
.dropdown-cuentas li:hover { background: #f8fafc; color: #2563eb; }
.dropdown-cuentas li:last-child { border-bottom: none; }

.cuenta-info-principal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cuenta-codigo { font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; font-weight: 700; background: #e2e8f0; padding: 0.1rem 0.4rem; border-radius: 4px; color: #475569; }
.cuenta-nombre { font-size: 0.9rem; font-weight: 600; color: #1e293b; }

/* ESTILOS NUEVOS PARA LOS BADGES DE NATURALEZA */
.badge-tipo {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap; /* Evita que el badge se rompa en dos líneas */
}

.badge-activo { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.badge-pasivo { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.badge-pn { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
.badge-ingreso { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
.badge-egreso { background-color: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
.badge-default { background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

.dropdown-vacio { padding: 1rem; color: #94a3b8; text-align: center; font-style: italic; }

/* ESTILOS DE MONTOS Y CRUCE */
.input-monto { position: relative; display: flex; align-items: center; }
.prefijo { position: absolute; left: 0.75rem; color: #94a3b8; font-weight: 600; }
.input-monto input { width: 100%; padding-left: 1.75rem; font-family: monospace; font-size: 1rem; font-weight: 700; color: #0f172a;}
.disabled-input { background: #f8fafc; color: #cbd5e1 !important; cursor: not-allowed; border-color: #e2e8f0; }

.btn-eliminar { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; width: 28px; height: 28px; border-radius: 6px; font-size: 1.2rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-eliminar:hover { background: #fee2e2; border-color: #f87171; }

.footer-totales { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; transition: background 0.3s; }
.footer-totales.cuadra-perfecto { background: #f0fdf4; border-color: #bbf7d0; }
.estado-partida { font-size: 0.9rem; font-weight: 600; color: #166534; }
.error-balance { color: #b45309; }

.bloque-sumas { display: flex; gap: 2rem; }
.suma-item { display: flex; align-items: center; gap: 0.5rem; }
.suma-item .label { font-size: 0.85rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
.suma-item .monto { font-size: 1.25rem; color: #0f172a; font-weight: 800; font-family: monospace; }
.cuadra-perfecto .suma-item .monto { color: #15803d; }

.botonera-final { display: flex; justify-content: flex-end; }
.btn-confirmar { background: #10b981; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); }
.btn-confirmar:hover:not(:disabled) { background: #059669; }
.btn-confirmar:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }

.fila-animada { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>