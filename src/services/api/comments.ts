import { ApiService } from './base'
import { Comment } from '@/types'

export interface CreateCommentRequest {
    jobCardId: string
    employeeId: string
    comment: string
}

export interface UpdateCommentRequest {
    comment: string
}

export class CommentService extends ApiService {
    constructor() {
        super('/comments')
    }

    async getAll(): Promise<Comment[]> {
        return this.get<Comment[]>('/all')
    }

    async getById(commentId: string): Promise<Comment> {
        return this.get<Comment>(`/get/${commentId}`)
    }

    async getByJobCard(jobCardId: string): Promise<Comment[]> {
        const comments = await this.get<Comment[]>(`/get/jobCard/${jobCardId}`)

        // Sort comments by date (newest first for better UX)
        return comments.sort((a, b) => {
            const dateA = new Date(a.commentDate).getTime()
            const dateB = new Date(b.commentDate).getTime()
            return dateB - dateA // Newest first
        })
    }

    async create(comment: CreateCommentRequest): Promise<Comment> {
        return this.post<Comment>('/new', comment)
    }

    async update(commentId: string, comment: UpdateCommentRequest): Promise<Comment> {
        return this.put<Comment>(`/update/${commentId}`, comment)
    }

    async delete(commentId: string): Promise<string> {
        return super.delete<string>(`/delete/${commentId}`)
    }
}

export const commentService = new CommentService()