<template>
  <div class="modulo-inicio">
    <header class="cabecera-modulo">
      <div>
        <h1>Inicio de Actividades</h1>
        <p class="subtitulo">Configuración del saldo inicial para la apertura del sistema contable</p>
      </div>
    </header>

    <div class="layout-contenido">
      <PanelInicioActividades 
        ref="panelRef"
        :cargando="cargando"
        @confirmar="procesarInicioActividades"
      />
      
      <div class="info-lateral">
        <h3>¿Qué hace esta acción?</h3>
        <p>
          Al registrar el inicio de actividades, el sistema generará automáticamente el <strong>Asiento Contable N° 1</strong>.
        </p>
        <p>
          Se imputarán los montos ingresados al <strong>Debe</strong> de las cuentas de Activo (Caja y Banco), 
          y la contrapartida irá al <strong>Haber</strong> de la cuenta de Patrimonio Neto (Capital Social), asegurando el equilibrio de la partida doble.
        </p>
      </div>
    </div>

    <ModalExito 
      :show="mostrarModalExito" 
      titulo="¡Apertura Registrada!"
      mensaje="Los saldos iniciales han sido registrados y el Asiento N° 1 fue generado en el Libro Diario."
      @close="cerrarModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PanelInicioActividades from './PanelInicioActividades.vue';
import ModalExito from '../ModalesGenericos/ModalExito.vue';
import { contabilidadService } from '../../services/contabilidadService'; // Importamos el servicio real

const cargando = ref(false);
const mostrarModalExito = ref(false);
const panelRef = ref(null);

const procesarInicioActividades = async (saldos) => {
  cargando.value = true;

  // Armamos el payload con la fecha limpia (YYYY-MM-DD) y los montos correspondientes
  const payloadInicio = {
    fecha: new Date().toISOString().split('T')[0],
    monto_caja: saldos.monto_caja,
    monto_banco: saldos.monto_banco
  };

  console.log("🚀 ENVIANDO APERTURA CONTABLE AL BACKEND:", JSON.stringify(payloadInicio, null, 2));

  try {
    // Llamado HTTP POST real hacia la base de datos
    await contabilidadService.registrarInicioActividades(payloadInicio);

    // Si impacta bien, levantamos el modal de éxito y limpiamos los campos del panel
    mostrarModalExito.value = true;
    if (panelRef.value) {
      panelRef.value.resetearFormulario();
    }

  } catch (error) {
    console.error("Error al registrar el inicio de actividades:", error);
    alert("Hubo un problema al registrar la apertura en el servidor. Verifique los datos.");
  } finally {
    cargando.value = false;
  }
};

const cerrarModal = () => {
  mostrarModalExito.value = false;
};
</script>

<style scoped>
.modulo-inicio {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.cabecera-modulo {
  margin-bottom: 30px;
}

.cabecera-modulo h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #111827;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.subtitulo {
  margin: 5px 0 0 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.layout-contenido {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.info-lateral {
  flex: 1;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.info-lateral h3 {
  margin-top: 0;
  color: #334155;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.info-lateral p {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.info-lateral p:last-child {
  margin-bottom: 0;
}

/* Responsive: apilar si la pantalla es pequeña */
@media (max-width: 768px) {
  .layout-contenido {
    flex-direction: column;
  }
}
</style>