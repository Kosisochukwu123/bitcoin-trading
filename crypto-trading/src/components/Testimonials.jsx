import { useState, useEffect, useRef } from "react";
import "./Testimonials.css";

// Modern SVG Icons
const Icons = {
  Star: ({ filled = false }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Quote: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 11H6C4.89543 11 4 11.8954 4 13V17C4 18.1046 4.89543 19 6 19H10C11.1046 19 12 18.1046 12 17V13C12 11.8954 11.1046 11 10 11ZM10 11C10 9 10 7 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 11H16C14.8954 11 14 11.8954 14 13V17C14 18.1046 14.8954 19 16 19H20C21.1046 19 22 18.1046 22 17V13C22 11.8954 21.1046 11 20 11ZM20 11C20 9 20 7 22 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Verified: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM16.78 9.705L11.11 15.375C10.9975 15.4875 10.8642 15.5772 10.7176 15.6392C10.571 15.7012 10.4139 15.7342 10.255 15.7364C10.0962 15.7386 9.93825 15.7099 9.79001 15.652C9.64176 15.5941 9.50604 15.5083 9.39038 15.3992L7.22038 13.2292C7.13077 13.1402 7.05949 13.0344 7.01077 12.9177C6.96206 12.8011 6.93698 12.6757 6.93698 12.5492C6.93698 12.4226 6.96206 12.2973 7.01077 12.1806C7.05949 12.0639 7.13077 11.9582 7.22038 11.8692C7.3094 11.7796 7.41513 11.7083 7.5318 11.6596C7.64846 11.6109 7.77382 11.5858 7.90038 11.5858C8.02694 11.5858 8.1523 11.6109 8.26896 11.6596C8.38563 11.7083 8.49136 11.7796 8.58038 11.8692L10.2154 13.4942L15.3454 8.36418C15.5255 8.18713 15.7677 8.08789 16.0198 8.08789C16.272 8.08789 16.5142 8.18713 16.6943 8.36418C16.7776 8.44643 16.8434 8.54456 16.8879 8.65255C16.9324 8.76053 16.9546 8.8761 16.953 8.99253C16.9513 9.10895 16.9258 9.2239 16.8782 9.33063C16.8306 9.43736 16.7619 9.53357 16.6762 9.61318L16.78 9.705Z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Location: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  Pause: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  Play: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
};

// Random avatar generator based on name
const getAvatarColor = (name) => {
  const colors = [
    "#f7931a", "#10b981", "#6366f1", "#ef4444", "#8b5cf6", 
    "#ec4899", "#06b6d4", "#f59e0b", "#84cc16", "#14b8a6"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Realistic testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: null,
    country: "United States",
    flag: "🇺🇸",
    message: "Absolutely love this platform! The interface is incredibly intuitive and the transaction speeds are unmatched. I've been trading crypto for 5 years and this is by far the best exchange I've used. The customer support team is also very responsive and helpful.",
    date: "2024-03-15",
    stars: 5,
    role: "Professional Trader",
    verified: true,
    volume: "$2.5M+ traded"
  },
  {
    id: 2,
    name: "David Chen",
    image: null,
    country: "Singapore",
    flag: "🇸🇬",
    message: "Great platform with low fees and excellent security features. The P2P trading option is a game-changer! I've recommended this to all my friends. The withdrawal process is smooth and typically completes within minutes.",
    date: "2024-03-10",
    stars: 5,
    role: "Crypto Enthusiast",
    verified: true,
    volume: "$850K+ traded"
  },
  {
    id: 3,
    name: "Maria Garcia",
    image: null,
    country: "Spain",
    flag: "🇪🇸",
    message: "The staking rewards are amazing! I'm earning passive income on my holdings. The mobile app is also very well designed. Finally a platform that makes crypto accessible to everyone.",
    date: "2024-03-05",
    stars: 5,
    role: "Investor",
    verified: false,
    volume: "$120K+ staked"
  },
  {
    id: 4,
    name: "James Wilson",
    image: null,
    country: "United Kingdom",
    flag: "🇬🇧",
    message: "Customer service is top-notch. Had an issue with a deposit and they resolved it within hours. The educational resources are also very helpful for beginners. Highly recommended!",
    date: "2024-02-28",
    stars: 4,
    role: "Beginner Trader",
    verified: true,
    volume: "$45K+ traded"
  },
  {
    id: 5,
    name: "Aisha Patel",
    image: null,
    country: "India",
    flag: "🇮🇳",
    message: "The advanced charting tools are exactly what I needed. Being able to trade with leverage has helped me maximize my returns. The platform is stable even during high volatility.",
    date: "2024-02-20",
    stars: 5,
    role: "Day Trader",
    verified: true,
    volume: "$1.2M+ traded"
  },
  {
    id: 6,
    name: "Lucas Silva",
    image: null,
    country: "Brazil",
    flag: "🇧🇷",
    message: "Finally a platform that supports my local payment methods! The P2P section has great liquidity and fair prices. Very satisfied with my experience so far.",
    date: "2024-02-15",
    stars: 4,
    role: "P2P Trader",
    verified: false,
    volume: "$230K+ traded"
  },
  {
    id: 7,
    name: "Emma Thompson",
    image: null,
    country: "Australia",
    flag: "🇦🇺",
    message: "The portfolio tracker is incredibly detailed. I love seeing all my assets in one place with real-time P&L updates. The security features give me peace of mind.",
    date: "2024-02-10",
    stars: 5,
    role: "Long-term Holder",
    verified: true,
    volume: "$500K+ held"
  },
  {
    id: 8,
    name: "Mohammed Al-Rashid",
    image: null,
    country: "UAE",
    flag: "🇦🇪",
    message: "Outstanding platform with institutional-grade features. The API is robust and the execution speed is phenomenal. Great for algorithmic trading strategies.",
    date: "2024-02-05",
    stars: 5,
    role: "Quant Trader",
    verified: true,
    volume: "$10M+ traded"
  },
  {
    id: 9,
    name: "Olga Petrov",
    image: null,
    country: "Germany",
    flag: "🇩🇪",
    message: "Very impressed with the earn products. The APY rates are competitive and the funds are always accessible. The interface is clean and easy to navigate.",
    date: "2024-01-28",
    stars: 4,
    role: "Saver",
    verified: false,
    volume: "$75K+ staked"
  },
  {
    id: 10,
    name: "Kenji Tanaka",
    image: null,
    country: "Japan",
    flag: "🇯🇵",
    message: "The futures trading experience is excellent. Low latency, deep order books, and great leverage options. The risk management tools are very helpful.",
    date: "2024-01-20",
    stars: 5,
    role: "Futures Trader",
    verified: true,
    volume: "$3.5M+ traded"
  }
];

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return "Today";
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="stars-container">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < rating ? "filled" : "empty"}`}>
          <Icons.Star filled={i < rating} />
        </span>
      ))}
    </div>
  );
};

// Single testimonial card component
const TestimonialCard = ({ testimonial }) => {
  const avatarColor = getAvatarColor(testimonial.name);
  const initial = testimonial.name.charAt(0);
  
  return (
    <div className="testimonial-card">
      {/* Quote icon */}
      <div className="quote-icon">
        <Icons.Quote />
      </div>
      
      {/* Message */}
      <p className="testimonial-message">"{testimonial.message}"</p>
      
      {/* User info section */}
      <div className="user-info">
        <div 
          className="user-avatar" 
          style={{ backgroundColor: avatarColor }}
        >
          {testimonial.image ? (
            <img src={testimonial.image} alt={testimonial.name} />
          ) : (
            <span className="avatar-initial">{initial}</span>
          )}
        </div>
        <div className="user-details">
          <div className="user-name-row">
            <span className="user-name">{testimonial.name}</span>
            {testimonial.verified && (
              <span className="verified-badge">
                <Icons.Verified />
              </span>
            )}
          </div>
          <div className="user-meta">
            <span className="user-role">{testimonial.role}</span>
            <span className="user-volume">{testimonial.volume}</span>
          </div>
          <div className="user-location">
            <span className="location-flag">{testimonial.flag}</span>
            <span className="location-country">{testimonial.country}</span>
          </div>
        </div>
      </div>
      
      {/* Footer with stars and date */}
      <div className="card-footer">
        <StarRating rating={testimonial.stars} />
        <div className="date-info">
          <Icons.Calendar />
          <span>{formatDate(testimonial.date)}</span>
        </div>
      </div>
    </div>
  );
};

// Main Testimonials Component
export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollSpeed = 1; // pixels per frame (60fps = 60px/sec)
  
  // Duplicate testimonials for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];
  
  // Manual navigation handlers
  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const newIndex = Math.max(0, currentIndex - 1);
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        left: newIndex * 320,
        behavior: "smooth"
      });
    }
  };
  
  const handleNext = () => {
    if (scrollContainerRef.current) {
      const maxIndex = testimonials.length - 1;
      const newIndex = Math.min(maxIndex, currentIndex + 1);
      setCurrentIndex(newIndex);
      scrollContainerRef.current.scrollTo({
        left: newIndex * 320,
        behavior: "smooth"
      });
    }
  };
  
  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let animationId;
    let lastTimestamp = 0;
    
    const scroll = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
        animationId = requestAnimationFrame(scroll);
        return;
      }
      
      // Calculate delta time for smooth scrolling
      const delta = Math.min(100, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      
      // Scroll by speed * (delta / 16.67) to maintain consistent speed across frame rates
      const scrollAmount = (scrollSpeed * delta) / 16.67;
      container.scrollLeft += scrollAmount;
      
      // Reset scroll position when reaching the end of the first set
      const maxScroll = container.scrollWidth / 3;
      if (container.scrollLeft >= maxScroll) {
        container.scrollLeft -= maxScroll;
      }
      
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused]);
  
  // Update current index based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const cardWidth = 320; // Approximate width of each card + gap
      const newIndex = Math.round(container.scrollLeft / cardWidth) % testimonials.length;
      setCurrentIndex(newIndex);
    };
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <section className="testimonials-section">
      {/* Background decoration */}
      <div className="testimonials-bg-glow"></div>
      <div className="testimonials-grid-bg"></div>
      
      {/* Section header */}
      <div className="testimonials-header">
        <div className="header-badge">
          <span>TESTIMONIALS</span>
        </div>
        <h2 className="testimonials-title">
          What Our <span className="accent">Traders</span> Say
        </h2>
        <p className="testimonials-subtitle">
          Join over 500 million users who trust CryptoX for their trading needs
        </p>
      </div>
      
      {/* Stats bar */}
      <div className="testimonials-stats">
        <div className="stat-item">
          <div className="stat-number">500M+</div>
          <div className="stat-label">Global Users</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">4.8</div>
          <div className="stat-label">Average Rating</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-number">150+</div>
          <div className="stat-label">Countries</div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="carousel-controls">
        <button 
          className="control-btn prev-btn" 
          onClick={handlePrev}
          aria-label="Previous testimonial"
        >
          <Icons.ChevronLeft />
        </button>
        
        <div className="carousel-status">
          <span className="current-index">{currentIndex + 1}</span>
          <span className="total-sep">/</span>
          <span className="total-count">{testimonials.length}</span>
        </div>
        
        <button 
          className="control-btn next-btn" 
          onClick={handleNext}
          aria-label="Next testimonial"
        >
          <Icons.ChevronRight />
        </button>
        
        <button 
          className={`control-btn pause-btn ${isPaused ? "paused" : ""}`}
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <Icons.Play /> : "Scroll"}
          {/* scroll */}
        </button>
      </div>
      
      {/* Scrolling carousel */}
      <div 
        className="testimonials-scroll-container" 
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="testimonials-track">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`} 
              className="testimonial-wrapper"
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Gradient overlays for smooth edges */}
      <div className="gradient-overlay left"></div>
      <div className="gradient-overlay right"></div>
      
      {/* Trust indicators */}
      <div className="trust-indicators">
        <div className="trust-item">
          <div className="trust-dot"></div>
          <span>100% Real Reviews</span>
        </div>
        <div className="trust-item">
          <div className="trust-dot"></div>
          <span>Verified Users</span>
        </div>
        <div className="trust-item">
          <div className="trust-dot"></div>
          <span>Updated Daily</span>
        </div>
      </div>
      
    </section>
  );
}