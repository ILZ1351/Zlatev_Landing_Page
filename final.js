let stars = [];
let lines = [];
let galaxyParticles = [];
let abstractPoints = [];
let planets = [];
let shootingStars = [];
let nebulaClouds = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let cameraRotation = 0;
let lastTime = 0;
let backgroundStars;
let moon;
let starField;

// Background constellation patterns
const CONSTELLATION_PATTERNS = [
    // Ursa Major (Big Dipper)
    [
        {x: -0.8, y: 0.4}, {x: -0.6, y: 0.38}, {x: -0.4, y: 0.35},
        {x: -0.2, y: 0.32}, {x: 0, y: 0.3}, {x: 0.2, y: 0.28},
        {x: 0.4, y: 0.25}
    ],
    // Orion
    [
        {x: 0.1, y: -0.2}, {x: 0.3, y: -0.1}, {x: 0.5, y: -0.2},
        {x: 0.2, y: -0.4}, {x: 0.4, y: -0.4}, {x: 0.3, y: -0.6}
    ],
    // Cassiopeia
    [
        {x: -0.5, y: -0.3}, {x: -0.3, y: -0.4}, {x: -0.1, y: -0.3},
        {x: 0.1, y: -0.4}, {x: 0.3, y: -0.3}
    ]
];

// Constellation text points
const socialPoints = [
    // S
    {x: -4, y: 2}, {x: -3, y: 2}, {x: -2, y: 2},
    {x: -4, y: 1}, {x: -4, y: 0}, {x: -3, y: 0}, {x: -2, y: 0},
    {x: -2, y: -1}, {x: -2, y: -2}, {x: -3, y: -2}, {x: -4, y: -2},
    // O
    {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2},
    {x: 0, y: 1}, {x: 2, y: 1},
    {x: 0, y: 0}, {x: 2, y: 0},
    {x: 0, y: -1}, {x: 2, y: -1},
    {x: 0, y: -2}, {x: 1, y: -2}, {x: 2, y: -2},
];

const worldsPoints = [
    // W
    {x: -6, y: 2}, {x: -4, y: 2},
    {x: -6, y: 1}, {x: -4, y: 1},
    {x: -6, y: 0}, {x: -5, y: 0}, {x: -4, y: 0},
    {x: -6, y: -1}, {x: -5, y: -1}, {x: -4, y: -1},
    {x: -5, y: -2},
    // O
    {x: -2, y: 2}, {x: -1, y: 2}, {x: 0, y: 2},
    {x: -2, y: 1}, {x: 0, y: 1},
    {x: -2, y: 0}, {x: 0, y: 0},
    {x: -2, y: -1}, {x: 0, y: -1},
    {x: -2, y: -2}, {x: -1, y: -2}, {x: 0, y: -2},
];

class Constellation {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        // Make constellation stars smaller near the text area
        this.size = this.y < 150 ? random(0.4, 1) : random(0.8, 2);
        this.alpha = random(50, 200);
        this.targetAlpha = this.alpha;
        this.twinkleSpeed = random(0.02, 0.05);
        this.phase = random(TWO_PI);
        this.isSelected = false;
        this.connections = [];
        this.maxConnections = 3;
    }

    twinkle() {
        this.phase += this.twinkleSpeed;
        this.alpha = this.targetAlpha + sin(this.phase) * 50;
        
        // Smooth movement
        if (this.isSelected) {
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            this.x += dx * 0.02;
            this.y += dy * 0.02;
        }
    }

    display() {
        // Star glow
        noStroke();
        for (let i = 0; i < 3; i++) {
            let size = this.size * (3 - i);
            let a = this.alpha * (1 - i * 0.3);
            fill(255, a);
            circle(this.x, this.y, size);
        }

        // Draw connections
        if (this.isSelected) {
            for (let conn of this.connections) {
                let other = stars[conn];
                let d = dist(this.x, this.y, other.x, other.y);
                let alpha = map(d, 0, 200, 150, 20);
                stroke(255, alpha);
                strokeWeight(1);
                line(this.x, this.y, other.x, other.y);

                // Draw moving particles along the connection
                let numParticles = 3;
                for (let i = 0; i < numParticles; i++) {
                    let t = (frameCount * 0.02 + i/numParticles) % 1;
                    let x = lerp(this.x, other.x, t);
                    let y = lerp(this.y, other.y, t);
                    fill(255, alpha * 2);
                    noStroke();
                    circle(x, y, 2);
                }
            }
        }
    }

    starClick(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        if (d < 20) {
            this.isSelected = !this.isSelected;
            if (this.isSelected) {
                // Find nearest stars to connect to
                let potentialConnections = [];
                for (let i = 0; i < stars.length; i++) {
                    if (i !== stars.indexOf(this) && !stars[i].isSelected) {
                        let d = dist(this.x, this.y, stars[i].x, stars[i].y);
                        potentialConnections.push({index: i, distance: d});
                    }
                }
                // Sort by distance and take the closest ones
                potentialConnections.sort((a, b) => a.distance - b.distance);
                this.connections = potentialConnections
                    .slice(0, this.maxConnections)
                    .map(c => c.index);
            } else {
                this.connections = [];
            }
            return true;
        }
        return false;
    }
}

