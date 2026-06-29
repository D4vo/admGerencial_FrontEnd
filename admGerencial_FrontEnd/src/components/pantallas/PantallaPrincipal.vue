<script setup>
import { shallowRef, ref, provide, onMounted } from 'vue';
import BarraDeNavegacion from '../layout/BarraDeNavegacion.vue';
import PantallaVentas from '../ventas/PantallaVentas.vue';
import PantallaCompras from '../compras/PantallaCompras.vue';
import PantallaProductos from '../Productos/PantallaProductos.vue';
import PantallaPlanCuentas from '../Cuentas/PantallaPlanCuentas.vue';
import PantallaLibroDiario from '../LibroDiario/PantallaLibroDiario.vue';
import PantallaLibroMayor from '../LibroMayor/PantallaLibroMayor.vue';
import PantallaInicioActividades from '../InicioActividades/PantallaInicioActividades.vue';
import PantallaDocumentos from '../Documentos/PantallaDocumentos.vue';
import PantallaClientes from '../Clientes/PantallaClientes.vue';
import PantallaAsientoManual from '../AsientoManual/PantallaAsientoManual.vue';
import PantallaConfigCuentas from '../ConfigSistema/PantallaConfigCuentas.vue';
import PantallaGastos from '../Gastos/PantallaGastos.vue';
import PantallaProveedores from '../Proveedores/PantallaProveedores.vue';
import PantallaCierres from '../Cierres/PantallaCierres.vue';
import PantallaBalance from '../Balance/PantallaBalance.vue';
import PantallaDashboard from '../Dashboard/PantallaDashboard.vue';
import { productosService } from '../../services/productosService';

const mapaPantallas = {
  'Dashboard': PantallaDashboard,
  'Ventas': PantallaVentas,
  'Compras': PantallaCompras,
  'Gastos': PantallaGastos,
  'Proveedores': PantallaProveedores,
  'Productos': PantallaProductos,
  'Cuentas': PantallaPlanCuentas,
  'Libro Diario': PantallaLibroDiario,

  'Libro Mayor': PantallaLibroMayor,
  'Inicio Actividades': PantallaInicioActividades,
  'Documentos': PantallaDocumentos,
  'Clientes': PantallaClientes,
  'Asiento Manual': PantallaAsientoManual,
  'Config Cuentas': PantallaConfigCuentas,
  'Balance': PantallaBalance,
  'Cierres': PantallaCierres
};

const pantallaActual = shallowRef(mapaPantallas['Dashboard']);
const alertasStock = ref([]);
const panelAlertasAbierto = ref(false);

const cambiarPantalla = (nombrePantalla) => {
  if (mapaPantallas[nombrePantalla]) {
    pantallaActual.value = mapaPantallas[nombrePantalla];
  }
};

const cargarAlertas = async () => {
  try {
    alertasStock.value = await productosService.obtenerAlertasStock();
  } catch (e) {
    console.error('Error cargando alertas de stock:', e);
  }
};

const irAProductos = () => {
  panelAlertasAbierto.value = false;
  pantallaActual.value = mapaPantallas['Productos'];
};

provide('recargarAlertasStock', cargarAlertas);

onMounted(cargarAlertas);
</script>

<template>
  <div class="contenedor-principal">
    <BarraDeNavegacion @navegar="cambiarPantalla" />

    <div class="area-principal">
      <!-- Barra superior con notificaciones -->
      <header class="topbar">
        <div class="topbar-spacer"></div>
        <div class="topbar-acciones">
          <button class="btn-notificacion" @click="panelAlertasAbierto = !panelAlertasAbierto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icono-campana">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span v-if="alertasStock.length > 0" class="badge-alerta">{{ alertasStock.length }}</span>
          </button>
        </div>

        <!-- Panel desplegable de alertas -->
        <div v-if="panelAlertasAbierto" class="panel-alertas">
          <div class="panel-alertas-header">
            <h3>Alertas de Stock</h3>
            <button class="btn-cerrar-panel" @click="panelAlertasAbierto = false">&times;</button>
          </div>

          <div v-if="alertasStock.length === 0" class="panel-vacio">
            Todos los productos tienen stock suficiente.
          </div>

          <div v-else class="panel-alertas-body">
            <div
              v-for="alerta in alertasStock"
              :key="alerta.id"
              :class="['alerta-item', alerta.nivel === 'critico' ? 'alerta-critica' : 'alerta-baja']"
            >
              <div class="alerta-indicador">
                <span v-if="alerta.nivel === 'critico'" class="punto-critico"></span>
                <span v-else class="punto-bajo"></span>
              </div>
              <div class="alerta-info">
                <span class="alerta-nombre">{{ alerta.nombre }}</span>
                <span class="alerta-detalle">
                  Stock: <strong>{{ alerta.stock }}</strong> / Mín: {{ alerta.stock_minimo }}
                </span>
              </div>
              <span :class="['alerta-badge', alerta.nivel === 'critico' ? 'badge-critico' : 'badge-bajo']">
                {{ alerta.nivel === 'critico' ? 'Sin stock' : 'Bajo' }}
              </span>
            </div>
          </div>

          <div class="panel-alertas-footer">
            <button class="btn-ver-productos" @click="irAProductos">Ver Productos</button>
          </div>
        </div>

        <div v-if="panelAlertasAbierto" class="overlay-alertas" @click="panelAlertasAbierto = false"></div>
      </header>

      <main class="area-contenido">
        <component :is="pantallaActual" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.contenedor-principal {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f4f7f6;
  overflow: hidden;
}

.area-principal {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.6rem 2.5rem;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
  z-index: 100;
  flex-shrink: 0;
}

.topbar-spacer { flex-grow: 1; }

.topbar-acciones {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-notificacion {
  position: relative;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #64748b;
}

.btn-notificacion:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.icono-campana {
  width: 22px;
  height: 22px;
}

.badge-alerta {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

/* Panel de alertas */
.overlay-alertas {
  position: fixed;
  inset: 0;
  z-index: 149;
}

.panel-alertas {
  position: absolute;
  top: 100%;
  right: 2rem;
  width: 380px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 150;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

.panel-alertas-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-alertas-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.btn-cerrar-panel {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #94a3b8;
  cursor: pointer;
}

.panel-vacio {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.panel-alertas-body {
  max-height: 320px;
  overflow-y: auto;
}

.alerta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}

.alerta-item:hover { background: #f8fafc; }
.alerta-item:last-child { border-bottom: none; }

.alerta-critica { background: #fef2f2; }
.alerta-critica:hover { background: #fee2e2; }

.alerta-indicador { flex-shrink: 0; }

.punto-critico {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

.punto-bajo {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f59e0b;
}

.alerta-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.alerta-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
}

.alerta-detalle {
  font-size: 0.78rem;
  color: #64748b;
}

.alerta-badge {
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.badge-critico { background: #fecaca; color: #991b1b; }
.badge-bajo { background: #fef3c7; color: #92400e; }

.panel-alertas-footer {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

.btn-ver-productos {
  width: 100%;
  padding: 0.55rem;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-ver-productos:hover { background: #1e293b; }

.area-contenido {
  flex-grow: 1;
  padding: 40px;
  overflow-y: auto;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
