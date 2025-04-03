'use client'

import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { ClientSafeProvider } from 'next-auth/react'

export default function SignInComponent({
  provider,
}: {
  provider: ClientSafeProvider
}) {
  return (
    <button
      onClick={() => signIn(provider.id, { callbackUrl: '/' })}
      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
    >
      <Image
        src="/google.svg"
        alt="Google Logo"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
      <span className="fw-medium">Tiếp tục với Google</span>
    </button>
  )
} 