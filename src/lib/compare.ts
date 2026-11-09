const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

export const compareText = collator.compare
