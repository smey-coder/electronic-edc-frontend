ការពន្យល់កូដ JavaScript ជាភាសាខ្មែរ
កូដនេះគឺជា Mathematical Expression Solver ដែលអ្នកកំពុងប្រើក្នុងគម្រោង Electronic Engineering Design & Calculation System (Electronic EDC)។

មុខងារសំខាន់របស់វាគឺ៖
1. ទទួលយក Formula ពីអ្នកប្រើប្រាស់។
2. វិភាគ Mathematical Expression ដោយប្រើ AST (Abstract Syntax Tree)។
3. ទទួលតម្លៃ Variables ដូចជា V, I, R, L, A ។
4. ជំនួស Variables ទៅក្នុង Formula។
5. គណនាតាមលំដាប់ប្រតិបត្តិការគណិតវិទ្យា។
6. បង្ហាញលទ្ធផល និងជំហានគណនានីមួយៗ (Step-by-Step Solution)។
ឧទាហរណ៍៖

យើងមាន Formula សម្រាប់គណនា Voltage Drop៖
\[
V_d = \frac{2 \times \rho \times L \times I}{A}
\]

តម្លៃដែលអ្នកប្រើប្រាស់បញ្ចូល៖
Variable	Value	Unit
ρ (rho)	0.0175	Ω·mm²/m
L	20	m
I	10	A
A	2.5	mm²

ប្រព័ន្ធត្រូវជំនួសតម្លៃទាំងនេះទៅក្នុង Formula ហើយគណនាជាជំហានៗ។

1. Import Modules
import {
  CONSTANTS,
  FUNCTIONS,
  describeSymbol,
  parseExpression
} from './edcExpression';


ការពន្យល់៖

import គឺជា Keyword របស់ JavaScript ដែលប្រើសម្រាប់នាំយក Function ឬ Variables ពី File ផ្សេងមកប្រើក្នុង File បច្ចុប្បន្ន។

ក្នុងករណីនេះ វានាំយកមុខងារ និងទិន្នន័យពី edcExpression.js។
ឈ្មោះ	តួនាទី
CONSTANTS	ផ្ទុក Mathematical Constants ដូចជា π និង e ។
FUNCTIONS	ផ្ទុក Mathematical Functions ដូចជា sin, cos, sqrt ។
describeSymbol()	ទាញយកព័ត៌មាន Variable ដូចជា Display Name និង Unit ។
parseExpression()	វិភាគ Formula និងបម្លែងវាទៅជា AST ។

ឧទាហរណ៍៖
const result = parseExpression('2 * x + 5');


នៅពេលយើងបញ្ចូល 2 * x + 5 ប្រព័ន្ធមិនគ្រាន់តែចាត់ទុកវាជាអក្សរធម្មតាទេ។ វានឹងវិភាគថា៖
- 2 គឺជា Number ។
- x គឺជា Variable ។
- * គឺជា Multiplication ។
- + គឺជា Addition ។
តើ AST គឺជាអ្វី?
AST (Abstract Syntax Tree) គឺជា Tree Structure ដែលតំណាងឱ្យរចនាសម្ព័ន្ធនៃ Mathematical Expression។
Expression
2 × x + 5

Addition (+)

Multiply (*)

2 × x

Number

5



គំនូសបង្ហាញគោលគំនិត AST ជាទម្រង់សាមញ្ញ។
ហេតុអ្វីត្រូវប្រើ AST?

ព្រោះវាជួយឱ្យប្រព័ន្ធយល់ពីលំដាប់នៃប្រតិបត្តិការគណិតវិទ្យា ដូចជា Multiplication ត្រូវគណនាមុន Addition។

2. formatNumber() – មុខងាររៀបចំទម្រង់លេខ
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


គោលបំណង៖ រៀបចំលេខដែលបានគណនាឱ្យមានទម្រង់ស្អាត និងងាយស្រួលអាន។

ពន្យល់តាមផ្នែកនីមួយៗ៖
2.1 Number.isFinite(value)
if (!Number.isFinite(value)) return String(value);


ប្រើសម្រាប់ពិនិត្យថា តម្លៃដែលទទួលបានជាលេខធម្មតា (Finite Number) ឬអត់។

ឧទាហរណ៍៖
Number.isFinite(100);       // true
Number.isFinite(3.14);      // true
Number.isFinite(Infinity);  // false
Number.isFinite(NaN);       // false


ប្រសិនបើមិនមែនជាលេខធម្មតាទេ វានឹងបម្លែងទៅជា String ហើយ Return ត្រឡប់ទៅវិញ។
2.2 ពិនិត្យតម្លៃសូន្យ
if (value === 0) return '0';


បើតម្លៃស្មើនឹងសូន្យ វានឹងបង្ហាញជា '0' តែម្តង។
2.3 toPrecision(digits)
const rounded = Number(value.toPrecision(digits));


ប្រើសម្រាប់កំណត់ចំនួន Significant Digits (ចំនួនខ្ទង់សំខាន់នៃលេខ)។

ឧទាហរណ៍៖
(123.456789).toPrecision(6);


លទ្ធផល៖
123.457


2.4 Math.abs()
const abs = Math.abs(rounded);


Math.abs() ប្រើសម្រាប់យកតម្លៃដាច់ខាត (Absolute Value) ដោយមិនគិតសញ្ញាអវិជ្ជមាន។

ឧទាហរណ៍៖
Math.abs(-100); // 100
Math.abs(100);  // 100


