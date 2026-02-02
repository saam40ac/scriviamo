'use client'

export default function EditorToolbar() {
  const toolbarGroups = [
    {
      items: [
        { icon: 'bold', title: 'Grassetto', command: 'bold' },
        { icon: 'italic', title: 'Corsivo', command: 'italic' },
        { icon: 'underline', title: 'Sottolineato', command: 'underline' },
      ],
    },
    {
      items: [
        { icon: 'h1', title: 'Titolo 1', command: 'h1', label: 'H1' },
        { icon: 'h2', title: 'Titolo 2', command: 'h2', label: 'H2' },
        { icon: 'h3', title: 'Titolo 3', command: 'h3', label: 'H3' },
      ],
    },
    {
      items: [
        { icon: 'list-ul', title: 'Elenco puntato', command: 'bulletList' },
        { icon: 'list-ol', title: 'Elenco numerato', command: 'orderedList' },
        { icon: 'quote', title: 'Citazione', command: 'blockquote' },
      ],
    },
    {
      items: [
        { icon: 'link', title: 'Link', command: 'link' },
      ],
    },
  ]

  const renderIcon = (icon: string, label?: string) => {
    if (label) {
      return <span className="text-xs font-bold">{label}</span>
    }

    const icons: Record<string, JSX.Element> = {
      bold: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />,
      italic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v16m-4 0h8" transform="skewX(-10)" />,
      underline: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v6a6 6 0 0012 0V4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16" /></>,
      'list-ul': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
      'list-ol': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
      quote: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
      link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    }

    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[icon]}
      </svg>
    )
  }

  const handleCommand = (command: string) => {
    // In a real implementation, this would interact with the editor
    console.log('Command:', command)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1">
      {toolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-1 pr-3 mr-1 border-r border-gray-200 last:border-r-0 last:pr-0 last:mr-0">
          {group.items.map((item) => (
            <button
              key={item.command}
              onClick={() => handleCommand(item.command)}
              title={item.title}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {renderIcon(item.icon, item.label)}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
