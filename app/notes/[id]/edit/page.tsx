'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { NoteForm } from '@/components/note/note-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const supabase = createClient()
    const router = useRouter()
    const [note, setNote] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNote = async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (data) {
                setNote(data)
            } else {
                // Handle 404
                console.error('Note not found', error)
            }
            setLoading(false)
        }
        fetchNote()
    }, [resolvedParams.id, supabase])

    const handleSubmit = async (data: any) => {
        const noteData = {
            ...data,
            modified_at: new Date().toISOString()
        }

        const { error } = await supabase.from('notes').update(noteData).eq('id', resolvedParams.id)

        if (error) {
            throw error
        }

        router.push('/notes')
        router.refresh()
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    if (!note) {
        return (
            <div className="container max-w-2xl mx-auto py-12 px-6 text-center">
                <h1 className="text-2xl font-bold">Note not found</h1>
                <Button className="mt-4" asChild><Link href="/notes">Back to Notes</Link></Button>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-6">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/notes">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Notes
                </Link>
            </Button>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Edit Note</h1>
                    <p className="text-muted-foreground">Make changes to your note.</p>
                </div>

                <div className="border rounded-2xl p-6 bg-card">
                    <NoteForm
                        initialData={{
                            title: note.title,
                            content: note.content,
                            is_public: note.is_public
                        }}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    )
}
