'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Globe, BookOpen, Plus, Trash2, Edit, Loader2, Lock, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default function NotesPage() {
    const [notes, setNotes] = useState<any[] | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [currentNote, setCurrentNote] = useState<any>(null)
    const [formData, setFormData] = useState({ title: '', content: '', is_public: false })
    const [error, setError] = useState('')

    // Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null)

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

    const handleOpenDialog = (note?: any) => {
        setError('')
        if (note) {
            setCurrentNote(note)
            setFormData({ title: note.title || '', content: note.content || '', is_public: note.is_public })
        } else {
            setCurrentNote(null)
            setFormData({ title: '', content: '', is_public: false })
        }
        setIsDialogOpen(true)
    }

    const handleSave = async (publish: boolean) => {
        setIsSaving(true)
        setError('')

        if (!formData.title.trim()) {
            setError('Title is required.')
            setIsSaving(false)
            return
        }

        const noteData = {
            title: formData.title,
            content: formData.content,
            is_public: publish,
            user_id: user?.id,
            modified_at: new Date().toISOString()
        }

        let error;
        if (currentNote?.id) {
            const result = await supabase.from('notes').update(noteData).eq('id', currentNote.id)
            error = result.error
        } else {
            const result = await supabase.from('notes').insert([noteData])
            error = result.error
        }

        if (!error) {
            await fetchData()
            setIsDialogOpen(false)
        } else {
            console.error(error)
            setError('Error saving note: ' + error.message)
        }
        setIsSaving(false)
    }

    const handleDeleteClick = (id: number) => {
        setNoteToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!noteToDelete) return

        const { error } = await supabase.from('notes').delete().eq('id', noteToDelete)
        if (!error) {
            fetchData()
            setIsDeleteDialogOpen(false)
            setNoteToDelete(null)
        } else {
            alert('Error deleting note: ' + error.message)
        }
    }

    const handleAddNoteClick = () => {
        if (!user) {
            router.push('/auth/login')
        } else {
            handleOpenDialog()
        }
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
                                    <NoteCard key={note.id} note={note} user={user} onEdit={handleOpenDialog} onDelete={handleDeleteClick} />
                                ))}
                            </div>

                            {/* Tablet/Desktop View (Masonry Grid) */}
                            <div className="hidden md:flex gap-4 items-start">
                                {/* Column 1 */}
                                <div className="flex-1 flex flex-col gap-4">
                                    {filteredNotes.filter((_, i) => i % 3 === 0).map(note => (
                                        <NoteCard key={note.id} note={note} user={user} onEdit={handleOpenDialog} onDelete={handleDeleteClick} />
                                    ))}
                                </div>
                                {/* Column 2 */}
                                <div className="flex-1 flex flex-col gap-4">
                                    {filteredNotes.filter((_, i) => i % 3 === 1).map(note => (
                                        <NoteCard key={note.id} note={note} user={user} onEdit={handleOpenDialog} onDelete={handleDeleteClick} />
                                    ))}
                                </div>
                                {/* Column 3 (Desktop Only - on tablet this col is valid but empty if we just use mod 3? 
                                    Wait, on tablet (2 cols) mod 3 distribution will look weird: Col 1, Col 2, Empty?
                                    Actually for true responsiveness we need a useWindowSize hook or just accept 3 cols on tablet is fine (just smaller).
                                    Let's stick to 3 columns for MD+ to keep it simple and consistent.
                                */}
                                <div className="flex-1 flex flex-col gap-4">
                                    {filteredNotes.filter((_, i) => i % 3 === 2).map(note => (
                                        <NoteCard key={note.id} note={note} user={user} onEdit={handleOpenDialog} onDelete={handleDeleteClick} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Note Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentNote ? 'Edit Note' : 'Create Note'}</DialogTitle>
                        <DialogDescription>
                            {currentNote ? 'Make changes to your note here.' : 'Add a new note to your included title and content.'}
                        </DialogDescription>
                    </DialogHeader>
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
                                className="min-h-[100px]"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                            {currentNote && formData.is_public ? 'Make Private' : 'Save as Private'}
                        </Button>
                        <Button onClick={() => handleSave(true)} disabled={isSaving}>
                            {currentNote && !formData.is_public ? 'Make Public' : 'Publish'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function NoteCard({ note, user, onEdit, onDelete }: { note: any, user: any, onEdit: (n: any) => void, onDelete: (id: number) => void }) {
    return (
        <div
            onClick={() => user && user.id === note.user_id && onEdit(note)}
            className={`group relative p-5 border rounded-2xl bg-card hover:border-muted-foreground/50 transition-colors duration-200 shadow-sm ${user && user.id === note.user_id ? 'cursor-pointer' : ''}`}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                    {note.title && <h3 className="font-semibold text-lg leading-tight">{note.title}</h3>}
                    {note.is_public ? (
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                </div>

                {note.content && (
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed line-clamp-[12]">
                        {note.content}
                    </p>
                )}
            </div>

            {/* Actions */}
            {user && user.id === note.user_id && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1 bg-card/80 backdrop-blur rounded-md p-1 shadow-sm border" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(note)}>
                        <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(note.id)}>
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            )}
        </div>
    )
}