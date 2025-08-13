'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Deal, DealInsert, DealUpdate } from '@/types/deal'
import { DealDocument } from '@/types/dealDocument'
import { DealService } from '@/services/deals'
import { ContactService } from '@/services/contacts'
import { DealDocumentService } from '@/services/dealDocuments'
import { useAuth } from '@/contexts/AuthContext'
import { StatusChip } from '@/components/ui/StatusChip'
import { ClickableChipDropdown } from '@/components/ui/ClickableChipDropdown'
import { 
  X, 
  Calendar, 
  User, 
  DollarSign, 
  Flag, 
  Hash,
  Type,
  List,
  CheckSquare,
  Quote,
  Code,
  Image,
  Link,
  Minus,
  Upload,
  FileText,
  Download,
  Trash2,
  MapPin,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'

interface DealSidebarProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedDeal?: Deal) => void
}

interface Contact {
  id: string
  first_name: string
  last_name: string
}

interface SlashCommand {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  action: (editor: HTMLTextAreaElement) => void
}

export function DealSidebar({ deal, isOpen, onClose, onSave }: DealSidebarProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_address: '',
    price: '',
    commission: '',
    probability: '',
    expected_close_date: '',
    status: 'prospect' as 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
    deal_type: 'buying' as 'buying' | 'selling' | 'renting' | 'investment',
    contact_id: ''
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [documents, setDocuments] = useState<DealDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploadingFile, setUploadingFile] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashFilter, setSlashFilter] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(384) // 24rem = 384px
  const [isResizing, setIsResizing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      id: 'bullet',
      label: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      description: 'Create a bullet list',
      action: (editor) => insertText(editor, '• ')
    },
    {
      id: 'numbered',
      label: 'Numbered List',
      icon: <Type className="w-4 h-4" />,
      description: 'Create a numbered list',
      action: (editor) => insertText(editor, '1. ')
    },
    {
      id: 'checkbox',
      label: 'Checkbox',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Create a checkbox',
      action: (editor) => insertText(editor, '☐ ')
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
      label: 'Code Block',
      icon: <Code className="w-4 h-4" />,
      description: 'Create a code block',
      action: (editor) => insertText(editor, '```\n\n```')
    },
    {
      id: 'divider',
      label: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      description: 'Add a horizontal divider',
      action: (editor) => insertText(editor, '\n---\n')
    }
  ]

  const statusOptions = [
    { value: 'prospect', label: 'Prospect', color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' },
    { value: 'qualified', label: 'Qualified', color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
    { value: 'proposal', label: 'Proposal', color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
    { value: 'negotiation', label: 'Negotiation', color: '#F97316', bgColor: '#FED7AA', textColor: '#C2410C' },
    { value: 'closed_won', label: 'Closed Won', color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
    { value: 'closed_lost', label: 'Closed Lost', color: '#EF4444', bgColor: '#FEE2E2', textColor: '#DC2626' }
  ]

  const dealTypeOptions = [
    { value: 'buying', label: 'Buying', color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' },
    { value: 'selling', label: 'Selling', color: '#10B981', bgColor: '#D1FAE5', textColor: '#047857' },
    { value: 'renting', label: 'Renting', color: '#8B5CF6', bgColor: '#EDE9FE', textColor: '#5B21B6' },
    { value: 'investment', label: 'Investment', color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' }
  ]

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user])

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        property_address: deal.property_address || '',
        price: deal.price?.toString() || '',
        commission: deal.commission?.toString() || '',
        probability: deal.probability?.toString() || '',
        expected_close_date: deal.expected_close_date || '',
        status: deal.status || 'prospect',
        deal_type: deal.deal_type || 'buying',
        contact_id: deal.contact_id || ''
      })
      loadDocuments(deal.id)
    } else {
      setFormData({
        title: '',
        description: '',
        property_address: '',
        price: '',
        commission: '',
        probability: '',
        expected_close_date: '',
        status: 'prospect',
        deal_type: 'buying',
        contact_id: ''
      })
      setDocuments([])
    }
  }, [deal])

  // Auto-save functionality
  useEffect(() => {
    const currentData = JSON.stringify(formData)
    
    if (currentData !== lastSavedDataRef.current && formData.title.trim()) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      setSaveStatus('saving')
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave()
      }, 1000) // 1 second debounce
    }
  }, [formData])

  const loadContacts = async () => {
    if (!user) return
    try {
      const data = await ContactService.getContacts(user.id)
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadDocuments = async (dealId: string) => {
    try {
      const data = await DealDocumentService.getDocumentsByDealId(dealId)
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleAutoSave = async () => {
    if (!user || !formData.title.trim()) return

    try {
      const dealData = {
        title: formData.title,
        description: formData.description,
        property_address: formData.property_address || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        commission: formData.commission ? parseFloat(formData.commission) : undefined,
        probability: formData.probability ? parseInt(formData.probability) : undefined,
        expected_close_date: formData.expected_close_date || undefined,
        status: formData.status,
        deal_type: formData.deal_type,
        contact_id: formData.contact_id || undefined,
        assigned_agent_id: user.id
      }

      let savedDeal: Deal
      if (deal?.id) {
        savedDeal = await DealService.updateDeal(deal.id, dealData)
      } else {
        savedDeal = await DealService.createDeal(dealData as DealInsert)
      }

      lastSavedDataRef.current = JSON.stringify(formData)
      setSaveStatus('saved')
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)

      onSave(savedDeal)
    } catch (error) {
      console.error('Error auto-saving deal:', error)
      setSaveStatus('error')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const insertText = (editor: HTMLTextAreaElement, text: string) => {
    const start = editor.selectionStart
    const end = editor.selectionEnd
    const currentValue = editor.value
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
    
    handleInputChange('description', newValue)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      editor.focus()
      editor.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      const textarea = e.currentTarget
      const rect = textarea.getBoundingClientRect()
      const lineHeight = 20
      const lines = textarea.value.substring(0, textarea.selectionStart).split('\n')
      const currentLine = lines.length - 1
      
      setSlashMenuPosition({
        top: rect.top + (currentLine * lineHeight) + 25,
        left: rect.left + 10
      })
      setShowSlashMenu(true)
      setSlashFilter('')
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false)
    } else if (showSlashMenu && e.key === 'Enter') {
      e.preventDefault()
      const filteredCommands = slashCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
      )
      if (filteredCommands.length > 0) {
        filteredCommands[0].action(e.currentTarget)
        setShowSlashMenu(false)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !deal?.id) return

    setUploadingFile(true)
    try {
      // Upload file to Supabase storage
      const filePath = await DealDocumentService.uploadFile(file, deal.id)
      
      // Create document record
      const documentData = {
        deal_id: deal.id,
        name: file.name,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user?.id
      }
      
      await DealDocumentService.createDocument(documentData)
      await loadDocuments(deal.id)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteDocument = async (documentId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await DealDocumentService.deleteDocument(documentId)
      await DealDocumentService.deleteFile(filePath)
      if (deal?.id) {
        await loadDocuments(deal.id)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const handleDownloadDocument = async (filePath: string, fileName: string) => {
    try {
      const blob = await DealDocumentService.downloadFile(filePath)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const filteredSlashCommands = slashCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <>
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full bg-white shadow-xl z-50 flex flex-col"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {deal ? 'Edit Deal' : 'New Deal'}
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
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter deal title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <ClickableChipDropdown
              value={formData.status}
              options={statusOptions}
              onChange={(value) => handleInputChange('status', value)}
              placeholder="Select status"
            />
          </div>

          {/* Deal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              Deal Type
            </label>
            <ClickableChipDropdown
              value={formData.deal_type}
              options={dealTypeOptions}
              onChange={(value) => handleInputChange('deal_type', value)}
              placeholder="Select deal type"
            />
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Property Address
            </label>
            <input
              type="text"
              value={formData.property_address}
              onChange={(e) => handleInputChange('property_address', e.target.value)}
              placeholder="Enter property address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter price..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Commission
            </label>
            <input
              type="number"
              value={formData.commission}
              onChange={(e) => handleInputChange('commission', e.target.value)}
              placeholder="Enter commission amount..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Probability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Probability (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => handleInputChange('probability', e.target.value)}
              placeholder="Enter probability percentage..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expected Close Date
            </label>
            <input
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Contact
            </label>
            <select
              value={formData.contact_id}
              onChange={(e) => handleInputChange('contact_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Documents */}
          {deal?.id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Documents
              </label>
              
              {/* Upload Button */}
              <div className="mb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingFile ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                    <div className="flex items-center space-x-2 flex-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDownloadDocument(doc.file_path, doc.file_name)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description & Notes
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add description and notes... Type '/' for formatting options"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={8}
              />
            </div>
          </div>
        </div>

        {/* Slash Menu */}
        {showSlashMenu && (
          <div
            className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            style={{
              top: slashMenuPosition.top,
              left: slashMenuPosition.left,
              width: '250px'
            }}
          >
            {filteredSlashCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => {
                  if (textareaRef.current) {
                    command.action(textareaRef.current)
                  }
                  setShowSlashMenu(false)
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
              >
                {command.icon}
                <div>
                  <div className="text-sm font-medium">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
