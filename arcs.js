// arcs.js
// Global welding sparks effect on mouse click

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'arcs-canvas';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let sparks = [];
    let animationFrame = null;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    // Trigger on click
    document.addEventListener('click', (e) => {
        // "a 3 line bit arc" - Reduced by 25%
        const numSparks = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numSparks; i++) {
            // Explosive outward velocity, mostly pointing upwards/outwards
            const angle = (Math.random() * Math.PI * 2); 
            const speed = 5 + Math.random() * 10;
            
            sparks.push({
                x: e.clientX,
                y: e.clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5, // bias upwards
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03, // random lifespan
                width: 2 + Math.random() * 2
            });
        }
        
        if (!animationFrame) {
            animate();
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeSparks = false;
        
        sparks.forEach(spark => {
            if (spark.life <= 0) return;
            activeSparks = true;
            
            // Physics
            spark.vy += 0.5; // Gravity
            spark.vx *= 0.96; // Air resistance
            spark.vy *= 0.96;
            
            const oldX = spark.x;
            const oldY = spark.y;
            
            spark.x += spark.vx;
            spark.y += spark.vy;
            
            const alpha = Math.max(0, spark.life);
            
            // Draw spark as a motion-blurred line ("a 3 line bit arc")
            // The tail stretches back based on velocity
            ctx.beginPath();
            // Start of line (tail)
            ctx.moveTo(oldX - spark.vx * 1.5, oldY - spark.vy * 1.5);
            // End of line (head)
            ctx.lineTo(spark.x, spark.y);
            
            // Neon glow effect (welding sparks style but green for theme)
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(0, 255, 102, ${alpha})`;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; // Core is white
            ctx.lineCap = 'round';
            ctx.lineWidth = spark.width;
            ctx.stroke();
            
            // Outer green glow
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(0, 255, 102, ${alpha * 0.8})`;
            ctx.lineWidth = spark.width + 2;
            ctx.stroke();
            
            spark.life -= spark.decay; 
        });
        
        // Remove dead sparks
        sparks = sparks.filter(s => s.life > 0);
        
        if (activeSparks) {
            animationFrame = requestAnimationFrame(animate);
        } else {
            animationFrame = null;
        }
    }
});
