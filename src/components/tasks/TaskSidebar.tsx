'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Task, TaskInsert, TaskUpdate, TaskStatus, TaskPriority } from '@/types/task'
import { TaskService } from '@/services/tasks'
import { ContactService } from '@/services/contacts'
import { DealService } from '@/services/deals'
import { TaskTypesService } from '@/services/taskTypes'
import { useAuth } from '@/contexts/AuthContext'
import { CustomDropdown } from '@/components/ui/CustomDropdown'
import { ChipSelector } from '@/components/ui/ChipSelector'
import { StatusChip } from '@/components/ui/StatusChip'
import { ClickableChipDropdown } from '@/components/ui/ClickableChipDropdown'
import { 
  getTaskTypeColor, 
  getLightColor, 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  getStatusDisplayName,
  getPriorityDisplayName
} from '@/utils/taskColors'
import { 
  X, 
  Calendar, 
  User, 
  Briefcase, 
  Flag, 
  Clock,
  Hash,
  Type,
  List,
  CheckSquare,
  Quote,
  Code,
  Image,
  Link,
  Minus,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

interface TaskSidebarProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedTask?: Task) => void
  onDelete?: (taskId: string) => void
}

interface Contact {
  id: string
  first_name: string
  last_name: string
}

interface Deal {
  id: string
  title: string
}

interface SlashCommand {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  action: (editor: HTMLTextAreaElement) => void
}

