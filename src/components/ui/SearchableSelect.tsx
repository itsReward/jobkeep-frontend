
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Option {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    label?: string
    error?: string
    disabled?: boolean
    className?: string
    isLoading?: boolean
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
                                                                      options,
                                                                      value,
                                                                      onValueChange,
                                                                      placeholder = 'Select an option...',
                                                                      label,
                                                                      error,
                                                                      disabled = false,
                                                                      className,
                                                                      isLoading = false
                                                                  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue)
        setIsOpen(false)
        setSearchTerm('')
    }

    const toggleOpen = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 0)
            }
        }
    }

    return (
        <div className={cn("space-y-1 w-full", className)} ref={containerRef}>
            {label && (
                <label className="label block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={toggleOpen}
                    disabled={disabled}
                    className={cn(
                        "input flex items-center justify-between w-full text-left",
                        disabled && "bg-gray-50 cursor-not-allowed opacity-60",
                        error && "border-error-500 focus:border-error-500 focus:ring-error-500"
                    )}
                >
                    <span className={cn("truncate", !selectedOption && "text-gray-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full text-sm border-none focus:ring-0 p-1"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <X className="h-3 w-3 text-gray-400" />
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto py-1">
                            {isLoading ? (
                                <div className="px-3 py-2 text-sm text-gray-500 italic">Loading...</div>
                            ) : filteredOptions.length > 0 ? (
                                filteredOptions.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={cn(
                                            "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between",
                                            option.value === value && "bg-primary-50 text-primary-600"
                                        )}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={() => {
                                            handleSelect(option.value)
                                        }}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {option.value === value && <Check className="h-4 w-4" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="error-text text-xs text-error-500">{error}</p>}
            
        </div>
    )
}