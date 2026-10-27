// Glass widgets: pointer-tracked sheen and subtle 3D tilt on .glass elements
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    document.querySelectorAll('.glass').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            el.style.setProperty('--mx', `${x * 100}%`);
            el.style.setProperty('--my', `${y * 100}%`);
            el.style.setProperty('--rx', `${(x - 0.5) * 10}deg`);
            el.style.setProperty('--ry', `${(0.5 - y) * 10}deg`);
        });

        el.addEventListener('pointerleave', () => {
            el.style.setProperty('--rx', '0deg');
            el.style.setProperty('--ry', '0deg');
        });
    });
})();
