// dust.js
// Custom Vanilla JS adaptation of the Framer Dust Text Reveal for Project Sliders
// Upgraded to full-card vaporization and reformation

class DustEngine {
    constructor(canvas, oldCard, newCard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.oldCard = oldCard;
        this.newCard = newCard;
        this.particles = [];
        this.animationFrame = null;
        this.lastTime = performance.now();
        this.progress = 0; 
        this.duration = 1.2; // Slightly longer for the epic transition
        this.noise = 120; // more chaos
        this.speed = 3.0;
        this.onComplete = null;
        
        this.init();
    }
    
    drawCardToCanvas(cardElement, width, height) {
        const drawColor = 'rgba(0, 255, 102, 1)';
        this.ctx.clearRect(0, 0, width, height);
        
        // Get card exact bounds to use as reference
        const cardRect = cardElement.getBoundingClientRect();
        
        // Draw border for the entire rectangular box
        this.ctx.strokeStyle = drawColor;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.roundRect(6, 6, width - 12, height - 38, 8);
        this.ctx.stroke();
        
        const titleEl = cardElement.querySelector('.card-title');
        const descEl = cardElement.querySelector('.card-desc');
        const tagEls = cardElement.querySelectorAll('.tags span');
        
        // Title
        if (titleEl) {
            const rect = titleEl.getBoundingClientRect();
            const style = window.getComputedStyle(titleEl);
            
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            this.ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            this.ctx.fillStyle = drawColor;
            
            const x = rect.left - cardRect.left;
            const y = rect.top - cardRect.top;
            this.ctx.fillText(titleEl.innerText, x, y);
        }
        
        // Desc (approximate wrapping text)
        if (descEl) {
            const rect = descEl.getBoundingClientRect();
            const style = window.getComputedStyle(descEl);
            
            this.ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            this.ctx.fillStyle = drawColor;
            
            const x = rect.left - cardRect.left;
            let y = rect.top - cardRect.top;
            
            const maxWidth = width - 64; 
            const words = descEl.innerText.split(' ');
            let line = '';
            
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = this.ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    this.ctx.fillText(line.trim(), x, y);
                    line = words[n] + ' ';
                    y += parseInt(style.lineHeight) || 28;
                } else {
                    line = testLine;
                }
            }
            this.ctx.fillText(line.trim(), x, y);
        }
        
        // Tags
        if (tagEls && tagEls.length > 0) {
            Array.from(tagEls).forEach(tagEl => {
                const rect = tagEl.getBoundingClientRect();
                const style = window.getComputedStyle(tagEl);
                
                const x = rect.left - cardRect.left;
                const y = rect.top - cardRect.top;
                const tagWidth = rect.width;
                const tagHeight = rect.height;
                
                this.ctx.strokeStyle = drawColor;
                this.ctx.beginPath();
                this.ctx.roundRect(x, y, tagWidth, tagHeight, 14);
                this.ctx.stroke();
                
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                this.ctx.fillStyle = drawColor;
                this.ctx.fillText(tagEl.innerText, x + tagWidth/2, y + tagHeight/2);
            });
        }
    }

    init() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        const cardW = rect.width;
        const cardH = rect.height;
        
        this.drawCardToCanvas(this.oldCard, cardW, cardH);
        const oldImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const oldData = oldImageData.data;
        
        this.drawCardToCanvas(this.newCard, cardW, cardH);
        const newImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const newData = newImageData.data;
        
        this.ctx.clearRect(0, 0, cardW, cardH);
        
        const sampleRate = Math.max(2, Math.round(dpr * 4)); 
        const startPixels = [];
        const endPixels = [];
        
        for (let y = 0; y < this.canvas.height; y += sampleRate) {
            for (let x = 0; x < this.canvas.width; x += sampleRate) {
                const index = (y * this.canvas.width + x) * 4;
                
                if (oldData[index + 3] > 0) {
                    startPixels.push({
                        x: x, y: y,
                        r: oldData[index], g: oldData[index+1], b: oldData[index+2], a: oldData[index+3]/255
                    });
                }
                
                if (newData[index + 3] > 0) {
                    endPixels.push({
                        x: x, y: y,
                        r: newData[index], g: newData[index+1], b: newData[index+2], a: newData[index+3]/255
                    });
                }
            }
        }
        
        this.shuffleArray(endPixels);
        
        const maxParticles = Math.max(startPixels.length, endPixels.length);
        
        for (let i = 0; i < maxParticles; i++) {
            const startNode = startPixels[i % startPixels.length];
            const endNode = endPixels[i % endPixels.length];
            
            const isSpawning = i >= startPixels.length;
            const isDying = i >= endPixels.length;
            
            const randomXOffset = (Math.random() - 0.5) * 600;
            const randomYOffset = (Math.random() - 0.5) * 600;
            
            this.particles.push({
                startX: isSpawning ? endNode.x + randomXOffset : startNode.x,
                startY: isSpawning ? endNode.y + randomYOffset : startNode.y,
                startR: isSpawning ? endNode.r : startNode.r,
                startG: isSpawning ? endNode.g : startNode.g,
                startB: isSpawning ? endNode.b : startNode.b,
                startA: isSpawning ? 0 : startNode.a,
                
                endX: isDying ? startNode.x + randomXOffset : endNode.x,
                endY: isDying ? startNode.y + randomYOffset : endNode.y,
                endR: isDying ? startNode.r : endNode.r,
                endG: isDying ? startNode.g : endNode.g,
                endB: isDying ? startNode.b : endNode.b,
                endA: isDying ? 0 : endNode.a,
                
                x: isSpawning ? endNode.x + randomXOffset : startNode.x,
                y: isSpawning ? endNode.y + randomYOffset : startNode.y,
                
                floatingSpeed: Math.random() * 2 + 1,
                floatingAngle: Math.random() * Math.PI * 2
            });
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    animate(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        this.progress = Math.min(1, this.progress + deltaTime / this.duration);
        const p = this.ease(this.progress);
        const rawP = this.progress; 
        
        const time = Date.now() * 0.001;
        
        const chaosIntensity = Math.sin(rawP * Math.PI); 
        const NOISE_SCALE = 1.0 * chaosIntensity;
        const CHAOS_FACTOR = 2.0;
        
        const dpr = window.devicePixelRatio || 1;
        
        // Fade out particles near the end to hand off smoothly to HTML
        const formFade = rawP < 0.85 ? 1 : Math.max(0, 1 - (rawP - 0.85) / 0.15);
        
        this.particles.forEach(particle => {
            particle.floatingAngle += deltaTime * particle.floatingSpeed * (1 + Math.random() * CHAOS_FACTOR);
            const uniqueOffset = particle.floatingSpeed * 2000;
            
            const noiseX = (Math.sin(time * particle.floatingSpeed + particle.floatingAngle) * 1.2 + 
                            Math.sin((time + uniqueOffset) * 0.5) * 0.8) * NOISE_SCALE * this.noise;
                            
            const noiseY = (Math.cos(time * particle.floatingSpeed + particle.floatingAngle * 1.5) * 0.6 + 
                            Math.cos((time + uniqueOffset) * 0.5) * 0.4) * NOISE_SCALE * this.noise;
            
            const baseX = particle.startX + (particle.endX - particle.startX) * p;
            const baseY = particle.startY + (particle.endY - particle.startY) * p;
            
            particle.x = baseX + noiseX;
            particle.y = baseY + noiseY;
            
            if (rawP >= 0.99) {
                particle.x = particle.endX;
                particle.y = particle.endY;
            }
            
            const currentR = Math.round(particle.startR + (particle.endR - particle.startR) * rawP);
            const currentG = Math.round(particle.startG + (particle.endG - particle.startG) * rawP);
            const currentB = Math.round(particle.startB + (particle.endB - particle.startB) * rawP);
            let currentA = particle.startA + (particle.endA - particle.startA) * rawP;
            
            // Apply handoff fade
            currentA *= formFade;
            
            if (currentA > 0.01) {
                this.ctx.fillStyle = `rgba(${currentR}, ${currentG}, ${currentB}, ${currentA})`;
                const size = 1.5 + chaosIntensity * 1.5;
                this.ctx.fillRect(particle.x / dpr, particle.y / dpr, size, size);
            }
        });
        
        if (this.progress < 1) {
            this.animationFrame = requestAnimationFrame(this.animate.bind(this));
        } else {
            if (this.onComplete) this.onComplete();
        }
    }
    
    start(onComplete) {
        this.onComplete = onComplete;
        this.progress = 0;
        this.lastTime = performance.now();
        this.animate(performance.now());
    }
    
    stop() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
    }
}
window.DustEngine = DustEngine;
