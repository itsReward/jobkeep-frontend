// src/components/ui/Dropdown.tsx

import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { ChevronDown, Check } from 'lucide-react'

// Dropdown Context
interface DropdownContextType {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    closeDropdown: () => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined)

const useDropdown = () => {
    const context = useContext(DropdownContext)
    if (!context) {
        throw new Error('Dropdown components must be used within a Dropdown')
    }
    return context
}

// Main Dropdown Component
interface DropdownProps {
    children: React.ReactNode
    className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({ children, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const closeDropdown = () => setIsOpen(false)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDropdown()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen])

    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen, closeDropdown }}>
            <div ref={dropdownRef} className={`relative inline-block ${className}`}>
                {children}
            </div>
        </DropdownContext.Provider>
    )
}

// Dropdown Trigger Component
interface DropdownTriggerProps {
    children: React.ReactNode
    className?: string
    asChild?: boolean
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
                                                                    children,
                                                                    className = '',
                                                                    asChild = false
                                                                }) => {
    const { isOpen, setIsOpen } = useDropdown()

    const handleClick = () => {
        setIsOpen(!isOpen)
    }

    if (asChild) {
        return React.cloneElement(children as React.ReactElement, {
            onClick: handleClick,
            className: `${(children as React.ReactElement).props.className} ${className}`,
            'aria-expanded': isOpen,
            'aria-haspopup': true
        })
    }

    return (
        <button
            onClick={handleClick}
            className={`
        inline-flex items-center justify-between gap-2 px-4 py-2
        bg-white border border-gray-300 rounded-lg
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        transition-colors duration-200
        ${className}
      `}
            aria-expanded={isOpen}
            aria-haspopup={true}
        >
            {children}
            <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
    )
}

// Dropdown Content Component
interface DropdownContentProps {
    children: React.ReactNode
    className?: string
    align?: 'start' | 'end' | 'center'
    side?: 'bottom' | 'top'
    sideOffset?: number
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
                                                                    children,
                                                                    className = '',
                                                                    align = 'start',
                                                                    side = 'bottom',
                                                                    sideOffset = 4
                                                                }) => {
    const { isOpen } = useDropdown()

    if (!isOpen) return null

    const alignmentClasses = {
        start: 'left-0',
        end: 'right-0',
        center: 'left-1/2 -translate-x-1/2'
    }

    const sideClasses = {
        bottom: `top-full mt-${sideOffset}`,
        top: `bottom-full mb-${sideOffset}`
    }

    return (
        <div
            className={`
        absolute z-50 min-w-[12rem] overflow-hidden
        bg-white border border-gray-200 rounded-lg shadow-lg
        animate-in fade-in-0 zoom-in-95 duration-200
        ${alignmentClasses[align]}
        ${sideClasses[side]}
        ${className}
      `}
        >
            <div className="py-1">
                {children}
            </div>
        </div>
    )
}

// Dropdown Item Component
interface DropdownItemProps {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    disabled?: boolean
    destructive?: boolean
    selected?: boolean
    icon?: React.ReactNode
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
                                                              children,
                                                              onClick,
                                                              className = '',
                                                              disabled = false,
                                                              destructive = false,
                                                              selected = false,
                                                              icon
                                                          }) => {
    const { closeDropdown } = useDropdown()

    const handleClick = () => {
        if (!disabled && onClick) {
            onClick()
            closeDropdown()
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`
        w-full flex items-center gap-2 px-3 py-2 text-left text-sm
        transition-colors duration-150
        ${!disabled && !destructive
                ? 'hover:bg-gray-100 focus:bg-gray-100 text-gray-900'
                : ''
            }
        ${destructive && !disabled
                ? 'hover:bg-red-50 focus:bg-red-50 text-red-600'
                : ''
            }
        ${disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'cursor-pointer focus:outline-none'
            }
        ${selected ? 'bg-blue-50 text-blue-600' : ''}
        ${className}
      `}
        >
            {icon && (
                <span className="flex-shrink-0">
          {icon}
        </span>
            )}
            <span className="flex-1 truncate">
        {children}
      </span>
            {selected && (
                <Check size={16} className="flex-shrink-0 text-blue-600" />
            )}
        </button>
    )
}

// Dropdown Separator Component
export const DropdownSeparator: React.FC<{ className?: string }> = ({ className = '' }) => {
    return <hr className={`my-1 border-gray-200 ${className}`} />
}

// Dropdown Label Component
interface DropdownLabelProps {
    children: React.ReactNode
    className?: string
}

export const DropdownLabel: React.FC<DropdownLabelProps> = ({ children, className = '' }) => {
    return (
        <div className={`px-4 py-24 text-xs font-semibold text-gray-500 uppercase tracking-wide ${className}`}>
            {children}
        </div>
    )
}

// Select-style Dropdown Component
interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    children: React.ReactNode
    className?: string
    disabled?: boolean
}

export const Select: React.FC<SelectProps> = ({
                                                  value,
                                                  onValueChange,
                                                  placeholder = 'Select an option...',
                                                  children,
                                                  className = '',
                                                  disabled = false
                                              }) => {
    const [selectedLabel, setSelectedLabel] = useState<string>(placeholder)

    // Extract options from children to find selected label
    useEffect(() => {
        if (value) {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child) && child.props.value === value) {
                    setSelectedLabel(child.props.children)
                }
            })
        } else {
            setSelectedLabel(placeholder)
        }
    }, [value, children, placeholder])

    return (
        <Dropdown className={className}>
            <DropdownTrigger
                className={`
          w-full justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedLabel}
        </span>
            </DropdownTrigger>
            <DropdownContent className="w-full">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            onClick: () => {
                                if (onValueChange && child.props.value) {
                                    onValueChange(child.props.value)
                                }
                            },
                            selected: child.props.value === value
                        })
                    }
                    return child
                })}
            </DropdownContent>
        </Dropdown>
    )
}

// Select Option Component
interface SelectOptionProps {
    value: string
    children: React.ReactNode
    onClick?: () => void
    selected?: boolean
}

export const SelectOption: React.FC<SelectOptionProps> = ({ value, children, onClick, selected }) => {
    return (
        <DropdownItem onClick={onClick} selected={selected}>
            {children}
        </DropdownItem>
    )
}