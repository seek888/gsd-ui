var Fo = Object.defineProperty;
var ms = (e) => {
  throw TypeError(e);
};
var zo = (e, t, r) => t in e ? Fo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var ht = (e, t, r) => zo(e, typeof t != "symbol" ? t + "" : t, r), Ur = (e, t, r) => t.has(e) || ms("Cannot " + r);
var Y = (e, t, r) => (Ur(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Pe = (e, t, r) => t.has(e) ? ms("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), $e = (e, t, r, n) => (Ur(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r), Ce = (e, t, r) => (Ur(e, t, "access private method"), r);
import Zi, { ipcMain as Ie, dialog as Gr, app as Pr, BrowserWindow as Qi } from "electron";
import { join as ps } from "path";
import { readFile as Uo, writeFile as Go, readdir as Ko, stat as Ho } from "fs/promises";
import { platform as Xo } from "process";
import { spawn as ys } from "child_process";
import ie from "node:process";
import se from "node:path";
import { promisify as fe, isDeepStrictEqual as gs } from "node:util";
import Z from "node:fs";
import mt from "node:crypto";
import vs from "node:assert";
import eo from "node:os";
import "node:events";
import "node:stream";
const et = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, to = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), ro = 1e6, xo = (e) => e >= "0" && e <= "9";
function no(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= ro;
  }
  return !1;
}
function Kr(e, t) {
  return to.has(e) ? !1 : (e && no(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Bo(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let r = "", n = "start", a = !1, s = 0;
  for (const o of e) {
    if (s++, a) {
      r += o, a = !1;
      continue;
    }
    if (o === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${o}' in an index at position ${s}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${o}' after an index at position ${s}`);
      a = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (o) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Kr(r, t))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !Kr(r, t))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (t.pop() || "") + "[]", n = "property";
          else {
            const c = Number.parseInt(r, 10);
            !Number.isNaN(c) && Number.isFinite(c) && c >= 0 && c <= Number.MAX_SAFE_INTEGER && c <= ro && r === String(c) ? t.push(c) : t.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${s}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !xo(o))
          throw new Error(`Invalid character '${o}' in an index at position ${s}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${s}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (a && (r += "\\"), n) {
    case "property": {
      if (!Kr(r, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function Or(e) {
  if (typeof e == "string")
    return Bo(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [r, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (to.has(n))
        return [];
      typeof n == "string" && no(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function $s(e, t, r) {
  if (!et(e) || typeof t != "string" && !Array.isArray(t))
    return r === void 0 ? e : r;
  const n = Or(t);
  if (n.length === 0)
    return r;
  for (let a = 0; a < n.length; a++) {
    const s = n[a];
    if (e = e[s], e == null) {
      if (a !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function Et(e, t, r) {
  if (!et(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, a = Or(t);
  if (a.length === 0)
    return e;
  for (let s = 0; s < a.length; s++) {
    const o = a[s];
    if (s === a.length - 1)
      e[o] = r;
    else if (!et(e[o])) {
      const u = typeof a[s + 1] == "number";
      e[o] = u ? [] : {};
    }
    e = e[o];
  }
  return n;
}
function Wo(e, t) {
  if (!et(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = Or(t);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const a = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(e, a) ? (delete e[a], !0) : !1;
    if (e = e[a], !et(e))
      return !1;
  }
}
function Hr(e, t) {
  if (!et(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const r = Or(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!et(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const He = eo.homedir(), ts = eo.tmpdir(), { env: ct } = ie, Jo = (e) => {
  const t = se.join(He, "Library");
  return {
    data: se.join(t, "Application Support", e),
    config: se.join(t, "Preferences", e),
    cache: se.join(t, "Caches", e),
    log: se.join(t, "Logs", e),
    temp: se.join(ts, e)
  };
}, Yo = (e) => {
  const t = ct.APPDATA || se.join(He, "AppData", "Roaming"), r = ct.LOCALAPPDATA || se.join(He, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: se.join(r, e, "Data"),
    config: se.join(t, e, "Config"),
    cache: se.join(r, e, "Cache"),
    log: se.join(r, e, "Log"),
    temp: se.join(ts, e)
  };
}, Zo = (e) => {
  const t = se.basename(He);
  return {
    data: se.join(ct.XDG_DATA_HOME || se.join(He, ".local", "share"), e),
    config: se.join(ct.XDG_CONFIG_HOME || se.join(He, ".config"), e),
    cache: se.join(ct.XDG_CACHE_HOME || se.join(He, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: se.join(ct.XDG_STATE_HOME || se.join(He, ".local", "state"), e),
    temp: se.join(ts, t, e)
  };
};
function Qo(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ie.platform === "darwin" ? Jo(e) : ie.platform === "win32" ? Yo(e) : Zo(e);
}
const Fe = (e, t) => {
  const { onError: r } = t;
  return function(...a) {
    return e.apply(void 0, a).catch(r);
  };
}, ke = (e, t) => {
  const { onError: r } = t;
  return function(...a) {
    try {
      return e.apply(void 0, a);
    } catch (s) {
      return r(s);
    }
  };
}, ec = 250, ze = (e, t) => {
  const { isRetriable: r } = t;
  return function(a) {
    const { timeout: s } = a, o = a.interval ?? ec, c = Date.now() + s;
    return function u(...l) {
      return e.apply(void 0, l).catch((i) => {
        if (!r(i) || Date.now() >= c)
          throw i;
        const v = Math.round(o * Math.random());
        return v > 0 ? new Promise((m) => setTimeout(m, v)).then(() => u.apply(void 0, l)) : u.apply(void 0, l);
      });
    };
  };
}, Ue = (e, t) => {
  const { isRetriable: r } = t;
  return function(a) {
    const { timeout: s } = a, o = Date.now() + s;
    return function(...u) {
      for (; ; )
        try {
          return e.apply(void 0, u);
        } catch (l) {
          if (!r(l) || Date.now() >= o)
            throw l;
          continue;
        }
    };
  };
}, ut = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ut.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !tc && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ut.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ut.isNodeError(e))
      throw e;
    if (!ut.isChangeErrorOk(e))
      throw e;
  }
}, wt = {
  onError: ut.onChangeError
}, Ee = {
  onError: () => {
  }
}, tc = ie.getuid ? !ie.getuid() : !1, de = {
  isRetriable: ut.isRetriableError
}, he = {
  attempt: {
    /* ASYNC */
    chmod: Fe(fe(Z.chmod), wt),
    chown: Fe(fe(Z.chown), wt),
    close: Fe(fe(Z.close), Ee),
    fsync: Fe(fe(Z.fsync), Ee),
    mkdir: Fe(fe(Z.mkdir), Ee),
    realpath: Fe(fe(Z.realpath), Ee),
    stat: Fe(fe(Z.stat), Ee),
    unlink: Fe(fe(Z.unlink), Ee),
    /* SYNC */
    chmodSync: ke(Z.chmodSync, wt),
    chownSync: ke(Z.chownSync, wt),
    closeSync: ke(Z.closeSync, Ee),
    existsSync: ke(Z.existsSync, Ee),
    fsyncSync: ke(Z.fsync, Ee),
    mkdirSync: ke(Z.mkdirSync, Ee),
    realpathSync: ke(Z.realpathSync, Ee),
    statSync: ke(Z.statSync, Ee),
    unlinkSync: ke(Z.unlinkSync, Ee)
  },
  retry: {
    /* ASYNC */
    close: ze(fe(Z.close), de),
    fsync: ze(fe(Z.fsync), de),
    open: ze(fe(Z.open), de),
    readFile: ze(fe(Z.readFile), de),
    rename: ze(fe(Z.rename), de),
    stat: ze(fe(Z.stat), de),
    write: ze(fe(Z.write), de),
    writeFile: ze(fe(Z.writeFile), de),
    /* SYNC */
    closeSync: Ue(Z.closeSync, de),
    fsyncSync: Ue(Z.fsyncSync, de),
    openSync: Ue(Z.openSync, de),
    readFileSync: Ue(Z.readFileSync, de),
    renameSync: Ue(Z.renameSync, de),
    statSync: Ue(Z.statSync, de),
    writeSync: Ue(Z.writeSync, de),
    writeFileSync: Ue(Z.writeFileSync, de)
  }
}, rc = "utf8", _s = 438, nc = 511, sc = {}, ac = ie.geteuid ? ie.geteuid() : -1, ic = ie.getegid ? ie.getegid() : -1, oc = 1e3, cc = !!ie.getuid;
ie.getuid && ie.getuid();
const Es = 128, uc = (e) => e instanceof Error && "code" in e, ws = (e) => typeof e == "string", Xr = (e) => e === void 0, lc = ie.platform === "linux", so = ie.platform === "win32", rs = ["SIGHUP", "SIGINT", "SIGTERM"];
so || rs.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
lc && rs.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class fc {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (so && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ie.kill(ie.pid, "SIGTERM") : ie.kill(ie.pid, t));
      }
    }, this.hook = () => {
      ie.once("exit", () => this.exit());
      for (const t of rs)
        try {
          ie.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const dc = new fc(), hc = dc.register, me = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), a = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${a}`;
  },
  get: (e, t, r = !0) => {
    const n = me.truncate(t(e));
    return n in me.store ? me.get(e, t, r) : (me.store[n] = r, [n, () => delete me.store[n]]);
  },
  purge: (e) => {
    me.store[e] && (delete me.store[e], he.attempt.unlink(e));
  },
  purgeSync: (e) => {
    me.store[e] && (delete me.store[e], he.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in me.store)
      me.purgeSync(e);
  },
  truncate: (e) => {
    const t = se.basename(e);
    if (t.length <= Es)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Es;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
hc(me.purgeSyncAll);
function ao(e, t, r = sc) {
  if (ws(r))
    return ao(e, t, { encoding: r });
  const a = { timeout: r.timeout ?? oc };
  let s = null, o = null, c = null;
  try {
    const u = he.attempt.realpathSync(e), l = !!u;
    e = u || e, [o, s] = me.get(e, r.tmpCreate || me.create, r.tmpPurge !== !1);
    const i = cc && Xr(r.chown), v = Xr(r.mode);
    if (l && (i || v)) {
      const d = he.attempt.statSync(e);
      d && (r = { ...r }, i && (r.chown = { uid: d.uid, gid: d.gid }), v && (r.mode = d.mode));
    }
    if (!l) {
      const d = se.dirname(e);
      he.attempt.mkdirSync(d, {
        mode: nc,
        recursive: !0
      });
    }
    c = he.retry.openSync(a)(o, "w", r.mode || _s), r.tmpCreated && r.tmpCreated(o), ws(t) ? he.retry.writeSync(a)(c, t, 0, r.encoding || rc) : Xr(t) || he.retry.writeSync(a)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? he.retry.fsyncSync(a)(c) : he.attempt.fsync(c)), he.retry.closeSync(a)(c), c = null, r.chown && (r.chown.uid !== ac || r.chown.gid !== ic) && he.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== _s && he.attempt.chmodSync(o, r.mode);
    try {
      he.retry.renameSync(a)(o, e);
    } catch (d) {
      if (!uc(d) || d.code !== "ENAMETOOLONG")
        throw d;
      he.retry.renameSync(a)(o, me.truncate(e));
    }
    s(), o = null;
  } finally {
    c && he.attempt.closeSync(c), o && me.purge(o);
  }
}
function io(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var St = { exports: {} }, xr = {}, De = {}, Be = {}, Br = {}, Wr = {}, Jr = {}, Ss;
function Ir() {
  return Ss || (Ss = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends t {
      constructor(f) {
        if (super(), !e.IDENTIFIER.test(f))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = r;
    class n extends t {
      constructor(f) {
        super(), this._items = typeof f == "string" ? [f] : f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const f = this._items[0];
        return f === "" || f === '""';
      }
      get str() {
        var f;
        return (f = this._str) !== null && f !== void 0 ? f : this._str = this._items.reduce((y, S) => `${y}${S}`, "");
      }
      get names() {
        var f;
        return (f = this._names) !== null && f !== void 0 ? f : this._names = this._items.reduce((y, S) => (S instanceof r && (y[S.str] = (y[S.str] || 0) + 1), y), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function a(g, ...f) {
      const y = [g[0]];
      let S = 0;
      for (; S < f.length; )
        c(y, f[S]), y.push(g[++S]);
      return new n(y);
    }
    e._ = a;
    const s = new n("+");
    function o(g, ...f) {
      const y = [m(g[0])];
      let S = 0;
      for (; S < f.length; )
        y.push(s), c(y, f[S]), y.push(s, m(g[++S]));
      return u(y), new n(y);
    }
    e.str = o;
    function c(g, f) {
      f instanceof n ? g.push(...f._items) : f instanceof r ? g.push(f) : g.push(v(f));
    }
    e.addCodeArg = c;
    function u(g) {
      let f = 1;
      for (; f < g.length - 1; ) {
        if (g[f] === s) {
          const y = l(g[f - 1], g[f + 1]);
          if (y !== void 0) {
            g.splice(f - 1, 3, y);
            continue;
          }
          g[f++] = "+";
        }
        f++;
      }
    }
    function l(g, f) {
      if (f === '""')
        return g;
      if (g === '""')
        return f;
      if (typeof g == "string")
        return f instanceof r || g[g.length - 1] !== '"' ? void 0 : typeof f != "string" ? `${g.slice(0, -1)}${f}"` : f[0] === '"' ? g.slice(0, -1) + f.slice(1) : void 0;
      if (typeof f == "string" && f[0] === '"' && !(g instanceof r))
        return `"${g}${f.slice(1)}`;
    }
    function i(g, f) {
      return f.emptyStr() ? g : g.emptyStr() ? f : o`${g}${f}`;
    }
    e.strConcat = i;
    function v(g) {
      return typeof g == "number" || typeof g == "boolean" || g === null ? g : m(Array.isArray(g) ? g.join(",") : g);
    }
    function d(g) {
      return new n(m(g));
    }
    e.stringify = d;
    function m(g) {
      return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = m;
    function E(g) {
      return typeof g == "string" && e.IDENTIFIER.test(g) ? new n(`.${g}`) : a`[${g}]`;
    }
    e.getProperty = E;
    function $(g) {
      if (typeof g == "string" && e.IDENTIFIER.test(g))
        return new n(`${g}`);
      throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
    }
    e.getEsmExportName = $;
    function h(g) {
      return new n(g.toString());
    }
    e.regexpCode = h;
  })(Jr)), Jr;
}
var Yr = {}, bs;
function Rs() {
  return bs || (bs = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = /* @__PURE__ */ Ir();
    class r extends Error {
      constructor(l) {
        super(`CodeGen: "code" for ${l} not defined`), this.value = l.value;
      }
    }
    var n;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class a {
      constructor({ prefixes: l, parent: i } = {}) {
        this._names = {}, this._prefixes = l, this._parent = i;
      }
      toName(l) {
        return l instanceof t.Name ? l : this.name(l);
      }
      name(l) {
        return new t.Name(this._newName(l));
      }
      _newName(l) {
        const i = this._names[l] || this._nameGroup(l);
        return `${l}${i.index++}`;
      }
      _nameGroup(l) {
        var i, v;
        if (!((v = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || v === void 0) && v.has(l) || this._prefixes && !this._prefixes.has(l))
          throw new Error(`CodeGen: prefix "${l}" is not allowed in this scope`);
        return this._names[l] = { prefix: l, index: 0 };
      }
    }
    e.Scope = a;
    class s extends t.Name {
      constructor(l, i) {
        super(i), this.prefix = l;
      }
      setValue(l, { property: i, itemIndex: v }) {
        this.value = l, this.scopePath = (0, t._)`.${new t.Name(i)}[${v}]`;
      }
    }
    e.ValueScopeName = s;
    const o = (0, t._)`\n`;
    class c extends a {
      constructor(l) {
        super(l), this._values = {}, this._scope = l.scope, this.opts = { ...l, _n: l.lines ? o : t.nil };
      }
      get() {
        return this._scope;
      }
      name(l) {
        return new s(l, this._newName(l));
      }
      value(l, i) {
        var v;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(l), { prefix: m } = d, E = (v = i.key) !== null && v !== void 0 ? v : i.ref;
        let $ = this._values[m];
        if ($) {
          const f = $.get(E);
          if (f)
            return f;
        } else
          $ = this._values[m] = /* @__PURE__ */ new Map();
        $.set(E, d);
        const h = this._scope[m] || (this._scope[m] = []), g = h.length;
        return h[g] = i.ref, d.setValue(i, { property: m, itemIndex: g }), d;
      }
      getValue(l, i) {
        const v = this._values[l];
        if (v)
          return v.get(i);
      }
      scopeRefs(l, i = this._values) {
        return this._reduceValues(i, (v) => {
          if (v.scopePath === void 0)
            throw new Error(`CodeGen: name "${v}" has no value`);
          return (0, t._)`${l}${v.scopePath}`;
        });
      }
      scopeCode(l = this._values, i, v) {
        return this._reduceValues(l, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, i, v);
      }
      _reduceValues(l, i, v = {}, d) {
        let m = t.nil;
        for (const E in l) {
          const $ = l[E];
          if (!$)
            continue;
          const h = v[E] = v[E] || /* @__PURE__ */ new Map();
          $.forEach((g) => {
            if (h.has(g))
              return;
            h.set(g, n.Started);
            let f = i(g);
            if (f) {
              const y = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              m = (0, t._)`${m}${y} ${g} = ${f};${this.opts._n}`;
            } else if (f = d == null ? void 0 : d(g))
              m = (0, t._)`${m}${f}${this.opts._n}`;
            else
              throw new r(g);
            h.set(g, n.Completed);
          });
        }
        return m;
      }
    }
    e.ValueScope = c;
  })(Yr)), Yr;
}
var Ps;
function J() {
  return Ps || (Ps = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = /* @__PURE__ */ Ir(), r = /* @__PURE__ */ Rs();
    var n = /* @__PURE__ */ Ir();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var a = /* @__PURE__ */ Rs();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return a.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return a.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return a.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return a.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames(_, R) {
        return this;
      }
    }
    class o extends s {
      constructor(_, R, C) {
        super(), this.varKind = _, this.name = R, this.rhs = C;
      }
      render({ es5: _, _n: R }) {
        const C = _ ? r.varKinds.var : this.varKind, x = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${C} ${this.name}${x};` + R;
      }
      optimizeNames(_, R) {
        if (_[this.name.str])
          return this.rhs && (this.rhs = j(this.rhs, _, R)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class c extends s {
      constructor(_, R, C) {
        super(), this.lhs = _, this.rhs = R, this.sideEffects = C;
      }
      render({ _n: _ }) {
        return `${this.lhs} = ${this.rhs};` + _;
      }
      optimizeNames(_, R) {
        if (!(this.lhs instanceof t.Name && !_[this.lhs.str] && !this.sideEffects))
          return this.rhs = j(this.rhs, _, R), this;
      }
      get names() {
        const _ = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return G(_, this.rhs);
      }
    }
    class u extends c {
      constructor(_, R, C, x) {
        super(_, C, x), this.op = R;
      }
      render({ _n: _ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _;
      }
    }
    class l extends s {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `${this.label}:` + _;
      }
    }
    class i extends s {
      constructor(_) {
        super(), this.label = _, this.names = {};
      }
      render({ _n: _ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + _;
      }
    }
    class v extends s {
      constructor(_) {
        super(), this.error = _;
      }
      render({ _n: _ }) {
        return `throw ${this.error};` + _;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends s {
      constructor(_) {
        super(), this.code = _;
      }
      render({ _n: _ }) {
        return `${this.code};` + _;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(_, R) {
        return this.code = j(this.code, _, R), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class m extends s {
      constructor(_ = []) {
        super(), this.nodes = _;
      }
      render(_) {
        return this.nodes.reduce((R, C) => R + C.render(_), "");
      }
      optimizeNodes() {
        const { nodes: _ } = this;
        let R = _.length;
        for (; R--; ) {
          const C = _[R].optimizeNodes();
          Array.isArray(C) ? _.splice(R, 1, ...C) : C ? _[R] = C : _.splice(R, 1);
        }
        return _.length > 0 ? this : void 0;
      }
      optimizeNames(_, R) {
        const { nodes: C } = this;
        let x = C.length;
        for (; x--; ) {
          const W = C[x];
          W.optimizeNames(_, R) || (D(_, W.names), C.splice(x, 1));
        }
        return C.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((_, R) => F(_, R.names), {});
      }
    }
    class E extends m {
      render(_) {
        return "{" + _._n + super.render(_) + "}" + _._n;
      }
    }
    class $ extends m {
    }
    class h extends E {
    }
    h.kind = "else";
    class g extends E {
      constructor(_, R) {
        super(R), this.condition = _;
      }
      render(_) {
        let R = `if(${this.condition})` + super.render(_);
        return this.else && (R += "else " + this.else.render(_)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const _ = this.condition;
        if (_ === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const C = R.optimizeNodes();
          R = this.else = Array.isArray(C) ? new h(C) : C;
        }
        if (R)
          return _ === !1 ? R instanceof g ? R : R.nodes : this.nodes.length ? this : new g(X(_), R instanceof g ? [R] : R.nodes);
        if (!(_ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(_, R) {
        var C;
        if (this.else = (C = this.else) === null || C === void 0 ? void 0 : C.optimizeNames(_, R), !!(super.optimizeNames(_, R) || this.else))
          return this.condition = j(this.condition, _, R), this;
      }
      get names() {
        const _ = super.names;
        return G(_, this.condition), this.else && F(_, this.else.names), _;
      }
    }
    g.kind = "if";
    class f extends E {
    }
    f.kind = "for";
    class y extends f {
      constructor(_) {
        super(), this.iteration = _;
      }
      render(_) {
        return `for(${this.iteration})` + super.render(_);
      }
      optimizeNames(_, R) {
        if (super.optimizeNames(_, R))
          return this.iteration = j(this.iteration, _, R), this;
      }
      get names() {
        return F(super.names, this.iteration.names);
      }
    }
    class S extends f {
      constructor(_, R, C, x) {
        super(), this.varKind = _, this.name = R, this.from = C, this.to = x;
      }
      render(_) {
        const R = _.es5 ? r.varKinds.var : this.varKind, { name: C, from: x, to: W } = this;
        return `for(${R} ${C}=${x}; ${C}<${W}; ${C}++)` + super.render(_);
      }
      get names() {
        const _ = G(super.names, this.from);
        return G(_, this.to);
      }
    }
    class p extends f {
      constructor(_, R, C, x) {
        super(), this.loop = _, this.varKind = R, this.name = C, this.iterable = x;
      }
      render(_) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(_);
      }
      optimizeNames(_, R) {
        if (super.optimizeNames(_, R))
          return this.iterable = j(this.iterable, _, R), this;
      }
      get names() {
        return F(super.names, this.iterable.names);
      }
    }
    class w extends E {
      constructor(_, R, C) {
        super(), this.name = _, this.args = R, this.async = C;
      }
      render(_) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(_);
      }
    }
    w.kind = "func";
    class b extends m {
      render(_) {
        return "return " + super.render(_);
      }
    }
    b.kind = "return";
    class O extends E {
      render(_) {
        let R = "try" + super.render(_);
        return this.catch && (R += this.catch.render(_)), this.finally && (R += this.finally.render(_)), R;
      }
      optimizeNodes() {
        var _, R;
        return super.optimizeNodes(), (_ = this.catch) === null || _ === void 0 || _.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames(_, R) {
        var C, x;
        return super.optimizeNames(_, R), (C = this.catch) === null || C === void 0 || C.optimizeNames(_, R), (x = this.finally) === null || x === void 0 || x.optimizeNames(_, R), this;
      }
      get names() {
        const _ = super.names;
        return this.catch && F(_, this.catch.names), this.finally && F(_, this.finally.names), _;
      }
    }
    class M extends E {
      constructor(_) {
        super(), this.error = _;
      }
      render(_) {
        return `catch(${this.error})` + super.render(_);
      }
    }
    M.kind = "catch";
    class U extends E {
      render(_) {
        return "finally" + super.render(_);
      }
    }
    U.kind = "finally";
    class k {
      constructor(_, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = _, this._scope = new r.Scope({ parent: _ }), this._nodes = [new $()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(_) {
        return this._scope.name(_);
      }
      // reserves unique name in the external scope
      scopeName(_) {
        return this._extScope.name(_);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(_, R) {
        const C = this._extScope.value(_, R);
        return (this._values[C.prefix] || (this._values[C.prefix] = /* @__PURE__ */ new Set())).add(C), C;
      }
      getScopeValue(_, R) {
        return this._extScope.getValue(_, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(_) {
        return this._extScope.scopeRefs(_, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(_, R, C, x) {
        const W = this._scope.toName(R);
        return C !== void 0 && x && (this._constants[W.str] = C), this._leafNode(new o(_, W, C)), W;
      }
      // `const` declaration (`var` in es5 mode)
      const(_, R, C) {
        return this._def(r.varKinds.const, _, R, C);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(_, R, C) {
        return this._def(r.varKinds.let, _, R, C);
      }
      // `var` declaration with optional assignment
      var(_, R, C) {
        return this._def(r.varKinds.var, _, R, C);
      }
      // assignment code
      assign(_, R, C) {
        return this._leafNode(new c(_, R, C));
      }
      // `+=` code
      add(_, R) {
        return this._leafNode(new u(_, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code(_) {
        return typeof _ == "function" ? _() : _ !== t.nil && this._leafNode(new d(_)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(..._) {
        const R = ["{"];
        for (const [C, x] of _)
          R.length > 1 && R.push(","), R.push(C), (C !== x || this.opts.es5) && (R.push(":"), (0, t.addCodeArg)(R, x));
        return R.push("}"), new t._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(_, R, C) {
        if (this._blockNode(new g(_)), R && C)
          this.code(R).else().code(C).endIf();
        else if (R)
          this.code(R).endIf();
        else if (C)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(_) {
        return this._elseNode(new g(_));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(g, h);
      }
      _for(_, R) {
        return this._blockNode(_), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(_, R) {
        return this._for(new y(_), R);
      }
      // `for` statement for a range of values
      forRange(_, R, C, x, W = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const ne = this._scope.toName(_);
        return this._for(new S(W, ne, R, C), () => x(ne));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(_, R, C, x = r.varKinds.const) {
        const W = this._scope.toName(_);
        if (this.opts.es5) {
          const ne = R instanceof t.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, t._)`${ne}.length`, (re) => {
            this.var(W, (0, t._)`${ne}[${re}]`), C(W);
          });
        }
        return this._for(new p("of", x, W, R), () => C(W));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(_, R, C, x = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(_, (0, t._)`Object.keys(${R})`, C);
        const W = this._scope.toName(_);
        return this._for(new p("in", x, W, R), () => C(W));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(f);
      }
      // `label` statement
      label(_) {
        return this._leafNode(new l(_));
      }
      // `break` statement
      break(_) {
        return this._leafNode(new i(_));
      }
      // `return` statement
      return(_) {
        const R = new b();
        if (this._blockNode(R), this.code(_), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try(_, R, C) {
        if (!R && !C)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const x = new O();
        if (this._blockNode(x), this.code(_), R) {
          const W = this.name("e");
          this._currNode = x.catch = new M(W), R(W);
        }
        return C && (this._currNode = x.finally = new U(), this.code(C)), this._endBlockNode(M, U);
      }
      // `throw` statement
      throw(_) {
        return this._leafNode(new v(_));
      }
      // start self-balancing block
      block(_, R) {
        return this._blockStarts.push(this._nodes.length), _ && this.code(_).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock(_) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const C = this._nodes.length - R;
        if (C < 0 || _ !== void 0 && C !== _)
          throw new Error(`CodeGen: wrong number of nodes: ${C} vs ${_} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(_, R = t.nil, C, x) {
        return this._blockNode(new w(_, R, C)), x && this.code(x).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(w);
      }
      optimize(_ = 1) {
        for (; _-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(_) {
        return this._currNode.nodes.push(_), this;
      }
      _blockNode(_) {
        this._currNode.nodes.push(_), this._nodes.push(_);
      }
      _endBlockNode(_, R) {
        const C = this._currNode;
        if (C instanceof _ || R && C instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${_.kind}/${R.kind}` : _.kind}"`);
      }
      _elseNode(_) {
        const R = this._currNode;
        if (!(R instanceof g))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = _, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const _ = this._nodes;
        return _[_.length - 1];
      }
      set _currNode(_) {
        const R = this._nodes;
        R[R.length - 1] = _;
      }
    }
    e.CodeGen = k;
    function F(I, _) {
      for (const R in _)
        I[R] = (I[R] || 0) + (_[R] || 0);
      return I;
    }
    function G(I, _) {
      return _ instanceof t._CodeOrName ? F(I, _.names) : I;
    }
    function j(I, _, R) {
      if (I instanceof t.Name)
        return C(I);
      if (!x(I))
        return I;
      return new t._Code(I._items.reduce((W, ne) => (ne instanceof t.Name && (ne = C(ne)), ne instanceof t._Code ? W.push(...ne._items) : W.push(ne), W), []));
      function C(W) {
        const ne = R[W.str];
        return ne === void 0 || _[W.str] !== 1 ? W : (delete _[W.str], ne);
      }
      function x(W) {
        return W instanceof t._Code && W._items.some((ne) => ne instanceof t.Name && _[ne.str] === 1 && R[ne.str] !== void 0);
      }
    }
    function D(I, _) {
      for (const R in _)
        I[R] = (I[R] || 0) - (_[R] || 0);
    }
    function X(I) {
      return typeof I == "boolean" || typeof I == "number" || I === null ? !I : (0, t._)`!${A(I)}`;
    }
    e.not = X;
    const K = P(e.operators.AND);
    function z(...I) {
      return I.reduce(K);
    }
    e.and = z;
    const H = P(e.operators.OR);
    function q(...I) {
      return I.reduce(H);
    }
    e.or = q;
    function P(I) {
      return (_, R) => _ === t.nil ? R : R === t.nil ? _ : (0, t._)`${A(_)} ${I} ${A(R)}`;
    }
    function A(I) {
      return I instanceof t.Name ? I : (0, t._)`(${I})`;
    }
  })(Wr)), Wr;
}
var Q = {}, Is;
function te() {
  if (Is) return Q;
  Is = 1, Object.defineProperty(Q, "__esModule", { value: !0 }), Q.checkStrictMode = Q.getErrorPath = Q.Type = Q.useFunc = Q.setEvaluated = Q.evaluatedPropsToName = Q.mergeEvaluated = Q.eachItem = Q.unescapeJsonPointer = Q.escapeJsonPointer = Q.escapeFragment = Q.unescapeFragment = Q.schemaRefOrVal = Q.schemaHasRulesButRef = Q.schemaHasRules = Q.checkUnknownRules = Q.alwaysValidSchema = Q.toHash = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ Ir();
  function r(p) {
    const w = {};
    for (const b of p)
      w[b] = !0;
    return w;
  }
  Q.toHash = r;
  function n(p, w) {
    return typeof w == "boolean" ? w : Object.keys(w).length === 0 ? !0 : (a(p, w), !s(w, p.self.RULES.all));
  }
  Q.alwaysValidSchema = n;
  function a(p, w = p.schema) {
    const { opts: b, self: O } = p;
    if (!b.strictSchema || typeof w == "boolean")
      return;
    const M = O.RULES.keywords;
    for (const U in w)
      M[U] || S(p, `unknown keyword: "${U}"`);
  }
  Q.checkUnknownRules = a;
  function s(p, w) {
    if (typeof p == "boolean")
      return !p;
    for (const b in p)
      if (w[b])
        return !0;
    return !1;
  }
  Q.schemaHasRules = s;
  function o(p, w) {
    if (typeof p == "boolean")
      return !p;
    for (const b in p)
      if (b !== "$ref" && w.all[b])
        return !0;
    return !1;
  }
  Q.schemaHasRulesButRef = o;
  function c({ topSchemaRef: p, schemaPath: w }, b, O, M) {
    if (!M) {
      if (typeof b == "number" || typeof b == "boolean")
        return b;
      if (typeof b == "string")
        return (0, e._)`${b}`;
    }
    return (0, e._)`${p}${w}${(0, e.getProperty)(O)}`;
  }
  Q.schemaRefOrVal = c;
  function u(p) {
    return v(decodeURIComponent(p));
  }
  Q.unescapeFragment = u;
  function l(p) {
    return encodeURIComponent(i(p));
  }
  Q.escapeFragment = l;
  function i(p) {
    return typeof p == "number" ? `${p}` : p.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Q.escapeJsonPointer = i;
  function v(p) {
    return p.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Q.unescapeJsonPointer = v;
  function d(p, w) {
    if (Array.isArray(p))
      for (const b of p)
        w(b);
    else
      w(p);
  }
  Q.eachItem = d;
  function m({ mergeNames: p, mergeToName: w, mergeValues: b, resultToName: O }) {
    return (M, U, k, F) => {
      const G = k === void 0 ? U : k instanceof e.Name ? (U instanceof e.Name ? p(M, U, k) : w(M, U, k), k) : U instanceof e.Name ? (w(M, k, U), U) : b(U, k);
      return F === e.Name && !(G instanceof e.Name) ? O(M, G) : G;
    };
  }
  Q.mergeEvaluated = {
    props: m({
      mergeNames: (p, w, b) => p.if((0, e._)`${b} !== true && ${w} !== undefined`, () => {
        p.if((0, e._)`${w} === true`, () => p.assign(b, !0), () => p.assign(b, (0, e._)`${b} || {}`).code((0, e._)`Object.assign(${b}, ${w})`));
      }),
      mergeToName: (p, w, b) => p.if((0, e._)`${b} !== true`, () => {
        w === !0 ? p.assign(b, !0) : (p.assign(b, (0, e._)`${b} || {}`), $(p, b, w));
      }),
      mergeValues: (p, w) => p === !0 ? !0 : { ...p, ...w },
      resultToName: E
    }),
    items: m({
      mergeNames: (p, w, b) => p.if((0, e._)`${b} !== true && ${w} !== undefined`, () => p.assign(b, (0, e._)`${w} === true ? true : ${b} > ${w} ? ${b} : ${w}`)),
      mergeToName: (p, w, b) => p.if((0, e._)`${b} !== true`, () => p.assign(b, w === !0 ? !0 : (0, e._)`${b} > ${w} ? ${b} : ${w}`)),
      mergeValues: (p, w) => p === !0 ? !0 : Math.max(p, w),
      resultToName: (p, w) => p.var("items", w)
    })
  };
  function E(p, w) {
    if (w === !0)
      return p.var("props", !0);
    const b = p.var("props", (0, e._)`{}`);
    return w !== void 0 && $(p, b, w), b;
  }
  Q.evaluatedPropsToName = E;
  function $(p, w, b) {
    Object.keys(b).forEach((O) => p.assign((0, e._)`${w}${(0, e.getProperty)(O)}`, !0));
  }
  Q.setEvaluated = $;
  const h = {};
  function g(p, w) {
    return p.scopeValue("func", {
      ref: w,
      code: h[w.code] || (h[w.code] = new t._Code(w.code))
    });
  }
  Q.useFunc = g;
  var f;
  (function(p) {
    p[p.Num = 0] = "Num", p[p.Str = 1] = "Str";
  })(f || (Q.Type = f = {}));
  function y(p, w, b) {
    if (p instanceof e.Name) {
      const O = w === f.Num;
      return b ? O ? (0, e._)`"[" + ${p} + "]"` : (0, e._)`"['" + ${p} + "']"` : O ? (0, e._)`"/" + ${p}` : (0, e._)`"/" + ${p}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return b ? (0, e.getProperty)(p).toString() : "/" + i(p);
  }
  Q.getErrorPath = y;
  function S(p, w, b = p.opts.strictSchema) {
    if (b) {
      if (w = `strict mode: ${w}`, b === !0)
        throw new Error(w);
      p.self.logger.warn(w);
    }
  }
  return Q.checkStrictMode = S, Q;
}
var bt = {}, Ns;
function Oe() {
  if (Ns) return bt;
  Ns = 1, Object.defineProperty(bt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return bt.default = t, bt;
}
var Os;
function Tr() {
  return Os || (Os = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = /* @__PURE__ */ J(), r = /* @__PURE__ */ te(), n = /* @__PURE__ */ Oe();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: g }) => g ? (0, t.str)`"${h}" keyword must be ${g} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function a(h, g = e.keywordError, f, y) {
      const { it: S } = h, { gen: p, compositeRule: w, allErrors: b } = S, O = v(h, g, f);
      y ?? (w || b) ? u(p, O) : l(S, (0, t._)`[${O}]`);
    }
    e.reportError = a;
    function s(h, g = e.keywordError, f) {
      const { it: y } = h, { gen: S, compositeRule: p, allErrors: w } = y, b = v(h, g, f);
      u(S, b), p || w || l(y, n.default.vErrors);
    }
    e.reportExtraError = s;
    function o(h, g) {
      h.assign(n.default.errors, g), h.if((0, t._)`${n.default.vErrors} !== null`, () => h.if(g, () => h.assign((0, t._)`${n.default.vErrors}.length`, g), () => h.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = o;
    function c({ gen: h, keyword: g, schemaValue: f, data: y, errsCount: S, it: p }) {
      if (S === void 0)
        throw new Error("ajv implementation error");
      const w = h.name("err");
      h.forRange("i", S, n.default.errors, (b) => {
        h.const(w, (0, t._)`${n.default.vErrors}[${b}]`), h.if((0, t._)`${w}.instancePath === undefined`, () => h.assign((0, t._)`${w}.instancePath`, (0, t.strConcat)(n.default.instancePath, p.errorPath))), h.assign((0, t._)`${w}.schemaPath`, (0, t.str)`${p.errSchemaPath}/${g}`), p.opts.verbose && (h.assign((0, t._)`${w}.schema`, f), h.assign((0, t._)`${w}.data`, y));
      });
    }
    e.extendErrors = c;
    function u(h, g) {
      const f = h.const("err", g);
      h.if((0, t._)`${n.default.vErrors} === null`, () => h.assign(n.default.vErrors, (0, t._)`[${f}]`), (0, t._)`${n.default.vErrors}.push(${f})`), h.code((0, t._)`${n.default.errors}++`);
    }
    function l(h, g) {
      const { gen: f, validateName: y, schemaEnv: S } = h;
      S.$async ? f.throw((0, t._)`new ${h.ValidationError}(${g})`) : (f.assign((0, t._)`${y}.errors`, g), f.return(!1));
    }
    const i = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function v(h, g, f) {
      const { createErrors: y } = h.it;
      return y === !1 ? (0, t._)`{}` : d(h, g, f);
    }
    function d(h, g, f = {}) {
      const { gen: y, it: S } = h, p = [
        m(S, f),
        E(h, f)
      ];
      return $(h, g, p), y.object(...p);
    }
    function m({ errorPath: h }, { instancePath: g }) {
      const f = g ? (0, t.str)`${h}${(0, r.getErrorPath)(g, r.Type.Str)}` : h;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, f)];
    }
    function E({ keyword: h, it: { errSchemaPath: g } }, { schemaPath: f, parentSchema: y }) {
      let S = y ? g : (0, t.str)`${g}/${h}`;
      return f && (S = (0, t.str)`${S}${(0, r.getErrorPath)(f, r.Type.Str)}`), [i.schemaPath, S];
    }
    function $(h, { params: g, message: f }, y) {
      const { keyword: S, data: p, schemaValue: w, it: b } = h, { opts: O, propertyName: M, topSchemaRef: U, schemaPath: k } = b;
      y.push([i.keyword, S], [i.params, typeof g == "function" ? g(h) : g || (0, t._)`{}`]), O.messages && y.push([i.message, typeof f == "function" ? f(h) : f]), O.verbose && y.push([i.schema, w], [i.parentSchema, (0, t._)`${U}${k}`], [n.default.data, p]), M && y.push([i.propertyName, M]);
    }
  })(Br)), Br;
}
var Ts;
function mc() {
  if (Ts) return Be;
  Ts = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.boolOrEmptySchema = Be.topBoolOrEmptySchema = void 0;
  const e = /* @__PURE__ */ Tr(), t = /* @__PURE__ */ J(), r = /* @__PURE__ */ Oe(), n = {
    message: "boolean schema is false"
  };
  function a(c) {
    const { gen: u, schema: l, validateName: i } = c;
    l === !1 ? o(c, !1) : typeof l == "object" && l.$async === !0 ? u.return(r.default.data) : (u.assign((0, t._)`${i}.errors`, null), u.return(!0));
  }
  Be.topBoolOrEmptySchema = a;
  function s(c, u) {
    const { gen: l, schema: i } = c;
    i === !1 ? (l.var(u, !1), o(c)) : l.var(u, !0);
  }
  Be.boolOrEmptySchema = s;
  function o(c, u) {
    const { gen: l, data: i } = c, v = {
      gen: l,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: c
    };
    (0, e.reportError)(v, n, void 0, u);
  }
  return Be;
}
var le = {}, We = {}, As;
function oo() {
  if (As) return We;
  As = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.getRules = We.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function r(a) {
    return typeof a == "string" && t.has(a);
  }
  We.isJSONType = r;
  function n() {
    const a = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...a, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, a.number, a.string, a.array, a.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return We.getRules = n, We;
}
var Le = {}, js;
function co() {
  if (js) return Le;
  js = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.shouldUseRule = Le.shouldUseGroup = Le.schemaHasRulesForType = void 0;
  function e({ schema: n, self: a }, s) {
    const o = a.RULES.types[s];
    return o && o !== !0 && t(n, o);
  }
  Le.schemaHasRulesForType = e;
  function t(n, a) {
    return a.rules.some((s) => r(n, s));
  }
  Le.shouldUseGroup = t;
  function r(n, a) {
    var s;
    return n[a.keyword] !== void 0 || ((s = a.definition.implements) === null || s === void 0 ? void 0 : s.some((o) => n[o] !== void 0));
  }
  return Le.shouldUseRule = r, Le;
}
var qs;
function Nr() {
  if (qs) return le;
  qs = 1, Object.defineProperty(le, "__esModule", { value: !0 }), le.reportTypeError = le.checkDataTypes = le.checkDataType = le.coerceAndCheckDataType = le.getJSONTypes = le.getSchemaTypes = le.DataType = void 0;
  const e = /* @__PURE__ */ oo(), t = /* @__PURE__ */ co(), r = /* @__PURE__ */ Tr(), n = /* @__PURE__ */ J(), a = /* @__PURE__ */ te();
  var s;
  (function(f) {
    f[f.Correct = 0] = "Correct", f[f.Wrong = 1] = "Wrong";
  })(s || (le.DataType = s = {}));
  function o(f) {
    const y = c(f.type);
    if (y.includes("null")) {
      if (f.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!y.length && f.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      f.nullable === !0 && y.push("null");
    }
    return y;
  }
  le.getSchemaTypes = o;
  function c(f) {
    const y = Array.isArray(f) ? f : f ? [f] : [];
    if (y.every(e.isJSONType))
      return y;
    throw new Error("type must be JSONType or JSONType[]: " + y.join(","));
  }
  le.getJSONTypes = c;
  function u(f, y) {
    const { gen: S, data: p, opts: w } = f, b = i(y, w.coerceTypes), O = y.length > 0 && !(b.length === 0 && y.length === 1 && (0, t.schemaHasRulesForType)(f, y[0]));
    if (O) {
      const M = E(y, p, w.strictNumbers, s.Wrong);
      S.if(M, () => {
        b.length ? v(f, y, b) : h(f);
      });
    }
    return O;
  }
  le.coerceAndCheckDataType = u;
  const l = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(f, y) {
    return y ? f.filter((S) => l.has(S) || y === "array" && S === "array") : [];
  }
  function v(f, y, S) {
    const { gen: p, data: w, opts: b } = f, O = p.let("dataType", (0, n._)`typeof ${w}`), M = p.let("coerced", (0, n._)`undefined`);
    b.coerceTypes === "array" && p.if((0, n._)`${O} == 'object' && Array.isArray(${w}) && ${w}.length == 1`, () => p.assign(w, (0, n._)`${w}[0]`).assign(O, (0, n._)`typeof ${w}`).if(E(y, w, b.strictNumbers), () => p.assign(M, w))), p.if((0, n._)`${M} !== undefined`);
    for (const k of S)
      (l.has(k) || k === "array" && b.coerceTypes === "array") && U(k);
    p.else(), h(f), p.endIf(), p.if((0, n._)`${M} !== undefined`, () => {
      p.assign(w, M), d(f, M);
    });
    function U(k) {
      switch (k) {
        case "string":
          p.elseIf((0, n._)`${O} == "number" || ${O} == "boolean"`).assign(M, (0, n._)`"" + ${w}`).elseIf((0, n._)`${w} === null`).assign(M, (0, n._)`""`);
          return;
        case "number":
          p.elseIf((0, n._)`${O} == "boolean" || ${w} === null
              || (${O} == "string" && ${w} && ${w} == +${w})`).assign(M, (0, n._)`+${w}`);
          return;
        case "integer":
          p.elseIf((0, n._)`${O} === "boolean" || ${w} === null
              || (${O} === "string" && ${w} && ${w} == +${w} && !(${w} % 1))`).assign(M, (0, n._)`+${w}`);
          return;
        case "boolean":
          p.elseIf((0, n._)`${w} === "false" || ${w} === 0 || ${w} === null`).assign(M, !1).elseIf((0, n._)`${w} === "true" || ${w} === 1`).assign(M, !0);
          return;
        case "null":
          p.elseIf((0, n._)`${w} === "" || ${w} === 0 || ${w} === false`), p.assign(M, null);
          return;
        case "array":
          p.elseIf((0, n._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${w} === null`).assign(M, (0, n._)`[${w}]`);
      }
    }
  }
  function d({ gen: f, parentData: y, parentDataProperty: S }, p) {
    f.if((0, n._)`${y} !== undefined`, () => f.assign((0, n._)`${y}[${S}]`, p));
  }
  function m(f, y, S, p = s.Correct) {
    const w = p === s.Correct ? n.operators.EQ : n.operators.NEQ;
    let b;
    switch (f) {
      case "null":
        return (0, n._)`${y} ${w} null`;
      case "array":
        b = (0, n._)`Array.isArray(${y})`;
        break;
      case "object":
        b = (0, n._)`${y} && typeof ${y} == "object" && !Array.isArray(${y})`;
        break;
      case "integer":
        b = O((0, n._)`!(${y} % 1) && !isNaN(${y})`);
        break;
      case "number":
        b = O();
        break;
      default:
        return (0, n._)`typeof ${y} ${w} ${f}`;
    }
    return p === s.Correct ? b : (0, n.not)(b);
    function O(M = n.nil) {
      return (0, n.and)((0, n._)`typeof ${y} == "number"`, M, S ? (0, n._)`isFinite(${y})` : n.nil);
    }
  }
  le.checkDataType = m;
  function E(f, y, S, p) {
    if (f.length === 1)
      return m(f[0], y, S, p);
    let w;
    const b = (0, a.toHash)(f);
    if (b.array && b.object) {
      const O = (0, n._)`typeof ${y} != "object"`;
      w = b.null ? O : (0, n._)`!${y} || ${O}`, delete b.null, delete b.array, delete b.object;
    } else
      w = n.nil;
    b.number && delete b.integer;
    for (const O in b)
      w = (0, n.and)(w, m(O, y, S, p));
    return w;
  }
  le.checkDataTypes = E;
  const $ = {
    message: ({ schema: f }) => `must be ${f}`,
    params: ({ schema: f, schemaValue: y }) => typeof f == "string" ? (0, n._)`{type: ${f}}` : (0, n._)`{type: ${y}}`
  };
  function h(f) {
    const y = g(f);
    (0, r.reportError)(y, $);
  }
  le.reportTypeError = h;
  function g(f) {
    const { gen: y, data: S, schema: p } = f, w = (0, a.schemaRefOrVal)(f, p, "type");
    return {
      gen: y,
      keyword: "type",
      data: S,
      schema: p.type,
      schemaCode: w,
      schemaValue: w,
      parentSchema: p,
      params: {},
      it: f
    };
  }
  return le;
}
var pt = {}, Cs;
function pc() {
  if (Cs) return pt;
  Cs = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.assignDefaults = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te();
  function r(a, s) {
    const { properties: o, items: c } = a.schema;
    if (s === "object" && o)
      for (const u in o)
        n(a, u, o[u].default);
    else s === "array" && Array.isArray(c) && c.forEach((u, l) => n(a, l, u.default));
  }
  pt.assignDefaults = r;
  function n(a, s, o) {
    const { gen: c, compositeRule: u, data: l, opts: i } = a;
    if (o === void 0)
      return;
    const v = (0, e._)`${l}${(0, e.getProperty)(s)}`;
    if (u) {
      (0, t.checkStrictMode)(a, `default is ignored for: ${v}`);
      return;
    }
    let d = (0, e._)`${v} === undefined`;
    i.useDefaults === "empty" && (d = (0, e._)`${d} || ${v} === null || ${v} === ""`), c.if(d, (0, e._)`${v} = ${(0, e.stringify)(o)}`);
  }
  return pt;
}
var Ne = {}, ae = {}, ks;
function Te() {
  if (ks) return ae;
  ks = 1, Object.defineProperty(ae, "__esModule", { value: !0 }), ae.validateUnion = ae.validateArray = ae.usePattern = ae.callValidateCode = ae.schemaProperties = ae.allSchemaProperties = ae.noPropertyInData = ae.propertyInData = ae.isOwnProperty = ae.hasPropFunc = ae.reportMissingProp = ae.checkMissingProp = ae.checkReportMissingProp = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ Oe(), n = /* @__PURE__ */ te();
  function a(f, y) {
    const { gen: S, data: p, it: w } = f;
    S.if(i(S, p, y, w.opts.ownProperties), () => {
      f.setParams({ missingProperty: (0, e._)`${y}` }, !0), f.error();
    });
  }
  ae.checkReportMissingProp = a;
  function s({ gen: f, data: y, it: { opts: S } }, p, w) {
    return (0, e.or)(...p.map((b) => (0, e.and)(i(f, y, b, S.ownProperties), (0, e._)`${w} = ${b}`)));
  }
  ae.checkMissingProp = s;
  function o(f, y) {
    f.setParams({ missingProperty: y }, !0), f.error();
  }
  ae.reportMissingProp = o;
  function c(f) {
    return f.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  ae.hasPropFunc = c;
  function u(f, y, S) {
    return (0, e._)`${c(f)}.call(${y}, ${S})`;
  }
  ae.isOwnProperty = u;
  function l(f, y, S, p) {
    const w = (0, e._)`${y}${(0, e.getProperty)(S)} !== undefined`;
    return p ? (0, e._)`${w} && ${u(f, y, S)}` : w;
  }
  ae.propertyInData = l;
  function i(f, y, S, p) {
    const w = (0, e._)`${y}${(0, e.getProperty)(S)} === undefined`;
    return p ? (0, e.or)(w, (0, e.not)(u(f, y, S))) : w;
  }
  ae.noPropertyInData = i;
  function v(f) {
    return f ? Object.keys(f).filter((y) => y !== "__proto__") : [];
  }
  ae.allSchemaProperties = v;
  function d(f, y) {
    return v(y).filter((S) => !(0, t.alwaysValidSchema)(f, y[S]));
  }
  ae.schemaProperties = d;
  function m({ schemaCode: f, data: y, it: { gen: S, topSchemaRef: p, schemaPath: w, errorPath: b }, it: O }, M, U, k) {
    const F = k ? (0, e._)`${f}, ${y}, ${p}${w}` : y, G = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, b)],
      [r.default.parentData, O.parentData],
      [r.default.parentDataProperty, O.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    O.opts.dynamicRef && G.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const j = (0, e._)`${F}, ${S.object(...G)}`;
    return U !== e.nil ? (0, e._)`${M}.call(${U}, ${j})` : (0, e._)`${M}(${j})`;
  }
  ae.callValidateCode = m;
  const E = (0, e._)`new RegExp`;
  function $({ gen: f, it: { opts: y } }, S) {
    const p = y.unicodeRegExp ? "u" : "", { regExp: w } = y.code, b = w(S, p);
    return f.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${w.code === "new RegExp" ? E : (0, n.useFunc)(f, w)}(${S}, ${p})`
    });
  }
  ae.usePattern = $;
  function h(f) {
    const { gen: y, data: S, keyword: p, it: w } = f, b = y.name("valid");
    if (w.allErrors) {
      const M = y.let("valid", !0);
      return O(() => y.assign(M, !1)), M;
    }
    return y.var(b, !0), O(() => y.break()), b;
    function O(M) {
      const U = y.const("len", (0, e._)`${S}.length`);
      y.forRange("i", 0, U, (k) => {
        f.subschema({
          keyword: p,
          dataProp: k,
          dataPropType: t.Type.Num
        }, b), y.if((0, e.not)(b), M);
      });
    }
  }
  ae.validateArray = h;
  function g(f) {
    const { gen: y, schema: S, keyword: p, it: w } = f;
    if (!Array.isArray(S))
      throw new Error("ajv implementation error");
    if (S.some((U) => (0, t.alwaysValidSchema)(w, U)) && !w.opts.unevaluated)
      return;
    const O = y.let("valid", !1), M = y.name("_valid");
    y.block(() => S.forEach((U, k) => {
      const F = f.subschema({
        keyword: p,
        schemaProp: k,
        compositeRule: !0
      }, M);
      y.assign(O, (0, e._)`${O} || ${M}`), f.mergeValidEvaluated(F, M) || y.if((0, e.not)(O));
    })), f.result(O, () => f.reset(), () => f.error(!0));
  }
  return ae.validateUnion = g, ae;
}
var Ds;
function yc() {
  if (Ds) return Ne;
  Ds = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.validateKeywordUsage = Ne.validSchemaType = Ne.funcKeywordCode = Ne.macroKeywordCode = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ Oe(), r = /* @__PURE__ */ Te(), n = /* @__PURE__ */ Tr();
  function a(d, m) {
    const { gen: E, keyword: $, schema: h, parentSchema: g, it: f } = d, y = m.macro.call(f.self, h, g, f), S = l(E, $, y);
    f.opts.validateSchema !== !1 && f.self.validateSchema(y, !0);
    const p = E.name("valid");
    d.subschema({
      schema: y,
      schemaPath: e.nil,
      errSchemaPath: `${f.errSchemaPath}/${$}`,
      topSchemaRef: S,
      compositeRule: !0
    }, p), d.pass(p, () => d.error(!0));
  }
  Ne.macroKeywordCode = a;
  function s(d, m) {
    var E;
    const { gen: $, keyword: h, schema: g, parentSchema: f, $data: y, it: S } = d;
    u(S, m);
    const p = !y && m.compile ? m.compile.call(S.self, g, f, S) : m.validate, w = l($, h, p), b = $.let("valid");
    d.block$data(b, O), d.ok((E = m.valid) !== null && E !== void 0 ? E : b);
    function O() {
      if (m.errors === !1)
        k(), m.modifying && o(d), F(() => d.error());
      else {
        const G = m.async ? M() : U();
        m.modifying && o(d), F(() => c(d, G));
      }
    }
    function M() {
      const G = $.let("ruleErrs", null);
      return $.try(() => k((0, e._)`await `), (j) => $.assign(b, !1).if((0, e._)`${j} instanceof ${S.ValidationError}`, () => $.assign(G, (0, e._)`${j}.errors`), () => $.throw(j))), G;
    }
    function U() {
      const G = (0, e._)`${w}.errors`;
      return $.assign(G, null), k(e.nil), G;
    }
    function k(G = m.async ? (0, e._)`await ` : e.nil) {
      const j = S.opts.passContext ? t.default.this : t.default.self, D = !("compile" in m && !y || m.schema === !1);
      $.assign(b, (0, e._)`${G}${(0, r.callValidateCode)(d, w, j, D)}`, m.modifying);
    }
    function F(G) {
      var j;
      $.if((0, e.not)((j = m.valid) !== null && j !== void 0 ? j : b), G);
    }
  }
  Ne.funcKeywordCode = s;
  function o(d) {
    const { gen: m, data: E, it: $ } = d;
    m.if($.parentData, () => m.assign(E, (0, e._)`${$.parentData}[${$.parentDataProperty}]`));
  }
  function c(d, m) {
    const { gen: E } = d;
    E.if((0, e._)`Array.isArray(${m})`, () => {
      E.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${m} : ${t.default.vErrors}.concat(${m})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(d);
    }, () => d.error());
  }
  function u({ schemaEnv: d }, m) {
    if (m.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function l(d, m, E) {
    if (E === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return d.scopeValue("keyword", typeof E == "function" ? { ref: E } : { ref: E, code: (0, e.stringify)(E) });
  }
  function i(d, m, E = !1) {
    return !m.length || m.some(($) => $ === "array" ? Array.isArray(d) : $ === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == $ || E && typeof d > "u");
  }
  Ne.validSchemaType = i;
  function v({ schema: d, opts: m, self: E, errSchemaPath: $ }, h, g) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(g) : h.keyword !== g)
      throw new Error("ajv implementation error");
    const f = h.dependencies;
    if (f != null && f.some((y) => !Object.prototype.hasOwnProperty.call(d, y)))
      throw new Error(`parent schema must have dependencies of ${g}: ${f.join(",")}`);
    if (h.validateSchema && !h.validateSchema(d[g])) {
      const S = `keyword "${g}" value is invalid at path "${$}": ` + E.errorsText(h.validateSchema.errors);
      if (m.validateSchema === "log")
        E.logger.error(S);
      else
        throw new Error(S);
    }
  }
  return Ne.validateKeywordUsage = v, Ne;
}
var Me = {}, Ls;
function gc() {
  if (Ls) return Me;
  Ls = 1, Object.defineProperty(Me, "__esModule", { value: !0 }), Me.extendSubschemaMode = Me.extendSubschemaData = Me.getSubschema = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te();
  function r(s, { keyword: o, schemaProp: c, schema: u, schemaPath: l, errSchemaPath: i, topSchemaRef: v }) {
    if (o !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const d = s.schema[o];
      return c === void 0 ? {
        schema: d,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}`
      } : {
        schema: d[c],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}/${(0, t.escapeFragment)(c)}`
      };
    }
    if (u !== void 0) {
      if (l === void 0 || i === void 0 || v === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: l,
        topSchemaRef: v,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Me.getSubschema = r;
  function n(s, o, { dataProp: c, dataPropType: u, data: l, dataTypes: i, propertyName: v }) {
    if (l !== void 0 && c !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = o;
    if (c !== void 0) {
      const { errorPath: E, dataPathArr: $, opts: h } = o, g = d.let("data", (0, e._)`${o.data}${(0, e.getProperty)(c)}`, !0);
      m(g), s.errorPath = (0, e.str)`${E}${(0, t.getErrorPath)(c, u, h.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${c}`, s.dataPathArr = [...$, s.parentDataProperty];
    }
    if (l !== void 0) {
      const E = l instanceof e.Name ? l : d.let("data", l, !0);
      m(E), v !== void 0 && (s.propertyName = v);
    }
    i && (s.dataTypes = i);
    function m(E) {
      s.data = E, s.dataLevel = o.dataLevel + 1, s.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), s.parentData = o.data, s.dataNames = [...o.dataNames, E];
    }
  }
  Me.extendSubschemaData = n;
  function a(s, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: u, createErrors: l, allErrors: i }) {
    u !== void 0 && (s.compositeRule = u), l !== void 0 && (s.createErrors = l), i !== void 0 && (s.allErrors = i), s.jtdDiscriminator = o, s.jtdMetadata = c;
  }
  return Me.extendSubschemaMode = a, Me;
}
var pe = {}, Zr, Ms;
function uo() {
  return Ms || (Ms = 1, Zr = function e(t, r) {
    if (t === r) return !0;
    if (t && r && typeof t == "object" && typeof r == "object") {
      if (t.constructor !== r.constructor) return !1;
      var n, a, s;
      if (Array.isArray(t)) {
        if (n = t.length, n != r.length) return !1;
        for (a = n; a-- !== 0; )
          if (!e(t[a], r[a])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
      if (s = Object.keys(t), n = s.length, n !== Object.keys(r).length) return !1;
      for (a = n; a-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, s[a])) return !1;
      for (a = n; a-- !== 0; ) {
        var o = s[a];
        if (!e(t[o], r[o])) return !1;
      }
      return !0;
    }
    return t !== t && r !== r;
  }), Zr;
}
var Qr = { exports: {} }, Vs;
function vc() {
  if (Vs) return Qr.exports;
  Vs = 1;
  var e = Qr.exports = function(n, a, s) {
    typeof a == "function" && (s = a, a = {}), s = a.cb || s;
    var o = typeof s == "function" ? s : s.pre || function() {
    }, c = s.post || function() {
    };
    t(a, o, c, n, "", n);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(n, a, s, o, c, u, l, i, v, d) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      a(o, c, u, l, i, v, d);
      for (var m in o) {
        var E = o[m];
        if (Array.isArray(E)) {
          if (m in e.arrayKeywords)
            for (var $ = 0; $ < E.length; $++)
              t(n, a, s, E[$], c + "/" + m + "/" + $, u, c, m, o, $);
        } else if (m in e.propsKeywords) {
          if (E && typeof E == "object")
            for (var h in E)
              t(n, a, s, E[h], c + "/" + m + "/" + r(h), u, c, m, o, h);
        } else (m in e.keywords || n.allKeys && !(m in e.skipKeywords)) && t(n, a, s, E, c + "/" + m, u, c, m, o);
      }
      s(o, c, u, l, i, v, d);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Qr.exports;
}
var Fs;
function Ar() {
  if (Fs) return pe;
  Fs = 1, Object.defineProperty(pe, "__esModule", { value: !0 }), pe.getSchemaRefs = pe.resolveUrl = pe.normalizeId = pe._getFullPath = pe.getFullPath = pe.inlineRef = void 0;
  const e = /* @__PURE__ */ te(), t = uo(), r = vc(), n = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function a($, h = !0) {
    return typeof $ == "boolean" ? !0 : h === !0 ? !o($) : h ? c($) <= h : !1;
  }
  pe.inlineRef = a;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function o($) {
    for (const h in $) {
      if (s.has(h))
        return !0;
      const g = $[h];
      if (Array.isArray(g) && g.some(o) || typeof g == "object" && o(g))
        return !0;
    }
    return !1;
  }
  function c($) {
    let h = 0;
    for (const g in $) {
      if (g === "$ref")
        return 1 / 0;
      if (h++, !n.has(g) && (typeof $[g] == "object" && (0, e.eachItem)($[g], (f) => h += c(f)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function u($, h = "", g) {
    g !== !1 && (h = v(h));
    const f = $.parse(h);
    return l($, f);
  }
  pe.getFullPath = u;
  function l($, h) {
    return $.serialize(h).split("#")[0] + "#";
  }
  pe._getFullPath = l;
  const i = /#\/?$/;
  function v($) {
    return $ ? $.replace(i, "") : "";
  }
  pe.normalizeId = v;
  function d($, h, g) {
    return g = v(g), $.resolve(h, g);
  }
  pe.resolveUrl = d;
  const m = /^[a-z_][-a-z0-9._]*$/i;
  function E($, h) {
    if (typeof $ == "boolean")
      return {};
    const { schemaId: g, uriResolver: f } = this.opts, y = v($[g] || h), S = { "": y }, p = u(f, y, !1), w = {}, b = /* @__PURE__ */ new Set();
    return r($, { allKeys: !0 }, (U, k, F, G) => {
      if (G === void 0)
        return;
      const j = p + k;
      let D = S[G];
      typeof U[g] == "string" && (D = X.call(this, U[g])), K.call(this, U.$anchor), K.call(this, U.$dynamicAnchor), S[k] = D;
      function X(z) {
        const H = this.opts.uriResolver.resolve;
        if (z = v(D ? H(D, z) : z), b.has(z))
          throw M(z);
        b.add(z);
        let q = this.refs[z];
        return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? O(U, q.schema, z) : z !== v(j) && (z[0] === "#" ? (O(U, w[z], z), w[z] = U) : this.refs[z] = j), z;
      }
      function K(z) {
        if (typeof z == "string") {
          if (!m.test(z))
            throw new Error(`invalid anchor "${z}"`);
          X.call(this, `#${z}`);
        }
      }
    }), w;
    function O(U, k, F) {
      if (k !== void 0 && !t(U, k))
        throw M(F);
    }
    function M(U) {
      return new Error(`reference "${U}" resolves to more than one schema`);
    }
  }
  return pe.getSchemaRefs = E, pe;
}
var zs;
function vt() {
  if (zs) return De;
  zs = 1, Object.defineProperty(De, "__esModule", { value: !0 }), De.getData = De.KeywordCxt = De.validateFunctionCode = void 0;
  const e = /* @__PURE__ */ mc(), t = /* @__PURE__ */ Nr(), r = /* @__PURE__ */ co(), n = /* @__PURE__ */ Nr(), a = /* @__PURE__ */ pc(), s = /* @__PURE__ */ yc(), o = /* @__PURE__ */ gc(), c = /* @__PURE__ */ J(), u = /* @__PURE__ */ Oe(), l = /* @__PURE__ */ Ar(), i = /* @__PURE__ */ te(), v = /* @__PURE__ */ Tr();
  function d(N) {
    if (p(N) && (b(N), S(N))) {
      h(N);
      return;
    }
    m(N, () => (0, e.topBoolOrEmptySchema)(N));
  }
  De.validateFunctionCode = d;
  function m({ gen: N, validateName: T, schema: L, schemaEnv: V, opts: B }, ee) {
    B.code.es5 ? N.func(T, (0, c._)`${u.default.data}, ${u.default.valCxt}`, V.$async, () => {
      N.code((0, c._)`"use strict"; ${f(L, B)}`), $(N, B), N.code(ee);
    }) : N.func(T, (0, c._)`${u.default.data}, ${E(B)}`, V.$async, () => N.code(f(L, B)).code(ee));
  }
  function E(N) {
    return (0, c._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${N.dynamicRef ? (0, c._)`, ${u.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function $(N, T) {
    N.if(u.default.valCxt, () => {
      N.var(u.default.instancePath, (0, c._)`${u.default.valCxt}.${u.default.instancePath}`), N.var(u.default.parentData, (0, c._)`${u.default.valCxt}.${u.default.parentData}`), N.var(u.default.parentDataProperty, (0, c._)`${u.default.valCxt}.${u.default.parentDataProperty}`), N.var(u.default.rootData, (0, c._)`${u.default.valCxt}.${u.default.rootData}`), T.dynamicRef && N.var(u.default.dynamicAnchors, (0, c._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      N.var(u.default.instancePath, (0, c._)`""`), N.var(u.default.parentData, (0, c._)`undefined`), N.var(u.default.parentDataProperty, (0, c._)`undefined`), N.var(u.default.rootData, u.default.data), T.dynamicRef && N.var(u.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function h(N) {
    const { schema: T, opts: L, gen: V } = N;
    m(N, () => {
      L.$comment && T.$comment && G(N), U(N), V.let(u.default.vErrors, null), V.let(u.default.errors, 0), L.unevaluated && g(N), O(N), j(N);
    });
  }
  function g(N) {
    const { gen: T, validateName: L } = N;
    N.evaluated = T.const("evaluated", (0, c._)`${L}.evaluated`), T.if((0, c._)`${N.evaluated}.dynamicProps`, () => T.assign((0, c._)`${N.evaluated}.props`, (0, c._)`undefined`)), T.if((0, c._)`${N.evaluated}.dynamicItems`, () => T.assign((0, c._)`${N.evaluated}.items`, (0, c._)`undefined`));
  }
  function f(N, T) {
    const L = typeof N == "object" && N[T.schemaId];
    return L && (T.code.source || T.code.process) ? (0, c._)`/*# sourceURL=${L} */` : c.nil;
  }
  function y(N, T) {
    if (p(N) && (b(N), S(N))) {
      w(N, T);
      return;
    }
    (0, e.boolOrEmptySchema)(N, T);
  }
  function S({ schema: N, self: T }) {
    if (typeof N == "boolean")
      return !N;
    for (const L in N)
      if (T.RULES.all[L])
        return !0;
    return !1;
  }
  function p(N) {
    return typeof N.schema != "boolean";
  }
  function w(N, T) {
    const { schema: L, gen: V, opts: B } = N;
    B.$comment && L.$comment && G(N), k(N), F(N);
    const ee = V.const("_errs", u.default.errors);
    O(N, ee), V.var(T, (0, c._)`${ee} === ${u.default.errors}`);
  }
  function b(N) {
    (0, i.checkUnknownRules)(N), M(N);
  }
  function O(N, T) {
    if (N.opts.jtd)
      return X(N, [], !1, T);
    const L = (0, t.getSchemaTypes)(N.schema), V = (0, t.coerceAndCheckDataType)(N, L);
    X(N, L, !V, T);
  }
  function M(N) {
    const { schema: T, errSchemaPath: L, opts: V, self: B } = N;
    T.$ref && V.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(T, B.RULES) && B.logger.warn(`$ref: keywords ignored in schema at path "${L}"`);
  }
  function U(N) {
    const { schema: T, opts: L } = N;
    T.default !== void 0 && L.useDefaults && L.strictSchema && (0, i.checkStrictMode)(N, "default is ignored in the schema root");
  }
  function k(N) {
    const T = N.schema[N.opts.schemaId];
    T && (N.baseId = (0, l.resolveUrl)(N.opts.uriResolver, N.baseId, T));
  }
  function F(N) {
    if (N.schema.$async && !N.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function G({ gen: N, schemaEnv: T, schema: L, errSchemaPath: V, opts: B }) {
    const ee = L.$comment;
    if (B.$comment === !0)
      N.code((0, c._)`${u.default.self}.logger.log(${ee})`);
    else if (typeof B.$comment == "function") {
      const ce = (0, c.str)`${V}/$comment`, Re = N.scopeValue("root", { ref: T.root });
      N.code((0, c._)`${u.default.self}.opts.$comment(${ee}, ${ce}, ${Re}.schema)`);
    }
  }
  function j(N) {
    const { gen: T, schemaEnv: L, validateName: V, ValidationError: B, opts: ee } = N;
    L.$async ? T.if((0, c._)`${u.default.errors} === 0`, () => T.return(u.default.data), () => T.throw((0, c._)`new ${B}(${u.default.vErrors})`)) : (T.assign((0, c._)`${V}.errors`, u.default.vErrors), ee.unevaluated && D(N), T.return((0, c._)`${u.default.errors} === 0`));
  }
  function D({ gen: N, evaluated: T, props: L, items: V }) {
    L instanceof c.Name && N.assign((0, c._)`${T}.props`, L), V instanceof c.Name && N.assign((0, c._)`${T}.items`, V);
  }
  function X(N, T, L, V) {
    const { gen: B, schema: ee, data: ce, allErrors: Re, opts: ge, self: ve } = N, { RULES: ue } = ve;
    if (ee.$ref && (ge.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(ee, ue))) {
      B.block(() => x(N, "$ref", ue.all.$ref.definition));
      return;
    }
    ge.jtd || z(N, T), B.block(() => {
      for (const Se of ue.rules)
        tt(Se);
      tt(ue.post);
    });
    function tt(Se) {
      (0, r.shouldUseGroup)(ee, Se) && (Se.type ? (B.if((0, n.checkDataType)(Se.type, ce, ge.strictNumbers)), K(N, Se), T.length === 1 && T[0] === Se.type && L && (B.else(), (0, n.reportTypeError)(N)), B.endIf()) : K(N, Se), Re || B.if((0, c._)`${u.default.errors} === ${V || 0}`));
    }
  }
  function K(N, T) {
    const { gen: L, schema: V, opts: { useDefaults: B } } = N;
    B && (0, a.assignDefaults)(N, T.type), L.block(() => {
      for (const ee of T.rules)
        (0, r.shouldUseRule)(V, ee) && x(N, ee.keyword, ee.definition, T.type);
    });
  }
  function z(N, T) {
    N.schemaEnv.meta || !N.opts.strictTypes || (H(N, T), N.opts.allowUnionTypes || q(N, T), P(N, N.dataTypes));
  }
  function H(N, T) {
    if (T.length) {
      if (!N.dataTypes.length) {
        N.dataTypes = T;
        return;
      }
      T.forEach((L) => {
        I(N.dataTypes, L) || R(N, `type "${L}" not allowed by context "${N.dataTypes.join(",")}"`);
      }), _(N, T);
    }
  }
  function q(N, T) {
    T.length > 1 && !(T.length === 2 && T.includes("null")) && R(N, "use allowUnionTypes to allow union type keyword");
  }
  function P(N, T) {
    const L = N.self.RULES.all;
    for (const V in L) {
      const B = L[V];
      if (typeof B == "object" && (0, r.shouldUseRule)(N.schema, B)) {
        const { type: ee } = B.definition;
        ee.length && !ee.some((ce) => A(T, ce)) && R(N, `missing type "${ee.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function A(N, T) {
    return N.includes(T) || T === "number" && N.includes("integer");
  }
  function I(N, T) {
    return N.includes(T) || T === "integer" && N.includes("number");
  }
  function _(N, T) {
    const L = [];
    for (const V of N.dataTypes)
      I(T, V) ? L.push(V) : T.includes("integer") && V === "number" && L.push("integer");
    N.dataTypes = L;
  }
  function R(N, T) {
    const L = N.schemaEnv.baseId + N.errSchemaPath;
    T += ` at "${L}" (strictTypes)`, (0, i.checkStrictMode)(N, T, N.opts.strictTypes);
  }
  class C {
    constructor(T, L, V) {
      if ((0, s.validateKeywordUsage)(T, L, V), this.gen = T.gen, this.allErrors = T.allErrors, this.keyword = V, this.data = T.data, this.schema = T.schema[V], this.$data = L.$data && T.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(T, this.schema, V, this.$data), this.schemaType = L.schemaType, this.parentSchema = T.schema, this.params = {}, this.it = T, this.def = L, this.$data)
        this.schemaCode = T.gen.const("vSchema", re(this.$data, T));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, L.schemaType, L.allowUndefined))
        throw new Error(`${V} value must be ${JSON.stringify(L.schemaType)}`);
      ("code" in L ? L.trackErrors : L.errors !== !1) && (this.errsCount = T.gen.const("_errs", u.default.errors));
    }
    result(T, L, V) {
      this.failResult((0, c.not)(T), L, V);
    }
    failResult(T, L, V) {
      this.gen.if(T), V ? V() : this.error(), L ? (this.gen.else(), L(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(T, L) {
      this.failResult((0, c.not)(T), void 0, L);
    }
    fail(T) {
      if (T === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(T), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(T) {
      if (!this.$data)
        return this.fail(T);
      const { schemaCode: L } = this;
      this.fail((0, c._)`${L} !== undefined && (${(0, c.or)(this.invalid$data(), T)})`);
    }
    error(T, L, V) {
      if (L) {
        this.setParams(L), this._error(T, V), this.setParams({});
        return;
      }
      this._error(T, V);
    }
    _error(T, L) {
      (T ? v.reportExtraError : v.reportError)(this, this.def.error, L);
    }
    $dataError() {
      (0, v.reportError)(this, this.def.$dataError || v.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, v.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(T) {
      this.allErrors || this.gen.if(T);
    }
    setParams(T, L) {
      L ? Object.assign(this.params, T) : this.params = T;
    }
    block$data(T, L, V = c.nil) {
      this.gen.block(() => {
        this.check$data(T, V), L();
      });
    }
    check$data(T = c.nil, L = c.nil) {
      if (!this.$data)
        return;
      const { gen: V, schemaCode: B, schemaType: ee, def: ce } = this;
      V.if((0, c.or)((0, c._)`${B} === undefined`, L)), T !== c.nil && V.assign(T, !0), (ee.length || ce.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), T !== c.nil && V.assign(T, !1)), V.else();
    }
    invalid$data() {
      const { gen: T, schemaCode: L, schemaType: V, def: B, it: ee } = this;
      return (0, c.or)(ce(), Re());
      function ce() {
        if (V.length) {
          if (!(L instanceof c.Name))
            throw new Error("ajv implementation error");
          const ge = Array.isArray(V) ? V : [V];
          return (0, c._)`${(0, n.checkDataTypes)(ge, L, ee.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function Re() {
        if (B.validateSchema) {
          const ge = T.scopeValue("validate$data", { ref: B.validateSchema });
          return (0, c._)`!${ge}(${L})`;
        }
        return c.nil;
      }
    }
    subschema(T, L) {
      const V = (0, o.getSubschema)(this.it, T);
      (0, o.extendSubschemaData)(V, this.it, T), (0, o.extendSubschemaMode)(V, T);
      const B = { ...this.it, ...V, items: void 0, props: void 0 };
      return y(B, L), B;
    }
    mergeEvaluated(T, L) {
      const { it: V, gen: B } = this;
      V.opts.unevaluated && (V.props !== !0 && T.props !== void 0 && (V.props = i.mergeEvaluated.props(B, T.props, V.props, L)), V.items !== !0 && T.items !== void 0 && (V.items = i.mergeEvaluated.items(B, T.items, V.items, L)));
    }
    mergeValidEvaluated(T, L) {
      const { it: V, gen: B } = this;
      if (V.opts.unevaluated && (V.props !== !0 || V.items !== !0))
        return B.if(L, () => this.mergeEvaluated(T, c.Name)), !0;
    }
  }
  De.KeywordCxt = C;
  function x(N, T, L, V) {
    const B = new C(N, L, T);
    "code" in L ? L.code(B, V) : B.$data && L.validate ? (0, s.funcKeywordCode)(B, L) : "macro" in L ? (0, s.macroKeywordCode)(B, L) : (L.compile || L.validate) && (0, s.funcKeywordCode)(B, L);
  }
  const W = /^\/(?:[^~]|~0|~1)*$/, ne = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function re(N, { dataLevel: T, dataNames: L, dataPathArr: V }) {
    let B, ee;
    if (N === "")
      return u.default.rootData;
    if (N[0] === "/") {
      if (!W.test(N))
        throw new Error(`Invalid JSON-pointer: ${N}`);
      B = N, ee = u.default.rootData;
    } else {
      const ve = ne.exec(N);
      if (!ve)
        throw new Error(`Invalid JSON-pointer: ${N}`);
      const ue = +ve[1];
      if (B = ve[2], B === "#") {
        if (ue >= T)
          throw new Error(ge("property/index", ue));
        return V[T - ue];
      }
      if (ue > T)
        throw new Error(ge("data", ue));
      if (ee = L[T - ue], !B)
        return ee;
    }
    let ce = ee;
    const Re = B.split("/");
    for (const ve of Re)
      ve && (ee = (0, c._)`${ee}${(0, c.getProperty)((0, i.unescapeJsonPointer)(ve))}`, ce = (0, c._)`${ce} && ${ee}`);
    return ce;
    function ge(ve, ue) {
      return `Cannot access ${ve} ${ue} levels up, current level is ${T}`;
    }
  }
  return De.getData = re, De;
}
var Rt = {}, Us;
function jr() {
  if (Us) return Rt;
  Us = 1, Object.defineProperty(Rt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return Rt.default = e, Rt;
}
var Pt = {}, Gs;
function $t() {
  if (Gs) return Pt;
  Gs = 1, Object.defineProperty(Pt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Ar();
  class t extends Error {
    constructor(n, a, s, o) {
      super(o || `can't resolve reference ${s} from id ${a}`), this.missingRef = (0, e.resolveUrl)(n, a, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return Pt.default = t, Pt;
}
var we = {}, Ks;
function qr() {
  if (Ks) return we;
  Ks = 1, Object.defineProperty(we, "__esModule", { value: !0 }), we.resolveSchema = we.getCompilingSchema = we.resolveRef = we.compileSchema = we.SchemaEnv = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ jr(), r = /* @__PURE__ */ Oe(), n = /* @__PURE__ */ Ar(), a = /* @__PURE__ */ te(), s = /* @__PURE__ */ vt();
  class o {
    constructor(g) {
      var f;
      this.refs = {}, this.dynamicAnchors = {};
      let y;
      typeof g.schema == "object" && (y = g.schema), this.schema = g.schema, this.schemaId = g.schemaId, this.root = g.root || this, this.baseId = (f = g.baseId) !== null && f !== void 0 ? f : (0, n.normalizeId)(y == null ? void 0 : y[g.schemaId || "$id"]), this.schemaPath = g.schemaPath, this.localRefs = g.localRefs, this.meta = g.meta, this.$async = y == null ? void 0 : y.$async, this.refs = {};
    }
  }
  we.SchemaEnv = o;
  function c(h) {
    const g = i.call(this, h);
    if (g)
      return g;
    const f = (0, n.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: y, lines: S } = this.opts.code, { ownProperties: p } = this.opts, w = new e.CodeGen(this.scope, { es5: y, lines: S, ownProperties: p });
    let b;
    h.$async && (b = w.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = w.scopeName("validate");
    h.validateName = O;
    const M = {
      gen: w,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: w.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: O,
      ValidationError: b,
      schema: h.schema,
      schemaEnv: h,
      rootId: f,
      baseId: h.baseId || f,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let U;
    try {
      this._compilations.add(h), (0, s.validateFunctionCode)(M), w.optimize(this.opts.code.optimize);
      const k = w.toString();
      U = `${w.scopeRefs(r.default.scope)}return ${k}`, this.opts.code.process && (U = this.opts.code.process(U, h));
      const G = new Function(`${r.default.self}`, `${r.default.scope}`, U)(this, this.scope.get());
      if (this.scope.value(O, { ref: G }), G.errors = null, G.schema = h.schema, G.schemaEnv = h, h.$async && (G.$async = !0), this.opts.code.source === !0 && (G.source = { validateName: O, validateCode: k, scopeValues: w._values }), this.opts.unevaluated) {
        const { props: j, items: D } = M;
        G.evaluated = {
          props: j instanceof e.Name ? void 0 : j,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: j instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, G.source && (G.source.evaluated = (0, e.stringify)(G.evaluated));
      }
      return h.validate = G, h;
    } catch (k) {
      throw delete h.validate, delete h.validateName, U && this.logger.error("Error compiling schema, function code:", U), k;
    } finally {
      this._compilations.delete(h);
    }
  }
  we.compileSchema = c;
  function u(h, g, f) {
    var y;
    f = (0, n.resolveUrl)(this.opts.uriResolver, g, f);
    const S = h.refs[f];
    if (S)
      return S;
    let p = d.call(this, h, f);
    if (p === void 0) {
      const w = (y = h.localRefs) === null || y === void 0 ? void 0 : y[f], { schemaId: b } = this.opts;
      w && (p = new o({ schema: w, schemaId: b, root: h, baseId: g }));
    }
    if (p !== void 0)
      return h.refs[f] = l.call(this, p);
  }
  we.resolveRef = u;
  function l(h) {
    return (0, n.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : c.call(this, h);
  }
  function i(h) {
    for (const g of this._compilations)
      if (v(g, h))
        return g;
  }
  we.getCompilingSchema = i;
  function v(h, g) {
    return h.schema === g.schema && h.root === g.root && h.baseId === g.baseId;
  }
  function d(h, g) {
    let f;
    for (; typeof (f = this.refs[g]) == "string"; )
      g = f;
    return f || this.schemas[g] || m.call(this, h, g);
  }
  function m(h, g) {
    const f = this.opts.uriResolver.parse(g), y = (0, n._getFullPath)(this.opts.uriResolver, f);
    let S = (0, n.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && y === S)
      return $.call(this, f, h);
    const p = (0, n.normalizeId)(y), w = this.refs[p] || this.schemas[p];
    if (typeof w == "string") {
      const b = m.call(this, h, w);
      return typeof (b == null ? void 0 : b.schema) != "object" ? void 0 : $.call(this, f, b);
    }
    if (typeof (w == null ? void 0 : w.schema) == "object") {
      if (w.validate || c.call(this, w), p === (0, n.normalizeId)(g)) {
        const { schema: b } = w, { schemaId: O } = this.opts, M = b[O];
        return M && (S = (0, n.resolveUrl)(this.opts.uriResolver, S, M)), new o({ schema: b, schemaId: O, root: h, baseId: S });
      }
      return $.call(this, f, w);
    }
  }
  we.resolveSchema = m;
  const E = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function $(h, { baseId: g, schema: f, root: y }) {
    var S;
    if (((S = h.fragment) === null || S === void 0 ? void 0 : S[0]) !== "/")
      return;
    for (const b of h.fragment.slice(1).split("/")) {
      if (typeof f == "boolean")
        return;
      const O = f[(0, a.unescapeFragment)(b)];
      if (O === void 0)
        return;
      f = O;
      const M = typeof f == "object" && f[this.opts.schemaId];
      !E.has(b) && M && (g = (0, n.resolveUrl)(this.opts.uriResolver, g, M));
    }
    let p;
    if (typeof f != "boolean" && f.$ref && !(0, a.schemaHasRulesButRef)(f, this.RULES)) {
      const b = (0, n.resolveUrl)(this.opts.uriResolver, g, f.$ref);
      p = m.call(this, y, b);
    }
    const { schemaId: w } = this.opts;
    if (p = p || new o({ schema: f, schemaId: w, root: y, baseId: g }), p.schema !== p.root.schema)
      return p;
  }
  return we;
}
const $c = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", _c = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Ec = "object", wc = ["$data"], Sc = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, bc = !1, Rc = {
  $id: $c,
  description: _c,
  type: Ec,
  required: wc,
  properties: Sc,
  additionalProperties: bc
};
var It = {}, yt = { exports: {} }, en, Hs;
function lo() {
  if (Hs) return en;
  Hs = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function r(d) {
    let m = "", E = 0, $ = 0;
    for ($ = 0; $ < d.length; $++)
      if (E = d[$].charCodeAt(0), E !== 48) {
        if (!(E >= 48 && E <= 57 || E >= 65 && E <= 70 || E >= 97 && E <= 102))
          return "";
        m += d[$];
        break;
      }
    for ($ += 1; $ < d.length; $++) {
      if (E = d[$].charCodeAt(0), !(E >= 48 && E <= 57 || E >= 65 && E <= 70 || E >= 97 && E <= 102))
        return "";
      m += d[$];
    }
    return m;
  }
  const n = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function a(d) {
    return d.length = 0, !0;
  }
  function s(d, m, E) {
    if (d.length) {
      const $ = r(d);
      if ($ !== "")
        m.push($);
      else
        return E.error = !0, !1;
      d.length = 0;
    }
    return !0;
  }
  function o(d) {
    let m = 0;
    const E = { error: !1, address: "", zone: "" }, $ = [], h = [];
    let g = !1, f = !1, y = s;
    for (let S = 0; S < d.length; S++) {
      const p = d[S];
      if (!(p === "[" || p === "]"))
        if (p === ":") {
          if (g === !0 && (f = !0), !y(h, $, E))
            break;
          if (++m > 7) {
            E.error = !0;
            break;
          }
          S > 0 && d[S - 1] === ":" && (g = !0), $.push(":");
          continue;
        } else if (p === "%") {
          if (!y(h, $, E))
            break;
          y = a;
        } else {
          h.push(p);
          continue;
        }
    }
    return h.length && (y === a ? E.zone = h.join("") : f ? $.push(h.join("")) : $.push(r(h))), E.address = $.join(""), E;
  }
  function c(d) {
    if (u(d, ":") < 2)
      return { host: d, isIPV6: !1 };
    const m = o(d);
    if (m.error)
      return { host: d, isIPV6: !1 };
    {
      let E = m.address, $ = m.address;
      return m.zone && (E += "%" + m.zone, $ += "%25" + m.zone), { host: E, isIPV6: !0, escapedHost: $ };
    }
  }
  function u(d, m) {
    let E = 0;
    for (let $ = 0; $ < d.length; $++)
      d[$] === m && E++;
    return E;
  }
  function l(d) {
    let m = d;
    const E = [];
    let $ = -1, h = 0;
    for (; h = m.length; ) {
      if (h === 1) {
        if (m === ".")
          break;
        if (m === "/") {
          E.push("/");
          break;
        } else {
          E.push(m);
          break;
        }
      } else if (h === 2) {
        if (m[0] === ".") {
          if (m[1] === ".")
            break;
          if (m[1] === "/") {
            m = m.slice(2);
            continue;
          }
        } else if (m[0] === "/" && (m[1] === "." || m[1] === "/")) {
          E.push("/");
          break;
        }
      } else if (h === 3 && m === "/..") {
        E.length !== 0 && E.pop(), E.push("/");
        break;
      }
      if (m[0] === ".") {
        if (m[1] === ".") {
          if (m[2] === "/") {
            m = m.slice(3);
            continue;
          }
        } else if (m[1] === "/") {
          m = m.slice(2);
          continue;
        }
      } else if (m[0] === "/" && m[1] === ".") {
        if (m[2] === "/") {
          m = m.slice(2);
          continue;
        } else if (m[2] === "." && m[3] === "/") {
          m = m.slice(3), E.length !== 0 && E.pop();
          continue;
        }
      }
      if (($ = m.indexOf("/", 1)) === -1) {
        E.push(m);
        break;
      } else
        E.push(m.slice(0, $)), m = m.slice($);
    }
    return E.join("");
  }
  function i(d, m) {
    const E = m !== !0 ? escape : unescape;
    return d.scheme !== void 0 && (d.scheme = E(d.scheme)), d.userinfo !== void 0 && (d.userinfo = E(d.userinfo)), d.host !== void 0 && (d.host = E(d.host)), d.path !== void 0 && (d.path = E(d.path)), d.query !== void 0 && (d.query = E(d.query)), d.fragment !== void 0 && (d.fragment = E(d.fragment)), d;
  }
  function v(d) {
    const m = [];
    if (d.userinfo !== void 0 && (m.push(d.userinfo), m.push("@")), d.host !== void 0) {
      let E = unescape(d.host);
      if (!t(E)) {
        const $ = c(E);
        $.isIPV6 === !0 ? E = `[${$.escapedHost}]` : E = d.host;
      }
      m.push(E);
    }
    return (typeof d.port == "number" || typeof d.port == "string") && (m.push(":"), m.push(String(d.port))), m.length ? m.join("") : void 0;
  }
  return en = {
    nonSimpleDomain: n,
    recomposeAuthority: v,
    normalizeComponentEncoding: i,
    removeDotSegments: l,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: c,
    stringArrayToHexStripped: r
  }, en;
}
var tn, Xs;
function Pc() {
  if (Xs) return tn;
  Xs = 1;
  const { isUUID: e } = lo(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, r = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function n(p) {
    return r.indexOf(
      /** @type {*} */
      p
    ) !== -1;
  }
  function a(p) {
    return p.secure === !0 ? !0 : p.secure === !1 ? !1 : p.scheme ? p.scheme.length === 3 && (p.scheme[0] === "w" || p.scheme[0] === "W") && (p.scheme[1] === "s" || p.scheme[1] === "S") && (p.scheme[2] === "s" || p.scheme[2] === "S") : !1;
  }
  function s(p) {
    return p.host || (p.error = p.error || "HTTP URIs must have a host."), p;
  }
  function o(p) {
    const w = String(p.scheme).toLowerCase() === "https";
    return (p.port === (w ? 443 : 80) || p.port === "") && (p.port = void 0), p.path || (p.path = "/"), p;
  }
  function c(p) {
    return p.secure = a(p), p.resourceName = (p.path || "/") + (p.query ? "?" + p.query : ""), p.path = void 0, p.query = void 0, p;
  }
  function u(p) {
    if ((p.port === (a(p) ? 443 : 80) || p.port === "") && (p.port = void 0), typeof p.secure == "boolean" && (p.scheme = p.secure ? "wss" : "ws", p.secure = void 0), p.resourceName) {
      const [w, b] = p.resourceName.split("?");
      p.path = w && w !== "/" ? w : void 0, p.query = b, p.resourceName = void 0;
    }
    return p.fragment = void 0, p;
  }
  function l(p, w) {
    if (!p.path)
      return p.error = "URN can not be parsed", p;
    const b = p.path.match(t);
    if (b) {
      const O = w.scheme || p.scheme || "urn";
      p.nid = b[1].toLowerCase(), p.nss = b[2];
      const M = `${O}:${w.nid || p.nid}`, U = S(M);
      p.path = void 0, U && (p = U.parse(p, w));
    } else
      p.error = p.error || "URN can not be parsed.";
    return p;
  }
  function i(p, w) {
    if (p.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const b = w.scheme || p.scheme || "urn", O = p.nid.toLowerCase(), M = `${b}:${w.nid || O}`, U = S(M);
    U && (p = U.serialize(p, w));
    const k = p, F = p.nss;
    return k.path = `${O || w.nid}:${F}`, w.skipEscape = !0, k;
  }
  function v(p, w) {
    const b = p;
    return b.uuid = b.nss, b.nss = void 0, !w.tolerant && (!b.uuid || !e(b.uuid)) && (b.error = b.error || "UUID is not valid."), b;
  }
  function d(p) {
    const w = p;
    return w.nss = (p.uuid || "").toLowerCase(), w;
  }
  const m = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: o
    }
  ), E = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: m.domainHost,
      parse: s,
      serialize: o
    }
  ), $ = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: c,
      serialize: u
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: $.domainHost,
      parse: $.parse,
      serialize: $.serialize
    }
  ), y = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: m,
      https: E,
      ws: $,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: l,
          serialize: i,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: v,
          serialize: d,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(y, null);
  function S(p) {
    return p && (y[
      /** @type {SchemeName} */
      p
    ] || y[
      /** @type {SchemeName} */
      p.toLowerCase()
    ]) || void 0;
  }
  return tn = {
    wsIsSecure: a,
    SCHEMES: y,
    isValidSchemeName: n,
    getSchemeHandler: S
  }, tn;
}
var xs;
function Ic() {
  if (xs) return yt.exports;
  xs = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: r, normalizeComponentEncoding: n, isIPv4: a, nonSimpleDomain: s } = lo(), { SCHEMES: o, getSchemeHandler: c } = Pc();
  function u(h, g) {
    return typeof h == "string" ? h = /** @type {T} */
    d(E(h, g), g) : typeof h == "object" && (h = /** @type {T} */
    E(d(h, g), g)), h;
  }
  function l(h, g, f) {
    const y = f ? Object.assign({ scheme: "null" }, f) : { scheme: "null" }, S = i(E(h, y), E(g, y), y, !0);
    return y.skipEscape = !0, d(S, y);
  }
  function i(h, g, f, y) {
    const S = {};
    return y || (h = E(d(h, f), f), g = E(d(g, f), f)), f = f || {}, !f.tolerant && g.scheme ? (S.scheme = g.scheme, S.userinfo = g.userinfo, S.host = g.host, S.port = g.port, S.path = t(g.path || ""), S.query = g.query) : (g.userinfo !== void 0 || g.host !== void 0 || g.port !== void 0 ? (S.userinfo = g.userinfo, S.host = g.host, S.port = g.port, S.path = t(g.path || ""), S.query = g.query) : (g.path ? (g.path[0] === "/" ? S.path = t(g.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? S.path = "/" + g.path : h.path ? S.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + g.path : S.path = g.path, S.path = t(S.path)), S.query = g.query) : (S.path = h.path, g.query !== void 0 ? S.query = g.query : S.query = h.query), S.userinfo = h.userinfo, S.host = h.host, S.port = h.port), S.scheme = h.scheme), S.fragment = g.fragment, S;
  }
  function v(h, g, f) {
    return typeof h == "string" ? (h = unescape(h), h = d(n(E(h, f), !0), { ...f, skipEscape: !0 })) : typeof h == "object" && (h = d(n(h, !0), { ...f, skipEscape: !0 })), typeof g == "string" ? (g = unescape(g), g = d(n(E(g, f), !0), { ...f, skipEscape: !0 })) : typeof g == "object" && (g = d(n(g, !0), { ...f, skipEscape: !0 })), h.toLowerCase() === g.toLowerCase();
  }
  function d(h, g) {
    const f = {
      host: h.host,
      scheme: h.scheme,
      userinfo: h.userinfo,
      port: h.port,
      path: h.path,
      query: h.query,
      nid: h.nid,
      nss: h.nss,
      uuid: h.uuid,
      fragment: h.fragment,
      reference: h.reference,
      resourceName: h.resourceName,
      secure: h.secure,
      error: ""
    }, y = Object.assign({}, g), S = [], p = c(y.scheme || f.scheme);
    p && p.serialize && p.serialize(f, y), f.path !== void 0 && (y.skipEscape ? f.path = unescape(f.path) : (f.path = escape(f.path), f.scheme !== void 0 && (f.path = f.path.split("%3A").join(":")))), y.reference !== "suffix" && f.scheme && S.push(f.scheme, ":");
    const w = r(f);
    if (w !== void 0 && (y.reference !== "suffix" && S.push("//"), S.push(w), f.path && f.path[0] !== "/" && S.push("/")), f.path !== void 0) {
      let b = f.path;
      !y.absolutePath && (!p || !p.absolutePath) && (b = t(b)), w === void 0 && b[0] === "/" && b[1] === "/" && (b = "/%2F" + b.slice(2)), S.push(b);
    }
    return f.query !== void 0 && S.push("?", f.query), f.fragment !== void 0 && S.push("#", f.fragment), S.join("");
  }
  const m = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function E(h, g) {
    const f = Object.assign({}, g), y = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let S = !1;
    f.reference === "suffix" && (f.scheme ? h = f.scheme + ":" + h : h = "//" + h);
    const p = h.match(m);
    if (p) {
      if (y.scheme = p[1], y.userinfo = p[3], y.host = p[4], y.port = parseInt(p[5], 10), y.path = p[6] || "", y.query = p[7], y.fragment = p[8], isNaN(y.port) && (y.port = p[5]), y.host)
        if (a(y.host) === !1) {
          const O = e(y.host);
          y.host = O.host.toLowerCase(), S = O.isIPV6;
        } else
          S = !0;
      y.scheme === void 0 && y.userinfo === void 0 && y.host === void 0 && y.port === void 0 && y.query === void 0 && !y.path ? y.reference = "same-document" : y.scheme === void 0 ? y.reference = "relative" : y.fragment === void 0 ? y.reference = "absolute" : y.reference = "uri", f.reference && f.reference !== "suffix" && f.reference !== y.reference && (y.error = y.error || "URI is not a " + f.reference + " reference.");
      const w = c(f.scheme || y.scheme);
      if (!f.unicodeSupport && (!w || !w.unicodeSupport) && y.host && (f.domainHost || w && w.domainHost) && S === !1 && s(y.host))
        try {
          y.host = URL.domainToASCII(y.host.toLowerCase());
        } catch (b) {
          y.error = y.error || "Host's domain name can not be converted to ASCII: " + b;
        }
      (!w || w && !w.skipNormalize) && (h.indexOf("%") !== -1 && (y.scheme !== void 0 && (y.scheme = unescape(y.scheme)), y.host !== void 0 && (y.host = unescape(y.host))), y.path && (y.path = escape(unescape(y.path))), y.fragment && (y.fragment = encodeURI(decodeURIComponent(y.fragment)))), w && w.parse && w.parse(y, f);
    } else
      y.error = y.error || "URI can not be parsed.";
    return y;
  }
  const $ = {
    SCHEMES: o,
    normalize: u,
    resolve: l,
    resolveComponent: i,
    equal: v,
    serialize: d,
    parse: E
  };
  return yt.exports = $, yt.exports.default = $, yt.exports.fastUri = $, yt.exports;
}
var Bs;
function Nc() {
  if (Bs) return It;
  Bs = 1, Object.defineProperty(It, "__esModule", { value: !0 });
  const e = Ic();
  return e.code = 'require("ajv/dist/runtime/uri").default', It.default = e, It;
}
var Ws;
function fo() {
  return Ws || (Ws = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = /* @__PURE__ */ vt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var r = /* @__PURE__ */ J();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const n = /* @__PURE__ */ jr(), a = /* @__PURE__ */ $t(), s = /* @__PURE__ */ oo(), o = /* @__PURE__ */ qr(), c = /* @__PURE__ */ J(), u = /* @__PURE__ */ Ar(), l = /* @__PURE__ */ Nr(), i = /* @__PURE__ */ te(), v = Rc, d = /* @__PURE__ */ Nc(), m = (q, P) => new RegExp(q, P);
    m.code = "new RegExp";
    const E = ["removeAdditional", "useDefaults", "coerceTypes"], $ = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), h = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, g = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, f = 200;
    function y(q) {
      var P, A, I, _, R, C, x, W, ne, re, N, T, L, V, B, ee, ce, Re, ge, ve, ue, tt, Se, Vr, Fr;
      const dt = q.strict, zr = (P = q.code) === null || P === void 0 ? void 0 : P.optimize, ds = zr === !0 || zr === void 0 ? 1 : zr || 0, hs = (I = (A = q.code) === null || A === void 0 ? void 0 : A.regExp) !== null && I !== void 0 ? I : m, Vo = (_ = q.uriResolver) !== null && _ !== void 0 ? _ : d.default;
      return {
        strictSchema: (C = (R = q.strictSchema) !== null && R !== void 0 ? R : dt) !== null && C !== void 0 ? C : !0,
        strictNumbers: (W = (x = q.strictNumbers) !== null && x !== void 0 ? x : dt) !== null && W !== void 0 ? W : !0,
        strictTypes: (re = (ne = q.strictTypes) !== null && ne !== void 0 ? ne : dt) !== null && re !== void 0 ? re : "log",
        strictTuples: (T = (N = q.strictTuples) !== null && N !== void 0 ? N : dt) !== null && T !== void 0 ? T : "log",
        strictRequired: (V = (L = q.strictRequired) !== null && L !== void 0 ? L : dt) !== null && V !== void 0 ? V : !1,
        code: q.code ? { ...q.code, optimize: ds, regExp: hs } : { optimize: ds, regExp: hs },
        loopRequired: (B = q.loopRequired) !== null && B !== void 0 ? B : f,
        loopEnum: (ee = q.loopEnum) !== null && ee !== void 0 ? ee : f,
        meta: (ce = q.meta) !== null && ce !== void 0 ? ce : !0,
        messages: (Re = q.messages) !== null && Re !== void 0 ? Re : !0,
        inlineRefs: (ge = q.inlineRefs) !== null && ge !== void 0 ? ge : !0,
        schemaId: (ve = q.schemaId) !== null && ve !== void 0 ? ve : "$id",
        addUsedSchema: (ue = q.addUsedSchema) !== null && ue !== void 0 ? ue : !0,
        validateSchema: (tt = q.validateSchema) !== null && tt !== void 0 ? tt : !0,
        validateFormats: (Se = q.validateFormats) !== null && Se !== void 0 ? Se : !0,
        unicodeRegExp: (Vr = q.unicodeRegExp) !== null && Vr !== void 0 ? Vr : !0,
        int32range: (Fr = q.int32range) !== null && Fr !== void 0 ? Fr : !0,
        uriResolver: Vo
      };
    }
    class S {
      constructor(P = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...y(P) };
        const { es5: A, lines: I } = this.opts.code;
        this.scope = new c.ValueScope({ scope: {}, prefixes: $, es5: A, lines: I }), this.logger = F(P.logger);
        const _ = P.validateFormats;
        P.validateFormats = !1, this.RULES = (0, s.getRules)(), p.call(this, h, P, "NOT SUPPORTED"), p.call(this, g, P, "DEPRECATED", "warn"), this._metaOpts = U.call(this), P.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && M.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), b.call(this), P.validateFormats = _;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: P, meta: A, schemaId: I } = this.opts;
        let _ = v;
        I === "id" && (_ = { ...v }, _.id = _.$id, delete _.$id), A && P && this.addMetaSchema(_, _[I], !1);
      }
      defaultMeta() {
        const { meta: P, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof P == "object" ? P[A] || P : void 0;
      }
      validate(P, A) {
        let I;
        if (typeof P == "string") {
          if (I = this.getSchema(P), !I)
            throw new Error(`no schema with key or ref "${P}"`);
        } else
          I = this.compile(P);
        const _ = I(A);
        return "$async" in I || (this.errors = I.errors), _;
      }
      compile(P, A) {
        const I = this._addSchema(P, A);
        return I.validate || this._compileSchemaEnv(I);
      }
      compileAsync(P, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: I } = this.opts;
        return _.call(this, P, A);
        async function _(re, N) {
          await R.call(this, re.$schema);
          const T = this._addSchema(re, N);
          return T.validate || C.call(this, T);
        }
        async function R(re) {
          re && !this.getSchema(re) && await _.call(this, { $ref: re }, !0);
        }
        async function C(re) {
          try {
            return this._compileSchemaEnv(re);
          } catch (N) {
            if (!(N instanceof a.default))
              throw N;
            return x.call(this, N), await W.call(this, N.missingSchema), C.call(this, re);
          }
        }
        function x({ missingSchema: re, missingRef: N }) {
          if (this.refs[re])
            throw new Error(`AnySchema ${re} is loaded but ${N} cannot be resolved`);
        }
        async function W(re) {
          const N = await ne.call(this, re);
          this.refs[re] || await R.call(this, N.$schema), this.refs[re] || this.addSchema(N, re, A);
        }
        async function ne(re) {
          const N = this._loading[re];
          if (N)
            return N;
          try {
            return await (this._loading[re] = I(re));
          } finally {
            delete this._loading[re];
          }
        }
      }
      // Adds schema to the instance
      addSchema(P, A, I, _ = this.opts.validateSchema) {
        if (Array.isArray(P)) {
          for (const C of P)
            this.addSchema(C, void 0, I, _);
          return this;
        }
        let R;
        if (typeof P == "object") {
          const { schemaId: C } = this.opts;
          if (R = P[C], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${C} must be string`);
        }
        return A = (0, u.normalizeId)(A || R), this._checkUnique(A), this.schemas[A] = this._addSchema(P, I, A, _, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(P, A, I = this.opts.validateSchema) {
        return this.addSchema(P, A, !0, I), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(P, A) {
        if (typeof P == "boolean")
          return !0;
        let I;
        if (I = P.$schema, I !== void 0 && typeof I != "string")
          throw new Error("$schema must be a string");
        if (I = I || this.opts.defaultMeta || this.defaultMeta(), !I)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const _ = this.validate(I, P);
        if (!_ && A) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return _;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(P) {
        let A;
        for (; typeof (A = w.call(this, P)) == "string"; )
          P = A;
        if (A === void 0) {
          const { schemaId: I } = this.opts, _ = new o.SchemaEnv({ schema: {}, schemaId: I });
          if (A = o.resolveSchema.call(this, _, P), !A)
            return;
          this.refs[P] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(P) {
        if (P instanceof RegExp)
          return this._removeAllSchemas(this.schemas, P), this._removeAllSchemas(this.refs, P), this;
        switch (typeof P) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = w.call(this, P);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[P], delete this.refs[P], this;
          }
          case "object": {
            const A = P;
            this._cache.delete(A);
            let I = P[this.opts.schemaId];
            return I && (I = (0, u.normalizeId)(I), delete this.schemas[I], delete this.refs[I]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(P) {
        for (const A of P)
          this.addKeyword(A);
        return this;
      }
      addKeyword(P, A) {
        let I;
        if (typeof P == "string")
          I = P, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = I);
        else if (typeof P == "object" && A === void 0) {
          if (A = P, I = A.keyword, Array.isArray(I) && !I.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (j.call(this, I, A), !A)
          return (0, i.eachItem)(I, (R) => D.call(this, R)), this;
        K.call(this, A);
        const _ = {
          ...A,
          type: (0, l.getJSONTypes)(A.type),
          schemaType: (0, l.getJSONTypes)(A.schemaType)
        };
        return (0, i.eachItem)(I, _.type.length === 0 ? (R) => D.call(this, R, _) : (R) => _.type.forEach((C) => D.call(this, R, _, C))), this;
      }
      getKeyword(P) {
        const A = this.RULES.all[P];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(P) {
        const { RULES: A } = this;
        delete A.keywords[P], delete A.all[P];
        for (const I of A.rules) {
          const _ = I.rules.findIndex((R) => R.keyword === P);
          _ >= 0 && I.rules.splice(_, 1);
        }
        return this;
      }
      // Add format
      addFormat(P, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[P] = A, this;
      }
      errorsText(P = this.errors, { separator: A = ", ", dataVar: I = "data" } = {}) {
        return !P || P.length === 0 ? "No errors" : P.map((_) => `${I}${_.instancePath} ${_.message}`).reduce((_, R) => _ + A + R);
      }
      $dataMetaSchema(P, A) {
        const I = this.RULES.all;
        P = JSON.parse(JSON.stringify(P));
        for (const _ of A) {
          const R = _.split("/").slice(1);
          let C = P;
          for (const x of R)
            C = C[x];
          for (const x in I) {
            const W = I[x];
            if (typeof W != "object")
              continue;
            const { $data: ne } = W.definition, re = C[x];
            ne && re && (C[x] = H(re));
          }
        }
        return P;
      }
      _removeAllSchemas(P, A) {
        for (const I in P) {
          const _ = P[I];
          (!A || A.test(I)) && (typeof _ == "string" ? delete P[I] : _ && !_.meta && (this._cache.delete(_.schema), delete P[I]));
        }
      }
      _addSchema(P, A, I, _ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let C;
        const { schemaId: x } = this.opts;
        if (typeof P == "object")
          C = P[x];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof P != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let W = this._cache.get(P);
        if (W !== void 0)
          return W;
        I = (0, u.normalizeId)(C || I);
        const ne = u.getSchemaRefs.call(this, P, I);
        return W = new o.SchemaEnv({ schema: P, schemaId: x, meta: A, baseId: I, localRefs: ne }), this._cache.set(W.schema, W), R && !I.startsWith("#") && (I && this._checkUnique(I), this.refs[I] = W), _ && this.validateSchema(P, !0), W;
      }
      _checkUnique(P) {
        if (this.schemas[P] || this.refs[P])
          throw new Error(`schema with key or id "${P}" already exists`);
      }
      _compileSchemaEnv(P) {
        if (P.meta ? this._compileMetaSchema(P) : o.compileSchema.call(this, P), !P.validate)
          throw new Error("ajv implementation error");
        return P.validate;
      }
      _compileMetaSchema(P) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          o.compileSchema.call(this, P);
        } finally {
          this.opts = A;
        }
      }
    }
    S.ValidationError = n.default, S.MissingRefError = a.default, e.default = S;
    function p(q, P, A, I = "error") {
      for (const _ in q) {
        const R = _;
        R in P && this.logger[I](`${A}: option ${_}. ${q[R]}`);
      }
    }
    function w(q) {
      return q = (0, u.normalizeId)(q), this.schemas[q] || this.refs[q];
    }
    function b() {
      const q = this.opts.schemas;
      if (q)
        if (Array.isArray(q))
          this.addSchema(q);
        else
          for (const P in q)
            this.addSchema(q[P], P);
    }
    function O() {
      for (const q in this.opts.formats) {
        const P = this.opts.formats[q];
        P && this.addFormat(q, P);
      }
    }
    function M(q) {
      if (Array.isArray(q)) {
        this.addVocabulary(q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const P in q) {
        const A = q[P];
        A.keyword || (A.keyword = P), this.addKeyword(A);
      }
    }
    function U() {
      const q = { ...this.opts };
      for (const P of E)
        delete q[P];
      return q;
    }
    const k = { log() {
    }, warn() {
    }, error() {
    } };
    function F(q) {
      if (q === !1)
        return k;
      if (q === void 0)
        return console;
      if (q.log && q.warn && q.error)
        return q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const G = /^[a-z_$][a-z0-9_$:-]*$/i;
    function j(q, P) {
      const { RULES: A } = this;
      if ((0, i.eachItem)(q, (I) => {
        if (A.keywords[I])
          throw new Error(`Keyword ${I} is already defined`);
        if (!G.test(I))
          throw new Error(`Keyword ${I} has invalid name`);
      }), !!P && P.$data && !("code" in P || "validate" in P))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(q, P, A) {
      var I;
      const _ = P == null ? void 0 : P.post;
      if (A && _)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let C = _ ? R.post : R.rules.find(({ type: W }) => W === A);
      if (C || (C = { type: A, rules: [] }, R.rules.push(C)), R.keywords[q] = !0, !P)
        return;
      const x = {
        keyword: q,
        definition: {
          ...P,
          type: (0, l.getJSONTypes)(P.type),
          schemaType: (0, l.getJSONTypes)(P.schemaType)
        }
      };
      P.before ? X.call(this, C, x, P.before) : C.rules.push(x), R.all[q] = x, (I = P.implements) === null || I === void 0 || I.forEach((W) => this.addKeyword(W));
    }
    function X(q, P, A) {
      const I = q.rules.findIndex((_) => _.keyword === A);
      I >= 0 ? q.rules.splice(I, 0, P) : (q.rules.push(P), this.logger.warn(`rule ${A} is not defined`));
    }
    function K(q) {
      let { metaSchema: P } = q;
      P !== void 0 && (q.$data && this.opts.$data && (P = H(P)), q.validateSchema = this.compile(P, !0));
    }
    const z = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function H(q) {
      return { anyOf: [q, z] };
    }
  })(xr)), xr;
}
var Nt = {}, Ot = {}, Tt = {}, Js;
function Oc() {
  if (Js) return Tt;
  Js = 1, Object.defineProperty(Tt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Tt.default = e, Tt;
}
var Ge = {}, Ys;
function ns() {
  if (Ys) return Ge;
  Ys = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.callRef = Ge.getValidate = void 0;
  const e = /* @__PURE__ */ $t(), t = /* @__PURE__ */ Te(), r = /* @__PURE__ */ J(), n = /* @__PURE__ */ Oe(), a = /* @__PURE__ */ qr(), s = /* @__PURE__ */ te(), o = {
    keyword: "$ref",
    schemaType: "string",
    code(l) {
      const { gen: i, schema: v, it: d } = l, { baseId: m, schemaEnv: E, validateName: $, opts: h, self: g } = d, { root: f } = E;
      if ((v === "#" || v === "#/") && m === f.baseId)
        return S();
      const y = a.resolveRef.call(g, f, m, v);
      if (y === void 0)
        throw new e.default(d.opts.uriResolver, m, v);
      if (y instanceof a.SchemaEnv)
        return p(y);
      return w(y);
      function S() {
        if (E === f)
          return u(l, $, E, E.$async);
        const b = i.scopeValue("root", { ref: f });
        return u(l, (0, r._)`${b}.validate`, f, f.$async);
      }
      function p(b) {
        const O = c(l, b);
        u(l, O, b, b.$async);
      }
      function w(b) {
        const O = i.scopeValue("schema", h.code.source === !0 ? { ref: b, code: (0, r.stringify)(b) } : { ref: b }), M = i.name("valid"), U = l.subschema({
          schema: b,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: O,
          errSchemaPath: v
        }, M);
        l.mergeEvaluated(U), l.ok(M);
      }
    }
  };
  function c(l, i) {
    const { gen: v } = l;
    return i.validate ? v.scopeValue("validate", { ref: i.validate }) : (0, r._)`${v.scopeValue("wrapper", { ref: i })}.validate`;
  }
  Ge.getValidate = c;
  function u(l, i, v, d) {
    const { gen: m, it: E } = l, { allErrors: $, schemaEnv: h, opts: g } = E, f = g.passContext ? n.default.this : r.nil;
    d ? y() : S();
    function y() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const b = m.let("valid");
      m.try(() => {
        m.code((0, r._)`await ${(0, t.callValidateCode)(l, i, f)}`), w(i), $ || m.assign(b, !0);
      }, (O) => {
        m.if((0, r._)`!(${O} instanceof ${E.ValidationError})`, () => m.throw(O)), p(O), $ || m.assign(b, !1);
      }), l.ok(b);
    }
    function S() {
      l.result((0, t.callValidateCode)(l, i, f), () => w(i), () => p(i));
    }
    function p(b) {
      const O = (0, r._)`${b}.errors`;
      m.assign(n.default.vErrors, (0, r._)`${n.default.vErrors} === null ? ${O} : ${n.default.vErrors}.concat(${O})`), m.assign(n.default.errors, (0, r._)`${n.default.vErrors}.length`);
    }
    function w(b) {
      var O;
      if (!E.opts.unevaluated)
        return;
      const M = (O = v == null ? void 0 : v.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (E.props !== !0)
        if (M && !M.dynamicProps)
          M.props !== void 0 && (E.props = s.mergeEvaluated.props(m, M.props, E.props));
        else {
          const U = m.var("props", (0, r._)`${b}.evaluated.props`);
          E.props = s.mergeEvaluated.props(m, U, E.props, r.Name);
        }
      if (E.items !== !0)
        if (M && !M.dynamicItems)
          M.items !== void 0 && (E.items = s.mergeEvaluated.items(m, M.items, E.items));
        else {
          const U = m.var("items", (0, r._)`${b}.evaluated.items`);
          E.items = s.mergeEvaluated.items(m, U, E.items, r.Name);
        }
    }
  }
  return Ge.callRef = u, Ge.default = o, Ge;
}
var Zs;
function ho() {
  if (Zs) return Ot;
  Zs = 1, Object.defineProperty(Ot, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Oc(), t = /* @__PURE__ */ ns(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Ot.default = r, Ot;
}
var At = {}, jt = {}, Qs;
function Tc() {
  if (Qs) return jt;
  Qs = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = e.operators, r = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: s, schemaCode: o }) => (0, e.str)`must be ${r[s].okStr} ${o}`,
    params: ({ keyword: s, schemaCode: o }) => (0, e._)`{comparison: ${r[s].okStr}, limit: ${o}}`
  }, a = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(s) {
      const { keyword: o, data: c, schemaCode: u } = s;
      s.fail$data((0, e._)`${c} ${r[o].fail} ${u} || isNaN(${c})`);
    }
  };
  return jt.default = a, jt;
}
var qt = {}, ea;
function Ac() {
  if (ea) return qt;
  ea = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: a, data: s, schemaCode: o, it: c } = n, u = c.opts.multipleOfPrecision, l = a.let("res"), i = u ? (0, e._)`Math.abs(Math.round(${l}) - ${l}) > 1e-${u}` : (0, e._)`${l} !== parseInt(${l})`;
      n.fail$data((0, e._)`(${o} === 0 || (${l} = ${s}/${o}, ${i}))`);
    }
  };
  return qt.default = r, qt;
}
var Ct = {}, kt = {}, ta;
function jc() {
  if (ta) return kt;
  ta = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  function e(t) {
    const r = t.length;
    let n = 0, a = 0, s;
    for (; a < r; )
      n++, s = t.charCodeAt(a++), s >= 55296 && s <= 56319 && a < r && (s = t.charCodeAt(a), (s & 64512) === 56320 && a++);
    return n;
  }
  return kt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', kt;
}
var ra;
function qc() {
  if (ra) return Ct;
  ra = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ jc(), a = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: o }) {
        const c = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${c} than ${o} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: o, data: c, schemaCode: u, it: l } = s, i = o === "maxLength" ? e.operators.GT : e.operators.LT, v = l.opts.unicode === !1 ? (0, e._)`${c}.length` : (0, e._)`${(0, t.useFunc)(s.gen, r.default)}(${c})`;
      s.fail$data((0, e._)`${v} ${i} ${u}`);
    }
  };
  return Ct.default = a, Ct;
}
var Dt = {}, na;
function Cc() {
  if (na) return Dt;
  na = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Te(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ J(), a = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: s }) => (0, r.str)`must match pattern "${s}"`,
      params: ({ schemaCode: s }) => (0, r._)`{pattern: ${s}}`
    },
    code(s) {
      const { gen: o, data: c, $data: u, schema: l, schemaCode: i, it: v } = s, d = v.opts.unicodeRegExp ? "u" : "";
      if (u) {
        const { regExp: m } = v.opts.code, E = m.code === "new RegExp" ? (0, r._)`new RegExp` : (0, t.useFunc)(o, m), $ = o.let("valid");
        o.try(() => o.assign($, (0, r._)`${E}(${i}, ${d}).test(${c})`), () => o.assign($, !1)), s.fail$data((0, r._)`!${$}`);
      } else {
        const m = (0, e.usePattern)(s, l);
        s.fail$data((0, r._)`!${m}.test(${c})`);
      }
    }
  };
  return Dt.default = a, Dt;
}
var Lt = {}, sa;
function kc() {
  if (sa) return Lt;
  sa = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: a }) {
        const s = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: a, data: s, schemaCode: o } = n, c = a === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${s}).length ${c} ${o}`);
    }
  };
  return Lt.default = r, Lt;
}
var Mt = {}, aa;
function Dc() {
  if (aa) return Mt;
  aa = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Te(), t = /* @__PURE__ */ J(), r = /* @__PURE__ */ te(), a = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: o, schema: c, schemaCode: u, data: l, $data: i, it: v } = s, { opts: d } = v;
      if (!i && c.length === 0)
        return;
      const m = c.length >= d.loopRequired;
      if (v.allErrors ? E() : $(), d.strictRequired) {
        const f = s.parentSchema.properties, { definedProperties: y } = s.it;
        for (const S of c)
          if ((f == null ? void 0 : f[S]) === void 0 && !y.has(S)) {
            const p = v.schemaEnv.baseId + v.errSchemaPath, w = `required property "${S}" is not defined at "${p}" (strictRequired)`;
            (0, r.checkStrictMode)(v, w, v.opts.strictRequired);
          }
      }
      function E() {
        if (m || i)
          s.block$data(t.nil, h);
        else
          for (const f of c)
            (0, e.checkReportMissingProp)(s, f);
      }
      function $() {
        const f = o.let("missing");
        if (m || i) {
          const y = o.let("valid", !0);
          s.block$data(y, () => g(f, y)), s.ok(y);
        } else
          o.if((0, e.checkMissingProp)(s, c, f)), (0, e.reportMissingProp)(s, f), o.else();
      }
      function h() {
        o.forOf("prop", u, (f) => {
          s.setParams({ missingProperty: f }), o.if((0, e.noPropertyInData)(o, l, f, d.ownProperties), () => s.error());
        });
      }
      function g(f, y) {
        s.setParams({ missingProperty: f }), o.forOf(f, u, () => {
          o.assign(y, (0, e.propertyInData)(o, l, f, d.ownProperties)), o.if((0, t.not)(y), () => {
            s.error(), o.break();
          });
        }, t.nil);
      }
    }
  };
  return Mt.default = a, Mt;
}
var Vt = {}, ia;
function Lc() {
  if (ia) return Vt;
  ia = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: a }) {
        const s = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${a} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: a, data: s, schemaCode: o } = n, c = a === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${s}.length ${c} ${o}`);
    }
  };
  return Vt.default = r, Vt;
}
var Ft = {}, zt = {}, oa;
function ss() {
  if (oa) return zt;
  oa = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = uo();
  return e.code = 'require("ajv/dist/runtime/equal").default', zt.default = e, zt;
}
var ca;
function Mc() {
  if (ca) return Ft;
  ca = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Nr(), t = /* @__PURE__ */ J(), r = /* @__PURE__ */ te(), n = /* @__PURE__ */ ss(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: o, j: c } }) => (0, t.str)`must NOT have duplicate items (items ## ${c} and ${o} are identical)`,
      params: ({ params: { i: o, j: c } }) => (0, t._)`{i: ${o}, j: ${c}}`
    },
    code(o) {
      const { gen: c, data: u, $data: l, schema: i, parentSchema: v, schemaCode: d, it: m } = o;
      if (!l && !i)
        return;
      const E = c.let("valid"), $ = v.items ? (0, e.getSchemaTypes)(v.items) : [];
      o.block$data(E, h, (0, t._)`${d} === false`), o.ok(E);
      function h() {
        const S = c.let("i", (0, t._)`${u}.length`), p = c.let("j");
        o.setParams({ i: S, j: p }), c.assign(E, !0), c.if((0, t._)`${S} > 1`, () => (g() ? f : y)(S, p));
      }
      function g() {
        return $.length > 0 && !$.some((S) => S === "object" || S === "array");
      }
      function f(S, p) {
        const w = c.name("item"), b = (0, e.checkDataTypes)($, w, m.opts.strictNumbers, e.DataType.Wrong), O = c.const("indices", (0, t._)`{}`);
        c.for((0, t._)`;${S}--;`, () => {
          c.let(w, (0, t._)`${u}[${S}]`), c.if(b, (0, t._)`continue`), $.length > 1 && c.if((0, t._)`typeof ${w} == "string"`, (0, t._)`${w} += "_"`), c.if((0, t._)`typeof ${O}[${w}] == "number"`, () => {
            c.assign(p, (0, t._)`${O}[${w}]`), o.error(), c.assign(E, !1).break();
          }).code((0, t._)`${O}[${w}] = ${S}`);
        });
      }
      function y(S, p) {
        const w = (0, r.useFunc)(c, n.default), b = c.name("outer");
        c.label(b).for((0, t._)`;${S}--;`, () => c.for((0, t._)`${p} = ${S}; ${p}--;`, () => c.if((0, t._)`${w}(${u}[${S}], ${u}[${p}])`, () => {
          o.error(), c.assign(E, !1).break(b);
        })));
      }
    }
  };
  return Ft.default = s, Ft;
}
var Ut = {}, ua;
function Vc() {
  if (ua) return Ut;
  ua = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ ss(), a = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: o, data: c, $data: u, schemaCode: l, schema: i } = s;
      u || i && typeof i == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(o, r.default)}(${c}, ${l})`) : s.fail((0, e._)`${i} !== ${c}`);
    }
  };
  return Ut.default = a, Ut;
}
var Gt = {}, la;
function Fc() {
  if (la) return Gt;
  la = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ ss(), a = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: o, data: c, $data: u, schema: l, schemaCode: i, it: v } = s;
      if (!u && l.length === 0)
        throw new Error("enum must have non-empty array");
      const d = l.length >= v.opts.loopEnum;
      let m;
      const E = () => m ?? (m = (0, t.useFunc)(o, r.default));
      let $;
      if (d || u)
        $ = o.let("valid"), s.block$data($, h);
      else {
        if (!Array.isArray(l))
          throw new Error("ajv implementation error");
        const f = o.const("vSchema", i);
        $ = (0, e.or)(...l.map((y, S) => g(f, S)));
      }
      s.pass($);
      function h() {
        o.assign($, !1), o.forOf("v", i, (f) => o.if((0, e._)`${E()}(${c}, ${f})`, () => o.assign($, !0).break()));
      }
      function g(f, y) {
        const S = l[y];
        return typeof S == "object" && S !== null ? (0, e._)`${E()}(${c}, ${f}[${y}])` : (0, e._)`${c} === ${S}`;
      }
    }
  };
  return Gt.default = a, Gt;
}
var fa;
function mo() {
  if (fa) return At;
  fa = 1, Object.defineProperty(At, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Tc(), t = /* @__PURE__ */ Ac(), r = /* @__PURE__ */ qc(), n = /* @__PURE__ */ Cc(), a = /* @__PURE__ */ kc(), s = /* @__PURE__ */ Dc(), o = /* @__PURE__ */ Lc(), c = /* @__PURE__ */ Mc(), u = /* @__PURE__ */ Vc(), l = /* @__PURE__ */ Fc(), i = [
    // number
    e.default,
    t.default,
    // string
    r.default,
    n.default,
    // object
    a.default,
    s.default,
    // array
    o.default,
    c.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    l.default
  ];
  return At.default = i, At;
}
var Kt = {}, rt = {}, da;
function po() {
  if (da) return rt;
  da = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.validateAdditionalItems = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: o, it: c } = s, { items: u } = o;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(c, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      a(s, u);
    }
  };
  function a(s, o) {
    const { gen: c, schema: u, data: l, keyword: i, it: v } = s;
    v.items = !0;
    const d = c.const("len", (0, e._)`${l}.length`);
    if (u === !1)
      s.setParams({ len: o.length }), s.pass((0, e._)`${d} <= ${o.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(v, u)) {
      const E = c.var("valid", (0, e._)`${d} <= ${o.length}`);
      c.if((0, e.not)(E), () => m(E)), s.ok(E);
    }
    function m(E) {
      c.forRange("i", o.length, d, ($) => {
        s.subschema({ keyword: i, dataProp: $, dataPropType: t.Type.Num }, E), v.allErrors || c.if((0, e.not)(E), () => c.break());
      });
    }
  }
  return rt.validateAdditionalItems = a, rt.default = n, rt;
}
var Ht = {}, nt = {}, ha;
function yo() {
  if (ha) return nt;
  ha = 1, Object.defineProperty(nt, "__esModule", { value: !0 }), nt.validateTuple = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ Te(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: o, it: c } = s;
      if (Array.isArray(o))
        return a(s, "additionalItems", o);
      c.items = !0, !(0, t.alwaysValidSchema)(c, o) && s.ok((0, r.validateArray)(s));
    }
  };
  function a(s, o, c = s.schema) {
    const { gen: u, parentSchema: l, data: i, keyword: v, it: d } = s;
    $(l), d.opts.unevaluated && c.length && d.items !== !0 && (d.items = t.mergeEvaluated.items(u, c.length, d.items));
    const m = u.name("valid"), E = u.const("len", (0, e._)`${i}.length`);
    c.forEach((h, g) => {
      (0, t.alwaysValidSchema)(d, h) || (u.if((0, e._)`${E} > ${g}`, () => s.subschema({
        keyword: v,
        schemaProp: g,
        dataProp: g
      }, m)), s.ok(m));
    });
    function $(h) {
      const { opts: g, errSchemaPath: f } = d, y = c.length, S = y === h.minItems && (y === h.maxItems || h[o] === !1);
      if (g.strictTuples && !S) {
        const p = `"${v}" is ${y}-tuple, but minItems or maxItems/${o} are not specified or different at path "${f}"`;
        (0, t.checkStrictMode)(d, p, g.strictTuples);
      }
    }
  }
  return nt.validateTuple = a, nt.default = n, nt;
}
var ma;
function zc() {
  if (ma) return Ht;
  ma = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ yo(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, e.validateTuple)(r, "items")
  };
  return Ht.default = t, Ht;
}
var Xt = {}, pa;
function Uc() {
  if (pa) return Xt;
  pa = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ Te(), n = /* @__PURE__ */ po(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { schema: c, parentSchema: u, it: l } = o, { prefixItems: i } = u;
      l.items = !0, !(0, t.alwaysValidSchema)(l, c) && (i ? (0, n.validateAdditionalItems)(o, i) : o.ok((0, r.validateArray)(o)));
    }
  };
  return Xt.default = s, Xt;
}
var xt = {}, ya;
function Gc() {
  if (ya) return xt;
  ya = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${a} valid item(s)` : (0, e.str)`must contain at least ${a} and no more than ${s} valid item(s)`,
      params: ({ params: { min: a, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${a}}` : (0, e._)`{minContains: ${a}, maxContains: ${s}}`
    },
    code(a) {
      const { gen: s, schema: o, parentSchema: c, data: u, it: l } = a;
      let i, v;
      const { minContains: d, maxContains: m } = c;
      l.opts.next ? (i = d === void 0 ? 1 : d, v = m) : i = 1;
      const E = s.const("len", (0, e._)`${u}.length`);
      if (a.setParams({ min: i, max: v }), v === void 0 && i === 0) {
        (0, t.checkStrictMode)(l, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (v !== void 0 && i > v) {
        (0, t.checkStrictMode)(l, '"minContains" > "maxContains" is always invalid'), a.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(l, o)) {
        let y = (0, e._)`${E} >= ${i}`;
        v !== void 0 && (y = (0, e._)`${y} && ${E} <= ${v}`), a.pass(y);
        return;
      }
      l.items = !0;
      const $ = s.name("valid");
      v === void 0 && i === 1 ? g($, () => s.if($, () => s.break())) : i === 0 ? (s.let($, !0), v !== void 0 && s.if((0, e._)`${u}.length > 0`, h)) : (s.let($, !1), h()), a.result($, () => a.reset());
      function h() {
        const y = s.name("_valid"), S = s.let("count", 0);
        g(y, () => s.if(y, () => f(S)));
      }
      function g(y, S) {
        s.forRange("i", 0, E, (p) => {
          a.subschema({
            keyword: "contains",
            dataProp: p,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, y), S();
        });
      }
      function f(y) {
        s.code((0, e._)`${y}++`), v === void 0 ? s.if((0, e._)`${y} >= ${i}`, () => s.assign($, !0).break()) : (s.if((0, e._)`${y} > ${v}`, () => s.assign($, !1).break()), i === 1 ? s.assign($, !0) : s.if((0, e._)`${y} >= ${i}`, () => s.assign($, !0)));
      }
    }
  };
  return xt.default = n, xt;
}
var rn = {}, ga;
function as() {
  return ga || (ga = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = /* @__PURE__ */ J(), r = /* @__PURE__ */ te(), n = /* @__PURE__ */ Te();
    e.error = {
      message: ({ params: { property: u, depsCount: l, deps: i } }) => {
        const v = l === 1 ? "property" : "properties";
        return (0, t.str)`must have ${v} ${i} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: l, deps: i, missingProperty: v } }) => (0, t._)`{property: ${u},
    missingProperty: ${v},
    depsCount: ${l},
    deps: ${i}}`
      // TODO change to reference
    };
    const a = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [l, i] = s(u);
        o(u, l), c(u, i);
      }
    };
    function s({ schema: u }) {
      const l = {}, i = {};
      for (const v in u) {
        if (v === "__proto__")
          continue;
        const d = Array.isArray(u[v]) ? l : i;
        d[v] = u[v];
      }
      return [l, i];
    }
    function o(u, l = u.schema) {
      const { gen: i, data: v, it: d } = u;
      if (Object.keys(l).length === 0)
        return;
      const m = i.let("missing");
      for (const E in l) {
        const $ = l[E];
        if ($.length === 0)
          continue;
        const h = (0, n.propertyInData)(i, v, E, d.opts.ownProperties);
        u.setParams({
          property: E,
          depsCount: $.length,
          deps: $.join(", ")
        }), d.allErrors ? i.if(h, () => {
          for (const g of $)
            (0, n.checkReportMissingProp)(u, g);
        }) : (i.if((0, t._)`${h} && (${(0, n.checkMissingProp)(u, $, m)})`), (0, n.reportMissingProp)(u, m), i.else());
      }
    }
    e.validatePropertyDeps = o;
    function c(u, l = u.schema) {
      const { gen: i, data: v, keyword: d, it: m } = u, E = i.name("valid");
      for (const $ in l)
        (0, r.alwaysValidSchema)(m, l[$]) || (i.if(
          (0, n.propertyInData)(i, v, $, m.opts.ownProperties),
          () => {
            const h = u.subschema({ keyword: d, schemaProp: $ }, E);
            u.mergeValidEvaluated(h, E);
          },
          () => i.var(E, !0)
          // TODO var
        ), u.ok(E));
    }
    e.validateSchemaDeps = c, e.default = a;
  })(rn)), rn;
}
var Bt = {}, va;
function Kc() {
  if (va) return Bt;
  va = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: a }) => (0, e._)`{propertyName: ${a.propertyName}}`
    },
    code(a) {
      const { gen: s, schema: o, data: c, it: u } = a;
      if ((0, t.alwaysValidSchema)(u, o))
        return;
      const l = s.name("valid");
      s.forIn("key", c, (i) => {
        a.setParams({ propertyName: i }), a.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, l), s.if((0, e.not)(l), () => {
          a.error(!0), u.allErrors || s.break();
        });
      }), a.ok(l);
    }
  };
  return Bt.default = n, Bt;
}
var Wt = {}, $a;
function go() {
  if ($a) return Wt;
  $a = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Te(), t = /* @__PURE__ */ J(), r = /* @__PURE__ */ Oe(), n = /* @__PURE__ */ te(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: o }) => (0, t._)`{additionalProperty: ${o.additionalProperty}}`
    },
    code(o) {
      const { gen: c, schema: u, parentSchema: l, data: i, errsCount: v, it: d } = o;
      if (!v)
        throw new Error("ajv implementation error");
      const { allErrors: m, opts: E } = d;
      if (d.props = !0, E.removeAdditional !== "all" && (0, n.alwaysValidSchema)(d, u))
        return;
      const $ = (0, e.allSchemaProperties)(l.properties), h = (0, e.allSchemaProperties)(l.patternProperties);
      g(), o.ok((0, t._)`${v} === ${r.default.errors}`);
      function g() {
        c.forIn("key", i, (w) => {
          !$.length && !h.length ? S(w) : c.if(f(w), () => S(w));
        });
      }
      function f(w) {
        let b;
        if ($.length > 8) {
          const O = (0, n.schemaRefOrVal)(d, l.properties, "properties");
          b = (0, e.isOwnProperty)(c, O, w);
        } else $.length ? b = (0, t.or)(...$.map((O) => (0, t._)`${w} === ${O}`)) : b = t.nil;
        return h.length && (b = (0, t.or)(b, ...h.map((O) => (0, t._)`${(0, e.usePattern)(o, O)}.test(${w})`))), (0, t.not)(b);
      }
      function y(w) {
        c.code((0, t._)`delete ${i}[${w}]`);
      }
      function S(w) {
        if (E.removeAdditional === "all" || E.removeAdditional && u === !1) {
          y(w);
          return;
        }
        if (u === !1) {
          o.setParams({ additionalProperty: w }), o.error(), m || c.break();
          return;
        }
        if (typeof u == "object" && !(0, n.alwaysValidSchema)(d, u)) {
          const b = c.name("valid");
          E.removeAdditional === "failing" ? (p(w, b, !1), c.if((0, t.not)(b), () => {
            o.reset(), y(w);
          })) : (p(w, b), m || c.if((0, t.not)(b), () => c.break()));
        }
      }
      function p(w, b, O) {
        const M = {
          keyword: "additionalProperties",
          dataProp: w,
          dataPropType: n.Type.Str
        };
        O === !1 && Object.assign(M, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), o.subschema(M, b);
      }
    }
  };
  return Wt.default = s, Wt;
}
var Jt = {}, _a;
function Hc() {
  if (_a) return Jt;
  _a = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ vt(), t = /* @__PURE__ */ Te(), r = /* @__PURE__ */ te(), n = /* @__PURE__ */ go(), a = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: c, parentSchema: u, data: l, it: i } = s;
      i.opts.removeAdditional === "all" && u.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(i, n.default, "additionalProperties"));
      const v = (0, t.allSchemaProperties)(c);
      for (const h of v)
        i.definedProperties.add(h);
      i.opts.unevaluated && v.length && i.props !== !0 && (i.props = r.mergeEvaluated.props(o, (0, r.toHash)(v), i.props));
      const d = v.filter((h) => !(0, r.alwaysValidSchema)(i, c[h]));
      if (d.length === 0)
        return;
      const m = o.name("valid");
      for (const h of d)
        E(h) ? $(h) : (o.if((0, t.propertyInData)(o, l, h, i.opts.ownProperties)), $(h), i.allErrors || o.else().var(m, !0), o.endIf()), s.it.definedProperties.add(h), s.ok(m);
      function E(h) {
        return i.opts.useDefaults && !i.compositeRule && c[h].default !== void 0;
      }
      function $(h) {
        s.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, m);
      }
    }
  };
  return Jt.default = a, Jt;
}
var Yt = {}, Ea;
function Xc() {
  if (Ea) return Yt;
  Ea = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ Te(), t = /* @__PURE__ */ J(), r = /* @__PURE__ */ te(), n = /* @__PURE__ */ te(), a = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: c, data: u, parentSchema: l, it: i } = s, { opts: v } = i, d = (0, e.allSchemaProperties)(c), m = d.filter((S) => (0, r.alwaysValidSchema)(i, c[S]));
      if (d.length === 0 || m.length === d.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const E = v.strictSchema && !v.allowMatchingProperties && l.properties, $ = o.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, n.evaluatedPropsToName)(o, i.props));
      const { props: h } = i;
      g();
      function g() {
        for (const S of d)
          E && f(S), i.allErrors ? y(S) : (o.var($, !0), y(S), o.if($));
      }
      function f(S) {
        for (const p in E)
          new RegExp(S).test(p) && (0, r.checkStrictMode)(i, `property ${p} matches pattern ${S} (use allowMatchingProperties)`);
      }
      function y(S) {
        o.forIn("key", u, (p) => {
          o.if((0, t._)`${(0, e.usePattern)(s, S)}.test(${p})`, () => {
            const w = m.includes(S);
            w || s.subschema({
              keyword: "patternProperties",
              schemaProp: S,
              dataProp: p,
              dataPropType: n.Type.Str
            }, $), i.opts.unevaluated && h !== !0 ? o.assign((0, t._)`${h}[${p}]`, !0) : !w && !i.allErrors && o.if((0, t.not)($), () => o.break());
          });
        });
      }
    }
  };
  return Yt.default = a, Yt;
}
var Zt = {}, wa;
function xc() {
  if (wa) return Zt;
  wa = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ te(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: n, schema: a, it: s } = r;
      if ((0, e.alwaysValidSchema)(s, a)) {
        r.fail();
        return;
      }
      const o = n.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o), r.failResult(o, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Zt.default = t, Zt;
}
var Qt = {}, Sa;
function Bc() {
  if (Sa) return Qt;
  Sa = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: (/* @__PURE__ */ Te()).validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Qt.default = t, Qt;
}
var er = {}, ba;
function Wc() {
  if (ba) return er;
  ba = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: a }) => (0, e._)`{passingSchemas: ${a.passing}}`
    },
    code(a) {
      const { gen: s, schema: o, parentSchema: c, it: u } = a;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && c.discriminator)
        return;
      const l = o, i = s.let("valid", !1), v = s.let("passing", null), d = s.name("_valid");
      a.setParams({ passing: v }), s.block(m), a.result(i, () => a.reset(), () => a.error(!0));
      function m() {
        l.forEach((E, $) => {
          let h;
          (0, t.alwaysValidSchema)(u, E) ? s.var(d, !0) : h = a.subschema({
            keyword: "oneOf",
            schemaProp: $,
            compositeRule: !0
          }, d), $ > 0 && s.if((0, e._)`${d} && ${i}`).assign(i, !1).assign(v, (0, e._)`[${v}, ${$}]`).else(), s.if(d, () => {
            s.assign(i, !0), s.assign(v, $), h && a.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return er.default = n, er;
}
var tr = {}, Ra;
function Jc() {
  if (Ra) return tr;
  Ra = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ te(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: n, schema: a, it: s } = r;
      if (!Array.isArray(a))
        throw new Error("ajv implementation error");
      const o = n.name("valid");
      a.forEach((c, u) => {
        if ((0, e.alwaysValidSchema)(s, c))
          return;
        const l = r.subschema({ keyword: "allOf", schemaProp: u }, o);
        r.ok(o), r.mergeEvaluated(l);
      });
    }
  };
  return tr.default = t, tr;
}
var rr = {}, Pa;
function Yc() {
  if (Pa) return rr;
  Pa = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: o, parentSchema: c, it: u } = s;
      c.then === void 0 && c.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const l = a(u, "then"), i = a(u, "else");
      if (!l && !i)
        return;
      const v = o.let("valid", !0), d = o.name("_valid");
      if (m(), s.reset(), l && i) {
        const $ = o.let("ifClause");
        s.setParams({ ifClause: $ }), o.if(d, E("then", $), E("else", $));
      } else l ? o.if(d, E("then")) : o.if((0, e.not)(d), E("else"));
      s.pass(v, () => s.error(!0));
      function m() {
        const $ = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        s.mergeEvaluated($);
      }
      function E($, h) {
        return () => {
          const g = s.subschema({ keyword: $ }, d);
          o.assign(v, d), s.mergeValidEvaluated(g, v), h ? o.assign(h, (0, e._)`${$}`) : s.setParams({ ifClause: $ });
        };
      }
    }
  };
  function a(s, o) {
    const c = s.schema[o];
    return c !== void 0 && !(0, t.alwaysValidSchema)(s, c);
  }
  return rr.default = n, rr;
}
var nr = {}, Ia;
function Zc() {
  if (Ia) return nr;
  Ia = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ te(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: a }) {
      n.if === void 0 && (0, e.checkStrictMode)(a, `"${r}" without "if" is ignored`);
    }
  };
  return nr.default = t, nr;
}
var Na;
function vo() {
  if (Na) return Kt;
  Na = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ po(), t = /* @__PURE__ */ zc(), r = /* @__PURE__ */ yo(), n = /* @__PURE__ */ Uc(), a = /* @__PURE__ */ Gc(), s = /* @__PURE__ */ as(), o = /* @__PURE__ */ Kc(), c = /* @__PURE__ */ go(), u = /* @__PURE__ */ Hc(), l = /* @__PURE__ */ Xc(), i = /* @__PURE__ */ xc(), v = /* @__PURE__ */ Bc(), d = /* @__PURE__ */ Wc(), m = /* @__PURE__ */ Jc(), E = /* @__PURE__ */ Yc(), $ = /* @__PURE__ */ Zc();
  function h(g = !1) {
    const f = [
      // any
      i.default,
      v.default,
      d.default,
      m.default,
      E.default,
      $.default,
      // object
      o.default,
      c.default,
      s.default,
      u.default,
      l.default
    ];
    return g ? f.push(t.default, n.default) : f.push(e.default, r.default), f.push(a.default), f;
  }
  return Kt.default = h, Kt;
}
var sr = {}, st = {}, Oa;
function $o() {
  if (Oa) return st;
  Oa = 1, Object.defineProperty(st, "__esModule", { value: !0 }), st.dynamicAnchor = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ Oe(), r = /* @__PURE__ */ qr(), n = /* @__PURE__ */ ns(), a = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (c) => s(c, c.schema)
  };
  function s(c, u) {
    const { gen: l, it: i } = c;
    i.schemaEnv.root.dynamicAnchors[u] = !0;
    const v = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, d = i.errSchemaPath === "#" ? i.validateName : o(c);
    l.if((0, e._)`!${v}`, () => l.assign(v, d));
  }
  st.dynamicAnchor = s;
  function o(c) {
    const { schemaEnv: u, schema: l, self: i } = c.it, { root: v, baseId: d, localRefs: m, meta: E } = u.root, { schemaId: $ } = i.opts, h = new r.SchemaEnv({ schema: l, schemaId: $, root: v, baseId: d, localRefs: m, meta: E });
    return r.compileSchema.call(i, h), (0, n.getValidate)(c, h);
  }
  return st.default = a, st;
}
var at = {}, Ta;
function _o() {
  if (Ta) return at;
  Ta = 1, Object.defineProperty(at, "__esModule", { value: !0 }), at.dynamicRef = void 0;
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ Oe(), r = /* @__PURE__ */ ns(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (s) => a(s, s.schema)
  };
  function a(s, o) {
    const { gen: c, keyword: u, it: l } = s;
    if (o[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const i = o.slice(1);
    if (l.allErrors)
      v();
    else {
      const m = c.let("valid", !1);
      v(m), s.ok(m);
    }
    function v(m) {
      if (l.schemaEnv.root.dynamicAnchors[i]) {
        const E = c.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(i)}`);
        c.if(E, d(E, m), d(l.validateName, m));
      } else
        d(l.validateName, m)();
    }
    function d(m, E) {
      return E ? () => c.block(() => {
        (0, r.callRef)(s, m), c.let(E, !0);
      }) : () => (0, r.callRef)(s, m);
    }
  }
  return at.dynamicRef = a, at.default = n, at;
}
var ar = {}, Aa;
function Qc() {
  if (Aa) return ar;
  Aa = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ $o(), t = /* @__PURE__ */ te(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return ar.default = r, ar;
}
var ir = {}, ja;
function eu() {
  if (ja) return ir;
  ja = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ _o(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, e.dynamicRef)(r, r.schema)
  };
  return ir.default = t, ir;
}
var qa;
function tu() {
  if (qa) return sr;
  qa = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ $o(), t = /* @__PURE__ */ _o(), r = /* @__PURE__ */ Qc(), n = /* @__PURE__ */ eu(), a = [e.default, t.default, r.default, n.default];
  return sr.default = a, sr;
}
var or = {}, cr = {}, Ca;
function ru() {
  if (Ca) return cr;
  Ca = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ as(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (r) => (0, e.validatePropertyDeps)(r)
  };
  return cr.default = t, cr;
}
var ur = {}, ka;
function nu() {
  if (ka) return ur;
  ka = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ as(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, e.validateSchemaDeps)(r)
  };
  return ur.default = t, ur;
}
var lr = {}, Da;
function su() {
  if (Da) return lr;
  Da = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ te(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: a }) {
      n.contains === void 0 && (0, e.checkStrictMode)(a, `"${r}" without "contains" is ignored`);
    }
  };
  return lr.default = t, lr;
}
var La;
function au() {
  if (La) return or;
  La = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ru(), t = /* @__PURE__ */ nu(), r = /* @__PURE__ */ su(), n = [e.default, t.default, r.default];
  return or.default = n, or;
}
var fr = {}, dr = {}, Ma;
function iu() {
  if (Ma) return dr;
  Ma = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), r = /* @__PURE__ */ Oe(), a = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: s }) => (0, e._)`{unevaluatedProperty: ${s.unevaluatedProperty}}`
    },
    code(s) {
      const { gen: o, schema: c, data: u, errsCount: l, it: i } = s;
      if (!l)
        throw new Error("ajv implementation error");
      const { allErrors: v, props: d } = i;
      d instanceof e.Name ? o.if((0, e._)`${d} !== true`, () => o.forIn("key", u, (h) => o.if(E(d, h), () => m(h)))) : d !== !0 && o.forIn("key", u, (h) => d === void 0 ? m(h) : o.if($(d, h), () => m(h))), i.props = !0, s.ok((0, e._)`${l} === ${r.default.errors}`);
      function m(h) {
        if (c === !1) {
          s.setParams({ unevaluatedProperty: h }), s.error(), v || o.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(i, c)) {
          const g = o.name("valid");
          s.subschema({
            keyword: "unevaluatedProperties",
            dataProp: h,
            dataPropType: t.Type.Str
          }, g), v || o.if((0, e.not)(g), () => o.break());
        }
      }
      function E(h, g) {
        return (0, e._)`!${h} || !${h}[${g}]`;
      }
      function $(h, g) {
        const f = [];
        for (const y in h)
          h[y] === !0 && f.push((0, e._)`${g} !== ${y}`);
        return (0, e.and)(...f);
      }
    }
  };
  return dr.default = a, dr;
}
var hr = {}, Va;
function ou() {
  if (Va) return hr;
  Va = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ te(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: a } }) => (0, e.str)`must NOT have more than ${a} items`,
      params: ({ params: { len: a } }) => (0, e._)`{limit: ${a}}`
    },
    code(a) {
      const { gen: s, schema: o, data: c, it: u } = a, l = u.items || 0;
      if (l === !0)
        return;
      const i = s.const("len", (0, e._)`${c}.length`);
      if (o === !1)
        a.setParams({ len: l }), a.fail((0, e._)`${i} > ${l}`);
      else if (typeof o == "object" && !(0, t.alwaysValidSchema)(u, o)) {
        const d = s.var("valid", (0, e._)`${i} <= ${l}`);
        s.if((0, e.not)(d), () => v(d, l)), a.ok(d);
      }
      u.items = !0;
      function v(d, m) {
        s.forRange("i", m, i, (E) => {
          a.subschema({ keyword: "unevaluatedItems", dataProp: E, dataPropType: t.Type.Num }, d), u.allErrors || s.if((0, e.not)(d), () => s.break());
        });
      }
    }
  };
  return hr.default = n, hr;
}
var Fa;
function cu() {
  if (Fa) return fr;
  Fa = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ iu(), t = /* @__PURE__ */ ou(), r = [e.default, t.default];
  return fr.default = r, fr;
}
var mr = {}, pr = {}, za;
function uu() {
  if (za) return pr;
  za = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, a) {
      const { gen: s, data: o, $data: c, schema: u, schemaCode: l, it: i } = n, { opts: v, errSchemaPath: d, schemaEnv: m, self: E } = i;
      if (!v.validateFormats)
        return;
      c ? $() : h();
      function $() {
        const g = s.scopeValue("formats", {
          ref: E.formats,
          code: v.code.formats
        }), f = s.const("fDef", (0, e._)`${g}[${l}]`), y = s.let("fType"), S = s.let("format");
        s.if((0, e._)`typeof ${f} == "object" && !(${f} instanceof RegExp)`, () => s.assign(y, (0, e._)`${f}.type || "string"`).assign(S, (0, e._)`${f}.validate`), () => s.assign(y, (0, e._)`"string"`).assign(S, f)), n.fail$data((0, e.or)(p(), w()));
        function p() {
          return v.strictSchema === !1 ? e.nil : (0, e._)`${l} && !${S}`;
        }
        function w() {
          const b = m.$async ? (0, e._)`(${f}.async ? await ${S}(${o}) : ${S}(${o}))` : (0, e._)`${S}(${o})`, O = (0, e._)`(typeof ${S} == "function" ? ${b} : ${S}.test(${o}))`;
          return (0, e._)`${S} && ${S} !== true && ${y} === ${a} && !${O}`;
        }
      }
      function h() {
        const g = E.formats[u];
        if (!g) {
          p();
          return;
        }
        if (g === !0)
          return;
        const [f, y, S] = w(g);
        f === a && n.pass(b());
        function p() {
          if (v.strictSchema === !1) {
            E.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${u}" ignored in schema at path "${d}"`;
          }
        }
        function w(O) {
          const M = O instanceof RegExp ? (0, e.regexpCode)(O) : v.code.formats ? (0, e._)`${v.code.formats}${(0, e.getProperty)(u)}` : void 0, U = s.scopeValue("formats", { key: u, ref: O, code: M });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${U}.validate`] : ["string", O, U];
        }
        function b() {
          if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
            if (!m.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${S}(${o})`;
          }
          return typeof y == "function" ? (0, e._)`${S}(${o})` : (0, e._)`${S}.test(${o})`;
        }
      }
    }
  };
  return pr.default = r, pr;
}
var Ua;
function Eo() {
  if (Ua) return mr;
  Ua = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const t = [(/* @__PURE__ */ uu()).default];
  return mr.default = t, mr;
}
var Je = {}, Ga;
function wo() {
  return Ga || (Ga = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.contentVocabulary = Je.metadataVocabulary = void 0, Je.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Je.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Je;
}
var Ka;
function lu() {
  if (Ka) return Nt;
  Ka = 1, Object.defineProperty(Nt, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ho(), t = /* @__PURE__ */ mo(), r = /* @__PURE__ */ vo(), n = /* @__PURE__ */ tu(), a = /* @__PURE__ */ au(), s = /* @__PURE__ */ cu(), o = /* @__PURE__ */ Eo(), c = /* @__PURE__ */ wo(), u = [
    n.default,
    e.default,
    t.default,
    (0, r.default)(!0),
    o.default,
    c.metadataVocabulary,
    c.contentVocabulary,
    a.default,
    s.default
  ];
  return Nt.default = u, Nt;
}
var yr = {}, gt = {}, Ha;
function fu() {
  if (Ha) return gt;
  Ha = 1, Object.defineProperty(gt, "__esModule", { value: !0 }), gt.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (gt.DiscrError = e = {})), gt;
}
var Xa;
function So() {
  if (Xa) return yr;
  Xa = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ J(), t = /* @__PURE__ */ fu(), r = /* @__PURE__ */ qr(), n = /* @__PURE__ */ $t(), a = /* @__PURE__ */ te(), o = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: c, tagName: u } }) => c === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: c, tag: u, tagName: l } }) => (0, e._)`{error: ${c}, tag: ${l}, tagValue: ${u}}`
    },
    code(c) {
      const { gen: u, data: l, schema: i, parentSchema: v, it: d } = c, { oneOf: m } = v;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const E = i.propertyName;
      if (typeof E != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!m)
        throw new Error("discriminator: requires oneOf keyword");
      const $ = u.let("valid", !1), h = u.const("tag", (0, e._)`${l}${(0, e.getProperty)(E)}`);
      u.if((0, e._)`typeof ${h} == "string"`, () => g(), () => c.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: E })), c.ok($);
      function g() {
        const S = y();
        u.if(!1);
        for (const p in S)
          u.elseIf((0, e._)`${h} === ${p}`), u.assign($, f(S[p]));
        u.else(), c.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: E }), u.endIf();
      }
      function f(S) {
        const p = u.name("valid"), w = c.subschema({ keyword: "oneOf", schemaProp: S }, p);
        return c.mergeEvaluated(w, e.Name), p;
      }
      function y() {
        var S;
        const p = {}, w = O(v);
        let b = !0;
        for (let k = 0; k < m.length; k++) {
          let F = m[k];
          if (F != null && F.$ref && !(0, a.schemaHasRulesButRef)(F, d.self.RULES)) {
            const j = F.$ref;
            if (F = r.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, j), F instanceof r.SchemaEnv && (F = F.schema), F === void 0)
              throw new n.default(d.opts.uriResolver, d.baseId, j);
          }
          const G = (S = F == null ? void 0 : F.properties) === null || S === void 0 ? void 0 : S[E];
          if (typeof G != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${E}"`);
          b = b && (w || O(F)), M(G, k);
        }
        if (!b)
          throw new Error(`discriminator: "${E}" must be required`);
        return p;
        function O({ required: k }) {
          return Array.isArray(k) && k.includes(E);
        }
        function M(k, F) {
          if (k.const)
            U(k.const, F);
          else if (k.enum)
            for (const G of k.enum)
              U(G, F);
          else
            throw new Error(`discriminator: "properties/${E}" must have "const" or "enum"`);
        }
        function U(k, F) {
          if (typeof k != "string" || k in p)
            throw new Error(`discriminator: "${E}" values must be unique strings`);
          p[k] = F;
        }
      }
    }
  };
  return yr.default = o, yr;
}
var gr = {};
const du = "https://json-schema.org/draft/2020-12/schema", hu = "https://json-schema.org/draft/2020-12/schema", mu = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, pu = "meta", yu = "Core and Validation specifications meta-schema", gu = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], vu = ["object", "boolean"], $u = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", _u = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Eu = {
  $schema: du,
  $id: hu,
  $vocabulary: mu,
  $dynamicAnchor: pu,
  title: yu,
  allOf: gu,
  type: vu,
  $comment: $u,
  properties: _u
}, wu = "https://json-schema.org/draft/2020-12/schema", Su = "https://json-schema.org/draft/2020-12/meta/applicator", bu = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Ru = "meta", Pu = "Applicator vocabulary meta-schema", Iu = ["object", "boolean"], Nu = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Ou = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Tu = {
  $schema: wu,
  $id: Su,
  $vocabulary: bu,
  $dynamicAnchor: Ru,
  title: Pu,
  type: Iu,
  properties: Nu,
  $defs: Ou
}, Au = "https://json-schema.org/draft/2020-12/schema", ju = "https://json-schema.org/draft/2020-12/meta/unevaluated", qu = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Cu = "meta", ku = "Unevaluated applicator vocabulary meta-schema", Du = ["object", "boolean"], Lu = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Mu = {
  $schema: Au,
  $id: ju,
  $vocabulary: qu,
  $dynamicAnchor: Cu,
  title: ku,
  type: Du,
  properties: Lu
}, Vu = "https://json-schema.org/draft/2020-12/schema", Fu = "https://json-schema.org/draft/2020-12/meta/content", zu = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Uu = "meta", Gu = "Content vocabulary meta-schema", Ku = ["object", "boolean"], Hu = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, Xu = {
  $schema: Vu,
  $id: Fu,
  $vocabulary: zu,
  $dynamicAnchor: Uu,
  title: Gu,
  type: Ku,
  properties: Hu
}, xu = "https://json-schema.org/draft/2020-12/schema", Bu = "https://json-schema.org/draft/2020-12/meta/core", Wu = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, Ju = "meta", Yu = "Core vocabulary meta-schema", Zu = ["object", "boolean"], Qu = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, el = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, tl = {
  $schema: xu,
  $id: Bu,
  $vocabulary: Wu,
  $dynamicAnchor: Ju,
  title: Yu,
  type: Zu,
  properties: Qu,
  $defs: el
}, rl = "https://json-schema.org/draft/2020-12/schema", nl = "https://json-schema.org/draft/2020-12/meta/format-annotation", sl = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, al = "meta", il = "Format vocabulary meta-schema for annotation results", ol = ["object", "boolean"], cl = { format: { type: "string" } }, ul = {
  $schema: rl,
  $id: nl,
  $vocabulary: sl,
  $dynamicAnchor: al,
  title: il,
  type: ol,
  properties: cl
}, ll = "https://json-schema.org/draft/2020-12/schema", fl = "https://json-schema.org/draft/2020-12/meta/meta-data", dl = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, hl = "meta", ml = "Meta-data vocabulary meta-schema", pl = ["object", "boolean"], yl = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, gl = {
  $schema: ll,
  $id: fl,
  $vocabulary: dl,
  $dynamicAnchor: hl,
  title: ml,
  type: pl,
  properties: yl
}, vl = "https://json-schema.org/draft/2020-12/schema", $l = "https://json-schema.org/draft/2020-12/meta/validation", _l = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, El = "meta", wl = "Validation vocabulary meta-schema", Sl = ["object", "boolean"], bl = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, Rl = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Pl = {
  $schema: vl,
  $id: $l,
  $vocabulary: _l,
  $dynamicAnchor: El,
  title: wl,
  type: Sl,
  properties: bl,
  $defs: Rl
};
var xa;
function Il() {
  if (xa) return gr;
  xa = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = Eu, t = Tu, r = Mu, n = Xu, a = tl, s = ul, o = gl, c = Pl, u = ["/properties"];
  function l(i) {
    return [
      e,
      t,
      r,
      n,
      a,
      v(this, s),
      o,
      v(this, c)
    ].forEach((d) => this.addMetaSchema(d, void 0, !1)), this;
    function v(d, m) {
      return i ? d.$dataMetaSchema(m, u) : m;
    }
  }
  return gr.default = l, gr;
}
var Ba;
function Nl() {
  return Ba || (Ba = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const r = /* @__PURE__ */ fo(), n = /* @__PURE__ */ lu(), a = /* @__PURE__ */ So(), s = /* @__PURE__ */ Il(), o = "https://json-schema.org/draft/2020-12/schema";
    class c extends r.default {
      constructor(m = {}) {
        super({
          ...m,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(a.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: m, meta: E } = this.opts;
        E && (s.default.call(this, m), this.refs["http://json-schema.org/schema"] = o);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
    var u = /* @__PURE__ */ vt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var l = /* @__PURE__ */ J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return l._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return l.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return l.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return l.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return l.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return l.CodeGen;
    } });
    var i = /* @__PURE__ */ jr();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return i.default;
    } });
    var v = /* @__PURE__ */ $t();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return v.default;
    } });
  })(St, St.exports)), St.exports;
}
var Ol = /* @__PURE__ */ Nl(), vr = { exports: {} }, nn = {}, Wa;
function Tl() {
  return Wa || (Wa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(k, F) {
      return { validate: k, compare: F };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(s, o),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), l),
      "date-time": t(d(!0), m),
      "iso-time": t(u(), i),
      "iso-date-time": t(d(), E),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: g,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: U,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: y,
      // signed 32 bit integer
      int32: { type: "number", validate: w },
      // signed 64 bit integer
      int64: { type: "number", validate: b },
      // C-type float
      float: { type: "number", validate: O },
      // C-type double
      double: { type: "number", validate: O },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, l),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, m),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, i),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, E),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function r(k) {
      return k % 4 === 0 && (k % 100 !== 0 || k % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(k) {
      const F = n.exec(k);
      if (!F)
        return !1;
      const G = +F[1], j = +F[2], D = +F[3];
      return j >= 1 && j <= 12 && D >= 1 && D <= (j === 2 && r(G) ? 29 : a[j]);
    }
    function o(k, F) {
      if (k && F)
        return k > F ? 1 : k < F ? -1 : 0;
    }
    const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(k) {
      return function(G) {
        const j = c.exec(G);
        if (!j)
          return !1;
        const D = +j[1], X = +j[2], K = +j[3], z = j[4], H = j[5] === "-" ? -1 : 1, q = +(j[6] || 0), P = +(j[7] || 0);
        if (q > 23 || P > 59 || k && !z)
          return !1;
        if (D <= 23 && X <= 59 && K < 60)
          return !0;
        const A = X - P * H, I = D - q * H - (A < 0 ? 1 : 0);
        return (I === 23 || I === -1) && (A === 59 || A === -1) && K < 61;
      };
    }
    function l(k, F) {
      if (!(k && F))
        return;
      const G = (/* @__PURE__ */ new Date("2020-01-01T" + k)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + F)).valueOf();
      if (G && j)
        return G - j;
    }
    function i(k, F) {
      if (!(k && F))
        return;
      const G = c.exec(k), j = c.exec(F);
      if (G && j)
        return k = G[1] + G[2] + G[3], F = j[1] + j[2] + j[3], k > F ? 1 : k < F ? -1 : 0;
    }
    const v = /t|\s/i;
    function d(k) {
      const F = u(k);
      return function(j) {
        const D = j.split(v);
        return D.length === 2 && s(D[0]) && F(D[1]);
      };
    }
    function m(k, F) {
      if (!(k && F))
        return;
      const G = new Date(k).valueOf(), j = new Date(F).valueOf();
      if (G && j)
        return G - j;
    }
    function E(k, F) {
      if (!(k && F))
        return;
      const [G, j] = k.split(v), [D, X] = F.split(v), K = o(G, D);
      if (K !== void 0)
        return K || l(j, X);
    }
    const $ = /\/|:/, h = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function g(k) {
      return $.test(k) && h.test(k);
    }
    const f = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function y(k) {
      return f.lastIndex = 0, f.test(k);
    }
    const S = -2147483648, p = 2 ** 31 - 1;
    function w(k) {
      return Number.isInteger(k) && k <= p && k >= S;
    }
    function b(k) {
      return Number.isInteger(k);
    }
    function O() {
      return !0;
    }
    const M = /[^\\]\\Z/;
    function U(k) {
      if (M.test(k))
        return !1;
      try {
        return new RegExp(k), !0;
      } catch {
        return !1;
      }
    }
  })(nn)), nn;
}
var sn = {}, $r = { exports: {} }, _r = {}, Ja;
function Al() {
  if (Ja) return _r;
  Ja = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = /* @__PURE__ */ ho(), t = /* @__PURE__ */ mo(), r = /* @__PURE__ */ vo(), n = /* @__PURE__ */ Eo(), a = /* @__PURE__ */ wo(), s = [
    e.default,
    t.default,
    (0, r.default)(),
    n.default,
    a.metadataVocabulary,
    a.contentVocabulary
  ];
  return _r.default = s, _r;
}
const jl = "http://json-schema.org/draft-07/schema#", ql = "http://json-schema.org/draft-07/schema#", Cl = "Core schema meta-schema", kl = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Dl = ["object", "boolean"], Ll = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Ml = {
  $schema: jl,
  $id: ql,
  title: Cl,
  definitions: kl,
  type: Dl,
  properties: Ll,
  default: !0
};
var Ya;
function Vl() {
  return Ya || (Ya = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const r = /* @__PURE__ */ fo(), n = /* @__PURE__ */ Al(), a = /* @__PURE__ */ So(), s = Ml, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
    class u extends r.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((E) => this.addVocabulary(E)), this.opts.discriminator && this.addKeyword(a.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const E = this.opts.$data ? this.$dataMetaSchema(s, o) : s;
        this.addMetaSchema(E, c, !1), this.refs["http://json-schema.org/schema"] = c;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var l = /* @__PURE__ */ vt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var i = /* @__PURE__ */ J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var v = /* @__PURE__ */ jr();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return v.default;
    } });
    var d = /* @__PURE__ */ $t();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })($r, $r.exports)), $r.exports;
}
var Za;
function Fl() {
  return Za || (Za = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = /* @__PURE__ */ Vl(), r = /* @__PURE__ */ J(), n = r.operators, a = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, s = {
      message: ({ keyword: c, schemaCode: u }) => (0, r.str)`should be ${a[c].okStr} ${u}`,
      params: ({ keyword: c, schemaCode: u }) => (0, r._)`{comparison: ${a[c].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(a),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(c) {
        const { gen: u, data: l, schemaCode: i, keyword: v, it: d } = c, { opts: m, self: E } = d;
        if (!m.validateFormats)
          return;
        const $ = new t.KeywordCxt(d, E.RULES.all.format.definition, "format");
        $.$data ? h() : g();
        function h() {
          const y = u.scopeValue("formats", {
            ref: E.formats,
            code: m.code.formats
          }), S = u.const("fmt", (0, r._)`${y}[${$.schemaCode}]`);
          c.fail$data((0, r.or)((0, r._)`typeof ${S} != "object"`, (0, r._)`${S} instanceof RegExp`, (0, r._)`typeof ${S}.compare != "function"`, f(S)));
        }
        function g() {
          const y = $.schema, S = E.formats[y];
          if (!S || S === !0)
            return;
          if (typeof S != "object" || S instanceof RegExp || typeof S.compare != "function")
            throw new Error(`"${v}": format "${y}" does not define "compare" function`);
          const p = u.scopeValue("formats", {
            key: y,
            ref: S,
            code: m.code.formats ? (0, r._)`${m.code.formats}${(0, r.getProperty)(y)}` : void 0
          });
          c.fail$data(f(p));
        }
        function f(y) {
          return (0, r._)`${y}.compare(${l}, ${i}) ${a[v].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
    e.default = o;
  })(sn)), sn;
}
var Qa;
function zl() {
  return Qa || (Qa = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = Tl(), n = Fl(), a = /* @__PURE__ */ J(), s = new a.Name("fullFormats"), o = new a.Name("fastFormats"), c = (l, i = { keywords: !0 }) => {
      if (Array.isArray(i))
        return u(l, i, r.fullFormats, s), l;
      const [v, d] = i.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, s], m = i.formats || r.formatNames;
      return u(l, m, v, d), i.keywords && (0, n.default)(l), l;
    };
    c.get = (l, i = "full") => {
      const d = (i === "fast" ? r.fastFormats : r.fullFormats)[l];
      if (!d)
        throw new Error(`Unknown format "${l}"`);
      return d;
    };
    function u(l, i, v, d) {
      var m, E;
      (m = (E = l.opts.code).formats) !== null && m !== void 0 || (E.formats = (0, a._)`require("ajv-formats/dist/formats").${d}`);
      for (const $ of i)
        l.addFormat($, v[$]);
    }
    e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  })(vr, vr.exports)), vr.exports;
}
var Ul = zl();
const Gl = /* @__PURE__ */ io(Ul), Kl = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const a = Object.getOwnPropertyDescriptor(e, r), s = Object.getOwnPropertyDescriptor(t, r);
  !Hl(a, s) && n || Object.defineProperty(e, r, s);
}, Hl = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Xl = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, xl = (e, t) => `/* Wrapped ${e}*/
${t}`, Bl = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Wl = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Jl = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, a = xl.bind(null, n, t.toString());
  Object.defineProperty(a, "name", Wl);
  const { writable: s, enumerable: o, configurable: c } = Bl;
  Object.defineProperty(e, "toString", { value: a, writable: s, enumerable: o, configurable: c });
};
function Yl(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const a of Reflect.ownKeys(t))
    Kl(e, t, a, r);
  return Xl(e, t), Jl(e, t, n), e;
}
const ei = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: a = !1,
    after: s = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!a && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, c, u;
  const l = function(...i) {
    const v = this, d = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), s && (u = e.apply(v, i));
    }, m = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), s && (u = e.apply(v, i));
    }, E = a && !o;
    return clearTimeout(o), o = setTimeout(d, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout(m, n)), E && (u = e.apply(v, i)), u;
  };
  return Yl(l, e), l.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, l;
};
var Er = { exports: {} }, an, ti;
function Cr() {
  if (ti) return an;
  ti = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, a = t - 6;
  return an = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: a,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, an;
}
var on, ri;
function kr() {
  return ri || (ri = 1, on = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), on;
}
var ni;
function _t() {
  return ni || (ni = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: a
    } = Cr(), s = kr();
    t = e.exports = {};
    const o = t.re = [], c = t.safeRe = [], u = t.src = [], l = t.safeSrc = [], i = t.t = {};
    let v = 0;
    const d = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", a],
      [d, n]
    ], E = (h) => {
      for (const [g, f] of m)
        h = h.split(`${g}*`).join(`${g}{0,${f}}`).split(`${g}+`).join(`${g}{1,${f}}`);
      return h;
    }, $ = (h, g, f) => {
      const y = E(g), S = v++;
      s(h, S, g), i[h] = S, u[S] = g, l[S] = y, o[S] = new RegExp(g, f ? "g" : void 0), c[S] = new RegExp(y, f ? "g" : void 0);
    };
    $("NUMERICIDENTIFIER", "0|[1-9]\\d*"), $("NUMERICIDENTIFIERLOOSE", "\\d+"), $("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), $("MAINVERSION", `(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})\\.(${u[i.NUMERICIDENTIFIER]})`), $("MAINVERSIONLOOSE", `(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})\\.(${u[i.NUMERICIDENTIFIERLOOSE]})`), $("PRERELEASEIDENTIFIER", `(?:${u[i.NONNUMERICIDENTIFIER]}|${u[i.NUMERICIDENTIFIER]})`), $("PRERELEASEIDENTIFIERLOOSE", `(?:${u[i.NONNUMERICIDENTIFIER]}|${u[i.NUMERICIDENTIFIERLOOSE]})`), $("PRERELEASE", `(?:-(${u[i.PRERELEASEIDENTIFIER]}(?:\\.${u[i.PRERELEASEIDENTIFIER]})*))`), $("PRERELEASELOOSE", `(?:-?(${u[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[i.PRERELEASEIDENTIFIERLOOSE]})*))`), $("BUILDIDENTIFIER", `${d}+`), $("BUILD", `(?:\\+(${u[i.BUILDIDENTIFIER]}(?:\\.${u[i.BUILDIDENTIFIER]})*))`), $("FULLPLAIN", `v?${u[i.MAINVERSION]}${u[i.PRERELEASE]}?${u[i.BUILD]}?`), $("FULL", `^${u[i.FULLPLAIN]}$`), $("LOOSEPLAIN", `[v=\\s]*${u[i.MAINVERSIONLOOSE]}${u[i.PRERELEASELOOSE]}?${u[i.BUILD]}?`), $("LOOSE", `^${u[i.LOOSEPLAIN]}$`), $("GTLT", "((?:<|>)?=?)"), $("XRANGEIDENTIFIERLOOSE", `${u[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), $("XRANGEIDENTIFIER", `${u[i.NUMERICIDENTIFIER]}|x|X|\\*`), $("XRANGEPLAIN", `[v=\\s]*(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:\\.(${u[i.XRANGEIDENTIFIER]})(?:${u[i.PRERELEASE]})?${u[i.BUILD]}?)?)?`), $("XRANGEPLAINLOOSE", `[v=\\s]*(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[i.XRANGEIDENTIFIERLOOSE]})(?:${u[i.PRERELEASELOOSE]})?${u[i.BUILD]}?)?)?`), $("XRANGE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAIN]}$`), $("XRANGELOOSE", `^${u[i.GTLT]}\\s*${u[i.XRANGEPLAINLOOSE]}$`), $("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), $("COERCE", `${u[i.COERCEPLAIN]}(?:$|[^\\d])`), $("COERCEFULL", u[i.COERCEPLAIN] + `(?:${u[i.PRERELEASE]})?(?:${u[i.BUILD]})?(?:$|[^\\d])`), $("COERCERTL", u[i.COERCE], !0), $("COERCERTLFULL", u[i.COERCEFULL], !0), $("LONETILDE", "(?:~>?)"), $("TILDETRIM", `(\\s*)${u[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", $("TILDE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAIN]}$`), $("TILDELOOSE", `^${u[i.LONETILDE]}${u[i.XRANGEPLAINLOOSE]}$`), $("LONECARET", "(?:\\^)"), $("CARETTRIM", `(\\s*)${u[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", $("CARET", `^${u[i.LONECARET]}${u[i.XRANGEPLAIN]}$`), $("CARETLOOSE", `^${u[i.LONECARET]}${u[i.XRANGEPLAINLOOSE]}$`), $("COMPARATORLOOSE", `^${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]})$|^$`), $("COMPARATOR", `^${u[i.GTLT]}\\s*(${u[i.FULLPLAIN]})$|^$`), $("COMPARATORTRIM", `(\\s*)${u[i.GTLT]}\\s*(${u[i.LOOSEPLAIN]}|${u[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", $("HYPHENRANGE", `^\\s*(${u[i.XRANGEPLAIN]})\\s+-\\s+(${u[i.XRANGEPLAIN]})\\s*$`), $("HYPHENRANGELOOSE", `^\\s*(${u[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[i.XRANGEPLAINLOOSE]})\\s*$`), $("STAR", "(<|>)?=?\\s*\\*"), $("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), $("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Er, Er.exports)), Er.exports;
}
var cn, si;
function is() {
  if (si) return cn;
  si = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return cn = (n) => n ? typeof n != "object" ? e : n : t, cn;
}
var un, ai;
function bo() {
  if (ai) return un;
  ai = 1;
  const e = /^[0-9]+$/, t = (n, a) => {
    if (typeof n == "number" && typeof a == "number")
      return n === a ? 0 : n < a ? -1 : 1;
    const s = e.test(n), o = e.test(a);
    return s && o && (n = +n, a = +a), n === a ? 0 : s && !o ? -1 : o && !s ? 1 : n < a ? -1 : 1;
  };
  return un = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, a) => t(a, n)
  }, un;
}
var ln, ii;
function ye() {
  if (ii) return ln;
  ii = 1;
  const e = kr(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = Cr(), { safeRe: n, t: a } = _t(), s = is(), { compareIdentifiers: o } = bo();
  class c {
    constructor(l, i) {
      if (i = s(i), l instanceof c) {
        if (l.loose === !!i.loose && l.includePrerelease === !!i.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", l, i), this.options = i, this.loose = !!i.loose, this.includePrerelease = !!i.includePrerelease;
      const v = l.trim().match(i.loose ? n[a.LOOSE] : n[a.FULL]);
      if (!v)
        throw new TypeError(`Invalid Version: ${l}`);
      if (this.raw = l, this.major = +v[1], this.minor = +v[2], this.patch = +v[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      v[4] ? this.prerelease = v[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const m = +d;
          if (m >= 0 && m < r)
            return m;
        }
        return d;
      }) : this.prerelease = [], this.build = v[5] ? v[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(l) {
      if (e("SemVer.compare", this.version, this.options, l), !(l instanceof c)) {
        if (typeof l == "string" && l === this.version)
          return 0;
        l = new c(l, this.options);
      }
      return l.version === this.version ? 0 : this.compareMain(l) || this.comparePre(l);
    }
    compareMain(l) {
      return l instanceof c || (l = new c(l, this.options)), this.major < l.major ? -1 : this.major > l.major ? 1 : this.minor < l.minor ? -1 : this.minor > l.minor ? 1 : this.patch < l.patch ? -1 : this.patch > l.patch ? 1 : 0;
    }
    comparePre(l) {
      if (l instanceof c || (l = new c(l, this.options)), this.prerelease.length && !l.prerelease.length)
        return -1;
      if (!this.prerelease.length && l.prerelease.length)
        return 1;
      if (!this.prerelease.length && !l.prerelease.length)
        return 0;
      let i = 0;
      do {
        const v = this.prerelease[i], d = l.prerelease[i];
        if (e("prerelease compare", i, v, d), v === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (v === void 0)
          return -1;
        if (v === d)
          continue;
        return o(v, d);
      } while (++i);
    }
    compareBuild(l) {
      l instanceof c || (l = new c(l, this.options));
      let i = 0;
      do {
        const v = this.build[i], d = l.build[i];
        if (e("build compare", i, v, d), v === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (v === void 0)
          return -1;
        if (v === d)
          continue;
        return o(v, d);
      } while (++i);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, i, v) {
      if (l.startsWith("pre")) {
        if (!i && v === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (i) {
          const d = `-${i}`.match(this.options.loose ? n[a.PRERELEASELOOSE] : n[a.PRERELEASE]);
          if (!d || d[1] !== i)
            throw new Error(`invalid identifier: ${i}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", i, v);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", i, v);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", i, v), this.inc("pre", i, v);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", i, v), this.inc("pre", i, v);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const d = Number(v) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (i === this.prerelease.join(".") && v === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (i) {
            let m = [i, d];
            v === !1 && (m = [i]), o(this.prerelease[0], i) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return ln = c, ln;
}
var fn, oi;
function ft() {
  if (oi) return fn;
  oi = 1;
  const e = ye();
  return fn = (r, n, a = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, n);
    } catch (s) {
      if (!a)
        return null;
      throw s;
    }
  }, fn;
}
var dn, ci;
function Zl() {
  if (ci) return dn;
  ci = 1;
  const e = ft();
  return dn = (r, n) => {
    const a = e(r, n);
    return a ? a.version : null;
  }, dn;
}
var hn, ui;
function Ql() {
  if (ui) return hn;
  ui = 1;
  const e = ft();
  return hn = (r, n) => {
    const a = e(r.trim().replace(/^[=v]+/, ""), n);
    return a ? a.version : null;
  }, hn;
}
var mn, li;
function ef() {
  if (li) return mn;
  li = 1;
  const e = ye();
  return mn = (r, n, a, s, o) => {
    typeof a == "string" && (o = s, s = a, a = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        a
      ).inc(n, s, o).version;
    } catch {
      return null;
    }
  }, mn;
}
var pn, fi;
function tf() {
  if (fi) return pn;
  fi = 1;
  const e = ft();
  return pn = (r, n) => {
    const a = e(r, null, !0), s = e(n, null, !0), o = a.compare(s);
    if (o === 0)
      return null;
    const c = o > 0, u = c ? a : s, l = c ? s : a, i = !!u.prerelease.length;
    if (!!l.prerelease.length && !i) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(u) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const d = i ? "pre" : "";
    return a.major !== s.major ? d + "major" : a.minor !== s.minor ? d + "minor" : a.patch !== s.patch ? d + "patch" : "prerelease";
  }, pn;
}
var yn, di;
function rf() {
  if (di) return yn;
  di = 1;
  const e = ye();
  return yn = (r, n) => new e(r, n).major, yn;
}
var gn, hi;
function nf() {
  if (hi) return gn;
  hi = 1;
  const e = ye();
  return gn = (r, n) => new e(r, n).minor, gn;
}
var vn, mi;
function sf() {
  if (mi) return vn;
  mi = 1;
  const e = ye();
  return vn = (r, n) => new e(r, n).patch, vn;
}
var $n, pi;
function af() {
  if (pi) return $n;
  pi = 1;
  const e = ft();
  return $n = (r, n) => {
    const a = e(r, n);
    return a && a.prerelease.length ? a.prerelease : null;
  }, $n;
}
var _n, yi;
function Ae() {
  if (yi) return _n;
  yi = 1;
  const e = ye();
  return _n = (r, n, a) => new e(r, a).compare(new e(n, a)), _n;
}
var En, gi;
function of() {
  if (gi) return En;
  gi = 1;
  const e = Ae();
  return En = (r, n, a) => e(n, r, a), En;
}
var wn, vi;
function cf() {
  if (vi) return wn;
  vi = 1;
  const e = Ae();
  return wn = (r, n) => e(r, n, !0), wn;
}
var Sn, $i;
function os() {
  if ($i) return Sn;
  $i = 1;
  const e = ye();
  return Sn = (r, n, a) => {
    const s = new e(r, a), o = new e(n, a);
    return s.compare(o) || s.compareBuild(o);
  }, Sn;
}
var bn, _i;
function uf() {
  if (_i) return bn;
  _i = 1;
  const e = os();
  return bn = (r, n) => r.sort((a, s) => e(a, s, n)), bn;
}
var Rn, Ei;
function lf() {
  if (Ei) return Rn;
  Ei = 1;
  const e = os();
  return Rn = (r, n) => r.sort((a, s) => e(s, a, n)), Rn;
}
var Pn, wi;
function Dr() {
  if (wi) return Pn;
  wi = 1;
  const e = Ae();
  return Pn = (r, n, a) => e(r, n, a) > 0, Pn;
}
var In, Si;
function cs() {
  if (Si) return In;
  Si = 1;
  const e = Ae();
  return In = (r, n, a) => e(r, n, a) < 0, In;
}
var Nn, bi;
function Ro() {
  if (bi) return Nn;
  bi = 1;
  const e = Ae();
  return Nn = (r, n, a) => e(r, n, a) === 0, Nn;
}
var On, Ri;
function Po() {
  if (Ri) return On;
  Ri = 1;
  const e = Ae();
  return On = (r, n, a) => e(r, n, a) !== 0, On;
}
var Tn, Pi;
function us() {
  if (Pi) return Tn;
  Pi = 1;
  const e = Ae();
  return Tn = (r, n, a) => e(r, n, a) >= 0, Tn;
}
var An, Ii;
function ls() {
  if (Ii) return An;
  Ii = 1;
  const e = Ae();
  return An = (r, n, a) => e(r, n, a) <= 0, An;
}
var jn, Ni;
function Io() {
  if (Ni) return jn;
  Ni = 1;
  const e = Ro(), t = Po(), r = Dr(), n = us(), a = cs(), s = ls();
  return jn = (c, u, l, i) => {
    switch (u) {
      case "===":
        return typeof c == "object" && (c = c.version), typeof l == "object" && (l = l.version), c === l;
      case "!==":
        return typeof c == "object" && (c = c.version), typeof l == "object" && (l = l.version), c !== l;
      case "":
      case "=":
      case "==":
        return e(c, l, i);
      case "!=":
        return t(c, l, i);
      case ">":
        return r(c, l, i);
      case ">=":
        return n(c, l, i);
      case "<":
        return a(c, l, i);
      case "<=":
        return s(c, l, i);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, jn;
}
var qn, Oi;
function ff() {
  if (Oi) return qn;
  Oi = 1;
  const e = ye(), t = ft(), { safeRe: r, t: n } = _t();
  return qn = (s, o) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    o = o || {};
    let c = null;
    if (!o.rtl)
      c = s.match(o.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const m = o.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let E;
      for (; (E = m.exec(s)) && (!c || c.index + c[0].length !== s.length); )
        (!c || E.index + E[0].length !== c.index + c[0].length) && (c = E), m.lastIndex = E.index + E[1].length + E[2].length;
      m.lastIndex = -1;
    }
    if (c === null)
      return null;
    const u = c[2], l = c[3] || "0", i = c[4] || "0", v = o.includePrerelease && c[5] ? `-${c[5]}` : "", d = o.includePrerelease && c[6] ? `+${c[6]}` : "";
    return t(`${u}.${l}.${i}${v}${d}`, o);
  }, qn;
}
var Cn, Ti;
function df() {
  if (Ti) return Cn;
  Ti = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return Cn = e, Cn;
}
var kn, Ai;
function je() {
  if (Ai) return kn;
  Ai = 1;
  const e = /\s+/g;
  class t {
    constructor(D, X) {
      if (X = a(X), D instanceof t)
        return D.loose === !!X.loose && D.includePrerelease === !!X.includePrerelease ? D : new t(D.raw, X);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = X, this.loose = !!X.loose, this.includePrerelease = !!X.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((K) => this.parseRange(K.trim())).filter((K) => K.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const K = this.set[0];
        if (this.set = this.set.filter((z) => !$(z[0])), this.set.length === 0)
          this.set = [K];
        else if (this.set.length > 1) {
          for (const z of this.set)
            if (z.length === 1 && h(z[0])) {
              this.set = [z];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const X = this.set[D];
          for (let K = 0; K < X.length; K++)
            K > 0 && (this.formatted += " "), this.formatted += X[K].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(D) {
      const K = ((this.options.includePrerelease && m) | (this.options.loose && E)) + ":" + D, z = n.get(K);
      if (z)
        return z;
      const H = this.options.loose, q = H ? u[l.HYPHENRANGELOOSE] : u[l.HYPHENRANGE];
      D = D.replace(q, F(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(u[l.COMPARATORTRIM], i), o("comparator trim", D), D = D.replace(u[l.TILDETRIM], v), o("tilde trim", D), D = D.replace(u[l.CARETTRIM], d), o("caret trim", D);
      let P = D.split(" ").map((R) => f(R, this.options)).join(" ").split(/\s+/).map((R) => k(R, this.options));
      H && (P = P.filter((R) => (o("loose invalid filter", R, this.options), !!R.match(u[l.COMPARATORLOOSE])))), o("range list", P);
      const A = /* @__PURE__ */ new Map(), I = P.map((R) => new s(R, this.options));
      for (const R of I) {
        if ($(R))
          return [R];
        A.set(R.value, R);
      }
      A.size > 1 && A.has("") && A.delete("");
      const _ = [...A.values()];
      return n.set(K, _), _;
    }
    intersects(D, X) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((K) => g(K, X) && D.set.some((z) => g(z, X) && K.every((H) => z.every((q) => H.intersects(q, X)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new c(D, this.options);
        } catch {
          return !1;
        }
      for (let X = 0; X < this.set.length; X++)
        if (G(this.set[X], D, this.options))
          return !0;
      return !1;
    }
  }
  kn = t;
  const r = df(), n = new r(), a = is(), s = Lr(), o = kr(), c = ye(), {
    safeRe: u,
    t: l,
    comparatorTrimReplace: i,
    tildeTrimReplace: v,
    caretTrimReplace: d
  } = _t(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: E } = Cr(), $ = (j) => j.value === "<0.0.0-0", h = (j) => j.value === "", g = (j, D) => {
    let X = !0;
    const K = j.slice();
    let z = K.pop();
    for (; X && K.length; )
      X = K.every((H) => z.intersects(H, D)), z = K.pop();
    return X;
  }, f = (j, D) => (j = j.replace(u[l.BUILD], ""), o("comp", j, D), j = w(j, D), o("caret", j), j = S(j, D), o("tildes", j), j = O(j, D), o("xrange", j), j = U(j, D), o("stars", j), j), y = (j) => !j || j.toLowerCase() === "x" || j === "*", S = (j, D) => j.trim().split(/\s+/).map((X) => p(X, D)).join(" "), p = (j, D) => {
    const X = D.loose ? u[l.TILDELOOSE] : u[l.TILDE];
    return j.replace(X, (K, z, H, q, P) => {
      o("tilde", j, K, z, H, q, P);
      let A;
      return y(z) ? A = "" : y(H) ? A = `>=${z}.0.0 <${+z + 1}.0.0-0` : y(q) ? A = `>=${z}.${H}.0 <${z}.${+H + 1}.0-0` : P ? (o("replaceTilde pr", P), A = `>=${z}.${H}.${q}-${P} <${z}.${+H + 1}.0-0`) : A = `>=${z}.${H}.${q} <${z}.${+H + 1}.0-0`, o("tilde return", A), A;
    });
  }, w = (j, D) => j.trim().split(/\s+/).map((X) => b(X, D)).join(" "), b = (j, D) => {
    o("caret", j, D);
    const X = D.loose ? u[l.CARETLOOSE] : u[l.CARET], K = D.includePrerelease ? "-0" : "";
    return j.replace(X, (z, H, q, P, A) => {
      o("caret", j, z, H, q, P, A);
      let I;
      return y(H) ? I = "" : y(q) ? I = `>=${H}.0.0${K} <${+H + 1}.0.0-0` : y(P) ? H === "0" ? I = `>=${H}.${q}.0${K} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.0${K} <${+H + 1}.0.0-0` : A ? (o("replaceCaret pr", A), H === "0" ? q === "0" ? I = `>=${H}.${q}.${P}-${A} <${H}.${q}.${+P + 1}-0` : I = `>=${H}.${q}.${P}-${A} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.${P}-${A} <${+H + 1}.0.0-0`) : (o("no pr"), H === "0" ? q === "0" ? I = `>=${H}.${q}.${P}${K} <${H}.${q}.${+P + 1}-0` : I = `>=${H}.${q}.${P}${K} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.${P} <${+H + 1}.0.0-0`), o("caret return", I), I;
    });
  }, O = (j, D) => (o("replaceXRanges", j, D), j.split(/\s+/).map((X) => M(X, D)).join(" ")), M = (j, D) => {
    j = j.trim();
    const X = D.loose ? u[l.XRANGELOOSE] : u[l.XRANGE];
    return j.replace(X, (K, z, H, q, P, A) => {
      o("xRange", j, K, z, H, q, P, A);
      const I = y(H), _ = I || y(q), R = _ || y(P), C = R;
      return z === "=" && C && (z = ""), A = D.includePrerelease ? "-0" : "", I ? z === ">" || z === "<" ? K = "<0.0.0-0" : K = "*" : z && C ? (_ && (q = 0), P = 0, z === ">" ? (z = ">=", _ ? (H = +H + 1, q = 0, P = 0) : (q = +q + 1, P = 0)) : z === "<=" && (z = "<", _ ? H = +H + 1 : q = +q + 1), z === "<" && (A = "-0"), K = `${z + H}.${q}.${P}${A}`) : _ ? K = `>=${H}.0.0${A} <${+H + 1}.0.0-0` : R && (K = `>=${H}.${q}.0${A} <${H}.${+q + 1}.0-0`), o("xRange return", K), K;
    });
  }, U = (j, D) => (o("replaceStars", j, D), j.trim().replace(u[l.STAR], "")), k = (j, D) => (o("replaceGTE0", j, D), j.trim().replace(u[D.includePrerelease ? l.GTE0PRE : l.GTE0], "")), F = (j) => (D, X, K, z, H, q, P, A, I, _, R, C) => (y(K) ? X = "" : y(z) ? X = `>=${K}.0.0${j ? "-0" : ""}` : y(H) ? X = `>=${K}.${z}.0${j ? "-0" : ""}` : q ? X = `>=${X}` : X = `>=${X}${j ? "-0" : ""}`, y(I) ? A = "" : y(_) ? A = `<${+I + 1}.0.0-0` : y(R) ? A = `<${I}.${+_ + 1}.0-0` : C ? A = `<=${I}.${_}.${R}-${C}` : j ? A = `<${I}.${_}.${+R + 1}-0` : A = `<=${A}`, `${X} ${A}`.trim()), G = (j, D, X) => {
    for (let K = 0; K < j.length; K++)
      if (!j[K].test(D))
        return !1;
    if (D.prerelease.length && !X.includePrerelease) {
      for (let K = 0; K < j.length; K++)
        if (o(j[K].semver), j[K].semver !== s.ANY && j[K].semver.prerelease.length > 0) {
          const z = j[K].semver;
          if (z.major === D.major && z.minor === D.minor && z.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return kn;
}
var Dn, ji;
function Lr() {
  if (ji) return Dn;
  ji = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(i, v) {
      if (v = r(v), i instanceof t) {
        if (i.loose === !!v.loose)
          return i;
        i = i.value;
      }
      i = i.trim().split(/\s+/).join(" "), o("comparator", i, v), this.options = v, this.loose = !!v.loose, this.parse(i), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(i) {
      const v = this.options.loose ? n[a.COMPARATORLOOSE] : n[a.COMPARATOR], d = i.match(v);
      if (!d)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new c(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(i) {
      if (o("Comparator.test", i, this.options.loose), this.semver === e || i === e)
        return !0;
      if (typeof i == "string")
        try {
          i = new c(i, this.options);
        } catch {
          return !1;
        }
      return s(i, this.operator, this.semver, this.options);
    }
    intersects(i, v) {
      if (!(i instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(i.value, v).test(this.value) : i.operator === "" ? i.value === "" ? !0 : new u(this.value, v).test(i.semver) : (v = r(v), v.includePrerelease && (this.value === "<0.0.0-0" || i.value === "<0.0.0-0") || !v.includePrerelease && (this.value.startsWith("<0.0.0") || i.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && i.operator.startsWith(">") || this.operator.startsWith("<") && i.operator.startsWith("<") || this.semver.version === i.semver.version && this.operator.includes("=") && i.operator.includes("=") || s(this.semver, "<", i.semver, v) && this.operator.startsWith(">") && i.operator.startsWith("<") || s(this.semver, ">", i.semver, v) && this.operator.startsWith("<") && i.operator.startsWith(">")));
    }
  }
  Dn = t;
  const r = is(), { safeRe: n, t: a } = _t(), s = Io(), o = kr(), c = ye(), u = je();
  return Dn;
}
var Ln, qi;
function Mr() {
  if (qi) return Ln;
  qi = 1;
  const e = je();
  return Ln = (r, n, a) => {
    try {
      n = new e(n, a);
    } catch {
      return !1;
    }
    return n.test(r);
  }, Ln;
}
var Mn, Ci;
function hf() {
  if (Ci) return Mn;
  Ci = 1;
  const e = je();
  return Mn = (r, n) => new e(r, n).set.map((a) => a.map((s) => s.value).join(" ").trim().split(" ")), Mn;
}
var Vn, ki;
function mf() {
  if (ki) return Vn;
  ki = 1;
  const e = ye(), t = je();
  return Vn = (n, a, s) => {
    let o = null, c = null, u = null;
    try {
      u = new t(a, s);
    } catch {
      return null;
    }
    return n.forEach((l) => {
      u.test(l) && (!o || c.compare(l) === -1) && (o = l, c = new e(o, s));
    }), o;
  }, Vn;
}
var Fn, Di;
function pf() {
  if (Di) return Fn;
  Di = 1;
  const e = ye(), t = je();
  return Fn = (n, a, s) => {
    let o = null, c = null, u = null;
    try {
      u = new t(a, s);
    } catch {
      return null;
    }
    return n.forEach((l) => {
      u.test(l) && (!o || c.compare(l) === 1) && (o = l, c = new e(o, s));
    }), o;
  }, Fn;
}
var zn, Li;
function yf() {
  if (Li) return zn;
  Li = 1;
  const e = ye(), t = je(), r = Dr();
  return zn = (a, s) => {
    a = new t(a, s);
    let o = new e("0.0.0");
    if (a.test(o) || (o = new e("0.0.0-0"), a.test(o)))
      return o;
    o = null;
    for (let c = 0; c < a.set.length; ++c) {
      const u = a.set[c];
      let l = null;
      u.forEach((i) => {
        const v = new e(i.semver.version);
        switch (i.operator) {
          case ">":
            v.prerelease.length === 0 ? v.patch++ : v.prerelease.push(0), v.raw = v.format();
          /* fallthrough */
          case "":
          case ">=":
            (!l || r(v, l)) && (l = v);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${i.operator}`);
        }
      }), l && (!o || r(o, l)) && (o = l);
    }
    return o && a.test(o) ? o : null;
  }, zn;
}
var Un, Mi;
function gf() {
  if (Mi) return Un;
  Mi = 1;
  const e = je();
  return Un = (r, n) => {
    try {
      return new e(r, n).range || "*";
    } catch {
      return null;
    }
  }, Un;
}
var Gn, Vi;
function fs() {
  if (Vi) return Gn;
  Vi = 1;
  const e = ye(), t = Lr(), { ANY: r } = t, n = je(), a = Mr(), s = Dr(), o = cs(), c = ls(), u = us();
  return Gn = (i, v, d, m) => {
    i = new e(i, m), v = new n(v, m);
    let E, $, h, g, f;
    switch (d) {
      case ">":
        E = s, $ = c, h = o, g = ">", f = ">=";
        break;
      case "<":
        E = o, $ = u, h = s, g = "<", f = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (a(i, v, m))
      return !1;
    for (let y = 0; y < v.set.length; ++y) {
      const S = v.set[y];
      let p = null, w = null;
      if (S.forEach((b) => {
        b.semver === r && (b = new t(">=0.0.0")), p = p || b, w = w || b, E(b.semver, p.semver, m) ? p = b : h(b.semver, w.semver, m) && (w = b);
      }), p.operator === g || p.operator === f || (!w.operator || w.operator === g) && $(i, w.semver))
        return !1;
      if (w.operator === f && h(i, w.semver))
        return !1;
    }
    return !0;
  }, Gn;
}
var Kn, Fi;
function vf() {
  if (Fi) return Kn;
  Fi = 1;
  const e = fs();
  return Kn = (r, n, a) => e(r, n, ">", a), Kn;
}
var Hn, zi;
function $f() {
  if (zi) return Hn;
  zi = 1;
  const e = fs();
  return Hn = (r, n, a) => e(r, n, "<", a), Hn;
}
var Xn, Ui;
function _f() {
  if (Ui) return Xn;
  Ui = 1;
  const e = je();
  return Xn = (r, n, a) => (r = new e(r, a), n = new e(n, a), r.intersects(n, a)), Xn;
}
var xn, Gi;
function Ef() {
  if (Gi) return xn;
  Gi = 1;
  const e = Mr(), t = Ae();
  return xn = (r, n, a) => {
    const s = [];
    let o = null, c = null;
    const u = r.sort((d, m) => t(d, m, a));
    for (const d of u)
      e(d, n, a) ? (c = d, o || (o = d)) : (c && s.push([o, c]), c = null, o = null);
    o && s.push([o, null]);
    const l = [];
    for (const [d, m] of s)
      d === m ? l.push(d) : !m && d === u[0] ? l.push("*") : m ? d === u[0] ? l.push(`<=${m}`) : l.push(`${d} - ${m}`) : l.push(`>=${d}`);
    const i = l.join(" || "), v = typeof n.raw == "string" ? n.raw : String(n);
    return i.length < v.length ? i : n;
  }, xn;
}
var Bn, Ki;
function wf() {
  if (Ki) return Bn;
  Ki = 1;
  const e = je(), t = Lr(), { ANY: r } = t, n = Mr(), a = Ae(), s = (v, d, m = {}) => {
    if (v === d)
      return !0;
    v = new e(v, m), d = new e(d, m);
    let E = !1;
    e: for (const $ of v.set) {
      for (const h of d.set) {
        const g = u($, h, m);
        if (E = E || g !== null, g)
          continue e;
      }
      if (E)
        return !1;
    }
    return !0;
  }, o = [new t(">=0.0.0-0")], c = [new t(">=0.0.0")], u = (v, d, m) => {
    if (v === d)
      return !0;
    if (v.length === 1 && v[0].semver === r) {
      if (d.length === 1 && d[0].semver === r)
        return !0;
      m.includePrerelease ? v = o : v = c;
    }
    if (d.length === 1 && d[0].semver === r) {
      if (m.includePrerelease)
        return !0;
      d = c;
    }
    const E = /* @__PURE__ */ new Set();
    let $, h;
    for (const O of v)
      O.operator === ">" || O.operator === ">=" ? $ = l($, O, m) : O.operator === "<" || O.operator === "<=" ? h = i(h, O, m) : E.add(O.semver);
    if (E.size > 1)
      return null;
    let g;
    if ($ && h) {
      if (g = a($.semver, h.semver, m), g > 0)
        return null;
      if (g === 0 && ($.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const O of E) {
      if ($ && !n(O, String($), m) || h && !n(O, String(h), m))
        return null;
      for (const M of d)
        if (!n(O, String(M), m))
          return !1;
      return !0;
    }
    let f, y, S, p, w = h && !m.includePrerelease && h.semver.prerelease.length ? h.semver : !1, b = $ && !m.includePrerelease && $.semver.prerelease.length ? $.semver : !1;
    w && w.prerelease.length === 1 && h.operator === "<" && w.prerelease[0] === 0 && (w = !1);
    for (const O of d) {
      if (p = p || O.operator === ">" || O.operator === ">=", S = S || O.operator === "<" || O.operator === "<=", $) {
        if (b && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === b.major && O.semver.minor === b.minor && O.semver.patch === b.patch && (b = !1), O.operator === ">" || O.operator === ">=") {
          if (f = l($, O, m), f === O && f !== $)
            return !1;
        } else if ($.operator === ">=" && !n($.semver, String(O), m))
          return !1;
      }
      if (h) {
        if (w && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === w.major && O.semver.minor === w.minor && O.semver.patch === w.patch && (w = !1), O.operator === "<" || O.operator === "<=") {
          if (y = i(h, O, m), y === O && y !== h)
            return !1;
        } else if (h.operator === "<=" && !n(h.semver, String(O), m))
          return !1;
      }
      if (!O.operator && (h || $) && g !== 0)
        return !1;
    }
    return !($ && S && !h && g !== 0 || h && p && !$ && g !== 0 || b || w);
  }, l = (v, d, m) => {
    if (!v)
      return d;
    const E = a(v.semver, d.semver, m);
    return E > 0 ? v : E < 0 || d.operator === ">" && v.operator === ">=" ? d : v;
  }, i = (v, d, m) => {
    if (!v)
      return d;
    const E = a(v.semver, d.semver, m);
    return E < 0 ? v : E > 0 || d.operator === "<" && v.operator === "<=" ? d : v;
  };
  return Bn = s, Bn;
}
var Wn, Hi;
function Sf() {
  if (Hi) return Wn;
  Hi = 1;
  const e = _t(), t = Cr(), r = ye(), n = bo(), a = ft(), s = Zl(), o = Ql(), c = ef(), u = tf(), l = rf(), i = nf(), v = sf(), d = af(), m = Ae(), E = of(), $ = cf(), h = os(), g = uf(), f = lf(), y = Dr(), S = cs(), p = Ro(), w = Po(), b = us(), O = ls(), M = Io(), U = ff(), k = Lr(), F = je(), G = Mr(), j = hf(), D = mf(), X = pf(), K = yf(), z = gf(), H = fs(), q = vf(), P = $f(), A = _f(), I = Ef(), _ = wf();
  return Wn = {
    parse: a,
    valid: s,
    clean: o,
    inc: c,
    diff: u,
    major: l,
    minor: i,
    patch: v,
    prerelease: d,
    compare: m,
    rcompare: E,
    compareLoose: $,
    compareBuild: h,
    sort: g,
    rsort: f,
    gt: y,
    lt: S,
    eq: p,
    neq: w,
    gte: b,
    lte: O,
    cmp: M,
    coerce: U,
    Comparator: k,
    Range: F,
    satisfies: G,
    toComparators: j,
    maxSatisfying: D,
    minSatisfying: X,
    minVersion: K,
    validRange: z,
    outside: H,
    gtr: q,
    ltr: P,
    intersects: A,
    simplifyRange: I,
    subset: _,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, Wn;
}
var bf = Sf();
const it = /* @__PURE__ */ io(bf), Rf = Object.prototype.toString, Pf = "[object Uint8Array]", If = "[object ArrayBuffer]";
function No(e, t, r) {
  return e ? e.constructor === t ? !0 : Rf.call(e) === r : !1;
}
function Oo(e) {
  return No(e, Uint8Array, Pf);
}
function Nf(e) {
  return No(e, ArrayBuffer, If);
}
function Of(e) {
  return Oo(e) || Nf(e);
}
function Tf(e) {
  if (!Oo(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Af(e) {
  if (!Of(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Jn(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((a, s) => a + s.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const a of e)
    Tf(a), r.set(a, n), n += a.length;
  return r;
}
const wr = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Sr(e, t = "utf8") {
  return Af(e), wr[t] ?? (wr[t] = new globalThis.TextDecoder(t)), wr[t].decode(e);
}
function jf(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const qf = new globalThis.TextEncoder();
function Yn(e) {
  return jf(e), qf.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Xi = "aes-256-cbc", To = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), Cf = (e) => typeof e == "string" && To.has(e), Ve = () => /* @__PURE__ */ Object.create(null), xi = (e) => e !== void 0, Zn = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Ke = "__internal__", Qn = `${Ke}.migrations.version`;
var Xe, xe, Ye, _e, be, Ze, Qe, lt, qe, oe, Ao, jo, qo, Co, ko, Do, Lo, Mo;
class kf {
  constructor(t = {}) {
    Pe(this, oe);
    ht(this, "path");
    ht(this, "events");
    Pe(this, Xe);
    Pe(this, xe);
    Pe(this, Ye);
    Pe(this, _e);
    Pe(this, be, {});
    Pe(this, Ze, !1);
    Pe(this, Qe);
    Pe(this, lt);
    Pe(this, qe);
    ht(this, "_deserialize", (t) => JSON.parse(t));
    ht(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = Ce(this, oe, Ao).call(this, t);
    $e(this, _e, r), Ce(this, oe, jo).call(this, r), Ce(this, oe, Co).call(this, r), Ce(this, oe, ko).call(this, r), this.events = new EventTarget(), $e(this, xe, r.encryptionKey), $e(this, Ye, r.encryptionAlgorithm ?? Xi), this.path = Ce(this, oe, Do).call(this, r), Ce(this, oe, Lo).call(this, r), r.watch && this._watch();
  }
  get(t, r) {
    if (Y(this, _e).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Ke} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, a = (s, o) => {
      if (Zn(s, o), Y(this, _e).accessPropertiesByDotNotation)
        Et(n, s, o);
      else {
        if (s === "__proto__" || s === "constructor" || s === "prototype")
          return;
        n[s] = o;
      }
    };
    if (typeof t == "object") {
      const s = t;
      for (const [o, c] of Object.entries(s))
        a(o, c);
    } else
      a(t, r);
    this.store = n;
  }
  has(t) {
    return Y(this, _e).accessPropertiesByDotNotation ? Hr(this.store, t) : t in this.store;
  }
  appendToArray(t, r) {
    Zn(t, r);
    const n = Y(this, _e).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      xi(Y(this, be)[r]) && this.set(r, Y(this, be)[r]);
  }
  delete(t) {
    const { store: r } = this;
    Y(this, _e).accessPropertiesByDotNotation ? Wo(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = Ve();
    for (const r of Object.keys(Y(this, be)))
      xi(Y(this, be)[r]) && (Zn(r, Y(this, be)[r]), Y(this, _e).accessPropertiesByDotNotation ? Et(t, r, Y(this, be)[r]) : t[r] = Y(this, be)[r]);
    this.store = t;
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    var t;
    try {
      const r = Z.readFileSync(this.path, Y(this, xe) ? null : "utf8"), n = this._decryptData(r);
      return ((s) => {
        const o = this._deserialize(s);
        return Y(this, Ze) || this._validate(o), Object.assign(Ve(), o);
      })(n);
    } catch (r) {
      if ((r == null ? void 0 : r.code) === "ENOENT")
        return this._ensureDirectory(), Ve();
      if (Y(this, _e).clearInvalidConfig) {
        const n = r;
        if (n.name === "SyntaxError" || (t = n.message) != null && t.startsWith("Config schema violation:") || n.message === "Failed to decrypt config data.")
          return Ve();
      }
      throw r;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Hr(t, Ke))
      try {
        const r = Z.readFileSync(this.path, Y(this, xe) ? null : "utf8"), n = this._decryptData(r), a = this._deserialize(n);
        Hr(a, Ke) && Et(t, Ke, $s(a, Ke));
      } catch {
      }
    Y(this, Ze) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    Y(this, Qe) && (Y(this, Qe).close(), $e(this, Qe, void 0)), Y(this, lt) && (Z.unwatchFile(this.path), $e(this, lt, !1)), $e(this, qe, void 0);
  }
  _decryptData(t) {
    const r = Y(this, xe);
    if (!r)
      return typeof t == "string" ? t : Sr(t);
    const n = Y(this, Ye), a = n === "aes-256-gcm" ? 16 : 0, s = ":".codePointAt(0), o = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(s !== void 0 && o === s)) {
      if (n === "aes-256-cbc")
        return typeof t == "string" ? t : Sr(t);
      throw new Error("Failed to decrypt config data.");
    }
    const u = (m) => {
      if (a === 0)
        return { ciphertext: m };
      const E = m.length - a;
      if (E < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: m.slice(0, E),
        authenticationTag: m.slice(E)
      };
    }, l = t.slice(0, 16), i = t.slice(17), v = typeof i == "string" ? Yn(i) : i, d = (m) => {
      const { ciphertext: E, authenticationTag: $ } = u(v), h = mt.pbkdf2Sync(r, m, 1e4, 32, "sha512"), g = mt.createDecipheriv(n, h, l);
      return $ && g.setAuthTag($), Sr(Jn([g.update(E), g.final()]));
    };
    try {
      return d(l);
    } catch {
      try {
        return d(l.toString());
      } catch {
      }
    }
    if (n === "aes-256-cbc")
      return typeof t == "string" ? t : Sr(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let r = this.store;
    const n = () => {
      const a = r, s = this.store;
      gs(s, a) || (r = s, t.call(this, s, a));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, r) {
    let n = t();
    const a = () => {
      const s = n, o = t();
      gs(o, s) || (n = o, r.call(this, o, s));
    };
    return this.events.addEventListener("change", a), () => {
      this.events.removeEventListener("change", a);
    };
  }
  _validate(t) {
    if (!Y(this, Xe) || Y(this, Xe).call(this, t) || !Y(this, Xe).errors)
      return;
    const n = Y(this, Xe).errors.map(({ instancePath: a, message: s = "" }) => `\`${a.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Z.mkdirSync(se.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    const n = Y(this, xe);
    if (n) {
      const a = mt.randomBytes(16), s = mt.pbkdf2Sync(n, a, 1e4, 32, "sha512"), o = mt.createCipheriv(Y(this, Ye), s, a), c = Jn([o.update(Yn(r)), o.final()]), u = [a, Yn(":"), c];
      Y(this, Ye) === "aes-256-gcm" && u.push(o.getAuthTag()), r = Jn(u);
    }
    if (ie.env.SNAP)
      Z.writeFileSync(this.path, r, { mode: Y(this, _e).configFileMode });
    else
      try {
        ao(this.path, r, { mode: Y(this, _e).configFileMode });
      } catch (a) {
        if ((a == null ? void 0 : a.code) === "EXDEV") {
          Z.writeFileSync(this.path, r, { mode: Y(this, _e).configFileMode });
          return;
        }
        throw a;
      }
  }
  _watch() {
    if (this._ensureDirectory(), Z.existsSync(this.path) || this._write(Ve()), ie.platform === "win32" || ie.platform === "darwin") {
      Y(this, qe) ?? $e(this, qe, ei(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = se.dirname(this.path), r = se.basename(this.path);
      $e(this, Qe, Z.watch(t, { persistent: !1, encoding: "utf8" }, (n, a) => {
        a && a !== r || typeof Y(this, qe) == "function" && Y(this, qe).call(this);
      }));
    } else
      Y(this, qe) ?? $e(this, qe, ei(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), Z.watchFile(this.path, { persistent: !1 }, (t, r) => {
        typeof Y(this, qe) == "function" && Y(this, qe).call(this);
      }), $e(this, lt, !0);
  }
  _migrate(t, r, n) {
    let a = this._get(Qn, "0.0.0");
    const s = Object.keys(t).filter((c) => this._shouldPerformMigration(c, a, r));
    let o = structuredClone(this.store);
    for (const c of s)
      try {
        n && n(this, {
          fromVersion: a,
          toVersion: c,
          finalVersion: r,
          versions: s
        });
        const u = t[c];
        u == null || u(this), this._set(Qn, c), a = c, o = structuredClone(this.store);
      } catch (u) {
        this.store = o;
        const l = u instanceof Error ? u.message : String(u);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${l}`);
      }
    (this._isVersionInRangeFormat(a) || !it.eq(a, r)) && this._set(Qn, r);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [r, n] of Object.entries(t))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === Ke || t.startsWith(`${Ke}.`);
  }
  _isVersionInRangeFormat(t) {
    return it.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && it.satisfies(r, t) ? !1 : it.satisfies(n, t) : !(it.lte(t, r) || it.gt(t, n));
  }
  _get(t, r) {
    return $s(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    Et(n, t, r), this.store = n;
  }
}
Xe = new WeakMap(), xe = new WeakMap(), Ye = new WeakMap(), _e = new WeakMap(), be = new WeakMap(), Ze = new WeakMap(), Qe = new WeakMap(), lt = new WeakMap(), qe = new WeakMap(), oe = new WeakSet(), Ao = function(t) {
  const r = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (r.encryptionAlgorithm ?? (r.encryptionAlgorithm = Xi), !Cf(r.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...To].join(", ")}`);
  if (!r.cwd) {
    if (!r.projectName)
      throw new Error("Please specify the `projectName` option.");
    r.cwd = Qo(r.projectName, { suffix: r.projectSuffix }).config;
  }
  return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
}, jo = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const r = Gl.default, n = new Ol.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...t.ajvOptions
  });
  r(n);
  const a = {
    ...t.rootSchema,
    type: "object",
    properties: t.schema
  };
  $e(this, Xe, n.compile(a)), Ce(this, oe, qo).call(this, t.schema);
}, qo = function(t) {
  const r = Object.entries(t ?? {});
  for (const [n, a] of r) {
    if (!a || typeof a != "object" || !Object.hasOwn(a, "default"))
      continue;
    const { default: s } = a;
    s !== void 0 && (Y(this, be)[n] = s);
  }
}, Co = function(t) {
  t.defaults && Object.assign(Y(this, be), t.defaults);
}, ko = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, Do = function(t) {
  const r = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = r ? `.${r}` : "";
  return se.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
}, Lo = function(t) {
  if (t.migrations) {
    Ce(this, oe, Mo).call(this, t), this._validate(this.store);
    return;
  }
  const r = this.store, n = Object.assign(Ve(), t.defaults ?? {}, r);
  this._validate(n);
  try {
    vs.deepEqual(r, n);
  } catch {
    this.store = n;
  }
}, Mo = function(t) {
  const { migrations: r, projectVersion: n } = t;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    $e(this, Ze, !0);
    try {
      const a = this.store, s = Object.assign(Ve(), t.defaults ?? {}, a);
      try {
        vs.deepEqual(a, s);
      } catch {
        this._write(s);
      }
      this._migrate(r, n, t.beforeEachMigration);
    } finally {
      $e(this, Ze, !1);
    }
  }
};
const { app: Rr, ipcMain: es, shell: Df } = Zi;
let Bi = !1;
const Wi = () => {
  if (!es || !Rr)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Rr.getPath("userData"),
    appVersion: Rr.getVersion()
  };
  return Bi || (es.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Bi = !0), e;
};
class Lf extends kf {
  constructor(t) {
    let r, n;
    if (ie.type === "renderer") {
      const a = Zi.ipcRenderer.sendSync("electron-store-get-data");
      if (!a)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = a);
    } else es && Rr && ({ defaultCwd: r, appVersion: n } = Wi());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = se.isAbsolute(t.cwd) ? t.cwd : se.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Wi();
  }
  async openInEditor() {
    const t = await Df.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Ji = new Lf(), br = /* @__PURE__ */ new Map();
function Mf() {
  Ie.handle("shell:execute", async (e, t, r, n) => {
    var c, u;
    const a = Xo === "win32";
    let s;
    if (a)
      s = ys("cmd", ["/c", t, ...r], { cwd: n, shell: !0 });
    else {
      const l = r.map((i) => `'${i.replace(/'/g, "'\\''")}'`).join(" ");
      s = ys("bash", ["-c", `${t} ${l}`], { cwd: n });
    }
    const o = s.pid;
    return br.set(o, s), (c = s.stdout) == null || c.on("data", (l) => {
      e.sender.send("shell:output", { type: "stdout", data: l.toString() });
    }), (u = s.stderr) == null || u.on("data", (l) => {
      e.sender.send("shell:output", { type: "stderr", data: l.toString() });
    }), s.on("close", (l) => {
      br.delete(o), e.sender.send("shell:exit", { pid: o, code: l });
    }), s.on("error", (l) => {
      e.sender.send("shell:output", { type: "stderr", data: `Error: ${l.message}` });
    }), { pid: o, success: !0 };
  }), Ie.handle("shell:kill", async (e, t) => {
    const r = br.get(t);
    r && (r.kill(), br.delete(t));
  }), Ie.handle("fs:read", async (e, t) => Uo(t, "utf-8")), Ie.handle("fs:write", async (e, t, r) => {
    await Go(t, r, "utf-8");
  }), Ie.handle("fs:readDir", async (e, t) => (await Ko(t, { withFileTypes: !0 })).map((n) => ({
    name: n.name,
    isDirectory: n.isDirectory(),
    isFile: n.isFile()
  }))), Ie.handle("fs:exists", async (e, t) => {
    try {
      return await Ho(t), !0;
    } catch {
      return !1;
    }
  }), Ie.handle("dialog:openDirectory", async () => {
    const e = await Gr.showOpenDialog({
      properties: ["openDirectory"]
    });
    return e.canceled ? null : e.filePaths[0];
  }), Ie.handle("dialog:showSave", async (e, t) => {
    const r = await Gr.showSaveDialog(t);
    return r.canceled ? null : r.filePath;
  }), Ie.handle("dialog:message", async (e, t) => Gr.showMessageBox(t)), Ie.handle("settings:get", async (e, t) => Ji.get(t)), Ie.handle("settings:set", async (e, t, r) => {
    Ji.set(t, r);
  });
}
let ot = null;
function Yi() {
  ot = new Qi({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: ps(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    },
    title: "GSD UI"
  }), process.env.VITE_DEV_SERVER_URL ? (ot.loadURL(process.env.VITE_DEV_SERVER_URL), ot.webContents.openDevTools()) : ot.loadFile(ps(__dirname, "../dist/index.html")), ot.on("closed", () => {
    ot = null;
  });
}
Pr.whenReady().then(() => {
  Mf(), Yi(), Pr.on("activate", () => {
    Qi.getAllWindows().length === 0 && Yi();
  });
});
Pr.on("window-all-closed", () => {
  process.platform !== "darwin" && Pr.quit();
});
