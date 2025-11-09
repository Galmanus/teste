 que o he<template>
  <div class="table-container">
    <div class="table-card">
      <div v-if="devices.length === 0" class="empty-state">
        <div class="empty-icon">📱</div>
        <h3>Nenhum dispositivo cadastrado ainda</h3>
        <p>Use o formulário acima para cadastrar seu primeiro dispositivo</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="device-table">
          <thead>
            <tr>
              <th>ID</th>
              <th><strong>Nome</strong></th>
              <th><strong>Endereço MAC</strong></th>
              <th>Status</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in devices" :key="device.id" class="device-row">
              <td class="id-cell">{{ device.id }}</td>
              <td class="name-cell">{{ device.name }}</td>
              <td class="mac-cell">{{ device.mac }}</td>
              <td class="status-cell">
                <span :class="['status-badge', device.status.toLowerCase()]">
                  {{ device.status }}
                </span>
              </td>
              <td class="description-cell">{{ device.description }}</td>
              <td class="actions-cell">
                <button
                  @click="toggleStatus(device.id)"
                  :disabled="loading[device.id]"
                  class="toggle-btn"
                >
                  <span v-if="!loading[device.id]">Alternar Status</span>
                  <div v-else class="btn-spinner"></div>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'DeviceTable',
  props: {
    devices: Array,
  },
  emits: ['statusChanged'],
  setup(props, { emit }) {
    const loading = ref({});

    const toggleStatus = async (id) => {
      loading.value[id] = true;
      try {
        const response = await fetch(`http://localhost:3000/api/devices/${id}/status`, {
          method: 'PATCH',
        });
        if (response.ok) {
          const updatedDevice = await response.json();
          emit('statusChanged', updatedDevice);
        } else {
          alert('Erro ao alternar status');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        loading.value[id] = false;
      }
    };

    return {
      loading,
      toggleStatus,
    };
  },
};
</script>

<style scoped>
.table-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
}

.table-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.table-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.03), transparent);
  transition: left 0.8s;
}

.table-card:hover::before {
  left: 100%;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.device-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.device-table th {
  background: #7c3aed;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.device-row {
  transition: all 0.2s ease;
}

.device-row:hover {
  background: rgba(139, 92, 246, 0.05);
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-row td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.id-cell {
  font-weight: 600;
  color: #333;
  width: 60px;
}

.name-cell {
  font-weight: 500;
  color: #333;
  min-width: 150px;
}

.mac-cell {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #666;
  min-width: 140px;
}

.status-cell {
  width: 100px;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.ativo {
  background: #d4edda;
  color: #155724;
}

.status-badge.inativo {
  background: #f8d7da;
  color: #721c24;
}

.description-cell {
  max-width: 300px;
  word-wrap: break-word;
  color: #666;
  min-width: 200px;
}

.actions-cell {
  width: 140px;
  text-align: center;
}

.toggle-btn {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 120px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.toggle-btn:hover:not(:disabled)::before {
  left: 100%;
}

.toggle-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.toggle-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .table-card {
    padding: 1rem;
  }

  .device-table th,
  .device-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .description-cell {
    max-width: 150px;
  }

  .toggle-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    min-width: 100px;
  }

  .empty-state {
    padding: 2rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
  }
}
</style>
