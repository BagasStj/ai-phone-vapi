import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#600160] to-[#0d000d] text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-8">Oops! Page not found</h2>
      <p className="text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="bg-[#C43CCB] hover:bg-[#a033a7] text-white font-bold py-2 px-4 rounded transition duration-300">
        Go back home
      </Link>
    </div>
  );
}