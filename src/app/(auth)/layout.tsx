import Link from 'next/link';

import Logo from '@/components/common/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='flex flex-col items-center justify-center min-h-screen px-6 py-12'>
        {/* Logo */}
        <Link href='/' className='mb-8'>
          <Logo size='lg' />
        </Link>

        {/* Content */}
        <div className='w-full max-w-md'>{children}</div>
      </div>
    </div>
  );
}
