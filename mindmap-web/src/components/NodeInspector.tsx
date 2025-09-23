import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import classNames from 'classnames'

import type { MindmapNode } from '../types'

interface NodeInspectorProps {
  node: MindmapNode
  availableDates: string[]
  onUpdate: (id: string, changes: Partial<MindmapNode['data']>) => void
  onMoveToDate: (id: string, date: string) => void
}

const NodeInspector = ({ node, availableDates, onUpdate, onMoveToDate }: NodeInspectorProps) => {
  const sortedDates = useMemo(() => [...availableDates].sort(), [availableDates])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    onUpdate(node.id, { [name]: value } as Partial<MindmapNode['data']>)
  }

  return (
    <div className="inspector">
      <h2>节点详情</h2>
      <label className="field">
        <span>标题</span>
        <textarea name="label" value={node.data.label} onChange={handleChange} rows={2} />
      </label>

      <label className="field">
        <span>分组</span>
        <input name="group" value={node.data.group ?? ''} onChange={handleChange} placeholder="输入分组名称" />
      </label>

      <label className={classNames('field', 'checkbox')}>
        <input
          type="checkbox"
          checked={node.data.completed}
          onChange={(event) => onUpdate(node.id, { completed: event.target.checked })}
        />
        <span>标记为完成</span>
      </label>

      <label className="field">
        <span>所属时间轴</span>
        <select
          value={node.data.date}
          onChange={(event) => onMoveToDate(node.id, event.target.value)}
        >
          {sortedDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default NodeInspector
