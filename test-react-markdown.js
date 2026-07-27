const { defaultUrlTransform } = require('react-markdown');

console.log(defaultUrlTransform('javascript:alert(1)'));
console.log(defaultUrlTransform('  javascript:alert(1)'));
console.log(defaultUrlTransform('javascript:alert(1)  '));
