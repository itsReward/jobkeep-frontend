// src/components/forms/JobCardForm.tsx
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { X, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { CreateJobCardRequest } from '@/services/api/jobCards'
import { useCreateJobCard, useUpdateJobCard } from '@/hooks/useJobCards'
import { useClients } from '@/hooks/useClients'
import { useVehiclesByClient } from '@/hooks/useVehicles'
import { useEmployees } from '@/hooks/useEmployees'
import { useAuthLogic } from '@/hooks/useAuth'
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
    const { user } = useAuthLogic()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        watch,
        control,
        setValue,
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
            dateAndTimeIn: '',
        },
    })

    const selectedClientId = watch('clientId')
    const selectedVehicleId = watch('vehicleId')
    const currentJobCardName = watch('jobCardName')

    const { data: clients = [], isLoading: clientsLoading } = useClients()
    const { data: vehicles = [], isLoading: vehiclesLoading } = useVehiclesByClient(selectedClientId)
    const { data: employees = [], isLoading: employeesLoading } = useEmployees()

    // Auto-generate job card name
    useEffect(() => {
        if (!isEditing && selectedClientId && selectedVehicleId) {
            const client = clients.find(c => c.id === selectedClientId)
            const vehicle = vehicles.find(v => v.id === selectedVehicleId)

            if (client && vehicle) {
                const initial = client.clientName.charAt(0).toUpperCase()
                const surname = client.clientSurname
                const model = vehicle.model
                const generatedName = `${initial} ${surname}'s ${model}`
                
                // Only set if current name is empty or matches a previous auto-generation pattern
                // To avoid overwriting user manual entry if they changed it
                if (!currentJobCardName || currentJobCardName.includes("'s")) {
                    setValue('jobCardName', generatedName)
                }
            }
        }
    }, [selectedClientId, selectedVehicleId, clients, vehicles, isEditing, setValue])

    const clientOptions = clients.map(c => ({
        value: c.id,
        label: `${c.clientName} ${c.clientSurname}`
    }))

    const vehicleOptions = vehicles.map(v => ({
        value: v.id,
        label: `${v.make} ${v.model} (${v.regNumber})`
    }))

    const serviceAdvisorOptions = employees
        .filter(e => e.employeeRole === 'serviceAdvisor')
        .map(e => ({
            value: e.id,
            label: `${e.employeeName} ${e.employeeSurname}`
        }))

    const supervisorOptions = employees
        .filter(e => e.employeeRole === 'supervisor')
        .map(e => ({
            value: e.id,
            label: `${e.employeeName} ${e.employeeSurname}`
        }))

    // Default Service Advisor to current user if they are a SERVICE_ADVISOR
    useEffect(() => {
        if (!isEditing && user && user.userRole === 'serviceAdvisor' && user.employeeId) {
            setValue('serviceAdvisorId', user.employeeId)
        }
    }, [isEditing, user, setValue])

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
                dateAndTimeIn: jobCard.dateAndTimeIn ? jobCard.dateAndTimeIn.substring(0, 16) : '',
            })
        }
    }, [jobCard, reset])

    const onSubmit = async (data: FormData) => {
        try {
            const formattedData: CreateJobCardRequest = {
                ...data,
                jobCardDeadline: `${data.jobCardDeadline}T23:59:59`,
                estimatedTimeOfCompletion: `${data.estimatedTimeOfCompletion}T17:00:00`,
                dateAndTimeIn: data.dateAndTimeIn ? `${data.dateAndTimeIn}:00` : undefined,
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
                            {isEditing ? (
                                <Input
                                    label="Client"
                                    placeholder="Select client"
                                    value={jobCard?.clientName}
                                    disabled={true}
                                />
                            ) : (
                                <Controller
                                    name="clientId"
                                    control={control}
                                    rules={{ required: 'Client is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Client *"
                                            placeholder="Search client..."
                                            options={clientOptions}
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                setValue('vehicleId', '') // Reset vehicle when client changes
                                            }}
                                            error={errors.clientId?.message}
                                            isLoading={clientsLoading}
                                        />
                                    )}
                                />
                            )}

                            {isEditing ? (
                                <Input
                                    label="Vehicle"
                                    placeholder="Select vehicle"
                                    value={jobCard?.vehicleName}
                                    disabled={true}
                                />
                            ) : (
                                <Controller
                                    name="vehicleId"
                                    control={control}
                                    rules={{ required: 'Vehicle is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Vehicle *"
                                            placeholder={selectedClientId ? "Search vehicle..." : "Select client first"}
                                            options={vehicleOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            error={errors.vehicleId?.message}
                                            disabled={!selectedClientId}
                                            isLoading={vehiclesLoading}
                                        />
                                    )}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {isEditing ? (
                                <Input
                                    label="Service Advisor"
                                    placeholder="Select service advisor"
                                    value={jobCard?.serviceAdvisorName}
                                    disabled={true}
                                />
                            ) : (
                                <Controller
                                    name="serviceAdvisorId"
                                    control={control}
                                    rules={{ required: 'Service advisor is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Service Advisor *"
                                            placeholder="Search service advisor..."
                                            options={serviceAdvisorOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            error={errors.serviceAdvisorId?.message}
                                            isLoading={employeesLoading}
                                        />
                                    )}
                                />
                            )}

                            {isEditing ? (
                                <Input
                                    label="Supervisor"
                                    placeholder="Select supervisor"
                                    value={jobCard?.supervisorName}
                                    disabled={true}
                                />
                            ) : (
                                <Controller
                                    name="supervisorId"
                                    control={control}
                                    rules={{ required: 'Supervisor is required' }}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            label="Supervisor *"
                                            placeholder="Search supervisor..."
                                            options={supervisorOptions}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            error={errors.supervisorId?.message}
                                            isLoading={employeesLoading}
                                        />
                                    )}
                                />
                            )}
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

                        <Input
                            label="Date and Time In"
                            type="datetime-local"
                            {...register('dateAndTimeIn')}
                            disabled={isEditing && !!jobCard?.dateAndTimeIn}
                            error={errors.dateAndTimeIn?.message}
                        />

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