2.5 Scientific Notation
if (abs >= 1e9 || abs < 1e-4) {


ប្រើសម្រាប់ពិនិត្យថា លេខមានទំហំធំពេក ឬតូចពេកឬអត់។
- 1e9 មានន័យថា \(1 X 10^9\) ឬ 1,000,000,000 ។
- 1e-4 មានន័យថា \(1 X  10^{-4}\) ឬ 0.0001 ។
បើលេខស្ថិតក្នុងលក្ខខណ្ឌនេះ វានឹងបម្លែងទៅជា Scientific Notation។
const [mantissa, exponent] = rounded.toExponential().split('e');


ឧទាហរណ៍៖
1000000000


បម្លែងទៅជា៖
\[
1 \times 10^9
\]

ចុងក្រោយ៖
return String(rounded);


បើលេខមិនធំ ឬតូចពេក វានឹង Return លេខជាទម្រង់ String ធម្មតា។

3. SYMBOL – ការបម្លែងសញ្ញាគណិតវិទ្យា
const SYMBOL = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '%': '%',
  '**': '^'
};


គោលបំណង៖ បម្លែងសញ្ញាប្រតិបត្តិការរបស់ JavaScript ទៅជាសញ្ញាគណិតវិទ្យាដែលងាយស្រួលឱ្យសិស្សយល់។
JavaScript	Mathematical Symbol	អត្ថន័យ
+	+	បូក (Addition)
-	−	ដក (Subtraction)
*	×	គុណ (Multiplication)
/	÷	ចែក (Division)
%	%	សំណល់ (Modulo)
**	^	ស្វ័យគុណ (Exponentiation)

ឧទាហរណ៍៖
SYMBOL['*'];  // ×
SYMBOL['/'];  // ÷
SYMBOL['**']; // ^


ដូច្នេះ ប្រសិនបើ Formula មាន 2 * 5 វានឹងបង្ហាញជា 2 × 5 នៅលើ UI។

4. print() – បង្ហាញ Mathematical Expression
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


គោលបំណង៖ បម្លែង AST ទៅជាអក្សរ និងសញ្ញាគណិតវិទ្យាដែលមនុស្សអាចអានបាន។

វាប្រើ switch ដើម្បីពិនិត្យប្រភេទ Node នីមួយៗ។
Node Type	អត្ថន័យ	ឧទាហរណ៍
num	លេខ	25
var	អថេរ (Variable)	x
const	ថេរ (Constant)	π
group	វង់ក្រចក	(2 + 3)
call	Mathematical Function	sin(30)
un	Unary Operator	-5
bin	Binary Operator	2 + 3

ឧទាហរណ៍នីមួយៗ៖

ករណីទី 1៖ Number
{ type: 'num', value: 25 }


លទ្ធផល៖
25


ករណីទី 2៖ Variable
{ type: 'var', name: 'voltage' }


លទ្ធផល៖
voltage


ករណីទី 3៖ Constant
{ type: 'const', name: 'pi' }


លទ្ធផល៖
π


ករណីទី 4៖ Binary Operation
{
  type: 'bin',
  op: '*',
  left: { type: 'num', value: 2 },
  right: { type: 'num', value: 5 }
}


លទ្ធផល៖
2 × 5


ចំណាំ៖ print() មិនមែនជា Function សម្រាប់គណនាទេ។ វាគ្រាន់តែបម្លែង AST ទៅជាអក្សរដែលអាចបង្ហាញលើ UI បានប៉ុណ្ណោះ។

5. SolveError – បង្កើត Custom Error
class SolveError extends Error {}


គោលបំណង៖ បង្កើតប្រភេទ Error ផ្ទាល់ខ្លួនសម្រាប់ប្រព័ន្ធគណនា។

ឧទាហរណ៍៖
throw new SolveError('Division by zero.');


មានន័យថា បោះ Error ថ្មីដែលមានសារ៖
Division by zero.


ហេតុអ្វីមិនប្រើ Error ធម្មតា?

ព្រោះយើងចង់បែងចែករវាង៖
- Calculation Error: កំហុសក្នុងការគណនា។
- Programming Error: កំហុសក្នុងការសរសេរកូដ។
ពេលក្រោយយើងអាចប្រើ catch ដើម្បីចាប់យក Error នេះ ហើយបង្ហាញសារឱ្យអ្នកប្រើប្រាស់យល់បាន។

6. Helper Functions – មុខងារជំនួយសម្រាប់គណនា
ផ្នែកនេះមានមុខងារជំនួយសំខាន់ៗ ដែលប្រព័ន្ធប្រើដើម្បីពិនិត្យ AST និងសម្រេចថា Node ណាអាចគណនាបាន។
6.1 isNum() – ពិនិត្យថា Node ជាលេខឬអត់
const isNum = (node) => node.type === 'num';


វាប្រើសម្រាប់ពិនិត្យថា Node ដែលទទួលបានមានប្រភេទជា num ឬអត់។

ឧទាហរណ៍៖
isNum({ type: 'num', value: 10 }); 
// true

isNum({ type: 'var', name: 'x' }); 
// false


ន័យគឺ៖
- true = Node ជាលេខ ហើយអាចយកទៅគណនាបាន។
- false = Node មិនមែនជាលេខទេ។
6.2 RANK – កំណត់អាទិភាពប្រតិបត្តិការគណិតវិទ្យា
const RANK = {
  call: 0,
  '**': 1,
  un: 2,
  '*': 3,
  '/': 3,
  '%': 3,
  '+': 4,
  '-': 4
};


