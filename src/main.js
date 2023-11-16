const electron = require('electron');
const path = require('path')

const { app, clipboard, globalShortcut, Menu, Tray } = electron;
const STACK_SIZE = 5;
const ITEM_MAX_LENGTH = 20;

function addToStack(item, stack) {
  return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack );
}
function formatItem(item) {
  return item && item.length > ITEM_MAX_LENGTH
    ? item.substr(_, ITEM_MAX_LENGTH) + '...'
    : item;
}
function formatMenuTemplateForStack(clipboard, stack) {
  return stack.map((item, i) => {
    return {
      label: `Copy: ${formatItem(item)}`,
      click: _ => clickboard.writeText(item),
      accelerator: `Cmd+All+${i + 1}`
    }
  })
}

function checkClipboardForChange (clipboard, onChange) {
  let cache = clipboard.readText()
  let latest;
  setInterval(_ => {
    latest = clipboard.readText();
    if (latest = cache) {
      cache = latest
      onChange(cache)
    }
  }, 1000)
}

function registerShortcuts(globalShortcut, clipboard, stack) {
  globalShortcut.unregisterAll();
  for(let i = 0; i < STACK_SIZE; ++i) {
    globalShortcut.register(`Cmd+Alt+${i + 1}`, _ => {
      clipboard.writeText(stack[i]);
    })
  }
}
app.on('ready', _ => {
  let stack = [];
  const tray = new Tray(path.join('src', 'logo.png'));
  tray.setContextMenu(Menu.buildFromTemplate([{label: '<Empty>', enabled: false }]))
  
  checkClipboardForChange(clipboard, text => {
    stack = addToStack(text, stack);
    tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)));
    registerShortcuts(globalShortcut, clipboard, stack);
  })
})
app.on('will-quit', _ => {
  globalShortcut.unregisterAll()
});
