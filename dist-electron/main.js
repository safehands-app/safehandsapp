import { app as e, BrowserWindow as r } from "electron";
import o from "path";
import { fileURLToPath as a } from "url";
const i = o.dirname(a(import.meta.url));
function t() {
  const n = new r({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: o.join(i, "preload.mjs"),
      contextIsolation: !0,
      nodeIntegration: !1
    }
  });
  process.env.VITE_DEV_SERVER_URL ? n.loadURL(process.env.VITE_DEV_SERVER_URL) : n.loadFile(o.join(i, "../dist/index.html"));
}
e.whenReady().then(() => {
  t(), e.on("activate", () => {
    r.getAllWindows().length === 0 && t();
  });
});
e.on("window-all-closed", () => {
  process.platform !== "darwin" && e.quit();
});