RANK គឺជា Object ដែលប្រើកំណត់លេខអាទិភាពសម្រាប់ប្រតិបត្តិការនីមួយៗ។
Operation	Rank	អត្ថន័យ
call	0	Function ដូចជា sin(), cos()
**	1	Exponentiation
un	2	Unary operator ដូចជា -5
*	3	Multiplication
/	3	Division
%	3	Modulo
+	4	Addition
-	4	Subtraction

ចំណាំ៖ Rank តូចជាង មានអាទិភាពខ្ពស់ជាង។

ឧទាហរណ៍៖
\[
2+3\times4
\]

ប្រព័ន្ធត្រូវគណនា៖
1. \(3\times4=12\)
2. \(2+12=14\)
មិនមែនគណនា \(2+3\) មុនទេ។
6.3 isReady() – ពិនិត្យថា Node អាចគណនាបានឬនៅ
const isReady = (node) => {
  if (node.type === 'bin') {
    return isNum(node.left) && isNum(node.right);
  }

  if (node.type === 'un') {
    return isNum(node.arg);
  }

  if (node.type === 'call') {
    return node.args.every(isNum);
  }

  return false;
};


មុខងារនេះពិនិត្យថា Node មានទិន្នន័យគ្រប់គ្រាន់សម្រាប់ធ្វើប្រតិបត្តិការឬនៅ។

ករណីទី 1៖ Binary Operation
if (node.type === 'bin') {
  return isNum(node.left) && isNum(node.right);
}


Binary Operation មានន័យថាប្រតិបត្តិការដែលត្រូវការតម្លៃពីរ។

ឧទាហរណ៍៖
2 × 5


បើខាងឆ្វេង និងខាងស្តាំសុទ្ធតែជា Number នោះវាអាចគណនាបាន។

ករណីទី 2៖ Unary Operation
if (node.type === 'un') {
  return isNum(node.arg);
}


Unary Operation គឺប្រតិបត្តិការដែលប្រើតម្លៃតែមួយ។

ឧទាហរណ៍៖
-5


ករណីទី 3៖ Function Call
if (node.type === 'call') {
  return node.args.every(isNum);
}


every() ពិនិត្យថា Element ទាំងអស់ក្នុង Array ជា Number ឬអត់។

ឧទាហរណ៍៖
[30, 45].every(isNum); // true


ប៉ុន្តែ៖
[30, { type: 'var', name: 'x' }].every(isNum);
// false


6.4 rankOf() – ទាញយក Rank របស់ Node
const rankOf = (node) =>
  node.type === 'call'
    ? RANK.call
    : node.type === 'un'
      ? RANK.un
      : RANK[node.op];


មុខងារនេះទាញយក Rank តាមប្រភេទប្រតិបត្តិការរបស់ Node។

ឧទាហរណ៍៖
rankOf({ type: 'bin', op: '*' });
// 3

rankOf({ type: 'bin', op: '+' });
// 4

rankOf({ type: 'call', name: 'sin' });
// 0


វាជួយឱ្យប្រព័ន្ធដឹងថាត្រូវគណនាប្រតិបត្តិការណាមុន។

7. substitute() – ជំនួសតម្លៃ Variables ក្នុង Formula
function substitute(node, values) {
  switch (node.type) {
    case 'var':
      return { type: 'num', value: Number(values[node.name]) };

    case 'const':
      return { type: 'num', value: CONSTANTS[node.name] };

    case 'group':
      return {
        type: 'group',
        inner: substitute(node.inner, values)
      };

    case 'un':
      return { ...node, arg: substitute(node.arg, values) };

    case 'bin':
      return {
        ...node,
        left: substitute(node.left, values),
        right: substitute(node.right, values)
      };

    case 'call':
      return {
        ...node,
        args: node.args.map((arg) => substitute(arg, values))
      };

    default:
      return node;
  }
}


គោលបំណង៖ ជំនួស Variable និង Constant ទៅជាតម្លៃលេខពិតប្រាកដ។

ឧទាហរណ៍៖

យើងមាន Formula៖
\[
2\times x+5
\]

ហើយអ្នកប្រើប្រាស់បញ្ចូល៖
const values = {
  x: 10
};


ពេលប្រើ៖
substitute(ast, values);


ប្រព័ន្ធនឹងបម្លែង៖
2 × x + 5


ទៅជា៖
2 × 10 + 5


ពន្យល់តាម switch៖

ករណីទី 1៖ Variable
case 'var':
  return {
    type: 'num',
    value: Number(values[node.name])
  };


មានន័យថា៖
- រកឈ្មោះ Variable។
- ទាញយកតម្លៃពី values។
- បម្លែងទៅជា Number។
- បង្កើត Node ថ្មីប្រភេទ num។
ឧទាហរណ៍៖
node.name = 'x';
values.x = 10;


លទ្ធផល៖
{ type: 'num', value: 10 }


ករណីទី 2៖ Constant
case 'const':
  return {
    type: 'num',
    value: CONSTANTS[node.name]
  };


ប្រើសម្រាប់ជំនួស Mathematical Constant។

ឧទាហរណ៍៖
π → 3.141592653589793


ករណីទី 3៖ Group
case 'group':
  return {
    type: 'group',
    inner: substitute(node.inner, values)
  };


ប្រើសម្រាប់ជំនួសតម្លៃនៅក្នុងវង់ក្រចក។

ឧទាហរណ៍៖
(2 + x)


បើ x = 3 នោះក្លាយជា៖
(2 + 3)


ករណីទី 4៖ Unary Operation
case 'un':
  return {
    ...node,
    arg: substitute(node.arg, values)
  };


