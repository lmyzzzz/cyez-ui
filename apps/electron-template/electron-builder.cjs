const config = require('./app.config.json')
module.exports = {
  appId: config.appId,
  productName: config.productName,
  directories: { output: 'release' },
  files: ['out/**/*', 'resources/**/*', 'app.config.json', 'package.json', '!**/*.map'],
  asar: true,
  npmRebuild: false,
  win: { target: ['nsis'], icon: 'resources/icon.png', signExecutable: false },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true, createDesktopShortcut: true },
  mac: { target: ['dmg'], icon: 'resources/icon.png' },
  linux: { target: ['AppImage'], icon: 'resources/icon.png' }
}
