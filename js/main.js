"use strict"

const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

const temperatureSlider = document.getElementById("temperature");
const precipitationSlider = document.getElementById("precipitation");
const windSlider = document.getElementById("wind");
const cloudinessSlider = document.getElementById("cloudiness");

const temperatureDisplay = document.getElementById("temperatureDisplay");
const precipitationInfo = document.getElementById("precipitationInfo");
const windInfo = document.getElementById("windInfo");
const weatherIcon = document.getElementById("weatherIcon");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let cloudParticles = [];
let temperature = 0;
let intensity = 50;
let windSpeed = 0;
let cloudiness = 50;

const icons = {
	rain: "fa-cloud-showers-heavy",
	snow: "fa-snowflake",
	mixed: "fa-cloud-sun-rain",
	sunny: "fa-sun"
};


function celsiusToFahrenheit(celsius) {
	return Math.round((celsius * 9) / 5 + 32);
}

function getWindDirection(speed) {
	if (speed === 0) return "Calm";
	if (speed > 0 && speed <= 2) return "E";
	if (speed > 2 && speed <= 4) return "NE";
	if (speed > 4) return "N";
	if (speed < 0 && speed >= -2) return "W";
	if (speed < -2 && speed >= -4) return "NW";
	if (speed < -4) return "S";
	return "Variable";
}


function updateTemperatureDisplay() {
	const fahrenheit = celsiusToFahrenheit(temperature);
	temperatureDisplay.textContent = `Temperature: ${temperature}°C / ${fahrenheit}°F`;

	let condition;
	if (temperature > 20 && intensity === 0) {
		condition = "sunny"; 
	} else if (temperature > 2) {
		condition = "rain";
	} else if (temperature < -2) {
		condition = "snow";
	} else {
		condition = "mixed";
	}

	updateWeatherIcon(condition);
}

function updatePrecipitationInfo() {
	precipitationInfo.textContent = `Precipitation: ${intensity}%`;
}

function updateWindInfo() {
	const direction = getWindDirection(windSpeed);
	const windText =
		windSpeed !== 0 ? `${Math.abs(windSpeed)} m/s (${direction})` : "Calm";
	windInfo.textContent = `Wind: ${windText}`;
}

function updateCanvasBackground() {
	if (temperature > 20 && intensity === 0) {
	
		canvas.style.background = "linear-gradient(to bottom, #87ceeb, #f0e68c)"; 
	} else if (temperature > 10 && temperature <= 20) {

		canvas.style.background = "linear-gradient(to bottom, #6ab3f1, #c2d8ef)"; 
	} else if (temperature > 0 && temperature <= 10) {
	
		canvas.style.background = "linear-gradient(to bottom, #8ecae6, #219ebc)"; 
	} else if (temperature <= 0 && intensity > 50) {
	
		canvas.style.background = "linear-gradient(to bottom, #d6e6f2, #a9c9d9)"; 
	} else if (temperature <= 0) {
	
		canvas.style.background = "linear-gradient(to bottom, #b3d4e0, #609dbb)"; 
	} else if (intensity > 50) {
	
		canvas.style.background = "linear-gradient(to bottom, #4a90e2, #1e1e2f)"; 
	} else {
	
		canvas.style.background = "linear-gradient(to bottom, #6b8e23, #556b2f)"; 
	}
}

function updateWeatherIcon(condition) {
	weatherIcon.classList.add("hidden"); 
	setTimeout(() => {
		weatherIcon.className = `weather-icon fas ${icons[condition]}`;
		weatherIcon.classList.remove("hidden"); 
	}, 500);
}


class Particle {
	constructor(type) {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.size = Math.random() * 3 + 1;
		this.speedY = Math.random() * 1 + (type === "rain" ? 3 : 1);
		this.speedX = windSpeed;
		this.type = type;
	}

