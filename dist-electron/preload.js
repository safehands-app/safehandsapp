import { contextBridge as a, ipcRenderer as i } from "electron";
a.exposeInMainWorld("electron", {
  send: (e, n) => {
    ["toMain"].includes(e) && i.send(e, n);
  },
  receive: (e, n) => {
    ["fromMain"].includes(e) && i.on(e, (o, ...d) => n(...d));
  }
});
