
const Razorpay = require('razorpay');

export const razorpay = new Razorpay({
  key_id: 'rzp_test_ABQdlimY1fUW0r',
  key_secret: 'almWzGdpWKDnVvShiwRFKecZ',
});

export function createOrder(amount, name, branch) {
  return razorpay.orders.create({
    "amount": amount,
    "currency": "INR",
    "payment_capture": 1,
    "transfers": [
      {
        "account": "acc_CNo3jSI8OkFJJJ",
        "amount": amount,
        "currency": "INR",
        "notes": {
          "branch": branch,
          "name": name
        },
        "linked_account_notes": [
          "branch"
        ],
        "on_hold": 0
      }
    ]
  })
}
