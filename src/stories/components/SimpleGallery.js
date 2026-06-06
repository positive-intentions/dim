import { define, html, css, useState, useEffect, useStyle } from "../../core/dim.ts";

const SimpleGallery = (props, { useState, useEffect, useStyle, html, css }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Emoji slides for the gallery (instant, no network load) so the automatic
  // transition is easy to see and test.
  const images = [
    { id: 1, emoji: "🏔️", title: "Mountain Vista", bg: "#dbeafe" },
    { id: 2, emoji: "🌊", title: "Ocean Waves", bg: "#cffafe" },
    { id: 3, emoji: "🌲", title: "Forest Path", bg: "#dcfce7" },
    { id: 4, emoji: "🏜️", title: "Desert Sunset", bg: "#fef3c7" },
    { id: 5, emoji: "🌃", title: "City Lights", bg: "#ede9fe" },
  ];

  useStyle(css`
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
      border-radius: 8px;
      margin-bottom: 1.5rem;
      background: #000;
    }

    .main-image {
      width: 100%;
      height: 100%;
      border-radius: 8px;
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
      margin-bottom: 1.5rem;
    }

    .thumbnail {
      width: 80px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      background: #e9ecef;
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

    .syntax-example {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #e9ecef;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .syntax-title {
      font-weight: bold;
      margin-bottom: 1rem;
      color: #333;
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
    }
  `);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return html`
    <div class="gallery-container">
      <h2 class="gallery-title">🚀 Auto View Transitions Gallery</h2>
      
      <!-- The magic happens here: just add transitionId prop! -->
      <simple-image 
        transitionId="${currentIndex}"
        transitionDuration="500"
        emoji="${images[currentIndex].emoji}"
        title="${images[currentIndex].title}"
        bg="${images[currentIndex].bg}"
      ></simple-image>

      <div class="thumbnail-container">
        ${images.map((image, index) => html`
          <div 
            class="thumbnail ${index === currentIndex ? 'active' : ''}"
            role="button"
            aria-label="${image.title}"
            @click="${() => goToImage(index)}"
          >${image.emoji}</div>
        `)}
      </div>

      <div class="controls">
        <button class="control-button" @click="${prevImage}">
          ⏮️ Previous
        </button>
        <button class="control-button" @click="${nextImage}">
          Next ⏭️
        </button>
      </div>

      <div class="syntax-example">
        <div class="syntax-title">✨ Framework Magic - No Manual Transition Code!</div>
        <div>
          &lt;simple-image <br>
          &nbsp;&nbsp;transitionId="\${currentIndex}"<br>
          &nbsp;&nbsp;transitionDuration="500"<br>
          &nbsp;&nbsp;emoji="\${image.emoji}"<br>
          &nbsp;&nbsp;title="\${image.title}"<br>
          &gt;&lt;/simple-image&gt;
        </div>
        <br>
        <div><strong>That's it!</strong> The framework automatically handles:</div>
        <div>• Transition detection when transitionId changes</div>
        <div>• Direction calculation (left/right based on ID comparison)</div>
        <div>• CSS class application</div>
        <div>• Wrapper elements</div>
        <div>• Animation timing</div>
      </div>
    </div>
  `;
};

// Simple emoji slide that will automatically get view transitions
const SimpleImage = (props, { html }) => {
  const { emoji, title, bg } = props;
  
  return html`
    <div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden; background: ${bg || '#dbeafe'}; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 9rem; line-height: 1; user-select: none;">${emoji}</span>
      <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0, 0, 0, 0.7); color: white; padding: 0.5rem 1rem; border-radius: 4px; font-size: 1.1rem; font-weight: 600;">
        ${title}
      </div>
    </div>
  `;
};

define({ tag: 'simple-gallery', component: SimpleGallery });
define({ tag: 'simple-image', component: SimpleImage });

export default SimpleGallery;