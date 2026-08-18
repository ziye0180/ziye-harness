window.__ModuleLoader__.load({
  id: '@fixture/dsh-brand-slots',
  factory: (require) => {
    const React = require('react')

    function SidebarBrand({ variant }) {
      return React.createElement(
        'span',
        { 'data-fixture-brand': `sidebar-${variant}` },
        variant === 'wordmark' ? 'Fixture Wordmark' : 'F',
      )
    }

    function HeroBrand() {
      return React.createElement('span', { 'data-fixture-brand': 'hero' }, 'Fixture Hero')
    }

    function apply(ctx) {
      ctx.slots.inject('sidebar.brand', () => ctx.slots.register(
        { name: 'sidebar.brand', priority: -100 },
        SidebarBrand,
      ))
      ctx.slots.inject('conversation.hero.brand', () => ctx.slots.register(
        { name: 'conversation.hero.brand', priority: -100 },
        HeroBrand,
      ))
    }

    return { apply, inject: ['slots'] }
  },
})
