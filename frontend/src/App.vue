Nome do Dispositivo<script setup>
import { ref, onMounted } from 'vue';
import io from 'socket.io-client';
import DeviceForm from './components/DeviceForm.vue';
import DeviceTable from './components/DeviceTable.vue';

const devices = ref([]);
const socket = io('http://localhost:3000');

const fetchDevices = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/devices');
    devices.value = await response.json();
  } catch (error) {
    console.error('Error fetching devices:', error);
  }
};

onMounted(() => {
  fetchDevices();

  socket.on('device:created', (device) => {
    console.log('Device created via socket:', device);
    // Check if device is already added to avoid duplicates
    const exists = devices.value.some(d => d.id === device.id);
    if (!exists) {
      devices.value.push(device);
    }
  });

  socket.on('device:status', (updatedDevice) => {
    console.log('Device status updated via socket:', updatedDevice);
    const index = devices.value.findIndex(d => d.id === updatedDevice.id);
    if (index !== -1) {
      devices.value[index] = { ...devices.value[index], ...updatedDevice };
    }
  });
});

const handleDeviceCreated = (device) => {
  console.log('Device created via form:', device);
  // Add device immediately to ensure UI updates even if socket fails
  devices.value.push(device);
};

const handleStatusChanged = (updatedDevice) => {
  console.log('Status changed via table:', updatedDevice);
  // Update immediately for responsiveness
  const index = devices.value.findIndex(d => d.id === updatedDevice.id);
  if (index !== -1) {
    devices.value[index] = { ...devices.value[index], ...updatedDevice };
  }
};
</script>

<template>
  <div id="app">
    <header class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9M7 11H17V13H7V11M7 15H17V17H7V15M7 19H13V21H7V19Z"/>
          </svg>
        </div>
        <h1>Sistema de Cadastro de Dispositivos</h1>
        <p>Gerencie seus dispositivos de rede de forma segura e eficiente</p>
      </div>
      <div class="hero-shape">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,0 100,0 100,30 0,100" fill="rgba(255,255,255,0.1)"/>
        </svg>
      </div>
    </header>
    <main class="main-content">
      <section class="form-section">
        <DeviceForm @device-created="handleDeviceCreated" />
      </section>
      <section class="table-section">
        <h2>Dispositivos Cadastrados</h2>
        <DeviceTable :devices="devices" @status-changed="handleStatusChanged" />
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #8b5cf6 100%);
  color: #333;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.hero {
  position: relative;
  background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #8b5cf6 100%);
  color: white;
  padding: 2rem 2rem 3rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  width: 100%;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1.5rem;
  display: inline-block;
}

.hero-icon svg {
  width: 4rem;
  height: 4rem;
  opacity: 0.9;
}

.hero-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-content p {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.95;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}



.hero-shape {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 1;
}

.hero-shape svg {
  width: 100%;
  height: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem 2rem 2rem;
  gap: 3rem;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: calc(100vh - 400px);
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to bottom, rgba(139, 92, 246, 0.1), transparent);
  pointer-events: none;
}

.form-section, .table-section {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
  position: relative;
  z-index: 3;
}

.table-section h2 {
  color: #1e293b;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

.table-section h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: #7c3aed;
  border-radius: 2px;
  animation: sectionUnderline 1s ease-out;
}

@keyframes sectionUnderline {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  .hero {
    padding: 4rem 1rem 5rem;
  }
  .main-content {
    padding: 2rem 1rem 1rem;
    gap: 2rem;
  }
  .hero-content p {
    font-size: 1.1rem;
  }
  .table-section h2 {
    font-size: 1.8rem;
  }
  .hero-content p {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.8rem;
  }
}
</style>
