import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '@/components/ui/Badge/Badge.vue'

describe('Badge', () => {
  it('renders with default variant', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Test Badge',
      },
    })

    expect(wrapper.text()).toBe('Test Badge')
    expect(wrapper.classes()).toContain('inline-flex')
  })

  it('renders with success variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'success',
      },
      slots: {
        default: 'Success',
      },
    })

    expect(wrapper.text()).toBe('Success')
    expect(wrapper.html()).toContain('bg-emerald')
  })

  it('renders with warning variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'warning',
      },
      slots: {
        default: 'Warning',
      },
    })

    expect(wrapper.text()).toBe('Warning')
    expect(wrapper.html()).toContain('bg-amber')
  })

  it('renders with error variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'error',
      },
      slots: {
        default: 'Error',
      },
    })

    expect(wrapper.text()).toBe('Error')
    expect(wrapper.html()).toContain('bg-red')
  })

  it('renders with bool data type variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'bool',
      },
      slots: {
        default: 'BOOL',
      },
    })

    expect(wrapper.text()).toBe('BOOL')
    expect(wrapper.html()).toContain('bg-violet')
  })

  it('renders with int data type variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'int',
      },
      slots: {
        default: 'INT',
      },
    })

    expect(wrapper.text()).toBe('INT')
    expect(wrapper.html()).toContain('bg-blue')
  })

  it('renders with real data type variant', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'real',
      },
      slots: {
        default: 'REAL',
      },
    })

    expect(wrapper.text()).toBe('REAL')
    expect(wrapper.html()).toContain('bg-emerald')
  })

  it('applies small size', () => {
    const wrapper = mount(Badge, {
      props: {
        size: 'sm',
      },
      slots: {
        default: 'Small',
      },
    })

    expect(wrapper.html()).toContain('text-xs')
  })

  it('applies default size', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Default',
      },
    })

    // Default size is 'sm' which is text-xs
    expect(wrapper.html()).toContain('text-xs')
  })

  it('accepts custom className', () => {
    const wrapper = mount(Badge, {
      props: {
        class: 'custom-class',
      },
      slots: {
        default: 'Custom',
      },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })
})
