/**
 * 3d-scene.js  –  Three.js animated background
 * Floating soft spheres that gently rotate and respond to mouse movement.
 */
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 0, 30);

    // Resize helper
    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x7c9fff, 0.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xc4aefe, 0.5);
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    // Sphere data
    const SPHERE_DATA = [
        { pos: [-12, 5, -5], r: 3.5, color: 0x7c9fff, opacity: 0.18 },
        { pos: [10, -4, -8], r: 4.5, color: 0xc4aefe, opacity: 0.15 },
        { pos: [-5, -8, -12], r: 5.0, color: 0x5fb88a, opacity: 0.12 },
        { pos: [14, 9, -15], r: 6.0, color: 0xffb085, opacity: 0.10 },
        { pos: [0, 12, -18], r: 3.0, color: 0x7c9fff, opacity: 0.14 },
        { pos: [-15, 0, -20], r: 7.0, color: 0xc4aefe, opacity: 0.08 },
        { pos: [6, -12, -10], r: 2.5, color: 0x5fb88a, opacity: 0.16 },
        { pos: [-8, 10, -8], r: 2.0, color: 0xffb085, opacity: 0.20 },
    ];

    const spheres = [];
    const geo = new THREE.SphereGeometry(1, 32, 32);

    SPHERE_DATA.forEach(d => {
        const mat = new THREE.MeshPhongMaterial({
            color: d.color,
            transparent: true,
            opacity: d.opacity,
            shininess: 80,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...d.pos);
        mesh.scale.setScalar(d.r);
        // Store random phase for bob animation
        mesh.userData = {
            initY: d.pos[1],
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.3,
            rotSpeed: (Math.random() - 0.5) * 0.005,
        };
        scene.add(mesh);
        spheres.push(mesh);
    });

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', e => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let running = true;
    const clock = new THREE.Clock();

    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        spheres.forEach(s => {
            const { initY, phase, speed, rotSpeed } = s.userData;
            s.position.y = initY + Math.sin(t * speed + phase) * 1.5;
            s.rotation.y += rotSpeed;
            s.rotation.x += rotSpeed * 0.5;
        });

        // Subtle camera parallax from mouse
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
        camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    // Cleanup on page switch (optional)
    window.stopScene = () => { running = false; };
    window.startScene = () => { if (!running) { running = true; animate(); } };
})();
