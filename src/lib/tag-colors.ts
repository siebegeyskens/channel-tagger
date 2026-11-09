export const TAG_COLORS = {
  rose: {
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  orange: {
    chip: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  amber: {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  lime: {
    chip: 'bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300',
    dot: 'bg-lime-500 dark:bg-lime-400',
  },
  green: {
    chip: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
    dot: 'bg-green-500 dark:bg-green-400',
  },
  teal: {
    chip: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
  sky: {
    chip: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  blue: {
    chip: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  indigo: {
    chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    dot: 'bg-indigo-500 dark:bg-indigo-400',
  },
  violet: {
    chip: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  pink: {
    chip: 'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300',
    dot: 'bg-pink-500 dark:bg-pink-400',
  },
  slate: {
    chip: 'bg-slate-200 text-slate-800 dark:bg-slate-400/15 dark:text-slate-300',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
} as const

export type TagColor = keyof typeof TAG_COLORS

export const TAG_COLOR_NAMES = Object.keys(TAG_COLORS) as TagColor[]

export function isTagColor(color: string): color is TagColor {
  return Object.hasOwn(TAG_COLORS, color)
}

export function tagColorClasses(color: string) {
  return TAG_COLORS[isTagColor(color) ? color : 'slate']
}

export function pickTagColor(usedColors: string[]): TagColor {
  const unused = TAG_COLOR_NAMES.filter((color) => !usedColors.includes(color))
  const options = unused.length ? unused : TAG_COLOR_NAMES
  return options[Math.floor(Math.random() * options.length)]
}
