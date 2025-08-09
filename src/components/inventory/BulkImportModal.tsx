import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { productService, supplierService } from '@/services/api/inventory'
import { BulkImportResult } from '@/types'

interface BulkImportModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'products' | 'suppliers'
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    type,
                                                                }) => {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
    const [step, setStep] = useState<'select' | 'upload' | 'result'>('select')

    // Import mutation
    const importMutation = useMutation({
        mutationFn: (file: File) => {
            return type === 'products'
                ? productService.bulkImport(file)
                : supplierService.bulkImport(file)
        },
        onSuccess: (result) => {
            setImportResult(result)
            setStep('result')
            queryClient.invalidateQueries({
                queryKey: type === 'products' ? ['products'] : ['suppliers']
            })

            if (result.errorCount === 0) {
                toast.success(`Successfully imported ${result.successCount} ${type}!`)
            } else {
                toast.warning(`Imported ${result.successCount} ${type} with ${result.errorCount} errors`)
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || `Failed to import ${type}`)
            setStep('select')
        },
    })

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                'application/vnd.ms-excel', // .xls
                'text/csv', // .csv
            ]

            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid Excel (.xlsx, .xls) or CSV file')
                return
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024 // 10MB
            if (file.size > maxSize) {
                toast.error('File size must be less than 10MB')
                return
            }

            setSelectedFile(file)
            setStep('upload')
        }
    }

    const handleUpload = () => {
        if (selectedFile) {
            importMutation.mutate(selectedFile)
        }
    }

    const handleDownloadTemplate = () => {
        // In a real implementation, this would download a template file
        const templateData = type === 'products'
            ? 'productCode,productName,description,unitPrice,costPrice,stockLevel,minStockLevel,supplierName\nOIL-5W30-4L,Engine Oil 5W-30 4L,Premium synthetic engine oil,45.99,32.50,50,10,AutoParts Pro'
            : 'supplierName,companyName,contactPerson,email,phone,address,paymentTerms,taxNumber\nAutoParts Pro,AutoParts Pro Ltd,John Smith,john@autopartspro.com,+1234567890,123 Industrial Drive,Net 30,123456789'

        const blob = new Blob([templateData], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_template.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
    }

    const handleClose = () => {
        setSelectedFile(null)
        setImportResult(null)
        setStep('select')
        onClose()
    }

    const formatFileSize = (bytes: number): string => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        if (bytes === 0) return '0 Bytes'
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Bulk Import ${type === 'products' ? 'Products' : 'Suppliers'}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Step 1: File Selection */}
                {step === 'select' && (
                    <div className="space-y-6">
                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Import Instructions
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-gray-600">
                                    <p className="mb-2">Follow these steps to import your {type}:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                        <li>Download the template file below</li>
                                        <li>Fill in your data following the template format</li>
                                        <li>Save as Excel (.xlsx) or CSV file</li>
                                        <li>Upload the file using the button below</li>
                                    </ol>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-800">
                                            <p className="font-medium">Important Notes:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li>Maximum file size: 10MB</li>
                                                <li>Supported formats: .xlsx, .xls, .csv</li>
                                                <li>Required fields must not be empty</li>
                                                <li>Duplicate codes will be skipped</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={handleDownloadTemplate}
                                    className="w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Template
                                </Button>
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Upload your file
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Click to select or drag and drop your file here
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4"
                                    >
                                        Select File
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Step 2: Confirm Upload */}
                {step === 'upload' && selectedFile && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium">Confirm Upload</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setStep('select')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        Ready to import your {type}. This process may take a few moments depending on file size.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setStep('select')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={importMutation.isPending}
                            >
                                {importMutation.isPending && <Loading size="sm" className="mr-2" />}
                                Start Import
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 'result' && importResult && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    {importResult.errorCount === 0 ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    )}
                                    Import Results
                                </h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-gray-900">{importResult.totalProcessed}</p>
                                        <p className="text-sm text-gray-600">Total Processed</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                                        <p className="text-sm text-gray-600">Successful</p>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">{importResult.errorCount}</p>
                                        <p className="text-sm text-gray-600">Errors</p>
                                    </div>
                                </div>

                                {/* Success Message */}
                                {importResult.errorCount === 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <p className="text-sm text-green-800 font-medium">
                                                All {type} imported successfully!
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Errors */}
                                {importResult.errorCount > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">Errors:</h4>
                                        <div className="max-h-40 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-3">
                                            {importResult.errors.map((error, index) => (
                                                <p key={index} className="text-sm text-red-800">
                                                    {error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}