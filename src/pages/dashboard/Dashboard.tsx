import React from 'react'
import {
  Users,
  Car,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const stats = [
  {
    title: 'Total Clients',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-primary-500',
    bgColor: 'bg-primary-100',
  },
  {
    title: 'Active Job Cards',
    value: '45',
    change: '+8%',
    icon: ClipboardList,
    color: 'text-secondary-500',
    bgColor: 'bg-secondary-100',
  },
  {
    title: 'Vehicles Serviced',
    value: '892',
    change: '+15%',
    icon: Car,
    color: 'text-success-500',
    bgColor: 'bg-success-100',
  },
  {
    title: 'Monthly Revenue',
    value: '$24,500',
    change: '+22%',
    icon: DollarSign,
    color: 'text-warning-500',
    bgColor: 'bg-warning-100',
  },
]

const recentJobCards = [
  {
    id: 'JC-001',
    client: 'John Doe',
    vehicle: '2020 Toyota Camry',
    status: 'in_progress',
    priority: true,
    dueDate: '2024-03-15',
  },
  {
    id: 'JC-002',
    client: 'Jane Smith',
    vehicle: '2019 Honda Civic',
    status: 'completed',
    priority: false,
    dueDate: '2024-03-14',
  },
  {
    id: 'JC-003',
    client: 'Mike Johnson',
    vehicle: '2021 Ford F-150',
    status: 'frozen',
    priority: true,
    dueDate: '2024-03-16',
  },
]

const upcomingAppointments = [
  {
    id: '1',
    client: 'Sarah Wilson',
    vehicle: '2022 BMW X3',
    time: '09:00 AM',
    service: 'Oil Change',
  },
  {
    id: '2',
    client: 'David Brown',
    vehicle: '2020 Audi A4',
    time: '11:00 AM',
    service: 'Brake Service',
  },
  {
    id: '3',
    client: 'Lisa Davis',
    vehicle: '2021 Mercedes C-Class',
    time: '02:00 PM',
    service: 'Annual Service',
  },
]

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your garage.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Cards */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Job Cards</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobCards.map((jobCard) => (
                <div key={jobCard.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{jobCard.id}</span>
                      {jobCard.priority && (
                        <AlertTriangle className="h-4 w-4 text-warning-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{jobCard.client}</p>
                    <p className="text-sm text-gray-500">{jobCard.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        jobCard.status === 'completed'
                          ? 'success'
                          : jobCard.status === 'in_progress'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {jobCard.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">Due: {jobCard.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <Calendar className="h-4 w-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-gray-600">{appointment.vehicle}</p>
                      <p className="text-sm text-gray-500">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary-600">{appointment.time}</p>
                    <CheckCircle className="h-4 w-4 text-success-500 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
