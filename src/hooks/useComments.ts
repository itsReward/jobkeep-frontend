// src/hooks/useComments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService, CreateCommentRequest, UpdateCommentRequest } from '@/services/api/comments'
import { Comment } from '@/types'
import toast from 'react-hot-toast'

// Query keys
export const commentKeys = {
    all: ['comments'] as const,
    lists: () => [...commentKeys.all, 'list'] as const,
    details: () => [...commentKeys.all, 'detail'] as const,
    detail: (id: string) => [...commentKeys.details(), id] as const,
    byJobCard: (jobCardId: string) => [...commentKeys.all, 'jobCard', jobCardId] as const,
}

// Get comments by job card ID
export const useCommentsByJobCard = (jobCardId: string) => {
    return useQuery({
        queryKey: commentKeys.byJobCard(jobCardId),
        queryFn: () => commentService.getByJobCard(jobCardId),
        enabled: !!jobCardId,
        staleTime: 30 * 1000, // 30 seconds (shorter for real-time feel)
        refetchInterval: 30 * 1000, // Poll every 30 seconds for real-time updates
        refetchOnWindowFocus: true,
    })
}

// Get single comment by ID
export const useComment = (commentId: string) => {
    return useQuery({
        queryKey: commentKeys.detail(commentId),
        queryFn: () => commentService.getById(commentId),
        enabled: !!commentId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// Create comment mutation
export const useCreateComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (comment: CreateCommentRequest) => commentService.create(comment),
        onSuccess: (newComment) => {
            // Invalidate comments for the job card to trigger refetch
            queryClient.invalidateQueries({
                queryKey: commentKeys.byJobCard(newComment.jobCardId)
            })

            // Add comment to cache optimistically
            queryClient.setQueryData(
                commentKeys.byJobCard(newComment.jobCardId),
                (oldComments: Comment[] | undefined) => {
                    if (!oldComments) return [newComment]
                    return [newComment, ...oldComments] // Add to top (newest first)
                }
            )

            toast.success('Comment added successfully!', {
                icon: '💬',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to add comment', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Update comment mutation
export const useUpdateComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ commentId, comment }: { commentId: string; comment: UpdateCommentRequest }) =>
            commentService.update(commentId, comment),
        onSuccess: (updatedComment) => {
            // Update comment in cache
            queryClient.setQueryData(commentKeys.detail(updatedComment.commentId), updatedComment)

            // Update the comment in the job card comments list
            queryClient.setQueryData(
                commentKeys.byJobCard(updatedComment.jobCardId),
                (oldComments: Comment[] | undefined) => {
                    if (!oldComments) return [updatedComment]
                    return oldComments.map(comment =>
                        comment.commentId === updatedComment.commentId ? updatedComment : comment
                    )
                }
            )

            toast.success('Comment updated successfully!', {
                icon: '✏️',
                style: {
                    borderRadius: '16px',
                    background: '#E3F2FD',
                    color: '#1976D2',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update comment', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}

// Delete comment mutation
export const useDeleteComment = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (commentId: string) => commentService.delete(commentId),
        onSuccess: (_, commentId) => {
            // Remove comment from all caches
            queryClient.removeQueries({ queryKey: commentKeys.detail(commentId) })

            // Remove from all job card comment lists
            queryClient.setQueriesData(
                { queryKey: commentKeys.all },
                (oldComments: Comment[] | undefined) => {
                    if (!oldComments) return []
                    return oldComments.filter(comment => comment.commentId !== commentId)
                }
            )

            toast.success('Comment deleted successfully!', {
                icon: '🗑️',
                style: {
                    borderRadius: '16px',
                    background: '#E8F5E8',
                    color: '#2E7D2E',
                }
            })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete comment', {
                icon: '❌',
                style: {
                    borderRadius: '16px',
                    background: '#FFEBEE',
                    color: '#C62828',
                }
            })
        },
    })
}