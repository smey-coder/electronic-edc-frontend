// /**
//  * Helpers for writing Electrical / Electronic (EDC) formulas.
//  *
//  * Syntax used (same as Python's math): + - * / % ** ( ) and the functions in FUNCTIONS.
//  * IMPORTANT: the lists below must match what your backend can calculate.
//  * If your backend supports fewer or other functions, edit FUNCTIONS and CONSTANTS here.
//  * Trigonometric functions use RADIANS (use radians(x) to convert degrees).
//  */

// /* ------------------------------------------------------------------ */
// /* Functions and constants                                             */
// /* ------------------------------------------------------------------ */
// export const FUNCTIONS = {
//   sqrt: { min: 1, max: 1, fn: Math.sqrt },
//   abs: { min: 1, max: 1, fn: Math.abs },
//   sin: { min: 1, max: 1, fn: Math.sin },
//   cos: { min: 1, max: 1, fn: Math.cos },
//   tan: { min: 1, max: 1, fn: Math.tan },
//   asin: { min: 1, max: 1, fn: Math.asin },
//   acos: { min: 1, max: 1, fn: Math.acos },
//   atan: { min: 1, max: 1, fn: Math.atan },
//   atan2: { min: 2, max: 2, fn: Math.atan2 },
//   sinh: { min: 1, max: 1, fn: Math.sinh },
//   cosh: { min: 1, max: 1, fn: Math.cosh },
//   tanh: { min: 1, max: 1, fn: Math.tanh },
//   log: { min: 1, max: 1, fn: Math.log }, // natural logarithm (ln)
//   log10: { min: 1, max: 1, fn: Math.log10 },
//   log2: { min: 1, max: 1, fn: Math.log2 },
//   exp: { min: 1, max: 1, fn: Math.exp },
//   pow: { min: 2, max: 2, fn: Math.pow },
//   min: { min: 1, max: Infinity, fn: Math.min },
//   max: { min: 1, max: Infinity, fn: Math.max },
//   floor: { min: 1, max: 1, fn: Math.floor },
//   ceil: { min: 1, max: 1, fn: Math.ceil },
//   radians: { min: 1, max: 1, fn: (x) => (x * Math.PI) / 180 },
//   degrees: { min: 1, max: 1, fn: (x) => (x * 180) / Math.PI },
// };

// export const CONSTANTS = { pi: Math.PI, e: Math.E };

// /* ------------------------------------------------------------------ */
// /* Normalize what the user types                                       */
// /* ------------------------------------------------------------------ */
// const CHAR_MAP = {
//   '×': '*', '·': '*', '÷': '/', '−': '-', '–': '-', '^': '**', '²': '**2', '³': '**3', '√': 'sqrt',
//   π: 'pi', ω: 'omega', φ: 'phi', θ: 'theta', μ: 'mu', λ: 'lambda', ρ: 'rho', ε: 'eps', η: 'eta', β: 'beta', τ: 'tau',
//   '[': '(', ']': ')', '{': '(', '}': ')',
// };

// /** 2×V → 2*V, x^2 → x**2, π → pi, SQRT( → sqrt( ... */
// export function normalizeExpression(source) {
//   return String(source ?? '')
//     .replace(/[×·÷−–^²³√πωφθμλρεηβτ[\]{}]/g, (ch) => CHAR_MAP[ch] ?? ch)
//     .replace(/[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, (name) => (FUNCTIONS[name.toLowerCase()] ? name.toLowerCase() : name));
// }

// /* ------------------------------------------------------------------ */
// /* Tokenizer + parser (gives clear error messages)                     */
// /* ------------------------------------------------------------------ */
// class ExprError extends Error {}
// class MissingValueError extends Error {
//   constructor(name) {
//     super(`Enter a value for ${name}.`);
//     this.variable = name;
//   }
// }

// function tokenize(src) {
//   const tokens = [];
//   let i = 0;
//   while (i < src.length) {
//     const ch = src[i];
//     if (/\s/.test(ch)) {
//       i += 1;
//       continue;
//     }
//     const rest = src.slice(i);
//     let match = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);
//     if (match) {
//       tokens.push({ type: 'num', value: match[0] });
//       i += match[0].length;
//       continue;
//     }
//     match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
//     if (match) {
//       tokens.push({ type: 'id', value: match[0] });
//       i += match[0].length;
//       continue;
//     }
//     if (rest.startsWith('**')) {
//       tokens.push({ type: 'op', value: '**' });
//       i += 2;
//       continue;
//     }
//     if ('+-*/%(),'.includes(ch)) {
//       tokens.push({ type: 'op', value: ch });
//       i += 1;
//       continue;
//     }
//     throw new ExprError(
//       /[^\x00-\x7F]/.test(ch)
//         ? `The symbol "${ch}" is not supported. Use letters instead, for example omega, phi, theta.`
//         : `The character "${ch}" is not supported.`,
//     );
//   }
//   return tokens;
// }

// function parseTokens(tokens) {
//   let p = 0;
//   const peek = () => tokens[p];
//   const take = () => tokens[p++];
//   const isOp = (token, value) => token && token.type === 'op' && token.value === value;

//   function expr() {
//     let left = term();
//     while (isOp(peek(), '+') || isOp(peek(), '-')) {
//       const op = take().value;
//       left = { type: 'bin', op, left, right: term() };
//     }
//     return left;
//   }

//   function term() {
//     let left = unary();
//     while (isOp(peek(), '*') || isOp(peek(), '/') || isOp(peek(), '%')) {
//       const op = take().value;
//       left = { type: 'bin', op, left, right: unary() };
//     }
//     return left;
//   }