class BackgroundStar {
    constructor() {
        this.stars = [];
        for (let i = 0; i < 200; i++) {
            this.stars.push({
      x: random(width),
      y: random(height),
                size: random(0.1, 1),
                brightness: random(50, 150)
            });
        }
    }

    displayBgStar() {
        noStroke();
        for (let star of this.stars) {
            fill(255, star.brightness);
            circle(star.x, star.y, star.size);
        }
    }
}

class Planet {
    constructor() {
        // Create a more organized pattern with specific orbits
        let orbitIndex = floor(random(3)); // 0, 1, or 2 for different orbits
        let orbitRadius = 200 + orbitIndex * 100; // 200, 300, or 400
        let angle = random(TWO_PI);
        
        // Calculate position based on orbit
        this.x = width/2 + cos(angle) * orbitRadius;
        this.y = height/2 + sin(angle) * orbitRadius;
        
        // Size based on orbit (inner planets smaller, outer planets larger)
        if (orbitIndex === 0) {
            this.size = random(20, 40); // Inner orbit: smaller planets
        } else if (orbitIndex === 1) {
            this.size = random(40, 60); // Middle orbit: medium planets
        } else {
            this.size = random(60, 80); // Outer orbit: larger planets
        }
        
        this.rotationSpeed = random(0.001, 0.003);
        this.rotation = random(TWO_PI);
        this.color = color(
            random(100, 255),
            random(100, 255),
            random(100, 255)
        );
        this.rings = random() > 0.5;
        this.ringColor = color(
            random(150, 255),
            random(150, 255),
            random(150, 255),
            150
        );
        this.orbitRadius = orbitRadius;
        this.orbitAngle = angle;
        this.orbitSpeed = 0.0005 + (orbitIndex * 0.0002); // Outer orbits move slower
        this.moons = [];
        
        // Add random moons based on planet size
        let numMoons = floor(map(this.size, 20, 80, 0, 4));
        for (let i = 0; i < numMoons; i++) {
            this.moons.push({
                radius: random(20, 40),
                angle: random(TWO_PI),
                speed: random(0.01, 0.02),
                size: random(5, 10)
            });
        }
    }

    update() {
        this.rotation += this.rotationSpeed;
        this.orbitAngle += this.orbitSpeed;
        
        // Update position based on orbit
        this.x = width/2 + cos(this.orbitAngle) * this.orbitRadius;
        this.y = height/2 + sin(this.orbitAngle) * this.orbitRadius;
        
        // Update moon positions
        for (let moon of this.moons) {
            moon.angle += moon.speed;
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);

        // Planet glow
        for (let i = 0; i < 3; i++) {
            noStroke();
            fill(red(this.color), green(this.color), blue(this.color), 50 - i * 15);
            circle(0, 0, this.size + i * 20);
        }

        // Planet body
        fill(this.color);
        noStroke();
        circle(0, 0, this.size);

        // Rings if present
        if (this.rings) {
            push();
            rotate(PI / 6);
            noFill();
            stroke(this.ringColor);
            strokeWeight(4);
            ellipse(0, 0, this.size * 1.8, this.size * 0.3);
            pop();
        }

        // Draw moons
        for (let moon of this.moons) {
            let moonX = cos(moon.angle) * moon.radius;
            let moonY = sin(moon.angle) * moon.radius;
            
            // Moon glow
            noStroke();
            fill(255, 100);
            circle(moonX, moonY, moon.size + 5);
            
            // Moon body
            fill(200);
            circle(moonX, moonY, moon.size);
        }

        pop();
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = random(-width * 0.2, width * 1.2);
        this.y = random(-height * 0.2, 0);
        this.speedX = random(2, 8);
        this.speedY = random(2, 8);
        this.size = random(1.5, 3);
        this.tail = [];
        this.maxTailLength = 20;
        this.alpha = 255;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Add current position to tail
        this.tail.unshift({x: this.x, y: this.y});
        
        // Limit tail length
        if (this.tail.length > this.maxTailLength) {
            this.tail.pop();
        }

        // Reset if off screen
        if (this.x > width * 1.2 || this.y > height * 1.2) {
            this.reset();
        }
    }

