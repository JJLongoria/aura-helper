const appContext = require('../core/applicationContext');
class NotificationManager { 

    static showStatusBar(content) { 
        appContext.statusBar.text = content;
        appContext.statusBar.show();
    }

    static hideStatusBar() { 
        appContext.statusBar.text = '';
        appContext.statusBar.hide();
    }

}
module.exports = NotificationManager;