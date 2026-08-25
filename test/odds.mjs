function cat(c0, c1, c2, c3, c4, c5, c6, n) {
  const rc = new Int8Array(13),
    sc = new Int8Array(4),
    sr = new Int16Array(4);
  const cs = [c0, c1, c2, c3, c4, c5, c6];
  let mask = 0;
  for (let i = 0; i < n; i++) {
    const c = cs[i],
      r = c >> 2,
      s = c & 3;
    rc[r]++;
    sc[s]++;
    sr[s] |= 1 << r;
    mask |= 1 << r;
  }
  const run = (m) => {
    for (let hi = 12; hi >= 4; hi--) {
      const need = 0b11111 << (hi - 4);
      if ((m & need) === need) return hi;
    }
    return (m & 0b1111) === 0b1111 && (m >> 12) & 1 ? 3 : -1;
  };
  let fs = -1;
  for (let s = 0; s < 4; s++) if (sc[s] >= 5) fs = s;
  if (fs >= 0) {
    const h = run(sr[fs]);
    if (h >= 0) return h === 12 ? 0 : 1;
  }
  let four = 0,
    three = 0,
    pair = 0;
  for (let r = 0; r < 13; r++) {
    if (rc[r] === 4) four++;
    else if (rc[r] === 3) three++;
    else if (rc[r] === 2) pair++;
  }
  if (four) return 2;
  if (three >= 2 || (three && pair)) return 3;
  if (fs >= 0) return 4;
  if (run(mask) >= 0) return 5;
  if (three) return 6;
  if (pair >= 2) return 7;
  if (pair) return 8;
  return 9;
}
const P = 10,
  N = Number(process.argv[2] ?? 2_000_000);
const deck = Int8Array.from({ length: 52 }, (_, i) => i);
// hits[street][players-1][category]
const hits = [0, 1, 2].map(() =>
  Array.from({ length: P }, () => new Float64Array(10)),
);
const seen = [0, 1, 2].map(() => new Uint8Array(10));
for (let t = 0; t < N; t++) {
  for (let i = 0; i < 5 + 2 * P; i++) {
    const j = i + ((Math.random() * (52 - i)) | 0);
    const x = deck[i];
    deck[i] = deck[j];
    deck[j] = x;
  }
  const b0 = deck[0],
    b1 = deck[1],
    b2 = deck[2],
    b3 = deck[3],
    b4 = deck[4];
  for (const s of [0, 1, 2]) seen[s].fill(0);
  for (let p = 0; p < P; p++) {
    const h0 = deck[5 + 2 * p],
      h1 = deck[6 + 2 * p];
    const c5 = cat(b0, b1, b2, h0, h1, 0, 0, 5);
    const c6 = cat(b0, b1, b2, b3, h0, h1, 0, 6);
    const c7 = cat(b0, b1, b2, b3, b4, h0, h1, 7);
    seen[0][c5] = 1;
    seen[1][c6] = 1;
    seen[2][c7] = 1;
    for (const s of [0, 1, 2])
      for (let c = 0; c < 10; c++) if (seen[s][c]) hits[s][p][c]++;
  }
}
const out = [0, 1, 2].map((s) =>
  Array.from({ length: P }, (_, p) =>
    Array.from({ length: 10 }, (_, c) => {
      const n = hits[s][p][c];
      return n ? N / n : Infinity;
    }),
  ),
);
console.log(JSON.stringify(out));
