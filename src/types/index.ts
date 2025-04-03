export type Role = 'DRIVER' | 'MODERATOR' | 'ADMIN'
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ReportCategory = 'ACCIDENT_PRONE' | 'TRAFFIC_VIOLATION' | 'ROAD_CONDITION' | 'POLICE_CHECKPOINT' | 'OTHER'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  emailVerified?: Date | null
  image?: string | null
  role: Role
  points: number
}

export interface Report {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string | null
  city?: string | null
  district?: string | null
  images: string[]
  status: ReportStatus
  category: ReportCategory
  createdAt: Date
  updatedAt: Date
  userId: string
  moderatorId?: string | null
  rejectionReason?: string | null
  user: User
  moderator?: User | null
} 