//   function unary() {
//     if (isOp(peek(), '-') || isOp(peek(), '+')) {
//       const op = take().value;
//       return { type: 'un', op, arg: unary() };
//     }
//     return power();
//   }

//   function power() {
//     const base = atom();
//     if (isOp(peek(), '**')) {
//       take();
//       return { type: 'bin', op: '**', left: base, right: unary() };
//     }
//     return base;
//   }

//   function atom() {
//     const token = take();
//     if (!token) throw new ExprError('The expression ends too early. Something is missing after the last symbol.');

//     if (token.type === 'num') return { type: 'num', value: Number(token.value) };

//     if (token.type === 'id') {
//       if (isOp(peek(), '(')) {
//         const spec = FUNCTIONS[token.value];
//         if (!spec) {
//           throw new ExprError(`Unknown function "${token.value}". Use the Functions buttons, or write ${token.value} * ( … ) to multiply.`);
//         }
//         take();
//         const args = [];
//         if (!isOp(peek(), ')')) {
//           args.push(expr());
//           while (isOp(peek(), ',')) {
//             take();
//             args.push(expr());
//           }
//         }
//         if (!isOp(peek(), ')')) throw new ExprError(`Close "${token.value}(" with a ")".`);
//         take();
//         if (args.length < spec.min || args.length > spec.max) {
//           const need = spec.min === spec.max ? spec.min : `at least ${spec.min}`;
//           throw new ExprError(`${token.value}() needs ${need} value${need === 1 ? '' : 's'}, but has ${args.length}.`);
//         }
//         return { type: 'call', name: token.value, args };
//       }
//       if (token.value in CONSTANTS) return { type: 'const', name: token.value };
//       return { type: 'var', name: token.value };
//     }

//     if (isOp(token, '(')) {
//       const inner = expr();
//       if (!isOp(peek(), ')')) throw new ExprError('A "(" is not closed. Add a ")".');
//       take();
//       return inner;
//     }
//     if (isOp(token, ')')) throw new ExprError('There is a ")" without a matching "(".');
//     throw new ExprError(`Unexpected "${token.value}". A number, a symbol or "(" is expected there.`);
//   }

//   const ast = expr();
//   const extra = peek();
//   if (extra) {
//     if (isOp(extra, ')')) throw new ExprError('There is a ")" without a matching "(".');
//     throw new ExprError(`Add an operator (such as * or +) before "${extra.value}". For example write 2*V, not 2V.`);
//   }
//   return ast;
// }

// function collectVariables(node, found = []) {
//   if (node.type === 'var' && !found.includes(node.name)) found.push(node.name);
//   if (node.left) collectVariables(node.left, found);
//   if (node.right) collectVariables(node.right, found);
//   if (node.arg) collectVariables(node.arg, found);
//   if (node.args) node.args.forEach((arg) => collectVariables(arg, found));
//   return found;
// }

// /**
//  * Check an expression. Returns { ok, empty, error, ast, variables }.
//  * Accepts what the user typed (it is normalized first).
//  */
// export function parseExpression(source) {
//   const text = normalizeExpression(source).trim();
//   if (!text) return { ok: false, empty: true, error: null, ast: null, variables: [] };
//   try {
//     const ast = parseTokens(tokenize(text));
//     return { ok: true, empty: false, error: null, ast, variables: collectVariables(ast) };
//   } catch (error) {
//     if (error instanceof ExprError) return { ok: false, empty: false, error: error.message, ast: null, variables: [] };
//     throw error;
//   }
// }

// /** Calculate a parsed expression. values = { V: "12", R: "4" }. Throws MissingValueError or Error. */
// export function evaluateExpression(ast, values) {
//   const run = (node) => {
//     switch (node.type) {
//       case 'num':
//         return node.value;
//       case 'const':
//         return CONSTANTS[node.name];
//       case 'var': {
//         const raw = values[node.name];
//         if (raw === undefined || raw === '' || Number.isNaN(Number(raw))) throw new MissingValueError(node.name);
//         return Number(raw);
//       }
//       case 'un':
//         return node.op === '-' ? -run(node.arg) : run(node.arg);
//       case 'call':
//         return FUNCTIONS[node.name].fn(...node.args.map(run));
//       case 'bin': {
//         const a = run(node.left);
//         const b = run(node.right);
//         if (node.op === '+') return a + b;
//         if (node.op === '-') return a - b;
//         if (node.op === '*') return a * b;
//         if (node.op === '/') return a / b;
//         if (node.op === '%') return a % b;
//         return a ** b;
//       }
//       default:
//         throw new Error('Unknown expression part.');
//     }
//   };
//   return run(ast);
// }

// export const isMissingValue = (error) => error instanceof MissingValueError;

