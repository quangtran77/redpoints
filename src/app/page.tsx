'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session } = useSession()

  return (
    <main>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link href="/" className="navbar-brand text-danger">Red Points</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {session ? (
                <>
                  <li className="nav-item">
                    <Link href="/report" className="nav-link">Báo cáo điểm</Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/profile" className="nav-link">Hồ sơ</Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link href="/auth/signin" className="nav-link">Đăng nhập</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 mb-3">Chia sẻ điểm nguy hiểm trên đường</h1>
            <p className="lead mb-4">
              Giúp mọi người lái xe an toàn hơn bằng cách chia sẻ những điểm cần lưu ý trên đường đi của bạn.
            </p>
            {!session && (
              <Link href="/auth/signin" className="btn btn-danger btn-lg">
                Bắt đầu ngay
              </Link>
            )}
          </div>
          <div className="col-lg-6">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Báo cáo nhanh chóng</h5>
                    <p className="card-text">Chỉ cần vài bước đơn giản để chia sẻ thông tin về điểm nguy hiểm.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Cộng đồng tin cậy</h5>
                    <p className="card-text">Thông tin được xác thực bởi cộng đồng người dùng.</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Cập nhật liên tục</h5>
                    <p className="card-text">Thông tin về các điểm nguy hiểm được cập nhật thường xuyên.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 