import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './GeometricButton.css';

const HypersphereButton = ({ onClick }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame;
    let mouseX = 0;
    let mouseY = 0;
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Create particles
    const particlesContainer = container.querySelector('.inner-particles');
    if (particlesContainer) {
      const particleCount = 0; // Increased particle count
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position within sphere using improved distribution
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 40 + Math.random() * 25; // Increased radius range
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        particle.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        
        // Random animation delay and duration
        const delay = Math.random() * 4;
        const duration = 3 + Math.random() * 2;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
      }
    }
    
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    };

    const animate = () => {
      const hypersphere = container.querySelector('.hypersphere');
      if (hypersphere) {
        // Smooth rotation transition
        rotation.x += (mouseY * 40 - rotation.x) * 0.1;
        rotation.y += (mouseX * 40 - rotation.y) * 0.1;
        rotation.z += (mouseX * mouseY * 20 - rotation.z) * 0.05;
        
        // Apply complex 3D transformation
        hypersphere.style.transform = `
          rotateX(${rotation.x}deg) 
          rotateY(${rotation.y}deg)
          rotateZ(${rotation.z}deg)
          scale3d(
            ${1 + Math.abs(mouseX * 0.15)},
            ${1 + Math.abs(mouseY * 0.15)},
            ${1 + Math.abs((mouseX + mouseY) * 0.1)}
          )
        `;

        // Update particle positions based on mouse movement
        const particles = container.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
          const speed = 1 + (index % 3) * 0.2;
          const currentTransform = particle.style.transform;
          const match = currentTransform.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px,\s*([-\d.]+)px\)/);
          if (match) {
            const [, x, y, z] = match;
            particle.style.transform = `
              translate3d(
                ${parseFloat(x) + mouseX * speed}px,
                ${parseFloat(y) + mouseY * speed}px,
                ${parseFloat(z) + (mouseX + mouseY) * speed}px
              )
            `;
          }
        });
      }
      
      frame = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', handleMouseMove);
    frame = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button onClick={onClick} className="flex flex-col items-center group">
      <div ref={containerRef} className="geometric-shape-button mb-2">
        <div className="shape-container">
          <div className="hypersphere">
            {/* Multiple layers for depth */}
            <div className="sphere-layer"></div>
            <div className="sphere-layer"></div>
            <div className="sphere-layer"></div>
            <div className="sphere-layer"></div>
            <div className="sphere-layer"></div>
            {/* Particle container */}
            <div className="inner-particles"></div>
            {/* Core */}
            <div className="inner-core"></div>
          </div>
        </div>
      </div>
      <span className="geometric-text">
        Generate Report
      </span>
    </button>
  );
};

HypersphereButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default HypersphereButton; 