import React from 'react'
import { X, Clock, User, FileText, Calendar } from 'lucide-react'
import { Timesheet } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface TimesheetModalProps {
    timesheet: Timesheet
    isOpen: boolean
    onClose: () => void
}

export const TimesheetModal: React.FC<TimesheetModalProps> = ({
                                                                  timesheet,
                                                                  isOpen,
                                                                  onClose
                                                              }) => {
    if (!isOpen) return null

    // Safe date parsing
    const safeParseDate = (dateString: string): Date | null => {
        try {
            const date = new Date(dateString)
            return isNaN(date.getTime()) ? null : date
        } catch {
            return null
        }
    }

    // Safe date formatting
    const formatSafeDate = (date: Date | null): string => {
        if (!date) return 'Invalid Date'
        try {
            return date.toLocaleString()
        } catch {
            return 'Invalid Date'
        }
    }

    const clockInDate = safeParseDate(timesheet.clockInDateAndTime)
    const clockOutDate = safeParseDate(timesheet.clockOutDateAndTime)

    // Calculate duration
    const durationMs = clockInDate && clockOutDate ?
        clockOutDate.getTime() - clockInDate.getTime() : 0
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    const durationHours = Math.floor(durationMinutes / 60)
    const remainingMinutes = durationMinutes % 60

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Timesheet Details</h2>
                        <p className="text-gray-600">{timesheet.sheetTitle}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Job Card</label>
                            <p className="text-gray-900 font-medium">{timesheet.jobCardName}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-600">Technician</label>
                            <p className="text-gray-900 font-medium">{timesheet.technicianName}</p>
                        </div>
                    </div>

                    {/* Time Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Time Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Clock In</label>
                                <p className="text-gray-900">{formatSafeDate(clockInDate)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Clock Out</label>
                                <p className="text-gray-900">{formatSafeDate(clockOutDate)}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Duration</label>
                                <p className="text-gray-900 font-semibold">
                                    {durationHours > 0 && `${durationHours}h `}
                                    {remainingMinutes > 0 && `${remainingMinutes}m`}
                                    {durationHours === 0 && remainingMinutes === 0 && '0m'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Hours Worked</label>
                                <p className="text-gray-900 font-semibold">{timesheet.hoursWorked || 0}h</p>
                            </div>
                        </div>
                    </div>

                    {/* Work Report */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4" />
                            Work Report
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {timesheet.report || 'No report provided'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {/* Add edit/delete buttons here if needed */}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TimesheetModal