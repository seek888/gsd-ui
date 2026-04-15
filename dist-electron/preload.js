import { contextBridge as s, ipcRenderer as o } from "electron";
s.exposeInMainWorld("electronAPI", {
  // Shell
  executeCommand: (e, t, i) => o.invoke("shell:execute", e, t, i),
  killCommand: (e) => o.invoke("shell:kill", e),
  onCommandOutput: (e) => {
    const t = (i, n) => e(n);
    return o.on("shell:output", t), () => o.removeListener("shell:output", t);
  },
  onProcessExit: (e) => {
    const t = (i, n) => e(n);
    return o.on("shell:exit", t), () => o.removeListener("shell:exit", t);
  },
  // File System
  readFile: (e) => o.invoke("fs:read", e),
  writeFile: (e, t) => o.invoke("fs:write", e, t),
  readDir: (e) => o.invoke("fs:readDir", e),
  exists: (e) => o.invoke("fs:exists", e),
  // Dialogs
  openDirectory: () => o.invoke("dialog:openDirectory"),
  showSaveDialog: (e) => o.invoke("dialog:showSave", e),
  showMessageBox: (e) => o.invoke("dialog:message", e),
  // Settings
  getSetting: (e) => o.invoke("settings:get", e),
  setSetting: (e, t) => o.invoke("settings:set", e, t),
  // Platform
  platform: process.platform
});
