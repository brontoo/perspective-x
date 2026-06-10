import React, { useRef, useEffect } from 'react';

/**
 * GasParticleSimulation - A canvas-based simulation of gas particles demonstrating gas laws
 * 
 * @param {Object} props - Component properties
 * @param {number} props.temperature - Temperature in Kelvin, affects particle speed
 * @param {number} props.pressure - Pressure in kPa, affects number of particles
 * @param {number} props.volume - Volume in liters, affects container width
 * @param {string} props.lawType - Gas law being demonstrated ('boyle', 'charles', 'gayLussac')
 * @returns {JSX.Element} Canvas element with animated gas particle simulation
 */
const GasParticleSimulation = ({ temperature = 300, pressure = 100, volume = 4.0, lawType = 'boyle' }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Simulation parameters
    const particleCount = Math.floor(pressure / 10);
    const particleSpeed = temperature / 100;
    const containerWidth = (volume / 4) * canvas.width;
    const containerHeight = canvas.height;
    const containerX = (canvas.width - containerWidth) / 2;
    
    // Particle class
    class Particle {
      constructor() {
        this.x = containerX + Math.random() * containerWidth;
        this.y = Math.random() * containerHeight;
        this.vx = (Math.random() - 0.5) * particleSpeed;
        this.vy = (Math.random() - 0.5) * particleSpeed;
      }
      
      update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Wall collisions
        if (this.x < containerX || this.x > containerX + containerWidth) {
          this.vx *= -1;
        }
        if (this.y < 0 || this.y > containerHeight) {
          this.vy *= -1;
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    }
    
    // Create particles
    const particles = Array.from({ length: particleCount }, () => new Particle());
    
    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw container
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(containerX, 0, containerWidth, containerHeight);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [temperature, pressure, volume, lawType]);

  return (
    <canvas 
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-auto bg-white"
    />
  );
};

export default GasParticleSimulation;