// /* ------------------------------------------------------------------ */
// /* Names, descriptions and units of common EDC symbols                 */
// /* ------------------------------------------------------------------ */
// const SYMBOLS = {
//   V: ['Voltage', 'V'], I: ['Current', 'A'], R: ['Resistance', 'Ω'], L: ['Inductance', 'H'], C: ['Capacitance', 'F'],
//   Z: ['Impedance', 'Ω'], X: ['Reactance', 'Ω'], XL: ['Inductive reactance', 'Ω'], XC: ['Capacitive reactance', 'Ω'],
//   P: ['Real power', 'W'], Q: ['Reactive power', 'var'], S: ['Apparent power', 'VA'], G: ['Conductance', 'S'],
//   E: ['Energy', 'J'], f: ['Frequency', 'Hz'], T: ['Period', 's'], t: ['Time', 's'], omega: ['Angular frequency', 'rad/s'],
//   phi: ['Phase angle', 'rad'], theta: ['Angle', 'rad'], tau: ['Time constant', 's'],
//   Vp: ['Peak voltage', 'V'], Vrms: ['RMS voltage', 'V'], Irms: ['RMS current', 'A'], Vin: ['Input voltage', 'V'],
//   Vout: ['Output voltage', 'V'], Vs: ['Source voltage', 'V'], V0: ['Initial voltage', 'V'], Vf: ['Forward voltage', 'V'],
//   Vcc: ['Supply voltage', 'V'], Vpri: ['Primary voltage', 'V'], VL: ['Line voltage', 'V'], IL: ['Line current', 'A'],
//   Itotal: ['Total current', 'A'], Ic: ['Collector current', 'A'], Ib: ['Base current', 'A'], Ie: ['Emitter current', 'A'],
//   Rf: ['Feedback resistance', 'Ω'], Rin: ['Input resistance', 'Ω'], Pin: ['Input power', 'W'], Pout: ['Output power', 'W'],
//   rho: ['Resistivity', 'Ω·m'], l: ['Length', 'm'], A: ['Area', 'm²'], d: ['Distance', 'm'], eps: ['Permittivity', 'F/m'],
//   Np: ['Primary turns', ''], Ns: ['Secondary turns', ''], N: ['Number of turns', ''], eta: ['Efficiency', '%'], beta: ['Current gain', ''],
// };

// /** { display_name, unit } for a symbol such as V, R1, C_2. Empty strings when unknown. */
// export function describeSymbol(name) {
//   const entry = SYMBOLS[name] ?? SYMBOLS[name.replace(/[0-9_].*$/, '')];
//   return entry ? { display_name: entry[0], unit: entry[1] } : { display_name: '', unit: '' };
// }

// /* ------------------------------------------------------------------ */
// /* Buttons for the builder                                             */
// /* ------------------------------------------------------------------ */
// const fn = (name, title, extra = {}) => ({ label: `${name}( )`, insert: `${name}()`, back: 1, wrap: true, title, ...extra });
// const sym = (name) => ({ label: name, insert: name, title: describeSymbol(name).display_name || name });

// export const PALETTE = {
//   operators: [
//     { label: '+', insert: ' + ', title: 'Add' },
//     { label: '−', insert: ' - ', title: 'Subtract' },
//     { label: '×', insert: ' * ', title: 'Multiply' },
//     { label: '÷', insert: ' / ', title: 'Divide' },
//     { label: 'xʸ', insert: '**', title: 'Power (x ** y)' },
//     { label: '( )', insert: '()', back: 1, wrap: true, title: 'Brackets' },
//     { label: '%', insert: ' % ', title: 'Remainder' },
//     { label: ',', insert: ', ', title: 'Separator inside pow(a, b), min(a, b) …' },
//   ],
//   functions: [
//     fn('sqrt', 'Square root'), fn('abs', 'Absolute value'),
//     fn('sin', 'Sine (radians)'), fn('cos', 'Cosine (radians)'), fn('tan', 'Tangent (radians)'),
//     fn('asin', 'Inverse sine'), fn('acos', 'Inverse cosine'), fn('atan', 'Inverse tangent'),
//     fn('log', 'Natural logarithm (ln)'), fn('log10', 'Logarithm base 10 (for dB)'), fn('exp', 'e to the power x (charging / discharging)'),
//     fn('pow', 'pow(x, y) = x to the power y', { back: 1, wrap: false }), fn('min', 'Smallest value', { wrap: false }), fn('max', 'Largest value', { wrap: false }),
//     fn('radians', 'Degrees → radians'), fn('degrees', 'Radians → degrees'), fn('sinh', 'Hyperbolic sine'), fn('cosh', 'Hyperbolic cosine'), fn('tanh', 'Hyperbolic tangent'),
//   ],
//   constants: [
//     { label: 'π', insert: 'pi', title: 'pi = 3.14159…' },
//     { label: 'e', insert: 'e', title: 'Euler number = 2.71828…' },
//   ],
//   symbols: [
//     'V', 'I', 'R', 'L', 'C', 'Z', 'XL', 'XC', 'P', 'Q', 'S', 'f', 't', 'T', 'omega', 'phi', 'theta', 'tau',
//     'Vp', 'Vrms', 'Irms', 'Vin', 'Vout', 'Vs', 'R1', 'R2', 'R3', 'C1', 'C2', 'L1', 'L2', 'Pin', 'Pout', 'eta',
//   ].map(sym),
// };

// /* ------------------------------------------------------------------ */
// /* EDC formula templates                                               */
// /* ------------------------------------------------------------------ */
// const T = (group, title, expression, description) => ({ id: `${group}:${title}`, group, title, expression, description });

// export const TEMPLATE_GROUPS = ['DC circuits', 'AC circuits', 'Transients & energy', 'Electronics & power'];

// export const EDC_TEMPLATES = [
//   // --- DC circuits ---
//   T('DC circuits', "Ohm's law: voltage", 'I * R', 'Voltage = current × resistance'),
//   T('DC circuits', "Ohm's law: current", 'V / R', 'Current = voltage ÷ resistance'),
//   T('DC circuits', "Ohm's law: resistance", 'V / I', 'Resistance = voltage ÷ current'),
//   T('DC circuits', 'Electric power', 'V * I', 'Power = voltage × current'),
//   T('DC circuits', 'Power from current', 'I**2 * R', 'Power = current² × resistance'),
//   T('DC circuits', 'Power from voltage', 'V**2 / R', 'Power = voltage² ÷ resistance'),
//   T('DC circuits', 'Electrical energy', 'P * t', 'Energy = power × time'),
//   T('DC circuits', 'Series resistance', 'R1 + R2 + R3', 'Total resistance of three resistors in series'),
//   T('DC circuits', 'Parallel resistance (2)', '(R1 * R2) / (R1 + R2)', 'Total resistance of two resistors in parallel'),
//   T('DC circuits', 'Parallel resistance (3)', '1 / (1 / R1 + 1 / R2 + 1 / R3)', 'Total resistance of three resistors in parallel'),
//   T('DC circuits', 'Voltage divider', 'Vin * R2 / (R1 + R2)', 'Output voltage across R2'),
//   T('DC circuits', 'Current divider', 'Itotal * R2 / (R1 + R2)', 'Current through R1'),
//   T('DC circuits', 'Conductance', '1 / R', 'Conductance = 1 ÷ resistance'),
//   T('DC circuits', 'Resistance of a wire', 'rho * l / A', 'Resistance = resistivity × length ÷ area'),

