const {expect} = require('chai');
const SuperExpressive = require('.');

const testRegexEquality = (description, regex, superExpression) => it(description, () => {
  const regexStr = regex.toString();
  const superExpressionStr = superExpression.toRegexString();
  expect(regexStr).to.equal(superExpressionStr);

  const doubleConversion = superExpression.toRegex().toString();
  expect(regexStr).to.equal(doubleConversion);
});

const testRegexEqualityOnly = (description, regex, superExpression) => it.only(description, () => {
  const regexStr = regex.toString();
  const superExpressionStr = superExpression.toRegexString();
  expect(regexStr).to.equal(superExpressionStr);
});

const testErrorConditition = (description, errorMsg, superExpressionFn) => it(description, () => {
  expect(superExpressionFn).to.throw(errorMsg);
});

describe('SuperExpressive', () => {
  testRegexEquality('Empty regex', /(?:)/, SuperExpressive());

  testRegexEquality('Flag: g', /(?:)/g, SuperExpressive().allowMultipleMatches );
  testRegexEquality('Flag: m', /(?:)/m, SuperExpressive().lineByLine );
  testRegexEquality('Flag: i', /(?:)/i, SuperExpressive().caseInsensitive );
  testRegexEquality('Flag: d', /(?:)/d, SuperExpressive().generateIndices );
  testRegexEquality('Flag: y', /(?:)/y, SuperExpressive().sticky);
  testRegexEquality('Flag: u', /(?:)/u, SuperExpressive().unicode);
  testRegexEquality('Flag: s', /(?:)/s, SuperExpressive().singleLine);

  testRegexEquality('anyChar', /./, SuperExpressive().anyChar);
  testRegexEquality('whitespaceChar', /\s/, SuperExpressive().whitespaceChar);
  testRegexEquality('nonWhitespaceChar', /\S/, SuperExpressive().nonWhitespaceChar);
  testRegexEquality('digit', /\d/, SuperExpressive().digit);
  testRegexEquality('nonDigit', /\D/, SuperExpressive().nonDigit);
  testRegexEquality('word', /\w/, SuperExpressive().word);
  testRegexEquality('nonWord', /\W/, SuperExpressive().nonWord);
  testRegexEquality('wordBoundary', /\b/, SuperExpressive().wordBoundary);
  testRegexEquality('nonWordBoundary', /\B/, SuperExpressive().nonWordBoundary);
  testRegexEquality('newline', /\n/, SuperExpressive().newline);
  testRegexEquality('carriageReturn', /\r/, SuperExpressive().carriageReturn);
  testRegexEquality('tab', /\t/, SuperExpressive().tab);
  testRegexEquality('verticalTab', /\v/, SuperExpressive().verticalTab);
  testRegexEquality('formFeed', /\f/, SuperExpressive().formFeed);
  testRegexEquality('backspace', /[\b]/, SuperExpressive().backspace);
  testRegexEquality('backspace fused', /[\b]/, SuperExpressive().anyOf.backspace.end());
  testRegexEquality('nullByte', /\0/, SuperExpressive().nullByte);

  testRegexEquality(
    'anyOf: basic',
    /(?:hello|[\d\w\.#])/,
    SuperExpressive()
      .anyOf
        .string('hello')
        .digit
        .word
        .char('.')
        .char('#')
      .end()
  );

  testRegexEquality(
    'anyOf: range fusion',
    /[a-zA-Z0-9\.#]/,
    SuperExpressive()
      .anyOf
        .range('a', 'z')
        .range('A', 'Z')
        .range('0', '9')
        .char('.')
        .char('#')
      .end()
  );

  testRegexEquality(
    'anyOf: range fusion with other choices',
    /(?:XXX|[a-zA-Z0-9\.#])/,
    SuperExpressive()
      .anyOf
        .range('a', 'z')
        .range('A', 'Z')
        .range('0', '9')
        .char('.')
        .char('#')
        .string('XXX')
      .end()
  );

  testRegexEquality(
    'anythingBut: basic',
    /(?:(?!hello)[^\d\w\.#])/,
    SuperExpressive()
      .anythingBut
        .string('hello')
        .digit
        .word
        .char('.')
        .char('#')
      .end()
  );

  testRegexEquality(
    'anythingBut: range fusion',
    /[^a-zA-Z0-9\.#]/,
    SuperExpressive()
      .anythingBut
        .range('a', 'z')
        .range('A', 'Z')
        .range('0', '9')
        .char('.')
        .char('#')
      .end()
  );

  testRegexEquality(
    'anythingBut: range fusion with other choices',
    /(?:(?!XXX)[^a-zA-Z0-9\.#])/,
    SuperExpressive()
      .anythingBut
        .range('a', 'z')
        .range('A', 'Z')
        .range('0', '9')
        .char('.')
        .char('#')
        .string('XXX')
      .end()
  );

  testRegexEquality(
    'anythingBut: only non-fusion choices',
    /(?:(?!XXX|(\d))[^])/,
    SuperExpressive()
      .anythingBut
        .string('XXX')
        .capture
          .digit
        .end()
      .end()
  );

  testRegexEquality(
    'capture',
    /(hello \w!)/,
    SuperExpressive()
      .capture
        .string('hello ')
        .word
        .char('!')
      .end()
  );

  testRegexEquality(
    'namedCapture',
    /(?<this_is_the_name>hello \w!)/,
    SuperExpressive()
      .namedCapture('this_is_the_name')
        .string('hello ')
        .word
        .char('!')
      .end()
  );

  testErrorConditition(
    'namedCapture error on bad name',
    'name "hello world" is not valid (only letters, numbers, and underscores)',
    () => SuperExpressive()
      .namedCapture('hello world')
        .string('hello ')
        .word
        .char('!')
      .end()
  );

  testErrorConditition(
    'namedCapture error same name more than once',
    'cannot use hello again for a capture group',
    () => SuperExpressive()
      .namedCapture('hello')
        .string('hello ')
        .word
        .char('!')
      .end()
      .namedCapture('hello')
        .string('hello ')
        .word
        .char('!')
      .end()
  );

  testRegexEquality(
    'namedBackreference',
    /(?<this_is_the_name>hello \w!)\k<this_is_the_name>/,
    SuperExpressive()
      .namedCapture('this_is_the_name')
        .string('hello ')
        .word
        .char('!')
      .end()
      .namedBackreference('this_is_the_name')
  );

  testErrorConditition(
    'namedBackreference no capture group exists',
    'no capture group called "not_here" exists (create one with .namedCapture())',
    () => SuperExpressive().namedBackreference('not_here')
  );

  testRegexEquality(
    'backreference',
    /(hello \w!)\1/,
    SuperExpressive()
      .capture
        .string('hello ')
        .word
        .char('!')
      .end()
      .backreference(1)
  );

  testErrorConditition(
    'backreference no capture group exists',
    'invalid index 1. There are 0 capture groups on this SuperExpression',
    () => SuperExpressive().backreference(1)
  );

  testRegexEquality(
    'group',
    /(?:hello \w!)/,
    SuperExpressive()
      .group
        .string('hello ')
        .word
        .char('!')
      .end()
  );

  testErrorConditition(
    'end: error when called with no stack',
    'Cannot call end while building the root expression',
    () => SuperExpressive().end()
  );

  testRegexEquality(
    'assertAhead',
    /(?=[a-f])[a-z]/,
    SuperExpressive()
      .assertAhead
        .range('a', 'f')
      .end()
      .range('a', 'z')
  );

  testRegexEquality(
    'assertBehind',
    /(?<=hello )[a-z]/,
    SuperExpressive()
      .assertBehind
        .string('hello ')
      .end()
      .range('a', 'z')
  );

  testRegexEquality(
    'assertNotAhead',
    /(?![a-f])[0-9]/,
    SuperExpressive()
      .assertNotAhead
        .range('a', 'f')
      .end()
      .range('0', '9')
  );

  testRegexEquality(
    'assertNotBehind',
    /(?<!hello )[a-z]/,
    SuperExpressive()
      .assertNotBehind
        .string('hello ')
      .end()
      .range('a', 'z')
  );

  testRegexEquality('optional', /\w?/, SuperExpressive().optional.word);
  testRegexEquality('zeroOrMore', /\w*/, SuperExpressive().zeroOrMore.word);
  testRegexEquality('zeroOrMoreLazy', /\w*?/, SuperExpressive().zeroOrMoreLazy.word);
  testRegexEquality('oneOrMore', /\w+/, SuperExpressive().oneOrMore.word);
  testRegexEquality('oneOrMoreLazy', /\w+?/, SuperExpressive().oneOrMoreLazy.word);
  testRegexEquality('exactly', /\w{4}/, SuperExpressive().exactly(4).word);
  testRegexEquality('atLeast', /\w{4,}/, SuperExpressive().atLeast(4).word);
  testRegexEquality('atLeastLazy', /\w{4,}?/, SuperExpressive().atLeastLazy(4).word);
  testRegexEquality('between', /\w{4,7}/, SuperExpressive().between(4, 7).word);
  testRegexEquality('betweenLazy', /\w{4,7}?/, SuperExpressive().betweenLazy(4, 7).word);

  testRegexEquality('startOfInput', /^/, SuperExpressive().startOfInput);
  testRegexEquality('endOfInput', /$/, SuperExpressive().endOfInput);
  testRegexEquality('anyOfChars', /[aeiou\.\-]/, SuperExpressive().anyOfChars('aeiou.-'));
  testRegexEquality('anythingButChars', /[^aeiou\.\-]/, SuperExpressive().anythingButChars('aeiou.-'));
  testRegexEquality('anythingButRange', /[^0-9]/, SuperExpressive().anythingButRange('0', '9'));
  testRegexEquality('string', /hello/, SuperExpressive().string('hello'));
  testRegexEquality('string escapes special characters with strings of length 1', /\^hello/ ,SuperExpressive().string('^').string('hello'))
  testErrorConditition(
    'string: zero characters',
    's cannot be an empty string',
    () => SuperExpressive().string('')
  );
  testRegexEquality('char', /h/, SuperExpressive().char('h'));
  testErrorConditition(
    'char: more than one',
    'char() can only be called with a single character (got hello)',
    () => SuperExpressive().char('hello')
  );

  testRegexEquality('controlChar', /\cM/, SuperExpressive().controlChar('m'));
  testErrorConditition(
    'controlChar: more than one',
    'controlChar() can only be called with a single character from a-z (got aa)',
    () => SuperExpressive().controlChar('aa')
  );
  testErrorConditition(
    'controlChar: invalid character',
    'controlChar() can only be called with a single character from a-z (got ~)',
    () => SuperExpressive().controlChar('~')
  );

  testRegexEquality('hexCode', /\x21/, SuperExpressive().hexCode('21'));
  testErrorConditition(
    'hexCode: only one digit',
    'hexCode() can only be called with a 2 character string (got a)',
    () => SuperExpressive().hexCode('a')
  );
  testErrorConditition(
    'hexCode: invalid characters',
    'hex can only contain hexadecimal characters (got ak)',
    () => SuperExpressive().hexCode('ak')
  );

  testRegexEquality('utf16Code', /\u0021/, SuperExpressive().utf16Code('0021'));
  testErrorConditition(
    'utf16Code: only one digit',
    'utf16Code() can only be called with a 4 character string (got a)',
    () => SuperExpressive().utf16Code('a')
  );
  testErrorConditition(
    'utf16Code: invalid characters',
    'hex can only contain hexadecimal characters (got 0A2K)',
    () => SuperExpressive().utf16Code('0A2K')
  );

  testRegexEquality('unicodeCharCode', /\u{00021}/u, SuperExpressive().unicodeCharCode('00021'));
  testErrorConditition(
    'unicodeCharCode: only one digit',
    'unicodeCharCode() can only be called with a 4 or 5 character string (got a)',
    () => SuperExpressive().unicodeCharCode('a')
  );
  testErrorConditition(
    'unicodeCharCode: invalid characters',
    'hex can only contain hexadecimal characters (got 00A2K)',
    () => SuperExpressive().unicodeCharCode('00A2K')
  );

  testRegexEquality('unicodeProperty', /\p{Script=Latin}/u, SuperExpressive().unicodeProperty('Script=Latin'));
  testRegexEquality('unicodeProperty: lone property', /\p{L}/u, SuperExpressive().unicodeProperty('L'));
  testErrorConditition(
    'unicodeProperty: invalid characters',
    `Property is not a valid Unicode property (got ~). ` +
    `For valid properties see: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape`,
    () => SuperExpressive().unicodeProperty('~')
  );
  testErrorConditition(
    'unicodeProperty: invalid property name',
    `Property is not a valid Unicode property (got nope). ` +
    `For valid properties see: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape`,
    () => SuperExpressive().unicodeProperty('nope')
  );

  testRegexEquality('notUnicodeProperty', /\P{Script=Latin}/u, SuperExpressive().notUnicodeProperty('Script=Latin'));
  testRegexEquality('notUnicodeProperty: lone property', /\P{L}/u, SuperExpressive().notUnicodeProperty('L'));
  testErrorConditition(
    'notUnicodeProperty: invalid characters',
    `Property is not a valid Unicode property (got ~). ` +
    `For valid properties see: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape`,
    () => SuperExpressive().notUnicodeProperty('~')
  );
  testErrorConditition(
    'notUnicodeProperty: invalid property name',
    `Property is not a valid Unicode property (got nope). ` +
    `For valid properties see: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape`,
    () => SuperExpressive().notUnicodeProperty('nope')
  );

  testRegexEquality('range', /[a-z]/, SuperExpressive().range('a', 'z'));
  testRegexEquality('range: unicode',/[a-z😀-😆]/u,
    SuperExpressive()
      .anyOf
        .range('a','z')
        .range('\u{1F600}', '\u{1F606}')
      .end()
  );
  testErrorConditition(
    'range: more than single characters',
    'a must be a single character or number (got aa)',
    () => SuperExpressive().range('aa','b')
  );
  testErrorConditition(
    'range: more than single unicode character',
    'b must be a single character or number (got ❤❤)',
    () => SuperExpressive().range('a','❤❤')
  );
});

describe('subexpressions', () => {
  testErrorConditition(
    'subexpression(expr): expr must be a SuperExpressive instance',
    'expr must be a SuperExpressive instance',
    () => SuperExpressive().subexpression('nope')
  )

  const simpleSubExpression = SuperExpressive()
    .string('hello')
    .anyChar
    .string('world');

  testRegexEquality(
    'simple',
    /^\d{3,}hello.world[0-9]$/,
    SuperExpressive()
      .startOfInput
      .atLeast(3).digit
      .subexpression(simpleSubExpression)
      .range('0', '9')
      .endOfInput
  );

  testRegexEquality(
    'simple: quantified',
    /^\d{3,}(?:hello.world)+[0-9]$/,
    SuperExpressive()
      .startOfInput
      .atLeast(3).digit
      .oneOrMore.subexpression(simpleSubExpression)
      .range('0', '9')
      .endOfInput
  );

  const flagsSubExpression = SuperExpressive()
    .allowMultipleMatches
    .unicode
    .lineByLine
    .caseInsensitive
    .string('hello')
    .anyChar
    .string('world');

  testRegexEquality(
    'ignoring flags = false',
    /^\d{3,}hello.world[0-9]$/gymiu,
    SuperExpressive()
      .sticky
      .startOfInput
      .atLeast(3).digit
      .subexpression(flagsSubExpression, { ignoreFlags: false })
      .range('0', '9')
      .endOfInput
  );

  testRegexEquality(
    'ignoring flags = true',
    /^\d{3,}hello.world[0-9]$/y,
    SuperExpressive()
      .sticky
      .startOfInput
      .atLeast(3).digit
      .subexpression(flagsSubExpression)
      .range('0', '9')
      .endOfInput
  );

  const startEndSubExpression = SuperExpressive()
    .startOfInput
    .string('hello')
    .anyChar
    .string('world')
    .endOfInput;

  testRegexEquality(
    'ignoring start/end = false',
    /\d{3,}^hello.world$[0-9]/,
    SuperExpressive()
      .atLeast(3).digit
      .subexpression(startEndSubExpression, { ignoreStartAndEnd: false })
      .range('0', '9')
  );

  testRegexEquality(
    'ignoring start/end = true',
    /\d{3,}hello.world[0-9]/,
    SuperExpressive()
      .atLeast(3).digit
      .subexpression(startEndSubExpression)
      .range('0', '9')
  );

  testErrorConditition(
    'start defined in subexpression and main expression',
    'The parent regex already has a defined start of input. You can ignore a subexpressions startOfInput/endOfInput markers with the ignoreStartAndEnd option',
    () => SuperExpressive()
      .startOfInput
      .atLeast(3).digit
      .subexpression(startEndSubExpression, { ignoreStartAndEnd: false })
      .range('0', '9')
  );

  testErrorConditition(
    'end defined in subexpression and main expression',
    'The parent regex already has a defined end of input. You can ignore a subexpressions startOfInput/endOfInput markers with the ignoreStartAndEnd option',
    () => SuperExpressive()
      .endOfInput
      .subexpression(startEndSubExpression, { ignoreStartAndEnd: false })
  );

  const namedCaptureSubExpression = SuperExpressive()
    .namedCapture('module')
      .exactly(2).anyChar
    .end()
    .namedBackreference('module');

  testRegexEquality(
    'no namespacing',
    /\d{3,}(?<module>.{2})\k<module>[0-9]/,
    SuperExpressive()
      .atLeast(3).digit
      .subexpression(namedCaptureSubExpression)
      .range('0', '9')
  );

  testRegexEquality(
    'namespacing',
    /\d{3,}(?<yolomodule>.{2})\k<yolomodule>[0-9]/,
    SuperExpressive()
      .atLeast(3).digit
      .subexpression(namedCaptureSubExpression, { namespace: 'yolo' })
      .range('0', '9')
  );

  testErrorConditition(
    'group name collision (no namespacing)',
    'cannot use module again for a capture group',
    () => SuperExpressive()
      .namedCapture('module')
        .atLeast(3).digit
      .end()
      .subexpression(namedCaptureSubExpression)
      .range('0', '9')
  );

  testErrorConditition(
    'group name collision (after namespacing)',
    'cannot use yolomodule again for a capture group',
    () => SuperExpressive()
      .namedCapture('yolomodule')
        .atLeast(3).digit
      .end()
      .subexpression(namedCaptureSubExpression, { namespace: 'yolo' })
      .range('0', '9')
  );

  const indexedBackreferenceSubexpression = SuperExpressive()
    .capture
    .exactly(2).anyChar
    .end()
    .backreference(1);

  testRegexEquality(
    'indexed backreferencing',
    /(\d{3,})(.{2})\2\1[0-9]/,
    SuperExpressive()
      .capture
        .atLeast(3).digit
      .end()
      .subexpression(indexedBackreferenceSubexpression)
      .backreference(1)
      .range('0', '9')
  );

  const nestedSubexpression = SuperExpressive().exactly(2).anyChar;
  const firstLayerSubexpression = SuperExpressive()
    .string('outer begin')
    .namedCapture('innerSubExpression')
      .optional.subexpression(nestedSubexpression)
    .end()
    .string('outer end');

  testRegexEquality(
    'deeply nested subexpressions',
    /(\d{3,})outer begin(?<innerSubExpression>(?:.{2})?)outer end\1[0-9]/,
    SuperExpressive()
      .capture
        .atLeast(3).digit
      .end()
      .subexpression(firstLayerSubexpression)
      .backreference(1)
      .range('0', '9')
  );
});