export function Message({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 pt-16 text-center">
      <p className="text-muted-foreground">{text}</p>
      {children}
    </div>
  )
}