//   // --- AC circuits ---
//   T('AC circuits', 'Inductive reactance', '2 * pi * f * L', 'XL = 2πfL'),
//   T('AC circuits', 'Capacitive reactance', '1 / (2 * pi * f * C)', 'XC = 1 ÷ (2πfC)'),
//   T('AC circuits', 'Series RLC impedance', 'sqrt(R**2 + (XL - XC)**2)', 'Z = √(R² + (XL − XC)²)'),
//   T('AC circuits', 'Resonant frequency', '1 / (2 * pi * sqrt(L * C))', 'f0 = 1 ÷ (2π√(LC))'),
//   T('AC circuits', 'Angular frequency', '2 * pi * f', 'ω = 2πf'),
//   T('AC circuits', 'Period', '1 / f', 'T = 1 ÷ f'),
//   T('AC circuits', 'RMS voltage from peak', 'Vp / sqrt(2)', 'Vrms = Vpeak ÷ √2'),
//   T('AC circuits', 'Real power', 'Vrms * Irms * cos(phi)', 'P = V I cos φ (φ in radians; use radians(deg) for degrees)'),
//   T('AC circuits', 'Reactive power', 'Vrms * Irms * sin(phi)', 'Q = V I sin φ'),
//   T('AC circuits', 'Apparent power', 'Vrms * Irms', 'S = Vrms × Irms'),
//   T('AC circuits', 'Power factor', 'P / S', 'Power factor = real power ÷ apparent power'),
//   T('AC circuits', 'Quality factor (series RLC)', '(1 / R) * sqrt(L / C)', 'Q = (1/R)√(L/C)'),
//   T('AC circuits', 'Three-phase power', 'sqrt(3) * VL * IL * cos(phi)', 'P = √3 VL IL cos φ'),

//   // --- Transients & energy ---
//   T('Transients & energy', 'RC time constant', 'R * C', 'τ = RC'),
//   T('Transients & energy', 'RL time constant', 'L / R', 'τ = L ÷ R'),
//   T('Transients & energy', 'Capacitor charging voltage', 'Vs * (1 - exp(-t / (R * C)))', 'v(t) = Vs (1 − e^(−t/RC))'),
//   T('Transients & energy', 'Capacitor discharging voltage', 'V0 * exp(-t / (R * C))', 'v(t) = V0 e^(−t/RC)'),
//   T('Transients & energy', 'Energy in a capacitor', '0.5 * C * V**2', 'E = ½CV²'),
//   T('Transients & energy', 'Energy in an inductor', '0.5 * L * I**2', 'E = ½LI²'),
//   T('Transients & energy', 'Parallel-plate capacitance', 'eps * A / d', 'C = εA ÷ d'),

//   // --- Electronics & power ---
//   T('Electronics & power', 'Voltage gain (dB)', '20 * log10(Vout / Vin)', 'Gain in decibels'),
//   T('Electronics & power', 'Power gain (dB)', '10 * log10(Pout / Pin)', 'Power gain in decibels'),
//   T('Electronics & power', 'RC cutoff frequency', '1 / (2 * pi * R * C)', 'fc = 1 ÷ (2πRC)'),
//   T('Electronics & power', 'LED series resistor', '(Vs - Vf) / I', 'R = (Vsupply − Vforward) ÷ I'),
//   T('Electronics & power', 'Inverting op-amp output', '-(Rf / Rin) * Vin', 'Vout = −(Rf ÷ Rin) Vin'),
//   T('Electronics & power', 'Non-inverting op-amp output', '(1 + Rf / Rin) * Vin', 'Vout = (1 + Rf ÷ Rin) Vin'),
//   T('Electronics & power', 'BJT current gain', 'Ic / Ib', 'β = Ic ÷ Ib'),
//   T('Electronics & power', 'Transformer secondary voltage', 'Vpri * Ns / Np', 'Vs = Vp × Ns ÷ Np'),
//   T('Electronics & power', 'Efficiency', 'Pout / Pin * 100', 'Efficiency in percent'),
//   T('Electronics & power', '555 astable frequency', '1.44 / ((R1 + 2 * R2) * C)', 'f ≈ 1.44 ÷ ((R1 + 2R2) C)'),
// ];

// export function solveSteps({ expression, values = {}, variables = [] }) {
//   const parsed = parseExpression(expression);
//   if (!parsed.ok) return { ok: false, error: parsed.error ?? 'The expression is empty.' };

//   const missing = parsed.variables.filter((name) => values[name] === undefined || values[name] === '' || Number.isNaN(Number(values[name])));
//   if (missing.length > 0) return { ok: false, error: `Enter a value for ${missing.join(', ')}.` };

//   try {
//     const meta = Object.fromEntries((variables ?? []).map((variable) => [variable.variable_name, variable]));
//     const steps = [];

//     steps.push({ kind: 'formula', title: 'Write the formula', expression: print(parsed.ast) });

