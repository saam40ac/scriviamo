import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { podcastId, fileUrl } = await request.json()

    if (!podcastId || !fileUrl) {
      return NextResponse.json({ error: 'Missing podcastId or fileUrl' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update status to "in_trascrizione"
    await supabase.from('podcast_imports').update({ stato: 'in_trascrizione' }).eq('id', podcastId)

    // Get the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage.from('podcast-files').download(fileUrl)

    if (downloadError || !fileData) {
      await supabase.from('podcast_imports').update({ stato: 'errore' }).eq('id', podcastId)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Prepare file for OpenAI
    const formData = new FormData()
    formData.append('file', fileData, 'audio.mp3')
    formData.append('model', 'whisper-1')
    formData.append('language', 'it')
    formData.append('response_format', 'text')

    // Call OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}` },
      body: formData,
    })

    if (!whisperResponse.ok) {
      console.error('Whisper error:', await whisperResponse.text())
      await supabase.from('podcast_imports').update({ stato: 'errore' }).eq('id', podcastId)
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
    }

    const transcription = await whisperResponse.text()

    // Update podcast with transcription
    await supabase.from('podcast_imports').update({ trascrizione_grezza: transcription, stato: 'trascritto' }).eq('id', podcastId)

    return NextResponse.json({ success: true, transcription, message: 'Trascrizione completata!' })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
