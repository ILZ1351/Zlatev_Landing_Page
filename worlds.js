let stars = [];
let constellationPoints = [];
let galaxyParticles = [];
let mousePos = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
let time = 0;

// Real constellation patterns for celestial worlds
const CONSTELLATION_PATTERNS = {
    PEGASUS: [ // Square pattern with extensions
        [-200, -200], [-200, 0], [0, 0], [0, -200], // Square
        [50, -100], [100, -50], // Extension for head
        [-100, 50], [-50, 100] // Extension for legs
    ],
    LYRA: [ // Harp shape
        [100, 100], [150, 50], [200, 0],  // Main line
        [150, 50], [100, 0], // Cross piece
        [175, 25], [125, 25] // Details
    ],
    CYGNUS: [ // Northern Cross
        [0, -150], [0, 150], // Vertical
        [-100, 0], [100, 0], // Horizontal
        [50, -75], [-50, -75] // Wings
    ]
};

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(2);
    
    // Initialize stars
    for (let i = 0; i < 1000; i++) {
        stars.push({
            pos: p5.Vector.random3D().mult(random(500, 2000)),
            size: random(1, 3),
            speed: random(0.1, 0.5),
            brightness: random(200, 255)
        });
    }

    // Create constellation points from patterns
    Object.entries(CONSTELLATION_PATTERNS).forEach(([name, points]) => {
        points.forEach(point => {
            constellationPoints.push({
                pos: createVector(point[0], point[1], random(-100, 100)),
                connections: [],
                color: color(255),
                originalY: point[1],
                constellation: name
            });
        });
    });

    // Create connections within each constellation
    for (let i = 0; i < constellationPoints.length; i++) {
        for (let j = i + 1; j < constellationPoints.length; j++) {
            if (constellationPoints[i].constellation === constellationPoints[j].constellation) {
                let d = p5.Vector.dist(constellationPoints[i].pos, constellationPoints[j].pos);
                if (d < 250) {
                    constellationPoints[i].connections.push(j);
                }
            }
        }
    }

    // Initialize galaxy particles
    for (let i = 0; i < 200; i++) {
        galaxyParticles.push({
            pos: p5.Vector.random3D().mult(random(300, 800)),
            vel: p5.Vector.random3D().mult(0.2),
            color: color(255, random(200, 255)),
            size: random(2, 5)
        });
    }

    // Hide loading screen after setup is complete
    document.querySelector('.loading').classList.add('hidden');
}

function draw() {
    background(0);
    smooth();
    
    // Update mouse position for smooth camera movement
    mousePos.x = lerp(mousePos.x, (mouseX - width/2) / width, 0.1);
    mousePos.y = lerp(mousePos.y, (mouseY - height/2) / height, 0.1);
    
    // Update camera rotation
    targetRotation.x = mousePos.y * 0.5;
    targetRotation.y = mousePos.x * 0.5;
    currentRotation.x = lerp(currentRotation.x, targetRotation.x, 0.1);
    currentRotation.y = lerp(currentRotation.y, targetRotation.y, 0.1);
    
    // Apply camera rotation
    rotateX(currentRotation.x);
    rotateY(currentRotation.y);

    // Draw all elements
    drawStars();
    drawGalaxyParticles();
    drawConstellations();
    
    // Update time
    time += 0.01;
}

function drawStars() {
    push();
    for (let star of stars) {
        let scaledPos = p5.Vector.mult(star.pos, 1 + sin(time * star.speed) * 0.1);
        push();
        translate(scaledPos.x, scaledPos.y, scaledPos.z);
        fill(255, star.brightness);
        noStroke();
        sphere(star.size);
        pop();
    }
    pop();
}

function drawGalaxyParticles() {
    push();
    for (let particle of galaxyParticles) {
        particle.pos.add(particle.vel);
        
        let angle = time * 0.1;
        let radius = particle.pos.mag();
        particle.pos.x = cos(angle) * radius;
        particle.pos.z = sin(angle) * radius;
        
        push();
        translate(particle.pos.x, particle.pos.y, particle.pos.z);
        fill(particle.color);
        noStroke();
        sphere(particle.size);
        pop();
    }
    pop();
}

function drawConstellations() {
    push();
    for (let point of constellationPoints) {
        point.pos.y = point.originalY + sin(time + point.pos.x * 0.01) * 20;
        
        // Draw connections with fading effect
        for (let conn of point.connections) {
            let other = constellationPoints[conn];
            let d = p5.Vector.dist(point.pos, other.pos);
            let alpha = map(d, 0, 250, 255, 50);
            stroke(255, alpha);
            strokeWeight(1);
            line(
                point.pos.x, point.pos.y, point.pos.z,
                other.pos.x, other.pos.y, other.pos.z
            );
        }
        
        // Draw points with enhanced glow
        push();
        translate(point.pos.x, point.pos.y, point.pos.z);
        fill(255);
        noStroke();
        sphere(3);
        
        // Add white glow effect
        for (let i = 0; i < 3; i++) {
            fill(255, 255, 255, 50 - i * 15);
            sphere(4 + i * 2);
        }
        pop();
    }
    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
} 