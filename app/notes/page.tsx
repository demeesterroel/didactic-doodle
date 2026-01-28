'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookOpen, Plus, Loader2, Globe } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { NoteCard } from '@/components/note/note-card'
import { DeleteNoteDialog } from '@/components/note/note-delete-dialog'

export default function NotesPage() {
    const [notes, setNotes] = useState<any[] | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    // Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    const fetchData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data, error } = await supabase.from('notes').select('*').order('modified_at', { ascending: false })
        if (data) setNotes(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDeleteClick = (id: number) => {
        setNoteToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!noteToDelete) return
        setIsDeleting(true)

        const { error } = await supabase.from('notes').delete().eq('id', noteToDelete)
        if (!error) {
            fetchData()
            setIsDeleteDialogOpen(false)
            setNoteToDelete(null)
        } else {
            alert('Error deleting note: ' + error.message)
        }
        setIsDeleting(false)
    }

    const handleAddNoteClick = () => {
        if (!user) {
            router.push('/auth/login')
        } else {
            router.push('/notes/add')
        }
    }

    const handleEditClick = (note: any) => {
        router.push(`/notes/${note.id}/edit`)
    }

    const handleNoteClick = (note: any) => {
        // Navigate to the note page (which will be intercepted by @modal)
        router.push(`/notes/${note.id}`)
    }

    // Filter logic
    const filteredNotes = notes?.filter(note => {
        const matchesSearch = Object.values(note).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
        let matchesTab = true;

        if (activeTab === 'public') {
            matchesTab = note.is_public === true
        } else if (activeTab === 'private') {
            matchesTab = note.is_public === false
        }

        return matchesSearch && matchesTab
    }) ?? []

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span>MemoPad</span>
                </div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
                            <LogoutButton />
                        </div>
                    ) : (
                        <Button asChild variant="default" className="rounded-full">
                            <Link href="/auth/login">Get Started</Link>
                        </Button>
                    )}
                </div>
            </header>

            <main className="flex-1 container max-w-5xl mx-auto px-6 py-12 flex flex-col gap-8">
                {/* Hero Section */}
                <section className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">Community Notes</h1>
                    <p className="text-muted-foreground text-lg">
                        {user ? 'Manage your private notes and contribute to the community.' : 'Sign in to create your own private or public notes.'}
                    </p>
                </section>

                {/* Toolbar */}
                <section className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10 bg-background/95 backdrop-blur py-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="public">Public</TabsTrigger>
                                {user && <TabsTrigger value="private">Private</TabsTrigger>}
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button onClick={handleAddNoteClick} className="rounded-full gap-2 shadow-sm whitespace-nowrap">
                            <Plus className="w-4 h-4" /> New Note
                        </Button>

                        <div className="w-full md:w-72">
                            <Input
                                placeholder="Search knowledge..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-full pl-4"
                            />
                        </div>
                    </div>
                </section>

                {/* Content Area */}
                <section className="flex-1 min-h-[400px]">
                    {filteredNotes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 border rounded-3xl bg-card/50">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                                <Globe className="w-8 h-8 text-muted-foreground/60" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold">Quiet in here...</h3>
                                <p className="text-muted-foreground">
                                    No notes found for this filter.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Mobile View (Single Column) */}
                            <div className="flex md:hidden flex-col gap-4">
                                {filteredNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        user={user}
                                        onEdit={handleEditClick}
                                        onDelete={handleDeleteClick}
                                        href={`/notes/${note.id}`}
                                    />
                                ))}
                            </div>

                            {/* Tablet/Desktop View (Masonry Grid) */}
                            <div className="hidden md:flex gap-4 items-start">
                                {[0, 1, 2].map(colIndex => (
                                    <div key={colIndex} className="flex-1 flex flex-col gap-4">
                                        {filteredNotes.filter((_, i) => i % 3 === colIndex).map(note => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                user={user}
                                                onEdit={handleEditClick}
                                                onDelete={handleDeleteClick}
                                                href={`/notes/${note.id}`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <DeleteNoteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}