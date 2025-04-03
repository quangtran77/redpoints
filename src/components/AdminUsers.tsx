'use client'

import { useState, useEffect } from 'react'
import { Role } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { Spinner } from 'react-bootstrap'

interface User {
  id: string
  name: string | null
  email: string
  role: Role
  isBlocked: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModerator = async (email: string) => {
    try {
      setUpdating(email)
      const res = await fetch('/api/admin/set-moderator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role')
      }

      setUsers(users.map(user => 
        user.email === data.email ? data : user
      ))
      toast.success('Đã cập nhật quyền người dùng thành công')
    } catch (error: any) {
      console.error('Error updating user role:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật quyền người dùng')
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleBlock = async (email: string) => {
    try {
      setUpdating(email)
      const res = await fetch('/api/admin/block-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user status')
      }

      setUsers(users.map(user => 
        user.email === data.email ? data : user
      ))
      toast.success('Đã cập nhật trạng thái người dùng thành công')
    } catch (error: any) {
      console.error('Error updating user status:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-4">Quản lý người dùng</h2>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.isBlocked ? 'table-danger' : ''}>
                  <td>{user.name || 'Chưa có tên'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === Role.MODERATOR ? 'bg-success' : 'bg-secondary'}`}>
                      {user.role === Role.MODERATOR ? 'Điều phối viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isBlocked ? 'bg-danger' : 'bg-success'}`}>
                      {user.isBlocked ? 'Đã khóa' : 'Đang hoạt động'}
                    </span>
                  </td>
                  <td className="text-end">
                    {user.role !== Role.ADMIN && (
                      <div className="btn-group">
                        <button
                          onClick={() => handleToggleModerator(user.email)}
                          className={`btn btn-sm ${user.role === Role.MODERATOR ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          disabled={user.isBlocked || updating === user.email}
                        >
                          {updating === user.email ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            user.role === Role.MODERATOR ? 'Hủy quyền' : 'Thêm quyền'
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.email)}
                          className={`btn btn-sm ${user.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                          disabled={updating === user.email}
                        >
                          {updating === user.email ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            user.isBlocked ? 'Mở khóa' : 'Khóa'
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 