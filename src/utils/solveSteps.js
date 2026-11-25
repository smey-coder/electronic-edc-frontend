import { CONSTANTS, FUNCTIONS, describeSymbol, parseExpression } from './edcExpression';

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
    case 'var':
      return node.name;
    case 'const':
      return node.name === 'pi' ? 'π' : node.name;
    case 'group':
      return `(${print(node.inner)})`;
    case 'call':
      return `${node.name}(${node.args.map((arg) => print(arg)).join(', ')})`;
    case 'un':
      return `${node.op}${print(node.arg, true)}`;
    case 'bin':
      return `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)}`;
    default:
      return '?';
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
    case 'var':
      return { type: 'num', value: Number(values[node.name]) };
    case 'const':
      return { type: 'num', value: CONSTANTS[node.name] };
    case 'group':
      return { type: 'group', inner: substitute(node.inner, values) };
    case 'un':
      return { ...node, arg: substitute(node.arg, values) };
    case 'bin':
      return { ...node, left: substitute(node.left, values), right: substitute(node.right, values) };
    case 'call':
      return { ...node, args: node.args.map((arg) => substitute(arg, values)) };
    default:
      return node;
  }
}

function collapse(node) {
  switch (node.type) {
    case 'group': {
      const inner = collapse(node.inner);
      return isNum(inner) ? inner : { type: 'group', inner };
    }
    case 'un':
      return { ...node, arg: collapse(node.arg) };
    case 'bin':
      return { ...node, left: collapse(node.left), right: collapse(node.right) };
    case 'call':
      return { ...node, args: node.args.map(collapse) };
    default:
      return node;
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
    if (!Number.isFinite(value)) {
      throw new SolveError(node.op === '/' && node.right.value === 0 ? 'Division by zero.' : 'The calculation does not give a valid number.');
    }
    text = `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)} = ${formatNumber(value)}`;
    log.push({ text, type: node.op });
  } else if (node.type === 'un') {
    value = node.op === '-' ? -node.arg.value : node.arg.value;
    text = `${node.op}${print(node.arg, true)} = ${formatNumber(value)}`;
    log.push({ text, type: 'un' });
  } else {
    value = FUNCTIONS[node.name].fn(...node.args.map((arg) => arg.value));
    if (!Number.isFinite(value)) throw new SolveError(`${node.name}(${node.args.map((arg) => formatNumber(arg.value)).join(', ')}) is not a valid number.`);
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
    default:
      return node;
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

    // Show final result Version 1
    // steps.push({ kind: 'result', title: 'Result', value: formatNumber(tree.value, 8), raw: tree.value });

    // Show final result Version 2
    const resultVariable = variables?.find(
      (variable) => variable.is_result === true
    );

    const resultUnit = resultVariable?.unit || '';

    steps.push({
      kind: 'result',
      title: 'Final Result',
      value: formatNumber(tree.value, 8),
      raw: tree.value,
      unit: resultUnit,
      displayValue: `${formatNumber(tree.value, 8)} ${resultUnit}`.trim(),
      label: resultVariable?.display_name || 'Calculated Result'
    });

    return { ok: true, value: tree.value, steps };
  } catch (error) {
    if (error instanceof SolveError) return { ok: false, error: error.message };
    throw error;
  }
}