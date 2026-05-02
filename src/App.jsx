import { useState, useRef } from 'react'

export default function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [notes, setNotes] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } catch {
      alert('Microphone access is required to record the lecture.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const handleNotesChange = (e) => {
    const value = e.target.value
    setNotes(value)
    setWordCount(value.trim() === '' ? 0 : value.trim().split(/\s+/).length)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="font-semibold text-lg tracking-tight">NoteReal</span>
          <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">Anti-AI</span>
        </div>
        <p className="text-gray-500 text-sm hidden sm:block">Your notes. Your brain. Your learning.</p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — recorder */}
        <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-800 p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Lecture Recording</h2>

            {/* Record button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/40'
              }`}
            >
              {isRecording ? (
                <>
                  <span className="w-3 h-3 bg-white rounded-sm" />
                  Stop Recording
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-white rounded-full" />
                  Start Recording
                </>
              )}
            </button>

            {/* Timer */}
            {isRecording && (
              <div className="mt-4 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono text-red-400 text-sm">{formatTime(recordingTime)}</span>
                <span className="text-gray-500 text-sm">recording</span>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Tips</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2"><span className="text-indigo-400">→</span>Use your own words</li>
              <li className="flex gap-2"><span className="text-indigo-400">→</span>Write key ideas, not everything</li>
              <li className="flex gap-2"><span className="text-indigo-400">→</span>Leave gaps to fill in later</li>
              <li className="flex gap-2"><span className="text-indigo-400">→</span>Draw diagrams if it helps</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="mt-auto grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
              <p className="text-2xl font-bold text-white">{wordCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">words written</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 border border-gray-800 text-center">
              <p className="text-2xl font-bold text-white font-mono">{formatTime(recordingTime)}</p>
              <p className="text-xs text-gray-500 mt-0.5">recorded</p>
            </div>
          </div>
        </div>

        {/* Right panel — notes */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Notes</h2>
            {notes.length > 0 && (
              <button
                onClick={() => { setNotes(''); setWordCount(0) }}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder={`Start writing your notes here...\n\nListen to the lecture and capture the ideas that matter to you — in your own words.`}
            className="flex-1 w-full bg-gray-900 border border-gray-800 rounded-2xl p-5 text-gray-100 placeholder-gray-600 text-base leading-relaxed resize-none focus:outline-none focus:border-indigo-600 transition-colors min-h-96"
            spellCheck={true}
          />

          <p className="text-xs text-gray-600 mt-3 text-right">
            {wordCount} {wordCount === 1 ? 'word' : 'words'} · {notes.length} characters
          </p>
        </div>
      </main>
    </div>
  )
}
