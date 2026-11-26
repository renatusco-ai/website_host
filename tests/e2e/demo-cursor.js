export function installDemoCursor() {
  document.addEventListener('DOMContentLoaded', () => {
    const pointer = document.createElement('div');
    pointer.setAttribute('aria-hidden', 'true');
    pointer.hidden = true;
    pointer.style.cssText = `
      position: fixed; top: 0; left: 0; z-index: 2147483647;
      width: 22px; height: 29px; pointer-events: none;
      filter: drop-shadow(0 1px 2px #0006);
    `;
    pointer.innerHTML = `<svg width="22" height="29" viewBox="0 0 22 29" fill="none">
      <path d="M2 2l16 14h-7l3.5 8-3.5 1.6-3.5-8-5.5 5z"
        fill="#161616" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    document.body.append(pointer);
    let activeRing;

    function positionPointer(event) {
      pointer.hidden = false;
      pointer.style.transform = `translate(${event.clientX - 2}px, ${event.clientY - 2}px)`;
    }

    document.addEventListener('pointermove', positionPointer, true);
    document.addEventListener('scroll', () => activeRing?.remove(), true);
    document.addEventListener('pointerdown', event => {
      positionPointer(event);
      activeRing?.remove();
      const ring = document.createElement('div');
      activeRing = ring;
      ring.setAttribute('aria-hidden', 'true');
      ring.style.cssText = `
        position: fixed; top: ${event.clientY - 18}px; left: ${event.clientX - 18}px;
        z-index: 2147483646; width: 36px; height: 36px; border: 3px solid #136cf2;
        border-radius: 50%; background: #136cf226; box-shadow: 0 0 0 2px #fff;
        pointer-events: none;
      `;
      document.body.append(ring);
      const pulse = ring.animate([
        { transform: 'scale(.55)', opacity: 1 },
        { transform: 'scale(1.15)', opacity: 1, offset: .4 },
        { transform: 'scale(1.45)', opacity: 0 },
      ], { duration: 580, easing: 'ease-out' });
      pulse.onfinish = () => ring.remove();
    }, true);
  }, { once: true });
}