//     if (parsed.variables.length > 0) {
//       steps.push({
//         kind: 'given',
//         title: 'List the known values',
//         items: parsed.variables.map((name) => {
//           const guess = describeSymbol(name);
//           return {
//             name,
//             label: meta[name]?.display_name || guess.display_name,
//             unit: meta[name]?.unit ?? guess.unit,
//             value: formatNumber(Number(values[name])),
//           };
//         }),
//       });
//     }

//     let tree = collapse(substitute(parsed.ast, values));
//     const usesPi = JSON.stringify(parsed.ast).includes('"name":"pi"');
//     steps.push({
//       kind: 'substitute',
//       title: 'Substitute the values',
//       expression: print(tree),
//       note: usesPi ? 'π is about 3.14159.' : null,
//     });

//     let guard = 0;
//     while (!isNum(tree)) {
//       if (guard++ > 200) throw new SolveError('The calculation is too long to show step by step.');
//       const candidates = [];
//       findCandidates(tree, 0, candidates);
//       if (candidates.length === 0) throw new SolveError('This calculation cannot be shown step by step.');
//       const best = candidates.reduce((a, b) => (b.depth > a.depth || (b.depth === a.depth && b.rank < a.rank) ? b : a));

//       const log = [];
//       tree = collapse(rewrite(tree, 0, best, log));
//       steps.push({
//         kind: 'calc',
//         title: 'Calculation step',
//         details: log.map((entry) => entry.text),
//         expression: print(tree),
//       });
//     }

//     steps.push({ kind: 'result', title: 'Result', value: formatNumber(tree.value, 8), raw: tree.value });
//     return { ok: true, value: tree.value, steps };
//   } catch (error) {
//     if (error instanceof SolveError) return { ok: false, error: error.message };
//     throw error;
//   }
// }

/**
- Helpers for writing Electrical / Electronic (EDC) formulas.
 *
- Syntax used (same as Python's math): + - * / % ** ( ) and the functions in FUNCTIONS.
- IMPORTANT: the lists below must match what your backend can calculate.
- If your backend supports fewer or other functions, edit FUNCTIONS and CONSTANTS here.
- Trigonometric functions use RADIANS (use radians(x) to convert degrees).
 */

/* ------------------------------------------------------------------ */
/* Functions and constants                                             */
/* ------------------------------------------------------------------ */
export const FUNCTIONS = {
  sqrt: { min: 1, max: 1, fn: Math.sqrt },
  abs: { min: 1, max: 1, fn: Math.abs },
  sin: { min: 1, max: 1, fn: Math.sin },
  cos: { min: 1, max: 1, fn: Math.cos },
  tan: { min: 1, max: 1, fn: Math.tan },
  asin: { min: 1, max: 1, fn: Math.asin },
  acos: { min: 1, max: 1, fn: Math.acos },
  atan: { min: 1, max: 1, fn: Math.atan },
  atan2: { min: 2, max: 2, fn: Math.atan2 },
  sinh: { min: 1, max: 1, fn: Math.sinh },
  cosh: { min: 1, max: 1, fn: Math.cosh },
  tanh: { min: 1, max: 1, fn: Math.tanh },
  log: { min: 1, max: 1, fn: Math.log }, // natural logarithm (ln)
  log10: { min: 1, max: 1, fn: Math.log10 },
  log2: { min: 1, max: 1, fn: Math.log2 },
  exp: { min: 1, max: 1, fn: Math.exp },
  pow: { min: 2, max: 2, fn: Math.pow },
  min: { min: 1, max: Infinity, fn: Math.min },
  max: { min: 1, max: Infinity, fn: Math.max },
  floor: { min: 1, max: 1, fn: Math.floor },
  ceil: { min: 1, max: 1, fn: Math.ceil },
  radians: { min: 1, max: 1, fn: (x) => (x * Math.PI) / 180 },
  degrees: { min: 1, max: 1, fn: (x) => (x * 180) / Math.PI },
};

export const CONSTANTS = { pi: Math.PI, e: Math.E };

/* ------------------------------------------------------------------ */
/* Normalize what the user types                                       */
/* ------------------------------------------------------------------ */
const CHAR_MAP = {
  '×': '*', '·': '*', '÷': '/', '−': '-', '–': '-', '^': '**', '²': '**2', '³': '**3', '√': 'sqrt',
  π: 'pi', ω: 'omega', φ: 'phi', θ: 'theta', μ: 'mu', λ: 'lambda', ρ: 'rho', ε: 'eps', η: 'eta', β: 'beta', τ: 'tau',
  '[': '(', ']': ')', '{': '(', '}': ')',
};

export function normalizeExpression(source) {
  return String(source ?? '')
    .replace(/[×·÷−–^²³√πωφθμλρεηβτ[\]{}]/g, (ch) => CHAR_MAP[ch] ?? ch)
    .replace(/[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, (name) => (FUNCTIONS[name.toLowerCase()] ? name.toLowerCase() : name));
}

/* ------------------------------------------------------------------ */
/* Tokenizer + parser (gives clear error messages)                     */
/* ------------------------------------------------------------------ */
class ExprError extends Error {}
class MissingValueError extends Error {
  constructor(name) {
    super(`Enter a value for ${name}.`);
    this.variable = name;
  }
}

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    const rest = src.slice(i);
    let match = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest);
    if (match) {
      tokens.push({ type: 'num', value: match[0] });
      i += match[0].length;
      continue;
    }
    match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (match) {
      tokens.push({ type: 'id', value: match[0] });
      i += match[0].length;
      continue;
    }
    if (rest.startsWith('**')) {
      tokens.push({ type: 'op', value: '**' });
      i += 2;
      continue;
    }
    if ('+-*/%(),'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }
    throw new ExprError(
      /[^\x00-\x7F]/.test(ch)
        ? `The symbol "${ch}" is not supported. Use letters instead, for example omega, phi, theta.`
        : `The character "${ch}" is not supported.`,
    );
  }
  return tokens;
}

