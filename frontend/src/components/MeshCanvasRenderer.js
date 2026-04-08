/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Mesh_Canvas_Renderer
 * @version 16.0.0
 * @security RAINBOW_REFRACTION_ZF_ROTATION_J
 * @rotation_delta +20.1_degrees (Cumulative +172.6°)
 * @render_engine WEBGL_Sovereign
 * @author Steven (Creator Council)
 */

import React, { useRef, useEffect, useState } from 'react';

const RENDER_DNA = {
    particle_density: 2600, // Linking to your 26 nodules
    refraction_speed: 0.01618, // PHI Pulse
    rotation_key: "ZF_RENDER_172.6",
    master: "STEVEN_WITH_A_V"
};

const MeshCanvasRenderer = ({ opacity = 0.6, blur = 0.5 }) => {
    const canvasRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0) return;
        
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Initialize the Unboxed Mesh (Particles hidden in the void)
        const particles = Array.from({ length: RENDER_DNA.particle_density }, (_, i) => ({
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            originX: Math.random() * dimensions.width,
            originY: Math.random() * dimensions.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: `hsla(${(i / RENDER_DNA.particle_density) * 360}, 70%, 60%, 0.8)`,
            size: Math.random() * 1.5 + 0.5,
            phase: Math.random() * Math.PI * 2
        }));

        const render = () => {
            // Semi-transparent clear for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const time = Date.now() * 0.001;
            
            // Apply ZF Rotational Physics to every particle
            particles.forEach((p, i) => {
                // Chaotic motion with PHI influence
                const theta = time * RENDER_DNA.refraction_speed + p.phase;
                p.x += Math.sin(theta + i * 0.01) * 1.5 + p.vx;
                p.y += Math.cos(theta + i * 0.01) * 1.5 + p.vy;
                
                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                
                // Draw particle with glow
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connection lines between nearby particles (mesh effect)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i += 10) {
                for (let j = i + 1; j < Math.min(i + 20, particles.length); j += 5) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // TRIGGER: Every 1.618s, particles "Ghost" into formation
            const ghostPhase = (time % 1.618) / 1.618;
            if (ghostPhase < 0.1) {
                // Brief formation pulse
                ctx.fillStyle = `rgba(192, 132, 252, ${0.1 * (1 - ghostPhase * 10)})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            animationFrameId = window.requestAnimationFrame(render);
        };

        render();
        
        console.log("-----------------------------------------");
        console.log("MESH CANVAS RENDERER: ACTIVE");
        console.log("PARTICLES:", RENDER_DNA.particle_density);
        console.log("ROTATION: +172.6° CUMULATIVE");
        console.log("-----------------------------------------");
        
        return () => window.cancelAnimationFrame(animationFrameId);
    }, [dimensions]);

    return (
        <canvas 
            ref={canvasRef} 
            data-testid="mesh-canvas-renderer"
            style={{ 
                position: 'fixed', 
                inset: 0, 
                zIndex: -1, 
                background: '#000',
                filter: `blur(${blur}px) contrast(1.2)`,
                opacity: opacity
            }} 
        />
    );
};

export { RENDER_DNA };
export default MeshCanvasRenderer;