ជំនួសតម្លៃនៅក្នុង Unary Operation ដូចជា៖
-x


បើ x = 5 នោះក្លាយជា៖
-5


ករណីទី 5៖ Binary Operation
case 'bin':
  return {
    ...node,
    left: substitute(node.left, values),
    right: substitute(node.right, values)
  };


ជំនួសទាំងផ្នែកខាងឆ្វេង (left) និងខាងស្តាំ (right)។

ករណីទី 6៖ Function Call
case 'call':
  return {
    ...node,
    args: node.args.map((arg) => substitute(arg, values))
  };


ប្រើ map() ដើម្បីជំនួសតម្លៃ Argument ទាំងអស់របស់ Function។

ឧទាហរណ៍៖
sin(x)


បើ x = 30 នោះក្លាយជា៖
sin(30)


ចំណាំ៖

...node ហៅថា Spread Operator។ វាចម្លង Properties របស់ Object ចាស់ រួចកែប្រែ Properties ដែលយើងចង់បាន។

8. collapse() – រៀបចំ និងសម្រួល AST
function collapse(node) {
  switch (node.type) {
    case 'group': {
      const inner = collapse(node.inner);

      return isNum(inner)
        ? inner
        : { type: 'group', inner };
    }

    case 'un':
      return {
        ...node,
        arg: collapse(node.arg)
      };

    case 'bin':
      return {
        ...node,
        left: collapse(node.left),
        right: collapse(node.right)
      };

    case 'call':
      return {
        ...node,
        args: node.args.map(collapse)
      };

    default:
      return node;
  }
}


គោលបំណង៖ សម្រួល AST ដោយដក Group ដែលមិនចាំបាច់ចេញ នៅពេលមាតិកាខាងក្នុងបានក្លាយជាលេខរួចហើយ។

ឧទាហរណ៍៖

មុន collapse()៖
(5)


ក្រោយ collapse()៖
5


មើលផ្នែកនេះ៖
const inner = collapse(node.inner);


វាធ្វើឱ្យ Node ខាងក្នុងត្រូវបានសម្រួលជាមុនសិន។

បន្ទាប់មក៖
return isNum(inner) ? inner : { type: 'group', inner };


នេះគឺជា Ternary Operator ដែលមានន័យថា៖
- បើ inner ជាលេខ → Return លេខនោះ។
- បើមិនមែន → រក្សា Group ដដែល។
ឧទាហរណ៍៖
(5)       → 5
(2 + x)   → (2 + x)


វាជួយកាត់បន្ថយ Node ដែលមិនចាំបាច់ក្នុង AST។

9. findCandidates() – ស្វែងរកប្រតិបត្តិការដែលអាចគណនាបាន
function findCandidates(node, depth, out) {
  if (node.type === 'group') {
    findCandidates(node.inner, depth + 1, out);
  }

  else if (node.type === 'bin') {
    findCandidates(node.left, depth, out);
    findCandidates(node.right, depth, out);
  }

  else if (node.type === 'un') {
    findCandidates(node.arg, depth, out);
  }

  else if (node.type === 'call') {
    node.args.forEach((arg) =>
      findCandidates(arg, depth + 1, out)
    );
  }

  if (isReady(node)) {
    out.push({
      depth,
      rank: rankOf(node)
    });
  }
}


គោលបំណង៖ ស្វែងរកប្រតិបត្តិការទាំងឡាយដែលអាចគណនាបាននៅក្នុង AST។

Function នេះប្រើ Recursive Function មានន័យថា Function ហៅខ្លួនឯងម្ដងហើយម្ដងទៀត ដើម្បីពិនិត្យ Node ខាងក្នុង។

វាមាន Parameter ចំនួន 3៖
Parameter	អត្ថន័យ
node	Node ដែលកំពុងពិនិត្យ
depth	កម្រិតជម្រៅរបស់ Node ក្នុង Tree
out	Array សម្រាប់រក្សាទុកប្រតិបត្តិការដែលអាចគណនាបាន

ឧទាហរណ៍៖
\[
2+(3\times4)
\]

ប្រព័ន្ធនឹងស្វែងរក៖
1. 3 × 4 អាចគណនាបាន។
2. 2 + (...) មិនទាន់អាចគណនាបានទេ ព្រោះផ្នែកខាងក្នុងមិនទាន់បានបម្លែងទៅជាលេខ។
បន្ទាប់ពីរកឃើញ វាបន្ថែមព័ត៌មានទៅក្នុង Array៖
out.push({
  depth,
  rank: rankOf(node)
});


ឧទាហរណ៍៖
[
  {
    depth: 0,
    rank: 3
  }
]


នេះមានន័យថា ប្រតិបត្តិការដែលរកឃើញមាន Depth 0 និង Rank 3។

10. applyBin() – អនុវត្តប្រតិបត្តិការគណិតវិទ្យា
function applyBin(op, a, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return a / b;
  if (op === '%') return a % b;

  return a ** b;
}


គោលបំណង៖ អនុវត្តការគណនាតាមប្រភេទ Operator ដែលបានផ្ដល់ឱ្យ។

Function នេះមាន Parameter ចំនួន 3៖
Parameter	អត្ថន័យ
op	ប្រភេទប្រតិបត្តិការ
a	តម្លៃទីមួយ
b	តម្លៃទីពីរ

ឧទាហរណ៍៖
applyBin('+', 10, 5); // 15

applyBin('-', 10, 5); // 5

applyBin('*', 10, 5); // 50

applyBin('/', 10, 5); // 2

applyBin('%', 10, 3); // 1

