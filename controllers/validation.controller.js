const { check, validationResult } = require('express-validator')


module.exports.importSun=[
    check('interfaceCod','invalid input').matches(/^[0-9]*$/),
]
module.exports.authorization=[
    check('username','invalid input').matches(/^[a-zA-Z0-9_]*$/),
    check('enterpriseShortName','invalid input').matches(/^[a-zA-Z0-9_]*$/),
    check('interSunUserfaceCod','invalid input').matches(/^[a-zA-Z0-9_]*$/),
    check('lockRef','invalid input').matches(/^[a-zA-Z0-9_]*$/),
    check('email','invalid input').isEmail(),
]
module.exports.delete=[
  check('MappingType','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('Source','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('Target','invalid input').matches(/^[a-zA-Z0-9_]*$/),
]
module.exports.deleteInterface=[
  check('BU','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('interfaceCode','invalid input').matches(/^[0-9]*$/),
  check('MappingCode','invalid input').matches(/^[a-zA-Z0-9_]*$/),
]
module.exports.mapping=[
  check('MappingCode','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('input','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('Description','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('input','invalid input').matches(/^[a-zA-Z0-9_]*$/),
]
module.exports.PropertySettings=[
  check('BU','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('JournalType','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('LedgerImportDescription','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('SuspenseAccount','invalid input').matches(/^[a-zA-Z0-9_]*$/),
]
module.exports.reviewInterface=[
  check('interfaceCode','invalid input').matches(/^[0-9]*$/),
]
module.exports.update=[
  check('username','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('enterpriseShortName','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('interSunUserfaceCod','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('lockRef','invalid input').matches(/^[a-zA-Z0-9_]*$/),
  check('email','invalid input').isEmail(),
]