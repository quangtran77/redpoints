'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function NavBar() {
  const { data: session } = useSession()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand text-danger fw-bold">
          Red Points
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {session ? (
              <>
                {session.user?.role === 'ADMIN' && (
                  <li className="nav-item">
                    <Link href="/admin" className="nav-link">
                      Quản trị
                    </Link>
                  </li>
                )}
                {session.user?.role === 'MODERATOR' && (
                  <li className="nav-item">
                    <Link href="/moderator" className="nav-link">
                      Kiểm duyệt
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link href="/report" className="nav-link">
                    Báo cáo mới
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {session.user?.name || session.user?.email}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <button 
                        onClick={() => signOut()} 
                        className="dropdown-item text-danger"
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link 
                  href="/auth/signin" 
                  className="btn btn-danger rounded-pill px-4"
                >
                  Đăng nhập
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
} 