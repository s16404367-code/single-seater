const deadline = Date.now() + 30000;
while (true) {
  try {
    const response = await fetch('http://127.0.0.1:4173/single-seater/');
    if (response.ok) break;
  } catch {}
  if (Date.now() > deadline) throw new Error('Production server did not start');
  await new Promise((resolve) => setTimeout(resolve, 200));
}
