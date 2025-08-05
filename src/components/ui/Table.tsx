import React from 'react'
import { cn } from '@/utils/cn'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('table', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export const TableHeader: React.FC<TableHeaderProps> = ({ className, children, ...props }) => {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

export const TableBody: React.FC<TableBodyProps> = ({ className, children, ...props }) => {
  return (
    <tbody className={cn('bg-white', className)} {...props}>
      {children}
    </tbody>
  )
}

export const TableRow: React.FC<TableRowProps> = ({ className, children, ...props }) => {
  return (
    <tr className={cn('hover:bg-gray-50', className)} {...props}>
      {children}
    </tr>
  )
}

export const TableHead: React.FC<TableHeadProps> = ({ className, children, ...props }) => {
  return (
    <th className={cn('table th', className)} {...props}>
      {children}
    </th>
  )
}

export const TableCell: React.FC<TableCellProps> = ({ className, children, ...props }) => {
  return (
    <td className={cn('table td', className)} {...props}>
      {children}
    </td>
  )
}
