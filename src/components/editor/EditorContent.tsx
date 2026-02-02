'use client'

interface EditorContentProps {
  content: string
  onChange: (content: string) => void
}

export default function EditorContent({ content, onChange }: EditorContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[400px] font-serif text-gray-700 leading-relaxed border-none outline-none resize-none"
        placeholder="Inizia a scrivere il contenuto del tuo paragrafo...

Lascia fluire le tue idee. Puoi sempre modificare e rifinire il testo in seguito.

Suggerimento: Usa un tono informale, amabile, empatico ed emozionale, scrivendo sempre in prima persona."
        style={{ lineHeight: '1.8' }}
      />
    </div>
  )
}
