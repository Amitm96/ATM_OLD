import { app, BrowserWindow, Menu, ipcMain, session  } from 'electron'
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const moment = require('moment');
//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// const aws4 = require('aws4');
// const path = require('path');
// const pkg = require('../../package');

// autoUpdater.on("checking-for-update", () => {
//   log.info("Checking for update...");

//   let opts = {
//     service: 's3',
//     region: 'ap-south-1',
//     method: 'GET',
//     host: 'fre8wise-ta.s3.ap-south-1.amazonaws.com',
//     path: process.platform === 'win32' ? '/latest.yml' : '/latest-mac.yml'
//   }

//   aws4.sign(opts, {
//     accessKeyId: 'AKIAIKU7JG2LZO2OOKKA',
//     secretAccessKey: '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',
//   })

//   autoUpdater.requestHeaders = opts.headers
// });

// autoUpdater.on("update-available", (info) => {
//   log.info("Update available...", info);

//   let opts = {
//     service: 's3',
//     region: 'ap-south-1',
//     method: 'GET',
//     host: 'fre8wise-ta.s3.ap-south-1.amazonaws.com',
//     path: info.path
//   }

//   aws4.sign(opts, {
//     accessKeyId: 'AKIAIKU7JG2LZO2OOKKA',
//     secretAccessKey: '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',
//   })

//   autoUpdater.requestHeaders = opts.headers
//   autoUpdater.downloadUpdate()
// });

import tpno from '../i3ms/tpno';

import { tagVehicles, permitDetails, permitsDetails, permitReport, releaseVehicles } from '../i3ms/tag_vechile';
import { _init, openBrowser, getNewPermitsV2 } from '../i3ms/puppeteer';

import { sendBulkSms } from '../i3ms/sms';

console.log(`wwws` + JSON.stringify({}));
openBrowser(false);

// TODO debug this event from where it is getting triggered
ipcMain.on('permit-report', async (event, args) => {
  console.log(`permit-report getting called .....`);
  await _init(args.credentials);
  const r = await permitReport(args);
  console.log('sending results to browser', r);
  event.sender.send('permit-report-results', r);
});

ipcMain.on('truck-passes', async (event, args) => {
  const r = await tpno(args);
  console.log('sending results to browser', r);
  event.sender.send('tp-results', r);
});

ipcMain.on('tag-vehicles', async (event, args) => {
  console.log(args);
  console.log('starting the process', new Date());
  const r = await tagVehicles(args, event.sender);
  console.log('ending the process', new Date());
  console.log('sending results to browser', r);
  event.sender.send('tag-results', r);
});

ipcMain.on('release-vehicles', async (event, args) => {
  console.log(args);
  const r = await releaseVehicles(args, event.sender);
  console.log('sending results to browser', r);
  event.sender.send('release-vehicles-results', r);
});

// TODO debug this event from where it is getting triggered
ipcMain.on('permit-details', async (event, args) => {
  console.log(args);
  await _init(args.credentials, false);
  const r = await permitDetails(args);
  console.log('sending results to browser', r);
  event.sender.send('permit-details-results', r);
});

ipcMain.on('permits-details', async (event, args) => {
  console.log('permits details permits-details permits-details .... ', args);
  if (args.refresh) {
    if (args.permits.length){
      console.log(`first init`);
      await _init(args.permits[0].credentials, false);
  
      for (let permit of args.permits) {
        console.log('permits refreshing .....', permit.permit_number);
        const r = await permitDetails({...permit,sender: event.sender})
        console.log('result data', JSON.stringify(r));
        if (r !== true){
          event.sender.send('permit-details-results', r);
        }
        if (!r || r === []){
          console.log(`calling our own init`);
          await _init(permit.credentials, false);
        }
      }
    }
  }else{
    await _init(args.credentials, false);
    args.sender = event.sender
    console.log('calling permits details');
    const r = await permitsDetails(args);
    console.log('sending results to browser', r);
    if(r !== true){
      event.sender.send('permits-details-results', r);
    }
  }
});

ipcMain.on('sms', async (event, args) => {
  const result = await sendBulkSms(args.smsMessage, args.phoneNumbers);
  console.log(result);
  event.sender.send('sms-results', result);
});

ipcMain.on('check-new-request', async (event, args) => {
  const rows = await getNewPermitsV2({ ...args, sender: event.sender});
  event.sender.send('permit-details-results', rows);
  console.log(`getNewPermitsV2`, JSON.stringify(rows));
});

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // keep in sync with /quasar.conf.js > electron > nodeIntegration
      // (where its default value is "true")
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  })

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    console.log(url, options, additionalFeatures)
  })

  mainWindow.loadURL(process.env.APP_URL)
  mainWindow.removeMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

//autoupdate
app.on('window-all-closed', () => {
  app.quit();
});

//-------------------------------------------------------------------
// Auto updates - Option 1 - Simplest version
//
// This will immediately download an update, then install when the
// app quits.
//-------------------------------------------------------------------
app.on('ready', function () {
  autoUpdater.checkForUpdatesAndNotify();
});
