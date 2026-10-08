import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button/Button.vue'

describe('Button', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders with primary variant by default', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Primary',
      },
    })

    expect(wrapper.html()).toContain('bg-cyan')
  })

  it('renders with secondary variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary',
      },
      slots: {
        default: 'Secondary',
      },
    })

    expect(wrapper.html()).toContain('bg-slate')
  })

  it('renders with ghost variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'ghost',
      },
      slots: {
        default: 'Ghost',
      },
    })

    expect(wrapper.html()).toContain('hover:bg-slate')
  })

  it('renders with danger variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Danger',
      },
    })

    expect(wrapper.html()).toContain('bg-red')
  })

  it('applies different sizes', () => {
    const smallWrapper = mount(Button, {
      props: { size: 'sm' },
      slots: { default: 'Small' },
    })

    const mediumWrapper = mount(Button, {
      props: { size: 'md' },
      slots: { default: 'Medium' },
    })

    const largeWrapper = mount(Button, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })

    expect(smallWrapper.html()).toContain('h-8')
    expect(mediumWrapper.html()).toContain('h-10')
    expect(largeWrapper.html()).toContain('h-12')
  })

  it('can be disabled', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Disabled',
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.html()).toContain('disabled:opacity')
  })

  it('shows loading state', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Loading',
      },
    })

    expect(wrapper.html()).toContain('animate-spin')
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Disabled',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('accepts custom className', () => {
    const wrapper = mount(Button, {
      props: {
        class: 'custom-button',
      },
      slots: {
        default: 'Custom',
      },
    })

    expect(wrapper.classes()).toContain('custom-button')
  })
})
