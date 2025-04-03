'use client'

import { SessionProvider } from 'next-auth/react'
import { CldUploadWidget } from 'next-cloudinary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CldUploadWidget
        uploadPreset="red-points"
        config={{
          cloud: {
            cloudName: 'doa0oydqn'
          }
        }}
        options={{
          maxFiles: 4,
          maxFileSize: 5000000,
          clientAllowedFormats: ['jpg', 'jpeg', 'png'],
          sources: ['local', 'camera'],
          resourceType: 'image'
        }}
      >
        {({ cloudinary, widget, open, results, error }) => (
          <>
            {children}
            {/* Bạn có thể sử dụng các props này để hiển thị widget hoặc xử lý kết quả */}
          </>
        )}
      </CldUploadWidget>
    </SessionProvider>
  )
} 