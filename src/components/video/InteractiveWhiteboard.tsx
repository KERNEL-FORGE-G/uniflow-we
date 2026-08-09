import { useRef, useState, useEffect } from 'react'
import { 
  Pencil, Eraser, Square, Circle, Type, Trash2, Download, 
  RotateCcw, Sparkles, Palette, MousePointer
} from 'lucide-react'

interface InteractiveWhiteboardProps {
  onClose?: () => void
}

export default function InteractiveWhiteboard({ onClose }: InteractiveWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rect' | 'circle'>('pen')
  const [color, setColor] = useState('#0d9488')
  const [lineWidth, setLineWidth] = useState(3)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (parent) {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0f172a' // Dark slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      const step = 30
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Initial sample math diagram
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 2
      ctx.font = 'bold 16px sans-serif'
      ctx.fillStyle = '#f8fafc'
      ctx.fillText('Tableau Blanc — Algorithmique (Arbres & Graphes)', 30, 40)
      
      // Save initial state
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)])
    }
  }, [])

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPos({ x, y })

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas || !startPos) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'rect') {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y)
    } else if (tool === 'circle') {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // Push state to history
    setHistory(prev => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)])
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)])
  }

  const undo = () => {
    if (history.length <= 1) return
    const newHistory = [...history]
    newHistory.pop()
    const prevImageData = newHistory[newHistory.length - 1]
    const canvas = canvasRef.current
    if (!canvas || !prevImageData) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.putImageData(prevImageData, 0, 0)
      setHistory(newHistory)
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `UniFlow-TableauBlanc-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="relative h-full w-full flex flex-col bg-slate-950 rounded-3xl overflow-hidden border border-[#1e3a8a]/40 shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#0d9488]" />
          <span className="text-xs font-bold text-white">Tableau Blanc Interactif</span>
          <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-500/30">
            Collaboratif
          </span>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              tool === 'pen' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Crayon"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              tool === 'rect' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              tool === 'circle' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Cercle"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              tool === 'eraser' ? 'bg-[#0d9488] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
            title="Gomme"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {['#0d9488', '#38bdf8', '#fbbf24', '#f43f5e', '#10b981', '#f8fafc'].map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen') }}
              style={{ backgroundColor: c }}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${
                color === c && tool !== 'eraser' ? 'scale-125 border-white ring-2 ring-teal-400' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={history.length <= 1}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Annuler"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
            title="Effacer tout"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={downloadCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d9488] text-white text-xs font-bold hover:bg-teal-600 transition-all shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Exporter PNG
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 w-full bg-slate-950 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  )
}