export function TaskSidebar({ task, isOpen, onClose, onSave, onDelete }: TaskSidebarProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '' as string | null,
    priority: 'medium' as TaskPriority,
    status: 'pending' as TaskStatus,
    type: '',
    contact_id: '',
    deal_id: ''
  })
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [taskTypes, setTaskTypes] = useState<string[]>([])
  const [showAddNewType, setShowAddNewType] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashFilter, setSlashFilter] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(384) // 24rem = 384px
  const [isResizing, setIsResizing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const slashCommands: SlashCommand[] = [
    {
      id: 'heading1',
      label: 'Heading 1',
      icon: <Hash className="w-4 h-4" />,
      description: 'Large section heading',
      action: (editor) => insertText(editor, '# ')
    },
    {
      id: 'heading2',
      label: 'Heading 2',
      icon: <Hash className="w-4 h-4" />,
      description: 'Medium section heading',
      action: (editor) => insertText(editor, '## ')
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      icon: <Hash className="w-4 h-4" />,
      description: 'Small section heading',
      action: (editor) => insertText(editor, '### ')
    },
    {
      id: 'paragraph',
      label: 'Text',
      icon: <Type className="w-4 h-4" />,
      description: 'Plain text paragraph',
      action: (editor) => insertText(editor, '')
    },
    {
      id: 'bulletlist',
      label: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      description: 'Create a bullet list',
      action: (editor) => insertText(editor, '- ')
    },
    {
      id: 'numberlist',
      label: 'Numbered List',
      icon: <List className="w-4 h-4" />,
      description: 'Create a numbered list',
      action: (editor) => insertText(editor, '1. ')
    },
    {
      id: 'checkbox',
      label: 'Checkbox',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Create a checkbox',
      action: (editor) => insertText(editor, '- [ ] ')
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      description: 'Create a quote block',
      action: (editor) => insertText(editor, '> ')
    },
    {
      id: 'code',
      label: 'Code',
      icon: <Code className="w-4 h-4" />,
      description: 'Create a code block',
      action: (editor) => insertText(editor, '```\n\n```')
    },
    {
      id: 'divider',
      label: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      description: 'Create a horizontal divider',
      action: (editor) => insertText(editor, '\n---\n')
    }
  ]

  const insertText = (editor: HTMLTextAreaElement, text: string) => {
    const start = editor.selectionStart
    const end = editor.selectionEnd
    const value = editor.value
    const newValue = value.substring(0, start) + text + value.substring(end)
    
    setFormData(prev => ({ ...prev, description: newValue }))
    
    // Set cursor position after inserted text
    setTimeout(() => {
      editor.focus()
      const newCursorPos = start + text.length
      editor.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const filteredSlashCommands = slashCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashFilter.toLowerCase())
  )

  useEffect(() => {
    if (task) {
      const initialData = {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending' as TaskStatus,
        priority: task.priority || 'medium' as TaskPriority,
        due_date: task.due_date ? new Date(task.due_date + 'T00:00:00').toISOString().split('T')[0] : '',
        contact_id: task.contact_id || '',
        deal_id: task.deal_id || '',
        type: task.type || ''
      }
      setFormData(initialData)
      lastSavedDataRef.current = JSON.stringify(initialData)
    } else {
      const initialData = {
        title: '',
        description: '',
        status: 'pending' as TaskStatus,
        priority: 'medium' as TaskPriority,
        due_date: '',
        contact_id: '',
        deal_id: '',
        type: ''
      }
      setFormData(initialData)
      lastSavedDataRef.current = JSON.stringify(initialData)
    }
    setSaveStatus('idle')
  }, [task])

  useEffect(() => {
    if (isOpen && user) {
      loadContacts()
      loadDeals()
      loadTaskTypes()
    }
  }, [isOpen, user])

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = window.innerWidth - e.clientX
      const maxWidth = window.innerWidth * 0.5 // 50% of screen width
      const minWidth = 320 // Minimum width
      
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)
      setSidebarWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const loadContacts = async () => {
    if (!user) return
    try {
      const data = await ContactService.getContacts(user.id, 1000)
      setContacts(data.map(c => ({ id: c.id, first_name: c.first_name, last_name: c.last_name })))
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadDeals = async () => {
    if (!user) return
    try {
      const data = await DealService.getDeals(user.id, 1000)
      setDeals(data.map(d => ({ id: d.id, title: d.title })))
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const loadTaskTypes = async () => {
    if (!user) return
    try {
      const types = await TaskTypesService.getAllTaskTypes(user.id)
      // Sort task types alphabetically
      const sortedTypes = types.sort((a, b) => a.localeCompare(b))
      setTaskTypes(sortedTypes)
    } catch (error) {
      console.error('Error loading task types:', error)
    }
  }

  const handleAddNewType = async () => {
    if (!user || !newTypeName.trim()) return
    
    try {
      await TaskTypesService.createCustomTaskType(newTypeName.trim(), user.id)
      setFormData(prev => ({ ...prev, type: newTypeName.trim() }))
      setNewTypeName('')
      setShowAddNewType(false)
      await loadTaskTypes() // Reload types to include the new one
    } catch (error) {
      console.error('Error creating new task type:', error)
      alert('Failed to create new task type. Please try again.')
    }
  }

  const handleTypeChange = (value: string) => {
    if (value === '__ADD_NEW__') {
      setShowAddNewType(true)
      setNewTypeName('')
    } else {
      setFormData(prev => ({ ...prev, type: value }))
      setShowAddNewType(false)
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart
    
    setFormData(prev => ({ ...prev, description: value }))
    
    // Check for slash command
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/')
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1)
      
      // Only show menu if slash is at start of line or after whitespace
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : '\n'
      const isValidSlashPosition = charBeforeSlash === '\n' || charBeforeSlash === ' '
      
      if (isValidSlashPosition && !textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
        setSlashFilter(textAfterSlash)
        setShowSlashMenu(true)
        
        // Calculate menu position
        const textarea = e.target
        const rect = textarea.getBoundingClientRect()
        const lineHeight = 24 // Approximate line height
        const lines = textBeforeCursor.split('\n')
        const currentLine = lines.length - 1
        const top = rect.top + (currentLine * lineHeight) + lineHeight
        const left = rect.left + (lines[lines.length - 1].length * 8) // Approximate char width
        
        setSlashMenuPosition({ top, left })
      } else {
        setShowSlashMenu(false)
      }
    } else {
      setShowSlashMenu(false)
    }
  }

  const handleSlashCommandSelect = (command: SlashCommand) => {
    if (textareaRef.current) {
      // Remove the slash and filter text
      const textarea = textareaRef.current
      const value = textarea.value
      const cursorPosition = textarea.selectionStart
      const textBeforeCursor = value.substring(0, cursorPosition)
      const lastSlashIndex = textBeforeCursor.lastIndexOf('/')
      
      const newValue = value.substring(0, lastSlashIndex) + value.substring(cursorPosition)
      setFormData(prev => ({ ...prev, description: newValue }))
      
      // Set cursor position and execute command
      setTimeout(() => {
        textarea.value = newValue
        textarea.setSelectionRange(lastSlashIndex, lastSlashIndex)
        command.action(textarea)
      }, 0)
    }
    
    setShowSlashMenu(false)
    setSlashFilter('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date || null,
        type: formData.type || null,
        contact_id: formData.contact_id || null,
        deal_id: formData.deal_id || null
      }

      if (task) {
        await TaskService.updateTask(task.id, taskData)
      } else {
        await TaskService.createTask({
          ...taskData,
          assigned_user_id: user.id
        })
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data: typeof formData) => {
    if (!user || !data.title.trim()) return
    
    const currentDataString = JSON.stringify(data)
    if (currentDataString === lastSavedDataRef.current) return
    
    setSaveStatus('saving')
    try {
      if (task) {
        // Update existing task
        const updateData: TaskUpdate = {
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date || undefined,
          contact_id: data.contact_id || undefined,
          deal_id: data.deal_id || undefined,
          type: data.type || undefined
        }
        const updatedTask = await TaskService.updateTask(task.id, updateData)
        lastSavedDataRef.current = currentDataString
        setSaveStatus('saved')
        
        // Create optimistic update object
        const optimisticTask = {
          ...task,
          ...updateData,
          updated_at: new Date().toISOString()
        }
        onSave(optimisticTask) // Pass updated task for optimistic update
        
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        // For new tasks, we'll save on first meaningful input
        // Get current task count to determine next sort order
        const allTasks = await TaskService.getTasks()
        const maxSortOrder = allTasks.length > 0 ? Math.max(...allTasks.map(t => t.sort_order || 0)) : 0
        
        const insertData: TaskInsert = {
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          due_date: data.due_date || null,
          contact_id: data.contact_id || null,
          deal_id: data.deal_id || null,
          type: data.type || null,
          assigned_user_id: user.id,
          sort_order: maxSortOrder + 1 // Simple incremental sort order
        }
        const newTask = await TaskService.createTask(insertData)
        lastSavedDataRef.current = currentDataString
        setSaveStatus('saved')
        onSave(newTask) // Pass the new task to update the sidebar and refresh the list
        // Don't close sidebar immediately for new tasks, let user continue editing
      }
    } catch (error) {
      console.error('Error auto-saving task:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [user, task, onSave, onClose])
  
  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Only auto-save if we have a title (for existing tasks) or meaningful content (for new tasks)
    if (formData.title.trim() && (task || formData.description.trim() || formData.due_date || formData.contact_id || formData.deal_id || formData.type || formData.priority !== 'medium' || formData.status !== 'pending')) {
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(formData)
      }, 1000) // 1 second debounce
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, autoSave, task])

  if (!isOpen) return null

  return (
    <>
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col w-full sm:w-96 lg:w-auto"
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 640 ? sidebarWidth : '100%' }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 hover:w-1.5 transition-all duration-150 bg-transparent"
          onMouseDown={handleResizeStart}
          title="Drag to resize"
        />
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            {saveStatus === 'saving' && (
              <span className="text-xs text-blue-600">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-600">Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-xs text-red-600">Error saving</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {task && onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                title="Delete task"
              >
                <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title..."
                className="w-full text-2xl font-semibold border-none outline-none placeholder-gray-400 bg-transparent"
                required
              />
            </div>

            {/* Properties */}
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Status</span>
                </div>
                <ChipSelector
                  value={formData.status}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
                  options={[
                    {
                      value: 'pending',
                      label: getStatusDisplayName('pending'),
                      ...STATUS_COLORS.pending
                    },
                    {
                      value: 'in_progress',
                      label: getStatusDisplayName('in_progress'),
                      ...STATUS_COLORS.in_progress
                    },
                    {
                      value: 'completed',
                      label: getStatusDisplayName('completed'),
                      ...STATUS_COLORS.completed
                    },
                    {
                      value: 'cancelled',
                      label: getStatusDisplayName('cancelled'),
                      ...STATUS_COLORS.cancelled
                    }
                  ]}
                  className="flex-1"
                />
              </div>

              {/* Priority */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Priority</span>
                </div>
                <ChipSelector
                  value={formData.priority}
                  onChange={(value: string) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
                  options={[
                    {
                      value: 'low',
                      label: getPriorityDisplayName('low'),
                      ...PRIORITY_COLORS.low
                    },
                    {
                      value: 'medium',
                      label: getPriorityDisplayName('medium'),
                      ...PRIORITY_COLORS.medium
                    },
                    {
                      value: 'high',
                      label: getPriorityDisplayName('high'),
                      ...PRIORITY_COLORS.high
                    },
                    {
                      value: 'urgent',
                      label: getPriorityDisplayName('urgent'),
                      ...PRIORITY_COLORS.urgent
                    }
                  ]}
                  className="flex-1"
                />
              </div>

              {/* Type */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Type</span>
                </div>
                <div className="flex-1">
                  {showAddNewType ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddNewType()
                          } else if (e.key === 'Escape') {
                            setShowAddNewType(false)
                            setNewTypeName('')
                          }
                        }}
                        placeholder="Enter new task type..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewType}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNewType(false)
                          setNewTypeName('')
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <ClickableChipDropdown
                      value={formData.type}
                      onChange={handleTypeChange}
                      placeholder="Select task type..."
                      chipColor={formData.type ? getTaskTypeColor(formData.type) : undefined}
                      chipBgColor={formData.type ? `${getTaskTypeColor(formData.type)}15` : undefined}
                      chipTextColor={formData.type ? getTaskTypeColor(formData.type) : undefined}
                      options={[
                        {
                          value: '__ADD_NEW__',
                          label: '+ Add New Type',
                          description: 'Create a custom task type'
                        },
                        { value: '', label: 'No type' },
                        ...taskTypes.map(type => ({
                          value: type,
                          label: type,
                          color: getTaskTypeColor(type)
                        }))
                      ]}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Due</span>
                </div>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value || null }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Contact */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Contact</span>
                </div>
                <CustomDropdown
                  value={formData.contact_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}
                  placeholder="No contact"
                  options={[
                    { value: '', label: 'No contact' },
                    ...contacts.map(contact => ({
                      value: contact.id,
                      label: `${contact.first_name} ${contact.last_name}`
                    }))
                  ]}
                  className="flex-1"
                />
              </div>

              {/* Deal */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 w-24">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Deal</span>
                </div>
                <CustomDropdown
                  value={formData.deal_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, deal_id: value }))}
                  placeholder="No deal"
                  options={[
                    { value: '', label: 'No deal' },
                    ...deals.map(deal => ({
                      value: deal.id,
                      label: deal.title
                    }))
                  ]}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Description/Notes */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Add notes... Type '/' for formatting options"
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
                />
                
                {/* Slash Command Menu */}
                {showSlashMenu && (
                  <div 
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-60 w-64 max-h-64 overflow-y-auto"
                    style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
                  >
                    {filteredSlashCommands.map((command) => (
                      <button
                        key={command.id}
                        type="button"
                        onClick={() => handleSlashCommandSelect(command)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-3 text-sm"
                      >
                        {command.icon}
                        <div>
                          <div className="font-medium">{command.label}</div>
                          <div className="text-xs text-gray-500">{command.description}</div>
                        </div>
                      </button>
                    ))}
                    {filteredSlashCommands.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No commands found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Supports Markdown formatting. Type &quot;/&quot; for quick formatting options.
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  )
}
