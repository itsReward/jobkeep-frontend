// src/components/modals/EmployeeFormModal.tsx
import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { EmployeeForm } from '@/components/forms/EmployeeForm'
import { Employee } from '@/types'

interface EmployeeFormModalProps {
    isOpen: boolean
    onClose: () => void
    employee?: Employee
    mode: 'create' | 'edit'
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        employee,
                                                                        mode,
                                                                    }) => {
    const title = mode === 'create' ? 'Create New Employee' : `Edit ${employee?.employeeName} ${employee?.employeeSurname}`

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="lg"
        >
            <EmployeeForm
                employee={employee}
                onSuccess={onClose}
                onCancel={onClose}
            />
        </Modal>
    )
}