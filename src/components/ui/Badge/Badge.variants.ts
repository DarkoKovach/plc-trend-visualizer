import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-700 text-slate-300',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        bool: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
        int: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        real: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
