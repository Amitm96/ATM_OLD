'use strict'

var TEN = 10
var ONE_HUNDRED = 100
var ONE_THOUSAND = 1000
var ONE_LAKH = 100000
var ONE_CRORE = 10000000 //         1.000.000.000 (7)
var MAX = 9007199254740992 // 9.007.199.254.740.992 (15)

var LESS_THAN_TWENTY = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Ewelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
]

var TENTHS_LESS_THAN_HUNDRED = [
  'Zero', 'Ten', 'Twenty', 'Thirty', 'Fourty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
]

/**
 * Converts an integer into words.
 * If number is decimal, the decimals will be removed.
 * @example toWords(12) => 'twelve'
 * @param {number|string} number
 * @returns {string}
 */
export default function toWords (number) {
  const str = number.toFixed(2)
  const decimal = str.lastIndexOf('.')
  const rupees = str.substr(0, decimal)
  const paise = parseInt(str.substr(decimal + 1))

  if (paise === 0) {
    return 'Rupees ' + generateWords(parseInt(rupees))
  } else {
    return generateWords(parseInt(rupees)) + ' Rupees and ' + generateWords(paise) + ' Paise'
  }
}

function generateWords (number) {
  var remainder, word,
    words = arguments[1]

  // We’re done
  if (number === 0) {
    return !words ? 'Zero' : words.join(' ').replace(/,$/, '')
  }
  // First run
  if (!words) {
    words = []
  }

  if (number < 20) {
    remainder = 0
    word = LESS_THAN_TWENTY[number]
  } else if (number < ONE_HUNDRED) {
    remainder = number % TEN
    word = TENTHS_LESS_THAN_HUNDRED[Math.floor(number / TEN)]
    // In case of remainder, we need to handle it here to be able to add the “-”
    if (remainder) {
      word += '-' + LESS_THAN_TWENTY[remainder]
      remainder = 0
    }
  } else if (number < ONE_THOUSAND) {
    remainder = number % ONE_HUNDRED
    word = generateWords(Math.floor(number / ONE_HUNDRED)) + ' Hundred'
  } else if (number < ONE_LAKH) {
    remainder = number % ONE_THOUSAND
    word = generateWords(Math.floor(number / ONE_THOUSAND)) + ' Thousand,'
  } else if (number < ONE_CRORE) {
    remainder = number % ONE_LAKH
    word = generateWords(Math.floor(number / ONE_LAKH)) + ' Lakh,'
  } else if (number < MAX) {
    remainder = number % ONE_CRORE
    word = generateWords(Math.floor(number / ONE_CRORE)) + ' Crore,'
  }

  words.push(word)
  return generateWords(remainder, words)
}
