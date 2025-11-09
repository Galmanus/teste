import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceForm from '../DeviceForm.vue'

// Mock fetch globally
global.fetch = vi.fn()

describe('DeviceForm', () => {
  it('renders form correctly', () => {
    const wrapper = mount(DeviceForm)
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#mac').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('validates MAC address format', async () => {
    const wrapper = mount(DeviceForm)
    const macInput = wrapper.find('#mac')

    // Invalid MAC
    await macInput.setValue('invalid-mac')
    await wrapper.find('form').trigger('submit.prevent')

    // Should not call fetch for invalid MAC
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const wrapper = mount(DeviceForm)
    const nameInput = wrapper.find('#name')
    const macInput = wrapper.find('#mac')

    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test Device', mac: '00:11:22:33:44:55' })
    })

    await nameInput.setValue('Test Device')
    await macInput.setValue('00:11:22:33:44:55')
    await wrapper.find('form').trigger('submit.prevent')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Device', mac: '00:11:22:33:44:55' })
    })
  })

  it('emits deviceCreated event on successful submission', async () => {
    const wrapper = mount(DeviceForm)
    const device = { id: 1, name: 'Test Device', mac: '00:11:22:33:44:55' }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(device)
    })

    await wrapper.find('#name').setValue('Test Device')
    await wrapper.find('#mac').setValue('00:11:22:33:44:55')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('deviceCreated')).toBeTruthy()
    expect(wrapper.emitted('deviceCreated')[0]).toEqual([device])
  })

  it('handles submission error', async () => {
    const wrapper = mount(DeviceForm)

    global.fetch.mockResolvedValueOnce({
      ok: false
    })

    await wrapper.find('#name').setValue('Test Device')
    await wrapper.find('#mac').setValue('00:11:22:33:44:55')
    await wrapper.find('form').trigger('submit.prevent')

    // Should not emit deviceCreated on error
    expect(wrapper.emitted('deviceCreated')).toBeFalsy()
  })
})
