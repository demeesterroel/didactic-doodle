'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2, Globe, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { DeleteNoteDialog } from '@/components/note/note-delete-dialog'

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const supabase = createClient()
    const router = useRouter()
    const [note, setNote] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            console.log('Fetching note:', resolvedParams.id, 'User:', user?.id)

            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('id', resolvedParams.id)
                .single()

            if (data) {
                setNote(data)
            } else {
                console.error('Note not found error:', JSON.stringify(error, null, 2))
            }
            setLoading(false)
        }
        fetchData()
    }, [resolvedParams.id, supabase])

    const handleDelete = async () => {
        setIsDeleting(true)
        const { error } = await supabase.from('notes').delete().eq('id', note.id)
        if (!error) {
            router.push('/notes')
            router.refresh()
        } else {
            alert('Error deleting note')
        }
        setIsDeleting(false)
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

    const isOwner = user && user.id === note.user_id

    return (
        <div className="container max-w-2xl mx-auto py-12 px-6">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/notes">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Notes
                </Link>
            </Button>

            <article className="prose dark:prose-invert max-w-none">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-4xl font-bold mb-0">{note.title}</h1>
                    <div className="flex items-center gap-2">
                        {note.is_public ? (
                            <div className="flex items-center gap-1 text-muted-foreground text-sm bg-muted px-2 py-1 rounded-full">
                                <Globe className="w-3 h-3" /> Public
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-muted-foreground text-sm bg-muted px-2 py-1 rounded-full">
                                <Lock className="w-3 h-3" /> Private
                            </div>
                        )}
                    </div>
                </div>

                {isOwner && (
                    <div className="flex gap-2 mb-8 border-b pb-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/notes/${note.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </div>
                )}

                <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
                    {note.content}
                </div>
            </article>

            <DeleteNoteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}