    display() {
        // Draw tail
        noFill();
        for (let i = 0; i < this.tail.length; i++) {
            let alpha = map(i, 0, this.tail.length, 255, 0);
            stroke(255, alpha);
            strokeWeight(this.size * map(i, 0, this.tail.length, 1, 0));
            
            if (i < this.tail.length - 1) {
                line(
                    this.tail[i].x, this.tail[i].y,
                    this.tail[i + 1].x, this.tail[i + 1].y
                );
            }
        }

        // Draw head
        noStroke();
  fill(255);
        circle(this.x, this.y, this.size * 2);
    }
}

class NebulaCloud {
    constructor() {
        this.x = random(width);
        this.y = random(height);
        this.size = random(100, 300);
        this.color = color(
            random(100, 255),
            random(100, 255),
            random(100, 255),
            50
        );
        this.points = [];
        this.numPoints = 50;
        this.angle = 0;
        
        // Generate cloud points
        for (let i = 0; i < this.numPoints; i++) {
            this.points.push({
                x: random(-this.size/2, this.size/2),
                y: random(-this.size/2, this.size/2),
                size: random(2, 8),
                angle: random(TWO_PI)
            });
        }
    }

    update() {
        this.angle += 0.001;
        for (let point of this.points) {
            point.angle += 0.01;
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);

        // Draw nebula glow
        noStroke();
        for (let i = 0; i < 3; i++) {
            fill(red(this.color), green(this.color), blue(this.color), 20 - i * 5);
            circle(0, 0, this.size + i * 50);
        }

        // Draw nebula points
        for (let point of this.points) {
            let x = point.x + cos(point.angle) * 5;
            let y = point.y + sin(point.angle) * 5;
            
            fill(red(this.color), green(this.color), blue(this.color), 150);
            circle(x, y, point.size);
        }

        pop();
    }
}

class Moon {
    constructor() {
        this.x = width * 0.8;
        this.y = height * 0.2;
        this.size = 100;
        this.phase = 0.8; // 0 to 1, where 1 is full moon
        this.craters = [];
        
        // Generate craters
        for (let i = 0; i < 15; i++) {
            this.craters.push({
                x: random(-this.size/2, this.size/2),
                y: random(-this.size/2, this.size/2),
                size: random(5, 15),
                depth: random(0.3, 0.7)
            });
        }
    }

    display() {
        push();
        translate(this.x, this.y);
        
        // Moon glow
        for (let i = 0; i < 3; i++) {
            noStroke();
            fill(255, 50 - i * 15);
            circle(0, 0, this.size + i * 20);
        }
        
        // Moon body
        noStroke();
        fill(220);
        circle(0, 0, this.size);
        
        
        
        // Draw craters
        for (let crater of this.craters) {
            // Crater shadow
            fill(180);
            ellipse(crater.x, crater.y, crater.size, crater.size * crater.depth);
            
            // Crater highlight
            fill(240);
            ellipse(crater.x - crater.size/4, crater.y - crater.size/4, 
                   crater.size/2, crater.size/2 * crater.depth);
        }
        
        pop();
    }
}

class StarField {
    constructor() {
        this.stars = [];
        this.twinkleStars = [];
        this.initializeStars();
    }

    initializeStars() {
        // Regular stars
        for (let i = 0; i < 200; i++) {
            let x = random(width);
            let y = random(height);
            // Make stars smaller near the text area (top of screen)
            let size = y < 150 ? random(0.2, 0.8) : random(0.5, 1.5);
            this.stars.push({
                x: x,
                y: y,
                size: size,
                brightness: random(150, 255)
            });
        }
        
        // Twinkling stars
        for (let i = 0; i < 50; i++) {
            let x = random(width);
            let y = random(height);
            // Make twinkling stars smaller near the text area
            let size = y < 150 ? random(0.5, 1) : random(1, 2);
            this.twinkleStars.push({
                x: x,
                y: y,
                size: size,
                phase: random(TWO_PI),
                speed: random(0.02, 0.05)
            });
        }
    }

    update() {
        for (let star of this.twinkleStars) {
            star.phase += star.speed;
        }
    }

    display() {
        // Draw regular stars
        for (let star of this.stars) {
            noStroke();
            fill(255, star.brightness);
            circle(star.x, star.y, star.size);
        }
        
        // Draw twinkling stars
        for (let star of this.twinkleStars) {
            let brightness = map(sin(star.phase), -1, 1, 100, 255);
            noStroke();
            fill(255, brightness);
            circle(star.x, star.y, star.size);
        }
    }
}

