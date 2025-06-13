import { define, html, css, useState, useEffect, useStyle, useViewTransition, viewTransitionStyles } from "../../core/dim.ts";

const ViewTransitionsGallery = (props, { useState, useEffect, useStyle, useViewTransition, html, css }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use the new view transitions hook - transitionId is the current image index
  const transition = useViewTransition(currentIndex.toString(), {
    duration: 500,
    autoDirection: true
  });

  // Sample images for the gallery
  const images = [
    {
      id: 1,
      src: "https://picsum.photos/800/600?random=1",
      alt: "Beautiful landscape 1",
      title: "Mountain Vista"
    },
    {
      id: 2,
      src: "https://picsum.photos/800/600?random=2",
      alt: "Beautiful landscape 2",
      title: "Ocean Waves"
    },
    {
      id: 3,
      src: "https://picsum.photos/800/600?random=3",
      alt: "Beautiful landscape 3",
      title: "Forest Path"
    },
    {
      id: 4,
      src: "https://picsum.photos/800/600?random=4",
      alt: "Beautiful landscape 4",
      title: "Desert Sunset"
    },
    {
      id: 5,
      src: "https://picsum.photos/800/600?random=5",
      alt: "Beautiful landscape 5",
      title: "City Lights"
    }
  ];

  useStyle(css`
    /* Include view transition styles */
    ${viewTransitionStyles}
    
    .gallery-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .gallery-title {
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 2rem;
      color: #333;
    }

    .main-image-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      background: #000;
    }

    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 1;
      transform: translateX(0);
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .nav-button:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }

    .nav-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    .prev-button {
      left: 15px;
    }

    .next-button {
      right: 15px;
    }

    .image-title {
      position: absolute;
      bottom: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .thumbnail-container {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .thumbnail:hover {
      opacity: 1;
      transform: scale(1.05);
    }

    .thumbnail.active {
      border-color: #029cfd;
      opacity: 1;
      transform: scale(1.1);
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .control-button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .control-button:hover {
      background: #0278c7;
    }

    .control-button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .indicator-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot.active {
      background: #029cfd;
      transform: scale(1.2);
    }

    .dot:hover {
      background: #029cfd;
    }

    @media (max-width: 768px) {
      .gallery-container {
        padding: 1rem;
      }

      .main-image-container {
        height: 300px;
      }

      .nav-button {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      .thumbnail {
        width: 60px;
        height: 45px;
      }

      .controls {
        flex-direction: column;
        align-items: center;
      }
    }
  `);

  const nextImage = () => {
    if (transition.isTransitioning) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (transition.isTransitioning) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    if (transition.isTransitioning || index === currentIndex) return;
    setCurrentIndex(index);
  };

  const autoPlay = () => {
    if (!transition.isTransitioning) {
      nextImage();
    }
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      autoPlay();
    }, 4000);

    return () => clearInterval(interval);
  }, [transition.isTransitioning]);

  return html`
    <div class="gallery-container">
      <h2 class="gallery-title">🖼️ View Transitions Gallery</h2>
      
      <div class="main-image-container view-transition-container">
        <img 
          class="main-image view-transition-item ${transition.getTransitionClasses()}"
          src="${images[currentIndex].src}" 
          alt="${images[currentIndex].alt}"
          loading="lazy"
          style="${Object.entries(transition.getTransitionStyles()).map(([key, value]) => `${key}: ${value}`).join('; ')}"
        />
        
        <button 
          class="nav-button prev-button" 
          @click="${prevImage}"
          ?disabled="${transition.isTransitioning}"
        >‹</button>
        
        <button 
          class="nav-button next-button" 
          @click="${nextImage}"
          ?disabled="${transition.isTransitioning}"
        >›</button>
        
        <div class="image-title">
          ${images[currentIndex].title}
        </div>
      </div>

      <div class="indicator-dots">
        ${images.map((_, index) => html`
          <div 
            class="dot ${index === currentIndex ? 'active' : ''}"
            @click="${() => goToImage(index)}"
          ></div>
        `)}
      </div>

      <div class="thumbnail-container">
        ${images.map((image, index) => html`
          <img 
            class="thumbnail ${index === currentIndex ? 'active' : ''}"
            src="${image.src}" 
            alt="${image.alt}"
            @click="${() => goToImage(index)}"
            loading="lazy"
          />
        `)}
      </div>

      <div class="controls">
        <button class="control-button" @click="${prevImage}" ?disabled="${transition.isTransitioning}">
          ⏮️ Previous
        </button>
        <button class="control-button" @click="${nextImage}" ?disabled="${transition.isTransitioning}">
          Next ⏭️
        </button>
      </div>
      
      <!-- Debug info for the new view transitions API -->
      <div style="margin-top: 2rem; padding: 1rem; background: #e9ecef; border-radius: 8px; font-size: 0.875rem;">
        <strong>🔧 View Transitions Debug:</strong><br>
        Transitioning: ${transition.isTransitioning}<br>
        Direction: ${transition.direction}<br>
        Current ID: ${transition.currentId}<br>
        Previous ID: ${transition.previousId}<br>
        Classes: ${transition.getTransitionClasses('debug')}
      </div>
    </div>
  `;
};

define({ tag: 'view-transitions-gallery', component: ViewTransitionsGallery });

export default ViewTransitionsGallery;