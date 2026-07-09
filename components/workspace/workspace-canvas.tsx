'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Boxes,
  Building2,
  Globe,
  Laptop,
  Lightbulb,
  Link2,
  Mail,
  Maximize2,
  Minimize2,
  Minus,
  Network,
  Plus,
  StickyNote,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react'
import {
  ConfidenceBar,
  EntityGlyph,
  getEntityMeta,
  RiskScore,
} from '@/components/primitives'
import { SidebarPanelHeader, CollapsedPanelRail } from '@/components/sidebar-panel-header'
import { useCase } from '@/lib/case-context'
import { useResizablePanel } from '@/lib/use-resizable-panel'
import { useDebouncedPatch } from '@/lib/use-debounced-patch'
import type { CanvasConnection, CanvasNode, NodeKind } from '@/lib/workspace-data'
import type { EntityType } from '@/lib/types'
import { cn } from '@/lib/utils'

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

const entityTools: { type: EntityType; icon: typeof User }[] = [
  { type: 'person', icon: User },
  { type: 'organization', icon: Building2 },
  { type: 'domain', icon: Globe },
  { type: 'ip', icon: Network },
  { type: 'device', icon: Laptop },
  { type: 'wallet', icon: Wallet },
  { type: 'email', icon: Mail },
]

const noteToneClass: Record<string, string> = {
  blue: 'bg-info/10 border-info/40',
  amber: 'bg-warning/10 border-warning/40',
  green: 'bg-success/10 border-success/40',
  red: 'bg-danger/10 border-danger/40',
}

const COLLAPSED_TOOLS_W = 40
const DEFAULT_TOOLS_W = 208

const DRAG_MIME = 'application/x-sentinel-tool'

interface ToolDescriptor {
  kind: NodeKind
  entityType?: EntityType
}

function nodeFromRow(r: Record<string, unknown>): CanvasNode {
  return {
    id: r.id as string,
    kind: r.kind as NodeKind,
    x: Number(r.x),
    y: Number(r.y),
    w: Number(r.w),
    h: Number(r.h),
    title: (r.title as string) ?? '',
    body: (r.body as string) ?? undefined,
    entityType: (r.entity_type as EntityType) ?? undefined,
    evidenceType: (r.evidence_type as string) ?? undefined,
    confidence: r.confidence == null ? undefined : Number(r.confidence),
    riskScore: r.risk_score == null ? undefined : Number(r.risk_score),
    noteTone: (r.note_tone as CanvasNode['noteTone']) ?? undefined,
  }
}

function connectionFromRow(r: Record<string, unknown>): CanvasConnection {
  return {
    id: r.id as string,
    from: r.from_node_id as string,
    to: r.to_node_id as string,
    label: (r.label as string) ?? '',
  }
}

