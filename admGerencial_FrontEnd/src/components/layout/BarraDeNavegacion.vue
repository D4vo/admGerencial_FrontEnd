<script setup>
import { ref } from 'vue';

const emit = defineEmits(['navegar']);

// Mapeamos los IDs EXACTOS de tu PantallaPrincipal con las etiquetas e íconos bonitos
const menuItems = [
  { id: 'Ventas', label: 'Ventas', icon: '🛒' },
  { id: 'Compras', label: 'Compras', icon: '🛍️' },
  { id: 'Productos', label: 'Productos', icon: '📦' },
  { id: 'Cuentas', label: 'Plan de Cuentas', icon: '📑' },
  { id: 'Libro Diario', label: 'Libro Diario', icon: '📓' },
  { id: 'Deudas Proveedores', label: 'Deudas a Prov.', icon: '💸' },
  { id: 'Libro Mayor', label: 'Libro Mayor', icon: '📘' },
  { id: 'Inicio Actividades', label: 'Inicio Actividades', icon: '🚀' },
   { id: 'Documentos', label: 'Documentos', icon: '📓' }
];

const botonActivo = ref('Ventas');

const emitirNavegacion = (botonId) => {
  botonActivo.value = botonId;
  emit('navegar', botonId);
};
</script>

<template>
  <aside class="sidebar">
    <div class="logo-container">
      <div class="logo-icon">K</div>
      <h1 class="logo-text">KusKus</h1>
    </div>

    <nav class="nav-menu">
      <div class="menu-seccion">
        <span class="seccion-titulo">Módulos Principales</span>
        
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="nav-item effecto-hover"
          :class="{ activo: botonActivo === item.id }"
          @click="emitirNavegacion(item.id)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="text">{{ item.label }}</span>
        </button>
      </div>
    </nav>
    
    <div class="sidebar-footer">
      <div class="usuario-info">
        <div class="avatar">👤</div>
        <div class="detalles">
          <span class="rol">Administrador</span>
          <span class="estado">En línea</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Contenedor Principal */
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #0f172a; /* Slate 900 (Azul/Gris muy oscuro) */
  color: #94a3b8; /* Slate 400 */
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e293b;
  font-family: 'Inter', system-ui, sans-serif;
  user-select: none;
}

/* Sección del Logo */
.logo-container {
  padding: 1.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.95);
}

.logo-icon {
  background: linear-gradient(135deg, #10b981, #3b82f6);
  color: #ffffff;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Área de Navegación */
.nav-menu {
  padding: 1.5rem 1.25rem;
  flex: 1;
  overflow-y: auto;
}

/* Scrollbar invisible pero funcional */
.nav-menu::-webkit-scrollbar { width: 4px; }
.nav-menu::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

.menu-seccion {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.seccion-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
  padding-left: 0.5rem;
}

/* Botones del Menú */
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
}

.nav-item .icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  filter: grayscale(100%) opacity(0.7); /* Íconos apagados por defecto */
}

/* --- ANIMACIONES Y ESTADOS (MICRO-INTERACCIONES) --- */

.nav-item:hover {
  background: #1e293b;
  color: #f8fafc;
  transform: translateX(6px); /* Pequeño deslizamiento a la derecha */
}

.nav-item:hover .icon {
  filter: grayscale(0%) opacity(1);
  transform: scale(1.15); /* El ícono crece un poquito */
}

/* Estado Activo (La pantalla que estás viendo) */
.nav-item.activo {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981; /* Verde esmeralda */
  position: relative;
}

.nav-item.activo .icon {
  filter: grayscale(0%) opacity(1);
}

/* Barrita indicadora verde a la izquierda del botón activo */
.nav-item.activo::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 15%;
  height: 70%;
  width: 4px;
  background-color: #10b981;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

/* Footer de la Barra (Usuario) */
.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.95);
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  background: #1e293b;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 1px solid #334155;
}

.detalles {
  display: flex;
  flex-direction: column;
}

.rol {
  color: #f8fafc;
  font-size: 0.9rem;
  font-weight: 600;
}

.estado {
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>