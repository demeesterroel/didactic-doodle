'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NoteFormData {
    title: string
    content: string
    is_public: boolean
}

interface NoteFormProps {
    initialData?: NoteFormData
    onSubmit: (data: NoteFormData) => Promise<void>
    submitLabel?: string // Defaults to 'Save'
    showPublicToggle?: boolean // Defaults to true
}

export function NoteForm({ initialData, onSubmit }: NoteFormProps) {
    const [formData, setFormData] = useState<NoteFormData>(initialData || { title: '', content: '', is_public: false })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Internal loading state
    const isLoading = isSubmitting

    const handleSubmit = async (publish: boolean) => {
        setError('')
        if (!formData.title.trim()) {
            setError('Title is required.')
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit({ ...formData, is_public: publish })
        } catch (e: any) {
            setError(e.message || 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Note title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={error && !formData.title.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    placeholder="Write your thoughts..."
                    className="min-h-[200px]"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isLoading}>
                    {formData.is_public ? 'Make Private' : 'Save as Private'}
                </Button>
                <Button onClick={() => handleSubmit(true)} disabled={isLoading}>
                    {!formData.is_public ? 'Make Public' : 'Publish'}
                </Button>
            </div>
        </div>
    )
}
