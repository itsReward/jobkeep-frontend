import React, { useState, useRef, useEffect } from 'react'
import {
    MessageCircle,
    Send,
    Edit3,
    Trash2,
    Check,
    X,
    User,
    Clock
} from 'lucide-react'
import { Comment } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import {
    useCommentsByJobCard,
    useCreateComment,
    useUpdateComment,
    useDeleteComment
} from '@/hooks/useComments'

interface CommentsPanelProps {
    jobCardId: string
    currentUserId?: string // For determining if user can edit/delete
    currentUserRole?: string // For admin permissions
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
                                                                jobCardId,
                                                                currentUserId,
                                                                currentUserRole
                                                            }) => {
    const { data: comments, isLoading, error } = useCommentsByJobCard(jobCardId)
    const createComment = useCreateComment()
    const updateComment = useUpdateComment()
    const deleteComment = useDeleteComment()

    const [newComment, setNewComment] = useState('')
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
    const [editingText, setEditingText] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const editTextareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    const autoResize = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    useEffect(() => {
        if (textareaRef.current) {
            autoResize(textareaRef.current)
        }
    }, [newComment])

    useEffect(() => {
        if (editTextareaRef.current) {
            autoResize(editTextareaRef.current)
        }
    }, [editingText])

    // Handle new comment submission
    const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !currentUserId) return

        createComment.mutate({
            jobCardId,
            employeeId: currentUserId,
            comment: newComment.trim()
        })

        setNewComment('')
    }

    // Handle edit comment
    const handleEdit = (comment: Comment) => {
        setEditingCommentId(comment.commentId)
        setEditingText(comment.comment)
    }

    // Handle save edit
    const handleSaveEdit = (commentId: string) => {
        if (!editingText.trim()) return

        updateComment.mutate({
            commentId,
            comment: { comment: editingText.trim() }
        })

        setEditingCommentId(null)
        setEditingText('')
    }

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingCommentId(null)
        setEditingText('')
    }

    // Handle delete comment
    const handleDelete = (commentId: string) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteComment.mutate(commentId)
        }
    }

    // Check if user can edit/delete comment
    const canEditDelete = (comment: Comment) => {
        return currentUserId === comment.employeeId || currentUserRole === 'ADMIN'
    }

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

            if (diffDays === 0) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else if (diffDays === 1) {
                return 'Yesterday'
            } else if (diffDays < 7) {
                return `${diffDays} days ago`
            } else {
                return date.toLocaleDateString()
            }
        } catch {
            return 'Invalid date'
        }
    }

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments
                </h3>
                <p className="text-sm text-gray-600">
                    {comments?.length || 0} comment{comments?.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loading size="md" text="Loading comments..." />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Failed to load comments</p>
                    </div>
                ) : !comments || comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No comments yet</p>
                        <p className="text-sm text-gray-500">Be the first to add a comment</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment.commentId} className="shadow-sm">
                            <CardContent className="p-3">
                                {/* Comment Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {comment.employeeName}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(comment.commentDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {canEditDelete(comment) && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(comment)}
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                            >
                                                <Edit3 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(comment.commentId)}
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-error-600"
                                                disabled={deleteComment.isPending}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Comment Content */}
                                {editingCommentId === comment.commentId ? (
                                    <div className="space-y-2">
                    <textarea
                        ref={editTextareaRef}
                        value={editingText}
                        onChange={(e) => {
                            setEditingText(e.target.value)
                            autoResize(e.target)
                        }}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={2}
                        disabled={updateComment.isPending}
                    />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSaveEdit(comment.commentId)}
                                                disabled={updateComment.isPending || !editingText.trim()}
                                            >
                                                <Check className="h-3 w-3" />
                                                Save
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                disabled={updateComment.isPending}
                                            >
                                                <X className="h-3 w-3" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                        {comment.comment}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* New Comment Form */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-3">
          <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                  setNewComment(e.target.value)
                  autoResize(e.target)
              }}
              placeholder="Add a comment..."
              className="w-full p-3 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
              disabled={createComment.isPending}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSubmit(e)
                  }
              }}
          />
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={createComment.isPending || !newComment.trim()}
                    >
                        {createComment.isPending ? (
                            <Loading size="sm" />
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Add Comment
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CommentsPanel