function parseTokens(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const take = () => tokens[p++];
  const isOp = (token, value) => token && token.type === 'op' && token.value === value;

  function expr() {
    let left = term();
    while (isOp(peek(), '+') || isOp(peek(), '-')) {
      const op = take().value;
      left = { type: 'bin', op, left, right: term() };
    }
    return left;
  }

  function term() {
    let left = unary();
    while (isOp(peek(), '*') || isOp(peek(), '/') || isOp(peek(), '%')) {
      const op = take().value;
      left = { type: 'bin', op, left, right: unary() };
    }
    return left;
  }

  function unary() {
    if (isOp(peek(), '-') || isOp(peek(), '+')) {
      const op = take().value;
      return { type: 'un', op, arg: unary() };
    }
    return power();
  }

  function power() {
    const base = atom();
    if (isOp(peek(), '**')) {
      take();
      return { type: 'bin', op: '**', left: base, right: unary() };
    }
    return base;
  }

  function atom() {
    const token = take();
    if (!token) throw new ExprError('The expression ends too early. Something is missing after the last symbol.');

    if (token.type === 'num') return { type: 'num', value: Number(token.value) };

    if (token.type === 'id') {
      if (isOp(peek(), '(')) {
        const spec = FUNCTIONS[token.value];
        if (!spec) {
          throw new ExprError(`Unknown function "${token.value}". Use the Functions buttons, or write ${token.value} * ( … ) to multiply.`);
        }
        take();
        const args = [];
        if (!isOp(peek(), ')')) {
          args.push(expr());
          while (isOp(peek(), ',')) {
            take();
            args.push(expr());
          }
        }
        if (!isOp(peek(), ')')) throw new ExprError(`Close "${token.value}(" with a ")".`);
        take();
        if (args.length < spec.min || args.length > spec.max) {
          const need = spec.min === spec.max ? spec.min : `at least ${spec.min}`;
          throw new ExprError(`${token.value}() needs ${need} value${need === 1 ? '' : 's'}, but has ${args.length}.`);
        }
        return { type: 'call', name: token.value, args };
      }
      if (token.value in CONSTANTS) return { type: 'const', name: token.value };
      return { type: 'var', name: token.value };
    }

    if (isOp(token, '(')) {
      const inner = expr();
      if (!isOp(peek(), ')')) throw new ExprError('A "(" is not closed. Add a ")".');
      take();
      return inner;
    }
    if (isOp(token, ')')) throw new ExprError('There is a ")" without a matching "(".');
    throw new ExprError(`Unexpected "${token.value}". A number, a symbol or "(" is expected there.`);
  }

  const ast = expr();
  const extra = peek();
  if (extra) {
    if (isOp(extra, ')')) throw new ExprError('There is a ")" without a matching "(".');
    throw new ExprError(`Add an operator (such as * or +) before "${extra.value}". For example write 2*V, not 2V.`);
  }
  return ast;
}

function collectVariables(node, found = []) {
  if (node.type === 'var' && !found.includes(node.name)) found.push(node.name);
  if (node.left) collectVariables(node.left, found);
  if (node.right) collectVariables(node.right, found);
  if (node.arg) collectVariables(node.arg, found);
  if (node.args) node.args.forEach((arg) => collectVariables(arg, found));
  return found;
}

export function parseExpression(source) {
  const text = normalizeExpression(source).trim();
  if (!text) return { ok: false, empty: true, error: null, ast: null, variables: [] };
  try {
    const ast = parseTokens(tokenize(text));
    return { ok: true, empty: false, error: null, ast, variables: collectVariables(ast) };
  } catch (error) {
    if (error instanceof ExprError) return { ok: false, empty: false, error: error.message, ast: null, variables: [] };
    throw error;
  }
}

export function evaluateExpression(ast, values) {
  const run = (node) => {
    switch (node.type) {
      case 'num':
        return node.value;
      case 'const':
        return CONSTANTS[node.name];
      case 'var': {
        const raw = values[node.name];
        if (raw === undefined || raw === '' || Number.isNaN(Number(raw))) throw new MissingValueError(node.name);
        return Number(raw);
      }
      case 'un':
        return node.op === '-' ? -run(node.arg) : run(node.arg);
      case 'call':
        return FUNCTIONS[node.name].fn(...node.args.map(run));
      case 'bin': {
        const a = run(node.left);
        const b = run(node.right);
        if (node.op === '+') return a + b;
        if (node.op === '-') return a - b;
        if (node.op === '*') return a * b;
        if (node.op === '/') return a / b;
        if (node.op === '%') return a % b;
        return a ** b;
      }
      default:
        throw new Error('Unknown expression part.');
    }
  };
  return run(ast);
}

export const isMissingValue = (error) => error instanceof MissingValueError;

