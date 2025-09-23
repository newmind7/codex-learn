import type { Edge, Node } from 'reactflow'

export interface MindmapNodeData {
  label: string
  completed: boolean
  group?: string
  date: string
}

export type MindmapNode = Node<MindmapNodeData>
export type MindmapEdge = Edge

export interface BoardState {
  nodes: MindmapNode[]
  edges: MindmapEdge[]
}

export type BoardCollection = Record<string, BoardState>