applyBin('**', 2, 3); // 8


ចំណុចសំខាន់៖
return a ** b;


នេះជាការគណនា Exponentiation ឬស្វ័យគុណ។

ឧទាហរណ៍៖
\[
2^3=8
\]


11. reduceNode() – គណនា Node និងកត់ត្រា Step
function reduceNode(node, log) {
  let value;
  let text;

  if (node.type === 'bin') {
    value = applyBin(
      node.op,
      node.left.value,
      node.right.value
    );

    if (!Number.isFinite(value)) {
      throw new SolveError(
        node.op === '/' && node.right.value === 0
          ? 'Division by zero.'
          : 'The calculation does not give a valid number.'
      );
    }

    text = `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)} = ${formatNumber(value)}`;

    log.push({ text, type: node.op });
  }

  else if (node.type === 'un') {
    value = node.op === '-' ? -node.arg.value : node.arg.value;

    text = `${node.op}${print(node.arg, true)} = ${formatNumber(value)}`;

    log.push({ text, type: 'un' });
  }

  else {
    value = FUNCTIONS[node.name].fn(
      ...node.args.map((arg) => arg.value)
    );

    if (!Number.isFinite(value)) {
      throw new SolveError(
        `${node.name}(${node.args.map((arg) => formatNumber(arg.value)).join(', ')}) is not a valid number.`
      );
    }

    text = `${print(node)} = ${formatNumber(value)}`;

    log.push({
      text,
      type: 'call',
      name: node.name
    });
  }

  return {
    type: 'num',
    value
  };
}


គោលបំណង៖ គណនា Node ដែលអាចគណនាបាន ហើយរក្សាទុកព័ត៌មានអំពីជំហានគណនា។

វាជាផ្នែកសំខាន់មួយសម្រាប់បង្កើត Step-by-Step Solution។
11.1 ប្រកាស Variables
let value;
let text;


- value រក្សាទុកលទ្ធផលនៃការគណនា។
- text រក្សាទុកអត្ថបទសម្រាប់បង្ហាញជំហានគណនា។
11.2 Binary Operation
if (node.type === 'bin') {
  value = applyBin(
    node.op,
    node.left.value,
    node.right.value
  );
}


បើ Node ជា Binary Operation វានឹងហៅ applyBin() ដើម្បីគណនា។

ឧទាហរណ៍៖
2 × 5


លទ្ធផល៖
10


11.3 ពិនិត្យ Calculation Error
if (!Number.isFinite(value)) {
  throw new SolveError(
    node.op === '/' && node.right.value === 0
      ? 'Division by zero.'
      : 'The calculation does not give a valid number.'
  );
}


បើលទ្ធផលមិនមែនជា Finite Number នោះវានឹងបង្កើត Error។

ឧទាហរណ៍៖
10 / 0


ប្រព័ន្ធនឹងបង្ហាញ៖
Division by zero.


11.4 បង្កើត Calculation Text
text = `${print(node.left, node.op === '**')} ${SYMBOL[node.op]} ${print(node.right, true)} = ${formatNumber(value)}`;


វាបង្កើតអត្ថបទនៃជំហានគណនា។

ឧទាហរណ៍៖
2 × 5 = 10


11.5 រក្សាទុកក្នុង Log
log.push({
  text,
  type: node.op
});


វាបន្ថែម Calculation Step ទៅក្នុង Array log។

ឧទាហរណ៍៖
[
  {
    text: '2 × 5 = 10',
    type: '*'
  }
]


11.6 Unary Operation
else if (node.type === 'un') {
  value = node.op === '-' ? -node.arg.value : node.arg.value;
}


ប្រើសម្រាប់គណនាសញ្ញា Unary។

ឧទាហរណ៍៖
-5 = -5


11.7 Function Call
value = FUNCTIONS[node.name].fn(
  ...node.args.map((arg) => arg.value)
);


ប្រើសម្រាប់ហៅ Mathematical Function ដូចជា៖
- sin()
- cos()
- tan()
- sqrt()
ឧទាហរណ៍៖
sqrt(25) = 5


11.8 Return Result
return {
  type: 'num',
  value
};


បន្ទាប់ពីគណនារួច វាបម្លែង Node ទៅជា Number Node ថ្មី។

ឧទាហរណ៍៖
{
  type: 'num',
  value: 10
}


មានន័យថា Node នេះបានគណនារួចហើយ។

12. rewrite() – គណនាតាមលំដាប់ និងកែប្រែ AST
function rewrite(node, depth, best, log) {
  switch (node.type) {
    case 'group': {
      const inner = rewrite(node.inner, depth + 1, best, log);

      return isNum(inner)
        ? inner
        : { type: 'group', inner };
    }

    case 'bin': {
      const next = {
        ...node,
        left: rewrite(node.left, depth, best, log),
        right: rewrite(node.right, depth, best, log)
      };

      return isReady(node) &&
        depth === best.depth &&
        rankOf(node) === best.rank
        ? reduceNode(next, log)
        : next;
    }

    case 'un': {
      const next = {
        ...node,
        arg: rewrite(node.arg, depth, best, log)
      };

      return isReady(node) &&
        depth === best.depth &&
        rankOf(node) === best.rank
        ? reduceNode(next, log)
        : next;
    }

    case 'call': {
      const next = {
        ...node,
        args: node.args.map((arg) =>
          rewrite(arg, depth + 1, best, log)
        )
      };

      return isReady(node) &&
        depth === best.depth &&
        rankOf(node) === best.rank
        ? reduceNode(next, log)
        : next;
    }

    default:
      return node;
  }
}


