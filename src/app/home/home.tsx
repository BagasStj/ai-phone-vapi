import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-container flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <h1 className="home-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-6">
        Bring Your <span style={{ color: '#C43CCB' }}>Voice</span> to Life!
      </h1>
      <p className="home-description text-base sm:text-lg md:text-xl text-center mb-8 sm:mb-10 max-w-2xl">
        Transform your conversation into smart AI solutions in seconds. No technical skills required.
      </p>
      <Link href="/phone" className="z-10">
        <button className="home-button flex items-center justify-center px-6 py-3 text-base sm:text-lg font-medium rounded-full transition duration-300 ease-in-out transform hover:scale-105">
          <img src="/phone.svg" alt="Phone Icon" className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
          Let&apos;s try Call Voice
        </button>
      </Link>
      <img 
        src="/home.png" 
        alt="Footer Image" 
        className="home-footer-image w-full max-w-4xl mt-8 sm:mt-12"
      />
    </div>
  );
}