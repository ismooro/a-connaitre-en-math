// Convertit la notation texte des questions en MathML : fractions, racines, exposants, indices, conjugués.
// Les banques de questions restent en texte simple ; seul l'affichage change.
(function (App) {
  const SUP = { '²': '2', 'ⁿ': 'n' }, SUB = { '₁': '1', '₂': '2' };
  const OPS = '+−·×=⇒⇔∈|';
  const FN = /^(cos|sin|tan|arg|Re|Im)/;
  const THIN = { m: '<mspace width="0.17em"/>' };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const row = (nodes) => `<mrow>${nodes.map((n) => n.m).join('')}</mrow>`;
  const script = (s) => (/\d/.test(s) ? `<mn>${s}</mn>` : `<mi>${s}</mi>`);
  const isLetter = (c) => /\p{L}/u.test(c || '');

  function convert(src) {
    let pos = 0;

    // Consomme le caractère ouvrant, lit jusqu'au fermant.
    function open(end) {
      pos++;
      const nodes = seq(end);
      if (src[pos] === end) pos++;
      return nodes;
    }

    function seq(end) {
      const out = [];
      while (pos < src.length && src[pos] !== end) {
        const c = src[pos];
        if (c === ' ') {
          const n = src[++pos];
          if (out.length && !out[out.length - 1].op && n && n !== ')' && n !== '/' && !OPS.includes(n)) out.push(THIN);
        } else if (c === '/') {
          pos++;
          fraction(out);
        } else {
          out.push(atom());
        }
      }
      return out;
    }

    // Numérateur = les facteurs juste avant la barre, dénominateur = ceux juste après.
    function fraction(out) {
      let k = out.length;
      while (k > 0 && !out[k - 1].op) k--;
      const num = out.splice(k), den = [];
      for (;;) {
        let p = pos;
        while (src[p] === ' ') p++;
        const c = src[p];
        if (p >= src.length || c === ')' || c === '/' || OPS.includes(c)) break;
        if (den.length && p > pos) den.push(THIN);
        pos = p;
        den.push(atom());
      }
      const part = (n) => (n.length === 1 && n[0].inner ? n[0].inner : row(n));
      out.push({ m: `<mfrac>${part(num)}${part(den)}</mfrac>`, frac: true });
    }

    function atom() {
      const c = src[pos];
      let node, f;
      if (c === '(' || c === '|') {
        const end = c === '(' ? ')' : '|', before = src[pos - 1], nodes = open(end);
        const lone = c === '(' && nodes.length === 1 && nodes[0].frac && !isLetter(before) && !SUP[src[pos]] && src[pos] !== '^';
        node = lone ? nodes[0] : { m: `<mrow><mo>${c}</mo>${row(nodes)}<mo>${end}</mo></mrow>`, inner: c === '(' ? row(nodes) : undefined };
      } else if (c === '√') {
        pos++;
        node = { m: `<msqrt>${src[pos] === '(' ? row(open(')')) : atom().m}</msqrt>` };
      } else if (/\d/.test(c)) {
        let s = '';
        while (/[\d\u202f]/.test(src[pos] || '')) s += src[pos++];
        node = { m: `<mn>${s}</mn>` };
      } else if (OPS.includes(c)) {
        pos++;
        return { m: `<mo>${c}</mo>`, op: true };
      } else if ((f = FN.exec(src.slice(pos)))) {
        pos += f[0].length;
        node = { m: `<mi>${f[0]}</mi>` };
      } else {
        pos++;
        if (isLetter(c)) node = { m: `<mi>${c}</mi>` };
        else return { m: c === '!' ? '<mo lspace="0" rspace="0">!</mo>' : `<mi>${esc(c)}</mi>` };
      }
      return post(node);
    }

    // Indices, exposants (² ⁿ ^(…)) et barre de conjugué placés après un élément.
    function post(node) {
      let sub = '', sup = '', bar = false;
      for (;;) {
        const c = src[pos];
        if (c === '\u0304' || c === '\u0305') bar = true;
        else if (SUB[c]) sub = script(SUB[c]);
        else if (SUP[c]) sup = script(SUP[c]);
        else if (c === '^') {
          pos++;
          sup = src[pos] === '(' ? row(open(')')) : atom().m;
          continue;
        } else break;
        pos++;
      }
      if (!sub && !sup && !bar) return node;
      let m = bar ? `<mover accent="true">${node.m}<mo>¯</mo></mover>` : node.m;
      if (sub && sup) m = `<msubsup>${m}${sub}${sup}</msubsup>`;
      else if (sub) m = `<msub>${m}${sub}</msub>`;
      else if (sup) m = `<msup>${m}${sup}</msup>`;
      return { m };
    }

    return `<math>${row(seq())}</math>`;
  }

  App.math = { toMathML(src) { try { return convert(src); } catch (e) { return esc(src); } } };
})(window.App = window.App || {});
