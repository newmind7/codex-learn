import { memo, useMemo } from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'

import type { MindmapNodeData } from '../types'
import { stringToColor } from '../utils/color'

import './MindmapNode.css'

const MindmapNode = memo(({ data, selected }: NodeProps<MindmapNodeData>) => {
  const background = useMemo(() => {
    if (data.completed) {
      return 'linear-gradient(135deg, #4ade80, #22c55e)'
    }

    return stringToColor(data.group)
  }, [data.completed, data.group])

  return (
    <div className={`mindmap-node ${selected ? 'selected' : ''}`} style={{ background }}>
      <Handle className="handle" type="target" position={Position.Top} />
      <div className="content">
        <div className="label" title={data.label}>
          {data.label || '未命名节点'}
        </div>
        {(data.group || data.date) && (
          <div className="meta">
            {data.group && <span className="tag">{data.group}</span>}
            <span className="date">{data.date}</span>
          </div>
        )}
        {data.completed && <div className="status">已完成</div>}
      </div>
      <Handle className="handle" type="source" position={Position.Bottom} />
    </div>
  )
})

export default MindmapNode
