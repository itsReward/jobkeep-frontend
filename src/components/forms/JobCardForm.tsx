// src/components/forms/JobCardForm.tsx
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { CreateJobCardRequest } from '@/services/api/jobCards'
import { useCreateJobCard, useUpdateJobCard } from '@/hooks/useJobCards'
import { JobCard } from '@/types'

interface JobCardFormProps {
    jobCard?: JobCard
    onClose: () => void
    onSuccess?: () => void
}

interface FormData extends CreateJobCardRequest {
    id?: string
}

export const JobCardForm: React.FC<JobCardFormProps> = ({
                                                            jobCard,
                                                            onClose,
                                                            onSuccess
                                                        }) => {
    const isEditing = !!jobCard
    const createJobCard = useCreateJobCard()
    const updateJobCard = useUpdateJobCard()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<FormData>({
        defaultValues: {
            jobCardName: '',
            vehicleId: '',
            clientId: '',
            serviceAdvisorId: '',
            supervisorId: '',
            estimatedTimeOfCompletion: '',
            priority: false,
            jobCardDeadline: '',
        },
    })

    // Populate form when editing
    useEffect(() => {
        if (jobCard) {
            reset({
                jobCardName: jobCard.jobCardName,
                vehicleId: jobCard.vehicleId,
                clientId: jobCard.clientId,
                serviceAdvisorId: jobCard.serviceAdvisorId,
                supervisorId: jobCard.supervisorId,
                estimatedTimeOfCompletion: jobCard.estimatedTimeOfCompletion.split('T')[0],
                priority: jobCard.priority,
                jobCardDeadline: jobCard.jobCardDeadline.split('T')[0],
            })
        }
    }, [jobCard, reset])

    const onSubmit = async (data: FormData) => {
        try {
            const formattedData: CreateJobCardRequest = {
                ...data,
                jobCardDeadline: `${data.jobCardDeadline}T23:59:59`,
                estimatedTimeOfCompletion: `${data.estimatedTimeOfCompletion}T17:00:00`,
            }

            if (isEditing && jobCard) {
                await updateJobCard.mutateAsync({
                    id: jobCard.id,
                    jobCard: formattedData,
                })
            } else {
                await createJobCard.mutateAsync(formattedData)
            }

            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    const watchPriority = watch('priority')

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Job Card' : 'Create New Job Card'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Job Card Name *"
                            placeholder="Enter job card name"
                            {...register('jobCardName', {
                                required: 'Job card name is required',
                                minLength: {
                                    value: 3,
                                    message: 'Job card name must be at least 3 characters',
                                },
                            })}
                            error={errors.jobCardName?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Client ID *"
                                placeholder="Select client"
                                {...register('clientId', {
                                    required: 'Client is required',
                                })}
                                error={errors.clientId?.message}
                            />

                            <Input
                                label="Vehicle ID *"
                                placeholder="Select vehicle"
                                {...register('vehicleId', {
                                    required: 'Vehicle is required',
                                })}
                                error={errors.vehicleId?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Service Advisor ID *"
                                placeholder="Select service advisor"
                                {...register('serviceAdvisorId', {
                                    required: 'Service advisor is required',
                                })}
                                error={errors.serviceAdvisorId?.message}
                            />

                            <Input
                                label="Supervisor ID *"
                                placeholder="Select supervisor"
                                {...register('supervisorId', {
                                    required: 'Supervisor is required',
                                })}
                                error={errors.supervisorId?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Estimated Completion Date *"
                                type="date"
                                {...register('estimatedTimeOfCompletion', {
                                    required: 'Estimated completion date is required',
                                })}
                                error={errors.estimatedTimeOfCompletion?.message}
                            />

                            <Input
                                label="Job Card Deadline *"
                                type="date"
                                {...register('jobCardDeadline', {
                                    required: 'Job card deadline is required',
                                })}
                                error={errors.jobCardDeadline?.message}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                            <input
                                type="checkbox"
                                id="priority"
                                {...register('priority')}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <AlertTriangle className={`h-4 w-4 ${watchPriority ? 'text-warning-500' : 'text-gray-400'}`} />
                                Mark as Priority Job Card
                            </label>
                        </div>

                        {watchPriority && (
                            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                                <p className="text-sm text-warning-700">
                                    Priority job cards will be highlighted and shown at the top of lists.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                <Save className="h-4 w-4" />
                                {isEditing ? 'Update Job Card' : 'Create Job Card'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default JobCardForm