export function WorkspaceCanvas() {
  const { activeCaseId } = useCase()
  const containerRef = useRef<HTMLDivElement>(null)
  const interaction = useRef<{
    type: 'pan' | 'node'
    nodeId?: string
    startX: number
    startY: number
    originX: number
    originY: number
    moved?: boolean
  } | null>(null)

  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [connections, setConnections] = useState<CanvasConnection[]>([])
  const [pan, setPan] = useState({ x: 40, y: 20 })
  const [zoom, setZoom] = useState(0.85)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectFrom, setConnectFrom] = useState<string | null>(null)
  const [entityMenu, setEntityMenu] = useState(false)
  const [layerMenu, setLayerMenu] = useState(false)
  const [hidden, setHidden] = useState<Record<NodeKind, boolean>>({
    note: false, evidence: false, entity: false, theory: false,
  })
  const [fullscreen, setFullscreen] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const { containerRef: toolsRef, currentWidth: toolsWidth, collapsed: toolsCollapsed, setCollapsed: setToolsCollapsed, startResize: startToolsResize } = useResizablePanel({
    collapsedWidth: COLLAPSED_TOOLS_W,
    defaultWidth: DEFAULT_TOOLS_W,
  })

  const patchNode = useDebouncedPatch<CanvasNode>((id) => `/api/workspace/nodes/${id}`)

  const selected = nodes.find((n) => n.id === selectedId) ?? null

  useEffect(() => {
    if (!activeCaseId) return
    setSelectedId(null)
    setSelectedConnectionId(null)
    fetch(`/api/workspace/nodes?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setNodes((Array.isArray(rows) ? rows : []).map(nodeFromRow)))
      .catch(() => setNodes([]))
    fetch(`/api/workspace/connections?caseId=${encodeURIComponent(activeCaseId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setConnections((Array.isArray(rows) ? rows : []).map(connectionFromRow)))
      .catch(() => setConnections([]))
  }, [activeCaseId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fullscreen])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey) {
        // Pinch-to-zoom (trackpad) or explicit Ctrl+scroll — zoom toward cursor.
        const rect = el.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        setZoom((z) => {
          const nz = clamp(z * (1 + -e.deltaY * 0.0015), 0.4, 1.8)
          setPan((p) => ({
            x: mx - (mx - p.x) * (nz / z),
            y: my - (my - p.y) * (nz / z),
          }))
          return nz
        })
      } else {
        // Plain wheel / two-finger trackpad scroll — pan the canvas.
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function onBgPointerDown(e: React.PointerEvent) {
    if (connectMode) { setConnectFrom(null); return }
    setSelectedId(null)
    setSelectedConnectionId(null)
    interaction.current = {
      type: 'pan', startX: e.clientX, startY: e.clientY,
      originX: pan.x, originY: pan.y,
    }
  }

  function onNodePointerDown(e: React.PointerEvent, node: CanvasNode) {
    e.stopPropagation()
    if (connectMode) { handleConnectClick(node.id); return }
    setSelectedId(node.id)
    setSelectedConnectionId(null)
    interaction.current = {
      type: 'node', nodeId: node.id, startX: e.clientX, startY: e.clientY,
      originX: node.x, originY: node.y, moved: false,
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const it = interaction.current
    if (!it) return
    if (it.type === 'pan') {
      setPan({ x: it.originX + (e.clientX - it.startX), y: it.originY + (e.clientY - it.startY) })
    } else {
      const dx = (e.clientX - it.startX) / zoom
      const dy = (e.clientY - it.startY) / zoom
      it.moved = true
      setNodes((ns) => ns.map((n) => n.id === it.nodeId ? { ...n, x: it.originX + dx, y: it.originY + dy } : n))
    }
  }

  function onPointerUp() {
    const it = interaction.current
    if (it?.type === 'node' && it.moved) {
      const node = nodes.find((n) => n.id === it.nodeId)
      if (node) patchNode(node.id, { x: node.x, y: node.y })
    }
    interaction.current = null
  }

  function handleConnectClick(id: string) {
    if (connectFrom === null) { setConnectFrom(id); return }
    if (connectFrom === id) { setConnectFrom(null); return }
    const fromId = connectFrom
    setConnectFrom(null)
    setConnectMode(false)
    fetch('/api/workspace/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId: activeCaseId, fromNodeId: fromId, toNodeId: id, label: 'related to' }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((row) => { if (row) setConnections((cs) => [...cs, connectionFromRow(row)]) })
      .catch((err) => console.error(err))
  }

  function screenToCanvas(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom }
  }

  function viewCenter() {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 200, y: 160 }
    return { x: (rect.width / 2 - pan.x) / zoom - 105, y: (rect.height / 2 - pan.y) / zoom - 44 }
  }

  const addNode = useCallback(async (node: Omit<CanvasNode, 'x' | 'y' | 'id'>, at?: { x: number; y: number }) => {
    if (!activeCaseId) return
    const c = at ?? viewCenter()
    const x = at ? at.x - node.w / 2 : c.x
    const y = at ? at.y - node.h / 2 : c.y
    try {
      const res = await fetch('/api/workspace/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCaseId, kind: node.kind, x, y, w: node.w, h: node.h,
          title: node.title, bodyText: node.body ?? null,
          entityType: node.entityType ?? null, evidenceType: node.evidenceType ?? null,
          confidence: node.confidence ?? null, riskScore: node.riskScore ?? null, noteTone: node.noteTone ?? null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create node')
      const created = nodeFromRow(await res.json())
      setNodes((ns) => [...ns, created])
      setSelectedId(created.id)
      setSelectedConnectionId(null)
    } catch (err) {
      console.error(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseId, pan, zoom])

  function toolPayload(descriptor: ToolDescriptor): Omit<CanvasNode, 'x' | 'y' | 'id'> {
    if (descriptor.kind === 'note') return { kind: 'note', w: 210, h: 116, title: 'New note', body: 'Add observation…', noteTone: 'blue' }
    if (descriptor.kind === 'evidence') return { kind: 'evidence', w: 220, h: 92, title: 'New_Evidence.file', body: 'Unverified', evidenceType: 'PDF', confidence: 50 }
    if (descriptor.kind === 'theory') return { kind: 'theory', w: 250, h: 150, title: 'New theory', confidence: 50 }
    const meta = getEntityMeta(descriptor.entityType ?? 'person')
    return { kind: 'entity', entityType: descriptor.entityType, w: 220, h: 88, title: `New ${meta.label}`, body: meta.label, riskScore: 40 }
  }

  function onToolDragStart(e: React.DragEvent, descriptor: ToolDescriptor) {
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(descriptor))
    e.dataTransfer.effectAllowed = 'copy'
  }

  function onCanvasDragOver(e: React.DragEvent) {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOver(true)
  }

  function onCanvasDrop(e: React.DragEvent) {
    const raw = e.dataTransfer.getData(DRAG_MIME)
    setDragOver(false)
    if (!raw) return
    e.preventDefault()
    const descriptor: ToolDescriptor = JSON.parse(raw)
    const at = screenToCanvas(e.clientX, e.clientY)
    addNode(toolPayload(descriptor), at)
  }

  async function deleteSelected() {
    if (!selectedId) return
    const id = selectedId
    setNodes((ns) => ns.filter((n) => n.id !== id))
    setConnections((cs) => cs.filter((c) => c.from !== id && c.to !== id))
    setSelectedId(null)
    try {
      await fetch(`/api/workspace/nodes/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error(err)
    }
  }

  function updateSelectedNode(patch: Partial<CanvasNode>) {
    if (!selected) return
    setNodes((ns) => ns.map((n) => n.id === selected.id ? { ...n, ...patch } : n))
    patchNode(selected.id, patch)
  }

  const center = (n: CanvasNode) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 })

  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === selectedConnectionId) ?? null,
    [connections, selectedConnectionId],
  )

  function selectConnection(e: React.PointerEvent | React.MouseEvent, id: string) {
    e.stopPropagation()
    setSelectedConnectionId(id)
    setSelectedId(null)
  }

  const tools: { label: string; icon: typeof User; onClick: () => void; active?: boolean; drag?: ToolDescriptor }[] = [
    { label: 'Add Note', icon: StickyNote, onClick: () => addNode(toolPayload({ kind: 'note' })), drag: { kind: 'note' } },
    { label: 'Add Evidence', icon: Boxes, onClick: () => addNode(toolPayload({ kind: 'evidence' })), drag: { kind: 'evidence' } },
    { label: 'Add Entity', icon: Network, onClick: () => setEntityMenu((v) => !v) },
    { label: 'Connect', icon: Link2, onClick: () => { setConnectMode((v) => !v); setConnectFrom(null) }, active: connectMode },
    { label: 'Add Theory', icon: Lightbulb, onClick: () => addNode(toolPayload({ kind: 'theory' })), drag: { kind: 'theory' } },
  ]

  const workspaceContent = (
    <div className={cn('flex h-full', fullscreen && 'fixed inset-0 z-50 bg-background')}>
      {/* Fullscreen header bar */}
      {fullscreen && (
        <div className="absolute left-0 right-0 top-0 z-30 flex h-10 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
          <p className="text-sm font-medium">Investigation Workspace</p>
          <button type="button" onClick={() => setFullscreen(false)} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-accent">
            <Minimize2 className="size-3.5" aria-hidden /> Exit
          </button>
        </div>
      )}

      {/* Tools — collapsible + resizable */}
      {toolsCollapsed ? (
        <div className={cn('flex shrink-0', fullscreen && 'mt-10')}>
          <CollapsedPanelRail label="Tools" onExpand={() => setToolsCollapsed(false)} />
        </div>
      ) : (
        <div
          ref={toolsRef}
          className={cn('relative flex shrink-0 flex-col border-r border-border bg-card', fullscreen && 'mt-10')}
          style={{ width: toolsWidth }}
        >
          <SidebarPanelHeader label="Tools" onCollapse={() => setToolsCollapsed(true)} />
          <div className="space-y-1 p-2">
            {tools.map((t) => {
              const Icon = t.icon
              return (
                <button key={t.label} type="button" onClick={t.onClick}
                  draggable={Boolean(t.drag)}
                  onDragStart={t.drag ? (e) => onToolDragStart(e, t.drag as ToolDescriptor) : undefined}
                  className={cn('flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors', t.active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent', t.drag && 'cursor-grab active:cursor-grabbing')}
                >
                  <Icon className="size-4" aria-hidden /> {t.label}
                </button>
              )
            })}
          </div>

          {entityMenu && (
            <div className="mx-2 mb-2 mt-1 rounded-md border border-border bg-popover p-1.5">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Entity type</p>
              <div className="grid grid-cols-2 gap-1">
                {entityTools.map((et) => {
                  const Icon = et.icon
                  const meta = getEntityMeta(et.type)
                  return (
                    <button key={et.type} type="button"
                      draggable
                      onDragStart={(e) => onToolDragStart(e, { kind: 'entity', entityType: et.type })}
                      onClick={() => { addNode(toolPayload({ kind: 'entity', entityType: et.type })); setEntityMenu(false) }}
                      className="flex cursor-grab items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent active:cursor-grabbing"
                    >
                      <Icon className={cn('size-3.5', meta.color)} aria-hidden /> {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {layerMenu && (
            <div className="mx-2 mb-2 mt-1 rounded-md border border-border bg-popover p-1.5">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Visible layers</p>
              {(['entity', 'evidence', 'note', 'theory'] as NodeKind[]).map((k) => (
                <label key={k} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs capitalize hover:bg-accent">
                  <input type="checkbox" checked={!hidden[k]} onChange={() => setHidden((h) => ({ ...h, [k]: !h[k] }))} className="accent-primary" />
                  {k}
                </label>
              ))}
            </div>
          )}

          <div className="mt-auto border-t border-border p-3 text-xs text-muted-foreground">
            <p className="leading-relaxed">Drag a tool onto the canvas, or click to add · scroll to pan · Ctrl+scroll to zoom.</p>
          </div>

          <div onPointerDown={startToolsResize} className="absolute inset-y-0 -right-1 w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30" />
        </div>
      )}

      {/* Canvas */}
      <div className={cn('relative min-w-0 flex-1', fullscreen && 'mt-10')}>
        <div ref={containerRef}
          className={cn('workspace-grid absolute inset-0 overflow-hidden bg-background', connectMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing', dragOver && 'ring-2 ring-inset ring-primary/50')}
          onPointerDown={onBgPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
          onDragOver={onCanvasDragOver} onDragLeave={() => setDragOver(false)} onDrop={onCanvasDrop}
        >
          <div className="absolute left-0 top-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
            <svg className="absolute left-0 top-0 overflow-visible" width={1} height={1}>
              {connections.map((c) => {
                const a = nodes.find((n) => n.id === c.from)
                const b = nodes.find((n) => n.id === c.to)
                if (!a || !b || hidden[a.kind] || hidden[b.kind]) return null
                const p1 = center(a), p2 = center(b)
                const dx = Math.max(50, Math.abs(p2.x - p1.x) / 2)
                const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2
                const endpointActive = selectedId === a.id || selectedId === b.id
                const isSelected = selectedConnectionId === c.id
                return (
                  <g key={c.id}>
                    <path
                      d={`M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`}
                      fill="none" stroke="transparent" strokeWidth={16}
                      className="pointer-events-auto cursor-pointer"
                      onPointerDown={(e) => selectConnection(e, c.id)}
                    />
                    <path
                      d={`M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`}
                      fill="none"
                      stroke={isSelected ? 'var(--primary)' : endpointActive ? 'var(--primary)' : 'oklch(0.6 0.02 256 / 55%)'}
                      strokeWidth={isSelected ? 3 : endpointActive ? 2 : 1.5}
                      strokeDasharray={isSelected ? undefined : '5 4'}
                      className="pointer-events-none"
                    />
                    <circle cx={p2.x} cy={p2.y} r={isSelected ? 4 : 3} fill="var(--primary)" className="pointer-events-none" />
                    <foreignObject x={mx - 70} y={my - 14} width={140} height={28} className="overflow-visible pointer-events-auto">
                      <div className="flex justify-center">
                        <span
                          onPointerDown={(e) => selectConnection(e, c.id)}
                          className={cn(
                            'cursor-pointer rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground font-semibold text-[11px]'
                              : 'border-border bg-card text-muted-foreground hover:border-primary/50',
                          )}
                        >
                          {c.label}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                )
              })}
            </svg>

            {nodes.map((node) => {
              if (hidden[node.kind]) return null
              const isSelected = node.id === selectedId
              const isConnectFrom = node.id === connectFrom
              return (
                <div key={node.id} onPointerDown={(e) => onNodePointerDown(e, node)}
                  className={cn(
                    'absolute select-none rounded-lg border bg-card shadow-lg transition-shadow',
                    connectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
                    isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/40',
                    isConnectFrom && 'ring-2 ring-primary',
                    node.kind === 'note' && node.noteTone ? noteToneClass[node.noteTone] : '',
                  )}
                  style={{ left: node.x, top: node.y, width: node.w, minHeight: node.h }}
                >
                  <NodeContent node={node} />
                </div>
              )
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-md border border-border bg-card p-1 shadow-lg">
            <button type="button" onClick={() => setZoom((z) => clamp(z - 0.15, 0.4, 1.8))} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Zoom out">
              <Minus className="size-4" />
            </button>
            <span className="w-12 text-center text-xs font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((z) => clamp(z + 0.15, 0.4, 1.8))} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Zoom in">
              <Plus className="size-4" />
            </button>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <button type="button" onClick={() => setLayerMenu((v) => !v)} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Layers">
              <Network className="size-4" />
            </button>
            <button type="button" onClick={() => setFullscreen((f) => !f)} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>

          {connectMode && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary">
              {connectFrom ? 'Select the target card to link' : 'Select the source card to connect'}
            </div>
          )}
        </div>
      </div>

      {/* Inspector — node or connection, hidden by default, appears on selection */}
      {selected && (
        <div className={cn('flex w-80 shrink-0 flex-col border-l border-border bg-card', fullscreen && 'mt-10')}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={deleteSelected} className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-danger/10 hover:text-danger">
                <Trash2 className="size-3.5" /> Remove
              </button>
              <button type="button" onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close inspector">
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <Inspector node={selected} connections={connections} nodes={nodes} onUpdate={updateSelectedNode} />
          </div>
        </div>
      )}

      {!selected && selectedConnection && (
        <div className={cn('flex w-80 shrink-0 flex-col border-l border-border bg-card', fullscreen && 'mt-10')}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connection</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={async () => {
                  const id = selectedConnection.id
                  setConnections((cs) => cs.filter((c) => c.id !== id))
                  setSelectedConnectionId(null)
                  try { await fetch(`/api/workspace/connections/${id}`, { method: 'DELETE' }) } catch (err) { console.error(err) }
                }}
                className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
              <button type="button" onClick={() => setSelectedConnectionId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close inspector">
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {(() => {
              const from = nodes.find((n) => n.id === selectedConnection.from)
              const to = nodes.find((n) => n.id === selectedConnection.to)
              return (
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="truncate">From: <span className="text-foreground">{from?.title ?? selectedConnection.from}</span></p>
                  <p className="truncate">To: <span className="text-foreground">{to?.title ?? selectedConnection.to}</span></p>
                </div>
              )
            })()}
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Label</p>
              <input
                value={selectedConnection.label}
                onChange={(e) => {
                  const label = e.target.value
                  setConnections((cs) => cs.map((c) => c.id === selectedConnection.id ? { ...c, label } : c))
                  fetch(`/api/workspace/connections/${selectedConnection.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ label }),
                  }).catch((err) => console.error(err))
                }}
                aria-label="Connection label"
                className="w-full bg-transparent text-sm font-medium outline-none focus:border-b focus:border-ring"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return workspaceContent
}

function NodeContent({ node }: { node: CanvasNode }) {
  if (node.kind === 'note') {
    return (
      <div className="p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><StickyNote className="size-3" /> Note</div>
        <p className="text-sm font-medium leading-tight">{node.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-foreground/80">{node.body}</p>
      </div>
    )
  }
  if (node.kind === 'theory') {
    return (
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-confidence"><Lightbulb className="size-3" /> Theory</div>
        <p className="text-sm font-medium leading-tight text-pretty">{node.title}</p>
        <div className="mt-3">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</p>
          <ConfidenceBar value={node.confidence ?? 50} />
        </div>
      </div>
    )
  }
  if (node.kind === 'evidence') {
    return (
      <div className="p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><Boxes className="size-3" /> Evidence · {node.evidenceType}</div>
        <p className="truncate text-sm font-medium">{node.title}</p>
        <p className="text-xs text-muted-foreground">{node.body}</p>
        {node.confidence != null && <div className="mt-2"><ConfidenceBar value={node.confidence} /></div>}
      </div>
    )
  }
  return (
    <div className="flex items-start gap-2.5 p-3">
      {node.entityType && <EntityGlyph type={node.entityType} />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{node.title}</p>
        <p className="truncate text-xs text-muted-foreground">{node.body}</p>
        {node.riskScore != null && <div className="mt-1.5"><RiskScore score={node.riskScore} /></div>}
      </div>
    </div>
  )
}

function Inspector({ node, connections, nodes, onUpdate }: { node: CanvasNode; connections: CanvasConnection[]; nodes: CanvasNode[]; onUpdate: (patch: Partial<CanvasNode>) => void }) {
  const related = connections
    .filter((c) => c.from === node.id || c.to === node.id)
    .map((c) => {
      const otherId = c.from === node.id ? c.to : c.from
      const other = nodes.find((n) => n.id === otherId)
      return other ? { other, label: c.label } : null
    })
    .filter((x): x is { other: CanvasNode; label: string } => Boolean(x))

  const kindLabel = node.kind === 'entity' && node.entityType
    ? getEntityMeta(node.entityType).label
    : node.kind.charAt(0).toUpperCase() + node.kind.slice(1)

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {node.kind === 'entity' && node.entityType ? (
          <EntityGlyph type={node.entityType} className="size-10" />
        ) : (
          <span className="flex size-10 items-center justify-center rounded-md border border-border bg-elevated">
            {node.kind === 'note' ? <StickyNote className="size-5 text-info" /> : node.kind === 'theory' ? <Lightbulb className="size-5 text-confidence" /> : <Boxes className="size-5 text-success" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kindLabel}</p>
          <input
            value={node.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            aria-label="Title"
            className="w-full bg-transparent text-sm font-semibold leading-tight outline-none focus:border-b focus:border-ring"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
        <textarea
          value={node.body ?? ''}
          onChange={(e) => onUpdate({ body: e.target.value })}
          rows={3}
          aria-label="Body"
          placeholder="Add notes…"
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground/80 outline-none placeholder:text-muted-foreground/40 focus:border-b focus:border-ring"
        />
      </div>

      {node.riskScore != null && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk Score</p>
          <RiskScore score={node.riskScore} />
        </div>
      )}

      {node.confidence != null && (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confidence Score</p>
          <ConfidenceBar value={node.confidence} />
        </div>
      )}

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related Entities · {related.length}</p>
        {related.length === 0 ? (
          <p className="text-xs text-muted-foreground">No relationships mapped yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {related.map(({ other, label }) => (
              <li key={other.id} className="flex items-center gap-2 rounded-md border border-border bg-elevated/60 px-2.5 py-2">
                {other.kind === 'entity' && other.entityType ? (
                  <EntityGlyph type={other.entityType} className="size-6" />
                ) : (
                  <span className="flex size-6 items-center justify-center rounded border border-border bg-card"><Link2 className="size-3 text-muted-foreground" /></span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{other.title}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