	update() {
		this.y += this.speedY;
		this.x += this.speedX;
		if (this.y > canvas.height) {
			this.y = 0;
			this.x = Math.random() * canvas.width;
		}
		if (this.x > canvas.width) {
			this.x = 0;
		} else if (this.x < 0) {
			this.x = canvas.width;
		}
	}

	draw() {
		ctx.beginPath();
		if (this.type === "rain") {
			ctx.strokeStyle = "#00f";
			ctx.lineWidth = 1;
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + this.speedX, this.y + this.size * 5);
		} else if (this.type === "snow") {
			ctx.fillStyle = "#fff";
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		} else if (this.type === "mixed") {
			if (Math.random() < 0.5) {
				ctx.strokeStyle = "#00f";
				ctx.lineWidth = 1;
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x + this.speedX, this.y + this.size * 5);
			} else {
				ctx.fillStyle = "#fff";
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			}
		}
		ctx.stroke();
		ctx.fill();
	}
}

class CloudParticle {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = (Math.random() * canvas.height) / 2; 
		this.size = Math.random() * 50 + 20; 
		this.speedX = Math.random() * 0.5 - 0.25; 
		this.opacity = Math.random() * 0.6 + 0.4; 
	}

	update() {
		this.x += this.speedX;
		if (this.x > canvas.width) {
			this.x = 0;
		} else if (this.x < 0) {
			this.x = canvas.width;
		}
	}

	draw() {
	
		const gradient = ctx.createRadialGradient(
			this.x,
			this.y,
			0, 
			this.x,
			this.y,
			this.size
		);
		gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`); 
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); 

		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
		ctx.fill();
	}
}

function initParticles() {
	particles = [];
	for (let i = 0; i < intensity; i++) {
		let type = "rain";
		if (temperature <= 2 && temperature >= -2) {
			type = "mixed";
		} else if (temperature < -2) {
			type = "snow";
		}
		particles.push(new Particle(type));
	}
}

function initCloudParticles() {
	cloudParticles = [];
	for (let i = 0; i < cloudiness; i++) {
		cloudParticles.push(new CloudParticle());
	}
}
const cloudLayers = [
	{ speedMultiplier: 0.2, opacity: 0.3 },
	{ speedMultiplier: 0.4, opacity: 0.5 },
	{ speedMultiplier: 0.6, opacity: 0.8 } 
];

function drawCloudLayers() {
	cloudLayers.forEach((layer) => {
		cloudParticles.forEach((particle) => {
			particle.speedX *= layer.speedMultiplier;
			ctx.globalAlpha = layer.opacity;
			particle.draw();
			ctx.globalAlpha = 1; 
		});
	});
}


function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	
	drawFog();


	cloudParticles.forEach((particle) => {
		particle.update();
		particle.draw();
	});


	particles.forEach((particle) => {
		particle.update();
		particle.draw();
	});

	requestAnimationFrame(animate);
}


function updateWeather() {
	temperature = parseInt(temperatureSlider.value);
	intensity = parseInt(precipitationSlider.value);
	windSpeed = parseFloat(windSlider.value);

	particles.forEach((particle) => {
		particle.speedX = windSpeed;
	});

	updateTemperatureDisplay(); 
	updatePrecipitationInfo(); 
	updateWindInfo(); 
	updateCanvasBackground(); 

	initParticles(); 
}

function updateCloudiness() {
	cloudiness = parseInt(cloudinessSlider.value);
	initCloudParticles();
}


temperatureSlider.addEventListener("input", updateWeather);
precipitationSlider.addEventListener("input", updateWeather);
windSlider.addEventListener("input", updateWeather);
cloudinessSlider.addEventListener("input", updateCloudiness);

cloudinessSlider.addEventListener("input", (event) => {
	document.getElementById(
		"cloudinessValue"
	).textContent = `${event.target.value}%`;
	updateCloudiness(); 
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	initParticles();
	initCloudParticles();
});

function drawFog() {
	if (temperature <= 0) {
		ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
}


updateWeather();
updateCloudiness();
animate();
