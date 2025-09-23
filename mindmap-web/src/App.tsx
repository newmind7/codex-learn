import type { MouseEvent as ReactMouseEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from 'reactflow'
import { format } from 'date-fns'
import { nanoid } from 'nanoid'

import NodeInspector from './components/NodeInspector'
import MindmapNode from './components/MindmapNode'
import type { BoardCollection, BoardState, MindmapNode as MindmapNodeType, MindmapNodeData } from './types'

import 'reactflow/dist/style.css'
import './App.css'

const STORAGE_KEY = 'mindmap-web-state'

const createEmptyBoard = (): BoardState => ({ nodes: [], edges: [] })

const getToday = () => format(new Date(), 'yyyy-MM-dd')

const loadInitialState = (): { boards: BoardCollection; selectedDate: string } => {
  if (typeof window === 'undefined') {
    const today = getToday()
    return { boards: { [today]: createEmptyBoard() }, selectedDate: today }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { boards: BoardCollection; selectedDate: string }
      if (parsed.boards && Object.keys(parsed.boards).length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('无法从本地存储中读取数据：', error)
  }

  const fallbackDate = getToday()
  return { boards: { [fallbackDate]: createEmptyBoard() }, selectedDate: fallbackDate }
}

function App() {
  const [{ boards, selectedDate }, setState] = useState(loadInitialState)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [pendingDate, setPendingDate] = useState(getToday())
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const currentBoard = useMemo(() => boards[selectedDate] ?? createEmptyBoard(), [boards, selectedDate])

  useEffect(() => {
    if (!(selectedDate in boards)) {
      setState((prev) => ({
        ...prev,
        boards: { ...prev.boards, [selectedDate]: createEmptyBoard() },
      }))
    }
  }, [boards, selectedDate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, selectedDate }))
  }, [boards, selectedDate])

  useEffect(() => {
    if (selectedNodeId && !currentBoard.nodes.find((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null)
    }
  }, [currentBoard.nodes, selectedNodeId])

  const timelineDates = useMemo(() => Object.keys(boards).sort(), [boards])

  const updateBoard = useCallback(
    (updater: (board: BoardState) => BoardState) => {
      setState((prev) => {
        const board = prev.boards[selectedDate] ?? createEmptyBoard()
        return {
          ...prev,
          boards: { ...prev.boards, [selectedDate]: updater(board) },
        }
      })
    },
    [selectedDate],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      updateBoard((board) => ({ ...board, nodes: applyNodeChanges(changes, board.nodes) }))
    },
    [updateBoard],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      updateBoard((board) => ({ ...board, edges: applyEdgeChanges(changes, board.edges) }))
    },
    [updateBoard],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      updateBoard((board) => ({ ...board, edges: addEdge({ ...connection, id: nanoid() }, board.edges) }))
    },
    [updateBoard],
  )

  const createNodeAtPosition = useCallback(
    (position: { x: number; y: number }) => {
      const id = nanoid()
      const newNode: MindmapNodeType = {
        id,
        type: 'mindmap',
        position,
        data: {
          label: '新节点',
          completed: false,
          group: '',
          date: selectedDate,
        },
      }

      updateBoard((board) => ({ ...board, nodes: [...board.nodes, newNode] }))
      setSelectedNodeId(id)
      return newNode
    },
    [selectedDate, updateBoard],
  )

  const handleDoubleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (!reactFlowWrapper.current || !reactFlowInstance) return
      const target = event.target as HTMLElement
      if (!target.classList.contains('react-flow__pane')) return
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })
      createNodeAtPosition(position)
    },
    [createNodeAtPosition, reactFlowInstance],
  )

  const selectedNode = useMemo(
    () => currentBoard.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [currentBoard.nodes, selectedNodeId],
  )

  const updateNodeData = useCallback(
    (nodeId: string, changes: Partial<MindmapNodeData>) => {
      updateBoard((board) => ({
        ...board,
        nodes: board.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...changes } } : node,
        ),
      }))
    },
    [updateBoard],
  )

  const moveNodeToDate = useCallback(
    (nodeId: string, targetDate: string) => {
      if (targetDate === selectedDate) return

      setState((prev) => {
        const sourceBoard = prev.boards[selectedDate] ?? createEmptyBoard()
        const nodeToMove = sourceBoard.nodes.find((node) => node.id === nodeId)
        if (!nodeToMove) return prev

        const cleanedSourceEdges = sourceBoard.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId,
        )
        const updatedNode: MindmapNodeType = {
          ...nodeToMove,
          position: { x: nodeToMove.position.x + 80, y: nodeToMove.position.y + 80 },
          data: { ...nodeToMove.data, date: targetDate },
        }

        const targetBoard = prev.boards[targetDate] ?? createEmptyBoard()

        return {
          ...prev,
          boards: {
            ...prev.boards,
            [selectedDate]: {
              nodes: sourceBoard.nodes.filter((node) => node.id !== nodeId),
              edges: cleanedSourceEdges,
            },
            [targetDate]: {
              nodes: [...targetBoard.nodes, updatedNode],
              edges: targetBoard.edges,
            },
          },
        }
      })
      setSelectedNodeId(null)
    },
    [selectedDate],
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !selectedNode) return
      event.preventDefault()

      const offsetX = 220
      const offsetY = 150 - Math.random() * 300
      const newPosition = {
        x: selectedNode.position.x + offsetX,
        y: selectedNode.position.y + offsetY,
      }

      const child = createNodeAtPosition(newPosition)
      updateBoard((board) => ({
        ...board,
        edges: [
          ...board.edges,
          {
            id: nanoid(),
            source: selectedNode.id,
            target: child.id,
          },
        ],
      }))
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [createNodeAtPosition, selectedNode, updateBoard])

  const handleAddDate = useCallback(() => {
    if (!pendingDate) return
    setState((prev) => {
      const boards = prev.boards[pendingDate]
        ? prev.boards
        : { ...prev.boards, [pendingDate]: createEmptyBoard() }
      return {
        boards,
        selectedDate: pendingDate,
      }
    })
  }, [pendingDate])

  const handleSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeId(params.nodes[0]?.id ?? null)
  }, [])

  return (
    <div className="app">
      <header className="toolbar">
        <div className="brand">
          <h1>思维导图时间轴</h1>
          <p>双击白板新增节点 · 选中节点按 TAB 创建分支</p>
        </div>
        <div className="timeline">
          <div className="dates">
            {timelineDates.map((date) => (
              <button
                key={date}
                className={date === selectedDate ? 'active' : ''}
                onClick={() => setState((prev) => ({ ...prev, selectedDate: date }))}
              >
                {date}
              </button>
            ))}
          </div>
          <div className="date-controls">
            <input type="date" value={pendingDate} onChange={(event) => setPendingDate(event.target.value)} />
            <button className="add-date" onClick={handleAddDate}>
              切换 / 新建白板
            </button>
          </div>
        </div>
      </header>

      <main className="workspace">
        <div className="board" ref={reactFlowWrapper}>
          <ReactFlow
            nodeTypes={{ mindmap: MindmapNode }}
            nodes={currentBoard.nodes}
            edges={currentBoard.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDoubleClick={handleDoubleClick}
            onSelectionChange={handleSelectionChange}
            onInit={setReactFlowInstance}
            fitView
          >
            <Background color="#cbd5f5" gap={24} size={2} />
            <MiniMap zoomable pannable className="minimap" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        <aside className="sidebar">
          {selectedNode ? (
            <NodeInspector
              node={selectedNode}
              availableDates={timelineDates}
              onUpdate={updateNodeData}
              onMoveToDate={moveNodeToDate}
            />
          ) : (
            <div className="empty">选择一个节点查看详情</div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