/* ------------------------------------------------------------------ */
/* Symbols, Palette & Templates                                        */
/* ------------------------------------------------------------------ */
const SYMBOLS = {
  V: ['Voltage', 'V'], I: ['Current', 'A'], R: ['Resistance', 'Ω'], L: ['Inductance', 'H'], C: ['Capacitance', 'F'],
  Z: ['Impedance', 'Ω'], X: ['Reactance', 'Ω'], XL: ['Inductive reactance', 'Ω'], XC: ['Capacitive reactance', 'Ω'],
  P: ['Real power', 'W'], Q: ['Reactive power', 'var'], S: ['Apparent power', 'VA'], G: ['Conductance', 'S'],
  E: ['Energy', 'J'], f: ['Frequency', 'Hz'], T: ['Period', 's'], t: ['Time', 's'], omega: ['Angular frequency', 'rad/s'],
  phi: ['Phase angle', 'rad'], theta: ['Angle', 'rad'], tau: ['Time constant', 's'],
  Vp: ['Peak voltage', 'V'], Vrms: ['RMS voltage', 'V'], Irms: ['RMS current', 'A'], Vin: ['Input voltage', 'V'],
  Vout: ['Output voltage', 'V'], Vs: ['Source voltage', 'V'], V0: ['Initial voltage', 'V'], Vf: ['Forward voltage', 'V'],
  Vcc: ['Supply voltage', 'V'], Vpri: ['Primary voltage', 'V'], VL: ['Line voltage', 'V'], IL: ['Line current', 'A'],
  Itotal: ['Total current', 'A'], Ic: ['Collector current', 'A'], Ib: ['Base current', 'A'], Ie: ['Emitter current', 'A'],
  Rf: ['Feedback resistance', 'Ω'], Rin: ['Input resistance', 'Ω'], Pin: ['Input power', 'W'], Pout: ['Output power', 'W'],
  rho: ['Resistivity', 'Ω·m'], l: ['Length', 'm'], A: ['Area', 'm²'], d: ['Distance', 'm'], eps: ['Permittivity', 'F/m'],
  Np: ['Primary turns', ''], Ns: ['Secondary turns', ''], N: ['Number of turns', ''], eta: ['Efficiency', '%'], beta: ['Current gain', ''],
};

export function describeSymbol(name) {
  const entry = SYMBOLS[name] ?? SYMBOLS[name.replace(/[0-9_].*$/, '')];
  return entry ? { display_name: entry[0], unit: entry[1] } : { display_name: '', unit: '' };
}

const fn = (name, title, extra = {}) => ({ label: `${name}( )`, insert: `${name}()`, back: 1, wrap: true, title, ...extra });
const sym = (name) => ({ label: name, insert: name, title: describeSymbol(name).display_name || name });

export const PALETTE = {
  operators: [
    { label: '+', insert: ' + ', title: 'Add' },
    { label: '−', insert: ' - ', title: 'Subtract' },
    { label: '×', insert: ' * ', title: 'Multiply' },
    { label: '÷', insert: ' / ', title: 'Divide' },
    { label: 'xʸ', insert: '**', title: 'Power (x ** y)' },
    { label: '( )', insert: '()', back: 1, wrap: true, title: 'Brackets' },
    { label: '%', insert: ' % ', title: 'Remainder' },
    { label: ',', insert: ', ', title: 'Separator' },
  ],
  functions: [
    fn('sqrt', 'Square root'), fn('abs', 'Absolute value'),
    fn('sin', 'Sine'), fn('cos', 'Cosine'), fn('tan', 'Tangent'),
    fn('log', 'Natural logarithm (ln)'), fn('log10', 'Logarithm base 10'), fn('exp', 'Exponential'),
  ],
  constants: [{ label: 'π', insert: 'pi', title: 'pi' }, { label: 'e', insert: 'e', title: 'e' }],
  symbols: ['V', 'I', 'R', 'L', 'C', 'P', 'f', 't', 'R1', 'R2', 'Vin', 'Vout'].map(sym),
};

// EDC Templates
const T = (group, title, expression, description) => ({ id: `${group}:${title}`, group, title, expression, description });
export const TEMPLATE_GROUPS = ['DC circuits', 'AC circuits', 'Transients & energy', 'Electronics & power'];
export const EDC_TEMPLATES = [
  T('DC circuits', "Ohm's law: voltage", 'I * R', 'Voltage = current × resistance'),
  T('DC circuits', "Ohm's law: current", 'V / R', 'Current = voltage ÷ resistance'),
  T('DC circuits', 'Electric power', 'V * I', 'Power = voltage × current'),
];

/* ------------------------------------------------------------------ */
/* Step-by-Step Solver Engine (solveSteps)                            */
/* ------------------------------------------------------------------ */
export function formatNumber(value, digits = 6) {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(digits));
  const abs = Math.abs(rounded);
  if (abs >= 1e9 || abs < 1e-4) {
    const [mantissa, exponent] = rounded.toExponential().split('e');
    return `${mantissa} × 10^${Number(exponent)}`;
  }
  return String(rounded);
}

const SYMBOL = { '+': '+', '-': '-', '*': '×', '/': '÷', '%': '%', '**': '^' };

function print(node, wrapNegative = false) {
  switch (node.type) {
    case 'num': {
      const text = formatNumber(node.value);
      return wrapNegative && node.value < 0 ? `(${text})` : text;
    }
    case 'var': return node.name;
    case 'const': return node.name === 'pi' ? 'π' : node.name;
    case 'group': return `(${print(node.inner)})`;
    case 'call': return `${node.name}(${node.args.map((arg) => print(arg)).join(', ')})`;
    case 'un': return `${node.op}${print(node.arg, true)}`;
    case 'bin': return `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)}`;
    default: return '?';
  }
}

class SolveError extends Error {}

const isNum = (node) => node.type === 'num';
const RANK = { call: 0, '**': 1, un: 2, '*': 3, '/': 3, '%': 3, '+': 4, '-': 4 };

const isReady = (node) => {
  if (node.type === 'bin') return isNum(node.left) && isNum(node.right);
  if (node.type === 'un') return isNum(node.arg);
  if (node.type === 'call') return node.args.every(isNum);
  return false;
};
const rankOf = (node) => (node.type === 'call' ? RANK.call : node.type === 'un' ? RANK.un : RANK[node.op]);

