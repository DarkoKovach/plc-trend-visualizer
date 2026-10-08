import { cva, type VariantProps } from 'class-variance-authority'

export const cardVariants = cva('rounded-lg border transition-colors', {
  variants: {
    variant: {
      default: 'bg-bg-secondary border-border',
      elevated: 'bg-bg-secondary border-border shadow-lg',
      interactive:
        'bg-bg-secondary border-border hover:border-border-light hover:bg-slate-750 cursor-pointer',
      selected: 'bg-bg-secondary border-cyan-500 ring-1 ring-cyan-500/20',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
})

export type CardVariants = VariantProps<typeof cardVariants>