function drawGalaxyBackground() {
    // Create consistent gradient background
    let c1 = color(5, 0, 15);  // Deep space blue
    let c2 = color(10, 0, 25);  // Slightly lighter space blue
    
    // Draw gradient
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(0, y, width, y);
    }
    
    // Add subtle nebula effect
    for (let i = 0; i < 2; i++) {
        let x = random(width);
        let y = random(height);
        let size = random(200, 400);
        let c = color(
            random(20, 40),
            random(0, 20),
            random(30, 50),
            15
        );
        
        noStroke();
        for (let j = 0; j < 3; j++) {
            fill(red(c), green(c), blue(c), 8 - j * 2);
            circle(x, y, size + j * 50);
        }
    }
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    frameRate(60);
    
    // Initialize moon and star field
    moon = new Moon();
    starField = new StarField();
    
    // Initialize abstract constellation points
    for (let i = 0; i < 50; i++) {
        abstractPoints.push({
            pos: createVector(
                random(-width/3, width/3),
                random(-height/3, height/3),
                random(-500, 500)
            ),
            targetPos: createVector(0, 0, 0),
            vel: createVector(0, 0, 0),
            connections: [],
            size: random(2, 6),
            phase: random(TWO_PI),
            color: color(255, random(200, 255), 255, 150)
        });
    }

    // Initialize background stars
    backgroundStars = new BackgroundStar();

    // Initialize interactive constellation stars
    for (let i = 0; i < width * 0.15; i++) {
        stars.push(new Constellation());
    }

    // Initialize galaxy particles
    for (let i = 0; i < 100; i++) {
        galaxyParticles.push({
            x: random(-width/2, width/2),
            y: random(-height/2, height/2),
            z: random(-500, 500),
            size: random(2, 4),
            color: color(255, random(150, 200))
        });
    }

    // Initialize planets in organized orbits
    for (let i = 0; i < 5; i++) {
        planets.push(new Planet());
    }

    // Initialize shooting stars
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }

    // Initialize nebula clouds
    for (let i = 0; i < 3; i++) {
        nebulaClouds.push(new NebulaCloud());
    }
}

function draw() {
    // Clear with transparent background
    clear();
    
    // Draw galaxy background
    drawGalaxyBackground();
    
    // Update and display star field
    starField.update();
    starField.display();
    
    // Display moon
    moon.display();
    
    // Update and display nebula clouds
    for (let nebula of nebulaClouds) {
        nebula.update();
        nebula.display();
    }
    
    // Update and display planets
    for (let planet of planets) {
        planet.update();
        planet.display();
    }
    
    // Update and display shooting stars
    for (let star of shootingStars) {
        star.update();
        star.display();
    }

    // Update and display stars
    for (let star of stars) {
        star.twinkle();
        star.display();
    }

    // Draw galaxy particles
    for (let particle of galaxyParticles) {
        let d = dist(particle.x, particle.y, mouseX, mouseY);
        let size = map(d, 0, 300, particle.size * 1.5, particle.size);
        
        fill(particle.color);
        noStroke();
        circle(particle.x, particle.y, size);
    }

    // Draw ripple effects
    for (let i = lines.length - 1; i >= 0; i--) {
        let ripple = lines[i];
        ripple.size += 5;
        ripple.alpha -= 5;
        
        noFill();
        stroke(255, ripple.alpha);
        strokeWeight(1);
        circle(ripple.x, ripple.y, ripple.size);
        
        if (ripple.alpha <= 0) {
            lines.splice(i, 1);
        }
    }
}

function mousePressed() {
    let starClicked = false;
    for (let star of stars) {
        if (star.starClick(mouseX, mouseY)) {
            starClicked = true;
            break;
        }
    }
    
    // If no star was clicked, create a ripple effect
    if (!starClicked) {
        let ripple = {
            x: mouseX,
            y: mouseY,
            size: 0,
            alpha: 255
        };
        lines.push(ripple);
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
    
    // Reset abstract points positions
    for (let point of abstractPoints) {
        point.pos = createVector(
            random(-width/3, width/3),
            random(-height/3, height/3),
            random(-500, 500)
        );
    }

    // Reset stars for new window size
    stars = [];
    for (let i = 0; i < width * 0.15; i++) {
        stars.push(new Constellation());
    }
    backgroundStars = new BackgroundStar();

    // Reset galaxy particles
    for (let particle of galaxyParticles) {
        particle.x = random(-width/2, width/2);
        particle.y = random(-height/2, height/2);
    }
}

function mouseMoved() {
    mouseX = event.clientX;
    mouseY = event.clientY;
}
