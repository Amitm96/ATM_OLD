const admin = require('firebase-admin');
let environment;

function main(options) {
    if (environment) {
      return environment;
    }

    environment = {};

    const serviceAccount = require(`./service-${process.env.NODE_ENV == 'development' ? 'test' : 'ta'}-key.json`);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        clientConfig: {
            interfaces: {
                'google.firestore.v1.Firestore': {
                    methods: {
                        RunQuery: {
                            timeout_millis: 300000
                        }
                    }
                }
            }
        }
    });

    environment.firestore = admin.firestore();

    return environment;
}

module.exports = main;
