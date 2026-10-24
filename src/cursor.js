// cursor.js: a pixel-art mouse cursor to match the hand-made UI (gold arrow with a dark outline; it turns cyan over anything clickable)
{ const arrow = (fill, hi) => { const px = ['X', 'XX', 'XFX', 'XFFX', 'XFFFX', 'XFFFFX', 'XFFFFFX', 'XFFFFFFX', 'XFFFFFFFX', 'XFFFFFXXXX', 'XFFXFFX', 'XFX XFFX', 'XX  XFFX', 'X    XFFX', '     XFFX', '      XX'];
    let r = ''; px.forEach((row, y) => [...row].forEach((c, x) => { if (c === ' ') return; r += `<rect x="${x * 2}" y="${y * 2}" width="2" height="2" fill="${c === 'X' ? '#14161b' : (x === 1 || y === x ? hi : fill)}"/>`; }));
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='32' shape-rendering='crispEdges'>${r.replace(/"/g, "'")}</svg>`)}") 1 1`; };
  const st = document.createElement('style'); st.textContent = `html, body, body * { cursor: ${arrow('#ffd36a', '#fff3c4')}, auto; }
button, a, select, label, [role=button], .pbtn, .hbtn, .tbtn, .rowi, #radioDev, input[type=range], input[type=checkbox] { cursor: ${arrow('#4fe0ff', '#d8fbff')}, pointer !important; }
input[type=text], input[type=number], input:not([type]), textarea { cursor: text !important; }`; document.head.appendChild(st); }