គោលបំណង៖ គណនា Node ដែលត្រូវបានជ្រើសរើស ហើយបង្កើត AST ថ្មីដែលមានលទ្ធផលនៃការគណនាជំនួសវិញ។

វាជា Recursive Function ដូចជា findCandidates() ដែរ។

ប៉ុន្តែភាពខុសគ្នាគឺ៖
Function	តួនាទី
findCandidates()	ស្វែងរកប្រតិបត្តិការដែលអាចគណនាបាន
rewrite()	អនុវត្តការគណនា និងកែប្រែ AST
reduceNode()	គណនា Node មួយ និងបង្កើត Log

តើ best មានន័យអ្វី?
best


វាជា Object ដែលរក្សាទុកប្រតិបត្តិការដែលត្រូវគណនានៅជំហានបច្ចុប្បន្ន។

ឧទាហរណ៍៖
{
  depth: 0,
  rank: 3
}


មានន័យថា ប្រព័ន្ធជ្រើសរើស Node ដែលមាន Depth 0 និង Rank 3។
ពន្យល់លក្ខខណ្ឌសំខាន់
return isReady(node) &&
  depth === best.depth &&
  rankOf(node) === best.rank
    ? reduceNode(next, log)
    : next;


វាពិនិត្យលក្ខខណ្ឌចំនួន 3៖
1. Node អាចគណនាបាន។
2. Depth របស់ Node ត្រូវគ្នានឹង best.depth។
3. Rank របស់ Node ត្រូវគ្នានឹង best.rank។
បើលក្ខខណ្ឌទាំងអស់ត្រឹមត្រូវ វាហៅ reduceNode() ដើម្បីគណនា។

បើមិនត្រឹមត្រូវ វារក្សា Node ដដែល។

13. solveSteps() – មុខងារសំខាន់សម្រាប់គណនា Formula
នេះគឺជា Main Function របស់ Code ទាំងមូល។

វាភ្ជាប់មុខងារទាំងអស់ខាងលើ ដើម្បីបង្កើតប្រព័ន្ធគណនា Formula និងបង្ហាញលទ្ធផលជា Step-by-Step។
export function solveSteps({
  expression,
  values = {},
  variables = []
}) {


Function នេះទទួល Parameter ចំនួន 3៖
Parameter	អត្ថន័យ
expression	Formula ដែលត្រូវគណនា
values	តម្លៃ Variables ដែលអ្នកប្រើប្រាស់បញ្ចូល
variables	ព័ត៌មានបន្ថែមរបស់ Variables ដូចជា Name, Unit និង Display Name

ឧទាហរណ៍៖
solveSteps({
  expression: '2 * rho * L * I / A',

  values: {
    rho: 0.0175,
    L: 20,
    I: 10,
    A: 2.5
  },

  variables: [
    {
      variable_name: 'rho',
      display_name: 'Resistivity',
      unit: 'Ω·mm²/m'
    },
    {
      variable_name: 'L',
      display_name: 'Length',
      unit: 'm'
    },
    {
      variable_name: 'I',
      display_name: 'Current',
      unit: 'A'
    },
    {
      variable_name: 'A',
      display_name: 'Cross-sectional Area',
      unit: 'mm²'
    }
  ]
});


13.1 Parse Expression – វិភាគ Formula
const parsed = parseExpression(expression);


ប្រើ parseExpression() ដើម្បីវិភាគ Formula ដែលទទួលបាន។

ឧទាហរណ៍៖
2 * rho * L * I / A


ប្រព័ន្ធនឹងបម្លែងទៅជា AST។

បន្ទាប់មក៖
if (!parsed.ok) {
  return {
    ok: false,
    error: parsed.error ?? 'The expression is empty.'
  };
}


បើ Formula មិនត្រឹមត្រូវ វានឹង Return Error។
13.2 Check Missing Variables – ពិនិត្យតម្លៃដែលមិនទាន់បញ្ចូល
const missing = parsed.variables.filter(
  (name) =>
    values[name] === undefined ||
    values[name] === '' ||
    Number.isNaN(Number(values[name]))
);


ប្រើ filter() ដើម្បីស្វែងរក Variable ដែលមិនមានតម្លៃ ឬមានតម្លៃមិនមែនជាលេខ។

លក្ខខណ្ឌ៖
Code	អត្ថន័យ
values[name] === undefined	មិនទាន់មានតម្លៃ
values[name] === ''	ទទេ
Number.isNaN(Number(values[name]))	មិនអាចបម្លែងទៅជាលេខបាន

បន្ទាប់មក៖
if (missing.length > 0) {
  return {
    ok: false,
    error: `Enter a value for ${missing.join(', ')}.`
  };
}


បើមាន Variable មិនទាន់បញ្ចូល វានឹងបង្ហាញ Error។

ឧទាហរណ៍៖
Enter a value for rho, L.


13.3 Try – ចាប់ផ្ដើមដំណើរការគណនា
try {


try ប្រើសម្រាប់ដំណើរការកូដដែលអាចមាន Error។

បើមាន Error វានឹងចូលទៅក្នុង catch នៅផ្នែកចុងក្រោយ។
13.4 បង្កើត Variable Metadata
const meta = Object.fromEntries(
  (variables ?? []).map((variable) => [
    variable.variable_name,
    variable
  ])
);


ផ្នែកនេះសំខាន់សម្រាប់ទាញយកព័ត៌មាន Variable។

variables ?? [] មានន័យថា បើ variables ជា null ឬ undefined វានឹងប្រើ Array ទទេជំនួស។

map() ប្រើសម្រាប់បម្លែង Array ទៅជា Key-Value Pairs។

Object.fromEntries() បម្លែង Key-Value Pairs ទៅជា Object។

ឧទាហរណ៍៖

ទិន្នន័យដើម៖
[
  {
    variable_name: 'I',
    display_name: 'Current',
    unit: 'A'
  }
]


បន្ទាប់ពីបម្លែង៖
{
  I: {
    variable_name: 'I',
    display_name: 'Current',
    unit: 'A'
  }
}


វាធ្វើឱ្យយើងអាចទាញយកព័ត៌មានបានងាយស្រួល៖
meta.I.display_name;
// Current

meta.I.unit;
// A


13.5 បង្កើត Array សម្រាប់រក្សាទុក Steps
const steps = [];


ប្រើសម្រាប់រក្សាទុកជំហានគណនាទាំងអស់។

ឧទាហរណ៍៖
[
  { kind: 'formula' },
  { kind: 'given' },
  { kind: 'substitute' },
  { kind: 'calc' },
  { kind: 'result' }
]


13.6 Step 1 – Write the Formula
steps.push({
  kind: 'formula',
  title: 'Write the formula',
  expression: print(parsed.ast)
});


ជំហានដំបូង គឺបង្ហាញ Formula ដើម។

ឧទាហរណ៍៖
Step 1
Write the formula
\[
V_d = \frac{2\rho LI}{A}
\]

បង្ហាញ Formula ដែលអ្នកប្រើប្រាស់បានជ្រើសរើស។
steps.push() មានន័យថាបន្ថែម Step ថ្មីទៅក្នុង Array steps។
13.7 Step 2 – List the Known Values
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
        value: formatNumber(Number(values[name]))
      };
    })
  });
}


