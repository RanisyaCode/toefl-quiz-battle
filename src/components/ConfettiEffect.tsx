import confetti from 'canvas-confetti';

export function firePodiumConfetti() {
  // Burst 1: Center burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#A78BFA', '#F9A8D4', '#FDE047', '#60A5FA', '#34D399']
  });

  // Burst 2: Side cannons after 300ms
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#A78BFA', '#F9A8D4', '#FDE047']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#A78BFA', '#F9A8D4', '#FDE047']
    });
  }, 350);
}

export function fireCorrectConfetti() {
  confetti({
    particleCount: 25,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#34D399', '#FDE047', '#A78BFA']
  });
}
