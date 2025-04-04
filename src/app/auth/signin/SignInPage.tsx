'use client'

import { useEffect, useState } from 'react'
import { getProviders, ClientSafeProvider } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import SignInComponent from './SignInComponent'

const errorMessages: Record<string, string> = {
  AccessDenied: 'Bạn không có quyền truy cập. Chỉ những email được phép mới có thể đăng nhập.',
  Default: 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại sau.'
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    loadProviders()
  }, [])

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left side - Illustration */}
        <div className="col-lg-6 d-none d-lg-flex bg-light">
          <div className="d-flex flex-column justify-content-center p-5">
            <div className="mx-auto" style={{ maxWidth: '500px' }}>
              <h1 className="display-4 fw-bold mb-4">Red Points</h1>
              <p className="lead text-muted">
                Nền tảng báo cáo và quản lý vi phạm giao thông thông minh.
                Cùng chung tay xây dựng một cộng đồng giao thông an toàn và văn minh.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="col-lg-6 d-flex align-items-center">
          <div className="w-100 p-4 p-md-5">
            <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '400px' }}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="h3 fw-bold mb-2">Đăng nhập</h2>
                  <p className="text-muted">
                    Đăng nhập để tiếp tục với Red Points
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger mb-4" role="alert">
                    {errorMessages[error] || errorMessages.Default}
                  </div>
                )}

                <div className="d-grid gap-3">
                  {providers &&
                    Object.values(providers).map((provider) => (
                      <SignInComponent key={provider.id} provider={provider} />
                    ))}
                </div>

                <div className="mt-4 text-center">
                  <small className="text-muted">
                    Bằng việc đăng nhập, bạn đồng ý với{' '}
                    <a href="#" className="text-decoration-none">
                      điều khoản sử dụng
                    </a>{' '}
                    của chúng tôi
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 