ជំហាននេះប្រើសម្រាប់បង្ហាញតម្លៃ Variable ដែលអ្នកប្រើប្រាស់បានបញ្ចូល។

ការពន្យល់៖
- parsed.variables ទាញយកឈ្មោះ Variable ទាំងអស់ពី Formula។
- map() ដំណើរការ Variable ម្ដងមួយៗ។
- describeSymbol(name) ទាញយកព័ត៌មានលំនាំដើមរបស់ Variable។
- meta[name]?.display_name ប្រើ Display Name ពី Database បើមាន។
- meta[name]?.unit ?? guess.unit ប្រើ Unit ពី Database បើមាន បើមិនមានប្រើ Unit លំនាំដើម។
- formatNumber() រៀបចំលេខឱ្យមានទម្រង់ស្អាត។
ឧទាហរណ៍ UI៖
Step 2
List the known values
Variable	Given Value
ρ (Resistivity)	0.0175 Ω·mm²/m
L (Length)	20 m
I (Current)	10 A
A (Area)	2.5 mm²


13.8 Step 3 – Substitute the Values
let tree = collapse(
  substitute(parsed.ast, values)
);


នេះជាជំហានសំខាន់មួយទៀត។

វាប្រើ Function ចំនួនពីរ៖
1. substitute() ជំនួស Variable ទៅជាលេខ។
2. collapse() សម្រួល AST និងដក Group ដែលមិនចាំបាច់។
ឧទាហរណ៍៖

Formula ដើម៖
\[
V_d=\frac{2\times\rho\times L\times I}{A}
\]

ក្រោយជំនួសតម្លៃ៖
\[
V_d=\frac{2\times0.0175\times20\times10}{2.5}
\]

បន្ទាប់មក៖
const usesPi = JSON.stringify(parsed.ast).includes('"name":"pi"');


កូដនេះពិនិត្យថា Formula ដើមមានប្រើ Constant pi ឬអត់។
- JSON.stringify() បម្លែង AST ទៅជា JSON String។
- includes() ពិនិត្យថា String មានពាក្យដែលបានកំណត់ឬអត់។
បន្ទាប់មកបង្កើត Step៖
steps.push({
  kind: 'substitute',
  title: 'Substitute the values',
  expression: print(tree),
  note: usesPi ? 'π is about 3.14159.' : null
});


Step 3
Substitute the values
\[
V_d=\frac{2\times0.0175\times20\times10}{2.5}
\]

បង្ហាញ Formula បន្ទាប់ពីជំនួស Variables រួច។
13.9 Step 4 – Calculation Loop
let guard = 0;

