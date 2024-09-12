import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">
        Bring Your <span style={{ color: '#C43CCB' }}>Voice</span> to Life!
      </h1>
      <p className="home-description">
        Transform your conversation into smart AI solutions in seconds. No technical skills required.
      </p>
      <Link href="/phone" style={{zIndex:99}}>
        <button className="home-button">
          <img src="/phone.svg" alt="Phone Icon" />
          Let’s try Call Voice
        </button>
      </Link>
      {/* Tambahkan gambar PNG di bagian bawah */}
      <img 
        src="/home.png" 
        alt="Footer Image" 
        className="home-footer-image"
      />
    </div>
  );
}