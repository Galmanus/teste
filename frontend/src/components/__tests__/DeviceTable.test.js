import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceTable from '../DeviceTable.vue'

describe('DeviceTable', () => {
  const mockDevices = [
    { id: 1, name: 'Device 1', mac: '00:11:22:33:44:55', status: 'ATIVO', description: 'Test device 1' },
    { id: 2, name: 'Device 2', mac: 'AA:BB:CC:DD:EE:FF', status: 'INATIVO', description: 'Test device 2' }
  ]

  it('renders table with devices', () => {
    const wrapper = mount(DeviceTable, {
      props: { devices: mockDevices }
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('displays device information correctly', () => {
    const wrapper = mount(DeviceTable, {
      props: { devices: mockDevices }
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    expect(firstRow.text()).toContain('Device 1')
    expect(firstRow.text()).toContain('00:11:22:33:44:55')
    expect(firstRow.text()).toContain('ATIVO')
  })

  it('shows empty state when no devices', () => {
    const wrapper = mount(DeviceTable, {
      props: { devices: [] }
    })

    expect(wrapper.text()).toContain('Nenhum dispositivo cadastrado')
  })

  it('emits status-changed event when toggle button is clicked', async () => {
    const wrapper = mount(DeviceTable, {
      props: { devices: mockDevices }
    })

    // Mock fetch globally
    global.fetch = vi.fn()

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDevices[0])
    })

    const toggleButton = wrapper.findAll('button').find(btn => btn.text().includes('Alternar Status'))
    await toggleButton.trigger('click')

    expect(wrapper.emitted('statusChanged')).toBeTruthy()
    expect(wrapper.emitted('statusChanged')[0][0]).toEqual(mockDevices[0])
  })

  it('displays correct button text based on status', () => {
    const wrapper = mount(DeviceTable, {
      props: { devices: mockDevices }
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.some(btn => btn.text().includes('Alternar Status'))).toBe(true)
  })
})
