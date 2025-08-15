// src/components/modals/QuotationFormModal.tsx
import React from 'react'
import { Modal } from '@/components/ui/Modal'
import QuotationForm from '@/components/forms/QuotationForm'
import { Quotation } from '@/types/quotation'

interface QuotationFormModalProps {
    isOpen: boolean
    onClose: () => void
    quotation?: Quotation
    mode: 'create' | 'edit'
}

export const QuotationFormModal: React.FC<QuotationFormModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          quotation,
                                                                          mode,
                                                                      }) => {
    const title = mode === 'create' ? 'Create New Quotation' : `Edit Quotation ${quotation?.quotationNumber}`

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="xl"
        >
            <QuotationForm
                quotation={quotation}
                onSuccess={onClose}
                onClose={onClose}
            />
        </Modal>
    )
}