while (!isNum(tree)) {


ផ្នែកនេះគឺជាបេះដូងនៃ Step-by-Step Calculation Engine។

while មានន័យថា ដំណើរការកូដម្ដងហើយម្ដងទៀត រហូតដល់លក្ខខណ្ឌមិនពិត។
while (!isNum(tree))


មានន័យថា៖

ដំណើរការបន្ត ប្រសិនបើ AST នៅមិនទាន់ក្លាយជាលេខចុងក្រោយ។

A. Guard – កំណត់ចំនួនដងនៃការគណនា
if (guard++ > 200) {
  throw new SolveError(
    'The calculation is too long to show step by step.'
  );
}


វាកំណត់ចំនួនដងអតិបរមា ដើម្បីការពារការគណនាដែលដំណើរការមិនចប់។

guard++ មានន័យថា ប្រើតម្លៃបច្ចុប្បន្នសិន រួចបន្ថែម 1។

B. ស្វែងរកប្រតិបត្តិការដែលអាចគណនាបាន
const candidates = [];

findCandidates(tree, 0, candidates);


បង្កើត Array ទទេ រួចហៅ findCandidates() ដើម្បីរក Node ដែលអាចគណនាបាន។

C. ពិនិត្យថាមានប្រតិបត្តិការឬអត់
if (candidates.length === 0) {
  throw new SolveError(
    'This calculation cannot be shown step by step.'
  );
}


បើមិនមានប្រតិបត្តិការដែលអាចគណនាបាន វានឹងបង្កើត Error។

D. ជ្រើសរើសប្រតិបត្តិការដែលត្រូវគណនាមុន
const best = candidates.reduce((a, b) =>
  b.depth > a.depth ||
  (b.depth === a.depth && b.rank < a.rank)
    ? b
    : a
);


reduce() ប្រើសម្រាប់ជ្រើសរើស Candidate ដែលល្អបំផុត។

លក្ខខណ្ឌ៖
1. ជ្រើសរើស Depth ដែលជ្រៅជាងគេ។
2. បើ Depth ស្មើគ្នា ជ្រើសរើស Rank ដែលតូចជាងគេ។
នេះជួយគ្រប់គ្រងលំដាប់គណនាក្នុង AST។

E. អនុវត្តការគណនា
const log = [];

tree = collapse(
  rewrite(tree, 0, best, log)
);


នៅទីនេះ៖
- log រក្សាទុក Calculation Steps។
- rewrite() គណនា Node ដែលត្រូវបានជ្រើសរើស។
- collapse() សម្រួល AST បន្ទាប់ពីគណនា។
F. រក្សាទុក Calculation Step
steps.push({
  kind: 'calc',
  title: 'Calculation step',
  details: log.map((entry) => entry.text),
  expression: print(tree)
});


បន្ទាប់ពីគណនារួច វាបង្កើត Step ថ្មី ហើយរក្សាទុក៖
- kind ប្រភេទ Step។
- title ចំណងជើង។
- details លម្អិតនៃការគណនា។
- expression Formula បន្ទាប់ពីគណនារួច។
ឧទាហរណ៍៖
Step 4
Calculation step

CALCULATION DETAILS
2 × 0.0175 = 0.035

Remaining expression
\[
\frac{0.035\times20\times10}{2.5}
\]

ឧទាហរណ៍នៃការគណនាប្រតិបត្តិការមួយជំហាន។
ចំណាំ៖ while នឹងបន្តដំណើរការរហូតដល់ AST ក្លាយជាលេខតែមួយ។
13.10 Step 5 – Result
steps.push({
  kind: 'result',
  title: 'Result',
  value: formatNumber(tree.value, 8),
  raw: tree.value
});


ពេលគណនាចប់ វាបង្កើត Step ចុងក្រោយ។
- value ជាលទ្ធផលដែលបាន Format ដោយប្រើ 8 Significant Digits។
- raw ជាលេខពិតប្រាកដដែល JavaScript បានគណនា។
ឧទាហរណ៍៖
\[
V_d = \frac{2\times0.0175\times20\times10}{2.5}
\]

\[
V_d = \frac{7}{2.5}
\]

\[
\boxed{V_d=2.8\text{ V}}
\]

13.11 Return Success
return {
  ok: true,
  value: tree.value,
  steps
};


មានន័យថា ការគណនាបានជោគជ័យ។

វាបញ្ជូនទិន្នន័យត្រឡប់ទៅ Frontend ដើម្បីបង្ហាញលទ្ធផល។
13.12 Catch Error
} catch (error) {
  if (error instanceof SolveError) {
    return {
      ok: false,
      error: error.message
    };
  }

  throw error;
}


បើមាន Calculation Error វានឹងចាប់យក Error ហើយ Return ទៅ Frontend។

ឧទាហរណ៍៖
{
  ok: false,
  error: 'Division by zero.'
}


ប៉ុន្តែបើជា Programming Error ដែលមិនមែនជា SolveError វានឹងបោះ Error បន្ត ដើម្បីកុំលាក់បាំងបញ្ហាក្នុងកូដ។

14. សង្ខេបដំណើរការកូដទាំងមូល
ខាងក្រោមនេះជាលំដាប់ដំណើរការរបស់ solveSteps() ពីដំបូងដល់ចប់៖
1. User Input

Formula + Variable Values


2. parseExpression()

បម្លែង Formula ទៅជា AST


3. Validate Variables

ពិនិត្យតម្លៃដែលបានបញ្ចូល


4. substitute()

ជំនួស Variables ទៅជាលេខ


5. findCandidates()

ស្វែងរកប្រតិបត្តិការដែលអាចគណនាបាន


6. rewrite() + reduceNode()

គណនា និងកត់ត្រា Calculation Steps

ធ្វើម្ដងហើយម្ដងទៀត រហូតដល់បានលទ្ធផលចុងក្រោយ

7. Final Result
2.8 V
Return Result + All Steps


15. Function ទាំងអស់ និងតួនាទីរបស់វា
Function	តួនាទី
formatNumber()	រៀបចំទម្រង់លេខ
print()	បង្ហាញ Formula ជាអក្សរ
isNum()	ពិនិត្យ Node ជាលេខ
rankOf()	ទាញយក Operation Rank
isReady()	ពិនិត្យថាអាចគណនាបាន
substitute()	ជំនួស Variables
collapse()	សម្រួល AST
findCandidates()	ស្វែងរក Operations
applyBin()	អនុវត្តការគណនា
reduceNode()	គណនា Node និងកត់ត្រា Step
rewrite()	កែប្រែ AST តាមលទ្ធផល
solveSteps()	គ្រប់គ្រងដំណើរការគណនាទាំងមូល