function substitute(node, values) {
  switch (node.type) {
    case 'var': return { type: 'num', value: Number(values[node.name]) };
    case 'const': return { type: 'num', value: CONSTANTS[node.name] };
    case 'group': return { type: 'group', inner: substitute(node.inner, values) };
    case 'un': return { ...node, arg: substitute(node.arg, values) };
    case 'bin': return { ...node, left: substitute(node.left, values), right: substitute(node.right, values) };
    case 'call': return { ...node, args: node.args.map((arg) => substitute(arg, values)) };
    default: return node;
  }
}

function collapse(node) {
  switch (node.type) {
    case 'group': {
      const inner = collapse(node.inner);
      return isNum(inner) ? inner : { type: 'group', inner };
    }
    case 'un': return { ...node, arg: collapse(node.arg) };
    case 'bin': return { ...node, left: collapse(node.left), right: collapse(node.right) };
    case 'call': return { ...node, args: node.args.map(collapse) };
    default: return node;
  }
}

function findCandidates(node, depth, out) {
  if (node.type === 'group') findCandidates(node.inner, depth + 1, out);
  else if (node.type === 'bin') {
    findCandidates(node.left, depth, out);
    findCandidates(node.right, depth, out);
  } else if (node.type === 'un') findCandidates(node.arg, depth, out);
  else if (node.type === 'call') node.args.forEach((arg) => findCandidates(arg, depth + 1, out));
  if (isReady(node)) out.push({ depth, rank: rankOf(node) });
}

function applyBin(op, a, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return a / b;
  if (op === '%') return a % b;
  return a ** b;
}

function reduceNode(node, log) {
  let value;
  let text;
  if (node.type === 'bin') {
    value = applyBin(node.op, node.left.value, node.right.value);
    if (!Number.isFinite(value)) throw new SolveError('Invalid calculation result.');
    text = `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)} = ${formatNumber(value)}`;
    log.push({ text, type: node.op });
  } else if (node.type === 'un') {
    value = node.op === '-' ? -node.arg.value : node.arg.value;
    text = `${node.op}${print(node.arg, true)} = ${formatNumber(value)}`;
    log.push({ text, type: 'un' });
  } else {
    value = FUNCTIONS[node.name].fn(...node.args.map((arg) => arg.value));
    text = `${print(node)} = ${formatNumber(value)}`;
    log.push({ text, type: 'call', name: node.name });
  }
  return { type: 'num', value };
}

function rewrite(node, depth, best, log) {
  switch (node.type) {
    case 'group': {
      const inner = rewrite(node.inner, depth + 1, best, log);
      return isNum(inner) ? inner : { type: 'group', inner };
    }
    case 'bin': {
      const next = { ...node, left: rewrite(node.left, depth, best, log), right: rewrite(node.right, depth, best, log) };
      return isReady(node) && depth === best.depth && rankOf(node) === best.rank ? reduceNode(next, log) : next;
    }
    case 'un': {
      const next = { ...node, arg: rewrite(node.arg, depth, best, log) };
      return isReady(node) && depth === best.depth && rankOf(node) === best.rank ? reduceNode(next, log) : next;
    }
    case 'call': {
      const next = { ...node, args: node.args.map((arg) => rewrite(arg, depth + 1, best, log)) };
      return isReady(node) && depth === best.depth && rankOf(node) === best.rank ? reduceNode(next, log) : next;
    }
    default: return node;
  }
}

export function solveSteps({ expression, values = {}, variables = [] }) {
  const parsed = parseExpression(expression);
  if (!parsed.ok) return { ok: false, error: parsed.error ?? 'The expression is empty.' };

  const missing = parsed.variables.filter((name) => values[name] === undefined || values[name] === '' || Number.isNaN(Number(values[name])));
  if (missing.length > 0) return { ok: false, error: `Enter a value for ${missing.join(', ')}.` };

  try {
    const meta = Object.fromEntries((variables ?? []).map((variable) => [variable.variable_name, variable]));
    const steps = [];

    steps.push({ kind: 'formula', title: 'Write the formula', expression: print(parsed.ast) });

    if (parsed.variables.length > 0) {
      steps.push({
        kind: 'given',
        title: 'List the known values',
        items: parsed.variables.map((name) => {
          const guess = describeSymbol(name);
          return {
            name,
            label: meta[name]?.display_name || guess.display_name,
            unit: meta[name]?.unit ?? guess.unit,
            value: formatNumber(Number(values[name])),
          };
        }),
      });
    }

    let tree = collapse(substitute(parsed.ast, values));
    const usesPi = JSON.stringify(parsed.ast).includes('"name":"pi"');
    steps.push({
      kind: 'substitute',
      title: 'Substitute the values',
      expression: print(tree),
      note: usesPi ? 'π is about 3.14159.' : null,
    });

    let guard = 0;
    while (!isNum(tree)) {
      if (guard++ > 200) throw new SolveError('The calculation is too long to show step by step.');
      const candidates = [];
      findCandidates(tree, 0, candidates);
      if (candidates.length === 0) throw new SolveError('This calculation cannot be shown step by step.');
      const best = candidates.reduce((a, b) => (b.depth > a.depth || (b.depth === a.depth && b.rank < a.rank) ? b : a));

      const log = [];
      tree = collapse(rewrite(tree, 0, best, log));
      steps.push({
        kind: 'calc',
        title: 'Calculation step',
        details: log.map((entry) => entry.text),
        expression: print(tree),
      });
    }

    steps.push({ kind: 'result', title: 'Result', value: formatNumber(tree.value, 8), raw: tree.value,unit: variables?.[0]?.unit || "",});
    return { ok: true, value: tree.value, steps };
  } catch (error) {
    if (error instanceof SolveError) return { ok: false, error: error.message };
    throw error;
  }
}