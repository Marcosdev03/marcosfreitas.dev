document.getElementById("year").textContent = new Date().getFullYear();

const canvas = document.getElementById("starfield");

if (canvas) {
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let stars = [];
    let nebula = [];
    let rafId = null;

    const STAR_COUNT_FACTOR = 0.00024;

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const starCount = Math.max(160, Math.floor(width * height * STAR_COUNT_FACTOR));
        stars = Array.from({ length: starCount }, () => ({
            x: random(0, width),
            y: random(0, height),
            z: random(0.2, 1),
            twinkle: random(0, Math.PI * 2),
        }));

        nebula = [
            { x: width * 0.78, y: height * 0.18, r: Math.max(width, height) * 0.42, a: 0.2 },
            { x: width * 0.2, y: height * 0.86, r: Math.max(width, height) * 0.5, a: 0.14 },
        ];
    }

    function drawNebula() {
        for (const cloud of nebula) {
            const g = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
            g.addColorStop(0, `rgba(100, 160, 255, ${cloud.a})`);
            g.addColorStop(0.5, `rgba(36, 80, 170, ${cloud.a * 0.45})`);
            g.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(cloud.x - cloud.r, cloud.y - cloud.r, cloud.r * 2, cloud.r * 2);
        }
    }

    function render(t) {
        ctx.clearRect(0, 0, width, height);

        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, "#000108");
        bg.addColorStop(0.55, "#02050f");
        bg.addColorStop(1, "#000106");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        drawNebula();

        for (const star of stars) {
            const speed = 0.35 + star.z * 2.9;
            star.y += speed;
            star.x += (star.z - 0.5) * 0.22;

            if (star.y > height + 10) {
                star.y = -10;
                star.x = random(0, width);
            }

            if (star.x < -10) {
                star.x = width + 10;
            }

            if (star.x > width + 10) {
                star.x = -10;
            }

            const twinkle = 0.58 + Math.sin(t * 0.0017 + star.twinkle) * 0.42;
            const alpha = (0.25 + star.z * 0.75) * twinkle;
            const radius = 0.4 + star.z * 2.2;
            const trail = 7 + star.z * 26;

            const trailGradient = ctx.createLinearGradient(star.x, star.y - trail, star.x, star.y);
            trailGradient.addColorStop(0, "rgba(180, 220, 255, 0)");
            trailGradient.addColorStop(1, `rgba(220, 240, 255, ${alpha})`);
            ctx.strokeStyle = trailGradient;
            ctx.lineWidth = Math.max(0.6, radius * 0.75);
            ctx.beginPath();
            ctx.moveTo(star.x, star.y - trail);
            ctx.lineTo(star.x, star.y);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.2)})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        rafId = requestAnimationFrame(render);
    }

    resize();

    if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
    }

    window.addEventListener("resize", () => {
        resize();
    });

    window.addEventListener("beforeunload", () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    });
}
