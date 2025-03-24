                t[1][1] = Math.max(t[1][1], n[1][1]),
                t
            },
            intersects: function(t, n) {
                return !(t[1][0] < n[0][0] || n[1][0] < t[0][0] || t[1][1] < n[0][1] || n[1][1] < t[0][1])
            },
            contains: function(t, n) {
                return !(t[0][0] > n[0][0] || t[0][1] > n[0][1] || t[1][0] < n[1][0] || t[1][1] < n[1][1])
            },
            getBBox: function(t, e, r) {
                e = e || 0,
                r = r || t.children.length;
                for (var a, u = n.getDefaultBounds(), i = e; i < r; i++)
                    a = t.children[i],
                    n.extend(u, a.bbox);
                return u
            }
        };
        t(n)
    });
}
, function(ym) {
    ym.modules.define("util.querystring", [], function(e) {
        function n(e) {
            return "[object Array]" === Object.prototype.toString.call(e)
        }
        e({
            parse: function(e, o, t, r) {
                o = o || "&",
                t = t || "=",
                r = r || {};
                for (var i, p, f, s = r.decodeURIComponent || decodeURIComponent, u = {}, c = e.split(o), d = 0; d < c.length; ++d)
                    i = c[d].split(t),
                    p = s(i[0]),
                    f = s(i.slice(1).join(t)),
                    n(u[p]) ? u[p].push(f) : u.hasOwnProperty(p) ? u[p] = [u[p], f] : u[p] = f;
                return u
            },
            stringify: function(e, o, t, r) {
                o = o || "&",
                t = t || "=",
                r = r || {};
                var i, p, f = r.encodeURIComponent || encodeURIComponent, s = [];
                for (i in e)
                    if (e.hasOwnProperty(i))
                        if (p = e[i],
                        n(p))
                            if (r.joinArrays)
                                s.push(f(i) + t + f(p.join(",")));
                            else
                                for (var u = 0; u < p.length; ++u)
                                    "undefined" != typeof p[u] && s.push(f(i) + t + f(p[u]));
                        else
                            "undefined" != typeof p && s.push(f(i) + t + f(p));
                return s.join(o)
            }
        })
    });
}
, function(ym) {
    ym.modules.define("util.requireCenterAndZoom", ["util.margin", "util.bounds", "vow", "getZoomRange", "projection.wgs84Mercator"], function(e, o, r, n, t, i) {
        e(function(e, a, c, m) {
            var s = m || {};
            m = {
                inscribe: !s.hasOwnProperty("inscribe") || s.inscribe,
                preciseZoom: !!s.hasOwnProperty("preciseZoom") && s.preciseZoom,
                projection: s.hasOwnProperty("projection") ? s.projection : i
            };
            var l = null;
            s.hasOwnProperty("margin") && (l = o.correct(s.margin),
            c = [Math.max(c[0] - (l[1] + l[3]), 1), Math.max(c[1] - (l[0] + l[2]), 1)]);
            var p = n.defer()
              , u = m.projection
              , f = r.getCenterAndZoom(a, c, u, m)
              , h = f.center
              , g = f.zoom
              , b = "function" == typeof e.get ? e.get(h) : t(e, h);
            return b.then(function(e) {
                var o, r = Math.min(e[1], Math.max(e[0], g));
                if (r != g) {
                    o = u.toGlobalPixels(h, g);
                    var n = Math.pow(2, r - g);
                    o[0] *= n,
                    o[1] *= n,
                    g = r
                }
                l && (o || (o = u.toGlobalPixels(h, g)),
                o[0] += (l[1] - l[3]) / 2,
                o[1] += (l[2] - l[0]) / 2),
                o && (h = u.fromGlobalPixels(o, g)),
                p.resolve({
                    center: h,
                    zoom: g
                })
            }, function(e) {
                p.reject(e)
            }),
            p.promise()
        })
    });
}
, function(ym) {
    ym.modules.define("util.safeAccess", [], function(e) {
        e(function(e, n) {
            if (e instanceof Object) {
                var t = "."
                  , f = [];
                if ("string" == typeof n) {
                    if (n.indexOf(t) == -1)
                        return e[n];
                    f = n.split(t)
                } else
                    f = n;
                for (var i = 0, r = f.length; i < r; i++) {
                    if (!(e instanceof Object))
                        return;
                    e = e[f[i]]
                }
                return e
            }
        })
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.Group", ["util.defineClass", "util.scheduler.manager"], function(e, t, s) {
        function n() {
            this._taskStorage = {},
            this._onComplete = this._onScheduleComplete.bind(this)
        }
        t(n, {
            _onScheduleComplete: function(e) {
                this._taskStorage[e] && delete this._taskStorage[e]
            },
            schedule: function(e, t, n, o) {
                var u = s.schedule(e, t, n, o, {
                    onComplete: this._onComplete
                });
                return u.isCompleted() || (this._taskStorage[u.scheduleId] = u),
                u
            },
            unschedule: function(e, t, n) {
                return !!this.isScheduled(e, t, n) && s.unschedule(e, t, n)
            },
            isScheduled: function(e, t, n) {
                return this._taskStorage[s.getScheduleId(e, t, n)] || !1
            },
            removeAll: function() {
                var e = this._taskStorage;
                for (var t in e)
                    e.hasOwnProperty(t) && e[t].stop()
            }
        }),
        e(n)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.manager", ["util.id", "util.scheduler.strategy.storage", "util.scheduler.strategy.Timeout"], function(e, t, r, u) {
        function n(e) {
            var t = "string" == typeof e ? r.get(e) || r.get("scheduled") : e;
            if (ym.env.debug && !t)
                throw new Error("util.scheduler.manager.schedule: не передан strategy или " + e + " не определен");
            return t
        }
        var l = {}
          , d = {
            schedule: function(e, t, r, u, c) {
                if (ym.env.debug && !t)
                    throw new Error("imports.schedule: не передан callback");
                var o = n(e)
                  , i = d.getScheduleId(o, t, r)
                  , s = l[i];
                if (s)
                    return s;
                var g = new o(t,r,u);
                return g.onComplete = function() {
                    delete l[i],
                    c && c.onComplete && c.onComplete(i)
                }
                ,
                g.scheduleId = i,
                l[i] = g,
                g.start(),
                g
            },
            unschedule: function(e, t, r) {
                var u = d.getScheduleId(e, t, r)
                  , n = l[u];
                return !!n && (n.stop(),
                !0)
            },
            getScheduleId: function(e, r, u) {
                return e = n(e),
                t.get(e) + t.get(r) + (u ? t.get(u) : "null")
            },
            isScheduled: function(e, t, r) {
                var u = d.getScheduleId(e, t, r);
                return l[u] || !1
            }
        };
        e(d)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Asap", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.executeASAP", "util.scheduler.strategy.storage"], function(e, t, s, u, l) {
        function a() {
            var e = c;
            c = [],
            n = null;
            for (var t = 0, s = e.length; t < s; ++t)
                e[t].execute()
        }
        function r(e, t, s) {
            r.superclass.constructor.call(this, e, t, s)
        }
        var c = []
          , n = null;
        t(r, s, {
            start: function() {
                c.push(this),
                n || (n = u(a))
            }
        }),
        l.add("asap", r),
        e(r)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Background", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.timescheduler", "util.scheduler.strategy.storage"], function(e, t, a, n, s) {
        function u(e) {
            var t, a, s = Math.min(62, Math.max(16, n.reactionTime())), u = +new Date, r = e - d;
            if (u - h < 1e3 && (h = 0),
            Math.abs(r - s) < 10 || !h)
                for (; c.length && (t = u - e,
                t < s || !h); )
                    a = c.shift(),
                    a.execute() && (u = +new Date,
                    h = u);
            return d = +new Date,
            l = c.length > 0
        }
        function r() {
            l || (d = +new Date,
            n.add(u)),
            l = !0
        }
        function i(e, t, a) {
            i.superclass.constructor.call(this, e, t, a)
        }
        var c = []
          , l = !1
          , d = 0
          , h = 0;
        t(i, a, {
            start: function() {
                c.push(this),
                r()
            }
        }),
        s.add("background", i),
        e(i)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Base", ["util.scheduler.strategy.storage"], function(t) {
        function e(t, e, o) {
            this.options = {
                callback: t,
                context: e,
                params: o
            },
            this.completed = !1,
            this.stopped = !1
        }
        e.prototype = {
            reportTaskComplete: function() {
                this.onComplete && this.onComplete.call(this),
                this.completed = !0
            },
            execute: function(t) {
                return t || this.reportTaskComplete(),
                this.isStopped() || this.options.callback.call(this.options.context, this.options.params),
                this.options.callback
            },
            start: function() {
                throw new Error("StrategyBase.start: не определен")
            },
            stop: function() {
                this.stopped = !0,
                this.reportTaskComplete()
            },
            isStopped: function() {
                return this.stopped
            },
            isCompleted: function() {
                return this.completed
            }
        },
        t(e)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Now", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.strategy.storage"], function(t, e, s, u) {
        function l(t, e, s) {
            l.superclass.constructor.call(this, t, e, s)
        }
        e(l, s, {
            start: function() {
                this.execute()
            }
        }),
        u.add("now", l),
        t(l)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Processing", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.timescheduler", "util.scheduler.strategy.storage"], function(t, e, i, s, r) {
        function a(t, e, i) {
            if (a.superclass.constructor.call(this, t, e, i),
            this.startTime = 0,
            this.endTime = 0,
            this.duration = +(i.duration || i),
            this.completeCallback = i.onComplete,
            ym.env.debug && (+this.duration <= 0 || isNaN(+this.duration)))
                throw new Error("schedule: передан не верный duration(" + this.duration + ")")
        }
        e(a, i, {
            start: function() {
                s.add(this.execute, this)
            },
            execute: function(t) {
                if (this.isStopped())
                    return !1;
                this.endTime ? t = Math.min(t, this.endTime) : (this.startTime = t,
                this.endTime = t + this.duration);
                var e = t - this.startTime
                  , i = {
                    passed: e,
                    duration: this.duration,
                    progress: e / this.duration,
                    currentTime: t,
                    self: this
                };
                return this.options.params = i,
                a.superclass.execute.call(this, !0),
                t < this.endTime || (this.reportTaskComplete(),
                this.completeCallback && (this.options.context ? this.completeCallback.call(this.options.context) : this.completeCallback()),
                !1)
            }
        }),
        r.add("processing", a),
        t(a)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Raf", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.strategy.storage"], function(t, e, n, s) {
        function i(t, e, n) {
            i.superclass.constructor.call(this, t, e, n)
        }
        function o() {
            l = null;
            var t = +new Date
              , e = 0
              , n = a
              , s = u;
            a = [],
            u = [];
            for (var i = 0, h = n.length; i < h && (n[i].execute(),
            e++,
            !(+new Date - t > d)); ++i)
                ;
            for (var i = 0, h = s.length; i < h && (s[i].execute(),
            e++,
            !(+new Date - t > d)); ++i)
                ;
            r(n, s, e),
            l || !a.length && !u.length || (l = c(o))
        }
        function r(t, e, n) {
            return n < t.length ? void (a = t.slice(n).concat(e, a)) : (n -= t.length,
            void (n < e.length && (a = u.slice(n).concat(a))))
        }
        var a = []
          , u = []
          , l = null
          , c = window.requestAnimationFrame || window[ym.env.browser.cssPrefix.toLowerCase() + "RequestAnimationFrame"]
          , h = !0
          , d = 1 / 0;
        c || (h = !1,
        c = function(t) {
            return setTimeout(t, 25)
        }
        ),
        e(i, n, {
            start: function() {
                var t = this.options ? this.options.params : null;
                return t && !h && t.strictMode ? void this.execute() : (l || (l = c(o)),
                void (this.options && this.options.params && this.options.params.tailExecution ? u.push(this) : a.push(this)))
            }
        }),
        s.add("raf", i),
        t(i)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.storage", ["util.Storage"], function(e, t) {
        e(new t)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.strategy.Timeout", ["util.defineClass", "util.scheduler.strategy.Base", "util.scheduler.timescheduler", "util.scheduler.strategy.storage"], function(t, e, s, i, u) {
        function l(t, e, s) {
            if (l.superclass.constructor.call(this, t, e, s),
            this.startTime = 0,
            this.delay = s ? +(s.delay || s) : 0,
            ym.env.debug && (+this.delay <= 0 || isNaN(+this.delay)))
                throw new Error("schedule: передан не верный delay(" + this.delay + ")")
        }
        e(l, s, {
            start: function() {
                i.add(this.scheduleFunction, this)
            },
            scheduleFunction: function(t) {
                return !this.isStopped() && (this.startTime || (this.startTime = t + this.delay),
                this.startTime > t || (this.execute() || !1) && !1)
            }
        }),
        u.add("timeout", l),
        t(l)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.executeASAP", ["system.nextTick"], function(e, n) {
        e(function(e, c) {
            n(function() {
                e.call(c)
            })
        })
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.timescheduler", ["util.scheduler.strategy.Raf"], function(n, t) {
        function e() {
            function n() {
                for (var n = [], t = 0, e = m.length; e; ++t,
                --e)
                    m[t] && n.push(m[t]);
                m = n,
                T = 0
            }
            function e() {
                b && b.stop(),
                b = new t(c),
                b.start()
            }
            function c() {
                var t, i = 0, o = m.length;
                for (x++,
                M++,
                e(),
                S = +new Date,
                R = 1,
                t = 0; o; ++t,
                --o)
                    m[t] && (i++,
                    m[t].fn.call(m[t].context, S) === !1 && w(t));
                T > u && n(),
                !v && i && s(),
                g[D++] = S - W,
                W = S,
                D > r && (D = 0),
                a()
            }
            function a() {
                for (var n = 0, t = g, e = Math.ceil(r / 2), i = 1; i < e; i++) {
                    var o = D - i;
                    o < 0 && (o = Math.min(t.length - 1, r)),
                    n += t[o]
                }
                p = Math.round(n / e)
            }
            function f() {
                y = x,
                j = window.setTimeout(f, 10 * i)
            }
            function l(n, t) {
                m.push({
                    fn: n,
                    context: t
                }),
                v++,
                h()
            }
            function w(n) {
                m[n] = null,
                T++,
                v--
            }
            function h() {
                A || (g = [],
                D = 0,
                y = x - 1,
                R = 0,
                S = W = +new Date,
                e(),
                f(),
                A = 1),
                window.clearTimeout(k)
            }
            function s() {
                m = [],
                T = 0,
                v = 0,
                window.clearTimeout(k),
                k = window.setTimeout(d, o)
            }
            function d() {
                R = 0,
                A = 0,
                b && b.stop(),
                window.clearTimeout(k),
                window.clearTimeout(j)
            }
            var m = []
              , T = 0
              , v = 0
              , g = []
              , D = 0
              , p = 0
              , M = 0
              , x = 0
              , y = -1
              , A = 0
              , R = 0
              , S = +new Date
              , W = +new Date
              , b = 0
              , j = 0
              , k = 0;
            this.add = l,
            this.isActive = function() {
                return R
            }
            ,
            this.currentThesholdWindow = function() {
                return p
            }
            ,
            this.getSelfTime = function() {
                return R ? S : +new Date
            }
            ,
            this.reactionTime = function(n) {
                var t = R && p || i;
                return Math.min(n || t, t)
            }
        }
        var i = 6
          , o = 3e3
          , u = 100
          , r = 20;
        n(new e)
    });
}
, function(ym) {
    ym.modules.define("util.scheduler.world", ["event.Manager"], function(e, o) {
        var n = 0;
        e({
            events: new o,
            smoothMode: function(e) {
                e && !n && this.events.fire("smoothmodeenter"),
                n += e ? 1 : -1,
                e || n || this.events.fire("smoothmodeleave")
            },
            isInSmoothMode: function() {
                return n
            }
        })
    });
}
, function(ym) {
    ym.modules.define("util.shapeFactory", ["geometry.pixel.Rectangle", "geometry.pixel.Circle", "geometry.pixel.Polygon", "geometry.pixel.MultiPolygon", "shape.Rectangle", "shape.Circle", "shape.Polygon", "shape.MultiPolygon"], function(e, n, o, t, r, l, a, i, c) {
        var s = {
            create: function(e) {
                switch (e.type) {
                case "Rectangle":
                    return new l(new n(e.coordinates));
                case "Circle":
                    return new a(new o(e.coordinates,e.radius));
                case "Polygon":
                    return new i(new t(e.coordinates));
                case "MultiPolygon":
                    return new c(new r(e.coordinates))
                }
            }
        };
        e(s)
    });
}
, function(ym) {
    ym.modules.define("util.Storage", [], function(t) {
        var n = function() {
            this.hash = {}
        };
        n.prototype = {
            add: function(t, n) {
                return this.hash[t] = n,
                this
            },
            get: function(t) {
                return "string" == typeof t || t instanceof String ? this.hash[t] : t
            },
            remove: function(t) {
                return delete this.hash[t],
                this
            }
        },
        t(n)
    });
}
, function(ym) {
    ym.modules.define("util.tailThrottle", ["util.throttle"], function(t, n) {
        t(function(t, l, e) {
            return n(t, l, {
                context: e ? e.context : null,
                leading: !1,
                trailing: !0
            })
        })
    });
}
, function(ym) {
    ym.modules.define("util.throttle", ["util.extend"], function(t, e) {
        t(function(t, n, i) {
            function u() {
                n.apply(T || a, m)
            }
            function o() {
                clearTimeout(r),
                i.trailing && (f && clearTimeout(f),
                f = setTimeout(l, t),
                u()),
                r = 0
            }
            function l() {
                f = 0
            }
            function c() {
                m.length = arguments.length;
                for (var e = 0; e < m.length; ++e)
                    m[e] = arguments[e];
                a = this,
                r || (i.leading && !f ? u() : r = setTimeout(o, t),
                f && clearTimeout(f),
                f = setTimeout(l, t))
            }
            i = e({}, {
                leading: !0,
                trailing: !0
            }, i || {});
            var r, a, f = 0, m = [], T = i.context;
            return c.clear = function() {
                clearTimeout(r),
                clearTimeout(f),
                r = 0,
                f = 0
            }
            ,
            c.flush = function() {
                r && o()
            }
            ,
            c
        })
    });
}
, function(ym) {
    ym.modules.define("util.tile.Storage", ["event.Manager"], function(e, i) {
        function t(e) {
            this._tileZoom = e,
            this._rows = {},
            this._pendingTilesNumber = 0,
            this.events = new i({
                context: this
            })
        }
        t.prototype = {
            getTileZoom: function() {
                return this._tileZoom
            },
            get: function(e) {
                var i = this._rows[e[0]];
                return i ? i.list[e[1]] : null
            },
            add: function(e, i) {
                var t = this._rows[+e[0]] || (this._rows[+e[0]] = {
                    list: {},
                    count: 0
                });
                t.list[+e[1]] = i,
                t.count++,
                i.isReady() || (i.events.add("ready", this._onTileReady, this),
                i.events.add("loaded", this._onTileLoaded, this),
                i.events.add("loaderror", this._onTileLoadError, this),
                this._pendingTilesNumber++),
                this.events.fire("tileadd")
            },
            remove: function(e) {
                var i = this._rows[e[0]];
                if (i && i.list[e[1]]) {
                    var t = i.list[e[1]];
                    t.isReady() || (t.events.remove("ready", this._onTileReady, this),
                    t.events.remove("loaded", this._onTileLoaded, this),
                    t.events.remove("loaderror", this._onTileLoadError, this),
                    --this._pendingTilesNumber || this.events.fire("ready")),
                    i.list[e[1]] = null,
                    --i.count || (this._rows[e[0]] = null,
                    delete this._rows[e[0]]),
                    this.events.fire("tileremove")
                }
            },
            removeAll: function() {
                this.each(function(e) {
                    e.isReady() || (e.events.remove("ready", this._onTileReady, this),
                    e.events.remove("loaded", this._onTileLoaded, this),
                    e.events.remove("loaderror", this._onTileLoadError, this))
                }, this),
                this._rows = {},
                this._pendingTilesNumber = 0,
                this.events.fire("ready"),
                this.events.fire("tileremoveall")
            },
            each: function(e, i) {
                for (var t in this._rows)
                    if (this._rows[+t] && this._rows.hasOwnProperty(t)) {
                        var s = this._rows[+t].list;
                        for (var r in s)
                            s[+r] && s.hasOwnProperty(r) && e.call(i, s[r], [+t, +r])
                    }
            },
            getPendingTilesNumber: function() {
                return this._pendingTilesNumber
            },
            getTotalTilesNumber: function() {
                var e = 0;
                for (var i in this._rows)
                    e += this._rows[i].count;
                return e
            },
            _onTileReady: function(e) {
                var i = e.get("target");
                i.events.remove("ready", this._onTileReady, this),
                i.events.remove("loaded", this._onTileLoaded, this),
                i.events.remove("loaderror", this._onTileLoadError, this),
                --this._pendingTilesNumber || this.events.fire("ready"),
                this.events.fire("tileready", {
                    tile: i
                })
            },
            _onTileLoaded: function(e) {
                this.events.fire("statechange")
            },
            _onTileLoadError: function(e) {
                this.events.fire("tileloaderror", e)
            }
        },
        e(t)
    });
}
, function(ym) {
    ym.modules.define("util.tile.TreeStorage", ["util.defineClass", "event.Manager", "system.nextTick"], function(e, t, i, n) {
        function s(e) {
            this.events = new i({
                context: this
            }),
            this._zoom = 0,
            this._layers = {},
            this._pendingTilesCount = 0,
            this._viewport = [],
            this._container = e
        }
        function r() {
            return {
                list: {},
                count: 0,
                pendingCount: 0
            }
        }
        function o(e, t) {
            e.__fireAfter || (e.__fireAfter = {}),
            e.__fireAfter[t] || (e.__fireAfter[t] = !0,
            n(function() {
                delete e.__fireAfter[t],
                e.events.fire(t)
            }))
        }
        var h = 4;
        t(s, {
            setCurrentZoom: function(e) {
                this._zoom = e
            },
            getPendingCount: function(e) {
                var t = this._layers[e];
                return t ? t.pendingCount : 0
            },
            get: function(e) {
                var t = this._layers[e[2]];
                if (t) {
                    var i = t.list[e[0]];
                    if (i)
                        return i.list[e[1]]
                }
                return null
            },
            add: function(e, t) {
                var i = this._layers[e[2]] || (this._layers[e[2]] = r())
                  , n = i.list[e[0]] || (i.list[e[0]] = r());
                n.list[e[1]] && n.list[e[1]] !== t && this.remove(e),
                n.list[e[1]] = t,
                n.count++,
                i.count++,
                t.isDone() || (this._pendingTilesCount++,
                n.pendingCount++,
                i.pendingCount++),
                t.events.add("ready", this._onTileReady, this),
                t.events.add("statechange", this._onTileStateChange, this),
                t.events.add("remove", this._deleteTile, this),
                this._mergeParent(t, e),
                this._mergeChild(t, e)
            },
            remove: function(e) {
                this._inremove = 1;
                var t = this._layers[e[2]];
                if (t) {
                    var i = t.list[e[0]];
                    if (i) {
                        var n = i.list[e[1]];
                        n && (this._destroyTile(n, e),
                        delete i.list[e[1]],
                        --i.count || delete t.list[e[0]],
                        --t.count || delete this._layers[e[2]])
                    }
                }
                this._inremove = 0
            },
            _destroyTile: function(e, t) {
                e.__deleted = !0,
                e.events.remove("ready", this._onTileReady, this),
                e.events.remove("statechange", this._onTileStateChange, this),
                e.events.remove("remove", this._deleteTile, this),
                t && this._decrementPending(e, t),
                e.destroy()
            },
            _deleteTile: function(e) {
                var t = e.get("number");
                this.remove(t),
                this._onTileStateChange()
            },
            eachInZoom: function(e, t, i) {
                e = 0 | e;
                var n = this._layers[e] || 0;
                if (n) {
                    n = n.list;
                    for (var s in n)
                        if (n.hasOwnProperty(s)) {
                            s = 0 | s;
                            var r = n[s].list;
                            for (var o in r)
                                r.hasOwnProperty(o) && t.call(i, r[o], [s, 0 | o, e])
                        }
                }
            },
            each: function(e, t) {
                for (var i in this._layers)
                    this._layers.hasOwnProperty(i) && this.eachInZoom(+i, e, t)
            },
            removeAll: function() {
                this.each(function(e) {
                    this._destroyTile(e)
                }, this),
                this._layers = {},
                this._pendingTilesCount = 0,
                this.events.fire("ready")
            },
            _onTileReady: function(e) {
                var t = e.get("target")
                  , i = e.get("number")
                  , n = this._zoom
                  , s = this._container.isTransparent();
                if (t.isDone()) {
                    var r = this._getTilesUp(i);
                    if (r.length > 0 && (r.forEach(function(e) {
                        s && e.tileNumber[2] < n - h ? this.remove(e.tileNumber) : e.tile.onChildReady()
                    }, this),
                    this._mergeParent(t, i)),
                    i[2] >= n) {
                        var o = this._getTilesDown(i);
                        o.forEach(function(e) {
                            this.remove(e.tileNumber)
                        }, this)
                    }
                }
                this._decrementPending(t, i),
                this._onTileStateChange()
            },
            _idleState: function() {
                o(this, "idle")
            },
            _decrementPending: function(e, t) {
                if (!e.__done) {
                    e.__done = !0;
                    var i = this._layers[t[2]];
                    if (i) {
                        i.pendingCount--;
                        var n = i.list[t[0]];
                        n.pendingCount--,
                        i.pendingCount || t[2] != this._zoom || o(this, "ready")
                    }
                    --this._pendingTilesCount || this._idleState()
                }
            },
            _onTileStateChange: function(e) {
                e && e.get("target") && this._mergeParent(e.get("target"), e.get("number")),
                o(this, "statechange")
            },
            _getTilesUp: function(e, t) {
                var i = e[2] - 1
                  , n = t || []
                  , s = [e[0] >> 1, e[1] >> 1, i]
                  , r = this.get(s);
                return r && n.push({
                    tile: r,
                    tileNumber: s
                }),
                i > 0 && this._getTilesUp(s, n),
                n
            },
            _getTilesDown: function(e, t) {
                var i = e[2]
                  , n = [];
                return t = t || 32,
                this.each(function(s, r) {
                    var o = r[2] - i | 0;
                    o > 0 && o <= t && r[0] >> o === e[0] && r[1] >> o === e[1] && n.push({
                        tile: s,
                        tileNumber: r
                    })
                }, this),
                n
            },
            _mergeParent: function(e, t) {
                var i = this._getTilesUp(t)
                  , n = i[0];
                if (n) {
                    var s = n.tileNumber
                      , r = t[2] - s[2];
                    if (1 == r) {
                        var o = t[0] - 2 * s[0] + 2 * (t[1] - 2 * s[1]);
                        n.tile.joinChild(e, o),
                        n.tile.quadDivide(e, o)
                    }
                }
            },
            _mergeChild: function(e, t) {
                var i = this._getTilesDown(t, 1);
                i.forEach(function(i) {
                    var n = i.tileNumber
                      , s = n[0] - 2 * t[0] + 2 * (n[1] - 2 * t[1]);
                    e.joinChild(i.tile, s)
                })
            }
        }),
        e(s)
    });
}
, function(ym) {
    ym.modules.define("util.Time", ["util.defineClass"], function(t, u) {
        function n(t, u) {
            this._hours = t || 0,
            this._minutes = u || 0
        }
        function i(t) {
            var u = t.toString();
            return 1 === u.length && (u = "0" + u),
            u
        }
        var r = /^(\d{2}):(\d{2})(?::\d{2})?$/;
        u(n, {
            getHours: function() {
                return this._hours
            },
            getMinutes: function() {
                return this._minutes
            },
            isBefore: function(t) {
                var u = t.getHours();
                return this._hours < u || this._hours === u && this._minutes < t.getMinutes()
            },
            isAfter: function(t) {
                var u = t.getHours();
                return this._hours > u || this._hours === u && this._minutes > t.getMinutes()
            },
            equals: function(t) {
                return this._hours === t.getHours() && this._minutes === t.getMinutes()
            },
            isMidnight: function() {
                return this._hours + this._minutes === 0
            },
            getString: function() {
                return i(this._hours) + ":" + i(this._minutes)
            }
        }),
        n.parse = function(t) {
            var u = t.match(r);
            if (!u)
                return null;
            var i = Number(u[1]);
            if (i < 0 || i > 23)
                return null;
            var s = Number(u[2]);
            return s < 0 || s > 59 ? null : new n(i,s)
        }
        ,
        t(n)
    });
}
, function(ym) {
    ym.modules.define("util.tremorer", [], function(t) {
        var i, n;
        t({
            init: function(t, o) {
                i = t,
                n = o.get("position")
            },
            moved: function(t) {
                var o = t.get("position")
                  , e = Math.max(Math.abs(o[0] - n[0]), Math.abs(o[1] - n[1]));
                return e > i
            }
        })
    });
}
, function(ym) {
    ym.modules.define("util.vector", [], function(n) {
        var t = {
            length: function(n) {
                return Math.sqrt(n[0] * n[0] + n[1] * n[1])
            },
            length2: function(n) {
                return n[0] * n[0] + n[1] * n[1]
            },
            dot: function(n, t) {
                return n[0] * t[0] + n[1] * t[1]
            },
            cross: function(n, t) {
                return n[0] * t[1] - n[1] * t[0]
            },
            sub: function(n, t) {
                return [n[0] - t[0], n[1] - t[1]]
            },
            add: function(n, t) {
                return [n[0] + t[0], n[1] + t[1]]
            },
            mul: function(n, t) {
                return [n[0] * t[0], n[1] * t[1]]
            },
            div: function(n, t) {
                return [n[0] / t[0], n[1] / t[1]]
            },
            scale: function(n, t) {
                return [n[0] * t, n[1] * t]
            },
            normalize: function(n, r) {
                return r = 1 / (r || t.length(n)),
                [n[0] * r, n[1] * r]
            }
        };
        n(t)
    });
}
, function(ym) {
    ym.modules.define("util.WeakMap", ["util.defineClass", "util.id"], function(e, t, i) {
        if ("undefined" == typeof WeakMap) {
            var n = function() {
                this._id = "__ymaps_WeakMap__" + i.get(this)
            };
            return t(n, {
                set: function(e, t) {
                    var i = e[this._id];
                    return i && i[0] === e ? i[1] = t : Object.defineProperty(e, this._id, {
                        value: [e, t],
                        writable: !0
                    }),
                    this
                },
                get: function(e) {
                    var t;
                    return (t = e[this._id]) && t[0] === e ? t[1] : void 0
                },
                remove: function(e) {
                    var t = e[this._id];
                    if ("undefined" == typeof t)
                        return !1;
                    var i = t[0] === e;
                    return t[0] = t[1] = void 0,
                    i
                },
                "delete": function(e) {
                    return this.remove(e)
                },
                has: function(e) {
                    var t = e[this._id];
                    return "undefined" != typeof t && t[0] === e
                }
            }),
            e(n)
        }
        var r = function() {
            this._storage = new window.WeakMap
        };
        t(r, {
            set: function(e, t) {
                return this._storage.set(e, t),
                this
            },
            get: function(e) {
                return this._storage.get(e)
            },
            remove: function(e) {
                return this._storage["delete"](e)
            },
            "delete": function(e) {
                return this.remove(e)
            },
            has: function(e) {
                return this._storage.has(e)
            }
        }),
        e(r)
    });
}
, function(ym) {
    ym.modules.define("vectorEngine.collectStatistics", [], function(e) {
        e(function() {
            ym.supports.vector.isSupported() || ym.count("error", {
                path: ["vectorEngine.vectorNotSupported", ym.env.browser.platform, ym.env.browser.name].join("."),
                share: .01
            })
        })
    });
}
, function(ym) {
    ym.modules.define("vectorEngine.CustomLayer", ["vectorEngine.loadEngine"], function(e, n) {
        var r = n().then(function() {
            return ym.modules.require(["vectorEngine.implementation.VectorCustomLayer"])
        }).spread(function(e) {
            return e
        });
        e.async(r)
    });
}
, function(ym) {
    ym.modules.define("vectorEngine.VectorHotspotLayer", ["vectorEngine.loadEngine", "vow"], function(e, n, o) {
        var t = n().then(function() {
            return ym.modules.require(["vectorEngine.implementation.exports"])
        }).spread(function(e) {
            return e.VectorHotspotLayer
        });
        e.async(t)
    });
}
, function(ym) {
    ym.modules.define("vectorEngine.VectorMapLayer", ["vectorEngine.loadEngine", "vow"], function(e, n, r) {
        var o = n().then(function() {
            return ym.modules.require(["vectorEngine.implementation.VectorMapLayer"])
        }).spread(function(e) {
            return e
        });
        e.async(o)
    });
}
, function(ym) {
    ym.modules.define("vectorEngine.TrafficLayer", ["vectorEngine.loadEngine", "vow"], function(e, n, r) {
        var i = n().then(function() {
            return ym.modules.require(["vectorEngine.implementation.VectorTrafficLayer"])
        }).spread(function(e) {
            return e
        });
        e.async(i)
    });
}
, function(ym) {
    ym.modules.define("vendor.jsep", [], function(e) {
        var r = {}
          , t = {
            exports: r
        };
        !function(e) {
            "use strict";
            var n = "Compound"
              , o = "Identifier"
              , i = "MemberExpression"
              , a = "Literal"
              , u = "ThisExpression"
              , s = "CallExpression"
              , p = "UnaryExpression"
              , f = "BinaryExpression"
              , c = "LogicalExpression"
              , l = "ConditionalExpression"
              , d = "ArrayExpression"
              , h = 46
              , v = 44
              , x = 39
              , y = 34
              , m = 40
              , b = 41
              , g = 91
              , E = 93
              , w = 63
              , C = 59
              , O = 58
              , U = function(e, r) {
                var t = new Error(e + " at character " + r);
                throw t.index = r,
                t.description = e,
                t
            }
              , k = !0
              , j = {
                "-": k,
                "!": k,
                "~": k,
                "+": k
            }
              , A = {
                "||": 1,
                "&&": 2,
                "|": 3,
                "^": 4,
                "&": 5,
                "==": 6,
                "!=": 6,
                "===": 6,
                "!==": 6,
                "<": 7,
                ">": 7,
                "<=": 7,
                ">=": 7,
                "<<": 8,
                ">>": 8,
                ">>>": 8,
                "+": 9,
                "-": 9,
                "*": 10,
                "/": 10,
                "%": 10
            }
              , P = function(e) {
                var r, t = 0;
                for (var n in e)
                    (r = n.length) > t && e.hasOwnProperty(n) && (t = r);
                return t
            }
              , S = P(j)
              , B = P(A)
              , L = {
                "true": !0,
                "false": !1,
                "null": null
            }
              , M = "this"
              , q = function(e) {
                return A[e] || 0
            }
              , J = function(e, r, t) {
                var n = "||" === e || "&&" === e ? c : f;
                return {
                    type: n,
                    operator: e,
                    left: r,
                    right: t
                }
            }
              , F = function(e) {
                return e >= 48 && e <= 57
            }
              , I = function(e) {
                return 36 === e || 95 === e || e >= 65 && e <= 90 || e >= 97 && e <= 122 || e >= 128 && !A[String.fromCharCode(e)]
            }
              , T = function(e) {
                return 36 === e || 95 === e || e >= 65 && e <= 90 || e >= 97 && e <= 122 || e >= 48 && e <= 57 || e >= 128 && !A[String.fromCharCode(e)]
            }
              , V = function(e) {
                for (var r, t, f = 0, c = e.charAt, k = e.charCodeAt, P = function(r) {
                    return c.call(e, r)
                }, V = function(r) {
                    return k.call(e, r)
                }, z = e.length, D = function() {
                    for (var e = V(f); 32 === e || 9 === e || 10 === e || 13 === e; )
                        e = V(++f)
                }, G = function() {
                    var e, r, t = K();
                    return D(),
                    V(f) !== w ? t : (f++,
                    e = G(),
                    e || U("Expected expression", f),
                    D(),
                    V(f) === O ? (f++,
                    r = G(),
                    r || U("Expected expression", f),
                    {
                        type: l,
                        test: t,
                        consequent: e,
                        alternate: r
                    }) : void U("Expected :", f))
                }, H = function() {
                    D();
                    for (var r = e.substr(f, B), t = r.length; t > 0; ) {
                        if (A.hasOwnProperty(r))
                            return f += t,
                            r;
                        r = r.substr(0, --t)
                    }
                    return !1
                }, K = function() {
                    var e, r, t, n, o, i, a, u;
                    if (i = N(),
                    r = H(),
                    !r)
                        return i;
                    for (o = {
                        value: r,
                        prec: q(r)
                    },
                    a = N(),
                    a || U("Expected expression after " + r, f),
                    n = [i, o, a]; (r = H()) && (t = q(r),
                    0 !== t); ) {
                        for (o = {
                            value: r,
                            prec: t
                        }; n.length > 2 && t <= n[n.length - 2].prec; )
                            a = n.pop(),
                            r = n.pop().value,
                            i = n.pop(),
                            e = J(r, i, a),
                            n.push(e);
                        e = N(),
                        e || U("Expected expression after " + r, f),
                        n.push(o, e)
                    }
                    for (u = n.length - 1,
                    e = n[u]; u > 1; )
                        e = J(n[u - 1].value, n[u - 2], e),
                        u -= 2;
                    return e
                }, N = function() {
                    var r, t, n;
                    if (D(),
                    r = V(f),
                    F(r) || r === h)
                        return Q();
                    if (r === x || r === y)
                        return R();
                    if (r === g)
                        return $();
                    for (t = e.substr(f, S),
                    n = t.length; n > 0; ) {
                        if (j.hasOwnProperty(t))
                            return f += n,
                            {
                                type: p,
                                operator: t,
                                argument: N(),
                                prefix: !0
                            };
                        t = t.substr(0, --n)
                    }
                    return !(!I(r) && r !== m) && Y()
                }, Q = function() {
                    for (var e, r, t = ""; F(V(f)); )
                        t += P(f++);
                    if (V(f) === h)
                        for (t += P(f++); F(V(f)); )
                            t += P(f++);
                    if (e = P(f),
                    "e" === e || "E" === e) {
                        for (t += P(f++),
                        e = P(f),
                        "+" !== e && "-" !== e || (t += P(f++)); F(V(f)); )
                            t += P(f++);
                        F(V(f - 1)) || U("Expected exponent (" + t + P(f) + ")", f)
                    }
                    return r = V(f),
                    I(r) ? U("Variable names cannot start with a number (" + t + P(f) + ")", f) : r === h && U("Unexpected period", f),
                    {
                        type: a,
                        value: parseFloat(t),
                        raw: t
                    }
                }, R = function() {
                    for (var e, r = "", t = P(f++), n = !1; f < z; ) {
                        if (e = P(f++),
                        e === t) {
                            n = !0;
                            break
                        }
                        if ("\\" === e)
                            switch (e = P(f++)) {
                            case "n":
                                r += "\n";
                                break;
                            case "r":
                                r += "\r";
                                break;
                            case "t":
                                r += "\t";
                                break;
                            case "b":
                                r += "\b";
                                break;
                            case "f":
                                r += "\f";
                                break;
                            case "v":
                                r += "\x0B";
                                break;
                            default:
                                r += e
                            }
                        else
                            r += e
                    }
                    return n || U('Unclosed quote after "' + r + '"', f),
                    {
                        type: a,
                        value: r,
                        raw: t + r + t
                    }
                }, W = function() {
                    var r, t = V(f), n = f;
                    for (I(t) ? f++ : U("Unexpected " + P(f), f); f < z && (t = V(f),
                    T(t)); )
                        f++;
                    return r = e.slice(n, f),
                    L.hasOwnProperty(r) ? {
                        type: a,
                        value: L[r],
                        raw: r
                    } : r === M ? {
                        type: u
                    } : {
                        type: o,
                        name: r
                    }
                }, X = function(e) {
                    for (var r, t, o = [], i = !1; f < z; ) {
                        if (D(),
                        r = V(f),
                        r === e) {
                            i = !0,
                            f++;
                            break
                        }
                        r === v ? f++ : (t = G(),
                        t && t.type !== n || U("Expected comma", f),
                        o.push(t))
                    }
                    return i || U("Expected " + String.fromCharCode(e), f),
                    o
                }, Y = function() {
                    var e, r;
                    for (e = V(f),
                    r = e === m ? Z() : W(),
                    D(),
                    e = V(f); e === h || e === g || e === m; )
                        f++,
                        e === h ? (D(),
                        r = {
                            type: i,
                            computed: !1,
                            object: r,
                            property: W()
                        }) : e === g ? (r = {
                            type: i,
                            computed: !0,
                            object: r,
                            property: G()
                        },
                        D(),
                        e = V(f),
                        e !== E && U("Unclosed [", f),
                        f++) : e === m && (r = {
                            type: s,
                            arguments: X(b),
                            callee: r
                        }),
                        D(),
                        e = V(f);
                    return r
                }, Z = function() {
                    f++;
                    var e = G();
                    return D(),
                    V(f) === b ? (f++,
                    e) : void U("Unclosed (", f)
                }, $ = function() {
                    return f++,
                    {
                        type: d,
                        elements: X(E)
                    }
                }, _ = []; f < z; )
                    r = V(f),
                    r === C || r === v ? f++ : (t = G()) ? _.push(t) : f < z && U('Unexpected "' + P(f) + '"', f);
                return 1 === _.length ? _[0] : {
                    type: n,
                    body: _
                }
            };
            if (V.version = "0.3.3",
            V.toString = function() {
                return "JavaScript Expression Parser (JSEP) v" + V.version
            }
            ,
            V.addUnaryOp = function(e) {
                return S = Math.max(e.length, S),
                j[e] = k,
                this
            }
            ,
            V.addBinaryOp = function(e, r) {
                return B = Math.max(e.length, B),
                A[e] = r,
                this
            }
            ,
            V.addLiteral = function(e, r) {
                return L[e] = r,
                this
            }
            ,
            V.removeUnaryOp = function(e) {
                return delete j[e],
                e.length === S && (S = P(j)),
                this
            }
            ,
            V.removeAllUnaryOps = function() {
                return j = {},
                S = 0,
                this
            }
            ,
            V.removeBinaryOp = function(e) {
                return delete A[e],
                e.length === B && (B = P(A)),
                this
            }
            ,
            V.removeAllBinaryOps = function() {
                return A = {},
                B = 0,
                this
            }
            ,
            V.removeLiteral = function(e) {
                return delete L[e],
                this
            }
            ,
            V.removeAllLiterals = function() {
                return L = {},
                this
            }
            ,
            "undefined" == typeof r) {
                var z = e.jsep;
                e.jsep = V,
                V.noConflict = function() {
                    return e.jsep === V && (e.jsep = z),
                    V
                }
            } else
                "undefined" != typeof t && t.exports ? r = t.exports = V : r.parse = V
        }(this),
        e(t.exports)
    });
}
, function(ym) {
    ym.modules.define("vow", [], function(o) {
        o(ym.vow)
    });
}
, function(ym) {
    ym.modules.define("yandex.searchToGeocodeConverter", ["util.array", "util.extend"], function(e, t, o) {
        var a = {
            convert: function(e) {
                var t = e.data.properties.ResponseMetaData;
                return {
                    GeoObjectCollection: {
                        metaDataProperty: this.getGeocodeMetaData(o({}, t.SearchRequest, t.SearchResponse), !0),
                        featureMember: this.getGeocodeResults(e.data.features)
                    }
                }
            },
            getGeocodeMetaData: function(e, t) {
                var o, a = t ? "GeocoderResponseMetaData" : "GeocoderMetaData", r = {};
                r[a] = {},
                o = r[a];
                for (var n in e) {
                    var i = e[n];
                    "number" == typeof i && (i = i.toString()),
                    o[n] = i
                }
                return r
            },
            getGeocodeResults: function(e) {
                var o = [];
                return t.each(e, function(e) {
                    o.push(this.getGeocodeResult(e))
                }, this),
                o
            },
            getGeocodeResult: function(e) {
                var t = e.properties;
                return {
                    GeoObject: {
                        metaDataProperty: this.getGeocodeMetaData(t.GeocoderMetaData),
                        description: t.description,
                        name: t.name,
                        boundedBy: this.getGeocodeBounds(t.boundedBy),
                        Point: this.getGeocodePointPos(e.geometry),
                        uriMetaData: t.URIMetaData
                    }
                }
            },
            getGeocodeBounds: function(e) {
                return {
                    Envelope: {
                        lowerCorner: e[0].join(" "),
                        upperCorner: e[1].join(" ")
                    }
                }
            },
            getGeocodePointPos: function(e) {
                return {
                    pos: e.coordinates.join(" ")
                }
            }
        };
        e(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.counterStorage", ["util.Storage"], function(i, e) {
        var s = new e
          , o = .01;
        s.add("control", {
            pid: 443,
            cid: 72722,
            options: {
                share: o,
                useVersionPrefix: !0,
                useCustomPrefix: !0
            }
        }).add("modulesUsage", {
            pid: 443,
            cid: 72724,
            options: {
                share: o,
                useVersionPrefix: !0,
                useCustomPrefix: !0
            }
        }).add("map", {
            pid: 443,
            cid: 72717,
            options: {
                share: o,
                useCustomPrefix: !0
            }
        }).add("distribution", {
            pid: 443,
            cid: 72793,
            options: {
                useCustomPrefix: !0
            }
        }).add("business_search", {
            pid: 443,
            cid: 72688,
            options: {
                useCustomPrefix: !0
            }
        }).add("violators", {
            pid: 443,
            cid: 72959,
            options: {
                share: o
            }
        }).add("error", {
            pid: 443,
            cid: 72961,
            options: {
                useVersionPrefix: !0,
                useCustomPrefix: !0
            }
        }),
        i(s)
    });
}
, function(ym) {
    ym.modules.define("yandex.counter", ["util.extend", "yandex.counterStorage"], function(t, e, n) {
        function r() {
            o.countByKey.apply(o, arguments)
        }
        var i = "all" == ym.env.counters ? 0 : Math.random()
          , o = {
            count: function(t, e) {
                var n, r, i, o = (new Date).getTime() + Math.round(100 * Math.random());
                "string" == typeof e ? n = e : (e = e || {},
                n = e.path,
                r = e.redirectUrl,
                i = e.additionalParams),
                n && (e.useVersionPrefix && (n = this.versionPrefix + "." + n),
                e.useCustomPrefix && ym.env.server.params.counter_prefix && (n = ym.env.server.params.counter_prefix + "." + n),
                t += "/path=" + n),
                i && (t += i),
                (r || "undefined" == typeof r) && (r = r || ym.env.hosts.api.maps,
                t += "/rnd=" + o,
                t += "/*" + r),
                this._count(t, e)
            },
            statfaceCount: function(t, e, n) {
                var r = ym.env.hosts.api.statCounter + "counter/dtype=stred/pid=" + t + "/cid=" + e;
                this.count(r, n)
            },
            directCount: function(t, e) {
                this._count(t, e)
            },
            countByKey: function(t, r) {
                var i = n.get(t);
                switch ("string" == typeof r && (r = {
                    path: r
                }),
                i.type) {
                case "direct":
                    this.directCount(i.url);
                    break;
                default:
                case "statface":
                    this.statfaceCount(i.pid, i.cid, e({}, i.options, r))
                }
            },
            versionPrefix: ym.env.version.replace(/\W/g, "_"),
            isActiveCounter: function(t) {
                return this._isActive(n.get(t))
            },
            _isActive: function(t) {
                var e = t && "undefined" != typeof t.share ? t.share : 1;
                return i < e
            },
            _count: function(t, e) {
                if (this._isActive(e)) {
                    var n = new Image;
                    ym.__mock__["yandex.counter"] ? n = ym.__mock__["yandex.counter"].intercept(n, t) : n.src = t
                }
            }
        };
        r.active = function(t) {
            return o.isActiveCounter(t)
        }
        ,
        ym.count.provideImplementation(function(t) {
            for (var e = 0; e < t.length; e++)
                r.apply(null, t[e]);
            return r
        });
        try {
            window.parent && window.parent.WebUI && o.countByKey("violators", {
                path: "intranet.1C.2_1",
                share: 1,
                useCustomPrefix: !0
            })
        } catch (a) {}
        t(o)
    });
}
, function(ym) {
    ym.modules.define("yandex.coverage.selfDataArea", ["regions.decode", "geometry.component.pointInPolygon", "geometry.component.findClosestPathPosition", "projection.wgs84Mercator", "geometry.component.ShortestPath"], function(e, t, o, r, n, a) {
        function f(e) {
            for (var t = [], o = n.isCycled(), r = new a, f = 0, l = e.length; f < l; ++f) {
                for (var i = e[f], s = [], P = 0, p = i.length; P < p; ++P)
                    s[P] = n.toGlobalPixels(i[P], 0);
                var v = r.calculate(s, o);
                t.push(v)
            }
            return t
        }
        var l = {
            Yandex: {
                data: ["IzgYAgBrRfVLwqQE_5S6CiSeJ50snTqaNpc6lz2WQJdDlj6VO5U9lEeTTpJLkU-PXJFmkGmQcJBxknuSfpSFk4iTjZORk5SSpparla2VspS2lb6UwpXFlMmUzpXNldGWzZfMmcebyZ7HoMShxKLLpsmoyqnRqNKn1KXZpNyk5aXnpeqm76f1qfar9637sPqw-bH1sO6r3qfYqNSp1KrQq8yuza7Rr9au2q_lsea25LbituG137bht-S35rnpuuq67LvuvPC88L3yvfO-8r_zwPXA9sH4wvvD_MT6xvvG_Mf-yP_K_cz5zfnP9tDz0e3Q59Dm1OPV5Nbp1-ba4tzb3Nfc3d3c3tnf2-Db4eLj3unW7Nfu1vDW8tPz0vPT8c_x0PTO9dH20vjQ_Mz_zADCBMAEvwa5CLUItwe0B7QGrgasBbADtAKzAbEAsf-u_qX_pACj_6H-ov2e-5P4l_eQ9ITzffN68nTzcfFq8WrwYvBE60brS-xT7FTtX-1f7nftge6I7ozwlfKX8Z7wne-V7ZHuju6M64_ojuV24Hjic-J0427kcORz5HTlUOZT5UvlQ-VA5UPlP-Rf5GLkT-Mz4C3eLd0q3C3cMd063D3dPN5P30vcUtxY2mnZbtds1WnVaNVk1VnUVtNa0FTOVcxby1rJYchlxl_FW8VXxFnDXMJdwVa_U71PvEe8SLo8ujq4MLkpuCO2H7YhtR20GbQVtBS0DLUOtAmyFLIMsQ6uAKwDqwmrE6gNphemFqUcpR2lLKUvpDejPaQ-pUalRaM4oTWiMKEjoh-jHqMUohaiG6IWoBegHp4jniSe"],
                epsilon: .5,
                ID: "RUBK",
                label: "Yandex"
            },
            Basharsoft: {
                data: ["ZmMiAvfzhgEfU4UC0pSrAvMk5yXfLdo53T7XR-9X_Gb5eP99-4Hwgu2F8YntjeCQ45Tam9ij0arYt9LB5NDd1-HZ3eHj4uPl4OTK8MLxuO6p8Kb5mP-c_Y76jPV2-Wb4ZPtS90v9QPw7_zX_Nv0t-DP3OPg89jbyPuQ14TPeO90y0zTJJb0itSOuLKggniGYKJMbkRGTEI8IjwCMBYoHhRaEFYAfeQtxAGAIWBVUIEohRQhCCj0FNw41CDEeJhofIx0eGx8XJBYrGC0VSBJOFFMTXQhqCXIIdg1_Do8LjgShBKsAswbCBMIHygrWCdsN7Ar3E_gW8Rr0HvMk"],
                epsilon: .1,
                ID: "TR",
                label: "Basharsoft"
            }
        };
        for (var i in l)
            if (l.hasOwnProperty(i)) {
                for (var s = [], P = l[i].data, p = 0, v = P.length; p < v; ++p)
                    s[p] = t.coordinate(P[p], 255, 1);
                l[i].coordinates = s,
                l[i].geometry = f(s)
            }
        e({
            getAreas: function() {
                return l
            },
            testPoint: function(e) {
                var e = n.toGlobalPixels(e, 0);
                for (var t in l)
                    if (l.hasOwnProperty(t)) {
                        var a = l[t]
                          , f = a.geometry;
                        if (o(e, f, "nonZero", !1)) {
                            for (var i = 0, s = 0; s < f.length; ++s) {
                                var P = r(f[s], e).distance;
                                if (P < a.epsilon) {
                                    i = 1;
                                    break
                                }
                            }
                            if (!i)
                                return a
                        }
                    }
                return !1
            }
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.coverage", ["util.jsonp", "yandex.coverage.selfDataArea"], function(e, r, n) {
        function o(e) {
            var r = function(n) {
                var o = r.deferreds || []
                  , t = n && "success" == n.status;
                if (t)
                    for (var a = n.data, d = 0, i = o.length; d < i; d++)
                        o[d].resolve(a);
                else
                    for (var s = new Error(n && n.error), d = 0, i = o.length; d < i; d++)
                        o[d].reject(s);
                e()
            };
            return r.deferreds = [],
            r
        }
        var t = function(e) {
            return e.replace(/[^\w\d_]/g, "_")
        }
          , a = {
            getLayersInfo: function(e, n, a, d, i) {
                var s = ["l=" + e.join(","), "ll=" + n[0].toFixed(8) + "," + n[1].toFixed(8), "z=" + Math.round(a), "lang=" + ym.env.lang];
                if (d && s.push("spn=" + d[0].toFixed(8) + "," + d[1].toFixed(8)),
                ym.env.dataProvider && s.push("data_provider=" + ym.env.dataProvider),
                ym.env.dataPrestable && s.push("experimental_dataprestable=1"),
                i)
                    for (var v in i)
                        i.hasOwnProperty(v) && s.push(v + "=" + encodeURIComponent(i[v]));
                var u = s.join("&")
                  , f = "jsonp_yandex_coverage__" + t(u);
                window[f] || (window[f] = o(function() {
                    try {
                        window[f] = void 0,
                        delete window[f]
                    } catch (e) {}
                }),
                r({
                    url: ym.env.hosts.api.services.coverage + "v2/?" + u,
                    padding: f,
                    postprocessUrl: function(e) {
                        return ym.env.hostConfigQuery ? e + "&" + ym.env.hostConfigQuery : e
                    }
                }));
                var c = ym.vow.defer();
                return window[f].deferreds.push(c),
                c.promise()
            },
            isInSelfDataArea: function(e) {
                return n.testPoint(e)
            }
        };
        e(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.dataProvider", ["yandex.coverage", "vow", "util.extend"], function(e, r, n, t) {
        var l, i = {}, s = {}, a = {
            getLayersInfo: function(e, r, a, o, u) {
                var x, g = e.slice().sort(), A = u || {}, m = v(r, a, o, A), w = m.id, z = {
                    layerAliases: g,
                    deferred: n.defer()
                };
                return l && l.id == w && c(l.layerAliases, g) && h(l.extended, A) ? f(z, l.data) : (x = y(w, g, A)) ? s[w].list[x].listeners.push(z) : i[w] ? (i[w].listeners.push(z),
                p(i[w].layerAliases, g),
                t(i[w].extended, A)) : d(w, {
                    ll: m.ll,
                    z: m.z,
                    spn: m.spn,
                    listeners: [z],
                    layerAliases: g.slice(),
                    extended: A
                }),
                z.deferred.promise()
            }
        }, d = function(e, r) {
            i[e] = r,
            window.setTimeout(function() {
                var r = i[e].layerAliases.join(",");
                s[e] || (s[e] = {
                    list: {},
                    count: 0
                }),
                s[e].list[r] = i[e],
                s[e].count++,
                delete i[e],
                o(e, r)
            }, 0)
        }, o = function(e, n) {
            var t = s[e].list[n];
            r.getLayersInfo(t.layerAliases, t.ll, t.z, t.spn, t.extended).then(function(r) {
                u(e, n, r)
            })
        }, f = function(e, r) {
            for (var n = {}, t = 0, l = e.layerAliases.length; t < l; t++) {
                var i = e.layerAliases[t];
                n[i] = r[i] || {}
            }
            e.deferred.resolve(n)
        }, u = function(e, r, n) {
            var t = s[e] && s[e].list[r];
            if (t) {
                var i = {};
                delete s[e].list[r],
                --s[e].count || delete s[e];
                for (var a = 0, d = n.length; a < d; a++)
                    i[n[a].id] = n[a];
                l = {
                    id: e,
                    layerAliases: t.layerAliases,
                    extended: t.extended,
                    data: i
                };
                for (var o = 0, u = t.listeners.length; o < u; o++)
                    f(t.listeners[o], i)
            }
        }, v = function(e, r, n, t) {
            r = Math.max(0, Math.round(r)),
            "longlat" != ym.env.coordinatesOrder && (e = [e[1], e[0]]);
            var l = n ? "&spn=" + n[0].toFixed(8) + "," + n[1].toFixed(8) : "";
            return {
                ll: e,
                z: r,
                spn: n,
                extended: t,
                id: "ll=" + e[0].toFixed(8) + "," + e[1].toFixed(8) + "&z=" + r + l
            }
        }, y = function(e, r, n) {
            var t = s[e] && s[e].list;
            if (t)
                for (var l in t)
                    if (t.hasOwnProperty(l) && c(t[l].layerAliases, r) && h(t[l].extended, n))
                        return l;
            return null
        }, c = function(e, r) {
            for (var n = 0, t = 0, l = e.length, i = r.length; n < l && t < i; )
                if (e[n] < r[t])
                    n++;
                else {
                    if (e[n] != r[t])
                        return !1;
                    n++,
                    t++
                }
            return t == i
        }, h = function(e, r) {
            if (!r)
                return !0;
            for (var n in r)
                if (r.hasOwnProperty(n) && (!e.hasOwnProperty(n) || e[n] != r[n]))
                    return !1;
            return !0
        }, p = function(e, r) {
            for (var n = 0, t = 0, l = e.length, i = r.length, s = []; n < l && t < i; )
                e[n] < r[t] ? n++ : e[n] == r[t] ? (n++,
                t++) : (s.push(r[t]),
                t++);
            for (; t < i; t++)
                s.push(r[t]);
            [].push.apply(e, s),
            e.sort()
        };
        e(a)
    });
}
, function(ym) {
    ym.modules.define({
        name: "yandex.geocodeProvider.map",
        key: "yandex#map",
        storage: "yandex.geocodeProvider",
        depends: ["yandex.searchToGeocodeConverter", "yandex.suggest.provider", "GeocodeResult", "geoXml.parser.ymapsml.geoObjects", "projection.wgs84Mercator", "util.jsonp", "util.bounds", "util.array", "util.safeAccess", "util.coordinates.reverse", "vow", "error", "geocoderDefaultBalloonContent"],
        declaration: function(e, r, o, t, s, n, a, i, d, c, u, l, p, g) {
            var y = {
                house: "0.005,0.005",
                street: "0.005,0.005",
                metro: "0.5,0.5",
                locality: "0.5,0.5"
            }
              , v = {
                geocode: function(e, o) {
                    d.isArray(e) && (e = e.join(","));
                    var p = ym.env.hosts.api.services.search + "/v2/"
                      , v = {
                        text: e,
                        format: "json",
                        rspn: o.strictBounds ? 1 : 0,
                        lang: ym.env.lang,
                        results: o.results,
                        skip: o.skip,
                        key: ym.env.key,
                        token: ym.env.token,
                        type: "geo",
                        properties: "addressdetails",
                        geocoder_sco: o.searchCoordOrder || ym.env.coordinatesOrder,
                        geocoder_kind: o.kind,
                        geolocation_accuracy: o.geolocationAccuracy,
                        origin: o.origin || "jsapi2Geocoder",
                        apikey: ym.env.apikey
                    };
                    ym.env.dataProvider && (v.data_provider = ym.env.dataProvider);
                    var m = l.defer();
                    if (o.boundedBy) {
                        var f = i.toCenterAndSpan(o.boundedBy, n)
                          , h = f.ll
                          , k = f.spn;
                        "longlat" != ym.env.coordinatesOrder && (h.reverse(),
                        k.reverse()),
                        v.ll = h,
                        v.spn = k
                    } else
                        o.kind && (v.spn = y[o.kind] || []);
                    return "undefined" != typeof o.correct_misspell && (v.correct_misspell = o.correct_misspell),
                    a({
                        url: p,
                        requestParams: v,
                        postprocessUrl: function(e) {
                            return ym.env.hostConfigQuery ? e + "&" + ym.env.hostConfigQuery : e
                        }
                    }).then(function(e) {
                        if ("success" != e.status || !e.data)
                            return void m.reject({
                                message: e.message || "internal server error"
                            });
                        if (e = r.convert(e),
                        o.json)
                            m.resolve(e);
                        else {
                            var n = s(e, "", t);
                            if (!n)
                                return void m.reject({
                                    message: "Bad response"
                                });
                            var a = n.properties.get("metaDataProperty").GeocoderResponseMetaData
                              , d = !o.origin
                              , l = c(a, "SourceMetaDataList.GeocoderResponseMetaData.Point.coordinates");
                            l && "longlat" != ym.env.coordinatesOrder && (l = u(l)),
                            n.each(function(e) {
                                var r = e.properties.get("metaDataProperty").GeocoderMetaData
                                  , t = r.text.split(",");
                                t.length -= "house" == r.kind ? 2 : 1;
                                var s, n = t.join(","), a = e.properties.get("name");
                                s = d || "jsapi2searchcontrol" != o.origin ? "<h3>" + a + "</h3><p>" + n + "</p>" : g.get(a, n, e),
                                e.properties.set({
                                    description: n,
                                    text: r.text,
                                    balloonContentBody: s
                                }),
                                l && !d && i.containsPoint(e.properties.get("boundedBy"), l) && e.geometry.setCoordinates(l)
                            }),
                            m.resolve({
                                geoObjects: n,
                                metaData: {
                                    geocoder: {
                                        request: a.request,
                                        found: parseInt(a.found),
                                        results: parseInt(a.results),
                                        skip: a.skip ? parseInt(a.skip) : 0,
                                        suggest: a.suggest
                                    }
                                }
                            })
                        }
                    }, function(e) {
                        m.reject(e)
                    }),
                    m.promise()
                },
                suggest: function(e, r) {
                    if (ym.env.suggestApikey)
                        return o(e, "geo", r);
                    if (!ym.env.allowDeprecatedSuggest)
                        return l.reject(p.create("FeatureRemovedError", "Suggest is not available. See https://yandex.com/dev/jsapi-v2-1/doc/en/v2-1/ref/reference/suggest"));
                    r = r || {};
                    var t = ym.env.hosts.api.services.suggest + "suggest-geo"
                      , s = {
                        apikey: ym.env.apikey,
                        v: "5",
                        search_type: "tp",
                        part: e,
                        lang: ym.env.lang,
                        n: r.results || 5,
                        origin: "jsapi2Geocoder"
                    }
                      , n = "longlat" != ym.env.coordinatesOrder;
                    return r.boundedBy ? (s.bbox = [r.boundedBy[0][n ? 1 : 0], r.boundedBy[0][n ? 0 : 1], r.boundedBy[1][n ? 1 : 0], r.boundedBy[1][n ? 0 : 1]].join(","),
                    s.local_only = r.strictBounds ? "1" : "0") : s.bbox = "-180,-90,180,90",
                    "osm" === ym.env.dataProvider && (s.osm_vertical = "only",
                    s.enable_osm_toponyms = "1"),
                    a({
                        url: t,
                        requestParams: s,
                        paramName: "callback",
                        timeout: r.timeout || 3e4
                    }).then(function(e) {
                        for (var r = [], o = e[1], t = 0, s = o.length; t < s; t++) {
                            var n = o[t];
                            r.push({
                                type: n[0],
                                displayName: n[1],
                                value: n[2],
                                hl: n[3].hl
                            })
                        }
                        return r
                    }, function(e) {
                        return e
                    })
                }
            };
            e(v)
        }
    });
}
, function(ym) {
    ym.modules.define("yandex.geocodeProvider.metaOptions", ["map.metaOptions"], function(e, o) {
        o.set("geocodeProvider", "yandex#map"),
        e(!0)
    });
}
, function(ym) {
    ym.modules.define({
        name: "yandex.geocodeProvider.publicMap",
        key: "yandex#publicMap",
        storage: "yandex.geocodeProvider",
        depends: ["vow"],
        declaration: function(e, o) {
            var r = {
                geocode: function() {
                    return o.reject(new Error("http://clubs.ya.ru/mapsapi/58473"))
                }
            };
            e(r)
        }
    });
}
, function(ym) {
    ym.modules.define("yandex.geocodeProvider.storage", ["util.AsyncStorage"], function(e, o) {
        e(new o("yandex.geocodeProvider"))
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.AirPanoramaHotspot", ["util.defineClass", "yandex.layers", "hotspot.Layer", "hotspot.layer.ObjectSource"], function(t, e, a, s, o) {
        function l(t) {
            var e = a.getTileUrlTemplate("staHotspot", "sta")
              , s = a.getTileUrlTemplate("staHotspotKey", "sta");
            l.superclass.constructor.call(this, new o(e,s), t)
        }
        e(l, s),
        t(l)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.AirPanorama", ["yandex.layer.factory", "projection.wgs84Mercator"], function(a, e, r) {
        var n = e.create({
            tileLayer: {
                projection: r,
                tileTransparent: !0
            },
            alias: "sta",
            zoomRangeLayers: ["map"]
        });
        a(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.factory", ["util.defineClass", "Layer", "yandex.dataProvider", "yandex.layers", "util.copyrights", "Monitor"], function(e, t, r, o, i, a, n) {
        var s, l = ym.env.browser.isMobile && !ym.env.browser.isTablet, m = {
            map: "map",
            admin: "admin",
            driving: "driving",
            transit: "transit",
            "future-map": "future_map",
            "legacy-map": "map"
        }, d = function(e) {
            var d = e.alias
              , p = e.zoomRangeLayers || d.split(",")
              , u = function() {
                u.superclass.constructor.call(this, i.getTileUrlTemplate(d), e.tileLayer),
                this._extraParameters = {
                    tileExtraQuery: "",
                    extended: {}
                }
            };
            return t(u, r, {
                getAlias: function() {
                    return d
                },
                getZoomRangeLayers: function() {
                    return p
                },
                _getExtraParameters: function() {
                    var t = []
                      , r = {};
                    e.adverts && !this.options.get("yandexMapDisableAdverts", !1) && t.push("ads=enabled"),
                    e.theme && ym.env.theme && t.push("theme=" + encodeURIComponent(ym.env.theme));
                    var o = this.options.get("yandexMapStyle");
                    e.style && o && t.push("style=" + encodeURIComponent(o));
                    var i = this.options.get("yandexMapType");
                    return e.maptype && i && m[i] && (t.push("maptype=" + encodeURIComponent(m[i])),
                    r.maptype = m[i]),
                    {
                        tileExtraQuery: t.join("&"),
                        layersInfoExtended: r
                    }
                },
                onAddToMap: function(t) {
                    this._extraParameters = this._getExtraParameters();
                    var r = i.getTileUrlTemplate(d) + (this._extraParameters.tileExtraQuery ? "&" + this._extraParameters.tileExtraQuery : "");
                    r !== this.getTileUrlTemplate() && this.setTileUrlTemplate(r),
                    u.superclass.onAddToMap.call(this, t),
                    this._optionsMonitor = new n(this.options),
                    e.poi && (this.options.get("yandexMapDisablePoiInteractivity", !1) || this._requestAndAddPoi(t),
                    this._optionsMonitor.add("yandexMapDisablePoiInteractivity", function(e, r) {
                        e ? this._removePoi(t) : this._requestAndAddPoi(t)
                    }, this))
                },
                onRemoveFromMap: function(t) {
                    e.poi && (this.options.get("yandexMapDisablePoiInteractivity", !1) || this._removePoi(t)),
                    this._optionsMonitor.destroy(),
                    this._optionsMonitor = null,
                    u.superclass.onRemoveFromMap.call(this, t)
                },
                getCopyrights: function() {
                    if (e.noCopyrights || l)
                        return ym.vow.resolve([]);
                    var t = this._resolveCopyrightsArguments(arguments);
                    return o.getLayersInfo(this.getAlias().split(","), t.coords, t.zoom, void 0, this._extraParameters.layersInfoExtended).then(function(e) {
                        var t = Object.keys(e).map(function(t) {
                            var r = e[t].copyrights || [];
                            return r.options = e[t].copyrightsOptions || {},
                            r
                        });
                        return a.aggregate(t)
                    })
                },
                getZoomRange: function(e) {
                    var t = this.getMap()
                      , r = e || t.getCenter({
                        useMapMargin: !0
                    })
                      , i = t ? t.getZoom() : 0
                      , a = ym.vow.defer();
                    return o.getLayersInfo(this.getZoomRangeLayers(), r, i).then(function(e) {
                        var t;
                        for (var r in e)
                            if (e.hasOwnProperty(r)) {
                                var o = e[r] ? e[r].zoomRange : null;
                                o && (t = t ? [Math.max(t[0], Number(o[0])), Math.min(t[1], Number(o[1]))] : [Number(o[0]), Number(o[1])])
                            }
                        t ? a.resolve(t) : a.reject("noData")
                    }),
                    a.promise()
                },
                _resolveCopyrightsArguments: function(e) {
                    var t = {
                        zoom: null,
                        coords: null,
                        callback: null
                    };
                    if (1 == e.length) {
                        if (!this._map)
                            throw new Error("yandex.layer.getCopyrights: Impossible to get zoom and coordinates - map is null.");
                        t.callback = e[0],
                        t.zoom = this._map.getZoom(),
                        t.coords = this._map.getCenter({
                            useMapMargin: !0
                        })
                    } else
                        t.coords = e[0],
                        t.zoom = e[1],
                        t.callback = e[2];
                    return t
                },
                _requestAndAddPoi: function(e) {
                    "undefined" != typeof s ? s.get(e).addLayer(this, {
                        query: this._extraParameters.tileExtraQuery
                    }) : (this._waitingForPoiToAdd = !0,
                    ym.modules.require("yandex.layer.poi").spread(function(t) {
                        s = t,
                        this._waitingForPoiToAdd && (s.get(e).addLayer(this, {
                            query: this._extraParameters.tileExtraQuery
                        }),
                        this._waitingForPoiToAdd = !1)
                    }, this))
                },
                _removePoi: function(e) {
                    this._waitingForPoiToAdd ? this._waitingForPoiToAdd = !1 : s.get(e).removeLayer(this)
                }
            }),
            u
        };
        e({
            create: d
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.Map", ["layer.storage", "yandex.layer.factory", "map.metaOptions", "map.optionMapper", "projection.wgs84Mercator", "yandex.layer.metaOptions"], function(e, a, p, t, y, n) {
        var r = p.create({
            alias: "map",
            tileLayer: {
                projection: n,
                brightness: .75
            },
            poi: !0,
            theme: !0,
            adverts: !0,
            maptype: !0,
            style: ym.env.allowYandexMapStyle
        });
        a.add("yandex#map", r),
        a.add("yandex#publicMap", r),
        y.setRule({
            name: "layerManager",
            rule: ["prefixed", "plain"],
            key: ["yandexMapDisablePoiInteractivity", "yandexMapDisableAdverts", "yandexMapStyle", "yandexMapType"]
        }),
        e(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.VectorMap", ["vow", "util.defineClass", "util.cancelableCallback", "util.dom.style", "util.WeakMap", "Monitor", "constants.zIndex", "layer.storage", "yandex.layer.Map", "LayerCollection", "yandex.layers"], function(e, t, r, i, a, s, o, n, h, y, c, l) {
        function v(e) {
            v.superclass.constructor.call(this, e),
            this._showingRasterLayerBeforeVector = !1,
            this._onRasterLayerTransitionEnd = this._onRasterLayerTransitionEnd.bind(this),
            this._vectorLayer = null,
            this._vectorHotspotLayer = null,
            this._vectorLayerInitialization = null,
            this._vectorLayerEvents = null,
            this._rasterLayer = new y({
                yandexMapDisablePoiInteractivity: !0,
                zIndex: n.layer
            }),
            this._activeLayer = this._rasterLayer,
            this._rasterLayer.events.add("tileloadchange", function(e) {
                e.stopPropagation(),
                this.events.fire("tileloadchange", {
                    totalTileNumber: e.get("totalTileNumber"),
                    readyTileNumber: e.get("readyTileNumber"),
                    layerType: "raster"
                })
            }, this),
            p.then(function() {
                this._optionsMonitor = new o(this.options).add("yandexMapDisablePoiInteractivity", function(e, t) {
                    this.getMap() && this._activeLayer == this._vectorLayer && (t === !1 && u.get(this.getMap()).removeLayer(this),
                    e === !1 && u.get(this.getMap()).addLayer(this, {
                        hotspotLayer: this._vectorHotspotLayer
                    }))
                }, this, {
                    defaultValue: !1,
                    init: !0
                })
            }, this)
        }
        function L(e) {
            return e.replace("{{lang}}", ym.env.lang).replace("{{version}}", l.getLayerVersion(g))
        }
        var u, _ = 1e3, d = .5, g = "map", p = ym.modules.require(["yandex.layer.poi"]).spread(function(e) {
            u = e
        }), m = new s;
        v.layerType = "vector",
        r(v, c, {
            getTileStatus: function() {
                return null
            },
            getBrightness: function() {
                return this._activeLayer.getBrightness()
            },
            getZoomRange: function(e) {
                return this._activeLayer.getZoomRange(e)
            },
            getAlias: function() {
                return "map"
            },
            getCopyrights: function() {
                return this._rasterLayer.getCopyrights.apply(this._rasterLayer, arguments)
            },
            getRasterTileStatus: function() {
                return this._rasterLayer.getTileStatus()
            },
            getVectorTileStatus: function() {
                return this._vectorLayer && this._vectorLayer.getTileStatus()
            },
            onAddToMap: function(e) {
                return v.superclass.onAddToMap.call(this, e),
                this._vectorLayer = null,
                this._vectorLayer ? (this._showingRasterLayerBeforeVector = !1,
                void this._useVectorLayer()) : m.get(e) ? void this._useRasterLayer() : (this._showingRasterLayerBeforeVector = this.options.get("vectorRevealThreshold", d) > 0,
                this._showingRasterLayerBeforeVector && this._useRasterLayer(),
                void (this._vectorLayerInitialization = i.createPromiseHandler(ym.modules.require(["vectorEngine.VectorMapLayer", "vectorEngine.VectorHotspotLayer", "yandex.dataProvider"]), function(e) {
                    this._vectorLayerInitialization = null,
                    this._initializeVectorLayer.apply(this, e)
                }, function(e) {
                    ym.logger.error(e),
                    this.events.fire("vectorerror")
                }, this)))
            },
            onRemoveFromMap: function(e) {
                u && u.get(e).removeLayer(this),
                this._vectorLayerInitialization && (this._vectorLayerInitialization.cancel(),
                this._vectorLayerInitialization = null),
                this._vectorLayerEvents && (this._vectorLayerEvents.removeAll(),
                this._vectorLayerEvents = null),
                this._vectorLayer = null,
                v.superclass.onRemoveFromMap.call(this, e)
            },
            _initializeVectorLayer: function(e, r, i) {
                this._vectorLayer = new e({},{
                    vectorTileUrl: L(ym.env.hosts.vectorTiles),
                    vectorImageUrl: ym.env.hosts.vectorImages,
                    vectorMeshUrl: ym.env.hosts.vectorMeshes,
                    vectorGlyphsUrl: L(ym.env.hosts.vectorGlyphs),
                    brightness: .75,
                    getZoomRange: function(e, r) {
                        return i.getLayersInfo([g], e, r).then(function(e) {
                            return e.map.zoomRange
                        })["catch"](function() {
                            return t.reject("noData")
                        })
                    }
                }),
                this._vectorHotspotLayer = new r,
                this._vectorLayerEvents = this._vectorLayer.events.group().add("internalerror", function(e) {
                    e.stopPropagation(),
                    this._useRasterLayer(),
                    m.set(this.getMap(), !0),
                    this.events.fire("vectorerror")
                }, this).add("tileloadchange", function(e) {
                    e.stopPropagation();
                    var t = e.get("totalTileNumber")
                      , r = e.get("readyTileNumber")
                      , i = this.options.get("vectorRevealThreshold", d);
                    this._activeLayer != this._vectorLayer && r / t >= i && (this._useVectorLayer(),
                    this.events.fire("vectorreveal")),
                    this.events.fire("tileloadchange", {
                        readyTileNumber: r,
                        totalTileNumber: t,
                        layerType: "vector"
                    })
                }, this),
                this.add(this._vectorLayer)
            },
            _useRasterLayer: function() {
                this._activeLayer = this._rasterLayer,
                this._vectorLayer && this.indexOf(this._vectorLayer) != -1 && (u && u.get(this.getMap()).removeLayer(this),
                this.remove(this._vectorLayer),
                this._vectorHotspotLayer.destroy(),
                this._vectorLayer.destroy()),
                this.indexOf(this._rasterLayer) == -1 && this.add(this._rasterLayer),
                this._showingRasterLayerBeforeVector && this._removeRasterLayerTransitionListener(),
                a.css(this._rasterLayer.getElement(), {
                    transitionProperty: "opacity",
                    transitionDuration: _ + "ms",
                    opacity: 1
                })
            },
            _useVectorLayer: function() {
                if (this.indexOf(this._vectorLayer) == -1 && this.add(this._vectorLayer),
                u && !this.options.get("yandexMapDisablePoiInteractivity")) {
                    var e = u.get(this.getMap());
                    e.addLayer(this, {
                        hotspotLayer: this._vectorHotspotLayer
                    })
                }
                this._activeLayer = this._vectorLayer,
                this._showingRasterLayerBeforeVector && (this._rasterLayer.getElement().addEventListener("transitionend", this._onRasterLayerTransitionEnd),
                a.css(this._rasterLayer.getElement(), {
                    opacity: 0
                }))
            },
            _onRasterLayerTransitionEnd: function(e) {
                "opacity" == e.propertyName && (this._removeRasterLayerTransitionListener(),
                this.remove(this._rasterLayer),
                this._vectorLayer && this._vectorLayer.options.set({
                    zIndex: n.layer
                }),
                this._showingRasterLayerBeforeVector = !1)
            },
            _removeRasterLayerTransitionListener: function() {
                var e = this._rasterLayer.getElement();
                e && e.removeEventListener("transitionend", this._onRasterLayerTransitionEnd)
            }
        }),
        h.add("yandex#map~vector", v),
        e(v)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.metaOptions", ["map.metaOptions"], function(a, o) {
        function e() {
            o.set({
                yandexMapDisablePoiInteractivity: ym.env.enterprise,
                yandexMapDisableAdverts: ym.env.yandexMapDisableAdverts,
                yandexMapHotspotZoomRange: ym.env.layers.map.hotspotZoomRange,
                yandexSklHotspotZoomRange: ym.env.layers.skl.hotspotZoomRange
            })
        }
        o.set({
            yandexMapDisablePoiMtr: !0,
            layerPoiCloseBalloonOnZoomChange: !1,
            layerPoiBalloonManager: "poi#balloon",
            layerPoiBalloonContentLayout: "islands#islets-searchControlCardLayout",
            layerPoiBalloonCardStatusLayout: "islands#islets-searchControlCardStatusLayout",
            layerPoiBalloonCardContactsLayout: "islands#islets-searchControlCardContactsLayout",
            layerPoiBalloonCardMetroLayout: "islands#islets-searchControlCardMetroLayout",
            layerPoiBalloonCardOpenInYmapsLayout: "islands#islets-searchControlCardOpenInYmapsLayout",
            layerPoiBalloonCardInceptionOrgButtonsLayout: "islands#islets-searchControlCardInceptionOrgButtonsLayout",
            layerPoiBalloonMaxHeight: 600,
            layerPoiBalloonMinWidth: 250,
            layerPoiBalloonMaxWidth: 350,
            layerPoiBalloonPanelMaxMapArea: 36e4,
            layerPoiHasHint: !1
        }),
        e(),
        ym.__mock__.metaOptions && ym.__mock__.metaOptions.onEnvUpdate(e),
        a({})
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.Panorama", ["yandex.layer.factory", "projection.wgs84Mercator"], function(a, e, r) {
        var n = e.create({
            tileLayer: {
                projection: r,
                tileTransparent: !0
            },
            alias: "stv",
            zoomRangeLayers: ["map"]
        });
        a(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.poi", ["util.Associate", "util.defineClass", "util.array", "map.associate.serviceLayers", "vow", "hotspot.Layer", "hotspot.layer.ObjectSource", "yandex.layers", "layer.optionMapper", "event.Manager", "Event", "poi.BalloonManager", "hotspot.layer.Hint", "hotspot.layer.addon.balloon", "yandex.layer.metaOptions"], function(e, t, r, o, n, i, s, a, l, y, h, u) {
        function p(e) {
            var t = ym.env.layers[e];
            if (t.hotspotExcludeByTags)
                return function(e) {
                    var r = e.properties && e.properties.tags;
                    return !o.isArray(r) || o.every(r, function(e) {
                        return t.hotspotExcludeByTags.indexOf(e) === -1
                    })
                }
        }
        function d(e, t) {
            return [c(e, t), c(e, "hotspotLayer"), e]
        }
        function c(e, t) {
            return t + e.slice(0, 1).toUpperCase() + e.slice(1)
        }
        var _ = function(e) {
            this.events = new h,
            this._map = e,
            this._layers = [],
            this._layer = null,
            this._layerDeferred = new i.Deferred,
            this._childEventController = {
                onAfterEventFiring: function(e, t, r) {
                    t.indexOf("defaultaction") == -1 && this.events.fire(t, new u({},r))
                }
                .bind(this)
            }
        }
          , f = new t(function(e) {
            return new _(e)
        }
        );
        _.PoiWanstAdded = _.PoiWasRemoved = _.NoPoiPresent = function() {
            return new Error("No POI layer present")
        }
        ,
        r(_, {
            isEnabled: function() {
                return this._layers.length > 0
            },
            addLayer: function(e, t) {
                o.indexOf(this._layers, e) == -1 && (this._layers.push(e),
                this._updateHotspotLayer(t && t.hotspotLayer || this._createHotspotLayer(e.getAlias(), t && t.query)))
            },
            removeLayer: function(e) {
                var t = o.indexOf(this._layers, e);
                t > -1 && (this._layers.splice(t, 1),
                0 == this._layers.length && this._teardownPoi())
            },
            getHostpotLayer: function() {
                return this.getHotspotLayer()
            },
            getHostpotLayerSync: function() {
                return this.getHotspotLayerSync()
            },
            getHotspotLayer: function() {
                return this._layer ? i.resolve(this._layer) : i.reject(_.NoPoiPresent())
            },
            getHotspotLayerSync: function() {
                return this._layer
            },
            getHotspotLayerAsync: function() {
                return this._layerDeferred.promise()
            },
            _setupPoi: function(e) {
                this._layer = e,
                this._layer.options.setName("poi"),
                this._layer.events.addController(this._childEventController),
                n.get(this._map).add(this._layer),
                this._layerDeferred.resolve(this._layer)
            },
            _teardownPoi: function() {
                this._layer && (n.get(this._map).remove(this._layer),
                this._layer.events.removeController(this._childEventController),
                this._layer = null),
                this._layerDeferred = new i.Deferred
            },
            _createHotspotLayer: function(e, t) {
                var r = e + "j"
                  , o = ym.env.layers[e].hotspotZoomRange
                  , n = "%c&l=" + r
                  , i = l.getTileUrlTemplate(r, e) + (t ? "&" + t : "")
                  , y = new a(i,n,{
                    coordOrder: "latlong",
                    minZoom: o[0],
                    maxZoom: o[1],
                    featureFilter: p(e)
                });
                return new s(y,{
                    tilesRoundingMethod: this._map.options.get("tilesRoundingMethod")
                })
            },
            _updateHotspotLayer: function(e) {
                this._layer != e && (this._teardownPoi(),
                this._setupPoi(e))
            }
        }),
        y.setRule({
            name: "poi",
            rule: d
        }),
        e(f)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.Satellite", ["yandex.layer.factory", "layer.storage", "projection.wgs84Mercator", "map.metaOptions", "yandex.layer.metaOptions"], function(e, a, t, r, i) {
        var n = a.create({
            alias: "sat",
            tileLayer: {
                projection: r,
                brightness: .25
            },
            poi: !1
        });
        t.add("yandex#satellite", n),
        e(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.layer.Skeleton", ["yandex.layer.factory", "layer.storage", "projection.wgs84Mercator", "map.metaOptions", "yandex.layer.metaOptions"], function(e, a, n, t, o) {
        var r = a.create({
            tileLayer: {
                projection: t,
                tileTransparent: !0
            },
            alias: "skl",
            zoomRangeLayers: ["sat"],
            poi: !0
        });
        n.add("yandex#skeleton", r),
        n.add("yandex#publicMapSkeleton", r),
        e(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.layers", ["util.array", "util.extend"], function(e, t, r) {
        var s = ym.env.hosts && ym.env.hosts.layers || {}
          , n = {
            trf: ym.env.hosts && ym.env.hosts.traffic + "1.1/tiles?%n&%l&%c&%t",
            trfe: ym.env.hosts && ym.env.hosts.roadEventsRenderer + "1.1/tiles?%n&%l&%c&%v",
            trj: ym.env.hosts && ym.env.hosts.trafficArchive + "tiles?%l&%n&%c&%t",
            trff: ym.env.hosts && ym.env.hosts.trafficArchive + "tiles?%l&%n&%c&%t&forecast=true"
        }
          , i = r({}, ym.env.layers || {})
          , a = {}
          , l = {
            trf: {
                version: !1,
                scaled: !0
            },
            trfe: {
                version: !1,
                scaled: !0
            },
            trj: {
                version: !1,
                scaled: !0
            },
            trff: {
                version: !1,
                scaled: !0
            }
        }
          , v = ym.env.restrictions && ym.env.restrictions.prohibitedLayers ? ym.env.restrictions.prohibitedLayers.split(",") : [];
        i.trj = i.trff = i.trf,
        e({
            has: function(e) {
                return !!i[e] && t.indexOf(v, e) == -1
            },
            getLayerVersion: function(e) {
                if (this.has(e))
                    return i[e].version
            },
            getTileUrlTemplate: function(e, t) {
                if ("undefined" == typeof t && (t = e),
                a[e])
                    return a[e].tileUrlTemplate;
                var r = n[e] || s[e];
                if (r) {
                    var v = i[t]
                      , o = l[e] || {
                        version: !0,
                        scaled: !0
                    };
                    v && (v.version && o.version && (r = /%v/.test(r) ? r.replace("%v", v.version) : r.replace("%c", "v=" + v.version + "&%c")),
                    v.scaled && o.scaled && (r = r.replace("%c", "%c&scale={{ scale }}"))),
                    ym.env.dataPrestable && (r += "&experimental_dataprestable=1"),
                    ym.env.apikey && (r += "&apikey=" + ym.env.apikey)
                }
                return a[e] = {
                    tileUrlTemplate: r
                },
                r
            }
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.mapType.hybrid", ["localization.common.current", "mapType.storage", "MapType"], function(e, a, d, y) {
        var n = new y(a.MapType.hybrid,["yandex#satellite", "yandex#skeleton"]);
        d.add("yandex#hybrid", n);
        var p = new y(a.MapType.peoplesHybrid,["yandex#satellite", "yandex#skeleton"]);
        d.add("yandex#publicMapHybrid", p),
        e(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.mapType.map", ["localization.common.current", "mapType.storage", "MapType"], function(a, e, p, n) {
        var d = new n(e.MapType.map,["yandex#map"],["yandex#map~vector"]);
        p.add("yandex#map", d);
        var m = new n(e.MapType.peoplesMap,["yandex#map"]);
        p.add("yandex#publicMap", m),
        a(d)
    });
}
, function(ym) {
    ym.modules.define("yandex.mapType.metaOptions", ["map.metaOptions"], function(e, a) {
        a.set({
            defaultMapType: "yandex#map"
        }),
        e({})
    });
}
, function(ym) {
    ym.modules.define("yandex.mapType.satellite", ["localization.common.current", "mapType.storage", "MapType"], function(e, a, t, l) {
        var n = new l(a.MapType.satellite,["yandex#satellite"]);
        t.add("yandex#satellite", n),
        e(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.masstransitStopProvider", ["util.crossDomainXhr", "util.querystring"], function(r, n, e) {
        function t(r) {
            var n = {
                uri: r,
                lang: ym.env.lang
            };
            return s + a + "?" + e.stringify(n)
        }
        var s = ym.env.hosts.api.services.route
          , a = "v2/masstransit/stop"
          , i = {};
        i.getStopByUri = function(r) {
            var e = t(r)
              , s = ym.env.server.params.csp
              , a = s && parseFloat(s.version) >= 2;
            return n(e, {
                headers: {
                    Accept: "application/json"
                }
            }, a).then(function(r) {
                var n = JSON.parse(r);
                return n[0]
            })
        }
        ,
        r(i)
    });
}
, function(ym) {
    ym.modules.define("yandex.metroUrlProvider", ["util.querystring", "yandex.yandexMapUrlProvider"], function(e, r, o) {
        var n = {};
        n.isLocaleAvailable = function(e) {
            return Boolean(ym.env.hosts["metro_" + e])
        }
        ,
        n.getCurrentLocale = function() {
            return n.isLocaleAvailable(ym.env.countryCode) ? ym.env.hosts["metro_" + ym.env.countryCode] : ym.env.hosts.metro_US
        }
        ,
        n.getMetroSchemeByCoord = function(e, t) {
            var i = {
                ll: [t, e].join(","),
                from: o.API_FROM
            };
            return n.getCurrentLocale() + "?" + r.stringify(i)
        }
        ,
        e(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.searchProvider.metaOptions", ["map.metaOptions"], function(e, a) {
        a.set("searchProvider", "yandex#search"),
        e(!0)
    });
}
, function(ym) {
    ym.modules.define("yandex.searchProvider.responseParser", ["GeoObjectCollection", "GeoObject", "util.Time", "yandex.searchProvider.parser.WorkingTimeModel", "yandex.searchProvider.parser.WorkingTimeDayModel", "coordSystem.geo", "util.array", "util.extend", "util.coordinates.reverse", "searchResult.factory"], function(e, t, r, a, o, s, n, i, u, d, c) {
        function l(e, r) {
            var a = e.properties.ResponseMetaData
              , o = a.SearchResponse
              , s = a.SearchRequest
              , n = o.boundedBy
              , u = []
              , c = !0
              , y = !1;
            return i.each(e.features, function(e) {
                if ("Feature" === e.type)
                    u.push(p(e, r));
                else if ("FeatureCollection" === e.type && c) {
                    var t = l(e);
                    t.getLength() ? (t.properties.set({
                        type: "alternative"
                    }),
                    u.push(t)) : y = !0,
                    c = !1
                }
            }),
            n && b && (n = d(n)),
            o.boundedBy && (o.boundedBy = n),
            new t({
                children: u,
                properties: {
                    found: o.found,
                    results: s.results,
                    resultsArray: u,
                    skip: s.skip,
                    request: s.request,
                    correction: s.suggest,
                    suggest: s.suggest,
                    boundedBy: n,
                    display: o.display,
                    requestContext: o.context,
                    isAlternative: y,
                    counter: o.counter,
                    responseMetaData: a
                }
            })
        }
        function p(e, t) {
            var a = e.properties
              , o = e.geometry.coordinates
              , s = {};
            if (a) {
                var l = a.CompanyMetaData
                  , p = a.GeocoderMetaData
                  , f = a.PSearchObjectMetaData
                  , w = l || p || f;
                if (u(s, {
                    name: a.name,
                    description: a.description,
                    boundedBy: a.boundedBy,
                    responseMetaData: w,
                    uriMetaData: a.URIMetaData
                }),
                l) {
                    var k = l.Advert
                      , D = l.Categories
                      , M = l.Phones;
                    u(s, {
                        type: "business",
                        companyMetaData: l,
                        id: l.id,
                        address: l.address,
                        url: l.url
                    }),
                    D && (D = i.map(D, m),
                    u(s, {
                        categories: D,
                        categoriesText: i.map(D, v).join(", ")
                    })),
                    M && (M = i.map(l.Phones, h),
                    M = [M.shift()].concat(M.sort()),
                    s.phoneNumbers = M),
                    k && (s.advert = {
                        title: k.title,
                        text: k.text,
                        url: k.url,
                        disclaimers: k.disclaimers,
                        counter: k.counter
                    })
                } else if (p)
                    u(s, c.createToponymFromGeocoderData(p));
                else if (f) {
                    u(s, {
                        type: "public-map-object",
                        publicMapMetaData: f,
                        kind: f.kind,
                        categoriesText: f.category,
                        address: f.address
                    });
                    var x = f.internal;
                    x && u(s, {
                        url: x.url,
                        phones: [x.phone]
                    })
                }
                var T = w.Hours;
                if (T && T.Availabilities) {
                    var S, P = y(T.Availabilities), B = b ? [o[1], o[0]] : o;
                    t && n.getDistance(t.geoPoint, B) < 5e4 && (S = g(P, t.offset)),
                    u(s, {
                        workingTime: T.text,
                        workingStatus: S,
                        workingTimeModel: P
                    })
                }
                T && !T.Availabilities && u(s, {
                    workingTime: T.short_text || T.text,
                    workingStatus: {
                        isWork: !1,
                        closedPermanently: !0
                    }
                });
                var W = a.Stops;
                W && (s.stops = i.map(W.items, function(e) {
                    return {
                        name: e.name,
                        distance: e.Distance.text,
                        color: e.Style.color,
                        coordinates: e.Point.coordinates
                    }
                }));
                var A = a.BusinessRating;
                A && (s.rating = {
                    ratings: A.ratings,
                    reviews: A.reviews,
                    score: A.score
                })
            }
            return b && (o = d(o),
            e.geometry.coordinates = o,
            s.boundedBy = d(s.boundedBy)),
            new r({
                geometry: e.geometry,
                properties: s
            })
        }
        function y(e) {
            var t = new Array(7);
            return i.each(e, function(e) {
                var r, a = f(e);
                if (e.Everyday)
                    for (r = 0; r < 7; r++)
                        t[r] = a;
                else if (e.Weekdays)
                    for (r = 1; r < 6; r++)
                        t[r] = a;
                else if (e.Weekend)
                    t[6] = a,
                    t[0] = a;
                else
                    for (var o in e)
                        e.hasOwnProperty(o) && (r = w[o],
                        void 0 !== r && (t[r] = a))
            }),
            new o(t)
        }
        function f(e) {
            var t = [];
            return e.TwentyFourHours ? t.push({
                from: new a,
                to: new a
            }) : i.each(e.Intervals, function(e) {
                t.push({
                    from: a.parse(e.from),
                    to: a.parse(e.to)
                })
            }),
            new s(t)
        }
        function g(e, t) {
            var r = new Date
              , o = r.getTimezoneOffset() / 60 + t / 3600;
            r.setHours(r.getHours() + o);
            var s = new a(r.getHours(),r.getMinutes())
              , n = e.getStatus(r.getDay(), s)
              , i = n.isWork
              , u = n.interval;
            return {
                isWork: i,
                time: u && (i ? u.to : u.from).getString()
            }
        }
        function m(e) {
            return e.name
        }
        function v(e, t) {
            return t > 0 && (e = e.toLowerCase()),
            e
        }
        function h(e) {
            return e.formatted
        }
        var b = "longlat" != ym.env.coordinatesOrder
          , w = {
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
            Sunday: 0
        };
        e({
            parseResults: l
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.searchProvider.parser.WorkingTimeModel", ["util.defineClass"], function(i, e) {
        function r(i) {
            this._availabilities = i
        }
        e(r, {
            getAvailabilities: function() {
                return this._availabilities
            },
            getStatus: function(i, e) {
                var r, t = this._availabilities[i];
                if (!t)
                    return r = this._includeInPrevDay(i, e),
                    r ? {
                        isWork: !0,
                        interval: r
                    } : {
                        isWork: !1
                    };
                if (t.isTwentyFourHours())
                    return {
                        isWork: !0
                    };
                for (var n = t.getTimeIntervals(), s = 0; s < n.length; s++) {
                    var a = n[s]
                      , o = a.from
                      , l = a.to;
                    if (e.isBefore(o))
                        return 0 === s && (r = this._includeInPrevDay(i, e)) ? {
                            isWork: !0,
                            interval: r
                        } : {
                            isWork: !1,
                            interval: a
                        };
                    if ((e.isAfter(o) || e.equals(o)) && (e.isBefore(l) || l.isBefore(o)))
                        return {
                            isWork: !0,
                            interval: a
                        }
                }
                return {
                    isWork: !1
                }
            },
            _includeInPrevDay: function(i, e) {
                var r = (i - 1 + 7) % 7
                  , t = this._availabilities[r];
                if (t) {
                    var n, s = t.getTimeIntervals(), a = s.length;
                    if (a && (n = s[a - 1],
                    n.to.isBefore(n.from) && e.isBefore(n.to)))
                        return n
                }
            }
        }),
        i(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.searchProvider.parser.WorkingTimeDayModel", ["util.defineClass"], function(i, n) {
        function e(i) {
            this._intervals = i
        }
        n(e, {
            getTimeIntervals: function() {
                return this._intervals
            },
            isTwentyFourHours: function() {
                if (1 === this._intervals.length) {
                    var i = this._intervals[0];
                    return i.from.isMidnight() && i.to.isMidnight()
                }
                return !1
            }
        }),
        i(e)
    });
}
, function(ym) {
    ym.modules.define({
        name: "yandex.searchProvider.search",
        key: "yandex#search",
        storage: "yandex.searchProvider",
        depends: ["yandex.searchProvider.storage", "yandex.searchProvider.responseParser", "yandex.suggest.provider", "yandex.timeZone", "projection.wgs84Mercator", "util.jsonp", "util.bounds", "util.array", "util.extend", "util.safeAccess", "vow", "error"],
        declaration: function(e, r, t, s, a, n, o, i, d, u, c, l, p) {
            var v = ["businessrating/1.x", "masstransit/1.x"]
              , y = ["data", "properties", "ResponseMetaData", "SearchResponse", "SourceMetaDataList", "GeocoderResponseMetaData", "Point", "coordinates"].join(".")
              , m = {
                search: function(e, r) {
                    r = r || {};
                    var s = ym.env.coordinatesOrder;
                    d.isArray(e) && ("longlat" == s && (e = [e[1], e[0]]),
                    e = e.join(","));
                    var a = ym.env.hosts.api.services.search + "v2/"
                      , u = {
                        format: "json",
                        lang: ym.env.lang,
                        token: ym.env.token,
                        rspn: r.strictBounds ? 1 : 0,
                        results: r.results || 10,
                        skip: r.skip,
                        origin: r.origin || "jsapi2Search",
                        snippets: v,
                        ask_direct: ym.env.displayAdvert ? 1 : 0,
                        experimental_maxadv: ym.env.displayAdvert ? 200 : 0,
                        apikey: ym.env.apikey
                    };
                    ym.env.dataProvider && (u.data_provider = ym.env.dataProvider);
                    var c = l.defer();
                    if (r.uri ? (u.mode = "uri",
                    u.uri = r.uri) : u.text = e,
                    r.pin && (u.geocoder_pin = 1),
                    r.boundedBy) {
                        var p = i.toCenterAndSpan(r.boundedBy, n)
                          , y = p.ll
                          , m = p.spn;
                        "longlat" != s && (y.reverse(),
                        m.reverse()),
                        u.ll = y,
                        u.spn = m
                    }
                    r.zoom && (u.z = r.zoom),
                    r.searchType && (u.type = r.searchType),
                    "undefined" != typeof r.correct_misspell && (u.correct_misspell = r.correct_misspell);
                    var g = {
                        url: a,
                        requestParams: u,
                        postprocessUrl: function(e) {
                            return ym.env.hostConfigQuery ? e + "&" + ym.env.hostConfigQuery : e
                        }
                    };
                    return o(g).then(this._adjustCoordSearch).then(this._addTimeZoneToResponse).then(function(e) {
                        if (r.json)
                            c.resolve(e);
                        else {
                            if ("success" != e.status)
                                return c.reject({
                                    message: "Bad response",
                                    status: e.status
                                });
                            var s = t.parseResults(e.data, e.timeZone);
                            c.resolve({
                                geoObjects: s,
                                responseMetaData: e.data.properties.ResponseMetaData
                            })
                        }
                    }, function(e) {
                        c.reject(e)
                    }),
                    c.promise()
                },
                suggest: function(e, r) {
                    if (ym.env.suggestApikey)
                        return s(e, "biz,geo", r);
                    if (!ym.env.allowDeprecatedSuggest)
                        return l.reject(p.create("FeatureRemovedError", "Suggest is not available. See https://yandex.com/dev/jsapi-v2-1/doc/en/v2-1/ref/reference/suggest"));
                    r = r || {};
                    var t = ym.env.hosts.api.services.suggest + "suggest-geo"
                      , a = {
                        apikey: ym.env.apikey,
                        v: "5",
                        search_type: "all",
                        part: e,
                        lang: ym.env.lang,
                        n: r.results || 5,
                        origin: "jsapi2Geocoder"
                    }
                      , n = "longlat" != ym.env.coordinatesOrder;
                    return r.boundedBy ? (a.bbox = [r.boundedBy[0][n ? 1 : 0], r.boundedBy[0][n ? 0 : 1], r.boundedBy[1][n ? 1 : 0], r.boundedBy[1][n ? 0 : 1]].join(","),
                    a.local_only = r.strictBounds ? "1" : "0") : a.bbox = "-180,-90,180,90",
                    "osm" === ym.env.dataProvider && (a.osm_vertical = "only",
                    a.enable_osm_toponyms = "1"),
                    o({
                        url: t,
                        requestParams: a,
                        paramName: "callback",
                        timeout: r.timeout || 3e4
                    }).then(function(e) {
                        for (var r = [], t = 0, s = e[1].length; t < s; t++) {
                            var a = e[1][t]
                              , n = a[0]
                              , o = {
                                type: a[0],
                                displayName: a[1]
                            };
                            "geo" == n && (o.value = a[2],
                            o.hl = a[3].hl),
                            "biz" == n && (o.value = a[1],
                            o.hl = a[2].hl),
                            r.push(o)
                        }
                        return r
                    }, function(e) {
                        return e
                    })
                },
                _adjustCoordSearch: function(e) {
                    var r = Boolean(c(e, "data.features.length"))
                      , t = c(e, y);
                    return r && t && d.each(e.data.features, function(e) {
                        i.containsPoint(e.properties.boundedBy, t) && (e.geometry.coordinates = t)
                    }),
                    e
                },
                _addTimeZoneToResponse: function(e) {
                    if (e.data && e.data.features.length) {
                        var r = e.data.features[0]
                          , t = r.geometry.coordinates
                          , s = l.defer();
                        return "longlat" != ym.env.coordinatesOrder && (t = [t[1], t[0]]),
                        a.get(t, 10).then(function(r) {
                            s.resolve(u(e, {
                                timeZone: {
                                    geoPoint: t,
                                    offset: r.offset,
                                    dst: r.dst
                                }
                            }))
                        }, function() {
                            s.resolve(e)
                        }),
                        s.promise()
                    }
                    return l.resolve(e)
                }
            };
            e(m)
        }
    });
}
, function(ym) {
    ym.modules.define("yandex.searchProvider.storage", ["util.AsyncStorage"], function(e, r) {
        e(new r("yandex.searchProvider"))
    });
}
, function(ym) {
    ym.modules.define("yandex.state.associate", ["yandex.State", "util.Associate"], function(e, t, n) {
        var a = new n(function(e) {
            return new t(e)
        }
        );
        e({
            get: function(e) {
                if (ym.env.debug && !e)
                    throw new Error("yandex.state.associate: передан пустой указатель на карту");
                return a.get(e)
            }
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.Map", ["yandex.state.associate", "Monitor", "projection.zeroZoom", "util.coordinates.toLatLong", "util.extend", "util.defineClass"], function(e, t, n, s, a, i, o) {
        function p(e) {
            this._map = e,
            this._mapListeners = null,
            this._mapType = null,
            this._model = i({}, l),
            this._yandexState = t.get(e),
            this._setupListeners(),
            this._init()
        }
        var l = {
            center: null,
            zoom: null,
            bounds: null
        }
          , h = {
            "yandex#map": "map",
            "yandex#satellite": "sat",
            "yandex#hybrid": "sat,skl",
            "yandex#publicMap": "map",
            "yandex#publicMapHybrid": "sat,skl"
        };
        o(p, {
            destroy: function() {
                this._clearListeners(),
                this._yandexState = null
            },
            _init: function() {
                var e = this._map
                  , t = e.getZoom()
                  , n = e.getBounds()
                  , o = e.getGlobalPixelBounds();
                i(this._model, {
                    center: a(e.getCenter()),
                    zoom: t,
                    bounds: [a(n[0]), a(n[1])],
                    zeroZoomBounds: [s.fromGlobalPixels(o[0], t), s.fromGlobalPixels(o[1], t)]
                }),
                this._setMapType(),
                this._setYandexState()
            },
            _setupListeners: function() {
                this._mapListeners = this._map.events.group().add("boundschange", this._onBoundsChange, this).add("typechange", this._onTypeChange, this),
                this._mapStateMonitor = new n(this._map.state).add(["mapSid", "mapSourceType"], this._onUserMapChange, this)
            },
            _clearListeners: function() {
                this._mapListeners.removeAll(),
                this._mapListeners = null,
                this._mapStateMonitor.removeAll(),
                this._mapStateMonitor = null
            },
            _onBoundsChange: function(e) {
                var t = e.get("newBounds")
                  , n = e.get("newZoom")
                  , o = e.get("target").getGlobalPixelBounds();
                i(this._model, {
                    center: a(e.get("newCenter")),
                    zoom: n,
                    bounds: [a(t[0]), a(t[1])],
                    zeroZoomBounds: [s.fromGlobalPixels(o[0], n), s.fromGlobalPixels(o[1], n)]
                }),
                this._setYandexState()
            },
            _onTypeChange: function() {
                this._setMapType()
            },
            _onUserMapChange: function(e) {
                this._yandexState.setUserMap(e.mapSourceType, e.mapSid)
            },
            _getMapType: function() {
                return h[this._map.getType()]
            },
            _setMapType: function() {
                var e = this._mapType;
                e && this._yandexState.removeLayers(e),
                e = this._mapType = this._getMapType(),
                e && this._yandexState.pushLayers(e)
            },
            _setYandexState: function() {
                this._yandexState.setMapState(this._model)
            }
        }),
        e(p)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.MapGeoObjects", ["util.defineClass", "yandex.state.associate", "util.coordinates.toLatLong", "util.tailThrottle", "util.vector", "util.WeakMap", "map.associate.serviceGeoObjects"], function(t, e, n, o, i, s, r, a) {
        function l(t) {
            this._collection = t,
            this._serviceGeoObjects = a.get(t.getMap()),
            this._collectionListeners = null,
            this._yandexState = n.get(t.getMap()),
            this._throttledUpdate = i(_, this._setYandexState),
            this._setupListeners()
        }
        function c(t, e) {
            if (g(t) && e.push(t),
            t.getIterator)
                for (var n, o = t.getIterator(); (n = o.getNext()) != o.STOP_ITERATION; )
                    "undefined" != typeof n && c(n, e)
        }
        function g(t) {
            return 0 != t.options.get("visible") && !f.get(t) && h(t)
        }
        function h(t) {
            return null != t.geometry && !f.get(t) && t.geometry.getType() == p && null != t.geometry.getCoordinates()
        }
        function u(t, e, n) {
            for (var o = [], i = 0, r = t.length; i < r; i++) {
                var a = t[i].geometry.getPixelGeometry().getCoordinates();
                o.push({
                    geoObject: t[i],
                    distance: s.length([e[0] - a[0], e[1] - a[1]])
                })
            }
            o.sort(function(t, e) {
                return t.distance - e.distance
            });
            for (var l = [], i = 0, r = o.length; i < r; i++)
                l.push(o[i].geoObject);
            return l
        }
        function d(t, e) {
            var n = t;
            do {
                if (e.indexOf(n) != -1)
                    return !1;
                n = n.getParent && n.getParent()
            } while (n);
            return !0
        }
        var p = "Point"
          , _ = 300
          , f = new r;
        e(l, {
            destroy: function() {
                this._clearListeners(),
                this._collection = null,
                this._yandexState = null,
                this._throttledUpdate.clear()
            },
            _setupListeners: function() {
                this._collectionListeners = this._collection.events.group().add(["add", "remove", "geometrychange", "overlaychange", "balloonopen", "balloonclose"], this._throttledUpdate, this),
                this._mapListeners = this._collection.getMap().events.group().add(["boundschange"], this._throttledUpdate, this)
            },
            _clearListeners: function() {
                this._mapListeners.removeAll(),
                this._collectionListeners.removeAll()
            },
            _setYandexState: function() {
                this._yandexState && this._yandexState.setPoints(this._getPoints())
            },
            _getPoints: function() {
                var t = this._collection
                  , e = t.getMap()
                  , n = e.balloon && e.balloon.getOwner()
                  , i = n && n.geometry && n.state.get("active") && n.options.get("visible") === !1 && d(n, this._serviceGeoObjects)
                  , s = [];
                if (i && h(n) && s.push(n),
                c(t, s),
                s.length > 1e3)
                    return [];
                s.length > 10 && (s = u(s, e.getGlobalPixelCenter(), e.options.get("projection")));
                for (var r = [], a = 0, l = s.length; a < l && a < 10; a++)
                    r.push(o(s[a].geometry.getCoordinates()));
                return r
            }
        }),
        l.ignoreGeoObject = function(t) {
            f.set(t, !0)
        }
        ,
        t(l)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.MultiRouter", ["util.defineClass", "projection.wgs84Mercator", "projection.zeroZoom", "yandex.state.associate", "util.coordinates.toLatLong", "util.array", "util.pixelBounds", "multiRouter.utils"], function(t, e, i, o, s, n, u, a, l) {
        function r(t) {
            this._multiRoute = t,
            this._multiRouteModelListeners = null,
            this._yandexState = null,
            this._setupListeners()
        }
        function d(t) {
            for (var e = t.model.getWayPoints(), i = 0; i < e.length; i++)
                if (h(e[i]))
                    return !0;
            return !1
        }
        function h(t) {
            return t.geometry.getCoordinates()
        }
        var _ = function(t) {
            return t ? n(t) : ""
        };
        e(r, {
            _setupListeners: function() {
                this._multiRouterListeners = this._multiRoute.events.group().add("mapchange", this._onMapChange, this).add("click", this._updateState, this)
            },
            _clearListeners: function() {
                this._multiRouterListeners.removeAll(),
                this._multiRouterListeners = null
            },
            _setupMultiRouteListeners: function() {
                this._multiRouteModelListeners = this._multiRoute.model.events.group().add("requestsuccess", this._updateState, this),
                this._mapListeners = this._multiRoute.getMap().events.group().add("boundschange", this._onMapBoundsChange, this)
            },
            _clearMultiRouteListeners: function() {
                this._mapListeners && (this._mapListeners.removeAll(),
                this._mapListeners = null),
                this._multiRouteModelListeners && (this._multiRouteModelListeners.removeAll(),
                this._multiRouteModelListeners = null)
            },
            _onMapChange: function(t) {
                var e = t.get("newMap")
                  , i = t.get("oldMap");
                e ? (this._yandexState = s.get(e),
                this._setupMultiRouteListeners(),
                this._setYandexState()) : i && (this._clearMultiRouteListeners(),
                this._clearYandexState(),
                this._yandexState = null)
            },
            _onMapBoundsChange: function(t) {
                var e = t.get("target")
                  , i = e.getZoom()
                  , s = e.getGlobalPixelBounds()
                  , n = [o.fromGlobalPixels(s[0], i), o.fromGlobalPixels(s[1], i)]
                  , u = this._getZeroZoomBounds()
                  , l = this._yandexState.get("route")
                  , r = l && l.zeroZoomBounds;
                !u || !a.areIntersecting(n, u) || r && a.areIntersecting(n, r) || this._setYandexState()
            },
            _getZeroZoomBounds: function() {
                var t = this._multiRoute
                  , e = t.getBounds()
                  , s = t.getMap().getZoom();
                if (e)
                    return [o.fromGlobalPixels(i.toGlobalPixels(e[0], s), s), o.fromGlobalPixels(i.toGlobalPixels(e[1], s), s)]
            },
            _setYandexState: function() {
                if (d(this._multiRoute)) {
                    var t = this._multiRoute.model
                      , e = []
                      , i = u.map(t.getWayPoints(), h)
                      , o = u.map(t.getViaPoints(), h)
                      , s = 0
                      , n = 0
                      , a = t.getParams()
                      , r = t.getReferencePointIndexes()
                      , m = this._getActiveRouteIndex(this._multiRoute)
                      , c = "auto" == a.routingMode;
                    c ? (u.each(r.way, function(t) {
                        e[t] = _(i[s++])
                    }),
                    u.each(r.via, function(t) {
                        e[t] = _(o[n++])
                    })) : e = u.map(i, _),
                    this._yandexState.setRoute({
                        points: e,
                        mode: a.avoidTrafficJams ? "dtr" : "atm",
                        type: l.SHORT_TYPES[a.routingMode] || null,
                        viaIndexes: c ? r.via : [],
                        activeRouteIndex: m == -1 ? null : m,
                        zeroZoomBounds: this._getZeroZoomBounds()
                    })
                } else
                    this._clearYandexState()
            },
            _clearYandexState: function() {
                this._yandexState.setRoute(null)
            },
            _getActiveRouteIndex: function(t) {
                var e = t.getRoutes()
                  , i = t.getActiveRoute();
                return e.indexOf(i)
            },
            _updateState: function() {
                this._multiRoute.getMap() && this._setYandexState()
            }
        }),
        t(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.PoiBalloon", ["util.defineClass", "yandex.state.associate"], function(e, t, n) {
        function a(e) {
            this._balloonManager = e,
            e.events.add("activeobjectchange", this._onChange, this)
        }
        t(a, {
            destroy: function() {
                this._balloonManager.events.remove("activeobjectchange", this._onChange, this)
            },
            _onChange: function(e) {
                this._yandexState || (this._yandexState = n.get(e.get("map"))),
                this._yandexState.setActiveObject(e.get("activeObject"))
            }
        }),
        e(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.Router", ["yandex.state.associate", "util.coordinates.toLatLong", "util.array", "util.defineClass"], function(t, e, s, n, i) {
        function a(t) {
            this._route = t,
            this._routeListeners = null,
            this._setupListeners()
        }
        i(a, {
            _setupListeners: function() {
                this._route.events.add("mapchange", this._onMapChange, this)
            },
            _clearListeners: function() {
                this._route.events.remove("mapchange", this._onMapChange, this)
            },
            _setupRouteListeners: function() {
                this._routeListeners = this._route.events.group().add("update", this._onRouteUpdate, this)
            },
            _clearRouteListeners: function() {
                this._routeListeners && (this._routeListeners.removeAll(),
                this._routeListeners = null)
            },
            _onMapChange: function(t) {
                var s = t.get("newMap")
                  , n = t.get("oldMap");
                s ? (this._yandexState = e.get(s),
                this._setupRouteListeners(),
                this._setYandexState()) : n && (this._clearRouteListeners(),
                this._clearYandexState(),
                this._yandexState = null)
            },
            _onRouteUpdate: function() {
                this._setYandexState()
            },
            _setYandexState: function() {
                var t = []
                  , e = []
                  , i = 0
                  , a = []
                  , o = 0
                  , u = []
                  , r = this._route.requestPoints;
                this._route.getWayPoints().each(function(t) {
                    e.push(t.geometry.getCoordinates())
                }),
                this._route.getViaPoints().each(function(t) {
                    a.push(t.geometry.getCoordinates())
                }),
                n.each(r, function(n, r) {
                    n.type && "viaPoint" == n.type ? (t.push(s(a[o++])),
                    u.push(r)) : t.push(s(e[i++]))
                }),
                this._yandexState.setRoute({
                    points: t,
                    mode: this._route.options.get("avoidTrafficJams") ? "dtr" : "atm",
                    viaIndexes: u
                })
            },
            _clearYandexState: function() {
                this._yandexState && this._yandexState.setRoute(null)
            }
        }),
        t(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.RulerBehavior", ["yandex.state.associate", "util.defineClass"], function(e, t, n) {
        function r(e) {
            this._ruler = e,
            this._yandexState = null,
            this._rulerGeometryListeners = null,
            this._rulerListeners = null,
            this._setupListeners()
        }
        n(r, {
            _setupListeners: function() {
                this._rulerGeometryListeners = this._ruler.geometry.events.group().add("change", this._onRulerGeometryChange, this),
                this._rulerListeners = this._ruler.events.group().add("parentchange", this._onRulerParentChange, this)
            },
            _clearListeners: function() {
                this._rulerGeometryListeners.removeAll(),
                this._rulerListeners.removeAll()
            },
            _onRulerParentChange: function(e) {
                var n = e.get("newParent");
                e.get("oldParent");
                n && n.getMap() ? this._yandexState = t.get(n.getMap()) : this._yandexState && (this._clearRulerState(),
                this._yandexState = null)
            },
            _onRulerGeometryChange: function() {
                this._yandexState && this._saveRulerState()
            },
            _saveRulerState: function() {
                this._yandexState.setRulerState(this._ruler.getState())
            },
            _clearRulerState: function() {
                this._yandexState.setRulerState(null)
            }
        }),
        e(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.SearchControl", ["util.defineClass", "yandex.state.associate", "util.extend", "util.coordinates.toLatLong"], function(t, e, s, n, o) {
        function i(t) {
            this._searchControl = t,
            this._yandexState = s.get(t.getMap()),
            this._model = n({}, r),
            this._setupListeners(),
            this._init()
        }
        var r = {
            request: null,
            context: null,
            resultId: null,
            resultLayer: null,
            resultCoordinates: null
        }
          , a = {
            resultId: null,
            resultLayer: null,
            resultCoordinates: null
        };
        e(i, {
            destroy: function() {
                this._clearListeners()
            },
            _init: function() {
                var t, e = this._searchControl, s = e.state.get("currentIndex"), o = null;
                "number" == typeof s && (t = e.getResultsArray()[s],
                o = this._getResultInfo(t)),
                n(this._model, {
                    request: e.getRequestString(),
                    context: this._getContext()
                }, o),
                this._setYandexState()
            },
            _setupListeners: function() {
                var t = this._searchControl;
                this._controlListeners = t.events.group().add("submit", this._onSearch, this).add("load", this._onLoad, this).add("resultshow", this._onResultShow, this).add("resulthide", this._onResultHide, this).add("clearstate", this._onStateClear, this)
            },
            _clearListeners: function() {
                this._controlListeners.removeAll()
            },
            _getResultInfo: function(t) {
                var e = t.properties
                  , s = e.get("type", null)
                  , n = this._searchControl.options.get("provider")
                  , i = {
                    resultId: e.get("id", null)
                };
                if ("yandex#search" == n || "yandex#map" == n) {
                    switch (s) {
                    case "business":
                        i.resultLayer = "biz";
                        break;
                    case "public-map-object":
                        i.resultLayer = "psearch";
                        break;
                    default:
                        i.resultLayer = "geo"
                    }
                    i.resultCoordinates = o(t.geometry.getCoordinates())
                }
                return i
            },
            _getContext: function() {
                var t = this._searchControl.getProvider();
                return t && t.state.get("requestContext") || null
            },
            _onSearch: function() {
                this._model.request = this._searchControl.getRequestString(),
                this._setYandexState()
            },
            _onLoad: function() {
                this._model.context = this._getContext(),
                this._setYandexState()
            },
            _onResultShow: function(t) {
                var e = this._searchControl.getResultsArray()[t.get("index")];
                n(this._model, this._getResultInfo(e)),
                this._setYandexState()
            },
            _onResultHide: function() {
                n(this._model, a),
                this._setYandexState()
            },
            _onStateClear: function() {
                n(this._model, r),
                this._setYandexState()
            },
            _setYandexState: function() {
                this._yandexState.setSearch(this._model)
            }
        }),
        t(i)
    });
}
, function(ym) {
    ym.modules.define("yandex.state.component.Traffic", ["Monitor", "yandex.state.associate", "util.defineClass"], function(t, e, i, a) {
        function r(t) {
            this._trafficView = t,
            this._yandexState = i.get(t.getMap()),
            this._setupListeners(),
            this._setTrafficState()
        }
        function s(t) {
            return t.hours + "," + t.minutes
        }
        function n(t, e) {
            return t + ":" + e
        }
        var f = {
            CURRENT: "cur",
            ARCHIVE: "arc",
            FORECAST: "for"
        }
          , o = {
            DAY: "dow",
            TIME: "time"
        }
          , c = {
            OFFSET: "offset"
        };
        a(r, {
            destroy: function() {
                this._clearListeners(),
                this._yandexState.setTraffic(null),
                this._yandexState = null,
                this._trafficView = null
            },
            _setupListeners: function() {
                var t = this._trafficView
                  , i = t.getTrafficLayerType();
                i != f.CURRENT && (this._providerStateMonitor = new e(t.getProvider().state).add(["timestamp", "timeOffset"], this._setTrafficState, this))
            },
            _clearListeners: function() {
                this._providerStateMonitor && (this._providerStateMonitor.destroy(),
                this._providerStateMonitor = null)
            },
            _setTrafficState: function() {
                var t, e = this._trafficView, i = e.getTrafficLayerType(), a = e.getProvider();
                switch (i) {
                case f.ARCHIVE:
                    var r = a.getTime();
                    r && (t = [n(o.DAY, r.dayOfWeek), n(o.TIME, s(r))].join("~"));
                    break;
                case f.FORECAST:
                    var d = a.state.get("timeOffset");
                    d && (t = n(c.OFFSET, d))
                }
                this._yandexState.setTraffic({
                    mode: i,
                    state: t || null
                })
            }
        }),
        t(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.State", ["data.Manager", "util.array", "util.defineClass", "projection.wgs84Mercator", "projection.sphericalMercator", "yandex.yandexMapUrlProvider"], function(t, e, s, i, r, n, o) {
        function a(t) {
            a.superclass.constructor.call(this, {
                origin: "jsapi_" + ym.env.version.replace(/\W/g, "_"),
                source: "api-maps",
                from: "api-maps",
                host: window.location.host
            }),
            this._map = t,
            this._layers = []
        }
        var h = "trf";
        i(a, e, {
            getProjection: function() {
                return this._map.options.get("projection")
            },
            setWhere: function(t) {
                return this.set("where", t),
                this
            },
            setMapState: function(t) {
                return this.set("map", t),
                this
            },
            pushLayers: function(t) {
                return s.indexOf(this._layers, t) == -1 && (this._layers.push(t),
                this.set("layers", this._layers.slice())),
                this
            },
            removeLayers: function(t) {
                var e = s.indexOf(this._layers, t);
                return e != -1 && (this._layers.splice(e, 1),
                this.set("layers", this._layers.length ? this._layers.slice() : null)),
                this
            },
            setSearch: function(t) {
                return this.set("search", t),
                this
            },
            setTraffic: function(t) {
                return t ? this.pushLayers(h) : this.removeLayers(h),
                this.set("traffic", t),
                this
            },
            setRulerState: function(t) {
                return this.set("rulerState", t),
                this
            },
            setRoute: function(t) {
                return this.set("route", t),
                this
            },
            setPoints: function(t) {
                return this.set("points", t),
                this
            },
            setUserMap: function(t, e) {
                return t && e ? this.set("userMap", t + ":" + e) : this.unset("userMap"),
                this
            },
            setActiveObject: function(t) {
                return t ? "stop" == t.type ? (this.setPoiState(null),
                this.setStopState(t)) : (this.setStopState(null),
                this.setPoiState(t)) : (this.setPoiState(null),
                this.setStopState(null)),
                this
            },
            setStopState: function(t) {
                return this.set("stop", t),
                this
            },
            setPoiState: function(t) {
                return this.set("poi", t),
                this
            },
            buildLink: function() {
                var t = this._map
                  , e = ym.env.hosts.api.maps + "?origin=jsapi21"
                  , s = t.options.get("projection");
                if (s == r || s == n) {
                    var i = "longlat" != ym.env.coordinatesOrder
                      , a = t.getCenter();
                    return e + "&ll=" + (i ? a[1] : a[0]).toFixed(6) + "," + (i ? a[0] : a[1]).toFixed(6) + "&z=" + t.getZoom() + "&l=" + this._layers.join(",") + "&from=" + o.API_FROM
                }
                return e
            }
        }),
        t(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.suggest.provider", ["util.crossDomainXhr", "util.querystring"], function(e, t, s) {
        function n(e, n, r) {
            r = r || {};
            var i = ym.env.hosts.api.services.suggest + "v1/suggest"
              , o = {
                apikey: ym.env.suggestApikey,
                types: n,
                text: e,
                lang: ym.env.lang,
                results: r.results || 5,
                origin: "jsapi2Geocoder",
                print_address: "1"
            }
              , d = "longlat" != ym.env.coordinatesOrder;
            return r.boundedBy ? (o.bbox = [r.boundedBy[0][d ? 1 : 0], r.boundedBy[0][d ? 0 : 1], r.boundedBy[1][d ? 1 : 0], r.boundedBy[1][d ? 0 : 1]].join(","),
            o.strict_bounds = r.strictBounds ? "1" : "0") : o.bbox = "-180,-90,180,90",
            "osm" === ym.env.dataProvider && (o.osm_vertical = "only",
            o.enable_osm_toponyms = "1"),
            t(i + "?" + s.stringify(o)).then(function(e) {
                var t = JSON.parse(e);
                return (t.results || []).map(function(e) {
                    var t = (e.tags || []).indexOf("business") !== -1 ? "biz" : "geo"
                      , s = e.title.text;
                    return "biz" !== t && e.subtitle && (s += ", " + e.subtitle.text),
                    {
                        type: t,
                        displayName: s,
                        value: e.address && e.address.formatted_address || e.title.text,
                        hl: (e.title.hl || []).map(function(e) {
                            return [e.begin, e.end]
                        })
                    }
                })
            }, function(e) {
                return e
            })
        }
        e(n)
    });
}
, function(ym) {
    ym.modules.define("yandex.taxi.constructLink", ["util.extend", "util.coordinates.convert", "util.querystring"], function(r, t, n, e) {
        function a(r, a) {
            if (!m)
                return null;
            r = r && n(r, ym.env.coordinatesOrder, "latlong"),
            a = a && n(a, ym.env.coordinatesOrder, "latlong");
            var u = t({}, l, {
                "start-lat": r ? r[0] : "",
                "start-lon": r ? r[1] : "",
                "end-lat": a ? a[0] : "",
                "end-lon": a ? a[1] : ""
            });
            return c + "?" + e.stringify(u)
        }
        var u = {
            ru: "ru",
            us: "com",
            gb: "com",
            ua: "ua",
            kz: "kz",
            tr: "com"
        }
          , o = {
            ru: "ru",
            en: "com",
            uk: "ua",
            kk: "kz",
            tr: "com"
        }
          , i = {
            ru: "ru",
            ua: "ua",
            kz: "kk",
            com: "com"
        }
          , c = "https://3.redirect.appmetrica.yandex.com/route"
          , m = u[ym.env.countryCode] || o[ym.env.languageCode]
          , d = i[m]
          , l = {
            utm_source: "yamaps",
            utm_medium: "api",
            appmetrica_tracking_id: "241755468559577482",
            ref: "2334695",
            domain: m,
            lang: d
        };
        r(a)
    });
}
, function(ym) {
    ym.modules.define("yandex.taxi.count", ["system.browser", "yandex.counter"], function(e, o, n) {
        e({
            click: function(e) {
                n.countByKey("distribution", {
                    path: [e, "taxi", o.platform, n.versionPrefix].join("."),
                    share: 1,
                    useCustomPrefix: !0
                })
            },
            shown: function(e) {
                n.countByKey("modulesUsage", {
                    path: "showTaxi." + e,
                    share: .1,
                    useCustomPrefix: !0
                })
            }
        })
    });
}
, function(ym) {
    ym.modules.define("yandex.taxi.fetchRouteInfo", ["util.array", "util.coordinates.convert", "util.crossDomainXhr", "yandex.counter"], function(e, n, t, r, a) {
        function l(e, a) {
            e = t(e, ym.env.coordinatesOrder, "longlat"),
            a = a && t(a, ym.env.coordinatesOrder, "longlat");
            var l;
            l = a ? "{start-lon},{start-lat}~{end-lon},{end-lat}".replace("{start-lon}", e[0]).replace("{start-lat}", e[1]).replace("{end-lon}", a[0]).replace("{end-lat}", a[1]) : "{lon},{lat}".replace("{lon}", e[0]).replace("{lat}", e[1]);
            var o = l;
            if (c[o])
                return c[o];
            var u = ym.env.hosts.taxiRouteInfo.replace("{rll}", encodeURIComponent(l))
              , s = +new Date
              , m = !0
              , p = r(u, {
                headers: {
                    Accept: "application/json"
                }
            }, m).then(function(e) {
                return e ? (i(s),
                e = JSON.parse(e),
                {
                    currency: String(e.currency),
                    distance: e.distance ? Number(e.distance) : null,
                    time: e.time ? Number(e.time) : null,
                    options: n.map(e.options, function(e) {
                        return {
                            classLevel: Number(e.class_level),
                            className: String(e.class_name),
                            classText: String(e.class_text),
                            minPrice: Number(e.min_price),
                            price: e.price ? Number(e.price) : null,
                            waitingTime: e.waiting_time ? Number(e.waiting_time) : null
                        }
                    })
                }) : null
            })["catch"](function(e) {
                return null
            });
            return c[o] = p,
            p
        }
        function i(e) {
            var n = 200
              , t = +new Date;
            t - e > n && a.countByKey("error", {
                path: "taxiTimeout",
                share: 1,
                useCustomPrefix: !0
            })
        }
        var c = {};
        e(l)
    });
}
, function(ym) {
    ym.modules.define("yandex.taxi.helper", [], function(n) {
        var e = {};
        e.getCheapestOption = function(n) {
            return n && n.options && n.options.length > 0 ? n.options.reduce(function(n, e) {
                return n.minPrice > e.minPrice ? e : n
            }) : null
        }
        ,
        n(e)
    });
}
, function(ym) {
    ym.modules.define("yandex.timetableProvider", ["vow", "system.browser", "util.crossDomainXhr", "util.querystring", "util.array", "util.extend", "util.safeAccess"], function(t, e, n, r, i, a, o, s) {
        var u = ym.env.hosts.api.services.route
          , A = "v2/masstransit/stations"
          , c = {
            STATION_TYPES: {
                TRAIN_STATION: "train_station",
                AIRPORT: "airport",
                STATION: "station"
            },
            AVAILABLE_LANGS: ["ru", "en", "uk", "tr"],
            AVAILABLE_COUNTRIES: ["RU", "TR", "UA"],
            getNearestStations: function(t, e, n, i) {
                var a = c._getApiUrl(t, e, n, i);
                return r(a, {
                    headers: {
                        Accept: "application/json"
                    }
                }).then(function(t) {
                    return JSON.parse(t)
                })
            },
            getNearestStation: function(t, e, n) {
                return c.getNearestStations(t, e, void 0, n).then(function(t) {
                    return c._findNearestStation(t)
                })
            },
            getNearestStationByType: function(t, e, n, r) {
                return r = r || {},
                r.st = n,
                c.getNearestStation(t, e, r)
            },
            getNearestTrainStation: function(t, e, n) {
                return c.getNearestStationByType(t, e, c.STATION_TYPES.TRAIN_STATION, n)
            },
            getNearestTrainStop: function(t, e, n) {
                return c.getNearestStationByType(t, e, c.STATION_TYPES.STATION, n)
            },
            getNearestAirport: function(t, e, n) {
                return c.getNearestStationByType(t, e, c.STATION_TYPES.AIRPORT, n)
            },
            getStationUrl: function(t) {
                var e = "Desktop" == n.platform ? "desktop_url" : "touch_url";
                return "station" == t.station_type ? s(t, "type_choices.suburban." + e) : s(t, "type_choices.tablo." + e)
            },
            isLangAcceptable: function(t) {
                return c._langToApiAcceptableLang(t) == t
            },
            _findNearestStation: function(t) {
                return t.length > 0 ? a.reduce(t, function(t, e) {
                    return t.distance > e.distance ? e : t
                }, t[0]) : null
            },
            _langToApiAcceptableLang: function(t) {
                var e = t.split("_")
                  , n = e[0]
                  , r = e[1];
                return n = a.indexOf(c.AVAILABLE_LANGS, n) > -1 ? n : c.AVAILABLE_LANGS[0],
                r = a.indexOf(c.AVAILABLE_COUNTRIES, r) > -1 ? r : c.AVAILABLE_COUNTRIES[0],
                n + "_" + r
            },
            _getApiUrl: function(t, e, n, r) {
                r = r || {};
                var a = o({}, r, {
                    ll: [e, t].join(","),
                    distance: n || .5
                });
                return u + A + "?" + i.stringify(a)
            }
        };
        t(c)
    });
}
, function(ym) {
    ym.modules.define("yandex.timeZone", ["yandex.dataProvider", "traffic.constants", "vow"], function(e, t, n, a) {
        var r = {
            get: function(e, r) {
                var o = [n.layers.geoId, n.layers.regionInfo]
                  , l = a.defer();
                return t.getLayersInfo(o, e, r).then(this._getCallback(l), this._getRejectCallback(l)),
                l.promise()
            },
            _getCallback: function(e) {
                return function(t) {
                    var a = n.layers.regionInfo
                      , r = null
                      , o = null
                      , l = !1;
                    if (t[a] && t[a].LayerMetaData)
                        for (var f = t[a].LayerMetaData, c = 0, i = f.length; c < i && !l; c++)
                            o = f[c].offset,
                            r = f[c].dst,
                            null != o && null != r && (l = !0);
                    l ? e.resolve({
                        offset: o,
                        dst: r
                    }) : e.reject("Not found")
                }
            },
            _getRejectCallback: function(e) {
                return function() {
                    e.reject()
                }
            }
        };
        e(r)
    });
}
, function(ym) {
    ym.modules.define("yandex.yandexMapUrlProvider", ["util.querystring", "util.extend", "util.coordinates.convert", "util.bounds", "projection.wgs84Mercator"], function(t, n, r, e, o, i) {
        function a() {
            return encodeURIComponent(document.location.protocol + "//" + document.location.host)
        }
        function d(t) {
            return r({}, t, {
                utm_source: U.API_UTM_SOURCE
            })
        }
        function l(t) {
            return r({}, t, {
                from: U.API_FROM
            })
        }
        function u(t) {
            return r({}, t, {
                utm_medium: a()
            })
        }
        function c(t) {
            return l(d(t))
        }
        function g(t) {
            return c(u(t))
        }
        function s(t, r) {
            return r ? f + r + "?" + n.stringify(t) : f + "?" + n.stringify(t)
        }
        var f = ym.env.hosts.api.maps
          , m = ym.env.browser
          , U = {};
        U.API_UTM_SOURCE = "api-maps",
        U.API_FROM = U.API_UTM_SOURCE,
        U.getEditOrganizationDesktopUrl = function(t) {
            var n = {
                oid: t,
                ol: "biz",
                feedback: "edit-organization"
            };
            return n = g(n),
            s(n)
        }
        ,
        U.getEditOrganizationMobileUrl = function(t) {
            var n = {
                oid: t,
                type: "business_complaint"
            };
            return n = g(n),
            s(n, "mobile-feedback/")
        }
        ,
        U.getEditOrganizationPlatformUrl = function(t) {
            return m.isMobile && !m.isTablet ? U.getEditOrganizationMobileUrl(t) : U.getEditOrganizationDesktopUrl(t)
        }
        ,
        U.getEditToponymUrl = function(t) {
            var n = {
                ol: "geo",
                ouri: t,
                feedback: "edit-toponym"
            };
            return n = c(n),
            s(n)
        }
        ,
        U.getSearchByAddressUrl = function(t, n, r) {
            var e = {
                ll: [n, t].join(","),
                text: r,
                mode: "search"
            };
            return e = c(e),
            s(e)
        }
        ,
        U.getAddToponymUrl = function(t, n, r) {
            var e = {
                ll: [n, t].join(","),
                z: r,
                feedback: "add-toponym"
            };
            return e = c(e),
            s(e)
        }
        ,
        U.getAddOrganizationDesktopUrl = function(t, n, r) {
            var e = {
                ll: [n, t].join(","),
                z: r,
                feedback: "add-organization"
            };
            return e = c(e),
            s(e)
        }
        ,
        U.getAddOrganizationMobileUrl = function() {
            var t = {
                type: "business_add"
            };
            return s(t, "mobile-feedback/")
        }
        ,
        U.getAddOrganizationPlatformUrl = function(t, n, r) {
            return m.isMobile ? U.getAddOrganizationMobileUrl() : U.getAddOrganizationDesktopUrl(t, n, r)
        }
        ,
        U.getMasstransitUrl = function(t, r, e, o) {
            var i = {
                ll: [r, t].join(","),
                z: e,
                mode: "stop",
                "masstransit[stopId]": o
            };
            return i = c(i),
            ym.env.hosts.api.maps + "?" + n.stringify(i)
        }
        ,
        U.getRouteUrl = function(t, n, o) {
            t && (t = e(t, ym.env.coordinatesOrder, "latlong")),
            n && (n = e(n, ym.env.coordinatesOrder, "latlong"));
            var i = {
                rtext: [t, n].join("~")
            };
            return i = r(i, o),
            i = c(i),
            s(i)
        }
        ,
        U.getRouteUrlWithMapState = function(t, n, r) {
            var a = o.toCenterAndSpan(t.getBounds(), i)
              , d = e(a.ll, ym.env.coordinatesOrder, "longlat")
              , l = e(a.spn, ym.env.coordinatesOrder, "longlat");
            return U.getRouteUrl(n, r, {
                ll: d.join(","),
                spn: l.join("."),
                z: t.getZoom()
            })
        }
        ,
        U.getRateUrl = function(t) {
            var n = {
                "orgpage[id]": t,
                "add-review": ""
            };
            return n = g(n),
            s(n)
        }
        ,
        U.addFromParamToStringUrl = function(t) {
            return t += t.match(/\?/) ? "&" : "?",
            t += "from=" + U.API_UTM_SOURCE
        }
        ,
        U.getTrafficSituationUrl = function(t, n, r) {
            var o = {
                l: r && r.join(",") || "trf,trfe",
                ll: e(t, ym.env.coordinatesOrder, "longlat").join(","),
                z: n,
                mode: "traffic"
            };
            return s(o)
        }
        ,
        U.getOrganizationPageUrl = function(t) {
            var n = c({
                "orgpage[id]": t
            });
            return s(n)
        }
        ,
        t(U)
    });
}
, function(ym) {
    ym.modules.define('balloon.content.layout.html', ["balloon-content"], function(provide) {
        provide([2003, "data.get(\"contentHeader\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__header\">", 2001, ["contentHeader", [["raw", null]]], 0, "</ymaps>", 2005, null, 2001, ["contentBody", [["default", "content"], ["raw", null]]], 2003, "data.get(\"contentFooter\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__footer\">", 2001, ["contentFooter", [["raw", null]]], 0, "</ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('balloon.layout.html', ["balloon", "i-custom-scroll", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "popup__close", "popup_has-close_yes", "balloon_size_mini", "balloon_type_route"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-balloon ymaps-2-1-79-balloon_layout_normal ymaps-2-1-79-balloon_to_top ymaps-2-1-79-i-custom-scroll\"><ymaps class=\"ymaps-2-1-79-balloon__layout\">", 2003, "data.get(\"options.closeButton\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon__close\"><ymaps class=\"ymaps-2-1-79-balloon__close-button\"></ymaps></ymaps>", 2005, null, 0, "<ymaps class=\"ymaps-2-1-79-balloon__content\">", 2002, ["options.contentLayout", [["observeSize"], ["maxWidth", "options.maxWidth"], ["maxHeight", "options.maxHeight"], ["minWidth", "options.minWidth"], ["minHeight", "options.minHeight"]]], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-balloon__tail\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('balloonPanel.layout.html', ["balloon", "i-custom-scroll", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "popup__close", "popup_has-close_yes", "balloon_size_mini", "balloon_type_route"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-balloon ymaps-2-1-79-balloon_layout_panel ymaps-2-1-79-i-custom-scroll ymaps-2-1-79-islets_balloon_layout_panel\">", 2003, "data.get(\"options.closeButton\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon__close\"><ymaps class=\"ymaps-2-1-79-balloon__close-button\"></ymaps></ymaps>", 2005, null, 0, "<ymaps class=\"ymaps-2-1-79-balloon__content\">", 2002, ["options.contentLayout", [["observeSize"], ["maxWidth", "options.maxWidth"], ["minWidth", "options.minWidth"], ["maxHeight", "options.maxHeight"], ["minHeight", "options.minHeight"]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('button.layout.html', ["float-button"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-float-button\" ", 2009, null, 0, "max-width: ", 2001, ["state.maxWidth", [["raw", null]]], 0, "px", 2010, null, 0, " title=\"", 2001, ["data.title", [["raw", null]]], 0, "\"><ymaps class=\"ymaps-2-1-79-float-button-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-float-button-text\">", 2001, ["data.content", [["default", "\"\""], ["raw", null]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('circleDotIconWithCaption.layout.html', ["islets-icon-caption", "islets-circle-dot-icon-with-caption"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_circle-dot-icon-with-caption\"><ymaps class=\"ymaps-2-1-79-islets_circle-dot-icon-with-caption__caption-block\"><ymaps class=\"ymaps-2-1-79-islets_icon-caption\">", 2001, ["properties.iconCaption", []], 0, "</ymaps></ymaps>", 2002, ["islands#circleDotIconWithoutCaption", [["name", "\"baseIcon\""]]], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('cluster.default.css', ["cluster-default"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('cluster.nightContent.css', ["cluster-night-content"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('clusterAccordion.layout.html', ["b-cluster-accordion", "b-cluster-accordion_layout_panel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-accordion ymaps-2-1-79-b-cluster-accordion_list_marker ymaps-2-1-79-b-cluster-content\" ", 2009, null, 2003, "!data.get(\"options.panelMode\")", 0, "\nwidth: ", 2001, ["options.contentLayoutWidth", [["default", "305"], ["raw", null]]], 0, "px;\n", 2005, null, 0, "\nheight: ", 2001, ["options.contentLayoutHeight", [["default", "283"], ["raw", null]]], 0, "px;", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__menu\">", 2006, "geoObject in properties.geoObjects", 0, "<ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item\"><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-title\"><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-number\"></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-caption\">", 2001, ["geoObject.properties.clusterCaption", [["default", "geoObject.properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-content\"></ymaps></ymaps>", 2007, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterAccordion.layout.itemContent.html', ["cluster-accordion-panel", "b-cluster-content", "b-cluster-accordion", "b-cluster-accordion_layout_panel"], function(provide) {
        provide([2003, "data.get(\"options.panelMode\")", 0, "<ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__content-item\" ", 2009, null, 0, "height: ", 2001, ["options.contentLayoutHeight", [["default", "210"]]], 0, "px;", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__item-header ymaps-2-1-79-b-cluster-content__header\">", 2001, ["properties.clusterCaption", [["default", "properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__item-body ymaps-2-1-79-b-cluster-content__body\">", 2001, ["properties.balloonContentBody", [["default", "properties.balloonContent"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__item-footer ymaps-2-1-79-b-cluster-content__footer\">", 2001, ["properties.balloonContentFooter", [["raw", null]]], 0, "</ymaps></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-content-inner\"><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-body ymaps-2-1-79-b-cluster-content__body\">", 2001, ["properties.balloonContentBody", [["default", "properties.balloonContent"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-accordion__item-footer ymaps-2-1-79-b-cluster-content__footer\">", 2001, ["properties.balloonContentFooter", [["raw", null]]], 0, "</ymaps></ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('clusterAccordionPanel.layout.html', ["cluster-accordion-panel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-cluster-accordion-panel ymaps-2-1-79-b-cluster-content\"><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__inner ymaps-2-1-79-cluster-accordion-panel-swipe-animation\"><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__section ymaps-2-1-79-cluster-accordion-panel__section_type_nav\"><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__menu\" ", 2009, null, 0, "height: ", 2001, ["options.contentLayoutHeight", [["default", "210"]]], 0, "px;", 2010, null, 0, ">", 2006, "geoObject in properties.geoObjects", 0, "<ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__menu-item\"><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__menu-item-number\"></ymaps><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__menu-item-text\">", 2001, ["geoObject.properties.clusterCaption", [["default", "geoObject.properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps></ymaps>", 2007, null, 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__section ymaps-2-1-79-cluster-accordion-panel__section_type_content\"><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__menu-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-cluster-accordion-panel__content-holder\" ", 2009, null, 0, "height: ", 2001, ["options.contentLayoutHeight", [["default", "210"]]], 0, "px;", 2010, null, 0, "></ymaps></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterCarousel.layout.contentItem.html', ["b-cluster-carousel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-carousel__item-content-inner\"><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__header ymaps-2-1-79-b-cluster-content__header\">", 2001, ["properties.clusterCaption", [["default", "properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__body ymaps-2-1-79-b-cluster-content__body\">", 2001, ["properties.balloonContentBody", [["default", "properties.balloonContent"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__footer ymaps-2-1-79-b-cluster-content__footer\">", 2001, ["properties.balloonContentFooter", [["raw", null]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterCarousel.layout.html', ["b-cluster-carousel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-carousel ymaps-2-1-79-b-cluster-carousel_pager_", 2001, ["options.pagerType", []], 0, " ymaps-2-1-79-b-cluster-content\" ", 2009, null, 2003, "!data.get(\"options.panelMode\")", 0, "\nwidth: ", 2001, ["options.contentLayoutWidth", [["default", "308"], ["raw", null]]], 0, "px;\n", 2005, null, 0, "\nheight: ", 2001, ["options.contentLayoutHeight", [["default", "177"], ["raw", null]]], 0, "px;\n", 2003, "!data.get(\"options.pagerVisible\")", 0, "\nmargin-bottom: 0px;\n", 2005, null, 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__layout\"><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__content\" ", 2009, null, 0, "height: ", 2001, ["options.contentLayoutHeight", [["default", "177"], ["raw", null]]], 0, "px;", 2010, null, 0, "><ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__content-item ymaps-2-1-79-b-cluster-carousel__content-item_current_yes\"></ymaps></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__nav ymaps-2-1-79-b-cluster-carousel__nav_type_prev\"></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__nav ymaps-2-1-79-b-cluster-carousel__nav_type_next\"></ymaps></ymaps><ymaps>", 2003, "data.get(\"options.pagerVisible\")", 2002, ["options.pagerLayout", []], 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterCarousel.layout.pager.html', ["b-cluster-carousel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-carousel__pager\"></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-carousel__separator\"></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterCarousel.layout.pagerItem.html', ["b-cluster-carousel", "b-cluster-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-carousel__pager-item\">0</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterTabs.layout.content.html', ["b-cluster-content", "b-cluster-tabs"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-tabs__content-item\"><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__item-header ymaps-2-1-79-b-cluster-content__header\">", 2001, ["properties.clusterCaption", [["default", "properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__item-body ymaps-2-1-79-b-cluster-content__body\">", 2001, ["properties.balloonContentBody", [["default", "properties.balloonContent"], ["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__item-footer ymaps-2-1-79-b-cluster-content__footer\">", 2001, ["properties.balloonContentFooter", [["raw", null]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterTabs.layout.html', ["b-cluster-content", "b-cluster-tabs"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-tabs ymaps-2-1-79-b-cluster-content\" ", 2009, null, 2003, "!data.get(\"options.panelMode\")", 0, "\nwidth: ", 2001, ["options.contentLayoutWidth", [["default", "475"], ["raw", null]]], 0, "px;\n", 2005, null, 0, "\nheight: ", 2001, ["options.contentLayoutHeight", [["default", "210"], ["raw", null]]], 0, "px;", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__section ymaps-2-1-79-b-cluster-tabs__section_type_nav\" ", 2009, null, 0, "width: ", 2001, ["options.leftColumnWidth", [["default", "125"], ["raw", null]]], 0, "px;", 2010, null, 0, "><ymaps>", 2002, ["options.leftColumnLayout", []], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__section ymaps-2-1-79-b-cluster-tabs__section_type_content\" ", 2009, null, 0, "height: 100%;", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__menu-icon\"></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('clusterTabs.layout.menu.html', ["b-cluster-content", "b-cluster-tabs"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-b-cluster-tabs__menu\" ", 2009, null, 0, "height: ", 2001, ["options.contentLayoutHeight", [["default", "210"]]], 0, "px;", 2010, null, 0, ">", 2006, "geoObject in properties.geoObjects", 0, "<ymaps class=\"ymaps-2-1-79-b-cluster-tabs__menu-item\"><ymaps class=\"ymaps-2-1-79-b-cluster-tabs__menu-item-text\">", 2001, ["geoObject.properties.clusterCaption", [["default", "geoObject.properties.balloonContentHeader"], ["raw", null]]], 0, "</ymaps></ymaps>", 2007, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('control.manager.css', ["control-manager"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('copyright.layout.html', ["copyright", "copyright__logo"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-copyright\"><ymaps class=\"ymaps-2-1-79-copyright__fog\">…</ymaps><ymaps class=\"ymaps-2-1-79-copyright__wrap\"><ymaps class=\"ymaps-2-1-79-copyright__layout\"><ymaps class=\"ymaps-2-1-79-copyright__content-cell\"><ymaps class=\"ymaps-2-1-79-copyright__content\"><ymaps class=\"ymaps-2-1-79-copyright__text\"></ymaps><ymaps class=\"ymaps-2-1-79-copyright__agreement\">&nbsp;<a class=\"ymaps-2-1-79-copyright__link\" target=\"_blank\" href=\"", 2001, ["data.userAgreementLink", []], 0, "\" rel=\"noopener\"></a></ymaps></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-copyright__logo-cell\"><a class=\"ymaps-2-1-79-copyright__logo\" href=\"\" target=\"_blank\"></a></ymaps></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('dotIconWithCaption.layout.html', ["islets-icon-caption", "islets-dot-icon-with-caption"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_dot-icon-with-caption\"><ymaps class=\"ymaps-2-1-79-islets_dot-icon-with-caption__caption-block\"><ymaps class=\"ymaps-2-1-79-islets_icon-caption\">", 2001, ["properties.iconCaption", []], 0, "</ymaps></ymaps>", 2002, ["islands#dotIconWithoutCaption", [["name", "\"baseIcon\""]]], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('editorVertexMenu.layout.html', ["islets-editor-vertex-menu"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_editor-vertex-menu\">", 2006, "index, item in properties.items", 0, "<ymaps class=\"ymaps-2-1-79-islets_editor-vertex-menu__item\" title=\"", 2001, ["item.hint", []], 0, "\" item-index=\"", 2001, ["index", []], 0, "\">", 2001, ["item.title", [["raw", null]]], 0, "</ymaps>", 2007, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('floatButton.layout.html', ["float-button"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-float-button\" ", 2009, null, 0, "max-width: ", 2001, ["state.maxWidth", [["raw", null]]], 0, "px", 2010, null, 0, " title=\"", 2001, ["data.title", [["raw", null]]], 0, "\"><ymaps class=\"ymaps-2-1-79-float-button-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-float-button-text\">", 2001, ["data.content", [["default", "\"\""], ["raw", null]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('geoObject.balloonContent.layout.html', ["balloon-content"], function(provide) {
        provide([2003, "data.get(\"properties.balloonContentHeader\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__header\">", 2001, ["properties.balloonContentHeader", [["raw", null]]], 0, "</ymaps>", 2005, null, 2001, ["properties.balloonContentBody", [["default", "properties.balloonContent"], ["raw", null]]], 2003, "data.get(\"properties.balloonContentFooter\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__footer\">", 2001, ["properties.balloonContentFooter", [["raw", null]]], 0, "</ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('hint.layout.html', ["hint"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-hint\"><ymaps class=\"ymaps-2-1-79-hint__text\">", 2002, ["options.contentLayout", [["observeSize"], ["maxWidth", "options.maxWidth"], ["maxHeight", "options.maxHeight"], ["minWidth", "options.minWidth"], ["minHeight", "options.minHeight"]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('hotspotLayer.balloonContent.layout.html', ["balloon-content"], function(provide) {
        provide([2003, "data.get(\"balloonContentHeader\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__header\">", 2001, ["balloonContentHeader", [["raw", null]]], 0, "</ymaps>", 2005, null, 2001, ["balloonContentBody", [["default", "balloonContent"], ["raw", null]]], 2003, "data.get(\"balloonContentFooter\")", 0, "<ymaps class=\"ymaps-2-1-79-balloon-content__footer\">", 2001, ["balloonContentFooter", [["raw", null]]], 0, "</ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('islets.card.layout.contacts.html', ["islets-variables", "islets-advert", "islets-card"], function(provide) {
        provide([2003, "data.get(\"properties.url\") || data.get(\"properties.phoneNumbers\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__separator\"></ymaps>", 2005, null, 2003, "data.get(\"properties.phoneNumbers\") || data.get(\"properties.url\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__contacts\">", 2003, "data.get(\"properties.phoneNumbers\") && data.get(\"properties.phoneNumbers.length\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__contacts-phones\">", 2006, "phoneIndex, phone in properties.phoneNumbers", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__contacts-phones-item\"><a class=\"ymaps-2-1-79-islets_card__contacts-phones-item-text\" href=\"\">", 2001, ["phone", []], 0, "</a></ymaps>", 2007, null, 2003, "data.get(\"properties.phoneNumbers.length\") > 1", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__contacts-phones-more\"></ymaps>", 2005, null, 0, "</ymaps>", 2005, null, 2003, "data.get(\"properties.url\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__contacts-urls\"><a class=\"ymaps-2-1-79-islets_card__contacts-url\" href=\"", 2001, ["properties.url", []], 0, "\" target=\"_blank\">", 2001, ["properties.url", []], 0, "</a></ymaps>", 2005, null, 0, "</ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('islets.card.layout.html', ["islets-variables", "islets-advert", "islets-card"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_card\" data-has-working-status=\"", 2003, "data.get(\"properties.workingStatus\")", 0, "true", 2004, null, 0, "false", 2005, null, 0, "\"><ymaps class=\"ymaps-2-1-79-islets_card__title\">", 2003, "data.get(\"properties.type\") == \"poi\"", 0, "<a class=\"ymaps-2-1-79-islets_card__title-poi-link\" href=\"\" target=\"_blank\">", 2001, ["properties.name", []], 0, "</a>", 2008, "data.get(\"properties.type\") == \"toponym\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__title-toponym-link\">", 2001, ["properties.name", []], 0, "</ymaps>", 2008, "data.get(\"properties.type\") == \"business\"", 0, "<a class=\"ymaps-2-1-79-islets_card__title-business-link\" href=\"\" target=\"_blank\">", 2001, ["properties.name", []], 0, "</a>", 2008, "data.get(\"properties.type\") == \"stop\"", 0, "<a class=\"ymaps-2-1-79-islets_card__title-stop-link\" href=\"\" target=\"_blank\">", 2001, ["properties.mtrData.title", []], 0, "</a>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__title-link\">", 2001, ["properties.name", []], 0, "</ymaps>", 2005, null, 0, "</ymaps>", 2003, "data.get(\"properties.categoriesText\") || data.get(\"properties.description\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__description\">", 2003, "(data.get(\"properties.type\") == \"poi\" || data.get(\"properties.type\") == \"business\") && data.get(\"properties.categoriesText\")", 2001, ["properties.categoriesText", []], 2004, null, 2001, ["properties.description", []], 2005, null, 0, "</ymaps>", 2005, null, 2003, "data.get(\"properties.type\") == \"business\"", 2002, ["options.cardStatusLayout", []], 2005, null, 2002, ["options.cardContactsLayout", []], 2003, "data.get(\"properties.mtrData.undergroundLineMeta\") && data.get(\"properties.mtrData.undergroundLineMeta.name\")", 2003, "data.get(\"properties.mtrData.undergroundLineMeta.color\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__underground-line\"><ymaps class=\"ymaps-2-1-79-islets_card__underground-line-icon\" ", 2009, null, 0, "background-color: ", 2001, ["properties.mtrData.undergroundLineMeta.color", []], 2010, null, 0, "></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__underground-line-text\">", 2001, ["properties.mtrData.undergroundLineMeta.name", []], 0, "</ymaps></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__underground-line\"><ymaps class=\"ymaps-2-1-79-islets_card__underground-line-text\">", 2001, ["properties.mtrData.undergroundLineMeta.name", []], 0, "</ymaps></ymaps>", 2005, null, 2005, null, 2003, "data.get(\"properties.type\") == \"stop\"", 2003, "data.get(\"properties.type\") == \"stop\" && data.get(\"properties.mtrData.type\") == \"underground\" && data.get(\"properties.type\") == \"stop\" && data.get(\"properties.mtrData.type\") == \"underground\" && data.get(\"properties.mtrData.hasMetroAppSupport\") === true", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__stop-buttons\"><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button-text\">", 2001, ["localization.distribution.mapsPromoGetThere", []], 0, "</ymaps></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><a class=\"ymaps-2-1-79-islets_card__stop-info-button\" target=\"_blank\" href=\"\"><ymaps class=\"ymaps-2-1-79-islets_card__stop-info-button-text\">", 2001, ["localization.ppo.Card.metroScheme", []], 0, "</ymaps></a></ymaps></ymaps>", 2008, "data.get(\"properties.type\") == \"stop\" && data.get(\"properties.mtrData.type\") == \"underground\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__stop-buttons\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button-text\">", 2001, ["localization.distribution.mapsPromoGetThere", []], 0, "</ymaps></ymaps></ymaps>", 2008, "data.get(\"properties.type\") == \"stop\" && data.get(\"properties.mtrData.type\") == \"railway\" && !( data.get(\"properties.timetableStationUrl\") )", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__stop-buttons\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button-text\">", 2001, ["localization.distribution.mapsPromoGetThere", []], 0, "</ymaps></ymaps></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__stop-buttons\"><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button-text\">", 2001, ["localization.distribution.mapsPromoGetThere", []], 0, "</ymaps></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><a class=\"ymaps-2-1-79-islets_card__stop-info-button\" target=\"_blank\" href=\"\"><ymaps class=\"ymaps-2-1-79-islets_card__stop-info-button-text\">", 2003, "data.get(\"properties.type\") == \"stop\" && data.get(\"properties.mtrData.type\") == \"railway\"", 2001, ["localization.ppo.Card.railwayTimetable", []], 2004, null, 2001, ["localization.ppo.Card.routesList", []], 2005, null, 0, "</ymaps></a></ymaps></ymaps>", 2005, null, 2005, null, 2003, "data.get(\"properties.type\") == \"business\" || (data.get(\"properties.stops\") && data.get(\"properties.stops.length\") > 0)", 2003, "data.get(\"properties.type\") == \"stop\" && (data.get(\"properties.stops\") && data.get(\"properties.stops.length\") > 0)", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__separator ymaps-2-1-79-islets__stop-title-separator\"></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__separator\"></ymaps>", 2005, null, 2005, null, 2003, "(data.get(\"internal\") && data.get(\"internal.taxiBlock\"))", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__taxi-full-block\"><a class=\"ymaps-2-1-79-islets_card__taxi-link\" href=\"", 2001, ["properties.taxiInfo.openTaxiAppUrl", []], 0, "\" target=\"_blank\">", 2001, ["localization.ppo.Card.orderYandexTaxi", []], 0, "</a><ymaps class=\"ymaps-2-1-79-islets_card__taxi-price\">", 2001, ["internal.taxiPriceContent", []], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__separator\"></ymaps>", 2005, null, 2003, "data.get(\"properties.type\") == \"business\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__address\">", 2001, ["properties.address", []], 0, "</ymaps>", 2008, "data.get(\"properties.type\") == \"poi\" && data.get(\"properties.kind\") == \"house\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__address\">", 2001, ["properties.address", []], 0, "</ymaps>", 2005, null, 2003, "data.get(\"properties.stops\")", 2002, ["options.cardMetroLayout", []], 2005, null, 2003, "data.get(\"properties.type\") == \"business\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__business-buttons\"><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button\"><ymaps class=\"ymaps-2-1-79-islets_card__route-button-text\">", 2001, ["localization.distribution.mapsPromoGetThere", []], 0, "</ymaps></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__buttons-cell\"><a class=\"ymaps-2-1-79-islets_card__business-button\" target=\"_blank\" href=\"\"><ymaps class=\"ymaps-2-1-79-islets_card__business-button-text\">", 2001, ["localization.distribution.yaOpenOrgInMaps", []], 0, "</ymaps></a></ymaps></ymaps>", 2008, "data.get(\"properties.type\") == \"toponym\" && data.get(\"properties.kind\") == \"house\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__buttons\">", 2002, ["layout#houseOrgButton", []], 0, "</ymaps>", 2008, "!( data.get(\"properties.type\") == \"stop\" )", 2002, ["options.cardOpenInYmapsLayout", []], 2005, null, 2003, "data.get(\"properties.advert\") && data.get(\"options.displayAdvert\") && (data.get(\"properties.advert.title\") || data.get(\"properties.advert.text\"))", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__separator\"></ymaps><ymaps class=\"ymaps-2-1-79-islets_advert\"><ymaps class=\"ymaps-2-1-79-islets_advert__content\">", 2003, "data.get(\"properties.advert.title\")", 2003, "data.get(\"properties.advert.url\")", 0, "<a class=\"ymaps-2-1-79-islets_advert__title\" href=\"", 2001, ["properties.advert.url", []], 0, "\" target=\"_blank\">", 2001, ["properties.advert.title", []], 0, "</a>", 2004, null, 0, "<span>", 2001, ["properties.advert.title", []], 0, "</span>", 2005, null, 2005, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_advert__text\">", 2001, ["properties.advert.text", []], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_advert__label\" data-label=\"", 2001, ["localization.ppo.Card.advertLabel", []], 0, "\"></ymaps></ymaps>", 2005, null, 2003, "(!( data.get(\"properties.type\") == \"stop\" ) && data.get(\"properties.timetableStationUrl\") ) || (data.get(\"internal\") && data.get(\"internal.taxiFooter\")) || data.get(\"properties.feedbackElementIsNeeded\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__separator\"></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__row-links\">", 2003, "(!( data.get(\"properties.type\") == \"stop\" ) && data.get(\"properties.timetableStationUrl\") )", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__timetable ymaps-2-1-79-islets__left-col\"><a class=\"ymaps-2-1-79-islets_card__timetable-link\" href=\"", 2001, ["properties.timetableStationUrl", []], 0, "\" target=\"_blank\">", 2001, ["localization.ppo.Card.timetableLink", []], 0, "</a></ymaps>", 2008, "(data.get(\"internal\") && data.get(\"internal.taxiFooter\"))", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__taxi-container ymaps-2-1-79-islets__left-col\"><a class=\"ymaps-2-1-79-islets_card__taxi\" href=\"", 2001, ["properties.taxiInfo.openTaxiAppUrl", []], 0, "\" target=\"_blank\">", 2001, ["localization.ppo.Card.orderATaxi", []], 0, "</a></ymaps>", 2005, null, 2003, "data.get(\"properties.feedbackElementIsNeeded\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__feedback-container ymaps-2-1-79-islets__right-col\">", 2002, ["islets#feedbackLinkLayout", [["name", "1"]]], 0, "</ymaps>", 2005, null, 0, "</ymaps>", 2005, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('islets.card.layout.metro.html', ["islets-variables", "islets-advert", "islets-card"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_card__metro\"><ymaps class=\"ymaps-2-1-79-islets_card__metro\">", 2006, "index, station in properties.stops", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__metro-station\"><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-icon\" ", 2009, null, 0, "background-color: ", 2001, ["station.color", []], 2010, null, 0, "></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-name\">", 2001, ["station.name", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-distance\">", 2001, ["station.distance", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-distance-link\" data-coordinates=\"", 2001, ["station.coordinates", []], 0, "\"><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-distance-link-text\" title=\"", 2001, ["localization.ppo.Card.metroDistance", []], 0, "\">", 2001, ["station.distance", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-islets_card__metro-station-distance-link-hint\">", 2001, ["localization.ppo.Card.metroDistance", []], 0, "</ymaps></ymaps></ymaps>", 2007, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('islets.card.layout.status.html', ["islets-variables", "islets-advert", "islets-card"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_card__status\"><ymaps class=\"ymaps-2-1-79-islets_card__status-row\">", 2003, "(data.get(\"properties.rating\") && data.get(\"properties.rating.score\"))", 2003, "data.get(\"internal.userCanRate\")", 0, "<a class=\"ymaps-2-1-79-islets_card__status-rating-container ymaps-2-1-79-islets_card__status-rating-link\" href=\"", 2001, ["internal.ratingUrl", []], 0, "\" target=\"_blank\" title=\"", 2001, ["localization.ppo.Card.ratingRate", []], 0, "\">", 2002, ["islands#organizationRating", [["parameters.score", "properties.rating.score"], ["parameters.hoverable", "internal.userCanRate"]]], 0, "</a>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-rating-container\">", 2002, ["islands#organizationRating", [["parameters.score", "properties.rating.score"], ["parameters.hoverable", "internal.userCanRate"]]], 0, "</ymaps>", 2005, null, 2004, null, 2003, "data.get(\"internal.userCanRate\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-no-rating\">", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-no-rating ymaps-2-1-79-islets_card__status-no-rating_disabled\">", 2005, null, 0, "<a class=\"ymaps-2-1-79-islets_card__status-rating-text ymaps-2-1-79-islets_card__status-rating-link\" href=\"", 2001, ["internal.ratingUrl", []], 0, "\" target=\"_blank\">", 2001, ["localization.ppo.Card.ratingRate", []], 0, "</a><ymaps class=\"ymaps-2-1-79-islets_card__status-no-rating-text\">", 2001, ["localization.ppo.Card.ratingNoRating", []], 0, "</ymaps></ymaps>", 2005, null, 2003, "data.get(\"properties.workingStatus\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-time\" data-is24h=\"", 2003, "!data.get(\"properties.workingStatus.isWork\") || data.get(\"properties.workingStatus.time\")", 0, "false", 2004, null, 0, "true", 2005, null, 0, "\" data-closed-permanently=\"", 2003, "data.get(\"properties.workingStatus.closedPermanently\")", 0, "true", 2004, null, 0, "false", 2005, null, 0, "\" data-time=\"", 2003, "data.get(\"properties.workingStatus.time\")", 2001, ["properties.workingStatus.time", []], 2005, null, 0, "\"><ymaps class=\"ymaps-2-1-79-islets_card__status-time-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__status-time-text\"><ymaps class=\"ymaps-2-1-79-islets_card__status-time-text-short\">", 2003, "!data.get(\"properties.workingStatus.isWork\")", 2001, ["localization.ppo.Card.timeClosed", []], 2004, null, 2003, "data.get(\"properties.workingStatus.time\")", 2001, ["localization.ppo.Card.timeOpen", []], 2004, null, 2001, ["localization.ppo.Card.timeOpen24", []], 2005, null, 2005, null, 0, "</ymaps><ymaps class=\"ymaps-2-1-79-islets_card__status-time-text-full\">", 2003, "!data.get(\"properties.workingStatus.isWork\")", 2003, "data.get(\"properties.workingStatus.time\")", 2001, ["properties.loc.timeClosedUntil", []], 2004, null, 2001, ["localization.ppo.Card.timeClosed", []], 2005, null, 2004, null, 2003, "data.get(\"properties.workingStatus.time\")", 2001, ["properties.loc.timeOpenUntil", []], 2004, null, 2001, ["localization.ppo.Card.timeOpen24", []], 2005, null, 2005, null, 0, "</ymaps></ymaps></ymaps>", 2005, null, 0, "</ymaps>", 2003, "data.get(\"properties.workingStatus\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-timetable\"></ymaps>", 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('islets.search.layout.serp.advert.html', ["islets-variables", "islets-advert", "islets-serp-advert"], function(provide) {
        provide([0, "<a class=\"ymaps-2-1-79-islets_serp-advert\" href=\"", 2001, ["state.advert.url", []], 0, "\" target=\"_blank\"><ymaps class=\"ymaps-2-1-79-islets_advert\"><ymaps class=\"ymaps-2-1-79-islets_advert__content\">", 2003, "data.get(\"state.advert.title\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_advert__title\">", 2001, ["state.advert.title", []], 0, "</ymaps>", 2005, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_advert__text\">", 2001, ["state.advert.text", []], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-islets_advert__label\" data-label=\"", 2001, ["localization.ppo.Card.advertLabel", []], 0, "\"></ymaps></ymaps></a>"]);
    });
}
, function(ym) {
    ym.modules.define('islets.search.layout.serp.item.status.html', ["islets-variables", "islets-advert", "islets-card"], function(provide) {
        provide([2003, "data.get(\"data.type\") == \"business\" || data.get(\"data.type\") == \"public-map-object\"", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status\">", 2003, "(data.get(\"data.rating\") && data.get(\"data.rating.score\"))", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-rating-container\">", 2002, ["islands#organizationRating", [["parameters.score", "data.rating.score"]]], 0, "</ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-no-rating-text\">", 2001, ["localization.ppo.Card.ratingNoRating", []], 0, "</ymaps>", 2005, null, 2003, "data.get(\"data.workingStatus\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_card__status-time\" data-time=\"", 2003, "data.get(\"data.workingStatus.time\")", 2001, ["data.workingStatus.time", []], 2005, null, 0, "\"><ymaps class=\"ymaps-2-1-79-islets_card__status-time-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-islets_card__status-time-text\"><ymaps class=\"ymaps-2-1-79-islets_card__status-time-text-full\">", 2003, "!data.get(\"data.workingStatus.isWork\")", 2003, "data.get(\"data.workingStatus.time\")", 2001, ["data.loc.timeClosedUntil", []], 2004, null, 2001, ["localization.ppo.Card.timeClosed", []], 2005, null, 2004, null, 2003, "data.get(\"data.workingStatus.time\")", 2001, ["data.loc.timeOpenUntil", []], 2004, null, 2001, ["localization.ppo.Card.timeOpen24", []], 2005, null, 2005, null, 0, "</ymaps></ymaps></ymaps>", 2005, null, 0, "</ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('layer.domTileNotFound.css', ["not-found-tile"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('listbox.layout.html', ["listbox", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-listbox ymaps-2-1-79-listbox_opened_no\"><ymaps class=\"ymaps-2-1-79-listbox__button\"><ymaps class=\"ymaps-2-1-79-listbox__button-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-listbox__button-text\"></ymaps><ymaps class=\"ymaps-2-1-79-listbox__button-arrow\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-listbox__panel ymaps-2-1-79-i-custom-scroll\"><ymaps class=\"ymaps-2-1-79-listbox__list\"></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('listbox.layout.item.html', ["listbox", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-listbox__list-item ymaps-2-1-79-listbox__list-item_selected_no\"><ymaps class=\"ymaps-2-1-79-listbox__list-item-text\">", 2001, ["data.content", [["raw", null]]], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('listbox.layout.separator.html', ["listbox", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-listbox__list-separator\"></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('map.copyrights.promo.css', ["map-copyrights-promo"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('map.css', ["map-css"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('map.paneManager.css', ["map-pane-manager"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('NEWsearch.layout.serp.html', ["islets-variables", "islets-serp", "islets-serp-popup"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_serp-popup\"><ymaps class=\"ymaps-2-1-79-islets_serp-popup__tail\"></ymaps><ymaps class=\"ymaps-2-1-79-islets_serp\">", 2003, "data.get(\"state.popupHintContent\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_serp__error\"><ymaps class=\"ymaps-2-1-79-islets_serp__error-msg\">", 2001, ["state.popupHintContent", [["raw", null]]], 0, "</ymaps></ymaps>", 2005, null, 2003, "data.get(\"options.showFeedbackOnEmptyResult\")", 2002, ["islands#serpFeedback", []], 2005, null, 2003, "data.get(\"options.popupHeaderLayout\")", 2002, ["options.popupHeaderLayout", []], 2008, "data.get(\"state.advert\") && data.get(\"state.results\") && data.get(\"state.results.length\") > 0", 2002, ["options.popupAdvertLayout", []], 2005, null, 2002, ["options.popupItemsLayout", []], 2003, "data.get(\"state.results\") && data.get(\"state.results.length\") < data.get(\"state.found\")", 0, "<ymaps class=\"ymaps-2-1-79-islets_serp__loadmore\">", 2001, ["state.nextLoadText", []], 0, " ↓</ymaps>", 2005, null, 2003, "data.get(\"options.showFeedbackAfterResults\")", 2002, ["islands#serpFeedback", []], 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('NEWsearch.layout.serp.item.html', ["islets-variables", "islets-advert", "islets-card", "islets-serp-item"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-islets_serp-item\"><ymaps class=\"ymaps-2-1-79-islets_serp-item__title\">", 2001, ["data.name", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-islets_card__description\">", 2003, "data.get(\"data.type\") == \"business\" || data.get(\"data.type\") == \"public-map-object\"", 2001, ["data.categoriesText", []], 2004, null, 2001, ["data.description", []], 2005, null, 0, "</ymaps>", 2002, ["options.popupItemStatusLayout", []], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('pane.controls.css', ["pane-controls-css"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('placemarkNew.layout.html', ["placemark", "placemark_theme", "placemark_type_blank"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-placemark ymaps-2-1-79-placemark_state_active ymaps-2-1-79-placemark_theme_blue\"><ymaps class=\"ymaps-2-1-79-placemark__l\"></ymaps><ymaps class=\"ymaps-2-1-79-placemark__r\"></ymaps><ymaps class=\"ymaps-2-1-79-placemark__content\"><ymaps class=\"ymaps-2-1-79-placemark__content-inner\">", 2002, ["options.contentLayout", [["observeSize"], ["name", "\"iconContent\""], ["maxWidth", "options.maxWidth"]]], 0, "</ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('poiBalloonContent.layout.html', ["poi-balloon-content"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-poi-balloon-content\"><ymaps class=\"ymaps-2-1-79-poi-balloon-content__title\">", 2001, ["name", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-poi-balloon-content__rubrics\">", 2006, "item in rubrics", 0, "<ymaps class=\"ymaps-2-1-79-poi-balloon-content__rubric-item\">", 2001, ["item", []], 0, "</ymaps>", 2007, null, 0, "</ymaps>", 2003, "data.get(\"description\")", 0, "<ymaps class=\"ymaps-2-1-79-poi-balloon-content__description\">", 2001, ["description", []], 0, "</ymaps>", 2005, null, 2003, "data.get(\"url\")", 0, "<ymaps class=\"ymaps-2-1-79-poi-balloon-content__footer\"><a class=\"ymaps-2-1-79-b-link\" href=\"", 2001, ["url", []], 0, "\">", 2001, ["urlContent", [["url", null]]], 0, "</a></ymaps>", 2005, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('routeBalloon.layout.html', ["button-islands", "route-content__icon", "route-icons", "route-content"], function(provide) {
        provide([2003, "data.get(\"properties.type\") == 'driving' && data.get(\"properties.blocked\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content ymaps-2-1-79-route-content-wide\">", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-route-content\">", 2005, null, 0, "<ymaps class=\"ymaps-2-1-79-route-content__title\">", 2003, "data.get(\"properties.type\") != \"masstransit\"", 2003, "data.get(\"properties.type\") == \"pedestrian\"", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_type_walk\"></ymaps>", 2008, "data.get(\"properties.type\") == \"driving\"", 2003, "data.get(\"properties.blocked\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_type_driving_blocked\"></ymaps>", 2008, "data.get(\"internal.taxi\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_type_driving_taxi\"></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_type_driving\"></ymaps>", 2005, null, 2008, "data.get(\"properties.type\") == \"bicycle\"", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_type_bicycle\"></ymaps>", 2005, null, 2005, null, 2003, "data.get(\"properties.type\") == \"driving\" && data.get(\"properties.blocked\")", 2001, ["localization.route.blocked", []], 2004, null, 2003, "data.get(\"properties.type\") == \"driving\" && data.get(\"properties.durationInTraffic\") && !data.get(\"properties.blocked\")", 2001, ["properties.durationInTraffic.text", []], 2004, null, 2001, ["properties.duration.text", []], 2005, null, 2003, "data.get(\"properties.type\") == \"masstransit\" || data.get(\"properties.type\") == \"driving\" && data.get(\"properties.durationInTraffic\")", 0, ", ", 2001, ["properties.distance.text", []], 2005, null, 2005, null, 2003, "data.get(\"properties.rawProperties.RouteMetaData.hasTolls\") && !data.get(\"properties.blocked\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_has_tolls ymaps-2-1-79-route-content__icon_has_tolls_", 2001, ["internal.tollsKey", []], 0, "\" title=\"", 2001, ["localization.route.has_tolls", []], 0, "\"></ymaps>", 2005, null, 2003, "data.get(\"properties.rawProperties.RouteMetaData.hasFerries\") && !data.get(\"properties.blocked\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__icon ymaps-2-1-79-route-content__icon_has_ferries\" title=\"", 2001, ["localization.route.has_boat_ferries", []], 0, "\"></ymaps>", 2005, null, 0, "</ymaps>", 2003, "data.get(\"properties.type\") == \"masstransit\"", 0, "<ymaps class=\"ymaps-2-1-79-route-content__transit\"></ymaps>", 2008, "data.get(\"properties.type\") == \"driving\" && !data.get(\"properties.blocked\") && data.get(\"internal.taxi\") && data.get(\"internal.countryCode\") == \"RU\"", 2003, "data.get(\"internal.taxiPrice\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__description\">", 2001, ["internal.taxiPrice", []], 0, "</ymaps>", 2005, null, 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-route-content__description\">", 2003, "data.get(\"properties.type\") == \"driving\" && data.get(\"properties.blocked\")", 2001, ["properties.distance.text", []], 0, ",&nbsp;", 2003, "data.get(\"properties.durationInTraffic\")", 2003, "data.get(\"properties.duration.value\") < data.get(\"properties.durationInTraffic.value\")", 2001, ["internal.durationWithoutTraffic.text", []], 0, " ", 2001, ["properties.duration.text", []], 2004, null, 2001, ["internal.durationWithoutTraffic.text", []], 0, " ", 2001, ["properties.durationInTraffic.text", []], 2005, null, 2005, null, 2004, null, 2003, "data.get(\"properties.type\") == \"driving\" && data.get(\"properties.durationInTraffic\")", 2003, "data.get(\"properties.duration.value\") < data.get(\"properties.durationInTraffic.value\")", 2001, ["localization.route.duration_without_traffic", []], 0, " ", 2001, ["properties.duration.text", []], 2004, null, 2001, ["localization.route.duration_without_traffic", []], 0, " ", 2001, ["properties.durationInTraffic.text", []], 2005, null, 2004, null, 2001, ["properties.distance.text", []], 2005, null, 2003, "data.get(\"properties.blocked\")", 0, ",<br>", 2001, ["localization.route.contains_blocked", []], 2005, null, 2005, null, 0, "</ymaps>", 2005, null, 2003, "data.get(\"properties.type\") == \"driving\" && !data.get(\"properties.blocked\") && data.get(\"internal.taxi\")", 0, "<ymaps class=\"ymaps-2-1-79-route-content__taxi-link-holder\"><a class=\"ymaps-2-1-79-route-content__taxi-link\" target=\"_blank\" href=\"", 2001, ["internal.taxi.link", []], 0, "\"><ymaps class=\"ymaps-2-1-79-route-content__taxi-link-text\">", 2001, ["localization.route.order_a_taxi", []], 0, "</ymaps></a></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-route-content__button-holder\"><ymaps class=\"ymaps-2-1-79-route-content__button ymaps-2-1-79-route-content__button_size_small\"><ymaps class=\"ymaps-2-1-79-route-content__button__text\">", 2001, ["localization.distribution.routeOpenInMaps", []], 0, "</ymaps></ymaps></ymaps>", 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('routePin.layout.html', ["route-pin"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-route-pin\"><ymaps class=\"ymaps-2-1-79-route-pin__b\"></ymaps><ymaps class=\"ymaps-2-1-79-route-pin__label\"><ymaps class=\"ymaps-2-1-79-route-pin__label-b\"></ymaps><ymaps class=\"ymaps-2-1-79-route-pin__label-a\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-route-pin__text\">", 2002, ["options.contentLayout", [["name", "\"iconContent\""], ["observeSize"]]], 0, "<ymaps class=\"ymaps-2-1-79-route-pin__text-a\"></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('scaleline.layout.html', ["scaleline"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-scaleline\"><ymaps class=\"ymaps-2-1-79-scaleline__left\"><ymaps class=\"ymaps-2-1-79-scaleline__left-border\"></ymaps><ymaps class=\"ymaps-2-1-79-scaleline__left-line\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-scaleline__center\"><ymaps class=\"ymaps-2-1-79-scaleline__label\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-scaleline__right\"><ymaps class=\"ymaps-2-1-79-scaleline__right-border\"></ymaps><ymaps class=\"ymaps-2-1-79-scaleline__right-line\"></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.form.html', ["searchbox", "float-button"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-searchbox__input-cell\"><ymaps class=\"ymaps-2-1-79-searchbox-input\"><input class=\"ymaps-2-1-79-searchbox-input__input\" placeholder=\"", 2001, ["options.placeholderContent", []], 0, "\"><ymaps class=\"ymaps-2-1-79-searchbox-input__clear-button\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-searchbox-list-button\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-searchbox__button-cell\">", 2003, "data.get(\"state.size\") == \"large\"", 0, "<ymaps class=\"ymaps-2-1-79-searchbox-button ymaps-2-1-79-_pin_right\"><ymaps class=\"ymaps-2-1-79-searchbox-button-text\">", 2001, ["options.buttonContent", []], 0, "</ymaps></ymaps>", 2004, null, 0, "<ymaps class=\"ymaps-2-1-79-searchbox-button\"><ymaps class=\"ymaps-2-1-79-searchbox-button-text\">", 2001, ["options.buttonContent", []], 0, "</ymaps></ymaps>", 2005, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.html', ["searchbox", "float-button"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-searchbox\">", 2003, "data.get(\"state.size\") == \"large\"", 2002, ["options.normalLayout", []], 2004, null, 2002, ["options.buttonLayout", []], 2002, ["options.panelLayout", []], 2005, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.normal.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search ymaps-2-1-79-search_layout_normal ymaps-2-1-79-searchbox__normal-layout\">", 2002, ["options.formLayout", []], 2002, ["options.popupLayout", []], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.panel.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search ymaps-2-1-79-search_layout_panel ymaps-2-1-79-searchbox__panel-layout\"><ymaps class=\"ymaps-2-1-79-search__layout\">", 2002, ["options.formLayout", []], 0, "<ymaps class=\"ymaps-2-1-79-searchbox__fold-button-cell\"><ymaps class=\"ymaps-2-1-79-searchbox__fold-button\"><ymaps class=\"ymaps-2-1-79-searchbox__fold-button-icon\"></ymaps></ymaps></ymaps></ymaps>", 2002, ["options.popupLayout", []], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.serp.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search__serp-popup ymaps-2-1-79-popup ymaps-2-1-79-popup_theme_ffffff ymaps-2-1-79-popup_to_bottom ymaps-2-1-79-popup_axis_top ymaps-2-1-79-i-custom-scroll\"><ymaps class=\"ymaps-2-1-79-search__serp-popup-tail ymaps-2-1-79-popup__tail\"></ymaps><ymaps class=\"ymaps-2-1-79-search__serp ymaps-2-1-79-popup__content\">", 2003, "data.get(\"options.popupHeaderLayout\")", 2002, ["options.popupHeaderLayout", []], 2005, null, 2003, "data.get(\"state.popupHintContent\")", 0, "<ymaps class=\"ymaps-2-1-79-search__serp-error\"><ymaps class=\"ymaps-2-1-79-search__serp-error-msg\">", 2001, ["state.popupHintContent", [["raw", null]]], 0, "</ymaps></ymaps>", 2005, null, 2002, ["options.popupItemsLayout", []], 2003, "data.get(\"state.results\") && data.get(\"state.results.length\") < data.get(\"state.found\")", 0, "<ymaps class=\"ymaps-2-1-79-search__serp-loadmore\"><ymaps class=\"ymaps-2-1-79-search__serp-item-more\">", 2001, ["state.nextLoadText", []], 0, " ↓</ymaps></ymaps>", 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.serp.item.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search__serp-item\"><ymaps class=\"ymaps-2-1-79-search__serp-item-title\">", 2001, ["data.name", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__serp-item-descr\">", 2001, ["data.description", []], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.suggest.highlight.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search__suggest-highlight\">", 2001, ["request", []], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.suggest.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search__suggest ymaps-2-1-79-popup ymaps-2-1-79-popup_theme_ffffff ymaps-2-1-79-i-custom-scroll\" data-suggest=\"true\">", 2003, "(data.get(\"options.provider\") == \"yandex#search\")", 0, "<ymaps class=\"ymaps-2-1-79-search__suggest-catalog\" data-suggest-catalog=\"true\"><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_01-restaurant ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"01-restaurant\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_02-bar ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"02-bar\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_03-atm ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"03-atm\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_04-cinema ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"04-cinema\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_05-barbershop ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"05-barbershop\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_06-pharmacy ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"06-pharmacy\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_07-shop ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"07-shop\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_08-shopping-mall ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"08-shopping-mall\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_09-fitness ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"09-fitness\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_10-auto-repair ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"10-auto-repair\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_11-gasoline ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"11-gasoline\"]", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-search__suggest-catalog-item ymaps-2-1-79-search__suggest-catalog-item_type_12-hotel ymaps-2-1-79-search__suggest-item\" data-suggest-catalog-item=\"true\">", 2001, ["localization.searchSuggest[\"12-hotel\"]", []], 0, "</ymaps></ymaps>", 2005, null, 2002, ["options.itemsLayout", [["name", "\"items\""]]], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('search.layout.suggest.item.html', ["searchbox", "float-button", "search_layout_panel", "search__serp", "search__suggest", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "i-custom-scroll"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-search__suggest-item\">", 2001, ["item.itemContent", [["raw", null]]], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.button.html', ["float-button", "traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-float-button ymaps-2-1-79-float-button_traffic_left\"><ymaps class=\"ymaps-2-1-79-traffic__icon ymaps-2-1-79-traffic__icon_icon_off ymaps-2-1-79-float-button-icon\"></ymaps><ymaps class=\"ymaps-2-1-79-float-button-text\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.error.html', ["error-message"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-error-message\"><ymaps class=\"ymaps-2-1-79-error-message__msg\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic ymaps-2-1-79-traffic_settings_pressed\">", 2002, ["traffic#controlButtonLayout", []], 2002, ["traffic#controlPopupLayout", []], 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.checkbox.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail", "check"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__checkbox-cell\"><ymaps class=\"ymaps-2-1-79-check\"><input class=\"ymaps-2-1-79-check__control\" type=\"checkbox\"><ymaps class=\"ymaps-2-1-79-check__box\"></ymaps><ymaps class=\"ymaps-2-1-79-check__label-text\">", 2001, ["localization.Traffic.infoLayer", []], 0, "</ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.detailedLink.html', ["traffic"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__detailed-link\"><a class=\"ymaps-2-1-79-traffic__detailed-link-button\" href=\"", 2001, ["state.href", []], 0, "\" target=\"_blank\">", 2001, ["localization.Traffic.detailedLink", []], 0, "</a></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.hint.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([2003, "!data.get(\"state.popupHintClosed\")", 0, "<ymaps class=\"ymaps-2-1-79-traffic__hint\"><ymaps class=\"ymaps-2-1-79-traffic__hint-close\"></ymaps><ymaps class=\"ymaps-2-1-79-traffic__hint-text\">", 2001, ["localization.Traffic.statisticsHint", []], 0, "</ymaps></ymaps>", 2005, null]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__panel ymaps-2-1-79-popup ymaps-2-1-79-popup_direction_down ymaps-2-1-79-popup_to_bottom ymaps-2-1-79-popup_theme_ffffff\"><ymaps class=\"ymaps-2-1-79-traffic__tail ymaps-2-1-79-popup__tail\"></ymaps><ymaps class=\"ymaps-2-1-79-traffic__panel-content\">", 2002, ["traffic#controlPopupSwitcherLayout", []], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.slider.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__slider\"><ymaps class=\"ymaps-2-1-79-traffic__slider-scale\"><ymaps class=\"ymaps-2-1-79-traffic__slider-label ymaps-2-1-79-traffic__slider-label_type_left\">%leftLabel</ymaps><ymaps class=\"ymaps-2-1-79-traffic__slider-label ymaps-2-1-79-traffic__slider-label_type_right\">%rightLabel</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__slider-body\"><ymaps class=\"ymaps-2-1-79-traffic__slider-track\"></ymaps><ymaps class=\"ymaps-2-1-79-traffic__slider-button ymaps-2-1-79-button\" ", 2009, null, 0, "left: 0", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-traffic__slider-button-text ymaps-2-1-79-button__text\"></ymaps></ymaps></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.switcher.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__switcher\"><ymaps class=\"ymaps-2-1-79-traffic__switcher-item ymaps-2-1-79-traffic__switcher-item_data_actual\">", 2001, ["localization.Traffic.nowHeader", []], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-traffic__switcher-item ymaps-2-1-79-traffic__switcher-item_data_archive\">", 2001, ["localization.Traffic.statistics", []], 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settings.tabs.html', ["traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic__tabs\"><ymaps class=\"ymaps-2-1-79-traffic__tab\"><ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%mon</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%tue</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%wed</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%thu</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%fri</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%sat</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tab\">&nbsp;<ymaps class=\"ymaps-2-1-79-traffic__tab-text\">%sun</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-traffic__tabs-justifier\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('traffic.layout.settingsButton.html', ["float-button", "traffic", "popup", "popup__content", "popup_theme_ffffff", "popup_visibility_visible", "popup_visibility_outside", "popup__under", "popup__under_color_white", "popup__under_type_paranja", "popup__tail"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-float-button ymaps-2-1-79-float-button_icon_only ymaps-2-1-79-float-button_side_right ymaps-2-1-79-float-button_checked_no ymaps-2-1-79-_pin_right\"><ymaps class=\"ymaps-2-1-79-traffic__icon ymaps-2-1-79-traffic__icon_icon_settings ymaps-2-1-79-float-button-icon\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('trafficInfo.layout.html', ["traffic-info"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-traffic-info\"><ymaps class=\"ymaps-2-1-79-traffic-info__title\"></ymaps><ymaps class=\"ymaps-2-1-79-traffic-info__details\">", 2001, ["description", [["raw", null]]], 0, "</ymaps><ymaps class=\"ymaps-2-1-79-traffic-info__time\">", 2003, "data.get(\"endTime\")", 2001, ["startTime", [["raw", null]]], 0, " &mdash; ", 2001, ["endTime", [["raw", null]]], 2004, null, 2001, ["startTime", [["raw", null]]], 2005, null, 0, "</ymaps><ymaps class=\"ymaps-2-1-79-traffic-info__source\"><ymaps class=\"ymaps-2-1-79-traffic-info__source-label\">", 2001, ["localization.Traffic.source", []], 0, ":&nbsp;</ymaps>", 2003, "data.get(\"href\")", 0, "<a class=\"ymaps-2-1-79-traffic-info__source-link\">", 2001, ["localizedSource", [["href", null]]], 0, "</a>", 2004, null, 2001, ["localizedSource", []], 2005, null, 0, "</ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('transitIcons.layout.html', ["route-icons"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-route-icons\">", 2006, "segment in properties.routeSegments", 2003, "data.get(\"segment.type\") == \"walk\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_walk\"></ymaps>", 2008, "data.get(\"segment.type\") == \"driving\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_driving\"></ymaps>", 2008, "data.get(\"segment.type\") == \"suburban\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_suburban\"></ymaps>", 2008, "data.get(\"segment.type\") == \"underground\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_underground\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><path fill=\"", 2001, ["segment.color", []], 0, "\" fill-rule=\"evenodd\" d=\"M10.6 8.593L11.679 11.653 10.808 11.653 10.808 13 16 13 16 11.653 15.009 11.653 11.279 1.842 8 7.883 4.721 1.842 0.991 11.653 0 11.653 0 13 5.192 13 5.192 11.653 4.321 11.653 5.4 8.593 8 13.111z\"/></svg></ymaps>", 2008, "data.get(\"segment.type\") == \"transfer\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_transfer\"></ymaps>", 2008, "data.get(\"segment.type\") == \"minibus\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_minibus\"></ymaps>", 2008, "data.get(\"segment.type\") == \"tramway\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_tramway\"></ymaps>", 2008, "data.get(\"segment.type\") == \"bus\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_bus\"></ymaps>", 2008, "data.get(\"segment.type\") == \"trolleybus\"", 0, "<ymaps class=\"ymaps-2-1-79-route-icons__icon ymaps-2-1-79-route-icons__icon_type_trolleybus\"></ymaps>", 2005, null, 2007, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('transportPin.layout.html', ["transport-pin"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-transport-pin ymaps-2-1-79-transport-pin_filled_no ymaps-2-1-79-\"><ymaps class=\"ymaps-2-1-79-transport-pin__body\"><ymaps class=\"ymaps-2-1-79-transport-pin__label\"><ymaps class=\"ymaps-2-1-79-transport-pin__icon\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-transport-pin__text\">", 2002, ["options.contentLayout", [["name", "\"iconContent\""], ["observeSize"]]], 0, "</ymaps></ymaps><ymaps class=\"ymaps-2-1-79-transport-pin__tail\"></ymaps></ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('utilNodeSize.css', ["util-node-size"], function(provide) {
        provide({});
    });
}
, function(ym) {
    ym.modules.define('zoom.layout.html', ["zoom", "float-button"], function(provide) {
        provide([0, "<ymaps class=\"ymaps-2-1-79-zoom\" ", 2009, null, 0, "height: ", 2003, "data.get(\"state.size\")=='large'", 0, "150", 2004, null, 0, "5", 2005, null, 0, "px", 2010, null, 0, "><ymaps class=\"ymaps-2-1-79-zoom__plus ymaps-2-1-79-zoom__button ymaps-2-1-79-float-button\"><ymaps class=\"ymaps-2-1-79-zoom__icon ymaps-2-1-79-float-button-icon\"></ymaps></ymaps><ymaps class=\"ymaps-2-1-79-zoom__minus ymaps-2-1-79-zoom__button ymaps-2-1-79-float-button\"><ymaps class=\"ymaps-2-1-79-zoom__icon ymaps-2-1-79-float-button-icon\"></ymaps></ymaps>", 2003, "data.get(\"state.size\")=='large'", 0, "<ymaps class=\"ymaps-2-1-79-zoom__scale\"><ymaps class=\"ymaps-2-1-79-zoom__runner ymaps-2-1-79-zoom__button ymaps-2-1-79-float-button\"><ymaps class=\"ymaps-2-1-79-zoom__icon ymaps-2-1-79-float-button-icon ymaps-2-1-79-float-button-icon_icon_runner\"></ymaps></ymaps></ymaps>", 2005, null, 0, "</ymaps>"]);
    });
}
, function(ym) {
    ym.modules.define('b-cluster-accordion_layout_panel', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-b-cluster-accordion_layout_panel{position:relative}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item_current_yes{background:0 0}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item{position:relative;top:-2px;display:block;margin:0;padding:8px 0;border-top:1px solid #eaeaea;font:15px/24px Arial,sans-serif}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item-text{color:#000!important}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item-text:hover{color:red!important}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item:after,.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item:before{position:absolute;top:-1px;width:30px;height:1px;content:\'\'}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item:before{left:0;background:-moz-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-webkit-gradient(linear,left top,right top,color-stop(0%,#fff),color-stop(100%,#eaeaea));background:-webkit-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-o-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-ms-linear-gradient(left,#fff 0%,#eaeaea 100%);background:linear-gradient(to right,#fff 0%,#eaeaea 100%)}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-item:after{right:0;background:-moz-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-webkit-gradient(linear,left top,right top,color-stop(0%,#eaeaea),color-stop(100%,#fff));background:-webkit-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-o-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-ms-linear-gradient(left,#eaeaea 0%,#fff 100%);background:linear-gradient(to right,#eaeaea 0%,#fff 100%)}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__section_type_content{padding-left:28px}.ymaps-2-1-79-b-cluster-accordion_layout_panel .ymaps-2-1-79-b-cluster-tabs__menu-icon{position:absolute;left:-6px;margin-top:-6px;width:30px;height:30px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0M5QzlDOSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwdjJoMTRWMEgwem0wIDV2MmgxNFY1SDB6bTAgNXYyaDE0di0ySDB6Ii8+PC9zdmc+) no-repeat 50% 50%;cursor:pointer}'));
    });
}
, function(ym) {
    ym.modules.define('b-cluster-accordion', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-b-cluster-accordion{position:relative;display:block;overflow-x:hidden;overflow-y:auto;margin:0 5px 0 0;-webkit-transform:translate3d(0%,0,0)}.ymaps-2-1-79-b-cluster-accordion__menu{position:relative;display:block;padding:0 0 7px}.ymaps-2-1-79-b-cluster-accordion__item{position:relative;top:-2px;display:block;border-top:1px solid #ccc;color:#000;font:13px/20px Arial,sans-serif}.ymaps-2-1-79-b-cluster-accordion__item-title{position:relative;z-index:2;display:block;overflow:hidden;padding:9px 0;white-space:nowrap;text-align:left}.ymaps-2-1-79-b-cluster-accordion__item-hidden-icon .ymaps-2-1-79-b-cluster-accordion__item-caption{padding-left:0}.ymaps-2-1-79-b-cluster-accordion__item-hidden-icon .ymaps-2-1-79-b-cluster-accordion__item-number{display:none}.ymaps-2-1-79-b-cluster-accordion__item-number{position:absolute;top:10px;left:0;z-index:-1;width:18px;height:18px;color:#000;font-size:10px;line-height:19px;cursor:pointer}.ymaps-2-1-79-b-cluster-accordion_list_numeric .ymaps-2-1-79-b-cluster-accordion__item-number{text-align:center}.ymaps-2-1-79-b-cluster-accordion_list_marker .ymaps-2-1-79-b-cluster-accordion__item-number{text-indent:-9999px}.ymaps-2-1-79-b-cluster-accordion__item-caption{display:inline-block;padding:0 0 0 26px;font-size:15px;-ms-user-select:none}.ymaps-2-1-79-b-cluster-accordion__item-caption:hover{color:red;cursor:pointer}.ymaps-2-1-79-b-cluster-accordion__item-content{overflow:hidden;margin-top:1px}.ymaps-2-1-79-b-cluster-accordion__item_current_yes .ymaps-2-1-79-b-cluster-accordion__item-content{display:block;padding-top:8px}.ymaps-2-1-79-b-cluster-accordion__item-content-inner{display:block;padding:8px 2px 10px;border-top:1px solid #ccc;position:relative}.ymaps-2-1-79-b-cluster-accordion__item-content-inner:before,.ymaps-2-1-79-b-cluster-accordion__item:before{content:\'\';position:absolute;top:-1px;left:0;width:30px;height:1px;background:-webkit-gradient(linear,left top,right top,color-stop(0%,#fff),color-stop(100%,#ccc));background:-webkit-linear-gradient(left,#fff 0%,#ccc 100%);background:linear-gradient(to right,#fff 0%,#ccc 100%)}.ymaps-2-1-79-b-cluster-accordion__item_current_yes .ymaps-2-1-79-b-cluster-accordion__item-content-inner:after{content:\'\';position:absolute;top:-8px;left:37px;z-index:0;width:17px;height:8px;border:0;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI4Ij48cGF0aCBmaWxsPSIjQ0NDIiBkPSJNOCAwbDggOEgwbDgtOHoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNOCAxbDcgN0gxbDctN3oiLz48L3N2Zz4=) no-repeat}.ymaps-2-1-79-b-cluster-accordion__item_current_yes .ymaps-2-1-79-b-cluster-accordion__item-title{padding-bottom:1px}.ymaps-2-1-79-b-cluster-accordion__fog{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAABCAYAAACsXeyTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNTgwMTE3NDA3MjA2ODExODIyQUNBRkQyQUVENzRENiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2RTZEMTJFMzJDRTcxMUUyQkQ2MUY3MkI1NkFENEQxMiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2RTZEMTJFMjJDRTcxMUUyQkQ2MUY3MkI1NkFENEQxMiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDY4MDExNzQwNzIwNjgxMTgwODM4RTJFQTE1MjIyRDciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDU4MDExNzQwNzIwNjgxMTgyMkFDQUZEMkFFRDc0RDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5QopTiAAAAH0lEQVR42mL8//8/BwMDAwhzQmli2NRQy8pABAAIMAA94gP+MyJmrAAAAABJRU5ErkJggg==) right top repeat-y}.ymaps-2-1-79-b-cluster-accordion__item-content{display:block;overflow-y:hidden}.ymaps-2-1-79-b-cluster-accordion__item-content-expanded{-webkit-transition-duration:150ms;transition-duration:150ms;-webkit-transition-property:height,padding-top,padding-bottom;transition-property:height,padding-top,padding-bottom}'));
    });
}
, function(ym) {
    ym.modules.define('b-cluster-carousel', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-b-cluster-carousel{position:relative;display:block;margin:0 30px;border-bottom:20px solid #fff}.ymaps-2-1-79-b-cluster-carousel__content{display:block;overflow-x:hidden;overflow-y:auto}.ymaps-2-1-79-b-cluster-carousel__pager{position:absolute;bottom:-20px;z-index:2;width:100%;height:20px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ymaps-2-1-79-b-cluster-carousel__separator{position:absolute;right:-30px;bottom:0;left:-30px;z-index:1;height:1px;background:#ccc}.ymaps-2-1-79-b-cluster-carousel__separator:after,.ymaps-2-1-79-b-cluster-carousel__separator:before{content:\'\';height:1px;width:30px;position:absolute}.ymaps-2-1-79-b-cluster-carousel__separator:before{left:0;background:-webkit-gradient(linear,left top,right top,color-stop(0%,#fff),color-stop(100%,#ccc));background:-webkit-linear-gradient(left,#fff 0%,#ccc 100%);background:linear-gradient(to right,#fff 0%,#ccc 100%)}.ymaps-2-1-79-b-cluster-carousel__separator:after{right:0;background:-webkit-gradient(linear,left top,right top,color-stop(0%,#ccc),color-stop(100%,#fff));background:-webkit-linear-gradient(left,#ccc 0%,#fff 100%);background:linear-gradient(to right,#ccc 0%,#fff 100%)}.ymaps-2-1-79-b-cluster-carousel__nav{position:absolute;top:0;bottom:0;display:block;width:30px;background-repeat:no-repeat;cursor:pointer;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}.ymaps-2-1-79-b-cluster-carousel__nav_type_next{right:-30px;background-position:85% 50%}.ymaps-2-1-79-b-cluster-carousel__nav_type_prev{left:-30px;background-position:15% 50%}.ymaps-2-1-79-b-cluster-carousel__nav_hidden_yes{display:none}.ymaps-2-1-79-b-cluster-carousel__pager-item{cursor:pointer}.ymaps-2-1-79-b-cluster-carousel__content-item,.ymaps-2-1-79-b-cluster-carousel__layout,.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager>ymaps ymaps{display:block}.ymaps-2-1-79-b-cluster-carousel__content-item{opacity:0}.ymaps-2-1-79-b-cluster-carousel__content-item_current_yes{-webkit-transition-property:opacity;transition-property:opacity;-webkit-transition-duration:300ms;transition-duration:300ms;opacity:1}.ymaps-2-1-79-b-cluster-carousel__nav_type_next{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNyI+PHBhdGggZmlsbD0iI0RBREFEQSIgZD0iTTYuNSA4LjVMLjUgMiAyIC41bDcuNSA4LTcuNSA4TC41IDE1bDYtNi41eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-b-cluster-carousel__nav_type_prev{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNyI+PHBhdGggZmlsbD0iI0RBREFEQSIgZD0iTTMuNSA4LjVsNi02LjVMOCAuNWwtNy41IDggNy41IDhMOS41IDE1bC02LTYuNXoiLz48L3N2Zz4=)}.ymaps-2-1-79-b-cluster-carousel__nav_type_next:hover{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNyI+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTYuNSA4LjVMLjUgMiAyIC41bDcuNSA4LTcuNSA4TC41IDE1bDYtNi41eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-b-cluster-carousel__nav_type_prev:hover{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNyI+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTMuNSA4LjVsNi02LjVMOCAuNWwtNy41IDggNy41IDhMOS41IDE1bC02LTYuNXoiLz48L3N2Zz4=)}.ymaps-2-1-79-b-cluster-carousel_pager_marker .ymaps-2-1-79-b-cluster-carousel__pager *{overflow:visible;display:inline;font:0/0 a}.ymaps-2-1-79-b-cluster-carousel_pager_marker .ymaps-2-1-79-b-cluster-carousel__pager-item{display:inline-block;width:7px;height:7px;margin:0 4px;text-indent:-9999px;background:#e6e6e6;border-radius:7px;position:relative;line-height:7px}.ymaps-2-1-79-b-cluster-carousel_pager_marker .ymaps-2-1-79-b-cluster-carousel__pager-item.ymaps-2-1-79-b-cluster-carousel__pager-item_current_yes,.ymaps-2-1-79-b-cluster-carousel_pager_marker .ymaps-2-1-79-b-cluster-carousel__pager-item:hover{background:#1e98ff;text-indent:-9998px}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager{bottom:-22px;display:table;height:20px;font:13px/1 Arial,sans-serif}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item{display:block;padding:6px 2px 0;color:#1e98ff;text-indent:0}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager>ymaps{display:table-cell}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item_current_yes{position:relative;padding-top:7px;padding-bottom:2px;color:#000}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item_current_yes:before{content:\'\';position:absolute;top:-1px;left:50%;margin-left:-10px;width:18px;height:0;box-sizing:border-box!important;border-top:3px solid #000!important}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item:hover{color:red}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager-item_ellipsis_yes{padding-right:0;padding-left:0;font-size:18px;line-height:0;text-align:right}.ymaps-2-1-79-b-cluster-carousel_pager_numeric .ymaps-2-1-79-b-cluster-carousel__pager>ymaps:first-child .ymaps-2-1-79-b-cluster-carousel__pager-item_ellipsis_yes{text-align:left}'));
    });
}
, function(ym) {
    ym.modules.define('b-cluster-content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-b-cluster-content{text-align:left;font:13px Arial,Helvetica,sans-serif}.ymaps-2-1-79-b-cluster-content__header{display:block;margin-bottom:10px;font-weight:700;font-size:115%}.ymaps-2-1-79-b-cluster-content__body{display:block;margin-bottom:10px}.ymaps-2-1-79-b-cluster-content__footer{display:block}'));
    });
}
, function(ym) {
    ym.modules.define('b-cluster-tabs', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-b-cluster-tabs{display:block;padding:0 5px 0 0}.ymaps-2-1-79-b-cluster-tabs__section{display:block;overflow-x:hidden;overflow-y:auto}.ymaps-2-1-79-b-cluster-tabs__section_type_nav{float:left;margin:0;padding:0;border-right:1px solid #e2e2e2;-webkit-overflow-scrolling:touch}.ymaps-2-1-79-b-cluster-tabs__section_type_content{padding-left:10px}.ymaps-2-1-79-b-cluster-tabs__content-item,.ymaps-2-1-79-b-cluster-tabs__menu{display:block}.ymaps-2-1-79-b-cluster-tabs__menu-item{display:block;margin-bottom:3px;padding:2px 10px 2px 5px}.ymaps-2-1-79-b-cluster-tabs__menu-item_current_yes{cursor:auto;-webkit-border-radius:5px 0 0 5px;-moz-border-radius:5px 0 0 5px;border-radius:5px 0 0 5px;background:#e2e2e2}.ymaps-2-1-79-b-cluster-tabs__menu-item-text{display:inline-block;cursor:pointer;color:#1a3dc1}.ymaps-2-1-79-b-cluster-tabs__menu-item-text:hover{color:red}.ymaps-2-1-79-b-cluster-tabs__menu-item_current_yes .ymaps-2-1-79-b-cluster-tabs__menu-item-text{border-bottom:0;color:#000}.ymaps-2-1-79-b-cluster-tabs__item-body,.ymaps-2-1-79-b-cluster-tabs__item-footer,.ymaps-2-1-79-b-cluster-tabs__item-header{display:block;padding-right:10px}'));
    });
}
, function(ym) {
    ym.modules.define('balloon-content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-balloon-content{-webkit-overflow-scrolling:touch}.ymaps-2-1-79-balloon-content__header{display:block;margin:0 0 5px;font-size:120%;font-weight:700}.ymaps-2-1-79-balloon-content__footer{display:block;margin:5px 0 0;color:#777;font-size:90%}'));
    });
}
, function(ym) {
    ym.modules.define('balloon_size_mini', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-balloon_size_mini{white-space:nowrap}.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__content{min-width:inherit;padding:2px 5px;font:11px/15px Verdana,Arial,sans-serif}.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__close-button{width:20px;height:20px;margin:0;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZD0iTTUuMyA2TDAgLjcuNyAwIDYgNS4zIDExLjMgMGwuNy43TDYuNyA2bDUuMyA1LjMtLjcuN0w2IDYuNy43IDEybC0uNy0uN0w1LjMgNnoiLz48L3N2Zz4=)}.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__close+.ymaps-2-1-79-balloon__content{margin-right:20px;padding-right:2px}'));
    });
}
, function(ym) {
    ym.modules.define('balloon_type_route', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-balloon_type_route.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__content{padding:10px 0 10px 12px}.ymaps-2-1-79-balloon_type_route.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__close{top:5px}.ymaps-2-1-79-balloon_type_route.ymaps-2-1-79-balloon_to_top .ymaps-2-1-79-balloon__tail{margin-left:-13px;left:50%}.ymaps-2-1-79-balloon_type_route.ymaps-2-1-79-balloon_to_bottom .ymaps-2-1-79-balloon__tail{margin-left:-22px;left:50%}.ymaps-2-1-79-balloon_type_route.ymaps-2-1-79-balloon_state_inactive{opacity:.85}.ymaps-2-1-79-balloon_type_route .ymaps-2-1-79-balloon__close-button{margin-right:auto!important}.ymaps-2-1-79-balloon_type_route .ymaps-2-1-79-balloon__close+.ymaps-2-1-79-balloon__content{margin-right:12px!important}.ymaps-2-1-79-balloon_type_route .ymaps-2-1-79-balloon__close{position:relative;z-index:2}'));
    });
}
, function(ym) {
    ym.modules.define('balloon', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-balloon{position:absolute;z-index:1;padding:1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 5px 15px -7px rgba(0,0,0,.5)}@media print{.ymaps-2-1-79-balloon{box-shadow:none;border:1px solid rgba(0,0,0,.15)}}.ymaps-2-1-79-balloon_layout_panel{right:0;bottom:0;left:0;background-color:#fff;overflow:hidden!important}@media print{.ymaps-2-1-79-balloon_layout_panel:before{content:\'\';position:absolute;height:0!important;width:9999px;border-bottom:9999px solid #fff}}.ymaps-2-1-79-balloon__layout{position:relative;display:block;overflow:hidden;background:#fff}.ymaps-2-1-79-balloon__content{position:relative;z-index:1;display:block;min-width:60px;height:100%;min-height:15px;margin:0;padding:10px 12px;background:#fff;font:13px/20px Arial,sans-serif}.ymaps-2-1-79-balloon__close+.ymaps-2-1-79-balloon__content{margin-right:30px;padding-right:0}.ymaps-2-1-79-balloon__tail{display:block;position:relative;left:45px;width:17px;height:17px;margin-bottom:-17px;background:rgba(0,0,0,.15)}@media not print{.ymaps-2-1-79-balloon__tail{background:-webkit-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);box-shadow:inset 0 0 1px -2px rgba(0,0,0,.15),3px -3px 13px 1px rgba(0,0,0,.2)}}.ymaps-2-1-79-balloon__tail:after{content:\'\';position:absolute;width:20px;height:20px;background-color:#fff;bottom:1px;left:1px}.ymaps-2-1-79-balloon_to_top .ymaps-2-1-79-balloon__tail{-webkit-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:top left;transform-origin:top left}.ymaps-2-1-79-balloon_to_bottom .ymaps-2-1-79-balloon__tail{-webkit-transform:rotate(135deg);transform:rotate(135deg);-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__tail{position:absolute;z-index:-1;left:45px;font:0/0 a;overflow:hidden;width:13px;height:13px}.ymaps-2-1-79-balloon_to_top.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__tail{top:100%;left:21px}.ymaps-2-1-79-balloon_to_bottom.ymaps-2-1-79-balloon_size_mini .ymaps-2-1-79-balloon__tail{bottom:100%;left:8px}.ymaps-2-1-79-balloon__close{float:right;margin-bottom:-40px;position:relative;z-index:2}@media print{.ymaps-2-1-79-balloon__close{display:none}}.ymaps-2-1-79-balloon__close-button{display:block;width:30px;height:40px;cursor:pointer;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTQgLjdsLS43LS43TDcgNi4zLjcgMCAwIC43IDYuMyA3IDAgMTMuM2wuNy43TDcgNy43bDYuMyA2LjMuNy0uN0w3LjcgN3oiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==) 50% no-repeat;opacity:.3}.ymaps-2-1-79-balloon__close-button:hover{opacity:1}@media print{.ymaps-2-1-79-balloon__layout{position:relative;padding:1px;margin:-1px}.ymaps-2-1-79-balloon__layout:after{top:0;left:0}.ymaps-2-1-79-balloon__tail{overflow:hidden}.ymaps-2-1-79-balloon__layout:after,.ymaps-2-1-79-balloon__tail:after{content:\'\';position:absolute;height:0!important;width:9999px;border-bottom:9999px solid #fff}.ymaps-2-1-79-balloon__tail:before{content:\'\';position:absolute;height:0!important;width:9999px;border-bottom:9999px solid rgba(0,0,0,.15)}}'));
    });
}
, function(ym) {
    ym.modules.define('button-islands_color_yellow', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button-islands_color_yellow{background-color:#ffdb4d}.ymaps-2-1-79-button-islands_color_yellow:hover{background-color:#ffd633}.ymaps-2-1-79-button-islands_color_yellow:active{background-color:#fc0}'));
    });
}
, function(ym) {
    ym.modules.define('button-islands_size_medium', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button-islands_size_medium{height:28px;line-height:28px}'));
    });
}
, function(ym) {
    ym.modules.define('button-islands_size_small', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button-islands_size_small{font-size:13px;height:24px;line-height:24px}'));
    });
}
, function(ym) {
    ym.modules.define('button-islands', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button-islands{position:relative;display:block;margin:0;padding:0;user-select:none;-webkit-user-select:none;cursor:pointer;color:#000;border:0;border-radius:3px;outline:0;text-align:center;white-space:nowrap;font-size:12px;-webkit-tap-highlight-color:rgba(0,0,0,0)}.ymaps-2-1-79-button-islands__text{margin:0 13px;user-select:none;-webkit-user-select:none}'));
    });
}
, function(ym) {
    ym.modules.define('button_arrow_down', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_arrow_down .ymaps-2-1-79-button__text{padding-right:1.8em}.ymaps-2-1-79-button_arrow_down .ymaps-2-1-79-button__text:after{position:absolute;top:0;right:.4em;content:\'\';width:1em;height:100%;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iNy4xOTQsMiAzLjk5Niw1LjE5NSAwLjc5OSwyIDAsMi43OTkgMy45OTYsNi43OTQgNy45OTEsMi43OTkiLz48L3N2Zz4=) 0 50% no-repeat}'));
    });
}
, function(ym) {
    ym.modules.define('button_round_yes', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_round_yes{height:32px;width:32px;border-radius:100%}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_theme_normal:before{border-radius:100%}.ymaps-2-1-79-button_round_yes .ymaps-2-1-79-button__icon.ymaps-2-1-79-b-icon{width:18px;height:18px;margin:-9px 0 0 -9px;background:url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2218%22%20height%3D%2254%22%3E%3Cpath%20fill%3D%22%23010101%22%20d%3D%22M13%2045.42c0-2.209-1.791-4-4-4s-4%201.791-4%204c0%201.631.979%203.027%202.379%203.65l.811-1.824c-.7-.31-1.19-1.012-1.19-1.826%200-1.104.896-2%202-2s2%20.896%202%202c0%20.814-.49%201.516-1.189%201.826l.811%201.824c1.399-.623%202.378-2.019%202.378-3.65zm-4-9c-4.971%200-9%204.029-9%209%200%203.67%202.199%206.82%205.349%208.223l1.217-2.74c-2.099-.936-3.566-3.038-3.566-5.483%200-3.312%202.687-6%206-6%203.312%200%206%202.688%206%206%200%202.445-1.467%204.548-3.566%205.48l1.217%202.74c3.15-1.4%205.35-4.551%205.35-8.221-.001-4.97-4.03-8.999-9.001-8.999z%22%2F%3E%3Cpolygon%20fill%3D%22%23020202%22%20points%3D%224.518%2C15.315%2015.477%2C8.988%204.518%2C2.66%22%2F%3E%3Cpath%20fill%3D%22%23010101%22%20d%3D%22M4%2033h4v-12h-4v12zm6-12v12h4v-12h-4z%22%2F%3E%3C%2Fsvg%3E) no-repeat}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_state_play .ymaps-2-1-79-b-icon{background-position:0 0}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_state_pause .ymaps-2-1-79-b-icon{background-position:0 -18px}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_state_radio .ymaps-2-1-79-b-icon{background-position:0 -36px}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_pressed_yes .ymaps-2-1-79-button__icon{margin-top:-8px}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_focused_yes,.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_focused_yes:not(.ymaps-2-1-79-button_pressed_yes)::before{-moz-box-shadow:0 1px 0 rgba(0,0,0,.07);box-shadow:0 1px 0 rgba(0,0,0,.07)}.ymaps-2-1-79-button_round_yes.ymaps-2-1-79-button_pressed_yes{-moz-box-shadow:none;box-shadow:none}'));
    });
}
, function(ym) {
    ym.modules.define('button_shadow_yes', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('body .ymaps-2-1-79-button_shadow_yes{-moz-box-shadow:0 8px 20px -5px rgba(0,0,0,.25);box-shadow:0 8px 20px -5px rgba(0,0,0,.25)}body .ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_shadow_yes{-moz-box-shadow:0 4px 10px -4px rgba(0,0,0,.45);box-shadow:0 4px 10px -4px rgba(0,0,0,.45)}body .ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_shadow_yes:not(.ymaps-2-1-79-button_pressed_yes){-moz-box-shadow:0 8px 20px -5px rgba(0,0,0,.25),0 0 6px 2px rgba(255,204,0,.7);box-shadow:0 8px 20px -5px rgba(0,0,0,.25),0 0 6px 2px rgba(255,204,0,.7)}@media all and (min-width:0px){.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_shadow_yes{top:1px}.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_shadow_yes .ymaps-2-1-79-button__text{top:0}}body .ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_shadow_yes:before{box-shadow:none}'));
    });
}
, function(ym) {
    ym.modules.define('button_side_left', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_side_left:before{right:0;border-radius:2px 0 0 2px}.ymaps-2-1-79-button_side_left{z-index:2;border-radius:3px 0 0 3px}.ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_side_left{z-index:1}'));
    });
}
, function(ym) {
    ym.modules.define('button_side_right', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_side_right:before{border-radius:0 2px 2px 0}.ymaps-2-1-79-button_side_right{z-index:2;border-radius:0 3px 3px 0}.ymaps-2-1-79-button_side_right.ymaps-2-1-79-button_focused_yes{z-index:1}'));
    });
}
, function(ym) {
    ym.modules.define('button_theme_action', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_theme_action{font-family:Arial,sans-serif}@media all and (min-width:0px){.ymaps-2-1-79-button_theme_action{background:rgba(70,47,0,.54);background:-webkit-linear-gradient(top,rgba(96,64,0,.4) 0%,rgba(70,47,0,.54) 100%);background:-moz-linear-gradient(top,rgba(96,64,0,.4) 0%,rgba(70,47,0,.54) 100%);background:-o-linear-gradient(top,rgba(96,64,0,.4) 0%,rgba(70,47,0,.54) 100%);background:linear-gradient(to bottom,rgba(96,64,0,.4) 0%,rgba(70,47,0,.54) 100%);-moz-box-shadow:0 1px 0 rgba(0,0,0,.07);box-shadow:0 1px 0 rgba(0,0,0,.07);border-radius:3px}.ymaps-2-1-79-button_theme_action:before{position:absolute;bottom:1px;right:1px;left:1px;top:1px;content:\'\';background:#ffdf60;background:-webkit-linear-gradient(top,#ffdf60 0,#fc0 100%);background:-moz-linear-gradient(top,#ffdf60 0,#fc0 100%);background:-o-linear-gradient(top,#ffdf60 0,#fc0 100%);background:linear-gradient(to bottom,#ffdf60 0,#fc0 100%);border-radius:2px}.ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_theme_action{-moz-box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 6px 2px rgba(255,204,0,.7);box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 6px 2px rgba(255,204,0,.7)}.ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_theme_action:before{-moz-box-shadow:0 0 0 1px rgba(193,154,0,.2);box-shadow:0 0 0 1px rgba(193,154,0,.2)}.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_theme_action{-moz-box-shadow:inset 0 2px 1px -1px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.2);box-shadow:inset 0 2px 1px -1px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.2)}.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_theme_action:before{-moz-box-shadow:inset 0 1px 3px -1px rgba(0,0,0,.5);box-shadow:inset 0 1px 3px -1px rgba(0,0,0,.5)}.ymaps-2-1-79-button_theme_action,a.ymaps-2-1-79-button_theme_action.ymaps-2-1-79-button_hovered_yes{color:#000!important}}'));
    });
}
, function(ym) {
    ym.modules.define('button_theme_normal', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_theme_normal{font-family:Arial,sans-serif}@media all and (min-width:0px){.ymaps-2-1-79-button_theme_normal{background:rgba(0,0,0,.4);background:-webkit-linear-gradient(top,rgba(0,0,0,.2) 0,rgba(0,0,0,.4) 100%);background:-moz-linear-gradient(top,rgba(0,0,0,.2) 0,rgba(0,0,0,.4) 100%);background:-o-linear-gradient(top,rgba(0,0,0,.2) 0,rgba(0,0,0,.4) 100%);background:linear-gradient(to bottom,rgba(0,0,0,.2) 0,rgba(0,0,0,.4) 100%);-moz-box-shadow:0 1px 0 rgba(0,0,0,.07);box-shadow:0 1px 0 rgba(0,0,0,.07);border-radius:3px}.ymaps-2-1-79-button_theme_normal:before{position:absolute;bottom:1px;right:1px;left:1px;top:1px;content:\'\';background:#fff;background:-webkit-linear-gradient(top,#fff 0,#eee 100%);background:-moz-linear-gradient(top,#fff 0,#eee 100%);background:-o-linear-gradient(top,#fff 0,#eee 100%);background:linear-gradient(to bottom,#fff 0,#eee 100%);border-radius:2px}.ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_theme_normal{-moz-box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 6px 2px rgba(255,204,0,.7);box-shadow:0 1px 0 rgba(0,0,0,.07),0 0 6px 2px rgba(255,204,0,.7)}.ymaps-2-1-79-button_focused_yes.ymaps-2-1-79-button_theme_normal:not(.ymaps-2-1-79-button_pressed_yes):before{-moz-box-shadow:0 0 0 1px rgba(193,154,0,.2);box-shadow:0 0 0 1px rgba(193,154,0,.2)}.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_theme_normal{-moz-box-shadow:inset 0 2px 1px -1px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.2);box-shadow:inset 0 2px 1px -1px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.2)}.ymaps-2-1-79-button_pressed_yes.ymaps-2-1-79-button_theme_normal:before{-moz-box-shadow:inset 0 1px 3px -1px rgba(0,0,0,.5);box-shadow:inset 0 1px 3px -1px rgba(0,0,0,.5)}.ymaps-2-1-79-button_theme_normal,a.ymaps-2-1-79-button_theme_normal.ymaps-2-1-79-button_hovered_yes{color:#000!important}}'));
    });
}
, function(ym) {
    ym.modules.define('button_theme_pseudo', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-button_theme_pseudo{font-family:Arial,sans-serif}.ymaps-2-1-79-button_theme_pseudo,a.ymaps-2-1-79-button_theme_pseudo:hover,a.ymaps-2-1-79-button_theme_pseudo:link,a.ymaps-2-1-79-button_theme_pseudo:visited{cursor:pointer;color:#000!important}.ymaps-2-1-79-button_theme_pseudo .ymaps-2-1-79-button__text{padding:0 .78em}@media all and (min-width:0px){.ymaps-2-1-79-button_theme_pseudo{line-height:24px;outline:hidden;border-radius:3px;background:0 0;-moz-box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}.ymaps-2-1-79-button_size_m.ymaps-2-1-79-button_theme_pseudo{line-height:28px}.ymaps-2-1-79-button_theme_pseudo .ymaps-2-1-79-button__text{top:0!important}.ymaps-2-1-79-button_hovered_yes.ymaps-2-1-79-button_theme_pseudo{-moz-box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}}'));
    });
}
, function(ym) {
    ym.modules.define('check', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-check,.ymaps-2-1-79-check__box{color:#000;font-family:Arial,Helvetica,sans-serif;display:inline-block;cursor:pointer}.ymaps-2-1-79-check__box{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;vertical-align:middle;text-decoration:none;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;text-align:left;background-color:#fff;border-color:rgba(0,0,0,.2)}a.ymaps-2-1-79-check__box,a.ymaps-2-1-79-check__box:active,a.ymaps-2-1-79-check__box:hover,a.ymaps-2-1-79-check__box:link,a.ymaps-2-1-79-check__box:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-check__box:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-check__box.ymaps-2-1-79-_pressed,.ymaps-2-1-79-check__box:active{background-color:#f3f1ed}.ymaps-2-1-79-check__box.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-check{position:relative;padding-left:19px}.ymaps-2-1-79-check.ymaps-2-1-79-_disabled{cursor:default}.ymaps-2-1-79-check__control{position:absolute;left:-2px;top:-2px;opacity:0;z-index:-1}.ymaps-2-1-79-check__box{width:14px;height:14px;padding:0;position:absolute;left:0;font-size:0;line-height:0}.ymaps-2-1-79-check__box:after{content:\'\';position:absolute;left:0;bottom:2px;width:16px;height:16px}.ymaps-2-1-79-check__control:checked+.ymaps-2-1-79-check__box{background-color:#ffeba0}.ymaps-2-1-79-check__control:checked+.ymaps-2-1-79-check__box:after{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNiI+PHBhdGggZD0iTTEzLjUxLjQ1TDUuNDcgMTIuNDhsLTMuNzYtNC4yTC42NyA5LjYxbDQuOTMgNS40NUwxNC43MiAxLjZ6Ii8+PC9zdmc+) no-repeat center}.ymaps-2-1-79-check__control:checked+.ymaps-2-1-79-check__box.ymaps-2-1-79-_pressed{background-color:#fee481}.ymaps-2-1-79-check__control:disabled+.ymaps-2-1-79-check__box,.ymaps-2-1-79-check__control:disabled~.ymaps-2-1-79-check__label-text{opacity:.5}.ymaps-2-1-79-check__control:checked:disabled+.ymaps-2-1-79-check__box{background-color:#d9d9d9!important}'));
    });
}
, function(ym) {
    ym.modules.define('cluster-accordion-panel', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-cluster-accordion-panel{position:relative;display:block;overflow:hidden}.ymaps-2-1-79-cluster-accordion-panel__inner{display:block;width:200%}.ymaps-2-1-79-cluster-accordion-panel__section{display:block;position:relative;width:50%;-webkit-box-sizing:border-box!important;-moz-box-sizing:border-box!important;box-sizing:border-box!important;float:left}.ymaps-2-1-79-cluster-accordion-panel__section_type_nav *{text-align:left}.ymaps-2-1-79-cluster-accordion-panel__menu{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-transform:translate3d(0%,0,0)}.ymaps-2-1-79-cluster-accordion-panel-swipe-animation{-webkit-transform:translate3d(0%,0,0);-moz-transform:translate3d(0%,0,0);-ms-transform:translate(0%,0);-o-transform:translate(0%,0,0);transform:translate3d(0%,0,0);-webkit-transition:-webkit-transform .2s linear;-moz-transition:-moz-transform .2s linear;-ms-transition:-ms-transform .2s linear;-o-transition:-o-transform .2s linear;transition:transform .2s linear}.ymaps-2-1-79-cluster-accordion-panel_active_animation{-webkit-transform:translate3d(-50%,0,0);-moz-transform:translate3d(-50%,0,0);-ms-transform:translate(-50%,0);-o-transform:translate(-50%,0);transform:translate3d(-50%,0,0)}.ymaps-2-1-79-cluster-accordion-panel_active .ymaps-2-1-79-cluster-accordion-panel__section:first-child{display:none}.ymaps-2-1-79-cluster-accordion-panel__content-holder,.ymaps-2-1-79-cluster-accordion-panel__menu{overflow-y:auto;overflow-x:hidden;display:block}.ymaps-2-1-79-cluster-accordion-panel__menu-item-text{padding-left:26px}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__section_type_content-inner{display:block}.ymaps-2-1-79-cluster-accordion-panel__item-hidden-icon .ymaps-2-1-79-cluster-accordion-panel__menu-item-text{padding-left:0!important}.ymaps-2-1-79-cluster-accordion-panel__item-hidden-icon .ymaps-2-1-79-cluster-accordion__item-number{display:none}.ymaps-2-1-79-cluster-accordion-panel__menu-item-number{position:absolute;top:10px;left:0;z-index:-1;width:18px;height:18px;color:#000;font-size:10px;line-height:19px}.ymaps-2-1-79-cluster-accordion_list_numeric .ymaps-2-1-79-cluster-accordion__item-number{text-align:center}.ymaps-2-1-79-cluster-accordion_list_marker .ymaps-2-1-79-cluster-accordion__item-number{text-indent:-9999px}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item_current_yes{background:0 0}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item{position:relative;top:-2px;display:block;margin:0;padding:8px 0;border-top:1px solid #eaeaea;font:15px/24px Arial,sans-serif;z-index:2}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item-text{color:#000!important}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item-text:hover{color:red!important}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item:after,.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item:before{position:absolute;top:-1px;width:30px;height:1px;content:\'\'}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item:before{left:0;background:-moz-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-webkit-gradient(linear,left top,right top,color-stop(0%,#fff),color-stop(100%,#eaeaea));background:-webkit-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-o-linear-gradient(left,#fff 0%,#eaeaea 100%);background:-ms-linear-gradient(left,#fff 0%,#eaeaea 100%);background:linear-gradient(to right,#fff 0%,#eaeaea 100%)}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-item:after{right:0;background:-moz-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-webkit-gradient(linear,left top,right top,color-stop(0%,#eaeaea),color-stop(100%,#fff));background:-webkit-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-o-linear-gradient(left,#eaeaea 0%,#fff 100%);background:-ms-linear-gradient(left,#eaeaea 0%,#fff 100%);background:linear-gradient(to right,#eaeaea 0%,#fff 100%)}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__section_type_content{padding-left:28px}.ymaps-2-1-79-cluster-accordion-panel .ymaps-2-1-79-cluster-accordion-panel__menu-icon{position:absolute;left:-6px;margin-top:-6px;width:30px;height:30px;cursor:pointer;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0M5QzlDOSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwdjJoMTRWMEgwem0wIDV2MmgxNFY1SDB6bTAgNXYyaDE0di0ySDB6Ii8+PC9zdmc+) no-repeat 50% 50%}.ymaps-2-1-79-cluster-accordion-panel__menu-item-number,.ymaps-2-1-79-cluster-accordion-panel__menu-item-text{cursor:pointer}'));
    });
}
, function(ym) {
    ym.modules.define('cluster-default', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-default-cluster{position:absolute;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px}'));
    });
}
, function(ym) {
    ym.modules.define('cluster-night-content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-cluster-night-content{color:#fff}'));
    });
}
, function(ym) {
    ym.modules.define('control-manager', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-controls__bottom,.ymaps-2-1-79-controls__toolbar{position:absolute;width:100%}.ymaps-2-1-79-controls__toolbar_left{float:left;height:0}.ymaps-2-1-79-controls__toolbar_right{float:right;height:0}.ymaps-2-1-79-controls__control_toolbar{display:inline-block;vertical-align:top}.ymaps-2-1-79-controls__control{display:block;position:absolute;vertical-align:top}.ymaps-2-1-79-controls__control_visibility_hidden{display:none}'));
    });
}
, function(ym) {
    ym.modules.define('copyright__logo', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-copyright__logo{display:block;width:46px;height:20px;position:relative;top:-2px;opacity:.7;background-position:0 100%;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NiIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PGNsaXBQYXRoIGlkPSJhIj48cGF0aCBkPSJNMCAwaDQ2djIwSDB6Ii8+PC9jbGlwUGF0aD48ZyBjbGlwLXBhdGg9InVybCgjYSkiPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik05LjQyIDE1LjM4Yy0uMjIuMTMtLjQ4LjItLjc2LjJINi44Yy0uNzggMC0xLjQyLS41Ni0xLjUyLTEuM2wtLjQzLjYzYy0uMjguNDItLjc2LjY4LTEuMjcuNjhIMS41N2MtLjU3IDAtMS4xLS4zMS0xLjM2LS44YTEuNSAxLjUgMCAwIDEgLjA4LTEuNTdsMS42NS0yLjQyQTUuMDUgNS4wNSAwIDAgMSAuMjggNi45NGMwLTEuNC41LTIuNyAxLjU4LTMuNjJBNi4xNiA2LjE2IDAgMCAxIDUuOTYgMmgyLjdjLjg0IDAgMS41My42OCAxLjUzIDEuNTJ2MS40aDEuODNjLjUgMCAuOTQuMjMgMS4yMi42LjI4LS4zNy43Mi0uNiAxLjIyLS42aDEuODJjLjQxIDAgLjc4LjE1IDEuMDYuNC4yNy0uMjUuNjQtLjQgMS4wNS0uNGg1LjMyYy42NSAwIDEuMi4zOSAxLjQzLjk1YTQuNjEgNC42MSAwIDAgMSAzLjEyLTEuMWMxIDAgMi4wNS4yMyAyLjkuOTIuMjYtLjQ2Ljc2LS43OCAxLjMzLS43OGgxLjgzYy41NCAwIDEuMDEuMjggMS4yOS43bC4wNS0uMDdjLjI4LS40Ljc1LS42MyAxLjI0LS42M2gxLjg0Yy40NSAwIC44Ni4yIDEuMTUuNTJhNS4yIDUuMiAwIDAgMSAyLjY0LS42N2MxLjAzIDAgMiAuMTcgMi43Mi41Ni40OC4yNy43OC43OC43OCAxLjMzdjEuNTNjMCAuNTUtLjMgMS4wNi0uNzkgMS4zMy0uNDkuMjYtMS4wOC4yNS0xLjU2LS4wNGEyLjEyIDIuMTIgMCAwIDAtLjk1LS4yNC41LjUgMCAwIDAtLjE0LjAxYy0uMDQuMDYtLjE4LjMtLjE4Ljk3IDAgLjY3LjEyLjk2LjE4IDEuMDVhMS40NCAxLjQ0IDAgMCAwIDEuMDMtLjIzIDEuNTMgMS41MyAwIDEgMSAyLjQyIDEuMjR2MS40OGMwIC40OS0uMjUuOTQtLjY0IDEuMjMtLjgxLjU4LTEuNzguNzYtMi44Ljc2YTUuOCA1LjggMCAwIDEtMi41LS41MmMtLjI4LjIzLS42My4zNy0xIC4zN2gtMi4wOGMtLjUgMC0uOTYtLjI0LTEuMjUtLjY0bC0uMS0uMTVjLS4yNy40Ny0uNzcuNzktMS4zNS43OWgtMS44M2ExLjUgMS41IDAgMCAxLTEuMDYtLjQzYy0uNzYuMzYtMS43LjU4LTIuOC41OC0uOTEgMC0xLjgtLjE2LTIuNTctLjU0di42MmMwIC44My0uNjkgMS41MS0xLjUzIDEuNTFoLTEuN2MtLjg0IDAtMS41My0uNjgtMS41My0xLjUxdi0uMjNoLTEuMDJ2LjIzYzAgLjgzLS43IDEuNTEtMS41NCAxLjUxaC0xLjY5Yy0uODUgMC0xLjUzLS42OC0xLjUzLTEuNTF2LS4yM2gtMS4wNmMtLjUgMC0uOTQtLjI0LTEuMjItLjYtLjI4LjM2LS43Mi42LTEuMjIuNmgtMS44M2MtLjI4IDAtLjU0LS4wOC0uNzctLjJ6Ii8+PGcgZmlsbD0iIzAwMCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzEuMTYgMTIuMTV2MS40OWMtLjU0LjM3LTEuNC42Ny0yLjU2LjY3LTIuMzMgMC0zLjY1LTEuMy0zLjY1LTMuOTggMC0yLjMzIDEuMDYtNC4wNCAzLjI4LTQuMDQgMS44MiAwIDMgMS4wMiAzIDMuN3YuOTZoLTQuNGMuMDggMS4zLjU5IDEuOTIgMS45MiAxLjkyLjg5IDAgMS44NC0uMzQgMi40LS43MnptLTEuNzgtMi43YzAtLjk2LS4yOC0xLjcyLTEuMTgtMS43Mi0uODggMC0xLjMyLjY1LTEuMzcgMS44OGgyLjU1eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTQ0LjQ1IDEzLjg0YTMuMSAzLjEgMCAwIDEtMS44OC40N2MtMi40NCAwLTMuNjItMS40Mi0zLjYyLTQgMC0yLjM1IDEuMi00LjAyIDMuNTQtNC4wMi45IDAgMS41OC4xNiAxLjk2LjM3djEuNTVhMy42IDMuNiAwIDAgMC0xLjc2LS40OGMtMS4yIDAtMS44Ni44Ni0xLjg2IDIuNTMgMCAxLjYuNTQgMi42MSAxLjg0IDIuNjEuNzcgMCAxLjMyLS4yIDEuNzgtLjUyek0xNC40NCA5LjVWNi40NWgxLjgzdjcuN2gtMS44M3YtMy4yMWgtMi40M3YzLjIyaC0xLjgzVjYuNDVoMS44M1Y5LjV6Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjMuNjkgMTIuNzJoLjgxdjMuMmgtMS42OHYtMS43NmgtNC4xdjEuNzZoLTEuNjh2LTMuMmguNTZjLjY1LTEuMjkuNzctMy43My43Ny01LjYxdi0uNjZoNS4zMnptLTQuNCAwaDIuNThWNy44OWgtMS45NHYuMjNjMCAxLjMzLS4xMyAzLjQzLS42NCA0LjZ6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzkuMDUgMTQuMTZoLTIuMDdsLTIuNy0zLjc5djMuNzloLTEuODJWNi40NWgxLjgzVjEwbDIuNTctMy41NWgxLjg0TDM2LjEzIDEweiIvPjwvZz48cGF0aCBmaWxsPSJyZWQiIGQ9Ik02LjggMTQuMTZoMS44NVYzLjVoLTIuN0MzLjI0IDMuNSAxLjggNC45IDEuOCA2Ljk1YzAgMS42NC43OCAyLjYgMi4xOCAzLjZsLTIuNDMgMy42aDIuMDFsMi43LTQuMDItLjkzLS42M2MtMS4xNC0uNzctMS43LTEuMzctMS43LTIuNjUgMC0xLjE0LjgtMS45IDIuMzItMS45aC44M3oiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-copyright_color_white .ymaps-2-1-79-copyright__logo{opacity:.95;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NiIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PGNsaXBQYXRoIGlkPSJhIj48cGF0aCBkPSJNMCAwaDQ2djIwSDB6Ii8+PC9jbGlwUGF0aD48ZyBjbGlwLXBhdGg9InVybCgjYSkiPjxwYXRoIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjQiIGQ9Ik05LjQyIDE1LjM4Yy0uMjIuMTMtLjQ4LjItLjc2LjJINi44Yy0uNzggMC0xLjQyLS41Ni0xLjUyLTEuM2wtLjQzLjYzYy0uMjguNDItLjc2LjY4LTEuMjcuNjhIMS41N2MtLjU3IDAtMS4xLS4zMS0xLjM2LS44YTEuNSAxLjUgMCAwIDEgLjA4LTEuNTdsMS42NS0yLjQyQTUuMDUgNS4wNSAwIDAgMSAuMjggNi45NGMwLTEuNC41LTIuNyAxLjU4LTMuNjJBNi4xNiA2LjE2IDAgMCAxIDUuOTYgMmgyLjdjLjg0IDAgMS41My42OCAxLjUzIDEuNTJ2MS40aDEuODNjLjUgMCAuOTQuMjMgMS4yMi42LjI4LS4zNy43Mi0uNiAxLjIyLS42aDEuODJjLjQxIDAgLjc4LjE1IDEuMDYuNC4yNy0uMjUuNjQtLjQgMS4wNS0uNGg1LjMyYy42NSAwIDEuMi4zOSAxLjQzLjk1YTQuNjEgNC42MSAwIDAgMSAzLjEyLTEuMWMxIDAgMi4wNS4yMyAyLjkuOTIuMjYtLjQ2Ljc2LS43OCAxLjMzLS43OGgxLjgzYy41NCAwIDEuMDEuMjggMS4yOS43bC4wNS0uMDdjLjI4LS40Ljc1LS42MyAxLjI0LS42M2gxLjg0Yy40NSAwIC44Ni4yIDEuMTUuNTJhNS4yIDUuMiAwIDAgMSAyLjY0LS42N2MxLjAzIDAgMiAuMTcgMi43Mi41Ni40OC4yNy43OC43OC43OCAxLjMzdjEuNTNjMCAuNTUtLjMgMS4wNi0uNzkgMS4zMy0uNDkuMjYtMS4wOC4yNS0xLjU2LS4wNGEyLjEyIDIuMTIgMCAwIDAtLjk1LS4yNC41LjUgMCAwIDAtLjE0LjAxYy0uMDQuMDYtLjE4LjMtLjE4Ljk3IDAgLjY3LjEyLjk2LjE4IDEuMDVhMS40NCAxLjQ0IDAgMCAwIDEuMDMtLjIzIDEuNTMgMS41MyAwIDEgMSAyLjQyIDEuMjR2MS40OGMwIC40OS0uMjUuOTQtLjY0IDEuMjMtLjgxLjU4LTEuNzguNzYtMi44Ljc2YTUuOCA1LjggMCAwIDEtMi41LS41MmMtLjI4LjIzLS42My4zNy0xIC4zN2gtMi4wOGMtLjUgMC0uOTYtLjI0LTEuMjUtLjY0bC0uMS0uMTVjLS4yNy40Ny0uNzcuNzktMS4zNS43OWgtMS44M2ExLjUgMS41IDAgMCAxLTEuMDYtLjQzYy0uNzYuMzYtMS43LjU4LTIuOC41OC0uOTEgMC0xLjgtLjE2LTIuNTctLjU0di42MmMwIC44My0uNjkgMS41MS0xLjUzIDEuNTFoLTEuN2MtLjg0IDAtMS41My0uNjgtMS41My0xLjUxdi0uMjNoLTEuMDJ2LjIzYzAgLjgzLS43IDEuNTEtMS41NCAxLjUxaC0xLjY5Yy0uODUgMC0xLjUzLS42OC0xLjUzLTEuNTF2LS4yM2gtMS4wNmMtLjUgMC0uOTQtLjI0LTEuMjItLjYtLjI4LjM2LS43Mi42LTEuMjIuNmgtMS44M2MtLjI4IDAtLjU0LS4wOC0uNzctLjJ6Ii8+PGcgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTguNjUgMTQuMTZINi43OVY0Ljk0aC0uODNjLTEuNTEgMC0yLjMxLjc3LTIuMzEgMS45IDAgMS4zLjU1IDEuOSAxLjY5IDIuNjZsLjkzLjYzLTIuNyA0LjAzaC0ybDIuNDItMy42Yy0xLjQtMS0yLjE4LTEuOTctMi4xOC0zLjZDMS44IDQuOSAzLjI0IDMuNSA1Ljk1IDMuNWgyLjd6Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMzEuMTYgMTIuMTV2MS40OWMtLjU0LjM3LTEuNC42Ny0yLjU2LjY3LTIuMzMgMC0zLjY1LTEuMy0zLjY1LTMuOTggMC0yLjMzIDEuMDYtNC4wNCAzLjI4LTQuMDQgMS44MiAwIDMgMS4wMiAzIDMuN3YuOTZoLTQuNGMuMDggMS4zLjU5IDEuOTIgMS45MiAxLjkyLjg5IDAgMS44NC0uMzQgMi40LS43MnptLTEuNzgtMi43YzAtLjk2LS4yOC0xLjcyLTEuMTgtMS43Mi0uODggMC0xLjMyLjY1LTEuMzcgMS44OGgyLjU1eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTQ0LjQ1IDEzLjg0YTMuMSAzLjEgMCAwIDEtMS44OC40N2MtMi40NCAwLTMuNjItMS40Mi0zLjYyLTQgMC0yLjM1IDEuMi00LjAyIDMuNTQtNC4wMi45IDAgMS41OC4xNiAxLjk2LjM3djEuNTVhMy42IDMuNiAwIDAgMC0xLjc2LS40OGMtMS4yIDAtMS44Ni44Ni0xLjg2IDIuNTMgMCAxLjYuNTQgMi42MSAxLjg0IDIuNjEuNzcgMCAxLjMyLS4yIDEuNzgtLjUyek0xNC40NCA2LjQ1VjkuNWgtMi40M1Y2LjQ1aC0xLjgzdjcuN2gxLjgzdi0zLjIxaDIuNDN2My4yMmgxLjgzVjYuNDV6Ii8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjMuNjkgMTIuNzJoLjgxdjMuMmgtMS42OHYtMS43NmgtNC4xdjEuNzZoLTEuNjh2LTMuMmguNTZjLjY1LTEuMjkuNzctMy43My43Ny01LjYxdi0uNjZoNS4zMnptLTQuNCAwaDIuNThWNy44OWgtMS45NHYuMjNjMCAxLjMzLS4xMyAzLjQzLS42NCA0LjZ6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMzYuOTggMTQuMTZoMi4wN0wzNi4xMyAxMGwyLjU3LTMuNTVoLTEuODRMMzQuMyAxMFY2LjQ1aC0xLjgzdjcuN2gxLjgzdi0zLjc4eiIvPjwvZz48L2c+PC9zdmc+)}.ymaps-2-1-79-copyright .ymaps-2-1-79-copyright__logo:hover{opacity:1}.ymaps-2-1-79-copyright__logo_lang_en{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NiIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuOCIgZD0iTTM0LjM1IDUuNjhjLjgxIDAgMS42NS4xNiAyLjM3LjYxLjI4LS4zLjY2LS40NiAxLjA4LS40NmgxLjk3Yy41IDAgLjk3LjI2IDEuMjQuNjhsLjEuMTYuMDYtLjFjLjI2LS40Ni43NS0uNzQgMS4yOC0uNzRoMS43NWExLjQ3IDEuNDcgMCAwIDEgMS4yOCAyLjIxbC0xLjY1IDIuODIgMS45NCAzLjA2YTEuNDcgMS40NyAwIDAgMS0xLjI0IDIuMjZoLTEuOThjLS41IDAtLjk3LS4yNi0xLjI0LS42OWwtLjMtLjQ2LS4yNS40M2MtLjI3LjQ1LS43NS43Mi0xLjI3LjcyaC0xLjc4YTEuNSAxLjUgMCAwIDEtLjc4LS4yMiA2LjUgNi41IDAgMCAxLTIuMjMuMzcgNS4xIDUuMSAwIDAgMS0zLjI3LTEuMDRjLS4yMi41Mi0uNzQuOS0xLjM1LjloLTEuNjJhMS42IDEuNiAwIDAgMS0uNjItLjE0IDMuOTQgMy45NCAwIDAgMS00LjEtLjdjLS4yMy41LS43NC44My0xLjMyLjgzaC0xLjc1Yy0uNSAwLS45Mi0uMjMtMS4xOS0uNi0uMjcuMzctLjcuNi0xLjE5LjZoLTEuNzVhMS41IDEuNSAwIDAgMS0uNjctLjE2Yy0uMi4xLS40My4xNi0uNjcuMTZoLTEuN2MtLjIgMC0uNC0uMDQtLjU4LS4xMS0uNDMuMTQtLjkuMjEtMS40NS4yMS0uOTcgMC0xLjkzLS4zLTIuNjYtMS0uMzEtLjMtLjU1LS42NC0uNzItMS4wMnYuNDVjMCAuODEtLjY2IDEuNDctMS40OCAxLjQ3SDQuODNjLS44MSAwLTEuNDctLjY2LTEuNDctMS40N1YxMi4xTC4xMyA1LjA5QTEuNDcgMS40NyAwIDAgMSAxLjQ3IDNoMS44NmMuNTcgMCAxLjEuMzQgMS4zNC44NmwxLjA5IDIuMzhMNi44IDMuODhjLjIzLS41NC43Ni0uODggMS4zNS0uODhoMS44YTEuNDcgMS40NyAwIDAgMSAxLjM2IDIuMDdsLS4zNy44MmMuNDMtLjExLjktLjE4IDEuNC0uMTggMS4wMSAwIDIuMS4xNyAyLjk0LjgzLjI2LS40My43Mi0uNzEgMS4yNi0uNzFoMS43MWMuMjEgMCAuNDEuMDQuNi4xMmE0LjggNC44IDAgMCAxIDEuNTUtLjI0Yy45IDAgMS45LjIgMi42Mi45Ny4xMy4xNC4yNC4yOS4zNC40NGEzLjk4IDMuOTggMCAwIDEgMy41LTEuNDJWNC40N2MwLS44MS42NS0xLjQ3IDEuNDYtMS40N2gxLjc2Yy44MSAwIDEuNDcuNjYgMS40NyAxLjQ3VjYuNmMuNzYtLjYgMS43MS0uOTEgMi44LS45MXoiLz48ZyBmaWxsPSIjMDAwIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yOC40IDEzLjc2YTIuMjggMi4yOCAwIDAgMS0xLjk4IDEuMWMtMS42NSAwLTIuOC0xLjM1LTIuOC0zLjggMC0yLjQ3IDEuMTgtMy45IDIuODctMy45Ljc3IDAgMS40Mi4zNSAxLjg2IDEuMDJ2LTMuN2gxLjc2djEwLjI0aC0xLjYzem0tLjA1LTIuNzVjMC0xLjcxLS40Ny0yLjQ3LTEuNDEtMi40Ny0xIDAtMS41Ljc3LTEuNSAyLjUyIDAgMS42OS40NiAyLjQyIDEuNDIgMi40MiAxIDAgMS41LS43NSAxLjUtMi40N3pNMzcuMiAxMi43OXYxLjQzYTQuNCA0LjQgMCAwIDEtMi40Ni42NWMtMi4yNSAwLTMuNTEtMS4yNS0zLjUxLTMuODMgMC0yLjI1IDEuMDEtMy44OCAzLjE1LTMuODggMS43NiAwIDIuOS45NyAyLjkgMy41NXYuOTNoLTQuMjRjLjA3IDEuMjQuNTYgMS44NCAxLjg0IDEuODQuODYgMCAxLjc3LS4zMiAyLjMyLS42OXptLTEuNzEtMi42YzAtLjkyLS4yNy0xLjY1LTEuMTQtMS42NS0uODQgMC0xLjI3LjYyLTEuMyAxLjhoMi40NHpNMTIuMzYgNy4xOWMxLjg1IDAgMi43Ny42OCAyLjc3IDIuNDd2My4yNWMwIC42LjAzIDEuMi4wOSAxLjgxSDEzLjVjLS4wNi0uMTUtLjEyLS40LS4xNC0uNTloLS4wN2MtLjM0LjM2LS43OC43LTEuODEuNy0xLjM2IDAtMi4yOC0uODMtMi4yOC0yLjI2IDAtMS41NSAxLjItMi40MiAzLjg4LTIuNDJoLjI4di0uNDdjMC0uOC0uMzgtMS4xLTEuMjItMS4xLS45OSAwLTEuODQuNTQtMi40IDFWOC4wNmE0LjU0IDQuNTQgMCAwIDEgMi42LS44N3ptLS4yNCA2LjM1Yy42MiAwIDEuMDMtLjI2IDEuMjUtLjU5di0xLjYzaC0uMjVjLTEuNSAwLTIuMS4yOS0yLjEgMS4xNSAwIC42NC4zNiAxLjA3IDEuMSAxLjA3eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTE5Ljc5IDguNjZjLS42NCAwLTEuMTUuMzQtMS40OC43NHY1LjMyaC0xLjc1VjcuMzFoMS43bC4wNS42MWguMDljLjM1LS4zNS45Ny0uNzMgMi4wMi0uNzMgMS40MyAwIDIuMDIuNjUgMi4wMiAyLjEydjUuNDFoLTEuNzVWOS41YzAtLjU2LS4yOC0uODMtLjktLjgzek00NC41NyAxNC43MmgtMS45OGwtMS41Ny0yLjUtMS41IDIuNWgtMS43OGwyLjMzLTMuODYtMi4yNC0zLjU1aDEuOThsMS40MSAyLjI0TDQyLjUgNy4zaDEuNzZsLTIuMSAzLjZ6Ii8+PC9nPjxwYXRoIGZpbGw9InJlZCIgZD0iTTYuNjIgMTQuNzJ2LTEuNzRhNS4yIDUuMiAwIDAgMC0uNjYtMi43OUwzLjMzIDQuNDdIMS40N2wzLjM3IDcuMzJ2Mi45M3pNNy43OCA5LjQzbDIuMTktNC45Nkg4LjE1TDUuOTcgOS40M3oiLz48L3N2Zz4=)}.ymaps-2-1-79-copyright_color_white .ymaps-2-1-79-copyright__logo_lang_en{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NiIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNCIgZD0iTTM0LjM1IDUuNjhjLjgxIDAgMS42NS4xNiAyLjM3LjYxLjI4LS4zLjY2LS40NiAxLjA4LS40NmgxLjk3Yy41IDAgLjk3LjI2IDEuMjQuNjhsLjEuMTYuMDYtLjFjLjI2LS40Ni43NS0uNzQgMS4yOC0uNzRoMS43NWExLjQ3IDEuNDcgMCAwIDEgMS4yOCAyLjIxbC0xLjY1IDIuODIgMS45NCAzLjA2YTEuNDcgMS40NyAwIDAgMS0xLjI0IDIuMjZoLTEuOThjLS41IDAtLjk3LS4yNi0xLjI0LS42OWwtLjMtLjQ2LS4yNS40M2MtLjI3LjQ1LS43NS43Mi0xLjI3LjcyaC0xLjc4YTEuNSAxLjUgMCAwIDEtLjc4LS4yMiA2LjUgNi41IDAgMCAxLTIuMjMuMzcgNS4xIDUuMSAwIDAgMS0zLjI3LTEuMDRjLS4yMi41Mi0uNzQuOS0xLjM1LjloLTEuNjJhMS42IDEuNiAwIDAgMS0uNjItLjE0IDMuOTQgMy45NCAwIDAgMS00LjEtLjdjLS4yMy41LS43NC44My0xLjMyLjgzaC0xLjc1Yy0uNSAwLS45Mi0uMjMtMS4xOS0uNi0uMjcuMzctLjcuNi0xLjE5LjZoLTEuNzVhMS41IDEuNSAwIDAgMS0uNjctLjE2Yy0uMi4xLS40My4xNi0uNjcuMTZoLTEuN2MtLjIgMC0uNC0uMDQtLjU4LS4xMS0uNDMuMTQtLjkuMjEtMS40NS4yMS0uOTcgMC0xLjkzLS4zLTIuNjYtMS0uMzEtLjMtLjU1LS42NC0uNzItMS4wMnYuNDVjMCAuODEtLjY2IDEuNDctMS40OCAxLjQ3SDQuODNjLS44MSAwLTEuNDctLjY2LTEuNDctMS40N1YxMi4xTC4xMyA1LjA5QTEuNDcgMS40NyAwIDAgMSAxLjQ3IDNoMS44NmMuNTcgMCAxLjEuMzQgMS4zNC44NmwxLjA5IDIuMzhMNi44IDMuODhjLjIzLS41NC43Ni0uODggMS4zNS0uODhoMS44YTEuNDcgMS40NyAwIDAgMSAxLjM2IDIuMDdsLS4zNy44MmMuNDMtLjExLjktLjE4IDEuNC0uMTggMS4wMSAwIDIuMS4xNyAyLjk0LjgzLjI2LS40My43Mi0uNzEgMS4yNi0uNzFoMS43MWMuMjEgMCAuNDEuMDQuNi4xMmE0LjggNC44IDAgMCAxIDEuNTUtLjI0Yy45IDAgMS45LjIgMi42Mi45Ny4xMy4xNC4yNC4yOS4zNC40NGEzLjk4IDMuOTggMCAwIDEgMy41LTEuNDJWNC40N2MwLS44MS42NS0xLjQ3IDEuNDYtMS40N2gxLjc2Yy44MSAwIDEuNDcuNjYgMS40NyAxLjQ3VjYuNmMuNzYtLjYgMS43MS0uOTEgMi44LS45MXoiLz48ZyBmaWxsPSIjZmZmIj48cGF0aCBkPSJNNi42MiAxMi45OHYxLjc0SDQuODRWMTEuOEwxLjQ3IDQuNDdoMS44NmwyLjYzIDUuNzJjLjUgMS4xLjY2IDEuNDguNjYgMi44ek05Ljk3IDQuNDdMNy43OCA5LjQzaC0xLjhsMi4xNy00Ljk2eiIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTI4LjQgMTMuNzZhMi4yOCAyLjI4IDAgMCAxLTEuOTggMS4xYy0xLjY1IDAtMi44LTEuMzUtMi44LTMuOCAwLTIuNDcgMS4xOC0zLjkgMi44Ny0zLjkuNzcgMCAxLjQyLjM1IDEuODYgMS4wMnYtMy43aDEuNzZ2MTAuMjRoLTEuNjN6bS0uMDUtMi43NWMwLTEuNzEtLjQ3LTIuNDctMS40MS0yLjQ3LTEgMC0xLjUuNzctMS41IDIuNTIgMCAxLjY5LjQ2IDIuNDIgMS40MiAyLjQyIDEgMCAxLjUtLjc1IDEuNS0yLjQ3ek0zNy4yIDEyLjc5djEuNDNhNC40IDQuNCAwIDAgMS0yLjQ2LjY1Yy0yLjI1IDAtMy41MS0xLjI1LTMuNTEtMy44MyAwLTIuMjUgMS4wMS0zLjg4IDMuMTUtMy44OCAxLjc2IDAgMi45Ljk3IDIuOSAzLjU1di45M2gtNC4yNGMuMDcgMS4yNC41NiAxLjg0IDEuODQgMS44NC44NiAwIDEuNzctLjMyIDIuMzItLjY5em0tMS43MS0yLjZjMC0uOTItLjI3LTEuNjUtMS4xNC0xLjY1LS44NCAwLTEuMjcuNjItMS4zIDEuOGgyLjQ0ek0xNS4xMyA5LjY2YzAtMS44LS45Mi0yLjQ3LTIuNzctMi40N2E0LjUgNC41IDAgMCAwLTIuNjEuODd2MS41MmEzLjk0IDMuOTQgMCAwIDEgMi40LTFjLjg0IDAgMS4yMi4zIDEuMjIgMS4xdi40N2gtLjI4Yy0yLjY4IDAtMy44OC44Ny0zLjg4IDIuNDIgMCAxLjQzLjkyIDIuMjUgMi4yOCAyLjI1IDEuMDMgMCAxLjQ3LS4zMyAxLjgtLjY5aC4wOGMuMDIuMi4wOC40NC4xNC42aDEuN2MtLjA1LS42MS0uMDgtMS4yMi0uMDgtMS44MnptLTEuNzYgMy4zYy0uMjIuMzItLjYzLjU4LTEuMjUuNTgtLjc0IDAtMS4xLS40My0xLjEtMS4wNyAwLS44Ni42LTEuMTUgMi4xLTEuMTVoLjI1eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTE5Ljc5IDguNjZjLS42NCAwLTEuMTUuMzQtMS40OC43NHY1LjMyaC0xLjc1VjcuMzFoMS43bC4wNS42MWguMDljLjM1LS4zNS45Ny0uNzMgMi4wMi0uNzMgMS40MyAwIDIuMDIuNjUgMi4wMiAyLjEydjUuNDFoLTEuNzVWOS41YzAtLjU2LS4yOC0uODMtLjktLjgzek00Mi42IDE0LjcyaDEuOTdsLTIuNDItMy44MiAyLjEtMy42aC0xLjc2bC0xLjI3IDIuMjUtMS40MS0yLjI0aC0xLjk4bDIuMjQgMy41NS0yLjMzIDMuODZoMS43OWwxLjQ5LTIuNXoiLz48L2c+PC9zdmc+)}'));
    });
}
, function(ym) {
    ym.modules.define('copyright', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-copyright{position:relative;z-index:1;display:block;float:right;margin-right:3px;margin-left:10px}.ymaps-2-1-79-copyright_float_left{float:left}.ymaps-2-1-79-copyright_fog_yes{float:none}.ymaps-2-1-79-copyright_multiline .ymaps-2-1-79-copyright__content{white-space:normal}.ymaps-2-1-79-copyright__wrap{display:block;overflow:hidden}.ymaps-2-1-79-copyright__layout{position:relative;z-index:1;top:1px;display:table;float:right}.ymaps-2-1-79-copyright__content-cell,.ymaps-2-1-79-copyright__logo-cell{display:table-cell;vertical-align:top}.ymaps-2-1-79-copyright__logo-cell{padding-left:4px}.ymaps-2-1-79-copyright__content-cell{height:20px}.ymaps-2-1-79-copyright__content{display:inline-block;float:right;padding:0 4px 1px;white-space:nowrap;border-radius:3px;background-color:rgba(255,255,255,.75);font:11px/14px Verdana,Arial,sans-serif}.ymaps-2-1-79-copyright_fog_yes .ymaps-2-1-79-copyright__content{background-color:transparent}.ymaps-2-1-79-copyright_fog_yes .ymaps-2-1-79-copyright__wrap{margin-left:17px}.ymaps-2-1-79-copyright_fog_yes:after{position:absolute;z-index:-1;top:1px;right:50px;left:17px;height:15px;content:\'\';border-radius:0 3px 3px 0;background-color:rgba(255,255,255,.75)}.ymaps-2-1-79-copyright_logo_no.ymaps-2-1-79-copyright_fog_yes:after{right:0}.ymaps-2-1-79-copyright_logo_no .ymaps-2-1-79-copyright__logo-cell,.ymaps-2-1-79-copyright_providers_no .ymaps-2-1-79-copyright__text,.ymaps-2-1-79-copyright_ua_no .ymaps-2-1-79-copyright__agreement,.ymaps-2-1-79-copyright_ua_no.ymaps-2-1-79-copyright_providers_no .ymaps-2-1-79-copyright__content-cell{display:none}.ymaps-2-1-79-copyright__fog{position:absolute;z-index:2;top:1px;left:0;display:none;width:12px;height:15px;padding-left:5px;border-radius:3px 0 0 3px;background:rgba(255,255,255,.75);font:11px/14px Verdana,Arial,sans-serif}.ymaps-2-1-79-copyright_fog_yes .ymaps-2-1-79-copyright__fog{display:block}.ymaps-2-1-79-copyright__extend{margin-left:.4em}.ymaps-2-1-79-copyright__link{text-decoration:underline!important;color:#000!important}.ymaps-2-1-79-copyright__link:hover{color:#c00!important}'));
    });
}
, function(ym) {
    ym.modules.define('error-message', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-error-message{display:table;margin:10px 0;padding:0 10px 0 45px;height:25px;background-position:10px 50%;background-repeat:no-repeat;color:#000;font:13px/1.2 Arial,sans-serif}.ymaps-2-1-79-error-message__msg{display:table-cell;vertical-align:middle}.ymaps-2-1-79-error-message{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSI+PHBhdGggZmlsbD0iI0JFQkVCRSIgZD0iTTEyLjUgMjVhMTIuNSAxMi41IDAgMSAwIDAtMjUgMTIuNSAxMi41IDAgMCAwIDAgMjVzLTYuOSAwIDAgMHoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTIuNSAyMi4xMWE5LjUgOS41IDAgMSAwIDAtMTkgOS41IDkuNSAwIDAgMCAwIDE5YzAtLjAxLTUuMi0uMDEgMCAweiIvPjxlbGxpcHNlIGN4PSI4LjUiIGN5PSI5LjkiIGZpbGw9IiNCRUJFQkUiIHJ4PSIxLjUiIHJ5PSIxLjYiLz48ZWxsaXBzZSBjeD0iMTYuNSIgY3k9IjkuOSIgZmlsbD0iI0JFQkVCRSIgcng9IjEuNSIgcnk9IjEuNiIvPjxwYXRoIGZpbGw9IiNCRUJFQkUiIGQ9Ik0xMi41IDE0LjQ4YzMuMDQgMCA1LjUuNiA1LjUgMS40NCAwIC44LTIuNDYgMS40NC01LjUgMS40NFM3IDE2LjcyIDcgMTUuOTJjMC0uODIgMi41LTEuNDIgNS41LTEuNDR6Ii8+PC9zdmc+)}'));
    });
}
, function(ym) {
    ym.modules.define('float-button', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-float-button{background-color:#fff;border-color:transparent;box-shadow:0 1px 2px 1px rgba(0,0,0,.15),0 2px 5px -3px rgba(0,0,0,.15);box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:inline-block;text-align:left;height:28px}a.ymaps-2-1-79-float-button,a.ymaps-2-1-79-float-button:active,a.ymaps-2-1-79-float-button:hover,a.ymaps-2-1-79-float-button:link,a.ymaps-2-1-79-float-button:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-float-button-text{position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px}.ymaps-2-1-79-float-button.ymaps-2-1-79-_pressed,.ymaps-2-1-79-float-button:active{background-color:#f3f1ed}.ymaps-2-1-79-float-button.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-float-button.ymaps-2-1-79-_disabled .ymaps-2-1-79-float-button-text{opacity:.5}.ymaps-2-1-79-float-button.ymaps-2-1-79-_checked{background-color:#ffeba0}.ymaps-2-1-79-float-button.ymaps-2-1-79-_checked.ymaps-2-1-79-_pressed,.ymaps-2-1-79-float-button.ymaps-2-1-79-_checked:active{background-color:#fee481}.ymaps-2-1-79-float-button.ymaps-2-1-79-_checked.ymaps-2-1-79-_disabled{background-color:#d9d9d9!important}.ymaps-2-1-79-float-button{position:relative;padding-left:26px;overflow:hidden}.ymaps-2-1-79-float-button.ymaps-2-1-79-_hidden-icon{padding-left:0}.ymaps-2-1-79-float-button-icon{position:absolute;left:0}.ymaps-2-1-79-float-button-text{display:block;overflow:hidden;text-overflow:ellipsis;padding-left:12px;padding-right:12px}.ymaps-2-1-79-float-button-icon+.ymaps-2-1-79-float-button-text{padding-left:4px}.ymaps-2-1-79-float-button.ymaps-2-1-79-_hidden-icon .ymaps-2-1-79-float-button-icon,.ymaps-2-1-79-float-button.ymaps-2-1-79-_hidden-text .ymaps-2-1-79-float-button-text{display:none}.ymaps-2-1-79-float-button.ymaps-2-1-79-_hidden-icon .ymaps-2-1-79-float-button-text{padding-left:12px}.ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_left{border-top-right-radius:0!important;border-bottom-right-radius:0!important;position:relative;z-index:2}.ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_left.ymaps-2-1-79-_checked,.ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_right.ymaps-2-1-79-_checked{z-index:1}.ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_right{border-top-left-radius:0!important;border-bottom-left-radius:0!important;position:relative;z-index:2}.ymaps-2-1-79-float-button-icon{display:inline-block;width:16px;height:16px;border:5px solid transparent;background-repeat:no-repeat;background-position:center;vertical-align:top}.ymaps-2-1-79-_disabled .ymaps-2-1-79-float-button-icon{opacity:.5}.ymaps-2-1-79-float-button-icon_icon_geolocation{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjNjY2IiBkPSJNMTIuMjMgMTMuMjdsLTguNDgtMS40MkwxOS4zIDYuMiIvPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0xMi4yMyAxMy4yN2wxLjQyIDguNDhMMTkuMyA2LjIiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-float-button-icon_icon_ruler{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNiAxMWgxdjNINnpNOSAxMWgxdjNIOXpNMTIgMTFoMXYzaC0xek0xNSAxMWgxdjNoLTF6TTE4IDEyaDJ2MmgtMnoiLz48cGF0aCBkPSJNMyAxN2gyMHYtN0gzdjd6bTEtNnY1aDE4di01SDR6bTAgMCIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-float-button-icon_icon_fold{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzk5OSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTNsMS0xIDEgMSA1LjUgNSAxLjUtMS41LTctNi41LTEtMS0xIDEtNyA2LjVMNi41IDE4bDUuNS01em0wIDAiLz48L3N2Zz4=)}.ymaps-2-1-79-float-button-icon_icon_plus{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTEgMTVINnYtNGg1VjZoNHY1aDV2NGgtNXY1aC00di01em0wIDAiLz48L3N2Zz4=)}.ymaps-2-1-79-float-button-icon_icon_minus{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNiAxMWgxNHY0SDZ6Ii8+PC9zdmc+)}.ymaps-2-1-79-float-button-icon_icon_layers{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjMzMzIiBkPSJNMjAgMTQuNWwzIDEuNS0xMCA1LTEwLTUgMy0xLjUgMS41Ljc1TDYgMTZsNyAzLjUgNy0zLjUtMS41LS43NSAxLjUtLjc1em0wIDAiLz48cGF0aCBmaWxsPSIjNEM0QzRDIiBkPSJNMjAgMTEuNWwzIDEuNS0xMCA1LTEwLTUgMy0xLjUgMS41Ljc1TDYgMTNsNyAzLjUgNy0zLjUtMS41LS43NSAxLjUtLjc1em0wIDAiLz48cGF0aCBmaWxsPSIjNjY2IiBkPSJNMTMgMTVsMTAtNS0xMC01LTEwIDUgMTAgNXptMC0xLjVsNy0zLjUtNy0zLjVMNiAxMGw3IDMuNXptMCAwIi8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-float-button-icon_icon_expand{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0iIzZCNkI2QiI+PHBhdGggZD0iTTE2LjE0IDcuODZMMTQuMjcgNkgyMHY1LjdsLTEuODMtMS44MkwxNS4wNCAxMyAxMyAxMC45OGwzLjEzLTMuMTN6bTAgME05Ljg2IDE4LjE0TDExLjczIDIwSDZ2LTUuN2wxLjgzIDEuODJMMTAuOTYgMTMgMTMgMTUuMDJsLTMuMTMgMy4xM3ptMCAwIi8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-float-button-icon_icon_collapse{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0iIzZCNkI2QiI+PHBhdGggZD0iTTguMTQgMTUuODZMNi4yNyAxNEgxMnY1LjdsLTEuODMtMS44My0zLjEzIDMuMTRMNSAxOC45OGwzLjEzLTMuMTN6bTAgME0xNy44NiAxMC4xNEwxOS43MyAxMkgxNFY2LjNsMS44MyAxLjgzIDMuMTMtMy4xNEwyMSA3LjAybC0zLjEzIDMuMTN6bTAgMCIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-float-button-icon_icon_magnifier{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTQuOTEgMTUuNjJhNiA2IDAgMSAwLTguNDgtOC40OCA2IDYgMCAwIDAgOC40OCA4LjQ4em0tMS43Ni0xLjc3QTMuNSAzLjUgMCAxIDAgOC4yIDguOWEzLjUgMy41IDAgMCAwIDQuOTUgNC45NXptMCAwIi8+PHBhdGggZD0iTTEzLjE1IDE1Ljk3bDIuMTItMi4xMiA0Ljk1IDQuOTUtMi4xMiAyLjEyeiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-float-button-icon_icon_routes{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0iIzZCNkI2QiI+PHBhdGggZD0iTTEwIDE0aDQuNWEzLjUgMy41IDAgMCAwIDAtN0gxMHYyaDQuNWExLjUgMS41IDAgMSAxIDAgM0gxMHYyem0wIDAiLz48cGF0aCBkPSJNMTUgMTJoLTQuNWEzLjUgMy41IDAgMCAwIDAgN0gxNXYtMmgtNC41YTEuNSAxLjUgMCAxIDEgMC0zSDE1di0yem0wIDBNMTkgMjBhMiAyIDAgMSAwIDAtNCAyIDIgMCAwIDAgMCA0em0wLTFhMSAxIDAgMSAwIDAtMiAxIDEgMCAwIDAgMCAyem0wIDBNOSAxMGEyIDIgMCAxIDAgMC00IDIgMiAwIDAgMCAwIDR6bTAtMWExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6bTAgMCIvPjxwYXRoIGQ9Ik0xMy41NyAyMC44bDIuODMtMi44Mi0uNzEtLjctMi44MyAyLjgyLjcuN3ptMS40MS0yLjgybC43LS43LTIuMTEtMi4xMy0uNy43IDIuMTEgMi4xM3ptMCAwIi8+PC9nPjwvc3ZnPg==)}'));
    });
}
, function(ym) {
    ym.modules.define('hint', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-hint{position:absolute;padding:1px;-webkit-box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 5px 15px -7px rgba(0,0,0,.5);-moz-box-shadow:inset 1px 1px 10px #aaa;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 5px 15px -7px rgba(0,0,0,.5)}.ymaps-2-1-79-hint__text{display:block;padding:2px 5px;vertical-align:top;background:#fff;font:11px/15px Verdana,Arial,sans-serif;white-space:nowrap}.ymaps-2-1-79-hint_to_bottom .ymaps-2-1-79-hint__text,.ymaps-2-1-79-hint_to_top .ymaps-2-1-79-hint__text{position:relative;z-index:10}.ymaps-2-1-79-hint__tail{position:absolute;z-index:9;display:block;width:13px;height:13px;background:rgba(0,0,0,.15);font:0/0 a}.ymaps-2-1-79-hint__tail:after{position:absolute;width:13px;height:13px;content:\'\';background-color:#fff}.ymaps-2-1-79-hint_to_top .ymaps-2-1-79-hint__tail{top:100%;margin-left:17px;-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg);-webkit-transform-origin:top left;-moz-transform-origin:top left;-ms-transform-origin:top left;-o-transform-origin:top left;transform-origin:top left;background:-webkit-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:-moz-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:-o-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);-webkit-box-shadow:inset 0 0 1px -2px rgba(0,0,0,.15),3px -3px 13px 1px rgba(0,0,0,.2);-moz-box-shadow:inset 1px 1px 10px #aaa;box-shadow:inset 0 0 1px -2px rgba(0,0,0,.15),3px -3px 13px 1px rgba(0,0,0,.2)}.ymaps-2-1-79-hint_to_bottom .ymaps-2-1-79-hint__tail:after,.ymaps-2-1-79-hint_to_top .ymaps-2-1-79-hint__tail:after{bottom:1px;left:1px}.ymaps-2-1-79-hint_to_bottom .ymaps-2-1-79-hint__tail{bottom:100%;margin-left:4px;-webkit-transform:rotate(135deg);-moz-transform:rotate(135deg);-ms-transform:rotate(135deg);-o-transform:rotate(135deg);transform:rotate(135deg);-webkit-transform-origin:100% 100%;-moz-transform-origin:100% 100%;-ms-transform-origin:100% 100%;-o-transform-origin:100% 100%;transform-origin:100% 100%}.ymaps-2-1-79-hint__x{display:inline-block;width:20px;height:20px;margin:-2px -5px -2px 0;cursor:pointer;vertical-align:bottom;opacity:.2;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZD0iTTYgMGE2IDYgMCAxIDAgMCAxMkE2IDYgMCAwIDAgNiAwem0zLjUzIDguMjdMOC4yNyA5LjUzIDYgNy4yNiAzLjczIDkuNTMgMi40NyA4LjI3IDQuNzQgNiAyLjQ3IDMuNzNsMS4yNi0xLjI2TDYgNC43NGwyLjI3LTIuMjcgMS4yNiAxLjI2TDcuMjYgNmwyLjI3IDIuMjd6Ii8+PC9zdmc+) no-repeat 50% 50%}.ymaps-2-1-79-hint__x:hover{opacity:1}'));
    });
}
, function(ym) {
    ym.modules.define('i-custom-scroll', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-i-custom-scroll ::-webkit-scrollbar,.ymaps-2-1-79-i-custom-scroll::-webkit-scrollbar{width:17px;height:17px}.ymaps-2-1-79-i-custom-scroll ::-webkit-scrollbar-thumb,.ymaps-2-1-79-i-custom-scroll::-webkit-scrollbar-thumb{min-height:34px;min-width:34px;background-color:rgba(170,170,170,.5);background-clip:content-box;border:5px solid transparent}.ymaps-2-1-79-i-custom-scroll ::-webkit-scrollbar-thumb:hover,.ymaps-2-1-79-i-custom-scroll::-webkit-scrollbar-thumb:hover{background-color:rgba(170,170,170,.8)}.ymaps-2-1-79-i-custom-scroll ::-webkit-scrollbar-thumb:horizontal,.ymaps-2-1-79-i-custom-scroll::-webkit-scrollbar-thumb:horizontal{border-left-width:0;border-right-width:0}.ymaps-2-1-79-i-custom-scroll ::-webkit-scrollbar-thumb:vertical,.ymaps-2-1-79-i-custom-scroll::-webkit-scrollbar-thumb:vertical{border-top-width:0;border-bottom-width:0}'));
    });
}
, function(ym) {
    ym.modules.define('listbox', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-listbox__button{background-color:#fff;border-color:transparent;box-shadow:0 1px 2px 1px rgba(0,0,0,.15),0 2px 5px -3px rgba(0,0,0,.15)}.ymaps-2-1-79-listbox{position:relative;display:inline-block;height:28px;vertical-align:top;line-height:0}.ymaps-2-1-79-listbox__button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:inline-block;text-align:left;height:28px;white-space:nowrap}a.ymaps-2-1-79-listbox__button,a.ymaps-2-1-79-listbox__button:active,a.ymaps-2-1-79-listbox__button:hover,a.ymaps-2-1-79-listbox__button:link,a.ymaps-2-1-79-listbox__button:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-listbox__button-text{display:inline-block;position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px}.ymaps-2-1-79-listbox__button.ymaps-2-1-79-_pressed,.ymaps-2-1-79-listbox__button:active{background-color:#f3f1ed}.ymaps-2-1-79-listbox__button.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-_disabled .ymaps-2-1-79-listbox__button-icon,.ymaps-2-1-79-listbox__button.ymaps-2-1-79-_disabled .ymaps-2-1-79-listbox__button-text{opacity:.5}.ymaps-2-1-79-listbox__button-icon{display:inline-block;width:16px;height:16px;border:5px solid transparent;background-repeat:no-repeat;background-position:center;vertical-align:top}.ymaps-2-1-79-listbox__button-icon.ymaps-2-1-79-_icon_layers{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjMzMzIiBkPSJNMjAgMTQuNWwzIDEuNS0xMCA1LTEwLTUgMy0xLjUgMS41Ljc1TDYgMTZsNyAzLjUgNy0zLjUtMS41LS43NSAxLjUtLjc1em0wIDAiLz48cGF0aCBmaWxsPSIjNEM0QzRDIiBkPSJNMjAgMTEuNWwzIDEuNS0xMCA1LTEwLTUgMy0xLjUgMS41Ljc1TDYgMTNsNyAzLjUgNy0zLjUtMS41LS43NSAxLjUtLjc1em0wIDAiLz48cGF0aCBmaWxsPSIjNjY2IiBkPSJNMTMgMTVsMTAtNS0xMC01LTEwIDUgMTAgNXptMC0xLjVsNy0zLjUtNy0zLjVMNiAxMGw3IDMuNXptMCAwIi8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-listbox__button.ymaps-2-1-79-_hidden-icon .ymaps-2-1-79-listbox__button-icon,.ymaps-2-1-79-listbox__button.ymaps-2-1-79-_hidden-text .ymaps-2-1-79-listbox__button-text{display:none}.ymaps-2-1-79-listbox__button-text{padding:0 12px 0 4px}.ymaps-2-1-79-_hidden-icon .ymaps-2-1-79-listbox__button-text{padding-left:12px}.ymaps-2-1-79-_visible-arrow .ymaps-2-1-79-listbox__button-text{padding-right:23px}.ymaps-2-1-79-listbox__button-arrow{display:none;width:29px;height:28px;position:absolute;right:0;top:0;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMSIgaGVpZ2h0PSI2Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4zMSAwTDUuNSA0LjY3LjY5IDAgMCAuNjcgNS41IDYgMTEgLjY3eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+) center no-repeat;-webkit-transition:-webkit-transform .15s ease-out;transition:transform .15s ease-out;transition:transform .15s ease-out,-webkit-transform .15s ease-out}.ymaps-2-1-79-_visible-arrow .ymaps-2-1-79-listbox__button-arrow{display:inline-block}.ymaps-2-1-79-listbox_opened_yes .ymaps-2-1-79-listbox__button-arrow{-webkit-transform:rotate(-180deg);transform:rotate(-180deg)}.ymaps-2-1-79-listbox__panel{position:relative;z-index:1000;display:block;float:left;margin-top:7px;padding:3px 0;background:#fff;border:1px solid #e5e5e5;box-shadow:0 10px 20px -5px rgba(0,0,0,.2)!important}.ymaps-2-1-79-listbox_align_right .ymaps-2-1-79-listbox__panel{float:right}.ymaps-2-1-79-listbox_opened_no .ymaps-2-1-79-listbox__panel{margin-top:-9999px;box-shadow:none}.ymaps-2-1-79-listbox__panel_animation_hide{-webkit-animation:listbox__panel-hide .25s ease 0 1;animation:listbox__panel-hide .25s ease 0 1}.ymaps-2-1-79-listbox__panel_animation_show{-webkit-animation:listbox__panel-show .25s ease 0 1 forwards;animation:listbox__panel-show .25s ease 0 1 forwards}.ymaps-2-1-79-hide-scroll ::-webkit-scrollbar,.ymaps-2-1-79-hide-scroll::-webkit-scrollbar{width:0}@-webkit-keyframes listbox__panel-show{0%{opacity:0}to{opacity:1}}@keyframes listbox__panel-show{0%{opacity:0}to{opacity:1}}@-webkit-keyframes listbox__panel-hide{0%{opacity:1;margin-top:0}to{opacity:0;margin-top:0}}@keyframes listbox__panel-hide{0%{opacity:1;margin-top:0}to{opacity:0;margin-top:0}}.ymaps-2-1-79-listbox__list{display:block;overflow:auto;overflow-x:hidden;font-family:Arial,sans-serif}.ymaps-2-1-79-listbox__list_scrollable_yes{overflow-y:scroll;-webkit-overflow-scrolling:touch}.ymaps-2-1-79-listbox__list-separator{display:block;font:0/0 a;width:100%;height:1px;background-color:#e5e5e5;border-top:4px solid #fff;border-bottom:4px solid #fff}.ymaps-2-1-79-listbox__list-item{display:block;white-space:nowrap;cursor:pointer;overflow:hidden}.ymaps-2-1-79-listbox__list-item_disabled_yes{color:#999;cursor:default}.ymaps-2-1-79-listbox__list-item-text{box-sizing:border-box!important;overflow:hidden;padding-right:13px;padding-left:30px;max-width:250px;text-overflow:ellipsis;font-size:13px;line-height:28px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:relative}.ymaps-2-1-79-listbox__list-item:hover{background-color:#ffeba0}.ymaps-2-1-79-listbox__list-item_disabled_yes:hover{background-color:transparent}.ymaps-2-1-79-listbox__list-item_selected_yes .ymaps-2-1-79-listbox__list-item-text:before{content:\'\';position:absolute;top:0;left:0;bottom:0;width:38px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNiI+PHBhdGggZD0iTTEzLjUxLjQ1TDUuNDcgMTIuNDhsLTMuNzYtNC4yTC42NyA5LjYxbDQuOTMgNS40NUwxNC43MiAxLjZ6Ii8+PC9zdmc+) 50% 50% no-repeat}.ymaps-2-1-79-listbox__list-item_selected_yes.ymaps-2-1-79-listbox__list-item_disabled_yes .ymaps-2-1-79-listbox__list-item-text:before{opacity:.6}'));
    });
}
, function(ym) {
    ym.modules.define('map-copyrights-promo', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-map-copyrights-promo{position:absolute;bottom:0;left:0;height:32px}@media print{.ymaps-2-1-79-map-copyrights-promo{visibility:hidden}}'));
    });
}
, function(ym) {
    ym.modules.define('map-css', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-map{position:relative;z-index:0;display:block;margin:0!important;padding:0!important;text-align:left!important;text-decoration:none!important;color:#000;font-weight:400!important;font-style:normal!important;line-height:normal;-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-print-color-adjust:exact;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.ymaps-2-1-79-map-bg{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEX6+vrn5+f09PSMzk0VAAAAGklEQVQY02MIYAADVoYECIOTYSQDWCDAgwUA204BfdYq8A4AAAAASUVORK5CYII=);background-size:16px 16px}.ymaps-2-1-79-map-bg-theme-dark{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAY0lEQVRYR+3XIQ6AQAxE0VYga1ANCXI9978KnqAwlSuA7iG25o+pnMlzVXd/5c9inmdaetyjS3NARMi6tWnlWfRcp5iZ6N6OIVAVBiCAAAIIIIAAAggggAACCNQLlD+n1e/5B7xOP5l7rSdsAAAAAElFTkSuQmCC);background-size:16px 16px}.ymaps-2-1-79-map ymaps,.ymaps-2-1-79-map ymaps:after,.ymaps-2-1-79-map ymaps:before{box-sizing:content-box}.ymaps-2-1-79-map iframe{position:static;opacity:1;margin:0;outline:0;box-shadow:none;border:0;border-radius:0;background:0 0;padding:0;max-width:unset;max-height:unset;min-width:unset;min-height:unset;vertical-align:top;user-select:none;-ms-user-select:none;-moz-user-select:none;-webkit-user-select:none}a .ymaps-2-1-79-map{text-decoration:none!important;color:#000;font-style:normal!important}.ymaps-2-1-79-fullscreen{overflow:hidden!important}.ymaps-2-1-79-touch-action-none{touch-action:none}.ymaps-2-1-79-user-selection-none,.ymaps-2-1-79-user-selection-none *{-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ymaps-2-1-79-display-none{display:none!important}.ymaps-2-1-79-visibility-hidden{visibility:hidden!important}ymaps,ymaps canvas,ymaps input,ymaps svg{max-width:none;max-height:none}.ymaps-2-1-79-graphics-SVG svg{all:unset;overflow:hidden}.ymaps-2-1-79-ground-pane{will-change:transform}.ymaps-2-1-79-areas-pane,.ymaps-2-1-79-balloon-pane,.ymaps-2-1-79-controls-pane,.ymaps-2-1-79-controls__bottom,.ymaps-2-1-79-controls__toolbar,.ymaps-2-1-79-events-pane,.ymaps-2-1-79-ground-pane,.ymaps-2-1-79-panel-pane,.ymaps-2-1-79-places-pane,.ymaps-2-1-79-ruler-balloon-pane,.ymaps-2-1-79-ruler-line-pane,.ymaps-2-1-79-searchpanel-pane{left:0}.ymaps-2-1-79-controls-pane *,.ymaps-2-1-79-searchpanel-pane *{text-align:left}@media print{.ymaps-2-1-79-patched-for-print{background:0 0!important;display:list-item!important;list-style-position:inside!important}}.ymaps-2-1-79-patched-for-print-preload .ymaps-2-1-79-patched-for-print{background:0 0!important;display:list-item!important;list-style-position:inside!important}.ymaps-2-1-79-svg-icon-content{letter-spacing:-.5px;margin-left:-.5px}'));
    });
}
, function(ym) {
    ym.modules.define('map-pane-manager', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-inner-panes,.ymaps-2-1-79-outer-panes{display:block;position:absolute;padding:0!important;margin:0!important}.ymaps-2-1-79-inner-panes{overflow:hidden;width:100%;height:100%}.ymaps-2-1-79-outer-panes{width:0;height:0}'));
    });
}
, function(ym) {
    ym.modules.define('not-found-tile', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-tile-not-found{text-align:center;display:block;font-family:Arial,serif;font-size:10px;white-space:nowrap;position:absolute;top:40%;width:90%;left:10%;overflow:hidden}'));
    });
}
, function(ym) {
    ym.modules.define('pane-controls-css', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('@media print{.ymaps-2-1-79-controls-pane{visibility:hidden}}'));
    });
}
, function(ym) {
    ym.modules.define('placemark_theme', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-placemark_theme_black,.ymaps-2-1-79-placemark_theme_black .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_black .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzU5NTk1OSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzU5NTk1OSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjNTk1OTU5IiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_black .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiM1OTU5NTkiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9zdmc+)}.ymaps-2-1-79-placemark_theme_blue,.ymaps-2-1-79-placemark_theme_blue .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_blue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzFlOThmZiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzFlOThmZiIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMWU5OGZmIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_blue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiMxZTk4ZmYiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9zdmc+)}.ymaps-2-1-79-placemark_theme_brown,.ymaps-2-1-79-placemark_theme_brown .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_brown .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzc5M2QwZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzc5M2QwZSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjNzkzZDBlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_brown .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzc5M2QwZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiM3OTNkMGUiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjNzkzZDBlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_red,.ymaps-2-1-79-placemark_theme_red .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_red .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2VkNDU0MyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2VkNDU0MyIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZWQ0NTQzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_red .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2VkNDU0MyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNlZDQ1NDMiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZWQ0NTQzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkblue,.ymaps-2-1-79-placemark_theme_darkblue .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_darkblue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzE3N2JjOSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzE3N2JjOSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMTc3YmM5IiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkblue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzE3N2JjOSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiMxNzdiYzkiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMTc3YmM5IiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkorange,.ymaps-2-1-79-placemark_theme_darkorange .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_darkorange .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2U2NzYxYiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2U2NzYxYiIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZTY3NjFiIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkorange .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2U2NzYxYiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNlNjc2MWIiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZTY3NjFiIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_night,.ymaps-2-1-79-placemark_theme_night .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_night .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzBlNDc3OSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzBlNDc3OSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMGU0Nzc5IiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_night .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzBlNDc3OSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiMwZTQ3NzkiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMGU0Nzc5IiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_pink,.ymaps-2-1-79-placemark_theme_pink .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_pink .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2YzNzFkMSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2YzNzFkMSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZjM3MWQxIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_pink .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2YzNzFkMSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNmMzcxZDEiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZjM3MWQxIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_gray,.ymaps-2-1-79-placemark_theme_gray .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_theme_grey,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_gray .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2IzYjNiMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2IzYjNiMyIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjNiM2IzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_gray .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2IzYjNiMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNiM2IzYjMiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjNiM2IzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_grey .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_grey .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2IzYjNiMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2IzYjNiMyIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjNiM2IzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_grey .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2IzYjNiMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNiM2IzYjMiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjNiM2IzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkgreen,.ymaps-2-1-79-placemark_theme_darkgreen .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_darkgreen .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzFiYWQwMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzFiYWQwMyIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMWJhZDAzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_darkgreen .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzFiYWQwMyIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiMxYmFkMDMiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjMWJhZDAzIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_violet,.ymaps-2-1-79-placemark_theme_violet .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_violet .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2I1MWVmZiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2I1MWVmZiIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjUxZWZmIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_violet .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2I1MWVmZiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNiNTFlZmYiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjYjUxZWZmIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_yellow,.ymaps-2-1-79-placemark_theme_yellow .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_yellow .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2ZmZDIxZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2ZmZDIxZSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZmZkMjFlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_yellow .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2ZmZDIxZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNmZmQyMWUiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZmZkMjFlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_green,.ymaps-2-1-79-placemark_theme_green .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_green .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzU2ZGI0MCIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzU2ZGI0MCIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjNTZkYjQwIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_green .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzU2ZGI0MCIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiM1NmRiNDAiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjNTZkYjQwIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_orange,.ymaps-2-1-79-placemark_theme_orange .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_orange .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2ZmOTMxZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iI2ZmOTMxZSIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZmY5MzFlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_orange .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iI2ZmOTMxZSIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiNmZjkzMWUiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjZmY5MzFlIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_lightblue,.ymaps-2-1-79-placemark_theme_lightblue .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_lightblue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzgyY2RmZiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzgyY2RmZiIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjODJjZGZmIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_lightblue .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzgyY2RmZiIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiM4MmNkZmYiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjODJjZGZmIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_olive,.ymaps-2-1-79-placemark_theme_olive .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_theme_olive .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzk3YTEwMCIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItMzQwIiB4Mj0iLTMzOS4xIiB5MT0iMzkxLjkiIHkyPSIzOTIuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMjEuMjE2MSAwIDAgLTIxLjc4NzkgNzI2Mi4wNCA4NTc1LjExKSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik00OC43MiAzOS43YzQuNzEtMi40IDE3LjgyLTExLjUyIDE4LjMtMTEuOTguNTYtLjUyIDEuMDctMS4wNiAxLjUtMS42MiAzLTQgMS4xMS03LjYyLTQuNDQtOC4wMy0uNDctLjAzLTEuMDYtLjEtMS42OC0uMTYtLjk2IDMuNDMtMy4yMiA3LjYtNi40MyAxMi4zM2ExMTQuMTIgMTE0LjEyIDAgMCAxLTYuMTQgOC4ybC0uNTQuNjdjLS4xMi4xNS0uMjcuMzItLjQ3LjUtLjAzLS4wMS0uMDItLjAxLS4xMi4wNmguMDJ6IiBvcGFjaXR5PSIuNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zNiAxMy41QzM2IDYgNDIgMCA0OS41IDBhMTMuNDQgMTMuNDQgMCAwIDEgMTMuMyAxNS44MmwuMDIuMTYtLjA0LjIzYy0uNiAzLjctMy4wNiA4LjQ3LTYuOCAxNGExMTguMzQgMTE4LjM0IDAgMCAxLTYuMTQgOC4yMmMtLjI1LjMtLjQ0LjUyLS41NS43YTMuNTkgMy41OSAwIDAgMS0xLjIuOTdjLS40LjItLjg2LjI3LTEuNC4ybC0uMjEtLjA0YTIuMjkgMi4yOSAwIDAgMS0xLjY2LTEuNjggMi40IDIuNCAwIDAgMSAwLTEuMTljMC0uMDcuMDItLjEzLjA0LS4xOWwyLjc3LTEwLjI2QTEzLjYxIDEzLjYxIDAgMCAxIDM2IDEzLjV6Ii8+PHBhdGggZmlsbD0iIzk3YTEwMCIgZD0iTTM4IDEzLjVDMzggNy4xIDQzLjEgMiA0OS41IDJhMTEuNDQgMTEuNDQgMCAwIDEgMTEuMjggMTMuN3YuMTVDNTkuNSAyMy44NSA0Ny43IDM3LjggNDcuNyAzNy44cy0uMzguNTItLjczLjRjLS4zNy0uMS0uMi0uNTYtLjItLjU2bDMuNDItMTIuNzFjLS4yMS4wNy0uNDkuMDctLjY5LjA3QzQzLjE1IDI1IDM4IDE5LjkgMzggMTMuNXoiLz48Y2lyY2xlIGN4PSI0OS41IiBjeT0iMTMuNSIgcj0iOC41IiBmaWxsPSIjZmZmIi8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjOTdhMTAwIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-placemark_theme_olive .ymaps-2-1-79-placemark__r{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAwIj48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNMCAxMy41QzAgNiA2IDAgMTMuNSAwUzI3IDYgMjcgMTMuNSAyMC45NiAyNyAxMy41IDI3IDAgMjEgMCAxMy41em0yMiAwYTguNSA4LjUgMCAxIDAtMTYuOTktLjAxQTguNSA4LjUgMCAwIDAgMjIgMTMuNXoiLz48Y2lyY2xlIGN4PSIxMy41IiBjeT0iMTMuNSIgcj0iMTEuNSIgZmlsbD0iIzk3YTEwMCIvPjxjaXJjbGUgY3g9IjEzLjUiIGN5PSIxMy41IiByPSI4LjUiIGZpbGw9IiNmZmYiLz48Zz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSItNjA4LjQiIHgyPSItNjA3LjQiIHkxPSIzNTQuMSIgeTI9IjM1NC45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgyMS4yMTYxIDAgMCAtMjEuNzg3OSAxMjk5MS4xNiA3NzUyLjY0KSI+PHN0b3Agb2Zmc2V0PSIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik04NC43MiAzOS43YzQuNy0yLjQgMTcuODItMTEuNTIgMTguMy0xMS45OGExMy44IDEzLjggMCAwIDAgMS41LTEuNjJjMy00IDEuMTEtNy42Mi00LjQ0LTguMDMtLjQ3LS4wMy0xLjA2LS4xLTEuNjgtLjE2LS45NiAzLjQzLTMuMjIgNy42LTYuNDMgMTIuMzNhMTE2Ljc5IDExNi43OSAwIDAgMS02LjE0IDguMmwtLjU1LjY3Yy0uMTEuMTUtLjI3LjMyLS40Ni41LS4wMy0uMDEtLjAyLS4wMS0uMTIuMDZoLjAyeiIgb3BhY2l0eT0iLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii44IiBkPSJNODAgMjV2MmgzLjZsLTIuNzQgMTAuMTNhMi41MyAyLjUzIDAgMCAwLS4wNSAxLjM4Yy4yLjguOCAxLjUgMS43IDEuNjhoLjJjLjU0LjEgMSAwIDEuNC0uMTdhMy40IDMuNCAwIDAgMCAxLjE5LS45OGwuNTUtLjY1Yy40Ni0uNTcuOTgtMS4yIDEuNTItMS45IDEuNTctMi4wMiAzLjE1LTQuMTUgNC42Mi02LjMyIDMuNzUtNS41MiA2LjIxLTEwLjMgNi44LTE0bC4wNC0uMjMtLjAzLS4xMkExMy40NCAxMy40NCAwIDAgMCA4NS41IDBIODB2MiIvPjxwYXRoIGZpbGw9IiM5N2ExMDAiIGQ9Ik04MCAyMnYzaDUuNWMuMjQgMCAuNDggMCAuNzEtLjAybC0zLjQzIDEyLjdzLS4xNi41LjIuNmMuMzUuMS43My0uNC43My0uNFM5NS41MSAyMy45IDk2LjggMTUuODlsLS4wMi0uMTVBMTEuNDQgMTEuNDQgMCAwIDAgODUuNSAySDgwdjMiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNODUuNSA1SDgwdjE3aDUuNWE4LjUgOC41IDAgMCAwIDAtMTd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0wIDYwaDEyMHYySDB6TTAgODVoMTIwdjJIMHoiLz48cGF0aCBmaWxsPSIjOTdhMTAwIiBkPSJNMCA2MmgxMjB2M0gwek0wIDgyaDEyMHYzSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNjVoMTIwdjE3SDB6Ii8+PC9nPjwvc3ZnPg==)}'));
    });
}
, function(ym) {
    ym.modules.define('placemark_type_blank', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-placemark_type_blank{width:28px;background-position:0 0;background-repeat:no-repeat}.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_state_active{background-image:none;width:0}.ymaps-2-1-79-placemark_type_blank .ymaps-2-1-79-placemark__content{position:absolute;top:0;z-index:6;margin:0!important;width:27px;background:0 0}.ymaps-2-1-79-placemark_type_blank.ymaps-2-1-79-placemark_state_active .ymaps-2-1-79-placemark__content{left:-8px}.ymaps-2-1-79-placemark_type_blank .ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark_type_blank .ymaps-2-1-79-placemark__r{display:none}.ymaps-2-1-79-placemark_state_active.ymaps-2-1-79-placemark_type_blank .ymaps-2-1-79-placemark__r{display:block;background-position:-36px 0!important;right:-28px;width:36px}'));
    });
}
, function(ym) {
    ym.modules.define('placemark', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-placemark{position:absolute;z-index:1;right:2px;bottom:12px;height:28px;background-repeat:repeat-x;background-position:0 -60px;background-size:auto!important}.ymaps-2-1-79-placemark__content{position:relative;z-index:5;display:block;width:auto;height:27px;margin:0 -3px;text-align:center;white-space:nowrap;color:#000;font:13px Arial,sans-serif}.ymaps-2-1-79-placemark__content-inner{display:block;overflow:hidden;margin-top:6px;margin-left:5px;margin-right:5px;height:15px}.ymaps-2-1-79-placemark__content-inner>*{display:block}.ymaps-2-1-79-placemark_state_active .ymaps-2-1-79-placemark__content{margin-right:-9px}.ymaps-2-1-79-placemark__l{width:13px}.ymaps-2-1-79-placemark__l,.ymaps-2-1-79-placemark__r{position:absolute;z-index:4;display:block;height:27px}.ymaps-2-1-79-placemark__l{left:-13px;background-position:0 0}.ymaps-2-1-79-placemark__r{right:-14px;width:14px;background-position:-14px 0}.ymaps-2-1-79-placemark_state_active .ymaps-2-1-79-placemark__r{right:-26px;width:26px;height:41px;background-position:-80px 0}'));
    });
}
, function(ym) {
    ym.modules.define('poi-balloon-content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-poi-balloon-content{display:block;min-width:252px;text-align:left;font:13px Arial,sans-serif}.ymaps-2-1-79-poi-balloon-content__description,.ymaps-2-1-79-poi-balloon-content__footer,.ymaps-2-1-79-poi-balloon-content__rubrics,.ymaps-2-1-79-poi-balloon-content__title{display:block}.ymaps-2-1-79-poi-balloon-content__title{margin-bottom:.2em;font-size:16px}.ymaps-2-1-79-poi-balloon-content__description{margin:4px 0;line-height:21px}.ymaps-2-1-79-poi-balloon-content__rubrics{margin-top:5px}.ymaps-2-1-79-poi-balloon-content__rubric-item{display:inline-block;margin-right:.5em;color:#999;font-size:13px}.ymaps-2-1-79-poi-balloon-content__footer{margin-top:5px}.ymaps-2-1-79-poi-balloon-content .ymaps-2-1-79-b-link{color:#69f;font:12px Veradana,sans-serif}'));
    });
}
, function(ym) {
    ym.modules.define('popup__close', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__close{font:0/0 a;position:absolute;z-index:12;top:5px;right:5px;width:16px;height:16px;opacity:.2;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ymaps-2-1-79-popup__close:hover{opacity:1}.ymaps-2-1-79-i-ua_inlinesvg_yes .ymaps-2-1-79-popup__close{background:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTgsMS4yMDljLTMuNzUxLDAtNi43OTEsMy4wNC02Ljc5MSw2Ljc5MWMwLDMuNzQ5LDMuMDQsNi43ODksNi43OTEsNi43ODkNCgkJCWMzLjc0OSwwLDYuNzg5LTMuMDQsNi43ODktNi43ODlDMTQuNzg5LDQuMjQ5LDExLjc0OSwxLjIwOSw4LDEuMjA5eiBNMTEuOTksMTAuNTY0bC0xLjQyNiwxLjQyNkw4LDkuNDI2TDUuNDM2LDExLjk5TDQuMDEsMTAuNTY0DQoJCQlMNi41NzQsOEw0LjAxLDUuNDM2TDUuNDM2LDQuMDFMOCw2LjU3NGwyLjU2NC0yLjU2NGwxLjQyNiwxLjQyNkw5LjQyNiw4TDExLjk5LDEwLjU2NHoiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==) no-repeat}.ymaps-2-1-79-i-ua_inlinesvg_no .ymaps-2-1-79-popup__close,.ymaps-2-1-79-i-ua_svg_no .ymaps-2-1-79-popup__close{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAJiS0dEAACqjSMyAAAACXBIWXMAAABIAAAASABGyWs+AAAAwUlEQVQoz5XRTU4CQRCG4Qe4hiESCOHvFAyazJLLmXgKLyALFxhM3MBOYlgRgYmeoVwMhh7UGKs23VVfut6vmj+ilpwyUy1s3JmdCzsWIslH7bTd9VFph/Cuc3r8WXiROwjhILcWnr4AciFkGNrbG2IihOtScCuEnR4G+ujZCeGmFMyOUwsjMFIcK/fUK17KWyMxr45XUMisDPQtjRVgnUJOKpBXKWTN/EebD6dBTW/fFrV1keJdnq16rvnPz/o1PgGVh2KumxnYfQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMy0wMy0yMlQyMzowODozNyswNDowMDjyhy8AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTMtMDMtMjJUMjI6NTc6NDUrMDQ6MDCJPwnpAAAAbHRFWHRzdmc6YmFzZS11cmkAZmlsZTovLy9ob21lL2NvcnBpeC9EZXYvcHJvamVjdHMveXQvaXNsYW5kcy1wb3B1cHMvY29tbW9uLmJsb2Nrcy9wb3B1cC9fX2Nsb3NlL3BvcHVwX19jbG9zZS5zdmcMC8r6AAAAAElFTkSuQmCC) no-repeat}'));
    });
}
, function(ym) {
    ym.modules.define('popup__content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__content{position:relative;z-index:10;margin:0;padding:4px 8px;height:100%}'));
    });
}
, function(ym) {
    ym.modules.define('popup__tail', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__tail{font:0/0 a;position:absolute;z-index:9;display:block;width:17px;height:17px}.ymaps-2-1-79-popup__tail:after{content:\'\';position:absolute;width:17px;height:17px}.ymaps-2-1-79-popup_to_left .ymaps-2-1-79-popup__tail,.ymaps-2-1-79-popup_to_top .ymaps-2-1-79-popup__tail{-webkit-transform-origin:top left;-moz-transform-origin:top left;-ms-transform-origin:top left;-o-transform-origin:top left;transform-origin:top left}.ymaps-2-1-79-popup_to_top .ymaps-2-1-79-popup__tail{top:100%;-webkit-transform:rotate(-45deg);-moz-transform:rotate(-45deg);-ms-transform:rotate(-45deg);-o-transform:rotate(-45deg);transform:rotate(-45deg)}.ymaps-2-1-79-popup_to_left .ymaps-2-1-79-popup__tail{-webkit-transform:rotate(-135deg);-moz-transform:rotate(-135deg);-ms-transform:rotate(-135deg);-o-transform:rotate(-135deg);transform:rotate(-135deg);margin-top:24.04px;left:100%}.ymaps-2-1-79-popup_to_bottom .ymaps-2-1-79-popup__tail:after,.ymaps-2-1-79-popup_to_left .ymaps-2-1-79-popup__tail:after,.ymaps-2-1-79-popup_to_right .ymaps-2-1-79-popup__tail:after,.ymaps-2-1-79-popup_to_top .ymaps-2-1-79-popup__tail:after{left:1px;bottom:1px}.ymaps-2-1-79-popup_to_bottom .ymaps-2-1-79-popup__tail,.ymaps-2-1-79-popup_to_right .ymaps-2-1-79-popup__tail{-webkit-transform-origin:100% 100%;-moz-transform-origin:100% 100%;-ms-transform-origin:100% 100%;-o-transform-origin:100% 100%;transform-origin:100% 100%}.ymaps-2-1-79-popup_to_bottom .ymaps-2-1-79-popup__tail{margin-left:-17px;bottom:100%;-webkit-transform:rotate(135deg);-moz-transform:rotate(135deg);-ms-transform:rotate(135deg);-o-transform:rotate(135deg);transform:rotate(135deg)}.ymaps-2-1-79-popup_to_right .ymaps-2-1-79-popup__tail{-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg);margin-top:7.04px;right:100%}'));
    });
}
, function(ym) {
    ym.modules.define('popup__under_color_white', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__under_color_white{background:#fff;opacity:.8}'));
    });
}
, function(ym) {
    ym.modules.define('popup__under_type_paranja', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__under_type_paranja{position:fixed;z-index:32000;top:0;left:0;opacity:.3;background:#000;padding:0}'));
    });
}
, function(ym) {
    ym.modules.define('popup__under', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__under{position:absolute;top:0;left:0;z-index:-1;width:100%;height:100%;border:0;padding:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}'));
    });
}
, function(ym) {
    ym.modules.define('popup__wrapper_behaviour_scrollable', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup__wrapper_behaviour_scrollable{display:block;width:100%;height:100%;overflow:auto;position:fixed;z-index:32700;background:0 0;top:0;left:0}'));
    });
}
, function(ym) {
    ym.modules.define('popup_has-close_yes', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup_has-close_yes .ymaps-2-1-79-popup__content{padding:20px}'));
    });
}
, function(ym) {
    ym.modules.define('popup_position_fixed', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup_position_fixed{position:fixed}'));
    });
}
, function(ym) {
    ym.modules.define('popup_theme_ffffff', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup_theme_ffffff{-webkit-box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 8px 30px -5px rgba(0,0,0,.5);-moz-box-shadow:inset 1px 1px 10px #aaa;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 8px 30px -5px rgba(0,0,0,.5)}.ymaps-2-1-79-popup_theme_ffffff .ymaps-2-1-79-popup__content{background:#fff}.ymaps-2-1-79-popup_theme_ffffff .ymaps-2-1-79-popup__tail{background:rgba(0,0,0,.15);background:-webkit-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:-moz-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:-o-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%)}.ymaps-2-1-79-popup_theme_ffffff .ymaps-2-1-79-popup__tail:after{background-color:#fff}'));
    });
}
, function(ym) {
    ym.modules.define('popup_visibility_outside', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup_visibility_outside{display:block;top:-99999px;left:-99999px}'));
    });
}
, function(ym) {
    ym.modules.define('popup_visibility_visible', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup_visibility_visible{display:block}'));
    });
}
, function(ym) {
    ym.modules.define('popup', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-popup{display:none;position:absolute;z-index:32700;padding:1px}'));
    });
}
, function(ym) {
    ym.modules.define('route-content__icon', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-content__icon{display:inline-block}.ymaps-2-1-79-route-content__icon_type_bicycle,.ymaps-2-1-79-route-content__icon_type_driving,.ymaps-2-1-79-route-content__icon_type_walk{display:inline-block;background-repeat:no-repeat;vertical-align:middle;text-align:center;margin:auto 0 auto -4px;width:24px;height:24px}.ymaps-2-1-79-route-content__icon_type_walk{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjE0Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03LjUyIDYuNjNjLjIuMTYuMjQuNDYuMDguNjZhLjQ2LjQ2IDAgMCAxLS42My4wOUw1LjM5IDYuMjIgNS40MyA2bC4wNy0uNDMuMDItLjEuMDEtLjE5LjAyLS4yMi4wMi0uMiAxLjk1IDEuNzd6TTYuMTggOS42MWwxLjA0IDMuNjhhLjU2LjU2IDAgMCAxLS4zOS42OS41Ni41NiAwIDAgMS0uNjctLjM1TDQuOTIgMTAuMiAyLjg0IDguMWEuODEuODEgMCAwIDEtLjIxLS43M2wuNDQtMi41Ni0xIC4zLS44OCAyLjA3YS40Ni40NiAwIDAgMS0uNi4yNS40Ny40NyAwIDAgMS0uMjYtLjZsLjg5LTIuMzNhLjQ4LjQ4IDAgMCAxIC4yMy0uMjZsLjA1LS4wMyAyLjIzLTEuMTUuMDMtLjAxYS42Ny42NyAwIDAgMSAuOS4yNmMuMDguMTguMTEuNS4xMS41LjA1LjI5LjA1LjU3LjA4Ljg1di44NGExNS43IDE1LjcgMCAwIDEtLjEyIDEuNjdsLS4wNC4zMiAxLjM2IDEuODguMDUuMDdhLjUuNSAwIDAgMSAuMDguMTd6TTUuNyAxLjJhMS4yIDEuMiAwIDEgMS0yLjQgMCAxLjIgMS4yIDAgMCAxIDIuNCAwek0zLjE0IDkuMzRsLjguNy0uMjguNTktMS44OCAzLjFhLjU1LjU1IDAgMCAxLS43Ni4xOS41Ni41NiAwIDAgMS0uMi0uNzNsMS41Ni0zLjEuMDgtLjc1LjA4LS41Ny4xLjEuNS40N3oiLz48L3N2Zz4=);background-position:8px;position:relative;top:-2px;margin-left:-6px}.ymaps-2-1-79-route-content__icon_type_driving{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS4yMiAzbC4zOC0xLjQ4QTEuOCAxLjggMCAwIDEgMy4xNC4xN0M0LjE0LjA2IDQuNTcgMCA2IDBzMS44NS4wNiAyLjg2LjE3YTEuOCAxLjggMCAwIDEgMS41NCAxLjM1TDEwLjc4IDNoLjkyYy4yIDAgLjMuMTYuMy4zNnYuNDJjMCAuMy0uMTkuNTctLjQ3LjY4bC0uMzQuMTIuMi43NWMuMDcuMjMuMTEuNDguMTEuNzN2My41OGEuMzUuMzUgMCAwIDEtLjM1LjM2SDkuNjdhLjM1LjM1IDAgMCAxLS4zNC0uMjdMOSA4LjVIM2wtLjMzIDEuMjNhLjM1LjM1IDAgMCAxLS4zNC4yN0guODVhLjM1LjM1IDAgMCAxLS4zNS0uMzZWNi4wNmMwLS4yNS4wNC0uNS4xMi0uNzNsLjItLjc1LS4zNS0uMTJBLjcxLjcxIDAgMCAxIDAgMy43N3YtLjQyQzAgMy4xNi4xIDMgLjMgM2guOTJ6bTguMjMtMS4xM2EuOTguOTggMCAwIDAtLjg0LS43M0ExOS4xMiAxOS4xMiAwIDAgMCA2IDFjLTEuMjcgMC0xLjcyLjA1LTIuNi4xNGEuOTguOTggMCAwIDAtLjg1LjczTDIgNGEyOS4xIDI5LjEgMCAwIDEgOCAwbC0uNTUtMi4xM3pNOS41IDdhMSAxIDAgMSAwIDAtMiAxIDEgMCAwIDAgMCAyem0tNyAwYTEgMSAwIDEgMCAwLTIgMSAxIDAgMCAwIDAgMnoiLz48L3N2Zz4=);background-position:5px 6px}.ymaps-2-1-79-route-content__icon_type_bicycle{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTQuNDIgNi41M2wtLjYzLjJBLjYuNiAwIDAgMSAzIDYuMTh2LS40YzAtLjI3LjAzLS4zNi4wOC0uNDZhLjU1LjU1IDAgMCAxIC4yMy0uMjNjLjEtLjA1LjItLjA4LjQ2LS4wOEg1LjVhLjUuNSAwIDAgMSAuNS41Ljc5Ljc5IDAgMCAxLS4wNS4zLjU0LjU0IDAgMCAxLS4xNS4yMi43OS43OSAwIDAgMS0uMjcuMTRsLS4xNC4wNCAxLjUyIDIuNjQgMi4yMS0zLjY4LS4zOC0uOTdhLjMuMyAwIDAgMC0uMjgtLjJINy41YS41LjUgMCAwIDEgMC0xaC45NmExLjMgMS4zIDAgMCAxIDEuMi44MkwxMS4zNSA4YTIuNSAyLjUgMCAxIDEtLjk3LjI2TDkuNiA2LjMxIDcuNTUgOS43NGExLjIgMS4yIDAgMCAxIC4yNi43NSAxLjIgMS4yIDAgMCAxLTEuNDYgMS4xN2wtMy41NS0uOGEuMzguMzggMCAwIDEgMC0uNzRsMy4yOC0uNzQtMS42NC0yLjg3em0uMTYgMi41OGwtMS4xLjI1YTEuNSAxLjUgMCAxIDAgMCAyLjI4bDEuMS4yNWEyLjUgMi41IDAgMSAxIDAtMi43OHpNMTEuNSAxMmExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM3oiLz48L3N2Zz4=);background-position:4px 4px}.ymaps-2-1-79-route-content__icon_type_driving_blocked,.ymaps-2-1-79-route-content__icon_type_driving_taxi{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGNTk1OSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAxNkE4IDggMCAxIDEgOCAwYTggOCAwIDAgMSAwIDE2ek00LjY0IDdjLS4yMiAwLS4zLjAyLS4zOC4wN2EuNDUuNDUgMCAwIDAtLjIuMTljLS4wNC4wOC0uMDYuMTYtLjA2LjM4di43MmMwIC4yMi4wMi4zLjA3LjM4YS40NS40NSAwIDAgMCAuMTkuMmMuMDguMDQuMTYuMDYuMzguMDZoNi43MmMuMjIgMCAuMy0uMDIuMzgtLjA3YS40NS40NSAwIDAgMCAuMi0uMTljLjA0LS4wOC4wNi0uMTYuMDYtLjM4di0uNzJjMC0uMjItLjAyLS4zLS4wNy0uMzhhLjQ1LjQ1IDAgMCAwLS4xOS0uMmMtLjA4LS4wNC0uMTYtLjA2LS4zOC0uMDZINC42NHoiLz48L3N2Zz4=);background-repeat:no-repeat;vertical-align:middle;margin:-2px 4px 0 0;width:16px;height:16px}.ymaps-2-1-79-route-content__icon_type_driving_taxi{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTEgMkgzYTIgMiAwIDAgMC0yIDJ2NmEyIDIgMCAwIDAgMiAyaDhhMiAyIDAgMCAwIDItMlY0YTIgMiAwIDAgMC0yLTJ6bTEgNXYyaC0yVjdoMnptLTItMnYySDhWNWgyek04IDd2Mkg2VjdoMnpNNiA1djJINFY1aDJ6TTQgN3YySDJWN2gyeiIvPjwvc3ZnPg==);margin:-1px 4px 0 0}.ymaps-2-1-79-route-content__icon_has_ferries,.ymaps-2-1-79-route-content__icon_has_tolls{vertical-align:middle;background-repeat:no-repeat;margin:0 0 2px 4px;width:16px;height:16px;cursor:pointer}.ymaps-2-1-79-route-content__icon_has_ferries{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOS42NSA1LjgybC0yLjktMS42MWExLjU1IDEuNTUgMCAwIDAtMS41MSAwbC0yLjkgMS42MS40Mi0yLjU3QS4zLjMgMCAwIDEgMy4wNSAzaDUuOWMuMTQgMCAuMjcuMS4yOS4yNWwuNDEgMi41N3pNNy4xIDJMNi44NC4yNUEuMy4zIDAgMCAwIDYuNTUgMGgtMS4xYS4zLjMgMCAwIDAtLjI5LjI1TDQuOSAyaDIuMnpNLjggNy43Nmw0Ljk0LTIuNjlhLjU4LjU4IDAgMCAxIC41NiAwbDQuOSAyLjY2YS41NS41NSAwIDAgMSAuMjQuNzRMMTAuMTQgMTFjLS4zNC42Ni0xLjAzIDEtMi4wNiAxLTEuNTQgMC0yLjU3LTEtNC4xMS0xYTMgMyAwIDAgMC0xLjIuMjEgMS4wNCAxLjA0IDAgMCAxLTEuMzgtLjU3bC0uODUtMi4yYS41NS41NSAwIDAgMSAuMjUtLjY4em02LjcuOTRhLjcuNyAwIDEgMCAwLTEuNC43LjcgMCAwIDAgMCAxLjR6bS0zIDBhLjcuNyAwIDEgMCAwLTEuNC43LjcgMCAwIDAgMCAxLjR6Ii8+PC9zdmc+);background-position:center}.ymaps-2-1-79-route-content__icon_has_tolls_ru{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAxNkE4IDggMCAxIDEgOCAwYTggOCAwIDAgMSAwIDE2ek02LjExIDcuNTlINS4ydi45OGguOTF2Ljg1SDUuMnYuOTloLjkxdjEuOWgxLjQ1di0xLjloMi40MnYtLjk5SDcuNTZ2LS44NWguNjZhNSA1IDAgMCAwIDEuMjItLjE0Yy4zNi0uMDkuNjgtLjIzLjk0LS40Mi4yNi0uMi40Ni0uNDQuNi0uNzUuMTUtLjMuMjItLjY3LjIyLTEuMSAwLS44My0uMjYtMS40NS0uNzktMS44NUEzLjQgMy40IDAgMCAwIDguMyAzLjdINi4xdjMuODl6bTEuNDUtMi43MXYyLjdoLjY4YzEgMCAxLjUtLjQ2IDEuNS0xLjQgMC0uNDYtLjEtLjgtLjMzLTEtLjIzLS4yLS42LS4zLTEuMTEtLjNoLS43NHoiLz48L3N2Zz4=)}.ymaps-2-1-79-route-content__icon_has_tolls_en{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAxNkE4IDggMCAxIDEgOCAwYTggOCAwIDAgMSAwIDE2em0tLjY5LTIuNDloMS4yMXYtMS41OGMuMjktLjA0LjU2LS4xLjgxLS4yMS4yNi0uMS40OC0uMjUuNjctLjQ0LjItLjE4LjM1LS40MS40Ni0uNjkuMTEtLjI4LjE3LS42LjE3LTFzLS4wNy0uNzUtLjItMS4wMmExLjk0IDEuOTQgMCAwIDAtLjU1LS42OCAyLjcgMi43IDAgMCAwLS43Ni0uNDIgOC43MSA4LjcxIDAgMCAwLS44OC0uMjYgNi4xMiA2LjEyIDAgMCAxLS41OC0uMTYgMi4xNCAyLjE0IDAgMCAxLS40OC0uMjEgMSAxIDAgMCAxLS4zMy0uMzIuODguODggMCAwIDEtLjEyLS40OGMwLS4zMS4xLS41Ni4zMy0uNzQuMjEtLjE4LjU4LS4yNyAxLjExLS4yN2EzLjM5IDMuMzkgMCAwIDEgMS44LjVsLjItMS4xN2E0LjM2IDQuMzYgMCAwIDAtLjYtLjI4IDMuOCAzLjggMCAwIDAtLjk4LS4yVjIuNUg3LjM3djEuNDRjLS42Mi4xMS0xLjEuMzUtMS40NS43MnMtLjUyLjg2LS41MiAxLjQ3YzAgLjQxLjA3Ljc1LjIgMS4wMi4xNC4yNi4zMi40OC41NC42NS4yMi4xNy40Ny4zLjc1LjRhOS44IDkuOCAwIDAgMCAuODQuMjYgOC43IDguNyAwIDAgMSAuNjUuMThjLjIuMDcuMzUuMTQuNDguMjRzLjI0LjIxLjMuMzVjLjA3LjEzLjEuMy4xLjUgMCAuNC0uMTIuNjctLjM3Ljg0YTEuOCAxLjggMCAwIDEtMS4wMi4yNSAzLjY3IDMuNjcgMCAwIDEtMS4zMy0uMjUgNC4yNiA0LjI2IDAgMCAxLS41MS0uMjMgMy41OSAzLjU5IDAgMCAxLS40LS4yNWwtLjIgMS4xNGEzLjY1IDMuNjUgMCAwIDAgMS45Ljd2MS41OHoiLz48L3N2Zz4=)}.ymaps-2-1-79-route-content__icon_has_tolls_tr{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAxNkE4IDggMCAxIDEgOCAwYTggOCAwIDAgMSAwIDE2em0tLjY1LTMuNDRjMi43IDAgNC4zLTEuNTYgNC4zLTMuODVoLTEuMzRjMCAxLjU0LTEuMSAyLjUyLTIuNTcgMi41MlY4LjI4bDEuNjMtLjc2di0uOThsLTEuNjMuNzVWNi4wNmwxLjYzLS43NnYtLjk4bC0xLjYzLjc1VjMuNGgtMS40djIuMzJMNSA2LjMzdi45OWwxLjMzLS42MnYxLjI0TDUgOC41NXYuOTlsMS4zMy0uNjJ2My42NGgxLjAzeiIvPjwvc3ZnPg==)}'));
    });
}
, function(ym) {
    ym.modules.define('route-content', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-content{display:block;min-width:140px;font-size:11px}.ymaps-2-1-79-route-content-wide{min-width:170px}.ymaps-2-1-79-route-content__description,.ymaps-2-1-79-route-content__title,.ymaps-2-1-79-route-content__transit{display:block;height:24px;line-height:24px}.ymaps-2-1-79-route-content__title{color:#000;margin-right:30px;white-space:nowrap}.ymaps-2-1-79-route-content__description{margin-bottom:4px;color:#999}.ymaps-2-1-79-route-content__description.ymaps-2-1-79-route-content__description--multiline{height:auto;padding:4px 0;line-height:12px}.ymaps-2-1-79-route-content__transit{opacity:0;position:relative;margin-bottom:4px}.ymaps-2-1-79-route-content__button-holder{display:none}.ymaps-2-1-79-route-content__button-holder.ymaps-2-1-79-_has-content{display:block;height:24px}.ymaps-2-1-79-route-content__button-holder.ymaps-2-1-79-_has-content iframe{width:140px;min-width:100%!important;min-height:24px!important;display:block!important;visibility:visible!important;opacity:1!important}.ymaps-2-1-79-route-content__taxi-link-holder{margin-top:4px;display:block}.ymaps-2-1-79-route-content__button,.ymaps-2-1-79-route-content__taxi-link{position:relative;display:block;margin:0;padding:0;cursor:pointer;color:#000;border:0;border-radius:3px;outline:0;text-align:center;white-space:nowrap;-webkit-tap-highlight-color:rgba(0,0,0,0);background-color:#ffdb4d}.ymaps-2-1-79-route-content__taxi-link{text-decoration:none!important;height:24px;line-height:24px;font-size:13px}.ymaps-2-1-79-route-content__button:hover,.ymaps-2-1-79-route-content__taxi-link:hover{background-color:#ffd633}.ymaps-2-1-79-route-content__button{font-size:12px}.ymaps-2-1-79-route-content__button:active{background-color:#fc0}.ymaps-2-1-79-route-content__button_size_small{font-size:13px;height:24px;line-height:24px}.ymaps-2-1-79-route-content__button_size_medium{height:28px;line-height:28px}.ymaps-2-1-79-route-content__button__text{margin:0 13px;user-select:none;-webkit-user-select:none}'));
    });
}
, function(ym) {
    ym.modules.define('route-icons', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-icons{position:absolute;top:0;left:0;height:24px;line-height:24px;white-space:nowrap}.ymaps-2-1-79-route-icons.ymaps-2-1-79-with-collapsing-dots{overflow:hidden;width:100%;white-space:normal;padding-right:8px;box-sizing:border-box}.ymaps-2-1-79-route-icons.ymaps-2-1-79-with-collapsing-dots:after{content:\'...\';position:absolute;top:0;right:0;background:#fff;line-height:1em;padding-top:12px}.ymaps-2-1-79-route-icons__icon{display:inline-block;background-repeat:no-repeat;background-position:center center;vertical-align:middle;text-align:center;margin-right:8px}.ymaps-2-1-79-route-icons__icon:last-child{margin-right:0}.ymaps-2-1-79-route-icons__icon_type_transfer,.ymaps-2-1-79-route-icons__icon_type_walk{width:9px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDUgNy43bC4wOS0xLjNjLjcyLjU5IDEuNzUgMS4zNyAxLjgzIDEuNDJhLjUuNSAwIDAgMSAuMTUuNzMuNTcuNTcgMCAwIDEtLjc1LjE0Yy0uMTQtLjA5LTEtLjctMS4zMi0xem0tNC4yLTEuM2MuMS0uMTkgMS4wMy0uNjEgMS4wMy0uNjFMNi41MyA4LjdjLS4wNC4zNS4xMi44LjM3IDEuMDZsMi4yIDIuMTJhLjQ3LjQ3IDAgMCAxIC4xLjE3czEuMzggMy4zIDEuNDMgMy40OGEuNjcuNjcgMCAwIDAgLjguNDQuNjQuNjQgMCAwIDAgLjQ4LS43N2wtMS4yOS0zLjgyYS43OS43OSAwIDAgMC0uMS0uMTdsLTEuNjYtMi4yYS4zLjMgMCAwIDEtLjA1LS4xOHMuMjMtMy40LjIzLTQuMDZjMC0uNjUtLjU5LS45Mi0uOTEtLjkyLTEuMDkgMC0zLjI4IDEuNjQtMy40MyAyLjAyTDMuODIgOC4xYy0uMTEuMjcuMDUuNTcuMzMuNjYuMjguMS42LS4wNS43LS4zMi4wNy0uMTYuOTItMS45NS45OC0yLjA1aC4wMXptMS45IDYuMDhsLTEuMy0xLjI3LTIuMDQgMy44OGEuNjEuNjEgMCAwIDAgLjMuODRjLjMyLjE1LjcyLjA0Ljg4LS4yOC4xLS4xOCAyLjE1LTMuMTcgMi4xNS0zLjE3em0yLTExLjEyYTEuMzYgMS4zNiAwIDEgMC0yLjcyIDAgMS4zNiAxLjM2IDAgMCAwIDIuNzIgMHoiLz48L3N2Zz4=)}.ymaps-2-1-79-route-icons__icon_type_underground svg{position:relative;top:1px;width:16px;vertical-align:middle}.ymaps-2-1-79-route-icons__icon_type_minibus{width:12px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0IzM0VBOSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiAxNC40VjIuNUMyIC43IDUuNi43IDggLjdzNiAwIDYgMS44djExLjlhLjYuNiAwIDAgMS0uNjEuNkgxM3YuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNmgtMi4yOGEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNUg2di42NGEuMzYuMzYgMCAwIDEtLjM2LjM2SDMuMzZhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVoLS4zOWEuNjEuNjEgMCAwIDEtLjYxLS42ek0zLjMgN2EuMy4zIDAgMCAwLS4zLjN2Mi40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjcuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMS4yIDQuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6TTExIDR2MmgyVjRoLTJ6TTkgMnYyaDJWMkg5ek01IDJ2MmgyVjJINXptMiAydjJoMlY0SDd6TTMgNHYyaDJWNEgzeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-icons__icon_type_tramway{width:12px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0YzMyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiA1YzAtLjY2LjUyLTEuMzYgMS4xNS0xLjU1IDAgMCAyLjQ1LS44NSA0Ljg1LS44NXM0Ljg3Ljg2IDQuODcuODZBMS43IDEuNyAwIDAgMSAxNCA1djguNWMwIDEuMzItMS4wNyAyLjUtMi40IDIuNUg0LjRDMy4wNyAxNiAyIDE0LjgyIDIgMTMuNVY1em00LS41YzAgLjI3LjIyLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OWEuNS41IDAgMCAwLS40OS41ek0zLjYgNi4zNGMtLjIxLjIzLS4zLjU0LS4yNi44NmwuMzIgMi40Yy4wNy42Ni42OCAxLjQgMS4zNCAxLjRoNmMuNjcgMCAxLjI3LS43NCAxLjM0LTEuNGwuMzItMi40MmMuMDctLjY2LS40LTEuMTgtMS4wNi0xLjE4SDQuNGExLjAzIDEuMDMgMCAwIDAtLjguMzR6TTUgMTQuN2ExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6bTYgMGExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6TTEyIC41YS41LjUgMCAwIDEtLjUuNWgtN0EuNS41IDAgMCAxIDQgLjVjMC0uMjcuMjItLjUuNS0uNWg3Yy4yNyAwIC41LjIyLjUuNXoiLz48L3N2Zz4=)}.ymaps-2-1-79-route-icons__icon_type_bus{width:12px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzcxQjczMiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMgMTV2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZoLTIuMjhhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVINnYuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNkgzLjM2YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1aC0uMzlhLjYxLjYxIDAgMCAxLS42MS0uNlYzLjI3YzAtLjUyLjM3LS45Ny44OC0xLjA4IDAgMCAyLjI1LS4yOSA1LjEyLS4yOXM1LjExLjMgNS4xMS4zYy41MS4xLjg4LjU0Ljg5IDEuMDZWMTQuNGEuNi42IDAgMCAxLS42MS42SDEzek0zLjMgNWEuMy4zIDAgMCAwLS4zLjN2NC40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjUuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMy4xOS0yYS41LjUgMCAwIDAtLjQ5LjVjMCAuMjguMjEuNS40OS41aDMuMDJhLjUuNSAwIDAgMCAuNDktLjUuNS41IDAgMCAwLS40OS0uNUg2LjQ5ek00LjUgMTEuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6Ii8+PC9zdmc+)}.ymaps-2-1-79-route-icons__icon_type_trolleybus{width:12px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzQyOTZFQSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAzLjljLjM1IDAgLjY4IDAgMSAuMDJsMS43Ni0zLjVhLjc1Ljc1IDAgMSAxIDEuMzQuNjdsLTEuNDcgMi45M2MxLjUzLjE1IDIuNDguMzcgMi40OC4zNy41MS4xLjg4LjU1Ljg5IDEuMDd2OC45NGEuNi42IDAgMCAxLS42MS42SDEzdi42NGEuMzYuMzYgMCAwIDEtLjM2LjM2aC0yLjI4YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1SDZ2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZIMy4zNmEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNWgtLjM5YS42MS42MSAwIDAgMS0uNjEtLjZWNS40N2MwLS41Mi4zNy0uOTcuODgtMS4wOCAwIDAgLjc3LS4xOCAyLjA1LS4zMkw2Ljc2LjQyYS43NS43NSAwIDAgMSAxLjM0LjY3TDYuNjcgMy45M2MuNDItLjAyLjg3LS4wMyAxLjMzLS4wM3pNMy4zIDdhLjMuMyAwIDAgMC0uMy4zdjIuNGMwIC4xNy4xMy4zLjMuM2g5LjRhLjMuMyAwIDAgMCAuMy0uM1Y3LjNhLjMuMyAwIDAgMC0uMy0uM0gzLjN6bTMuMTktMmEuNS41IDAgMCAwLS40OS41YzAgLjI4LjIxLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OXpNNC41IDExLjJhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42em03IDBhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-icons__icon_type_suburban{width:12px;height:16px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOC42LjdhMS44IDEuOCAwIDAgMSAxLjcyIDEuMjZjMS43Mi4xIDMuNjguMzggMy42OCAxLjE0djcuOGwtLjYgMi40LTEuMDggMS4wOC42OC42MmEuNi42IDAgMCAxLS44NC44NEwxMC4yMiAxNEg1Ljc3bC0xLjkzIDEuODVBLjYuNiAwIDAgMSAzIDE1bC42OC0uNjJMMi42IDEzLjMgMiAxMC45VjMuMWMwLS43NyAxLjk2LTEuMDQgMy42OC0xLjE0QTEuOCAxLjggMCAwIDEgNy40LjdoMS4yek0xMi42NCA5YS4zNi4zNiAwIDAgMCAuMzYtLjM2VjQuMzZhLjM2LjM2IDAgMCAwLS4zNi0uMzZIMy4zNmEuMzYuMzYgMCAwIDAtLjM2LjM2djQuMjhjMCAuMi4xNi4zNi4zNi4zNmg5LjI4em0tMS4xNCAzLjhhMS4zIDEuMyAwIDEgMCAwLTIuNiAxLjMgMS4zIDAgMCAwIDAgMi42em0tNyAwYTEuMyAxLjMgMCAxIDAgMC0yLjYgMS4zIDEuMyAwIDAgMCAwIDIuNnpNNy40IDEuOWEuNi42IDAgMSAwIDAgMS4yaDEuMmEuNi42IDAgMSAwIDAtMS4ySDcuNHoiLz48L3N2Zz4=)}'));
    });
}
, function(ym) {
    ym.modules.define('_route-pin_size_large', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-pin_size_large{margin:-30px 0 0 -15px}.ymaps-2-1-79-route-pin_size_large::before{width:30px;height:38px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxLjcyIDI4LjA0YzMuNi0yLjggNy4yOC03LjEgNy4yOC0xMi45OEExNCAxNCAwIDAgMCAxIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDF6Ii8+PHBhdGggZD0iTTE1IDFjNy43MyAwIDE0IDYuMjcgMTQgMTQuMDYgMCA1Ljg3LTMuNjkgMTAuMTgtNy4yOCAxMi45OGE3IDcgMCAxIDEtMTMuNDQgMEM0LjY4IDI1LjIxIDEgMjAuOSAxIDE1QTE0IDE0IDAgMCAxIDE1IDFtMC0xQzYuNzMgMCAwIDYuNzMgMCAxNWMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNiAzMCA2Ljc2IDIzLjI3IDAgMTUgMHoiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==) no-repeat}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMS02LjcyLTguOTdDNC42OCAyNS4yMyAxIDIwLjkgMSAxNUExNCAxNCAwIDAgMSAxNSAxVjBDNi43MyAwIDAgNi43MyAwIDE1YzAgNC45NCAyLjQ3IDkuNTcgNy4xNiAxMy40MkE4IDggMCAxIDAgMjMgMzBoLTFhNyA3IDAgMCAxLTcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxQTE0IDE0IDAgMCAwIDEgMTVjMCA1LjkgMy42OSAxMC4yMiA3LjI4IDEzLjAzQTcgNyAwIDEgMCAyMiAzMHYtMWgtN3oiLz48L3N2Zz4=)}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_top::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMCA2LjcyLTguOTdDMjUuMzIgMjUuMjMgMjkgMjAuOSAyOSAxNUExNCAxNCAwIDAgMCAxNSAxVjBjOC4yNyAwIDE1IDYuNzMgMTUgMTUgMCA0Ljk0LTIuNDcgOS41Ny03LjE2IDEzLjQyQTggOCAwIDEgMSA3IDMwaDFhNyA3IDAgMCAwIDcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxYTE0IDE0IDAgMCAxIDE0IDE0YzAgNS45LTMuNjkgMTAuMjItNy4yOCAxMy4wM0E3IDcgMCAxIDEgOCAzMHYtMWg3eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_left::before,.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_right::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTI5IDE1di4wNmMwIDUuODctMy42OSAxMC4xOC03LjI4IDEyLjk4YTcgNyAwIDEgMS0xMy40NCAwQzQuNjggMjUuMjIgMSAyMC45IDEgMTVIMGMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNlYxNWgtMXoiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDFjMy42LTIuOCA3LjI4LTcuMSA3LjI4LTEyLjk4VjE1SDF6Ii8+PC9zdmc+)}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label{width:30px;height:30px;font:700 15px/30px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label::before{width:30px;height:38px;background-position:center;background-repeat:no-repeat}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label::after{top:3px;left:3px;width:20px;height:20px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label::after{left:-5px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label::after{left:11px}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label-dot:after{background-repeat:no-repeat;background-position:center;left:5px;top:5px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right{margin:-15px 0 0 -22px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top{margin:0 0 0 -15px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left{margin:-15px 0 0 -8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right::before{top:-4px;left:-4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label::before{margin-top:-4px;margin-left:-4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top::before{top:-8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label::before{margin-top:-8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left::before{top:-4px;left:4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label::before{margin-top:-4px;margin-left:4px}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__text{top:1px;left:14px;padding:0 13px 0 22px;height:28px;border-radius:0 14px 14px 0;font:15px/28px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__text:after{border-radius:0 15px 15px 0}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__text{left:22px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text{top:1px;right:23px;left:auto;padding:0 22px 0 13px;border-radius:14px 0 0 14px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text:after{border-radius:15px 0 0 15px;right:0;left:-1px}'));
    });
}
, function(ym) {
    ym.modules.define('_route-pin_size_small', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-pin_size_small{margin:-25px 0 0 -13px}.ymaps-2-1-79-route-pin_size_small::before{width:26px;height:32px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzYTEyIDEyIDAgMCAxIDI0IDBjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6Ii8+PHBhdGggZD0iTTEzIDFhMTIgMTIgMCAwIDEgMTIgMTJjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJBNi4wMSA2LjAxIDAgMCAxIDEzIDMxYTYgNiAwIDAgMS01LjgyLTcuNDhDNC4xMiAyMS4xNCAxIDE3LjU5IDEgMTNBMTIgMTIgMCAwIDEgMTMgMW0wLTFDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJhNyA3IDAgMSAwIDEzLjgzIDBDMjMuOSAyMC42NyAyNiAxNi45IDI2IDEzYzAtNy4xNy01LjgzLTEzLTEzLTEzeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+) no-repeat}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_state_expanded::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEzIDI0VjFBMTIgMTIgMCAwIDAgMSAxM2MwIDQuNiAzLjEyIDguMTQgNi4xOCAxMC41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuOS03SDEzeiIvPjxwYXRoIGQ9Ik0xOC45MSAyNmE2IDYgMCAxIDEtMTEuNzMtMi40OEM0LjEyIDIxLjE0IDEgMTcuNTkgMSAxM0ExMiAxMiAwIDAgMSAxMyAxVjBDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJBNyA3IDAgMCAwIDE5LjkyIDI2aC0xLjAxeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+)}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top.ymaps-2-1-79-route-pin_state_expanded::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTcuMSAyNGE2IDYgMCAxIDAgMTEuNzItLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDF2MjNINy4xeiIvPjxwYXRoIGQ9Ik03LjA5IDI2YTYgNiAwIDEgMCAxMS43My0yLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDFWMGM3LjE3IDAgMTMgNS44MyAxMyAxMyAwIDMuOS0yLjEgNy42Ny02LjA4IDEwLjkyQTcgNyAwIDAgMSA2LjA4IDI2aDEuMDF6IiBvcGFjaXR5PSIuMDgiLz48L3N2Zz4=)}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left.ymaps-2-1-79-route-pin_state_expanded::before,.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right.ymaps-2-1-79-route-pin_state_expanded::before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzSDBjMCAzLjkgMi4xIDcuNjcgNi4wOCAxMC45MmE3IDcgMCAxIDAgMTMuODMgMEMyMy45IDIwLjY3IDI2IDE2LjkgMjYgMTNoLTFjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6IiBvcGFjaXR5PSIuMDgiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNy4xOCAyMy41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuODItNy40OEMyMS44OCAyMS4xNCAyNSAxNy41OSAyNSAxM0gxYzAgNC42IDMuMTIgOC4xNCA2LjE4IDEwLjUyeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label{width:26px;height:26px;font:700 12px/26px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label::before{width:26px;height:32px;background-repeat:no-repeat;background-position:center}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label::after{top:3px;left:3px;width:20px;height:20px}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label-dot:after{background-repeat:no-repeat;background-position:center}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right{margin:-13px 0 0 -25px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top{margin:-1px 0 0 -13px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left{margin:-13px 0 0 -1px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right::before{top:-3px;left:3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label::before{margin-top:-3px;margin-left:3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top::before{top:-6px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label::before{margin-top:-6px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left::before{top:-3px;left:-3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label::before{margin-top:-3px;margin-left:-3px}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__text{top:1px;left:12px;padding:0 11px 0 15px;height:24px;border-radius:0 12px 12px 0;font:13px/24px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__text:after{border-radius:0 15px 15px 0}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text{top:1px;right:13px;left:auto;padding:0 17px 0 11px;border-radius:12px 0 0 12px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text:after{border-radius:15px 0 0 15px;right:0;left:-1px}'));
    });
}
, function(ym) {
    ym.modules.define('route-pin', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-route-pin,.ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin__label-a,.ymaps-2-1-79-route-pin__label-b,.ymaps-2-1-79-route-pin__text,.ymaps-2-1-79-route-pin__text-a{position:absolute}.ymaps-2-1-79-route-pin__label{position:relative;z-index:1;text-align:center}.ymaps-2-1-79-route-pin__label-b{top:0;left:0;z-index:-1}.ymaps-2-1-79-route-pin__label-a{background-repeat:no-repeat;background-position:center}.ymaps-2-1-79-route-pin_filled_yes .ymaps-2-1-79-route-pin__label-a{color:#fff}.ymaps-2-1-79-route-pin__label-dot .ymaps-2-1-79-route-pin__label-a{display:none}.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-b{-webkit-transform:rotate(270deg);transform:rotate(270deg)}.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label-b{-webkit-transform:rotate(180deg);transform:rotate(180deg)}.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-b{-webkit-transform:rotate(90deg);transform:rotate(90deg)}.ymaps-2-1-79-route-pin__label,.ymaps-2-1-79-route-pin__text{display:inline-block;vertical-align:top}.ymaps-2-1-79-route-pin__text{top:1px;border-left:none;background:#fff;color:#000;white-space:nowrap}.ymaps-2-1-79-route-pin__text-a{top:-1px;right:-1px;bottom:-1px;left:1px;z-index:-1;border:1px solid rgba(0,0,0,.08)}@media print{.ymaps-2-1-79-route-pin__text-a{overflow:hidden}.ymaps-2-1-79-route-pin__text-a:before{content:\'\';position:absolute;z-index:-1;left:0;height:0;border-bottom:99px solid #fff;width:9999px}}.ymaps-2-1-79-route-pin_patched-for-print .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_patched-for-print .ymaps-2-1-79-route-pin__label-a,.ymaps-2-1-79-route-pin_patched-for-print .ymaps-2-1-79-route-pin__label-b{background:0 0!important;display:list-item!important;list-style-position:inside!important;list-style-image:url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)}.ymaps-2-1-79-route-pin_patched-for-print .ymaps-2-1-79-route-pin__label-dot .ymaps-2-1-79-route-pin__label-a{display:none!important}.ymaps-2-1-79-route-pin_size_large{margin:-30px 0 0 -15px}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxLjcyIDI4LjA0YzMuNi0yLjggNy4yOC03LjEgNy4yOC0xMi45OEExNCAxNCAwIDAgMCAxIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDF6Ii8+PHBhdGggZD0iTTE1IDFjNy43MyAwIDE0IDYuMjcgMTQgMTQuMDYgMCA1Ljg3LTMuNjkgMTAuMTgtNy4yOCAxMi45OGE3IDcgMCAxIDEtMTMuNDQgMEM0LjY4IDI1LjIxIDEgMjAuOSAxIDE1QTE0IDE0IDAgMCAxIDE1IDFtMC0xQzYuNzMgMCAwIDYuNzMgMCAxNWMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNiAzMCA2Ljc2IDIzLjI3IDAgMTUgMHoiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTIxLjcyIDI4LjA0YzMuNi0yLjggNy4yOC03LjEgNy4yOC0xMi45OEExNCAxNCAwIDAgMCAxIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDF6Ii8+PHBhdGggZD0iTTE1IDFjNy43MyAwIDE0IDYuMjcgMTQgMTQuMDYgMCA1Ljg3LTMuNjkgMTAuMTgtNy4yOCAxMi45OGE3IDcgMCAxIDEtMTMuNDQgMEM0LjY4IDI1LjIxIDEgMjAuOSAxIDE1QTE0IDE0IDAgMCAxIDE1IDFtMC0xQzYuNzMgMCAwIDYuNzMgMCAxNWMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNiAzMCA2Ljc2IDIzLjI3IDAgMTUgMHoiIG9wYWNpdHk9Ii4wOCIvPjwvc3ZnPg==);width:30px;height:38px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMS02LjcyLTguOTdDNC42OCAyNS4yMyAxIDIwLjkgMSAxNUExNCAxNCAwIDAgMSAxNSAxVjBDNi43MyAwIDAgNi43MyAwIDE1YzAgNC45NCAyLjQ3IDkuNTcgNy4xNiAxMy40MkE4IDggMCAxIDAgMjMgMzBoLTFhNyA3IDAgMCAxLTcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxQTE0IDE0IDAgMCAwIDEgMTVjMCA1LjkgMy42OSAxMC4yMiA3LjI4IDEzLjAzQTcgNyAwIDEgMCAyMiAzMHYtMWgtN3oiLz48L3N2Zz4=) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMS02LjcyLTguOTdDNC42OCAyNS4yMyAxIDIwLjkgMSAxNUExNCAxNCAwIDAgMSAxNSAxVjBDNi43MyAwIDAgNi43MyAwIDE1YzAgNC45NCAyLjQ3IDkuNTcgNy4xNiAxMy40MkE4IDggMCAxIDAgMjMgMzBoLTFhNyA3IDAgMCAxLTcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxQTE0IDE0IDAgMCAwIDEgMTVjMCA1LjkgMy42OSAxMC4yMiA3LjI4IDEzLjAzQTcgNyAwIDEgMCAyMiAzMHYtMWgtN3oiLz48L3N2Zz4=)}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMCA2LjcyLTguOTdDMjUuMzIgMjUuMjMgMjkgMjAuOSAyOSAxNUExNCAxNCAwIDAgMCAxNSAxVjBjOC4yNyAwIDE1IDYuNzMgMTUgMTUgMCA0Ljk0LTIuNDcgOS41Ny03LjE2IDEzLjQyQTggOCAwIDEgMSA3IDMwaDFhNyA3IDAgMCAwIDcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxYTE0IDE0IDAgMCAxIDE0IDE0YzAgNS45LTMuNjkgMTAuMjItNy4yOCAxMy4wM0E3IDcgMCAxIDEgOCAzMHYtMWg3eiIvPjwvc3ZnPg==) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTE1IDM3YTcgNyAwIDAgMCA2LjcyLTguOTdDMjUuMzIgMjUuMjMgMjkgMjAuOSAyOSAxNUExNCAxNCAwIDAgMCAxNSAxVjBjOC4yNyAwIDE1IDYuNzMgMTUgMTUgMCA0Ljk0LTIuNDcgOS41Ny03LjE2IDEzLjQyQTggOCAwIDEgMSA3IDMwaDFhNyA3IDAgMCAwIDcgN3oiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNSAyOVYxYTE0IDE0IDAgMCAxIDE0IDE0YzAgNS45LTMuNjkgMTAuMjItNy4yOCAxMy4wM0E3IDcgMCAxIDEgOCAzMHYtMWg3eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTI5IDE1di4wNmMwIDUuODctMy42OSAxMC4xOC03LjI4IDEyLjk4YTcgNyAwIDEgMS0xMy40NCAwQzQuNjggMjUuMjIgMSAyMC45IDEgMTVIMGMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNlYxNWgtMXoiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDFjMy42LTIuOCA3LjI4LTcuMSA3LjI4LTEyLjk4VjE1SDF6Ii8+PC9zdmc+) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzOCI+PHBhdGggZD0iTTI5IDE1di4wNmMwIDUuODctMy42OSAxMC4xOC03LjI4IDEyLjk4YTcgNyAwIDEgMS0xMy40NCAwQzQuNjggMjUuMjIgMSAyMC45IDEgMTVIMGMwIDQuOTQgMi40NyA5LjU3IDcuMTYgMTMuNDJhOCA4IDAgMSAwIDE1LjY5IDBDMjcuNTMgMjQuNiAzMCAxOS45OCAzMCAxNS4wNlYxNWgtMXoiIG9wYWNpdHk9Ii4wOCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xIDE1YzAgNS45IDMuNjkgMTAuMjIgNy4yOCAxMy4wM2E3IDcgMCAxIDAgMTMuNDQuMDFjMy42LTIuOCA3LjI4LTcuMSA3LjI4LTEyLjk4VjE1SDF6Ii8+PC9zdmc+)}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label{width:30px;height:30px;font:700 15px/30px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label .ymaps-2-1-79-route-pin__label-b{width:30px;height:38px;background-position:center;background-repeat:no-repeat}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label .ymaps-2-1-79-route-pin__label-a{top:5px;left:5px;width:20px;height:20px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right{margin:-15px 0 0 -22px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__b{top:-4px;left:-4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-b{margin-top:-4px;margin-left:-4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-a{left:-3px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top{margin:0 0 0 -15px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__b{top:-8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label-b{margin-top:-8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left{margin:-15px 0 0 -8px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__b{top:-4px;left:4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-b{margin-top:-4px;margin-left:4px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-a{left:13px}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__text{top:1px;left:14px;padding:0 13px 0 22px;height:28px;border-radius:0 14px 14px 0;font:15px/28px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__text .ymaps-2-1-79-route-pin__text-a{border-radius:0 15px 15px 0}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text{top:1px;right:23px;left:auto;padding:0 22px 0 13px;border-radius:14px 0 0 14px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text .ymaps-2-1-79-route-pin__text-a{border-radius:15px 0 0 15px;right:0;left:-1px}.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__text{left:22px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label-a{margin-top:-2px;margin-left:-2px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_large .ymaps-2-1-79-route-pin__label-b{margin-top:2px;margin-left:2px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-b{margin-top:-2px;margin-left:2px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label-b{margin-top:-10px;margin-left:-2px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_large.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-b{margin-top:-6px;margin-left:-2px}.ymaps-2-1-79-route-pin_size_small{margin:-25px 0 0 -13px}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzYTEyIDEyIDAgMCAxIDI0IDBjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6Ii8+PHBhdGggZD0iTTEzIDFhMTIgMTIgMCAwIDEgMTIgMTJjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJBNi4wMSA2LjAxIDAgMCAxIDEzIDMxYTYgNiAwIDAgMS01LjgyLTcuNDhDNC4xMiAyMS4xNCAxIDE3LjU5IDEgMTNBMTIgMTIgMCAwIDEgMTMgMW0wLTFDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJhNyA3IDAgMSAwIDEzLjgzIDBDMjMuOSAyMC42NyAyNiAxNi45IDI2IDEzYzAtNy4xNy01LjgzLTEzLTEzLTEzeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzYTEyIDEyIDAgMCAxIDI0IDBjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6Ii8+PHBhdGggZD0iTTEzIDFhMTIgMTIgMCAwIDEgMTIgMTJjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJBNi4wMSA2LjAxIDAgMCAxIDEzIDMxYTYgNiAwIDAgMS01LjgyLTcuNDhDNC4xMiAyMS4xNCAxIDE3LjU5IDEgMTNBMTIgMTIgMCAwIDEgMTMgMW0wLTFDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJhNyA3IDAgMSAwIDEzLjgzIDBDMjMuOSAyMC42NyAyNiAxNi45IDI2IDEzYzAtNy4xNy01LjgzLTEzLTEzLTEzeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+);width:26px;height:32px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_state_expanded .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEzIDI0VjFBMTIgMTIgMCAwIDAgMSAxM2MwIDQuNiAzLjEyIDguMTQgNi4xOCAxMC41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuOS03SDEzeiIvPjxwYXRoIGQ9Ik0xOC45MSAyNmE2IDYgMCAxIDEtMTEuNzMtMi40OEM0LjEyIDIxLjE0IDEgMTcuNTkgMSAxM0ExMiAxMiAwIDAgMSAxMyAxVjBDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJBNyA3IDAgMCAwIDE5LjkyIDI2aC0xLjAxeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEzIDI0VjFBMTIgMTIgMCAwIDAgMSAxM2MwIDQuNiAzLjEyIDguMTQgNi4xOCAxMC41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuOS03SDEzeiIvPjxwYXRoIGQ9Ik0xOC45MSAyNmE2IDYgMCAxIDEtMTEuNzMtMi40OEM0LjEyIDIxLjE0IDEgMTcuNTkgMSAxM0ExMiAxMiAwIDAgMSAxMyAxVjBDNS44MyAwIDAgNS44MyAwIDEzYzAgMy45IDIuMSA3LjY3IDYuMDggMTAuOTJBNyA3IDAgMCAwIDE5LjkyIDI2aC0xLjAxeiIgb3BhY2l0eT0iLjA4Ii8+PC9zdmc+)}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTcuMSAyNGE2IDYgMCAxIDAgMTEuNzItLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDF2MjNINy4xeiIvPjxwYXRoIGQ9Ik03LjA5IDI2YTYgNiAwIDEgMCAxMS43My0yLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDFWMGM3LjE3IDAgMTMgNS44MyAxMyAxMyAwIDMuOS0yLjEgNy42Ny02LjA4IDEwLjkyQTcgNyAwIDAgMSA2LjA4IDI2aDEuMDF6IiBvcGFjaXR5PSIuMDgiLz48L3N2Zz4=) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTcuMSAyNGE2IDYgMCAxIDAgMTEuNzItLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDF2MjNINy4xeiIvPjxwYXRoIGQ9Ik03LjA5IDI2YTYgNiAwIDEgMCAxMS43My0yLjQ4QzIxLjg4IDIxLjE0IDI1IDE3LjU5IDI1IDEzQTEyIDEyIDAgMCAwIDEzIDFWMGM3LjE3IDAgMTMgNS44MyAxMyAxMyAwIDMuOS0yLjEgNy42Ny02LjA4IDEwLjkyQTcgNyAwIDAgMSA2LjA4IDI2aDEuMDF6IiBvcGFjaXR5PSIuMDgiLz48L3N2Zz4=)}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__b,.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_state_expanded.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__b{background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzSDBjMCAzLjkgMi4xIDcuNjcgNi4wOCAxMC45MmE3IDcgMCAxIDAgMTMuODMgMEMyMy45IDIwLjY3IDI2IDE2LjkgMjYgMTNoLTFjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6IiBvcGFjaXR5PSIuMDgiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNy4xOCAyMy41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuODItNy40OEMyMS44OCAyMS4xNCAyNSAxNy41OSAyNSAxM0gxYzAgNC42IDMuMTIgOC4xNCA2LjE4IDEwLjUyeiIvPjwvc3ZnPg==) no-repeat;list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTE4LjgyIDIzLjUyQTYuMDEgNi4wMSAwIDAgMSAxMyAzMWE2IDYgMCAwIDEtNS44Mi03LjQ4QzQuMTIgMjEuMTQgMSAxNy41OSAxIDEzSDBjMCAzLjkgMi4xIDcuNjcgNi4wOCAxMC45MmE3IDcgMCAxIDAgMTMuODMgMEMyMy45IDIwLjY3IDI2IDE2LjkgMjYgMTNoLTFjMCA0LjYtMy4xMiA4LjE0LTYuMTggMTAuNTJ6IiBvcGFjaXR5PSIuMDgiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNy4xOCAyMy41MkE2LjAxIDYuMDEgMCAwIDAgMTMgMzFhNiA2IDAgMCAwIDUuODItNy40OEMyMS44OCAyMS4xNCAyNSAxNy41OSAyNSAxM0gxYzAgNC42IDMuMTIgOC4xNCA2LjE4IDEwLjUyeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label{width:26px;height:26px;font:700 12px/26px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label .ymaps-2-1-79-route-pin__label-b{width:26px;height:32px;background-repeat:no-repeat;background-position:center}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label .ymaps-2-1-79-route-pin__label-a{top:3px;left:3px;width:20px;height:20px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right{margin:-13px 0 0 -25px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__b{top:-3px;left:3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-b{margin-top:-3px;margin-left:3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top{margin:-1px 0 0 -13px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__b{top:-6px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label-b{margin-top:-6px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left{margin:-13px 0 0 -1px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__b{top:-3px;left:-3px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-b{margin-top:-3px;margin-left:-3px}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__text{top:1px;left:12px;padding:0 11px 0 17px;height:24px;border-radius:0 12px 12px 0;font:13px/24px Arial,sans-serif}.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__text .ymaps-2-1-79-route-pin__text-a{border-radius:0 15px 15px 0}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text{top:1px;right:13px;left:auto;padding:0 17px 0 11px;border-radius:12px 0 0 12px}.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__text .ymaps-2-1-79-route-pin__text-a{border-radius:15px 0 0 15px;right:0;left:-1px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_small .ymaps-2-1-79-route-pin__label-b{margin-top:3px;margin-left:3px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_left .ymaps-2-1-79-route-pin__label-b{margin-top:0;margin-left:-6px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_top .ymaps-2-1-79-route-pin__label-b{margin-top:-9px;margin-left:-3px}.ymaps-2-1-79-route-pin_patched-for-print.ymaps-2-1-79-route-pin_size_small.ymaps-2-1-79-route-pin_tail_right .ymaps-2-1-79-route-pin__label-b{margin-top:-6px;margin-left:6px}'));
    });
}
, function(ym) {
    ym.modules.define('scaleline', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-scaleline{position:relative;display:inline-block;overflow:visible;text-align:center;min-width:59px;top:13px}.ymaps-2-1-79-scaleline__label{position:relative;top:-6px;display:block;padding:0 4px;vertical-align:middle;white-space:nowrap;color:#000;border-radius:3px;font:11px/15px Verdana,Arial,sans-serif;background:rgba(255,255,255,.75)}.ymaps-2-1-79-scaleline__left,.ymaps-2-1-79-scaleline__right{display:table-cell;width:49%;vertical-align:top}.ymaps-2-1-79-scaleline__left-line,.ymaps-2-1-79-scaleline__right-line{display:block;height:1px;border-top:1px solid #fff;border-bottom:1px solid #fff;background:#000}.ymaps-2-1-79-scaleline__center{display:table-cell;height:1px}.ymaps-2-1-79-scaleline__left-border,.ymaps-2-1-79-scaleline__right-border{position:absolute;z-index:-1;top:-4px;width:1px;height:9px;border:1px solid #fff;background:#000}.ymaps-2-1-79-scaleline__left-border{left:-2px}.ymaps-2-1-79-scaleline__right-border{right:-2px}'));
    });
}
, function(ym) {
    ym.modules.define('search__serp', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-search__serp-button{position:absolute;top:2px;right:27px;z-index:2;display:none;width:18px;height:24px;background-color:#fff;cursor:pointer}.ymaps-2-1-79-search__serp-button:after{content:\'\';position:absolute;top:0;right:0;bottom:0;left:0;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0RTcwNUE3REYxRUYxMUUyODVGREEzNUFGNzVENTc2NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0RTcwNUE3RUYxRUYxMUUyODVGREEzNUFGNzVENTc2NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjRFNzA1QTdCRjFFRjExRTI4NUZEQTM1QUY3NUQ1NzY2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjRFNzA1QTdDRjFFRjExRTI4NUZEQTM1QUY3NUQ1NzY2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+TnRszwAAAFFJREFUeNq80TEKQDEIA1AjOnkzPaxHtLTzh08zNHsgj2BmhAnYolXVmJmo6l1xlyJC3J2aOs+MyMxfY3eDNe5ZYI14Z/zyMj8eL/sjaOMSYADc4SeiEjj4YwAAAABJRU5ErkJggg==) center no-repeat;opacity:.4}.ymaps-2-1-79-search__input_serp_yes .ymaps-2-1-79-search__serp-button{display:block}.ymaps-2-1-79-search__serp-button:hover:after{opacity:1}.ymaps-2-1-79-search__serp.ymaps-2-1-79-search__serp{display:block;overflow-y:auto;padding:0 0 1px}.ymaps-2-1-79-search__serp-popup.ymaps-2-1-79-search__serp-popup{top:40px;display:block;box-sizing:border-box;min-width:100%;min-height:20px;background:#fff}.ymaps-2-1-79-search__serp-popup.ymaps-2-1-79-search__serp-popup_visibility_hidden{display:none}.ymaps-2-1-79-search__serp-item{color:#000}.ymaps-2-1-79-search__serp-item,.ymaps-2-1-79-search__serp-loadmore{display:block;padding:6px 10px;font:13px/1.2 Arial,sans-serif}.ymaps-2-1-79-search__serp-error{display:block;color:#000;font:13px/1.2 Arial,sans-serif}.ymaps-2-1-79-search__serp-error-msg{height:25px}.ymaps-2-1-79-search__serp-error{display:table;padding:6px 10px 6px 45px;height:25px;background-position:10px 50%;background-repeat:no-repeat}.ymaps-2-1-79-search__serp-error-msg{display:table-cell;vertical-align:middle}.ymaps-2-1-79-search__serp-loadmore{color:#0e6eb2;text-align:center;border-top:1px solid #f3f3f3;cursor:pointer}.ymaps-2-1-79-search__serp-item{border-top:1px solid #f3f3f3;border-bottom:1px solid #f3f3f3;margin-bottom:-1px;cursor:pointer}.ymaps-2-1-79-search__serp-item-first{border-top-width:0}.ymaps-2-1-79-search__serp-item_selected{background:#fff7d8;border-top:1px solid #fff7d8;border-bottom:1px solid #fff7d8;position:relative;z-index:1}.ymaps-2-1-79-search__serp-item:hover,.ymaps-2-1-79-search__serp-loadmore:hover{background:#ffeba0;border-color:#ffeba0;position:relative;z-index:2}.ymaps-2-1-79-search__serp-item-title{display:block;margin-bottom:3px;color:#0e6eb2;font-size:15px;line-height:20px}.ymaps-2-1-79-search__serp-item-descr{display:block;margin-bottom:2px}.ymaps-2-1-79-search__serp-item-link{color:#007828;text-decoration:none}.ymaps-2-1-79-search__serp-item-tags{display:block;margin-top:2px;color:#999}.ymaps-2-1-79-search__serp-item-time{display:block;margin-top:2px}.ymaps-2-1-79-search__serp-error{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSI+PHBhdGggZmlsbD0iI0JFQkVCRSIgZD0iTTEyLjUgMjVhMTIuNSAxMi41IDAgMSAwIDAtMjUgMTIuNSAxMi41IDAgMCAwIDAgMjVzLTYuOSAwIDAgMHoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTIuNSAyMi4xMWE5LjUgOS41IDAgMSAwIDAtMTkgOS41IDkuNSAwIDAgMCAwIDE5YzAtLjAxLTUuMi0uMDEgMCAweiIvPjxlbGxpcHNlIGN4PSI4LjUiIGN5PSI5LjkiIGZpbGw9IiNCRUJFQkUiIHJ4PSIxLjUiIHJ5PSIxLjYiLz48ZWxsaXBzZSBjeD0iMTYuNSIgY3k9IjkuOSIgZmlsbD0iI0JFQkVCRSIgcng9IjEuNSIgcnk9IjEuNiIvPjxwYXRoIGZpbGw9IiNCRUJFQkUiIGQ9Ik0xMi41IDE0LjQ4YzMuMDQgMCA1LjUuNiA1LjUgMS40NCAwIC44LTIuNDYgMS40NC01LjUgMS40NFM3IDE2LjcyIDcgMTUuOTJjMC0uODIgMi41LTEuNDIgNS41LTEuNDR6Ii8+PC9zdmc+)}'));
    });
}
, function(ym) {
    ym.modules.define('search__suggest', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-search__suggest{position:absolute;background-color:#fff;background-clip:padding-box;font:13px/28px Arial,sans-serif;box-sizing:border-box;border:1px solid #e5e5e5;padding:0;top:-3px;right:-1px;left:1px;-webkit-tap-highlight-color:rgba(0,0,0,0);touch-action:none;box-shadow:0 10px 20px -5px rgba(0,0,0,.2)!important}.ymaps-2-1-79-search__suggest.ymaps-2-1-79-search__suggest{z-index:0;display:block}.ymaps-2-1-79-search__suggest.ymaps-2-1-79-search__suggest_hide_yes{display:none}.ymaps-2-1-79-suggest-item{display:block}.ymaps-2-1-79-suggest-item-0{margin-top:4px}.ymaps-2-1-79-suggest-item:last-of-type{margin-bottom:4px}.ymaps-2-1-79-search__suggest-item{display:block;overflow:hidden;padding:0 9px;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.ymaps-2-1-79-search__suggest-item_selected_yes{background:#ffeba0}.ymaps-2-1-79-search__suggest-highlight{display:inline;font-weight:700}.ymaps-2-1-79-search__suggest-catalog{display:none;overflow:auto;text-align:center;padding-bottom:4px}.ymaps-2-1-79-search__suggest-catalog[style*=block]+ymaps{display:none!important}.ymaps-2-1-79-search__suggest-catalog-item{position:relative;display:inline-block;box-sizing:border-box!important;padding:52px 2% 12px;width:33%;color:#999;vertical-align:top;text-overflow:initial;white-space:normal;font-size:13px;line-height:15px;cursor:pointer}.ymaps-2-1-79-search__suggest .ymaps-2-1-79-search__suggest-catalog-item{text-align:center}.ymaps-2-1-79-search__suggest-catalog-item:after,.ymaps-2-1-79-search__suggest-catalog-item:before{content:\'\';width:32px;height:32px;position:absolute;top:12px;left:50%;margin-left:-16px}.ymaps-2-1-79-search__suggest-catalog-item:before{background-repeat:no-repeat;z-index:2;opacity:.6;background-position:center}.ymaps-2-1-79-search__suggest-catalog-item.ymaps-2-1-79-search__suggest-item_selected_yes,.ymaps-2-1-79-search__suggest-catalog-item:hover{background-color:transparent;color:#000}.ymaps-2-1-79-search__suggest-catalog-item.ymaps-2-1-79-search__suggest-item_selected_yes:after,.ymaps-2-1-79-search__suggest-catalog-item:hover:after{background-color:#ffdb4d}.ymaps-2-1-79-search__suggest-catalog-item:after{border-radius:50%}.ymaps-2-1-79-search__suggest-catalog-item_type_01-restaurant:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTYgMTJWOWMwLS41NS0uNDUtMS0xLTFzLTEgLjQ1LTEgMXYzYzAgMS4xLS45IDItMiAycy0yLS45LTItMlY5YzAtLjU1LS40NS0xLTEtMXMtMSAuNDUtMSAxdjNhNC4wMiA0LjAyIDAgMCAwIDMgMy45VjI0YTEgMSAwIDAgMCAyIDB2LTguMWMxLjctLjQ1IDMtMi4wNSAzLTMuOXoiLz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI1IiB4PSIxMSIgeT0iOCIgcng9IjEiLz48cGF0aCBkPSJNMjQgMTkuNVYyNGExIDEgMCAwIDEtMSAxYy0uNTYgMC0xLS40NC0xLTF2LTQuM2wtMi4yNy0uNGMtMS4wOC0uMTUtMS44My0xLjItMS43My0yLjNsMS03Yy4yLTEuMSAxLjItMiAyLjMtMmgxLjM3QzIzLjQgOCAyNCA4LjYgMjQgOS4zM1YxOS41ek0yMC43NSAxMWMuMS0uNTUuNi0xIDEuMTUtMWguMXY3LjRsLTEuMi0uMWEuOTUuOTUgMCAwIDEtLjg1LTEuMWwuOC01LjJ6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-search__suggest-catalog-item_type_02-bar:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTcgMjNoM2MuNTUgMCAxIC40NSAxIDFzLS40NSAxLTEgMWgtOGMtLjU1IDAtMS0uNDUtMS0xcy40NS0xIDEtMWgzdi00LjE1bC03Ljk1LTkuMWMtLjM1LS40LS4yLS43NS4zNS0uNzVoMTcuMmMuNTUgMCAuNy4zLjM1Ljc1TDE3IDE4Ljg1VjIzem00LTEybC01IDUuNy01LTUuN2gxMHoiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_03-atm:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjQgMTN2LTJIOHYxMWgxNnYtN0g4di0yaDE2ek02IDExYzAtMS4xLjktMiAyLTJoMTZhMiAyIDAgMCAxIDIgMnYxMWEyIDIgMCAwIDEtMiAySDhhMiAyIDAgMCAxLTItMlYxMXptNCA4YTEgMSAwIDAgMSAxLTFoM2MuNTUgMCAxIC40NSAxIDFzLS40NSAxLTEgMWgtM2ExIDEgMCAwIDEtMS0xeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-search__suggest-catalog-item_type_04-cinema:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjEgMjF2LjkyYzAgLjMzLjI3LjcuNi43OGwzLjggMS4zYy4zIDAgLjYtLjEuNi0uNXYtNS4wNGMwLS4zNi0uMjctLjU2LS42LS40NmwtMy44IDEuMjdjLS4zMy4xLS42LjQ3LS42Ljgzdi45aDEuMDVsMi4xNS0uN3YxLjRsLTIuMTUtLjdIMjF6TTkgMTZhMyAzIDAgMSAwIDAtNiAzIDMgMCAwIDAgMCA2em0wLTJhMSAxIDAgMSAwIDAtMiAxIDEgMCAwIDAgMCAyem0wIDQuMjVjMC0uNy41NS0xLjI1IDEuMjUtMS4yNWg4LjVjLjcgMCAxLjI1LjU1IDEuMjUgMS4yNXY1LjVjMCAuNjktLjU2IDEuMjUtMS4yNSAxLjI1aC04LjVDOS41NSAyNSA5IDI0LjQ1IDkgMjMuNzV2LTUuNXptMiAuNzVoN3Y0aC03di00em02LjUtM2MyLjUgMCA0LjUtMiA0LjUtNC41UzIwIDcgMTcuNSA3YTQuNSA0LjUgMCAwIDAgMCA5em0wLTJjMS40IDAgMi41LTEuMSAyLjUtMi41QTIuNSAyLjUgMCAwIDAgMTcuNSA5Yy0xLjM5IDAtMi41IDEuMS0yLjUgMi41czEuMSAyLjUgMi41IDIuNXoiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_05-barbershop:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTguNiAxNS4xbC00Ljc4LTguNGMtLjQyLS43LTEuNS0uNzgtMi4xLS40NmEzLjQ1IDMuNDUgMCAwIDAtMS40MiA0LjE4bDIuOCA2LjczYy4xLjI1LjI1LjUuNDEuN2wtMS4zNyAyLjM3YTMgMyAwIDEgMCAxLjUxIDEuMzhsLjA2LS4xIDEuNDktMi41N2MuNDMuMDcuOS4xMiAxLjM1LjAxbDEuNDcgMi41NmMuMDYuMS4xNC4yLjI0LjNhMyAzIDAgMCAwIDQuODQgMy4zNWwxLjAzLjZhLjk3Ljk3IDAgMCAwIDEuMzEtLjM1bC4wNS0uMDdhLjk5Ljk5IDAgMCAwLS4zNi0xLjMzTDI0IDIzLjM1VjIzYTMgMyAwIDAgMC00LjM1LTIuNjhMMTguMzEgMThjLjY5LS43NS44NC0xLjkuMjYtMi45ek0xMSAyNGExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6bTEwIDBjLjU1IDAgMS0uNDUgMS0xcy0uNDUtMS0xLTEtMSAuNDUtMSAxIC40NSAxIDEgMXptLTYuMDUtNy42MmExIDEgMCAwIDAgMS4zLjU3bC4zMi0uMTJjLjM2LS4xNS40My0uNDEuMjgtLjczTDEyLjQgOC4yNWMwLS4wMS0uNDQuOTUtLjI1IDEuNGwyLjggNi43M3oiLz48cGF0aCBkPSJNMTYuNzUgMTNsMi41LTQuNnMuMzUuNy4yNS45NmwtMi4zIDYuNzQgMS4zIDIuNCAyLjktOC40Yy41NS0xLjUtLjQtMy0xLjU0LTMuODMtLjYxLS4zMi0xLjYxLS4yMi0yLjAxLjU4TDE1IDEybDEuNzUgMXoiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-search__suggest-catalog-item_type_06-pharmacy:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjAgMTJWOGExIDEgMCAwIDAtMS0xaC02YTEgMSAwIDAgMC0xIDF2NEg4YTEgMSAwIDAgMC0xIDF2NmExIDEgMCAwIDAgMSAxaDR2NGExIDEgMCAwIDAgMSAxaDZhMSAxIDAgMCAwIDEtMXYtNGg0YTEgMSAwIDAgMCAxLTF2LTZhMSAxIDAgMCAwLTEtMWgtNHptLTIgMlY5aC00djVIOXY0aDV2NWg0di01aDV2LTRoLTV6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-search__suggest-catalog-item_type_06-pharmacy:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZD0iTTkgOXYxNGgxNFY5SDl6TTcgOWMwLTEuMS45LTIgMi0yaDE0YTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMkg5YTIgMiAwIDAgMS0yLTJWOXptNyA2aDVhMSAxIDAgMCAxIDAgMmgtNXYyaDVhMSAxIDAgMCAxIDEgMSAxIDEgMCAwIDEtMSAxaC02YTEgMSAwIDAgMS0xLTF2LThhMSAxIDAgMCAxIDEtMWg2YTEgMSAwIDAgMSAwIDJoLTV2MnoiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_07-shop:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjAgMjNoMXYxaC0xdi0xem0uNSAzYzEuNCAwIDIuNS0xLjEgMi41LTIuNVMyMS45IDIxIDIwLjUgMjEgMTggMjIuMSAxOCAyMy41czEuMSAyLjUgMi41IDIuNXpNMTEgMjNoMXYxaC0xdi0xem0uNSAzYzEuNCAwIDIuNS0xLjEgMi41LTIuNVMxMi45IDIxIDExLjUgMjEgOSAyMi4xIDkgMjMuNXMxLjEgMi41IDIuNSAyLjV6TTcgN2MtLjU1IDAtMSAuNDUtMSAxcy40NSAxIDEgMWgyLjNsMS41NSAxMGMuMS41NS42IDEgMS4xNSAxaDljLjU1IDAgMS4yLS40IDEuNC0uOWwzLjEtNi45NWMuMjUtLjY1LS4wNi0xLjE1LS43NS0xLjE1SDExLjVsLS40LTMuMzdjLS4xLS4zOC0uNC0uNjMtLjc1LS42M0g3em01IDZoMTFsLTIuMiA1aC04LjFsLS43LTV6Ii8+PC9zdmc+)}.ymaps-2-1-79-search__suggest-catalog-item_type_08-shopping-mall:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNOCAxMS4zM0M4IDEwLjYgOC42IDEwIDkuMzMgMTBoMTMuMzNjLjc0IDAgMS4zNC42IDEuMzQgMS4zM3YxMi4zNGMwIC43My0uNiAxLjMzLTEuMzQgMS4zM0g5LjM0QzguNiAyNSA4IDI0LjQgOCAyMy42N1YxMS4zM3ptMiAuNjdoMTJ2MTFIMTBWMTJ6Ii8+PHBhdGggZD0iTTE4IDEwYTIgMiAwIDAgMC00IDB2NWMwIC41NS0uNDUgMS0xIDFzLTEtLjQ1LTEtMXYtNWMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0djVjMCAuNTUtLjQ1IDEtMSAxcy0xLS40NC0xLTF2LTV6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-search__suggest-catalog-item_type_09-fitness:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTggMTdoLTR2My43NWMwIC43LS41NSAxLjI1LTEuMjUgMS4yNWgtMi41QzkuNTUgMjIgOSAyMS40NSA5IDIwLjc1VjIwSDdhMSAxIDAgMCAxLTEtMXYtNmExIDEgMCAwIDEgMS0xaDJ2LS43NWMwLS43LjU1LTEuMjUgMS4yNS0xLjI1aDIuNWMuNyAwIDEuMjUuNTUgMS4yNSAxLjI1VjE1aDR2LTMuNzVjMC0uNy41NS0xLjI1IDEuMjUtMS4yNWgyLjVjLjcgMCAxLjI1LjU1IDEuMjUgMS4yNVYxMmgyYTEgMSAwIDAgMSAxIDF2NmExIDEgMCAwIDEtMSAxaC0ydi43NWMwIC43LS41NSAxLjI1LTEuMjUgMS4yNWgtMi41Yy0uNyAwLTEuMjUtLjU1LTEuMjUtMS4yNVYxN3pNOCAxNGgxdjRIOHYtNHptMy0yaDF2OGgtMXYtOHptOSAwaDF2OGgtMXYtOHptMyAyaDF2NGgtMXYtNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_10-auto-repair:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMuMDMgMThsLjktLjI2YTIuOSAyLjkgMCAwIDEgMi44NS43bDQuMTcgNC4yYTEuMiAxLjIgMCAwIDAgMS43LTEuNjlsLTQuMi00LjE4YTIuOTMgMi45MyAwIDAgMS0uNjgtMi45bC4yNC0uODRBNS4wNyA1LjA3IDAgMCAwIDEzIDhjLS40MyAwLS4yLjAyLS4yLjAybDIuMiAyLjE0VjE1aC00Ljg0TDggMTIuODFWMTNhNS4wNyA1LjA3IDAgMCAwIDUuMDMgNXptLTYuNi03LjA3Yy40LTEuMDMgMS4zOC0xLjIgMi4xNS0uNDFMMTEgMTNoMnYtMmwtMi40OC0yLjQyYy0uNzktLjc3LS42Mi0xLjczLjQtMi4xNCAwIDAgLjYtLjQ0IDIuMDgtLjQ0YTcuMDcgNy4wNyAwIDAgMSA3IDcgNy44IDcuOCAwIDAgMS0uMzUgMS41MmMtLjA4LjI3LjAxLjY0LjIuODRsNC4yMSA0LjE4YTMuMiAzLjIgMCAwIDEtNC41MiA0LjUybC00LjE4LTQuMmEuOS45IDAgMCAwLS44NC0uMjFzLS44Mi4yOC0xLjUyLjM1YTcuMDcgNy4wNyAwIDAgMS03LTdjMC0xLjQ3LjQzLTIuMDcuNDMtMi4wN3oiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_11-gasoline:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMgMTBoOHY3aC04di03em0yIDJ2M2g0di0zaC00em0tNyA0YzAtMS4xIDItMy45IDItMy45VjlzLTQgNC44LTQgN3YxYzAgMi4yIDEuOCA0IDQgNHYtMmEyIDIgMCAwIDEtMi0ydi0xem0zLTlhMSAxIDAgMCAwLTEgMXYxNmExIDEgMCAwIDAgMSAxaDEyYTEgMSAwIDAgMCAxLTFWOGExIDEgMCAwIDAtMS0xSDExem0xIDJoMTB2MTRIMTJWOXoiLz48L3N2Zz4=)}.ymaps-2-1-79-search__suggest-catalog-item_type_12-hotel:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAgMTVoMnYtMmMwLTEuMS45LTIgMi0yaDRhMiAyIDAgMCAxIDIgMnYyaDJWOUgxMHY2em0tMiAuMzNjLTEuMi41Ny0yIDEuNzctMiAzLjE3VjI0YzAgLjU1LjQ1IDEgMSAxczEtLjQ1IDEtMXYtMmgxNnYyYzAgLjU1LjQ1IDEgMSAxczEtLjQ1IDEtMXYtNS41YzAtMS40LS44LTIuNi0yLTMuMTZWOGExIDEgMCAwIDAtMS0xSDlhMSAxIDAgMCAwLTEgMXY3LjMzem02LS4zM2g0di0yaC00djJ6bS02IDMuNWMwLS44NS42NS0xLjUgMS41LTEuNWgxM2MuODIgMCAxLjUuNjYgMS41IDEuNVYyMEg4di0xLjV6Ii8+PC9zdmc+)}'));
    });
}
, function(ym) {
    ym.modules.define('search_layout_panel', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-search_layout_panel{z-index:100;padding:1px;max-height:50px;background:#fff;-webkit-box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 8px 30px -5px rgba(0,0,0,.5);-moz-box-shadow:inset 1px 1px 10px #aaa;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 8px 30px -5px rgba(0,0,0,.5);-webkit-transform:translateY(-999px) translateY(-19999px);-moz-transform:translateY(-999px) translateY(-19999px);-ms-transform:translateY(-999px) translateY(-19999px);transform:translateY(-999px) translateY(-19999px);top:0}.ymaps-2-1-79-search_layout_panel.ymaps-2-1-79-search_layout_panel{position:absolute;box-sizing:border-box;right:0;left:0}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__layout{display:table;width:100%;border:10px solid #fff;line-height:0;position:relative;z-index:2;box-sizing:border-box}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__input{display:table-cell;width:100%}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__button{display:table-cell;width:1px;padding-left:10px}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-islets_serp-popup,.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__serp-popup.ymaps-2-1-79-popup{position:relative;z-index:1;margin:0 -1px;background:#fff}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-islets_serp-popup__tail,.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__serp-popup-tail.ymaps-2-1-79-popup__tail{display:none!important}.ymaps-2-1-79-search_layout_panel .ymaps-2-1-79-search__serp-button{right:28px}.ymaps-2-1-79-search_layout_panel_show{-webkit-animation:search_layout_panel_animation_show .25s ease-out;-moz-animation:search_layout_panel_animation_show .25s ease-out;-o-animation:search_layout_panel_animation_show .25s ease-out;animation:search_layout_panel_animation_show .25s ease-out;-webkit-animation-fill-mode:forwards;-moz-animation-fill-mode:forwards;-o-animation-fill-mode:forwards;animation-fill-mode:forwards;-ms-transform:translateY(0)}.ymaps-2-1-79-search_layout_panel_hide{-webkit-animation:search_layout_panel_animation_hide .25s ease-out;-moz-animation:search_layout_panel_animation_hide .25s ease-out;-o-animation:search_layout_panel_animation_hide .25s ease-out;animation:search_layout_panel_animation_hide .25s ease-out}@-webkit-keyframes search_layout_panel_animation_show{0%{-webkit-transform:translateY(-30px) translateY(0);transform:translateY(-30px) translateY(0);opacity:0}to{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}@-webkit-keyframes search_layout_panel_animation_hide{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}to{-webkit-transform:translateY(-30px);transform:translateY(-30px);opacity:0}}@-moz-keyframes search_layout_panel_animation_show{0%{-moz-transform:translateY(-30px);transform:translateY(-30px);opacity:0}to{-moz-transform:translateY(0);transform:translateY(0);opacity:1}}@-moz-keyframes search_layout_panel_animation_hide{0%{-moz-transform:translateY(0);transform:translateY(0);opacity:1}to{-moz-transform:translateY(-30px);transform:translateY(-30px);opacity:0}}@keyframes search_layout_panel_animation_show{0%{-webkit-transform:translateY(-30px) translateY(0);-moz-transform:translateY(-30px) translateY(0);-ms-transform:translateY(-30px) translateY(0);transform:translateY(-30px) translateY(0);opacity:0}to{-webkit-transform:translateY(0);-moz-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0);opacity:1}}@keyframes search_layout_panel_animation_hide{0%{-webkit-transform:translateY(0);-moz-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0);opacity:1}to{-webkit-transform:translateY(-30px);-moz-transform:translateY(-30px);-ms-transform:translateY(-30px);transform:translateY(-30px);opacity:0}}'));
    });
}
, function(ym) {
    ym.modules.define('searchbox', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-searchbox-button{box-shadow:0 1px 2px 1px rgba(0,0,0,.15),0 2px 5px -3px rgba(0,0,0,.15);border-color:transparent;background-color:#ffdb4d;box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:inline-block;text-align:left;height:28px}.ymaps-2-1-79-searchbox-button:hover{background-color:#ffd633;border-color:transparent}.ymaps-2-1-79-searchbox-button.ymaps-2-1-79-_pressed,.ymaps-2-1-79-searchbox-button:active{background-color:#fc0}a.ymaps-2-1-79-searchbox-button,a.ymaps-2-1-79-searchbox-button:active,a.ymaps-2-1-79-searchbox-button:hover,a.ymaps-2-1-79-searchbox-button:link,a.ymaps-2-1-79-searchbox-button:visited,a.ymaps-2-1-79-searchbox__fold-button,a.ymaps-2-1-79-searchbox__fold-button:active,a.ymaps-2-1-79-searchbox__fold-button:hover,a.ymaps-2-1-79-searchbox__fold-button:link,a.ymaps-2-1-79-searchbox__fold-button:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-searchbox-button-text{display:inline-block;position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px}.ymaps-2-1-79-searchbox-button.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-searchbox-button.ymaps-2-1-79-_disabled .ymaps-2-1-79-searchbox-button-text{opacity:.5}.ymaps-2-1-79-searchbox__normal-layout,.ymaps-2-1-79-searchbox__panel-layout{border-collapse:collapse}.ymaps-2-1-79-searchbox__input-cell{width:100%}.ymaps-2-1-79-searchbox__button-cell,.ymaps-2-1-79-searchbox__input-cell{display:table-cell;vertical-align:top;position:relative}.ymaps-2-1-79-searchbox__panel-layout .ymaps-2-1-79-searchbox__button-cell{padding-left:10px}.ymaps-2-1-79-searchbox-button{box-shadow:none}.ymaps-2-1-79-searchbox-button.ymaps-2-1-79-_pin_right{border-top-left-radius:0!important;border-bottom-left-radius:0!important;position:relative;z-index:2}.ymaps-2-1-79-searchbox-button.ymaps-2-1-79-_pin_right.ymaps-2-1-79-_checked{z-index:1}.ymaps-2-1-79-searchbox__fold-button-cell{display:table-cell;vertical-align:top;position:relative;padding-left:10px}.ymaps-2-1-79-searchbox__fold-button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:inline-block;text-align:left;height:28px;background-color:#fff;border-color:rgba(0,0,0,.2)}.ymaps-2-1-79-searchbox__fold-button-text{display:inline-block;position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px}.ymaps-2-1-79-searchbox__fold-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-searchbox__fold-button.ymaps-2-1-79-_pressed,.ymaps-2-1-79-searchbox__fold-button:active{background-color:#f3f1ed}.ymaps-2-1-79-searchbox__fold-button.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-searchbox__fold-button.ymaps-2-1-79-_disabled .ymaps-2-1-79-searchbox__fold-button-text{opacity:.5}.ymaps-2-1-79-searchbox__fold-button-icon{display:block;width:26px;height:26px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzk5OSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTNsMS0xIDEgMSA1LjUgNSAxLjUtMS41LTctNi41LTEtMS0xIDEtNyA2LjVMNi41IDE4bDUuNS01em0wIDAiLz48L3N2Zz4=) no-repeat}.ymaps-2-1-79-searchbox-input{position:relative;z-index:3;vertical-align:baseline;display:block;background:#fff;box-sizing:border-box!important;-webkit-transition:box-shadow .15s ease-out;transition:box-shadow .15s ease-out}.ymaps-2-1-79-searchbox__panel-layout .ymaps-2-1-79-searchbox-input{box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}input.ymaps-2-1-79-searchbox-input__input{display:block;width:100%;height:28px;padding:0 2px;margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:28px;background-color:transparent;background-clip:padding-box;box-sizing:border-box!important;border-top:0;border-right:0;border-bottom:0;border-left:9px solid transparent}input.ymaps-2-1-79-searchbox-input__input::-ms-clear{display:none}input.ymaps-2-1-79-searchbox-input__input:focus{outline:none!important;box-shadow:none!important}.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_focused{box-shadow:inset 0 0 0 2px #ffdb4d}.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_clear-button-is-visible .ymaps-2-1-79-searchbox-input__input{border-right:22px solid transparent}.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_list-button-is-visible .ymaps-2-1-79-searchbox-input__input{border-right:48px solid transparent}.ymaps-2-1-79-searchbox-input__clear-button{position:absolute;top:0;right:0;bottom:0;width:28px;display:none;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAgLjcxTDkuMjkgMCA1IDQuMjkuNzEgMCAwIC43MSA0LjI5IDUgMCA5LjI5bC43MS43MUw1IDUuNzEgOS4yOSAxMGwuNzEtLjcxTDUuNzEgNXoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==) center no-repeat;opacity:.3;cursor:pointer}.ymaps-2-1-79-searchbox-input__clear-button:hover,.ymaps-2-1-79-searchbox-list-button:hover{opacity:1}.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_clear-button-is-visible .ymaps-2-1-79-searchbox-input__clear-button,.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_list-button-is-visible+.ymaps-2-1-79-searchbox-list-button{display:block}.ymaps-2-1-79-searchbox-list-button{position:absolute;top:0;right:28px;bottom:0;z-index:4;display:none;width:20px;cursor:pointer;opacity:.3;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0RTcwNUE3REYxRUYxMUUyODVGREEzNUFGNzVENTc2NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0RTcwNUE3RUYxRUYxMUUyODVGREEzNUFGNzVENTc2NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjRFNzA1QTdCRjFFRjExRTI4NUZEQTM1QUY3NUQ1NzY2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjRFNzA1QTdDRjFFRjExRTI4NUZEQTM1QUY3NUQ1NzY2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+TnRszwAAAFFJREFUeNq80TEKQDEIA1AjOnkzPaxHtLTzh08zNHsgj2BmhAnYolXVmJmo6l1xlyJC3J2aOs+MyMxfY3eDNe5ZYI14Z/zyMj8eL/sjaOMSYADc4SeiEjj4YwAAAABJRU5ErkJggg==) center no-repeat}:root input.ymaps-2-1-79-searchbox-input__input,_::-webkit-full-page-media,_:future{line-height:16px}.ymaps-2-1-79-searchbox-input ::-moz-placeholder,.ymaps-2-1-79-searchbox-input__input:-moz-placeholder{text-overflow:ellipsis}.ymaps-2-1-79-searchbox-input__input[placeholder]{text-overflow:ellipsis}.ymaps-2-1-79-searchbox-input.ymaps-2-1-79-_clear-button-is-visible .ymaps-2-1-79-searchbox-input__input[placeholder]{text-overflow:clip}.ymaps-2-1-79-searchbox__normal-layout{position:relative;display:inline-block;width:315px;vertical-align:top;line-height:0}.ymaps-2-1-79-searchbox__normal-layout:after{content:\"\";position:absolute;top:0;right:0;bottom:0;left:0;box-shadow:0 1px 2px 1px rgba(0,0,0,.15),0 2px 5px -3px rgba(0,0,0,.15);border-radius:0 3px 3px 0}.ymaps-2-1-79-searchbox__normal-layout .ymaps-2-1-79-searchbox__input-cell{z-index:1}.ymaps-2-1-79-searchbox__normal-layout .ymaps-2-1-79-searchbox-input{margin-right:-2px}.ymaps-2-1-79-searchbox__normal-layout .ymaps-2-1-79-searchbox-input__clear-button{border-right:2px solid transparent}.ymaps-2-1-79-searchbox__normal-layout .ymaps-2-1-79-searchbox__button-cell{z-index:2}.ymaps-2-1-79-searchbox__normal-layout .ymaps-2-1-79-searchbox-button{width:100%;text-align:center}.ymaps-2-1-79-searchbox__panel-layout .ymaps-2-1-79-searchbox__fold-button-cell{width:1px}'));
    });
}
, function(ym) {
    ym.modules.define('traffic-info', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-traffic-info{display:block;color:#4a4a4a;text-align:left;font-family:Arial,sans-serif;line-height:24px}.ymaps-2-1-79-balloon_layout_normal .ymaps-2-1-79-traffic-info{width:286px}.ymaps-2-1-79-traffic-info__details,.ymaps-2-1-79-traffic-info__source,.ymaps-2-1-79-traffic-info__time,.ymaps-2-1-79-traffic-info__title{display:block}.ymaps-2-1-79-traffic-info__title{color:#000}.ymaps-2-1-79-traffic-info__details,.ymaps-2-1-79-traffic-info__time{color:#000;font-size:15px}.ymaps-2-1-79-traffic-info__title{margin-top:-3px;margin-bottom:3px;font-size:18px}.ymaps-2-1-79-traffic-info__source{margin-top:8px;color:#000;font-size:13px;line-height:18px}.ymaps-2-1-79-traffic-info__source-link{color:#000}a.ymaps-2-1-79-traffic-info__source-link{text-decoration:underline;cursor:pointer}a.ymaps-2-1-79-traffic-info__source-link:hover{color:#c00}'));
    });
}
, function(ym) {
    ym.modules.define('traffic_old', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('traffic', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-traffic{box-shadow:0 1px 2px 1px rgba(0,0,0,.15),0 2px 5px -3px rgba(0,0,0,.15);border-radius:3px;position:relative;display:inline-block}.ymaps-2-1-79-traffic .ymaps-2-1-79-float-button{box-shadow:none!important;white-space:nowrap;text-align:left;overflow:hidden}.ymaps-2-1-79-traffic .ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_right{overflow:visible}.ymaps-2-1-79-traffic .ymaps-2-1-79-float-button.ymaps-2-1-79-_pin_right:before{content:\'\';position:absolute;top:-1px;left:-1px;bottom:-1px;width:0;border-left:1px solid rgba(0,0,0,.15)}.ymaps-2-1-79-traffic-week-days{display:block}.ymaps-2-1-79-button_traffic_left_animation{-webkit-transition:width .3s ease-out;transition:width .3s ease-out}.ymaps-2-1-79-traffic__icon{display:inline-block;width:16px;height:16px;border:5px solid transparent;background-repeat:no-repeat;background-position:center;vertical-align:top}.ymaps-2-1-79-_disabled .ymaps-2-1-79-traffic__icon,.ymaps-2-1-79-traffic__slider-button.ymaps-2-1-79-_disabled .ymaps-2-1-79-traffic__slider-button-text{opacity:.5}.ymaps-2-1-79-traffic__icon_icon_settings{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXRoIGlkPSJhIiBkPSJNMi45OCAyLjljLjQxLS4zNS44OS0uNjIgMS40MS0uODFMNC43OC41NWEuNzIuNzIgMCAwIDEgLjctLjU1aDEuMDRjLjMzIDAgLjYyLjIzLjcuNTVsLjM5IDEuNTRjLjUyLjE5IDEgLjQ3IDEuNDEuODFsMS41NC0uNDNhLjcuNyAwIDAgMSAuODIuMzNsLjUyLjlhLjcyLjcyIDAgMCAxLS4xMi44OGwtMS4xNCAxLjFhNC43MSA0LjcxIDAgMCAxIDAgMS42NGwxLjE0IDEuMWEuNzIuNzIgMCAwIDEgLjEyLjg4bC0uNTIuOWEuNzIuNzIgMCAwIDEtLjgyLjMzbC0xLjUzLS40M2MtLjQyLjM1LS45LjYyLTEuNDIuODFsLS4zOSAxLjU0YS43Mi43MiAwIDAgMS0uNy41NUg1LjQ4YS43Mi43MiAwIDAgMS0uNy0uNTVsLS4zOS0xLjU0Yy0uNTItLjE5LTEtLjQ2LTEuNDEtLjgxbC0xLjU0LjQzYS43Mi43MiAwIDAgMS0uODItLjMzTC4xIDkuM2EuNzIuNzIgMCAwIDEgLjEyLS44OGwxLjE1LTEuMWE0LjcxIDQuNzEgMCAwIDEgMC0xLjY0TC4yMiA0LjU4QS43Mi43MiAwIDAgMSAuMSAzLjdsLjUyLS45YS43Mi43MiAwIDAgMSAuODItLjMzbDEuNTMuNDN6TTYgOC4zYTEuOCAxLjggMCAxIDAgMC0zLjYgMS44IDEuOCAwIDAgMCAwIDMuNjJ6Ii8+PC9kZWZzPjx1c2UgZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiB4bGluazpocmVmPSIjYSIvPjwvc3ZnPg==)}.ymaps-2-1-79-traffic__icon_icon_off{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjOTk5ODk4IiBkPSJNLjE3IDguMmMuMiAxLjA0IDEuMSAxLjY0IDIuOTQgMS42NCAxLS41OSAxLTYuMDYgMy44LTcuMjIuNC0uMTcuNzgtLjMgMS4xNy0uNDJhNyA3IDAgMCAwIC41LS4xNlM3Ljk3IDIgNy4yOCAyaC0uMThjLS42MiAwLS44LjA4LTEuNDUuMTVBNi40OCA2LjQ4IDAgMCAwIC40MyA2LjI3Yy0uMTIuMzYtLjIuNy0uMjUgMXYuOTJ6Ii8+PHBhdGggZmlsbD0iI2JmYmZiZiIgZD0iTTkuNTMgMTYuMDNhNy4wMSA3LjAxIDAgMSAwLTEuNDQgMGgxLjQ0eiIvPjxwYXRoIGZpbGw9IiMyNDI3MjYiIGQ9Ik03LjkzIDEuOTdsLjkuMDJhNy4wNiA3LjA2IDAgMCAxIDYuOTYgNy41OGMtMS4wMi0uMDgtMi40My0xLjQyLTIuNzYtMi41YTYuOTIgNi45MiAwIDAgMC02LjU1LTUuMDJjLjYtLjA2IDEuMDUtLjA4IDEuNDUtLjA4eiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-traffic__icon_icon_green{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjNjA3ZTQ5IiBkPSJNLjE3IDguMmMuMiAxLjA0IDEuMSAxLjY0IDIuOTQgMS42NCAxLS41OSAxLTYuMDYgMy44LTcuMjIuNC0uMTcuNzgtLjMgMS4xNy0uNDJhNyA3IDAgMCAwIC41LS4xNlM3Ljk3IDIgNy4yOCAyaC0uMThjLS42MiAwLS44LjA4LTEuNDUuMTVBNi40OCA2LjQ4IDAgMCAwIC40MyA2LjI3Yy0uMTIuMzYtLjIuNy0uMjUgMXYuOTJ6Ii8+PHBhdGggZmlsbD0iIzY5YzAzMCIgZD0iTTkuNTMgMTYuMDNhNy4wMSA3LjAxIDAgMSAwLTEuNDQgMGgxLjQ0eiIvPjxwYXRoIGZpbGw9IiMyNDI3MjYiIGQ9Ik03LjkzIDEuOTdsLjkuMDJhNy4wNiA3LjA2IDAgMCAxIDYuOTYgNy41OGMtMS4wMi0uMDgtMi40My0xLjQyLTIuNzYtMi41YTYuOTIgNi45MiAwIDAgMC02LjU1LTUuMDJjLjYtLjA2IDEuMDUtLjA4IDEuNDUtLjA4eiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-traffic__icon_icon_yellow{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjYmQ5YzRmIiBkPSJNLjE3IDguMmMuMiAxLjA0IDEuMSAxLjY0IDIuOTQgMS42NCAxLS41OSAxLTYuMDYgMy44LTcuMjIuNC0uMTcuNzgtLjMgMS4xNy0uNDJhNyA3IDAgMCAwIC41LS4xNlM3Ljk3IDIgNy4yOCAyaC0uMThjLS42MiAwLS44LjA4LTEuNDUuMTVBNi40OCA2LjQ4IDAgMCAwIC40MyA2LjI3Yy0uMTIuMzYtLjIuNy0uMjUgMXYuOTJ6Ii8+PHBhdGggZmlsbD0iI2ZmYzA0MiIgZD0iTTkuNTMgMTYuMDNhNy4wMSA3LjAxIDAgMSAwLTEuNDQgMGgxLjQ0eiIvPjxwYXRoIGZpbGw9IiMyNDI3MjYiIGQ9Ik03LjkzIDEuOTdsLjkuMDJhNy4wNiA3LjA2IDAgMCAxIDYuOTYgNy41OGMtMS4wMi0uMDgtMi40My0xLjQyLTIuNzYtMi41YTYuOTIgNi45MiAwIDAgMC02LjU1LTUuMDJjLjYtLjA2IDEuMDUtLjA4IDEuNDUtLjA4eiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-traffic__icon_icon_red{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjYTU0MzQwIiBkPSJNLjE3IDguMmMuMiAxLjA0IDEuMSAxLjY0IDIuOTQgMS42NCAxLS41OSAxLTYuMDYgMy44LTcuMjIuNC0uMTcuNzgtLjMgMS4xNy0uNDJhNyA3IDAgMCAwIC41LS4xNlM3Ljk3IDIgNy4yOCAyaC0uMThjLS42MiAwLS44LjA4LTEuNDUuMTVBNi40OCA2LjQ4IDAgMCAwIC40MyA2LjI3Yy0uMTIuMzYtLjIuNy0uMjUgMXYuOTJ6Ii8+PHBhdGggZmlsbD0iI2ZmNTg1OCIgZD0iTTkuNTMgMTYuMDNhNy4wMSA3LjAxIDAgMSAwLTEuNDQgMGgxLjQ0eiIvPjxwYXRoIGZpbGw9IiMyNDI3MjYiIGQ9Ik03LjkzIDEuOTdsLjkuMDJhNy4wNiA3LjA2IDAgMCAxIDYuOTYgNy41OGMtMS4wMi0uMDgtMi40My0xLjQyLTIuNzYtMi41YTYuOTIgNi45MiAwIDAgMC02LjU1LTUuMDJjLjYtLjA2IDEuMDUtLjA4IDEuNDUtLjA4eiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-traffic__panel{position:absolute;top:100%;right:-5px;display:block;margin-top:-9999px;white-space:normal;-webkit-transform:translate3d(0,0,0)}.ymaps-2-1-79-traffic_settings_pressed .ymaps-2-1-79-traffic__panel{display:block;margin-top:13px;-webkit-transform:translate3d(0,0,0)}.ymaps-2-1-79-traffic__tail{right:31px;display:block}.ymaps-2-1-79-traffic__panel-content{display:block;overflow-x:hidden;overflow-y:auto;min-width:40px;min-height:20px;padding:0 10px 10px;border-top:7px solid #fff;border-bottom:2px solid #fff;background:#fff}.ymaps-2-1-79-traffic__panel{-webkit-transition:width .3s ease-out;transition:width .3s ease-out}.ymaps-2-1-79-traffic__panel-show-animation{-webkit-animation:traffic__panel_show_animation_keyframe .25s ease-out;animation:traffic__panel_show_animation_keyframe .25s ease-out}.ymaps-2-1-79-traffic__panel-hide-animation{-webkit-animation:traffic__panel_hide_animation_keyframe .25s ease-out;animation:traffic__panel_hide_animation_keyframe .25s ease-out}@-webkit-keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:13px;opacity:1;-webkit-transform:scale(1,1)}}@-webkit-keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:13px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1)}}@-webkit-keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:13px;opacity:1;-webkit-transform:scale(1,1);transform:scale(1,1)}}@keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:13px;opacity:1;-webkit-transform:scale(1,1);transform:scale(1,1)}}@-webkit-keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:13px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}}@keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:13px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}}.ymaps-2-1-79-traffic__switcher{display:block;margin-bottom:8px;border-bottom:1px solid #e5e5e5;font:13px/20px Arial,Helvetica,sans-serif}.ymaps-2-1-79-traffic__switcher-item{position:relative;top:1px;display:inline-block;cursor:pointer;color:#000;border-bottom:3px solid transparent}.ymaps-2-1-79-traffic__switcher-item:hover{color:#c00}.ymaps-2-1-79-traffic__switcher-item.ymaps-2-1-79-traffic__switcher-item_selected_yes{cursor:default;color:#000;border-bottom-color:#000}.ymaps-2-1-79-traffic__switcher-item:not(:last-child){margin-right:18px}.ymaps-2-1-79-traffic__tabs{box-sizing:border-box!important;display:block;height:20px;margin-top:0;margin-right:-4px;margin-left:-4px;text-align:justify;line-height:20px}.ymaps-2-1-79-traffic__tabs-justifier{display:inline-block;width:100%}.ymaps-2-1-79-traffic__tab{font:11px/1 Verdana,sans-serif;color:#999;cursor:pointer}.ymaps-2-1-79-traffic__tab:hover{color:#c00}.ymaps-2-1-79-traffic__tab.ymaps-2-1-79-traffic__tab_selected_yes{cursor:default;color:#000}.ymaps-2-1-79-traffic__tab-text{padding:4px}.ymaps-2-1-79-traffic__checkbox-cell{display:block;margin-top:12px;font-size:13px}.ymaps-2-1-79-traffic__slider-button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:inline-block;text-align:left;height:28px;background-color:#fff;border-color:rgba(0,0,0,.2)}a.ymaps-2-1-79-traffic__slider-button,a.ymaps-2-1-79-traffic__slider-button:active,a.ymaps-2-1-79-traffic__slider-button:hover,a.ymaps-2-1-79-traffic__slider-button:link,a.ymaps-2-1-79-traffic__slider-button:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-traffic__slider-button-text{position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px}.ymaps-2-1-79-traffic__slider-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-traffic__slider-button.ymaps-2-1-79-_pressed,.ymaps-2-1-79-traffic__slider-button:active{background-color:#f3f1ed}.ymaps-2-1-79-traffic__slider-button.ymaps-2-1-79-_disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-traffic__slider{position:relative;display:block;margin-bottom:10px;-webkit-user-select:none}.ymaps-2-1-79-traffic__slider-scale{position:relative;display:block;height:16px;margin:4px 0}.ymaps-2-1-79-traffic__slider-body{position:relative;display:block;line-height:0}.ymaps-2-1-79-traffic__slider-track{position:absolute;top:50%;display:block;cursor:pointer;right:1px;left:1px;height:6px;margin-top:-3px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);border-radius:3px;background-color:rgba(0,0,0,.05)}.ymaps-2-1-79-traffic__slider-button{position:relative}.ymaps-2-1-79-traffic__slider-button-text{display:inline-block;padding:0;width:46px;text-align:center}.ymaps-2-1-79-traffic__slider-label{position:absolute;color:#999;font:11px Verdana,sans-serif}.ymaps-2-1-79-traffic__slider-label_type_center{right:25%;left:25%;text-align:center}.ymaps-2-1-79-traffic__slider-label_type_right{right:0}.ymaps-2-1-79-traffic__hint{position:relative;display:block;margin-top:10px;padding:10px;background:#e5e5e5}.ymaps-2-1-79-traffic__hint-text{display:block;padding-right:10px;font:11px/16px Verdana,sans-serif}.ymaps-2-1-79-traffic__hint-close{position:absolute;top:3px;right:3px;display:block;width:13px;height:13px;cursor:pointer;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSI+PHBhdGggZD0iTTEuNSAxLjVsNyA3TTguNSAxLjVsLTcgNyIvPjwvZz48L3N2Zz4=) center no-repeat;opacity:.3}.ymaps-2-1-79-traffic__hint-close:hover{opacity:1}.ymaps-2-1-79-traffic .ymaps-2-1-79-error-message{margin-top:16px;background-repeat:no-repeat;background-position:10px 2px}.ymaps-2-1-79-traffic__link{color:#04b;cursor:pointer}.ymaps-2-1-79-traffic__detailed-link a:hover,.ymaps-2-1-79-traffic__link:hover{color:#c00}.ymaps-2-1-79-traffic__detailed-link{margin-top:16px;display:block}.ymaps-2-1-79-traffic__detailed-link a{color:#04b;cursor:pointer;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px}'));
    });
}
, function(ym) {
    ym.modules.define('_transport-pin_size_large', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-transport-pin_size_large{margin-top:-39px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__body{margin-left:-15px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__body::after{margin:4px 0 -4px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__tail{bottom:-12px;left:-3px;width:4px;height:13px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label{width:28px;height:28px;border:2px solid}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__text{padding-right:13px;padding-left:5px;font:15px/28px Arial,sans-serif}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-left:-14px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_2{width:29px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_3{width:43px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_4{width:57px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_5{width:71px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_6{width:85px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_7{width:99px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_2 .ymaps-2-1-79-transport-pin__body{width:58px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_3 .ymaps-2-1-79-transport-pin__body{width:86px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_4 .ymaps-2-1-79-transport-pin__body{width:114px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_5 .ymaps-2-1-79-transport-pin__body{width:142px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_6 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_7 .ymaps-2-1-79-transport-pin__body{width:198px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_8{width:64px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_9{width:71px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_10{width:78px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_11{width:85px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_12{width:92px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_13{width:99px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_14{width:106px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_15,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more{width:113px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_8 .ymaps-2-1-79-transport-pin__body{width:128px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_9 .ymaps-2-1-79-transport-pin__body{width:142px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_10 .ymaps-2-1-79-transport-pin__body{width:156px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_11 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_12 .ymaps-2-1-79-transport-pin__body{width:184px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_13 .ymaps-2-1-79-transport-pin__body{width:198px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_14 .ymaps-2-1-79-transport-pin__body{width:212px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_15 .ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__body{width:226px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label{margin-left:-28px}'));
    });
}
, function(ym) {
    ym.modules.define('_transport-pin_size_small', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-transport-pin_size_small{margin-top:-32px;height:26px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__body{margin-left:-13px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__body::after{margin:3px 0 -3px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__tail{bottom:-8px;left:-2px;width:2px;height:9px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label{width:24px;height:24px;border:2px solid}.ymaps-2-1-79-transport-pin_labels_many.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_labels_many.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-right:0;margin-left:-2px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__text{padding-right:9px;padding-left:3px;font:13px/24px Arial,sans-serif}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label{margin-right:0}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-left:-12px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_2{width:24px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_3{width:35px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_4{width:46px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_5{width:57px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_6{width:68px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_7{width:79px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_2 .ymaps-2-1-79-transport-pin__body{width:48px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_3 .ymaps-2-1-79-transport-pin__body{width:70px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_4 .ymaps-2-1-79-transport-pin__body{width:92px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_5 .ymaps-2-1-79-transport-pin__body{width:114px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_6 .ymaps-2-1-79-transport-pin__body{width:136px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_7 .ymaps-2-1-79-transport-pin__body{width:158px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_8{width:55px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_9{width:61px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_10{width:67px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_11{width:73px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_12{width:79px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_13{width:85px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_14{width:91px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_15,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more{width:97px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_8 .ymaps-2-1-79-transport-pin__body{width:110px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_9 .ymaps-2-1-79-transport-pin__body{width:122px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_10 .ymaps-2-1-79-transport-pin__body{width:134px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_11 .ymaps-2-1-79-transport-pin__body{width:146px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_12 .ymaps-2-1-79-transport-pin__body{width:158px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_13 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_14 .ymaps-2-1-79-transport-pin__body{width:182px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_15 .ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__body{width:194px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label{margin-left:-24px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__icon{margin-top:-1px}'));
    });
}
, function(ym) {
    ym.modules.define('transport-pin', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-transport-pin{position:absolute}.ymaps-2-1-79-transport-pin__body{position:relative;display:block;border:1px solid rgba(0,0,0,.08);background-color:#fff;white-space:nowrap}.ymaps-2-1-79-transport-pin__body::after{content:\'\';position:absolute}@media print{.ymaps-2-1-79-transport-pin__body{overflow:hidden}.ymaps-2-1-79-transport-pin__body:before{content:\'\';position:absolute;z-index:-1;left:0;height:0;width:9999px;border-bottom:99px solid #fff}}.ymaps-2-1-79-transport-pin .ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin .ymaps-2-1-79-transport-pin__body::after,.ymaps-2-1-79-transport-pin .ymaps-2-1-79-transport-pin__label{box-sizing:border-box;border-radius:20px}.ymaps-2-1-79-transport-pin__body::after{top:0;right:0;bottom:0;left:0;z-index:-1;background:rgba(0,0,0,.08)}.ymaps-2-1-79-transport-pin__tail{position:absolute;border:1px solid rgba(0,0,0,.08);border-top:0;border-radius:0 0 4px 4px}@media print{.ymaps-2-1-79-transport-pin__tail{overflow:hidden}.ymaps-2-1-79-transport-pin__tail:before{content:\'\';position:absolute;z-index:-1;left:0;height:0;width:99px;border-bottom:99px solid #fff}}.ymaps-2-1-79-transport-pin__tail:before{top:-1px;right:0;left:0;z-index:1;height:0;border-top:3px solid}.ymaps-2-1-79-transport-pin__label{position:relative;z-index:2;display:inline-block;background-position:center;background-repeat:no-repeat;vertical-align:top}.ymaps-2-1-79-transport-pin__icon{position:absolute;top:4px;left:4px;bottom:4px;right:4px}.ymaps-2-1-79-transport-pin__text{display:inline-block;vertical-align:top}.ymaps-2-1-79-transport-pin.ymaps-2-1-79-transport-pin_labels_many .ymaps-2-1-79-transport-pin__body{margin-left:-100%}.ymaps-2-1-79-transport-pin_labels_many .ymaps-2-1-79-transport-pin__text{display:none}.ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_labels_many .ymaps-2-1-79-transport-pin__label{background-clip:padding-box}@media print{.ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_labels_many .ymaps-2-1-79-transport-pin__label{background-clip:padding-box}}.ymaps-2-1-79-transport-pin__icon{background-position:center;background-repeat:no-repeat}.ymaps-2-1-79-transport-pin__label_icon_bus,.ymaps-2-1-79-transport-pin_tail_bus .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_bus .ymaps-2-1-79-transport-pin__tail:before{background-color:#71b732;color:#71b732}.ymaps-2-1-79-transport-pin__label_icon_minibus,.ymaps-2-1-79-transport-pin_tail_minibus .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_minibus .ymaps-2-1-79-transport-pin__tail:before{background-color:#b33ea9;color:#b33ea9}.ymaps-2-1-79-transport-pin__label_icon_tram,.ymaps-2-1-79-transport-pin_tail_tram .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_tram .ymaps-2-1-79-transport-pin__tail:before{background-color:#f33;color:#f33}.ymaps-2-1-79-transport-pin__label_icon_troll,.ymaps-2-1-79-transport-pin_tail_troll .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_troll .ymaps-2-1-79-transport-pin__tail:before{background-color:#4296ea;color:#4296ea}.ymaps-2-1-79-transport-pin__label_icon_train,.ymaps-2-1-79-transport-pin_tail_train .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_train .ymaps-2-1-79-transport-pin__tail:before{background-color:#666;color:#666}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_bus .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAgMTF2LjdhLjMuMyAwIDAgMS0uMy4zSDguM2EuMy4zIDAgMCAxLS4zLS4zVjExSDR2LjdhLjMuMyAwIDAgMS0uMy4zSDIuM2EuMy4zIDAgMCAxLS4zLS4zVjExaC0uNDlhLjUxLjUxIDAgMCAxLS41MS0uNVYxLjMxYS45My45MyAwIDAgMSAuNzMtLjlTMy42MSAwIDYgMGMyLjM5IDAgNC4yNi40MSA0LjI2LjQxYS45My45MyAwIDAgMSAuNzQuODl2OS4yYS41LjUgMCAwIDEtLjUxLjVIMTB6TTIuMjUgM2EuMjUuMjUgMCAwIDAtLjI1LjI1djMuNWMwIC4xNC4xMS4yNS4yNS4yNWg3LjVjLjE0IDAgLjI1LS4xMi4yNS0uMjV2LTMuNUEuMjUuMjUgMCAwIDAgOS43NSAzaC03LjV6TTUgMWEuNS41IDAgMCAwIDAgMWgyYS41LjUgMCAwIDAgMC0xSDV6TTMgOGExIDEgMCAxIDAgMCAyIDEgMSAwIDAgMCAwLTJ6bTYgMGExIDEgMCAxIDAgMCAyIDEgMSAwIDAgMCAwLTJ6Ii8+PC9zdmc+);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAgMTF2LjdhLjMuMyAwIDAgMS0uMy4zSDguM2EuMy4zIDAgMCAxLS4zLS4zVjExSDR2LjdhLjMuMyAwIDAgMS0uMy4zSDIuM2EuMy4zIDAgMCAxLS4zLS4zVjExaC0uNDlhLjUxLjUxIDAgMCAxLS41MS0uNVYxLjMxYS45My45MyAwIDAgMSAuNzMtLjlTMy42MSAwIDYgMGMyLjM5IDAgNC4yNi40MSA0LjI2LjQxYS45My45MyAwIDAgMSAuNzQuODl2OS4yYS41LjUgMCAwIDEtLjUxLjVIMTB6TTIuMjUgM2EuMjUuMjUgMCAwIDAtLjI1LjI1djMuNWMwIC4xNC4xMS4yNS4yNS4yNWg3LjVjLjE0IDAgLjI1LS4xMi4yNS0uMjV2LTMuNUEuMjUuMjUgMCAwIDAgOS43NSAzaC03LjV6TTUgMWEuNS41IDAgMCAwIDAgMWgyYS41LjUgMCAwIDAgMC0xSDV6TTMgOGExIDEgMCAxIDAgMCAyIDEgMSAwIDAgMCAwLTJ6bTYgMGExIDEgMCAxIDAgMCAyIDEgMSAwIDAgMCAwLTJ6Ii8+PC9zdmc+)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_bus .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMgMTV2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZoLTIuMjhhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVINnYuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNkgzLjM2YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1aC0uMzlhLjYxLjYxIDAgMCAxLS42MS0uNlYzLjI3YzAtLjUyLjM3LS45Ny44OC0xLjA4IDAgMCAyLjI1LS4yOSA1LjEyLS4yOXM1LjExLjMgNS4xMS4zYy41MS4xLjg4LjU0Ljg5IDEuMDZWMTQuNGEuNi42IDAgMCAxLS42MS42SDEzek0zLjMgNWEuMy4zIDAgMCAwLS4zLjN2NC40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjUuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMy4xOS0yYS41LjUgMCAwIDAtLjQ5LjVjMCAuMjguMjEuNS40OS41aDMuMDJhLjUuNSAwIDAgMCAuNDktLjUuNS41IDAgMCAwLS40OS0uNUg2LjQ5ek00LjUgMTEuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6Ii8+PC9zdmc+);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTMgMTV2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZoLTIuMjhhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVINnYuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNkgzLjM2YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1aC0uMzlhLjYxLjYxIDAgMCAxLS42MS0uNlYzLjI3YzAtLjUyLjM3LS45Ny44OC0xLjA4IDAgMCAyLjI1LS4yOSA1LjEyLS4yOXM1LjExLjMgNS4xMS4zYy41MS4xLjg4LjU0Ljg5IDEuMDZWMTQuNGEuNi42IDAgMCAxLS42MS42SDEzek0zLjMgNWEuMy4zIDAgMCAwLS4zLjN2NC40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjUuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMy4xOS0yYS41LjUgMCAwIDAtLjQ5LjVjMCAuMjguMjEuNS40OS41aDMuMDJhLjUuNSAwIDAgMCAuNDktLjUuNS41IDAgMCAwLS40OS0uNUg2LjQ5ek00LjUgMTEuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6Ii8+PC9zdmc+)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_minibus .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNSAxMUgxMHYuN2EuMy4zIDAgMCAxLS4zLjNIOC4zYS4zLjMgMCAwIDEtLjMtLjNWMTFINC4wM3YuN2EuMy4zIDAgMCAxLS4zLjNIMi4zYS4zLjMgMCAwIDEtLjMtLjNWMTFoLS41YS41LjUgMCAwIDEtLjUtLjV2LTlDMSAwIDQgMCA2IDBzNSAwIDUgMS41djlhLjUuNSAwIDAgMS0uNS41ek0yLjI1IDdoNy41YS4yNS4yNSAwIDAgMCAuMjUtLjI2VjUuMjZBLjI1LjI1IDAgMCAwIDkuNzUgNWgtNy41YS4yNS4yNSAwIDAgMC0uMjUuMjZ2MS40OGMwIC4xNC4xMS4yNi4yNS4yNnpNMiA5YTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMHptNiAwYTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMHptLjQtNi41djEuNkgxMFYyLjVIOC40ek02LjguOXYxLjZoMS42Vi45SDYuOHpNMy42Ljl2MS42aDEuNlYuOUgzLjZ6bTEuNiAxLjZ2MS42aDEuNlYyLjVINS4yek0yIDIuNXYxLjZoMS42VjIuNUgyeiIvPjwvc3ZnPg==);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNSAxMUgxMHYuN2EuMy4zIDAgMCAxLS4zLjNIOC4zYS4zLjMgMCAwIDEtLjMtLjNWMTFINC4wM3YuN2EuMy4zIDAgMCAxLS4zLjNIMi4zYS4zLjMgMCAwIDEtLjMtLjNWMTFoLS41YS41LjUgMCAwIDEtLjUtLjV2LTlDMSAwIDQgMCA2IDBzNSAwIDUgMS41djlhLjUuNSAwIDAgMS0uNS41ek0yLjI1IDdoNy41YS4yNS4yNSAwIDAgMCAuMjUtLjI2VjUuMjZBLjI1LjI1IDAgMCAwIDkuNzUgNWgtNy41YS4yNS4yNSAwIDAgMC0uMjUuMjZ2MS40OGMwIC4xNC4xMS4yNi4yNS4yNnpNMiA5YTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMHptNiAwYTEgMSAwIDEgMCAyIDAgMSAxIDAgMSAwLTIgMHptLjQtNi41djEuNkgxMFYyLjVIOC40ek02LjguOXYxLjZoMS42Vi45SDYuOHpNMy42Ljl2MS42aDEuNlYuOUgzLjZ6bTEuNiAxLjZ2MS42aDEuNlYyLjVINS4yek0yIDIuNXYxLjZoMS42VjIuNUgyeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_minibus .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiAxNC40VjIuNUMyIC43IDUuNi43IDggLjdzNiAwIDYgMS44djExLjlhLjYuNiAwIDAgMS0uNjEuNkgxM3YuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNmgtMi4yOGEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNUg2di42NGEuMzYuMzYgMCAwIDEtLjM2LjM2SDMuMzZhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVoLS4zOWEuNjEuNjEgMCAwIDEtLjYxLS42ek0zLjMgN2EuMy4zIDAgMCAwLS4zLjN2Mi40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjcuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMS4yIDQuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6TTExIDR2MmgyVjRoLTJ6TTkgMnYyaDJWMkg5ek01IDJ2MmgyVjJINXptMiAydjJoMlY0SDd6TTMgNHYyaDJWNEgzeiIvPjwvc3ZnPg==);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiAxNC40VjIuNUMyIC43IDUuNi43IDggLjdzNiAwIDYgMS44djExLjlhLjYuNiAwIDAgMS0uNjEuNkgxM3YuNjRhLjM2LjM2IDAgMCAxLS4zNi4zNmgtMi4yOGEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNUg2di42NGEuMzYuMzYgMCAwIDEtLjM2LjM2SDMuMzZhLjM1LjM1IDAgMCAxLS4zNi0uMzZWMTVoLS4zOWEuNjEuNjEgMCAwIDEtLjYxLS42ek0zLjMgN2EuMy4zIDAgMCAwLS4zLjN2Mi40YzAgLjE3LjEzLjMuMy4zaDkuNGEuMy4zIDAgMCAwIC4zLS4zVjcuM2EuMy4zIDAgMCAwLS4zLS4zSDMuM3ptMS4yIDQuMmExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6bTcgMGExLjMgMS4zIDAgMSAwIDAgMi42IDEuMyAxLjMgMCAwIDAgMC0yLjZ6TTExIDR2MmgyVjRoLTJ6TTkgMnYyaDJWMkg5ek01IDJ2MmgyVjJINXptMiAydjJoMlY0SDd6TTMgNHYyaDJWNEgzeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_pedestrian .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_pedestrian .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDUgNy43bC4wOS0xLjNjLjcyLjU5IDEuNzUgMS4zNyAxLjgzIDEuNDJhLjUuNSAwIDAgMSAuMTUuNzMuNTcuNTcgMCAwIDEtLjc1LjE0Yy0uMTQtLjA5LTEtLjctMS4zMi0xem0tNC4yLTEuM2MuMS0uMTkgMS4wMy0uNjEgMS4wMy0uNjFMNi41MyA4LjdjLS4wNC4zNS4xMi44LjM3IDEuMDZsMi4yIDIuMTJhLjQ3LjQ3IDAgMCAxIC4xLjE3czEuMzggMy4zIDEuNDMgMy40OGEuNjcuNjcgMCAwIDAgLjguNDQuNjQuNjQgMCAwIDAgLjQ4LS43N2wtMS4yOS0zLjgyYS43OS43OSAwIDAgMC0uMS0uMTdsLTEuNjYtMi4yYS4zLjMgMCAwIDEtLjA1LS4xOHMuMjMtMy40LjIzLTQuMDZjMC0uNjUtLjU5LS45Mi0uOTEtLjkyLTEuMDkgMC0zLjI4IDEuNjQtMy40MyAyLjAyTDMuODIgOC4xYy0uMTEuMjcuMDUuNTcuMzMuNjYuMjguMS42LS4wNS43LS4zMi4wNy0uMTYuOTItMS45NS45OC0yLjA1aC4wMXptMS45IDYuMDhsLTEuMy0xLjI3LTIuMDQgMy44OGEuNjEuNjEgMCAwIDAgLjMuODRjLjMyLjE1LjcyLjA0Ljg4LS4yOC4xLS4xOCAyLjE1LTMuMTcgMi4xNS0zLjE3em0yLTExLjEyYTEuMzYgMS4zNiAwIDEgMC0yLjcyIDAgMS4zNiAxLjM2IDAgMCAwIDIuNzIgMHoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDUgNy43bC4wOS0xLjNjLjcyLjU5IDEuNzUgMS4zNyAxLjgzIDEuNDJhLjUuNSAwIDAgMSAuMTUuNzMuNTcuNTcgMCAwIDEtLjc1LjE0Yy0uMTQtLjA5LTEtLjctMS4zMi0xem0tNC4yLTEuM2MuMS0uMTkgMS4wMy0uNjEgMS4wMy0uNjFMNi41MyA4LjdjLS4wNC4zNS4xMi44LjM3IDEuMDZsMi4yIDIuMTJhLjQ3LjQ3IDAgMCAxIC4xLjE3czEuMzggMy4zIDEuNDMgMy40OGEuNjcuNjcgMCAwIDAgLjguNDQuNjQuNjQgMCAwIDAgLjQ4LS43N2wtMS4yOS0zLjgyYS43OS43OSAwIDAgMC0uMS0uMTdsLTEuNjYtMi4yYS4zLjMgMCAwIDEtLjA1LS4xOHMuMjMtMy40LjIzLTQuMDZjMC0uNjUtLjU5LS45Mi0uOTEtLjkyLTEuMDkgMC0zLjI4IDEuNjQtMy40MyAyLjAyTDMuODIgOC4xYy0uMTEuMjcuMDUuNTcuMzMuNjYuMjguMS42LS4wNS43LS4zMi4wNy0uMTYuOTItMS45NS45OC0yLjA1aC4wMXptMS45IDYuMDhsLTEuMy0xLjI3LTIuMDQgMy44OGEuNjEuNjEgMCAwIDAgLjMuODRjLjMyLjE1LjcyLjA0Ljg4LS4yOC4xLS4xOCAyLjE1LTMuMTcgMi4xNS0zLjE3em0yLTExLjEyYTEuMzYgMS4zNiAwIDEgMC0yLjcyIDAgMS4zNiAxLjM2IDAgMCAwIDIuNzIgMHoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_train .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNi41IDBhMS41IDEuNSAwIDAgMSAxLjQzIDEuMDVDOS4zNyAxLjEzIDExIDEuMzYgMTEgMnY1LjVsLS41IDItLjkuOS43NS43NWEuNS41IDAgMCAxLS43LjdMNy43NyAxMEg0LjIzbC0xLjg4IDEuODVhLjUuNSAwIDAgMS0uNy0uNzFsLjc1LS43NC0uOS0uOS0uNS0yVjJjMC0uNjQgMS42My0uODcgMy4wNy0uOTVBMS41IDEuNSAwIDAgMSA1LjUgMGgxem0zLjIgNmEuMy4zIDAgMCAwIC4zLS4zVjMuM2EuMy4zIDAgMCAwLS4zLS4zSDIuM2EuMy4zIDAgMCAwLS4zLjN2Mi40YS4zLjMgMCAwIDAgLjMuM2g3LjR6TTkgOWExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6TTMgOWExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6bTIuNS04YS41LjUgMCAwIDAgMCAxaDFhLjUuNSAwIDAgMCAwLTFoLTF6Ii8+PC9zdmc+);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNi41IDBhMS41IDEuNSAwIDAgMSAxLjQzIDEuMDVDOS4zNyAxLjEzIDExIDEuMzYgMTEgMnY1LjVsLS41IDItLjkuOS43NS43NWEuNS41IDAgMCAxLS43LjdMNy43NyAxMEg0LjIzbC0xLjg4IDEuODVhLjUuNSAwIDAgMS0uNy0uNzFsLjc1LS43NC0uOS0uOS0uNS0yVjJjMC0uNjQgMS42My0uODcgMy4wNy0uOTVBMS41IDEuNSAwIDAgMSA1LjUgMGgxem0zLjIgNmEuMy4zIDAgMCAwIC4zLS4zVjMuM2EuMy4zIDAgMCAwLS4zLS4zSDIuM2EuMy4zIDAgMCAwLS4zLjN2Mi40YS4zLjMgMCAwIDAgLjMuM2g3LjR6TTkgOWExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6TTMgOWExIDEgMCAxIDAgMC0yIDEgMSAwIDAgMCAwIDJ6bTIuNS04YS41LjUgMCAwIDAgMCAxaDFhLjUuNSAwIDAgMCAwLTFoLTF6Ii8+PC9zdmc+)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_train .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOC42LjdhMS44IDEuOCAwIDAgMSAxLjcyIDEuMjZjMS43Mi4xIDMuNjguMzggMy42OCAxLjE0djcuOGwtLjYgMi40LTEuMDggMS4wOC42OC42MmEuNi42IDAgMCAxLS44NC44NEwxMC4yMiAxNEg1Ljc3bC0xLjkzIDEuODVBLjYuNiAwIDAgMSAzIDE1bC42OC0uNjJMMi42IDEzLjMgMiAxMC45VjMuMWMwLS43NyAxLjk2LTEuMDQgMy42OC0xLjE0QTEuOCAxLjggMCAwIDEgNy40LjdoMS4yek0xMi42NCA5YS4zNi4zNiAwIDAgMCAuMzYtLjM2VjQuMzZhLjM2LjM2IDAgMCAwLS4zNi0uMzZIMy4zNmEuMzYuMzYgMCAwIDAtLjM2LjM2djQuMjhjMCAuMi4xNi4zNi4zNi4zNmg5LjI4em0tMS4xNCAzLjhhMS4zIDEuMyAwIDEgMCAwLTIuNiAxLjMgMS4zIDAgMCAwIDAgMi42em0tNyAwYTEuMyAxLjMgMCAxIDAgMC0yLjYgMS4zIDEuMyAwIDAgMCAwIDIuNnpNNy40IDEuOWEuNi42IDAgMSAwIDAgMS4yaDEuMmEuNi42IDAgMSAwIDAtMS4ySDcuNHoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOC42LjdhMS44IDEuOCAwIDAgMSAxLjcyIDEuMjZjMS43Mi4xIDMuNjguMzggMy42OCAxLjE0djcuOGwtLjYgMi40LTEuMDggMS4wOC42OC42MmEuNi42IDAgMCAxLS44NC44NEwxMC4yMiAxNEg1Ljc3bC0xLjkzIDEuODVBLjYuNiAwIDAgMSAzIDE1bC42OC0uNjJMMi42IDEzLjMgMiAxMC45VjMuMWMwLS43NyAxLjk2LTEuMDQgMy42OC0xLjE0QTEuOCAxLjggMCAwIDEgNy40LjdoMS4yek0xMi42NCA5YS4zNi4zNiAwIDAgMCAuMzYtLjM2VjQuMzZhLjM2LjM2IDAgMCAwLS4zNi0uMzZIMy4zNmEuMzYuMzYgMCAwIDAtLjM2LjM2djQuMjhjMCAuMi4xNi4zNi4zNi4zNmg5LjI4em0tMS4xNCAzLjhhMS4zIDEuMyAwIDEgMCAwLTIuNiAxLjMgMS4zIDAgMCAwIDAgMi42em0tNyAwYTEuMyAxLjMgMCAxIDAgMC0yLjYgMS4zIDEuMyAwIDAgMCAwIDIuNnpNNy40IDEuOWEuNi42IDAgMSAwIDAgMS4yaDEuMmEuNi42IDAgMSAwIDAtMS4ySDcuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_tram .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMSA0YzAtLjU1LjQzLTEuMTMuOTYtMS4yOUMxLjk2IDIuNzEgNCAyIDYgMnM0LjA2LjcyIDQuMDYuNzJjLjUyLjE1Ljk0Ljc0Ljk0IDEuMjh2NmEyIDIgMCAwIDEtMiAySDNhMiAyIDAgMCAxLTItMlY0em0zLjUtLjVBLjUuNSAwIDAgMCA1IDRoMmEuNS41IDAgMCAwIDAtMUg1YS41LjUgMCAwIDAtLjUuNXpNMi4xMiA1Ljk5VjZsLjI2IDFjLjA2LjU1LjU3Ljk5IDEuMTIuOTloNWMuNTYgMCAxLjA2LS40NCAxLjEyLS45OWwuMjYtMS4wMUEuODcuODcgMCAwIDAgOSA1SDNhLjg2Ljg2IDAgMCAwLS44OC45OXpNMy41IDExYTEgMSAwIDEgMCAwLTIgMSAxIDAgMCAwIDAgMnptNSAwYTEgMSAwIDEgMCAwLTIgMSAxIDAgMCAwIDAgMnpNOSAwYS41LjUgMCAwIDEgMCAxSDNhLjUuNSAwIDAgMSAwLTFoNnoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMSA0YzAtLjU1LjQzLTEuMTMuOTYtMS4yOUMxLjk2IDIuNzEgNCAyIDYgMnM0LjA2LjcyIDQuMDYuNzJjLjUyLjE1Ljk0Ljc0Ljk0IDEuMjh2NmEyIDIgMCAwIDEtMiAySDNhMiAyIDAgMCAxLTItMlY0em0zLjUtLjVBLjUuNSAwIDAgMCA1IDRoMmEuNS41IDAgMCAwIDAtMUg1YS41LjUgMCAwIDAtLjUuNXpNMi4xMiA1Ljk5VjZsLjI2IDFjLjA2LjU1LjU3Ljk5IDEuMTIuOTloNWMuNTYgMCAxLjA2LS40NCAxLjEyLS45OWwuMjYtMS4wMUEuODcuODcgMCAwIDAgOSA1SDNhLjg2Ljg2IDAgMCAwLS44OC45OXpNMy41IDExYTEgMSAwIDEgMCAwLTIgMSAxIDAgMCAwIDAgMnptNSAwYTEgMSAwIDEgMCAwLTIgMSAxIDAgMCAwIDAgMnpNOSAwYS41LjUgMCAwIDEgMCAxSDNhLjUuNSAwIDAgMSAwLTFoNnoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_tram .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiA1YzAtLjY2LjUyLTEuMzYgMS4xNS0xLjU1IDAgMCAyLjQ1LS44NSA0Ljg1LS44NXM0Ljg3Ljg2IDQuODcuODZBMS43IDEuNyAwIDAgMSAxNCA1djguNWMwIDEuMzItMS4wNyAyLjUtMi40IDIuNUg0LjRDMy4wNyAxNiAyIDE0LjgyIDIgMTMuNVY1em00LS41YzAgLjI3LjIyLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OWEuNS41IDAgMCAwLS40OS41ek0zLjYgNi4zNGMtLjIxLjIzLS4zLjU0LS4yNi44NmwuMzIgMi40Yy4wNy42Ni42OCAxLjQgMS4zNCAxLjRoNmMuNjcgMCAxLjI3LS43NCAxLjM0LTEuNGwuMzItMi40MmMuMDctLjY2LS40LTEuMTgtMS4wNi0xLjE4SDQuNGExLjAzIDEuMDMgMCAwIDAtLjguMzR6TTUgMTQuN2ExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6bTYgMGExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6TTEyIC41YS41LjUgMCAwIDEtLjUuNWgtN0EuNS41IDAgMCAxIDQgLjVjMC0uMjcuMjItLjUuNS0uNWg3Yy4yNyAwIC41LjIyLjUuNXoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMiA1YzAtLjY2LjUyLTEuMzYgMS4xNS0xLjU1IDAgMCAyLjQ1LS44NSA0Ljg1LS44NXM0Ljg3Ljg2IDQuODcuODZBMS43IDEuNyAwIDAgMSAxNCA1djguNWMwIDEuMzItMS4wNyAyLjUtMi40IDIuNUg0LjRDMy4wNyAxNiAyIDE0LjgyIDIgMTMuNVY1em00LS41YzAgLjI3LjIyLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OWEuNS41IDAgMCAwLS40OS41ek0zLjYgNi4zNGMtLjIxLjIzLS4zLjU0LS4yNi44NmwuMzIgMi40Yy4wNy42Ni42OCAxLjQgMS4zNCAxLjRoNmMuNjcgMCAxLjI3LS43NCAxLjM0LTEuNGwuMzItMi40MmMuMDctLjY2LS40LTEuMTgtMS4wNi0xLjE4SDQuNGExLjAzIDEuMDMgMCAwIDAtLjguMzR6TTUgMTQuN2ExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6bTYgMGExLjIgMS4yIDAgMSAwIDAtMi40IDEuMiAxLjIgMCAwIDAgMCAyLjR6TTEyIC41YS41LjUgMCAwIDEtLjUuNWgtN0EuNS41IDAgMCAxIDQgLjVjMC0uMjcuMjItLjUuNS0uNWg3Yy4yNyAwIC41LjIyLjUuNXoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_troll .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS45MSAyLjVjLjA3IDAgMS0uMjMgMi4yMi0uMzhMNS4wNS4yOGEuNS41IDAgMCAxIC45LjQ0bC0uNjUgMS4zYTE0LjMgMTQuMyAwIDAgMSAxLjg3LjAzTDguMDUuMjhhLjUuNSAwIDAgMSAuOS40NGwtLjczIDEuNDVjMS4wNC4xNCAxLjgxLjMzIDEuODguMzMuMzIuMDguOS40OC45Ljk4djcuMDJhLjUuNSAwIDAgMS0uNS41SDEwdi43YS4zLjMgMCAwIDEtLjMuM0g4LjNhLjMuMyAwIDAgMS0uMy0uM1YxMUg0di43YS4zLjMgMCAwIDEtLjMuM0gyLjNhLjMuMyAwIDAgMS0uMy0uM1YxMWgtLjVhLjUuNSAwIDAgMS0uNS0uNVYzLjQ4YzAtLjU4LjU4LS45LjkxLS45OHpNMi4zIDdoNy40YS4zLjMgMCAwIDAgLjMtLjNWNS4zYS4zLjMgMCAwIDAtLjMtLjNIMi4zYS4zLjMgMCAwIDAtLjMuM3YxLjRjMCAuMTcuMTQuMy4zLjN6bTIuMi0zLjVjMCAuMjguMjIuNS41LjVoMmEuNS41IDAgMCAwIDAtMUg1YS41LjUgMCAwIDAtLjUuNXpNMyA4YTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMnptNiAwYTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMnoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMS45MSAyLjVjLjA3IDAgMS0uMjMgMi4yMi0uMzhMNS4wNS4yOGEuNS41IDAgMCAxIC45LjQ0bC0uNjUgMS4zYTE0LjMgMTQuMyAwIDAgMSAxLjg3LjAzTDguMDUuMjhhLjUuNSAwIDAgMSAuOS40NGwtLjczIDEuNDVjMS4wNC4xNCAxLjgxLjMzIDEuODguMzMuMzIuMDguOS40OC45Ljk4djcuMDJhLjUuNSAwIDAgMS0uNS41SDEwdi43YS4zLjMgMCAwIDEtLjMuM0g4LjNhLjMuMyAwIDAgMS0uMy0uM1YxMUg0di43YS4zLjMgMCAwIDEtLjMuM0gyLjNhLjMuMyAwIDAgMS0uMy0uM1YxMWgtLjVhLjUuNSAwIDAgMS0uNS0uNVYzLjQ4YzAtLjU4LjU4LS45LjkxLS45OHpNMi4zIDdoNy40YS4zLjMgMCAwIDAgLjMtLjNWNS4zYS4zLjMgMCAwIDAtLjMtLjNIMi4zYS4zLjMgMCAwIDAtLjMuM3YxLjRjMCAuMTcuMTQuMy4zLjN6bTIuMi0zLjVjMCAuMjguMjIuNS41LjVoMmEuNS41IDAgMCAwIDAtMUg1YS41LjUgMCAwIDAtLjUuNXpNMyA4YTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMnptNiAwYTEgMSAwIDEgMCAwIDIgMSAxIDAgMCAwIDAtMnoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_troll .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAzLjljLjM1IDAgLjY4IDAgMSAuMDJsMS43Ni0zLjVhLjc1Ljc1IDAgMSAxIDEuMzQuNjdsLTEuNDcgMi45M2MxLjUzLjE1IDIuNDguMzcgMi40OC4zNy41MS4xLjg4LjU1Ljg5IDEuMDd2OC45NGEuNi42IDAgMCAxLS42MS42SDEzdi42NGEuMzYuMzYgMCAwIDEtLjM2LjM2aC0yLjI4YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1SDZ2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZIMy4zNmEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNWgtLjM5YS42MS42MSAwIDAgMS0uNjEtLjZWNS40N2MwLS41Mi4zNy0uOTcuODgtMS4wOCAwIDAgLjc3LS4xOCAyLjA1LS4zMkw2Ljc2LjQyYS43NS43NSAwIDAgMSAxLjM0LjY3TDYuNjcgMy45M2MuNDItLjAyLjg3LS4wMyAxLjMzLS4wM3pNMy4zIDdhLjMuMyAwIDAgMC0uMy4zdjIuNGMwIC4xNy4xMy4zLjMuM2g5LjRhLjMuMyAwIDAgMCAuMy0uM1Y3LjNhLjMuMyAwIDAgMC0uMy0uM0gzLjN6bTMuMTktMmEuNS41IDAgMCAwLS40OS41YzAgLjI4LjIxLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OXpNNC41IDExLjJhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42em03IDBhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42eiIvPjwvc3ZnPg==);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOCAzLjljLjM1IDAgLjY4IDAgMSAuMDJsMS43Ni0zLjVhLjc1Ljc1IDAgMSAxIDEuMzQuNjdsLTEuNDcgMi45M2MxLjUzLjE1IDIuNDguMzcgMi40OC4zNy41MS4xLjg4LjU1Ljg5IDEuMDd2OC45NGEuNi42IDAgMCAxLS42MS42SDEzdi42NGEuMzYuMzYgMCAwIDEtLjM2LjM2aC0yLjI4YS4zNS4zNSAwIDAgMS0uMzYtLjM2VjE1SDZ2LjY0YS4zNi4zNiAwIDAgMS0uMzYuMzZIMy4zNmEuMzUuMzUgMCAwIDEtLjM2LS4zNlYxNWgtLjM5YS42MS42MSAwIDAgMS0uNjEtLjZWNS40N2MwLS41Mi4zNy0uOTcuODgtMS4wOCAwIDAgLjc3LS4xOCAyLjA1LS4zMkw2Ljc2LjQyYS43NS43NSAwIDAgMSAxLjM0LjY3TDYuNjcgMy45M2MuNDItLjAyLjg3LS4wMyAxLjMzLS4wM3pNMy4zIDdhLjMuMyAwIDAgMC0uMy4zdjIuNGMwIC4xNy4xMy4zLjMuM2g5LjRhLjMuMyAwIDAgMCAuMy0uM1Y3LjNhLjMuMyAwIDAgMC0uMy0uM0gzLjN6bTMuMTktMmEuNS41IDAgMCAwLS40OS41YzAgLjI4LjIxLjUuNDkuNWgzLjAyYS41LjUgMCAwIDAgLjQ5LS41LjUuNSAwIDAgMC0uNDktLjVINi40OXpNNC41IDExLjJhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42em03IDBhMS4zIDEuMyAwIDEgMCAwIDIuNiAxLjMgMS4zIDAgMCAwIDAtMi42eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label_icon_underground .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy45NSA2LjdsLjggMi4yOWgtLjY0VjEwSDEyVjguOTloLS43NGwtMi44LTcuMzZMNiA2LjE2IDMuNTQgMS42My43NCA5SDB2MWgzLjlWOC45OWgtLjY2bC44MS0yLjNMNiAxMC4xeiIvPjwvc3ZnPg==);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy45NSA2LjdsLjggMi4yOWgtLjY0VjEwSDEyVjguOTloLS43NGwtMi44LTcuMzZMNiA2LjE2IDMuNTQgMS42My43NCA5SDB2MWgzLjlWOC45OWgtLjY2bC44MS0yLjNMNiAxMC4xeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label_icon_underground .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNiA4LjZsMS4wOCAzLjA1aC0uODdWMTNIMTZ2LTEuMzVoLTFsLTMuNzItOS44TDggNy44NyA0LjcyIDEuODQgMSAxMS42NUgwVjEzaDUuMnYtMS4zNWgtLjg4TDUuNCA4LjYgOCAxMy4xMXoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuNiA4LjZsMS4wOCAzLjA1aC0uODdWMTNIMTZ2LTEuMzVoLTFsLTMuNzItOS44TDggNy44NyA0LjcyIDEuODQgMSAxMS42NUgwVjEzaDUuMnYtMS4zNWgtLjg4TDUuNCA4LjYgOCAxMy4xMXoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__label_icon_pedestrian .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+)}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__label_icon_pedestrian .ymaps-2-1-79-transport-pin__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDUgNy43bC4wOS0xLjNjLjcyLjU5IDEuNzUgMS4zNyAxLjgzIDEuNDJhLjUuNSAwIDAgMSAuMTUuNzMuNTcuNTcgMCAwIDEtLjc1LjE0Yy0uMTQtLjA5LTEtLjctMS4zMi0xem0tNC4yLTEuM2MuMS0uMTkgMS4wMy0uNjEgMS4wMy0uNjFMNi41MyA4LjdjLS4wNC4zNS4xMi44LjM3IDEuMDZsMi4yIDIuMTJhLjQ3LjQ3IDAgMCAxIC4xLjE3czEuMzggMy4zIDEuNDMgMy40OGEuNjcuNjcgMCAwIDAgLjguNDQuNjQuNjQgMCAwIDAgLjQ4LS43N2wtMS4yOS0zLjgyYS43OS43OSAwIDAgMC0uMS0uMTdsLTEuNjYtMi4yYS4zLjMgMCAwIDEtLjA1LS4xOHMuMjMtMy40LjIzLTQuMDZjMC0uNjUtLjU5LS45Mi0uOTEtLjkyLTEuMDkgMC0zLjI4IDEuNjQtMy40MyAyLjAyTDMuODIgOC4xYy0uMTEuMjcuMDUuNTcuMzMuNjYuMjguMS42LS4wNS43LS4zMi4wNy0uMTYuOTItMS45NS45OC0yLjA1aC4wMXptMS45IDYuMDhsLTEuMy0xLjI3LTIuMDQgMy44OGEuNjEuNjEgMCAwIDAgLjMuODRjLjMyLjE1LjcyLjA0Ljg4LS4yOC4xLS4xOCAyLjE1LTMuMTcgMi4xNS0zLjE3em0yLTExLjEyYTEuMzYgMS4zNiAwIDEgMC0yLjcyIDAgMS4zNiAxLjM2IDAgMCAwIDIuNzIgMHoiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDUgNy43bC4wOS0xLjNjLjcyLjU5IDEuNzUgMS4zNyAxLjgzIDEuNDJhLjUuNSAwIDAgMSAuMTUuNzMuNTcuNTcgMCAwIDEtLjc1LjE0Yy0uMTQtLjA5LTEtLjctMS4zMi0xem0tNC4yLTEuM2MuMS0uMTkgMS4wMy0uNjEgMS4wMy0uNjFMNi41MyA4LjdjLS4wNC4zNS4xMi44LjM3IDEuMDZsMi4yIDIuMTJhLjQ3LjQ3IDAgMCAxIC4xLjE3czEuMzggMy4zIDEuNDMgMy40OGEuNjcuNjcgMCAwIDAgLjguNDQuNjQuNjQgMCAwIDAgLjQ4LS43N2wtMS4yOS0zLjgyYS43OS43OSAwIDAgMC0uMS0uMTdsLTEuNjYtMi4yYS4zLjMgMCAwIDEtLjA1LS4xOHMuMjMtMy40LjIzLTQuMDZjMC0uNjUtLjU5LS45Mi0uOTEtLjkyLTEuMDkgMC0zLjI4IDEuNjQtMy40MyAyLjAyTDMuODIgOC4xYy0uMTEuMjcuMDUuNTcuMzMuNjYuMjguMS42LS4wNS43LS4zMi4wNy0uMTYuOTItMS45NS45OC0yLjA1aC4wMXptMS45IDYuMDhsLTEuMy0xLjI3LTIuMDQgMy44OGEuNjEuNjEgMCAwIDAgLjMuODRjLjMyLjE1LjcyLjA0Ljg4LS4yOC4xLS4xOCAyLjE1LTMuMTcgMi4xNS0zLjE3em0yLTExLjEyYTEuMzYgMS4zNiAwIDEgMC0yLjcyIDAgMS4zNiAxLjM2IDAgMCAwIDIuNzIgMHoiLz48L3N2Zz4=)}.ymaps-2-1-79-transport-pin__label_icon_bicycle .ymaps-2-1-79-transport-pin__icon{top:1px;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTQuNDIgNi41M2wtLjYzLjJBLjYuNiAwIDAgMSAzIDYuMTh2LS40YzAtLjI3LjAzLS4zNi4wOC0uNDZhLjU1LjU1IDAgMCAxIC4yMy0uMjNjLjEtLjA1LjItLjA4LjQ2LS4wOEg1LjVhLjUuNSAwIDAgMSAuNS41Ljc5Ljc5IDAgMCAxLS4wNS4zLjU0LjU0IDAgMCAxLS4xNS4yMi43OS43OSAwIDAgMS0uMjcuMTRsLS4xNC4wNCAxLjUyIDIuNjQgMi4yMS0zLjY4LS4zOC0uOTdhLjMuMyAwIDAgMC0uMjgtLjJINy41YS41LjUgMCAwIDEgMC0xaC45NmExLjMgMS4zIDAgMCAxIDEuMi44MkwxMS4zNSA4YTIuNSAyLjUgMCAxIDEtLjk3LjI2TDkuNiA2LjMxIDcuNTUgOS43NGExLjIgMS4yIDAgMCAxIC4yNi43NSAxLjIgMS4yIDAgMCAxLTEuNDYgMS4xN2wtMy41NS0uOGEuMzguMzggMCAwIDEgMC0uNzRsMy4yOC0uNzQtMS42NC0yLjg3em0uMTYgMi41OGwtMS4xLjI1YTEuNSAxLjUgMCAxIDAgMCAyLjI4bDEuMS4yNWEyLjUgMi41IDAgMSAxIDAtMi43OHpNMTEuNSAxMmExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM3oiLz48L3N2Zz4=);list-style-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTQuNDIgNi41M2wtLjYzLjJBLjYuNiAwIDAgMSAzIDYuMTh2LS40YzAtLjI3LjAzLS4zNi4wOC0uNDZhLjU1LjU1IDAgMCAxIC4yMy0uMjNjLjEtLjA1LjItLjA4LjQ2LS4wOEg1LjVhLjUuNSAwIDAgMSAuNS41Ljc5Ljc5IDAgMCAxLS4wNS4zLjU0LjU0IDAgMCAxLS4xNS4yMi43OS43OSAwIDAgMS0uMjcuMTRsLS4xNC4wNCAxLjUyIDIuNjQgMi4yMS0zLjY4LS4zOC0uOTdhLjMuMyAwIDAgMC0uMjgtLjJINy41YS41LjUgMCAwIDEgMC0xaC45NmExLjMgMS4zIDAgMCAxIDEuMi44MkwxMS4zNSA4YTIuNSAyLjUgMCAxIDEtLjk3LjI2TDkuNiA2LjMxIDcuNTUgOS43NGExLjIgMS4yIDAgMCAxIC4yNi43NSAxLjIgMS4yIDAgMCAxLTEuNDYgMS4xN2wtMy41NS0uOGEuMzguMzggMCAwIDEgMC0uNzRsMy4yOC0uNzQtMS42NC0yLjg3em0uMTYgMi41OGwtMS4xLjI1YTEuNSAxLjUgMCAxIDAgMCAyLjI4bDEuMS4yNWEyLjUgMi41IDAgMSAxIDAtMi43OHpNMTEuNSAxMmExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM3oiLz48L3N2Zz4=);background-size:12px 12px}.ymaps-2-1-79-transport-pin__label_icon_pedestrian,.ymaps-2-1-79-transport-pin_tail_pedestrian .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_tail_pedestrian .ymaps-2-1-79-transport-pin__tail:before{background-color:#666;color:#666}.ymaps-2-1-79-transport-pin_filled_no.ymaps-2-1-79-transport-pin_tail_bicycle .ymaps-2-1-79-transport-pin__label:after,.ymaps-2-1-79-transport-pin_filled_no.ymaps-2-1-79-transport-pin_tail_pedestrian .ymaps-2-1-79-transport-pin__label:after{content:\'\';position:absolute;top:0;right:0;bottom:0;left:0;border-radius:20px;border:1px solid #999}.ymaps-2-1-79-transport-pin.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__label{border-color:#fff}.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__tail,.ymaps-2-1-79-transport-pin_filled_no .ymaps-2-1-79-transport-pin__tail:before,.ymaps-2-1-79-transport-pin_filled_no.ymaps-2-1-79-transport-pin_tail_bicycle .ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_filled_no.ymaps-2-1-79-transport-pin_tail_pedestrian .ymaps-2-1-79-transport-pin__label{background-color:#fff!important;color:#fff}.ymaps-2-1-79-transport-pin_size_large{margin-top:-39px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__body{margin-left:-15px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__body::after{margin:4px 0 -4px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__tail{bottom:-12px;left:-3px;width:4px;height:13px}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__label{width:28px;height:28px;border:2px solid}.ymaps-2-1-79-transport-pin_size_large .ymaps-2-1-79-transport-pin__text{padding-right:13px;padding-left:5px;font:15px/28px Arial,sans-serif}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-left:-14px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_2{width:29px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_3{width:43px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_4{width:57px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_5{width:71px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_6{width:85px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_7{width:99px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_2 .ymaps-2-1-79-transport-pin__body{width:58px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_3 .ymaps-2-1-79-transport-pin__body{width:86px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_4 .ymaps-2-1-79-transport-pin__body{width:114px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_5 .ymaps-2-1-79-transport-pin__body{width:142px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_6 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_7 .ymaps-2-1-79-transport-pin__body{width:198px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_8{width:64px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_9{width:71px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_10{width:78px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_11{width:85px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_12{width:92px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_13{width:99px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_14{width:106px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_15,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more{width:113px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_8 .ymaps-2-1-79-transport-pin__body{width:128px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_9 .ymaps-2-1-79-transport-pin__body{width:142px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_10 .ymaps-2-1-79-transport-pin__body{width:156px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_11 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_12 .ymaps-2-1-79-transport-pin__body{width:184px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_13 .ymaps-2-1-79-transport-pin__body{width:198px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_14 .ymaps-2-1-79-transport-pin__body{width:212px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_15 .ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__body{width:226px}.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__text .ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_large.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-left:-28px}.ymaps-2-1-79-transport-pin_size_small{margin-top:-32px;height:26px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__body{margin-left:-13px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__body::after{margin:3px 0 -3px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__tail{bottom:-8px;left:-2px;width:2px;height:9px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label{width:24px;height:24px;border:2px solid}.ymaps-2-1-79-transport-pin_labels_many.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_labels_many.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-right:0;margin-left:-2px}.ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__text{padding-right:9px;padding-left:3px;font:13px/24px Arial,sans-serif}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label{margin-right:0}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels-shift_yes .ymaps-2-1-79-transport-pin__text+.ymaps-2-1-79-transport-pin__label{margin-left:-12px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_2{width:24px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_3{width:35px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_4{width:46px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_5{width:57px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_6{width:68px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_7{width:79px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_2 .ymaps-2-1-79-transport-pin__body{width:48px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_3 .ymaps-2-1-79-transport-pin__body{width:70px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_4 .ymaps-2-1-79-transport-pin__body{width:92px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_5 .ymaps-2-1-79-transport-pin__body{width:114px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_6 .ymaps-2-1-79-transport-pin__body{width:136px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_7 .ymaps-2-1-79-transport-pin__body{width:158px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_8{width:55px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_9{width:61px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_10{width:67px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_11{width:73px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_12{width:79px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_13{width:85px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_14{width:91px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_15,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more{width:97px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_8 .ymaps-2-1-79-transport-pin__body{width:110px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_9 .ymaps-2-1-79-transport-pin__body{width:122px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_10 .ymaps-2-1-79-transport-pin__body{width:134px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_11 .ymaps-2-1-79-transport-pin__body{width:146px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_12 .ymaps-2-1-79-transport-pin__body{width:158px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_13 .ymaps-2-1-79-transport-pin__body{width:170px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_14 .ymaps-2-1-79-transport-pin__body{width:182px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_15 .ymaps-2-1-79-transport-pin__body,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__body{width:194px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label .ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__text,.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label+.ymaps-2-1-79-transport-pin__label{margin-left:-24px}.ymaps-2-1-79-transport-pin_size_small.ymaps-2-1-79-transport-pin_labels_16-or-more .ymaps-2-1-79-transport-pin__label .ymaps-2-1-79-transport-pin_size_small .ymaps-2-1-79-transport-pin__icon{margin-top:-1px}@media print{.ymaps-2-1-79-transport-pin_patched-for-print .ymaps-2-1-79-transport-pin__icon{background:0 0!important;display:list-item!important;list-style-position:inside!important}.ymaps-2-1-79-transport-pin_patched-for-print .ymaps-2-1-79-transport-pin__label{position:relative;overflow:hidden}.ymaps-2-1-79-transport-pin_patched-for-print .ymaps-2-1-79-transport-pin__label:before{content:\'\';position:absolute;top:0;left:0;width:0;height:0;border:20px solid}}'));
    });
}
, function(ym) {
    ym.modules.define('util-node-size', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-node-size-parent-style{visibility:hidden!important;position:absolute;overflow:hidden;width:0;height:0;display:block;zoom:1!important}.ymaps-2-1-79-node-size-parent-pane-style{visibility:hidden!important;position:relative;overflow:visible;display:block;zoom:1!important}.ymaps-2-1-79-node-size-node-style,.ymaps-2-1-79-node-size-w3c-box-model-test{overflow:hidden!important;overflow-x:hidden!important;overflow-y:hidden!important}.ymaps-2-1-79-node-size-node-style{position:absolute!important;zoom:1!important;display:block!important}.ymaps-2-1-79-node-size-w3c-box-model-test{width:100px!important;border-left-width:10px!important}.ymaps-2-1-79-node-size-no-scrolls-test,.ymaps-2-1-79-node-size-paddings-test{display:block!important;overflow:hidden!important;overflow-x:hidden!important;overflow-y:hidden!important}.ymaps-2-1-79-node-size-paddings-test{border-width:0!important;width:0!important;height:0!important}.ymaps-2-1-79-node-size-no-scrolls-test{position:absolute!important;left:0!important;top:0!important;width:100px!important;height:100px!important;visibility:visible!important}.ymaps-2-1-79-node-size-scrolls-test{overflow:scroll!important;overflow-x:scroll!important;overflow-y:scroll!important}'));
    });
}
, function(ym) {
    ym.modules.define('zoom', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-zoom{position:relative;display:block;padding:28px 0;width:28px;height:10px}.ymaps-2-1-79-zoom__button{position:absolute!important}.ymaps-2-1-79-zoom__plus{top:0}.ymaps-2-1-79-zoom__minus{bottom:0}.ymaps-2-1-79-zoom__scale{position:absolute;top:28px;bottom:28px;left:11px;width:4px;border-right:1px solid rgba(0,0,0,.2);border-left:1px solid rgba(0,0,0,.2);background:rgba(255,255,255,.4);box-shadow:1px 0 0 0 rgba(0,0,0,.15),-1px 0 0 0 rgba(0,0,0,.15)}.ymaps-2-1-79-zoom__runner{position:absolute;left:-12px;width:28px;height:15px!important;line-height:15px!important}.ymaps-2-1-79-zoom__runner__transition{-webkit-transition:top .3s;transition:top .3s}.ymaps-2-1-79-zoom .ymaps-2-1-79-float-button-icon_icon_runner{display:block;height:13px}.ymaps-2-1-79-zoom__runner .ymaps-2-1-79-zoom__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI1Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiM2NjYiIGQ9Ik0wIDBoMXYxSDB6bTMgMGgxdjFIM3ptMyAwaDF2MUg2em0zIDBoMXYxSDl6TTAgM2gxdjFIMHptMyAwaDF2MUgzem0zIDBoMXYxSDZ6bTMgMGgxdjFIOXptMCAwIi8+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1vcGFjaXR5PSIuNzUiIGQ9Ik0wIDFoMXYxSDB6bTMgMGgxdjFIM3ptMyAwaDF2MUg2em0zIDBoMXYxSDl6TTAgNGgxdjFIMHptMyAwaDF2MUgzem0zIDBoMXYxSDZ6bTMgMGgxdjFIOXptMCAwIi8+PC9nPjwvc3ZnPg==);background-repeat:no-repeat;background-position:center 5px;border-top:0;border-bottom:0}.ymaps-2-1-79-zoom__minus .ymaps-2-1-79-zoom__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNiAxMWgxNHY0SDZ6Ii8+PC9zdmc+)}.ymaps-2-1-79-zoom__plus .ymaps-2-1-79-zoom__icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTEgMTVINnYtNGg1VjZoNHY1aDV2NGgtNXY1aC00di01em0wIDAiLz48L3N2Zz4=)}'));
    });
}
, function(ym) {
    ym.modules.define('islets-variables', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-y-checkbox_skin_common', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-y-checkbox_skin_tick', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-y-checkbox_islet-large', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet-large{font-size:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__box{width:15px;height:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:10px;left:2px;width:18px;height:18px}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:2px;left:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PHBhdGggZD0iTTIuMiA2LjhsNC4yNSA0LjgzTDE1LjggMGwxLjcgMS43TDYuNDUgMTcgLjUgOC41bDEuNy0xLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet-large__dash{height:3px;margin-top:-1.5px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-y-checkbox_islet', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet{font-size:13px}.ymaps-2-1-79-islets_y-checkbox_islet__box{width:12px;height:12px}.ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:8px;left:2px;width:14px;height:14px}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTEuNCA1LjZsMy41NiAzLjk4TDEyLjYgMCAxNCAxLjQgNC45NiAxNCAwIDdsMS40LTEuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet__dash{height:2px;margin-top:-1px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-y-design', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-advert', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_advert{position:relative;display:block;overflow:hidden;font-family:Arial,Helvetica,sans-serif;line-height:20px}.ymaps-2-1-79-islets_advert__content{display:block;margin-right:12px;padding-right:6px;border-right:1px solid #999;min-height:65px}.ymaps-2-1-79-islets_card .ymaps-2-1-79-islets_advert__content{border-left:2px solid #ba7edd;padding-left:12px}.ymaps-2-1-79-islets_serp-advert .ymaps-2-1-79-islets_advert__content{border-right:1px solid #c99de3}.ymaps-2-1-79-islets_advert__title{font-size:16px;color:#04b}a.ymaps-2-1-79-islets_advert__title{text-decoration:none;-webkit-transition:.3s color;transition:.3s color}a.ymaps-2-1-79-islets_advert__title:link,a.ymaps-2-1-79-islets_advert__title:visited{color:#04b}a.ymaps-2-1-79-islets_advert__title:hover{color:#c00}.ymaps-2-1-79-islets_advert__text{display:block;margin-top:4px;font-size:13px;color:#000}.ymaps-2-1-79-islets_advert__label{position:absolute;top:0;right:0;bottom:0;left:0;z-index:-1}.ymaps-2-1-79-islets_advert__label:after{content:\'\';position:absolute;top:50%;right:-27px;width:65px;-webkit-transform:rotate(90deg);transform:rotate(90deg);text-transform:uppercase;text-align:center;font:9px/0 Arial,Helvetica,sans-serif;letter-spacing:3px;color:#999;content:attr(data-label)}.ymaps-2-1-79-islets_serp-advert .ymaps-2-1-79-islets_advert__label:after{color:#aa60d7}'));
    });
}
, function(ym) {
    ym.modules.define('islets-button-icon_skin_common', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-button-icon_traffic', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_button-icon_traffic,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon{position:relative;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjQjVCM0IzIiBkPSJNMy44MiAxNS40Yy0uNy0xLjE0LS41Mi0yLjQ1LjAyLTMuOCAxLjkxLTQuMSA0Ljc0LTUuODggNy45Mi02LjQ3IDEtLjE5IDEuNC0uMTkgMi4zNy0uMiAxLjIxLS4wMiAyLjMuMDcgMi4zLjA3cy0uNDguMTgtLjc3LjI3Yy0uNjIuMTgtMS4yNC40LTEuODUuNjYtNC40IDEuODUtNC40MyAxMC42LTUuOTkgMTEuNTMtMi4yNyAwLTMuMjMtLjgxLTQtMi4wNnoiLz48cGF0aCBmaWxsPSIjRDdENkQ2IiBkPSJNMjcuODUgMTZjMC02LjA4LTQuOS0xMS0xMC45My0xMUExMC45NyAxMC45NyAwIDAgMCA1Ljk4IDE2YzAgNi4wOCA0LjkgMTEgMTAuOTQgMTEgNi4wNCAwIDEwLjkzLTQuOTIgMTAuOTMtMTF6Ii8+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTE2LjkxIDQuODZjLS45Ni0uMDItMi4wMi0uMDgtMy43LjEgNC41LjE4IDguNjQgMi43IDEwLjMyIDcuOTkuMiAxLjg2IDIuNzMgMy44OSA0LjM0IDQuMDJBMTEuMiAxMS4yIDAgMCAwIDE2LjkxIDQuODZ6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__green,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__green{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjNjA3RTQ5IiBkPSJNMy44MiAxNS40Yy0uNy0xLjE0LS41Mi0yLjQ1LjAyLTMuOCAxLjkxLTQuMSA0Ljc0LTUuODggNy45Mi02LjQ3IDEtLjE5IDEuNC0uMTkgMi4zNy0uMiAxLjIxLS4wMiAyLjMuMDcgMi4zLjA3cy0uNDguMTgtLjc3LjI3Yy0uNjIuMTgtMS4yNC40LTEuODUuNjYtNC40IDEuODUtNC40MyAxMC42LTUuOTkgMTEuNTMtMi4yNyAwLTMuMjMtLjgxLTQtMi4wNnoiLz48cGF0aCBmaWxsPSIjNjlDMDMwIiBkPSJNMjcuODUgMTZjMC02LjA4LTQuOS0xMS0xMC45My0xMUExMC45NyAxMC45NyAwIDAgMCA1Ljk4IDE2YzAgNi4wOCA0LjkgMTEgMTAuOTQgMTEgNi4wNCAwIDEwLjkzLTQuOTIgMTAuOTMtMTF6Ii8+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTE2LjkxIDQuODZjLS45Ni0uMDItMi4wMi0uMDgtMy43LjEgNC41LjE4IDguNjQgMi43IDEwLjMyIDcuOTkuMiAxLjg2IDIuNzMgMy44OSA0LjM0IDQuMDJBMTEuMiAxMS4yIDAgMCAwIDE2LjkxIDQuODZ6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__yellow,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__yellow{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjRDVBRjU5IiBkPSJNMy44MiAxNS40Yy0uNy0xLjE0LS41Mi0yLjQ1LjAzLTMuOEM1Ljc3IDcuNSA4LjYgNS43MiAxMS44IDUuMTNjMS4wMS0uMTkgMS40LS4xOSAyLjM5LS4yIDEuMjItLjAyIDIuMy4wNyAyLjMuMDdzLS40Ny4xOC0uNzcuMjdjLS42Mi4xOC0xLjI0LjQtMS44Ni42Ni00LjQyIDEuODUtNC40NSAxMC42LTYuMDIgMTEuNTMtMi4yOSAwLTMuMjUtLjgxLTQuMDMtMi4wNnoiLz48cGF0aCBmaWxsPSIjRjdCQjNGIiBkPSJNMjggMTZhMTEgMTEgMCAxIDAtMjIgMCAxMSAxMSAwIDAgMCAyMiAweiIvPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0xNyA0Ljg2Yy0uOTgtLjAyLTIuMDQtLjA4LTMuNzQuMSA0LjUzLjE4IDguNyAyLjcgMTAuMzkgNy45OS4yIDEuODYgMi43NSAzLjg5IDQuMzcgNC4wMkExMS4yMyAxMS4yMyAwIDAgMCAxNi45OSA0Ljg2eiIvPjwvZz48L3N2Zz4=)}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__red,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__red{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjQTU0MzQwIiBkPSJNMy44MiAxNS40Yy0uNy0xLjE0LS41Mi0yLjQ1LjAzLTMuOEM1Ljc3IDcuNSA4LjYgNS43MiAxMS44IDUuMTNjMS4wMS0uMTkgMS40LS4xOSAyLjM5LS4yIDEuMjItLjAyIDIuMy4wNyAyLjMuMDdzLS40Ny4xOC0uNzcuMjdjLS42Mi4xOC0xLjI0LjQtMS44Ni42Ni00LjQyIDEuODUtNC40NSAxMC42LTYuMDIgMTEuNTMtMi4yOSAwLTMuMjUtLjgxLTQuMDMtMi4wNnoiLz48dGV4dCBmaWxsPSIjRkZGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMgNSkiPjx0c3BhbiB4PSI5IiB5PSIxNiI+NTwvdHNwYW4+PC90ZXh0PjxwYXRoIGZpbGw9IiNFODUyNTMiIGQ9Ik0yOCAxNmExMSAxMSAwIDEgMC0yMiAwIDExIDExIDAgMCAwIDIyIDB6Ii8+PHBhdGggZmlsbD0iIzMzMyIgZD0iTTE3IDQuODZjLS45OC0uMDItMi4wNC0uMDgtMy43NC4xIDQuNTMuMTggOC43IDIuNyAxMC4zOSA3Ljk5LjIgMS44NiAyLjc1IDMuODkgNC4zNyA0LjAyQTExLjIzIDExLjIzIDAgMCAwIDE2Ljk5IDQuODZ6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__off,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__off{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3KSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjI0IiB4PSIxIiB5PSIxIiBmaWxsPSIjRkZGIiByeD0iMyIvPjxjaXJjbGUgY3g9IjYiIGN5PSI2IiByPSIzIiBmaWxsPSIjRkY1ODU4Ii8+PGNpcmNsZSBjeD0iNiIgY3k9IjEzIiByPSIzIiBmaWxsPSIjRjdCQjNGIi8+PGNpcmNsZSBjeD0iNiIgY3k9IjIwIiByPSIzIiBmaWxsPSIjODBDMjU3Ii8+PHBhdGggZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuNCIgZD0iTTAgNHYxOGE0IDQgMCAwIDAgNCA0aDRhNCA0IDAgMCAwIDQtNFY0YTQgNCAwIDAgMC00LTRINGE0IDQgMCAwIDAtNCA0em0xIDB2MThhMyAzIDAgMCAwIDMgM2g0YTMgMyAwIDAgMCAzLTNWNGEzIDMgMCAwIDAtMy0zSDRhMyAzIDAgMCAwLTMgM3oiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_traffic[data-score]:after,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon[data-score]:after{position:absolute;top:0;right:0;left:0;padding-right:2px;color:#000;content:attr(data-score);vertical-align:middle;text-align:center;letter-spacing:-1px;font-size:14px;line-height:26px}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__green:after,.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__red:after,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__green:after,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__red:after{color:#fff}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__yellow:after,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__yellow:after{color:#503505}.ymaps-2-1-79-islets_button-icon_traffic.ymaps-2-1-79-islets__off:after,.ymaps-2-1-79-islets_traffic-button-jams-data__button-icon.ymaps-2-1-79-islets__off:after{content:\'\'}'));
    });
}
, function(ym) {
    ym.modules.define('islets-button-icon', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_button-icon,.ymaps-2-1-79-islets_button-icon_collapse,.ymaps-2-1-79-islets_button-icon_expand,.ymaps-2-1-79-islets_button-icon_fold,.ymaps-2-1-79-islets_button-icon_geolocation,.ymaps-2-1-79-islets_button-icon_h-collapse,.ymaps-2-1-79-islets_button-icon_h-expand,.ymaps-2-1-79-islets_button-icon_layers,.ymaps-2-1-79-islets_button-icon_loupe,.ymaps-2-1-79-islets_button-icon_minus,.ymaps-2-1-79-islets_button-icon_pano,.ymaps-2-1-79-islets_button-icon_plus,.ymaps-2-1-79-islets_button-icon_routes,.ymaps-2-1-79-islets_button-icon_ruler,.ymaps-2-1-79-islets_button-icon_settings{display:block;height:100%;background-position:50% 50%;background-repeat:no-repeat}.ymaps-2-1-79-islets_button-icon_geolocation{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiM0QzRDNEMiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNMTcuNTMgMjUuMDhjLS40NCAxLTEgLjk1LTEuMjQtLjEybC0xLjYzLTcuMThhLjg3Ljg3IDAgMCAwLS42LS42bC03LjIxLTEuNjVjLTEuMDUtLjIzLTEuMTEtLjc2LS4wOC0xLjE3bDE2LjgtNi43YzEuMDMtLjQgMS41LjA4IDEuMDcgMS4wOWwtNy4xMSAxNi4zM3oiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_button-icon_ruler{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTM1IDExLjMzIDExLjcyKSI+PHJlY3Qgd2lkdGg9IjEwLjA3IiBoZWlnaHQ9IjI0LjE0IiB5PSIuMyIgc3Ryb2tlPSIjMzMzIiBzdHJva2Utd2lkdGg9IjEuNSIgcng9IjIiLz48ZyBmaWxsPSIjMzMzIj48cGF0aCBkPSJNNi4wNCAzLjgyaDMuMDJ2MS40MUg2LjA0ek00LjAzIDcuODRoNS4wNHYxLjQxSDQuMDN6TTYuMDQgMTEuODdoMy4wMnYxLjQxSDYuMDR6TTYuMDQgMTkuOTFoMy4wMnYxLjQxSDYuMDR6TTQuMDMgMTUuOWg1LjA0djEuNEg0LjAzeiIvPjwvZz48L2c+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_fold{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzk5OSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTIgMTNsMS0xIDEgMSA1LjUgNSAxLjUtMS41LTctNi41LTEtMS0xIDEtNyA2LjVMNi41IDE4bDUuNS01em0wIDAiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_button-icon_plus{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzRDNEM0QyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTUgMTVWOWExIDEgMCAxIDEgMiAwdjZoNmExIDEgMCAxIDEgMCAyaC02djZhMSAxIDAgMSAxLTIgMHYtNkg5YTEgMSAwIDEgMSAwLTJoNnoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_button-icon_minus{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHJlY3Qgd2lkdGg9IjIiIGhlaWdodD0iMTYiIHg9IjciIHk9Ii03IiBmaWxsPSIjNEM0QzRDIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHRyYW5zZm9ybT0icm90YXRlKDkwIDQuNSAxMi41KSIgcng9IjEiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_button-icon_layers{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzRENEQ0RCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMjIuNzcgMTZsMi41MSAxLjQ4Yy45NS41Ni45NSAxLjQ3IDAgMi4wNGwtOC40MiA0Ljk3Yy0uNDcuMjgtMS4yNS4yOC0xLjcyIDBsLTguNDItNC45N2MtLjk1LS41Ni0uOTUtMS40NyAwLTIuMDRMOS4yMyAxNmwtMi41MS0xLjQ4Yy0uOTUtLjU2LS45NS0xLjQ3IDAtMi4wNGw4LjQyLTQuOTdhMS44OCAxLjg4IDAgMCAxIDEuNzIgMGw4LjQyIDQuOTdjLjk1LjU2Ljk1IDEuNDcgMCAyLjA0TDIyLjc3IDE2em0tMS43MiAxLjAybDIuMTcgMS4yOGMuMTguMS4xOS4zIDAgLjRMMTYgMjIuOTcgOC43OCAxOC43Yy0uMTgtLjEtLjE5LS4zIDAtLjRsMi4xNy0xLjI4IDQuMTkgMi40N2MuNDcuMjggMS4yNS4yOCAxLjcyIDBsNC4xOS0yLjQ3ek04Ljc4IDEzLjNjLS4xOS4xLS4xOC4zIDAgLjRMMTYgMTcuOTdsNy4yMi00LjI3Yy4xOS0uMS4xOC0uMyAwLS40TDE2IDkuMDMgOC43OCAxMy4zeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_loupe{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzRENEQ0RCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTguOTMgMjAuMzRsNC4yOSA0LjMgMS40MS0xLjQyLTQuMjktNC4zYTcuNSA3LjUgMCAxIDAtMS40MSAxLjQyem0tOC40NC0yLjA3YTUuNSA1LjUgMCAxIDEgNy43OC03Ljc4IDUuNSA1LjUgMCAwIDEtNy43OCA3Ljc4eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_routes{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzRDNEM0QyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTYuMjIgMjMuMTJsLTMuMjIuNHYtMS45NWgyLjEyLTMuNjJjLTEuMzggMC0yLjUtMS4xLTIuNS0yLjQzYTIuNDcgMi40NyAwIDAgMSAyLjUtMi40NGg3YzIuNDkgMCA0LjUtMS45NiA0LjUtNC4zOGE0LjQ1IDQuNDUgMCAwIDAtNC41LTQuMzdoLTYuNjVBMy40OSAzLjQ5IDAgMCAwIDguNSA1LjUgMy40NSAzLjQ1IDAgMCAwIDUgOC45MWEzLjQ2IDMuNDYgMCAwIDAgMy41IDMuNDIgMy40OSAzLjQ5IDAgMCAwIDMuMzYtMi40M2g2LjY0YzEuMzggMCAyLjUgMS4xIDIuNSAyLjQyYTIuNDcgMi40NyAwIDAgMS0yLjUgMi40NGgtN0E0LjQ0IDQuNDQgMCAwIDAgNyAxOS4xNGE0LjQ1IDQuNDUgMCAwIDAgNC41IDQuMzdoMS43NUgxM3YtMS45NGwzLjI4LjM4LTIuMjYtMS44M2ExIDEgMCAwIDEgLjE5LTEuMTkuOTYuOTYgMCAwIDEgMS4zOC4wNGwyLjYzIDIuOGExIDEgMCAwIDEgLjI4LjY2IDEgMSAwIDAgMS0uMjYuNzhsLTEuMyAxLjQzLTEuMzYgMS40N2EuOTUuOTUgMCAwIDEtMS4zNy4wNCAxLjEgMS4xIDAgMCAxLS4xMi0xLjQzbDIuMTMtMS42em03LjI4IDIuODNjMS45MyAwIDMuNS0xLjUzIDMuNS0zLjRhMy40NSAzLjQ1IDAgMCAwLTMuNS0zLjQxIDMuNDUgMy40NSAwIDAgMC0zLjUgMy40YzAgMS44OCAxLjU3IDMuNCAzLjUgMy40em0wLTEuN2MuOTcgMCAxLjc1LS43NyAxLjc1LTEuNyAwLS45NS0uNzgtMS43MS0xLjc1LTEuNzFzLTEuNzUuNzYtMS43NSAxLjcuNzggMS43IDEuNzUgMS43em0tMTUtMTMuNjRjLjk3IDAgMS43NS0uNzYgMS43NS0xLjdzLS43OC0xLjctMS43NS0xLjctMS43NS43Ni0xLjc1IDEuNy43OCAxLjcgMS43NSAxLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_settings{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzRENEQ0RCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS45MiA5LjhhNS45NiA1Ljk2IDAgMCAwLS43OCAxLjlsLTEuMTcuNjN2MS40bDEuMTguNjJjLjE2LjY3LjQyIDEuMy43OCAxLjg2bC0uNCAxLjI5IDEgLjk5IDEuMy0uNGMuNTUuMzUgMS4xNy42IDEuODMuNzZsLjY0IDEuMmgxLjRsLjY0LTEuMmE1LjgxIDUuODEgMCAwIDAgMS44My0uNzZsMS4zLjQgMS0xLS40LTEuMjhjLjM2LS41Ni42Mi0xLjE5Ljc4LTEuODZsMS4xOC0uNjJ2LTEuNGwtMS4xNy0uNjNhNS45NiA1Ljk2IDAgMCAwLS43OC0xLjlsLjM4LTEuMjUtLjk5LS45OS0xLjI0LjM4YTUuOTcgNS45NyAwIDAgMC0xLjkyLS44TDExLjcgNmgtMS40bC0uNjEgMS4xNGMtLjcuMTYtMS4zNC40My0xLjkyLjhsLTEuMjQtLjM4LTEgMSAuMzkgMS4yNXpNNi41IDEzYTQuNSA0LjUgMCAxIDEgOSAwIDQuNSA0LjUgMCAwIDEtOSAwem02LjUgMGEyIDIgMCAxIDAtNCAwIDIgMiAwIDAgMCA0IDB6bS0zIDBhMSAxIDAgMSAxIDIgMCAxIDEgMCAwIDEtMiAweiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_expand{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNOSAyMi43NVYyNGExIDEgMCAxIDEtMiAwdi01YTEgMSAwIDAgMSAyIDB2MS41bC0xIDMgMS0uNzV6Ii8+PHBhdGggZD0iTTExLjUgMjNIMTNhMSAxIDAgMSAxIDAgMkg4YTEgMSAwIDEgMSAwLTJoMS4yNWwtLjc1IDEgMy0xek0yMyA5LjI1VjhhMSAxIDAgMSAxIDIgMHY1YTEgMSAwIDAgMS0yIDB2LTEuNWwxLTMtMSAuNzV6Ii8+PHBhdGggZD0iTTIwLjUgOUgxOWExIDEgMCAxIDEgMC0yaDVhMSAxIDAgMSAxIDAgMmgtMS4yNWwuNzUtMS0zIDF6TTEwLjY2IDIyLjc2bDMuMjItMy4yMmExIDEgMCAxIDAtMS40Mi0xLjQybC0zLjIyIDMuMjJMOCAyM2gtLjQxbC0uMy4zYTEgMSAwIDAgMCAxLjQyIDEuNGwuMjktLjI5VjI0bDEuNjYtMS4yNHoiLz48cGF0aCBkPSJNMjEuMzQgOS4yNGwtMy4yMiAzLjIyYTEgMSAwIDEgMCAxLjQyIDEuNDJsMy4yMi0zLjIyTDI0IDloLjQxbC4zLS4zYTEgMSAwIDAgMC0xLjQyLTEuNGwtLjI5LjI5VjhsLTEuNjYgMS4yNHoiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_collapse{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjAgMTEuNzVWMTNhMSAxIDAgMSAxLTIgMFY4YTEgMSAwIDAgMSAyIDB2MS41bC0xIDMgMS0uNzV6Ii8+PHBhdGggZD0iTTIyLjUgMTJIMjRhMSAxIDAgMSAxIDAgMmgtNWExIDEgMCAxIDEgMC0yaDEuMjVsLS43NSAxIDMtMXpNMTIgMjAuMjVWMTlhMSAxIDAgMSAxIDIgMHY1YTEgMSAwIDAgMS0yIDB2LTEuNWwxLTMtMSAuNzV6Ii8+PHBhdGggZD0iTTkuNSAyMEg4YTEgMSAwIDEgMSAwLTJoNWExIDEgMCAxIDEgMCAyaC0xLjI1bC43NS0xLTMgMXoiLz48cGF0aCBkPSJNMTAuMzQgMjAuMjRsLTMuMjIgMy4yMmExIDEgMCAxIDAgMS40MiAxLjQybDMuMjItMy4yMkwxMyAyMGguNDFsLjMtLjNhMSAxIDAgMCAwLTEuNDItMS40bC0uMjkuMjlWMTlsLTEuNjYgMS4yNHpNMjEuNjYgMTEuNzZsMy4yMi0zLjIyYTEgMSAwIDEgMC0xLjQyLTEuNDJsLTMuMjIgMy4yMkwxOSAxMmgtLjQxbC0uMy4zYTEgMSAwIDEgMCAxLjQyIDEuNGwuMjktLjI5VjEzbDEuNjYtMS4yNHoiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_h-expand{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDI2djI2SDB6Ii8+PHBhdGggZmlsbD0iIzRENEQ0RCIgZD0iTTI0Ljk5IDEyLjI4bC4xMi4xNS4wMS4wMWExIDEgMCAwIDEtLjEgMS4yM2wtLjAzLjAyLTMuNTQgMy41NGExIDEgMCAwIDEtMS40MS0xLjQybC43LS43LjM2LS4zNiAxLjk4LS45OS0xLjU2LjIyaC00LjU1YTEgMSAwIDEgMSAwLTJoNC41NWwxLjU2LjIzLTEuOTgtMS0xLjA2LTEuMDVhMSAxIDAgMCAxIDAtMS40MiAxIDEgMCAwIDEgMS40MSAwbDMuNTMgMy41M3ptLTIyLjEgMS40OGwxLjU2LjIzSDlhMSAxIDAgMSAwIDAtMkg0LjQ1bC0xLjU2LjIyIDEuOTgtMSAuMzYtLjM1LjctLjdhMSAxIDAgMSAwLTEuNDEtMS40MUwuOTkgMTIuMjhsLS4wMi4wMWExIDEgMCAwIDAgLjAxIDEuNGwzLjU0IDMuNTRhMSAxIDAgMCAwIDEuNDEgMCAxIDEgMCAwIDAgMC0xLjQybC0xLjA2LTEuMDYtMS45OC0uOTl6Ii8+PC9nPjwvc3ZnPg==)}.ymaps-2-1-79-islets_button-icon_h-collapse{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDI2djI2SDB6Ii8+PHBhdGggZmlsbD0iIzRENEQ0RCIgZD0iTTEwLjAyIDEyLjMzbC4xMy4xNXYuMDFhMSAxIDAgMCAxLS4xIDEuMjNsLS4wMy4wMi0zLjUzIDMuNTRhMSAxIDAgMCAxLTEuNDIgMCAxIDEgMCAwIDEgMC0xLjQybC43MS0uNy4zNS0uMzYgMS45OC0uOTktMS41NS4yMkgyYTEgMSAwIDEgMSAwLTJoNC41NmwxLjU1LjIzLTEuOTgtMS0xLjA2LTEuMDVhMSAxIDAgMCAxIDAtMS40MiAxIDEgMCAwIDEgMS40MiAwbDMuNTMgMy41M3ptOC4wMiAxLjQ5bDEuNTYuMjJoNC41NWExIDEgMCAxIDAgMC0ySDE5LjZsLTEuNTYuMjIgMS45OC0uOTkuMzUtLjM1LjctLjdhMSAxIDAgMSAwLTEuNC0xLjQybC0zLjUzIDMuNTMtLjAyLjAxYTEgMSAwIDAgMC0uMDcgMS4zdi4wMWwuMDguMSAzLjU0IDMuNTNhMSAxIDAgMSAwIDEuNDEtMS40MmwtMS4wNi0xLjA1LTEuOTgtMXoiLz48L2c+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_pano{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiI+PHBhdGggZmlsbD0iIzRENEQ0RCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTQgMTd2M2MwIDEuMS45IDIgMiAyaDRhMiAyIDAgMCAwIDItMnYtN2wtNC03aC00djVoLTJWNkg4bC00IDd2N2EyIDIgMCAwIDAgMiAyaDRhMiAyIDAgMCAwIDItMnYtM2wxLTEgMSAxem0yIDNoNHYtN2wtMy01aC0xdjRsLTEgMWgtNGwtMS0xVjhIOWwtMyA1djdoNHYtM2wzLTMgMyAzdjN6TTkuMDEgM2ExIDEgMCAxIDAgMCAyaDEuOThhMSAxIDAgMSAwIDAtMkg5LjAxem02IDBhMSAxIDAgMSAwIDAgMmgxLjk4YTEgMSAwIDEgMCAwLTJoLTEuOTh6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_button-icon_cross{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiI+PHBhdGggZmlsbD0iIzRENEM0RCIgZD0iTTE2IDE0LjczbDUuMzYtNS4zNyAxLjI3IDEuMjhMMTcuMyAxNmw1LjM0IDUuMzYtMS4yOCAxLjI4TDE2IDE3LjI3bC01LjM2IDUuMzctMS4yOC0xLjI4TDE0LjczIDE2bC01LjM3LTUuMzYgMS4yOC0xLjI0TDE2IDE0Ljd6Ii8+PC9zdmc+)}'));
    });
}
, function(ym) {
    ym.modules.define('islets-button_skin_basic', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-button_skin_yellow', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-button_skin', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss(''));
    });
}
, function(ym) {
    ym.modules.define('islets-button_ymaps-yellow', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_button_ymaps-yellow{display:inline-block;box-sizing:border-box!important;height:38px;background-color:#fff;font-size:15px;font-family:Arial,Helvetica,sans-serif;line-height:38px;border:2px solid #fc0;text-align:center;cursor:pointer}.ymaps-2-1-79-islets_button_ymaps-yellow__text{padding:0 20px;color:#000}.ymaps-2-1-79-islets_button_ymaps-yellow:hover{background-color:#ffeba0}.ymaps-2-1-79-islets_button_ymaps-yellow:active{background-color:#fc0}'));
    });
}
, function(ym) {
    ym.modules.define('islets-button', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_button{height:38px;background-color:#fff;font-size:15px;font-family:Arial,Helvetica,sans-serif;line-height:38px;border-radius:38px;box-shadow:0 2px 3px 1px rgba(0,0,0,.2);-webkit-transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955),background-color .2s cubic-bezier(.455,.03,.515,.955),opacity .2s cubic-bezier(.455,.03,.515,.955);transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955),background-color .2s cubic-bezier(.455,.03,.515,.955),opacity .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_button__text{padding:0 20px;color:#000}.ymaps-2-1-79-islets_button__icon{display:inline-block;height:26px;width:26px;padding:6px;margin-left:6px}.ymaps-2-1-79-islets_button__icon:only-child{margin-left:0}.ymaps-2-1-79-islets_button__icon+.ymaps-2-1-79-islets_button__text{padding-left:2px}.ymaps-2-1-79-islets_button:hover{box-shadow:0 3px 4px 1px rgba(0,0,0,.3)}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__pressed{box-shadow:0 2px 3px 1px rgba(0,0,0,.12);opacity:.95}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__checked{background-color:#ffeba0}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_button__text{color:#746233}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__focused{box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__disabled{background-color:#fafafa;box-shadow:none;opacity:.75}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_button__icon{opacity:.75}.ymaps-2-1-79-islets_button.ymaps-2-1-79-islets__checked.ymaps-2-1-79-islets__disabled{background:#fff8db}'));
    });
}
, function(ym) {
    ym.modules.define('islets-card', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_card{display:block;text-align:start;font-family:Arial,Helvetica,sans-serif;padding-right:3px;padding-bottom:6px}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card,.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__timetable-visible{padding-right:3px}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__timetable-hidden{margin-right:0!important}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-organization{padding-bottom:6px}.ymaps-2-1-79-islets_islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-organization{padding-bottom:0}.ymaps-2-1-79-islets_card__separator{display:block;margin-top:11px;margin-bottom:12px;height:1px;background-color:#e5e5e5;font:0/0 a}.ymaps-2-1-79-islets_card__title{display:block;font-size:16px;line-height:22px}.ymaps-2-1-79-islets_card__title-business-link,.ymaps-2-1-79-islets_card__title-link,.ymaps-2-1-79-islets_card__title-poi-link,.ymaps-2-1-79-islets_card__title-stop-link,.ymaps-2-1-79-islets_card__title-toponym-link{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important}.ymaps-2-1-79-islets_card__title-business-link,.ymaps-2-1-79-islets_card__title-business-link:link,.ymaps-2-1-79-islets_card__title-business-link:visited,.ymaps-2-1-79-islets_card__title-link,.ymaps-2-1-79-islets_card__title-link:link,.ymaps-2-1-79-islets_card__title-link:visited,.ymaps-2-1-79-islets_card__title-poi-link,.ymaps-2-1-79-islets_card__title-poi-link:link,.ymaps-2-1-79-islets_card__title-poi-link:visited,.ymaps-2-1-79-islets_card__title-stop-link,.ymaps-2-1-79-islets_card__title-stop-link:link,.ymaps-2-1-79-islets_card__title-stop-link:visited,.ymaps-2-1-79-islets_card__title-toponym-link,.ymaps-2-1-79-islets_card__title-toponym-link:link,.ymaps-2-1-79-islets_card__title-toponym-link:visited{color:#04b}.ymaps-2-1-79-islets_card__title-business-link:hover,.ymaps-2-1-79-islets_card__title-link:hover,.ymaps-2-1-79-islets_card__title-poi-link:hover,.ymaps-2-1-79-islets_card__title-stop-link:hover,.ymaps-2-1-79-islets_card__title-toponym-link:hover{color:#c00}.ymaps-2-1-79-islets_card__description{display:block;color:#999;font-size:13px;line-height:17px}.ymaps-2-1-79-islets_card__description+ymaps{display:block}.ymaps-2-1-79-islets_card__address{display:block;color:#000;font-size:16px;line-height:22px}.ymaps-2-1-79-islets_card__link{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#04b}.ymaps-2-1-79-islets_card__link:link,.ymaps-2-1-79-islets_card__link:visited{color:#04b}.ymaps-2-1-79-islets_card__link:hover{color:#c00}.ymaps-2-1-79-islets_card__interaction{display:block;text-align:center;font-size:15px;line-height:20px}.ymaps-2-1-79-islets_card__feedback-container{display:table-cell;text-align:right;white-space:nowrap;font-size:13px;line-height:20px}.ymaps-2-1-79-islets_card__row-links{display:table;width:100%}.ymaps-2-1-79-islets_card__row-links .ymaps-2-1-79-islets__right-col:first-child{text-align:left}.ymaps-2-1-79-islets_card__row-links_multiline.ymaps-2-1-79-islets_card__row-links,.ymaps-2-1-79-islets_card__row-links_multiline.ymaps-2-1-79-islets_card__row-links>.ymaps-2-1-79-islets_card__taxi-container.ymaps-2-1-79-islets_card__taxi-container_shown,.ymaps-2-1-79-islets_card__row-links_multiline.ymaps-2-1-79-islets_card__row-links>.ymaps-2-1-79-islets_card__timetable{display:block}.ymaps-2-1-79-islets_card__row-links_multiline.ymaps-2-1-79-islets_card__row-links>.ymaps-2-1-79-islets_card__feedback-container{display:block;text-align:left}.ymaps-2-1-79-islets_card__row-links_multiline.ymaps-2-1-79-islets_card__row-links>.ymaps-2-1-79-islets__right-col{margin-top:7px}.ymaps-2-1-79-islets_card__status-row{min-width:260px}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__timetable-visible .ymaps-2-1-79-islets_card__status-row{min-width:auto}.ymaps-2-1-79-islets_card :last-child .ymaps-2-1-79-islets_card__toponym-buttons{margin-bottom:0}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__card-geocoder-toponym{padding-right:0}.ymaps-2-1-79-islets_card__status{margin-top:4px;margin-bottom:4px;color:#999;font-size:13px;line-height:20px}.ymaps-2-1-79-islets_card__status-rating-container{margin-right:4px}.ymaps-2-1-79-islets_serp-item .ymaps-2-1-79-islets_card__status{display:table;width:100%}.ymaps-2-1-79-islets_card .ymaps-2-1-79-islets_card__status{display:block}.ymaps-2-1-79-islets_card__status-row{display:table;width:100%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ymaps-2-1-79-islets_card__status-no-rating{padding-right:.5em;display:table-cell;white-space:nowrap}.ymaps-2-1-79-islets_card__status-no-rating-text,.ymaps-2-1-79-islets_card__status-time{display:table-cell;white-space:nowrap}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__mobile .ymaps-2-1-79-islets_card__status .ymaps-2-1-79-islets_card__status-no-rating .ymaps-2-1-79-islets_card__status-rating-link,.ymaps-2-1-79-islets_card__status .ymaps-2-1-79-islets_card__status-no-rating .ymaps-2-1-79-islets_card__status-no-rating-text,.ymaps-2-1-79-islets_card__status .ymaps-2-1-79-islets_card__status-no-rating_disabled .ymaps-2-1-79-islets_card__status-rating-link{display:none}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__mobile .ymaps-2-1-79-islets_card__status .ymaps-2-1-79-islets_card__status-no-rating .ymaps-2-1-79-islets_card__status-no-rating-text,.ymaps-2-1-79-islets_card__status .ymaps-2-1-79-islets_card__status-no-rating_disabled .ymaps-2-1-79-islets_card__status-no-rating-text{display:inline-block}.ymaps-2-1-79-islets_card__status-rating-text{display:inline-block;cursor:pointer;text-decoration:none;color:#999}.ymaps-2-1-79-islets_card__status-rating-text:hover{color:#c00}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__mobile .ymaps-2-1-79-islets_card__status-rating-text:hover,.ymaps-2-1-79-islets_serp-item .ymaps-2-1-79-islets_card__status-rating-text:hover,.ymaps-2-1-79-islets_serp-item .ymaps-2-1-79-islets_card__status-time{color:#999}.ymaps-2-1-79-islets_card__status-time{width:134px;text-align:right;color:#000}.ymaps-2-1-79-islets_card__status-time-icon{position:relative;top:1px;display:inline-block;margin-right:4px;width:16px;height:16px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iIzgwQzI1NyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTYgOEE4IDggMCAxIDAgMCA4YTggOCAwIDAgMCAxNiAwem0tOCA2LjVhNi41IDYuNSAwIDEgMCAwLTEzIDYuNSA2LjUgMCAwIDAgMCAxM3pNNyAzdjZoMVYzSDd6bTEgNXYxaDRWOEg4eiIvPjwvc3ZnPg==) no-repeat;vertical-align:top}.ymaps-2-1-79-islets_card__status-time-text{display:inline-block;vertical-align:top;text-align:left;position:relative}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-extra-narrow .ymaps-2-1-79-islets_card__status-time-text-short{display:inline}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-extra-narrow .ymaps-2-1-79-islets_card__status-time-text-full,.ymaps-2-1-79-islets_card__status-time-text-short{display:none}.ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:after{content:\'\';display:inline-block;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjUiPjxwYXRoIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTS41IDFMNCA0bDMuNS0zIi8+PC9zdmc+) no-repeat right;opacity:.6;width:11px;height:8px}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-extra-narrow .ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:after{width:0}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__timetable-visible .ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:after{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjUiPjxwYXRoIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTS41IDRMNCAxbDMuNSAzIi8+PC9zdmc+)}.ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:before{content:\'\';position:absolute;border-bottom:1px solid #e5e5e5;left:0;right:12px;bottom:2px;height:0}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-extra-narrow .ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:before{right:0}.ymaps-2-1-79-islets_serp-item .ymaps-2-1-79-islets_card__status-time-text{width:110px}.ymaps-2-1-79-islets_map-lang-en .ymaps-2-1-79-islets_serp-item .ymaps-2-1-79-islets_card__status-time-text{width:118px}.ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false]{cursor:pointer}.ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:hover:before{opacity:0}.ymaps-2-1-79-islets_card__status-time[data-is24h=false][data-closed-permanently=false] .ymaps-2-1-79-islets_card__status-time-text:hover:after{opacity:1}.ymaps-2-1-79-islets_card__status.ymaps-2-1-79-islets__closed .ymaps-2-1-79-islets_card__status-time-icon{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGNTg1OCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTYgOEE4IDggMCAxIDAgMCA4YTggOCAwIDAgMCAxNiAwem0tOCA2LjVhNi41IDYuNSAwIDEgMCAwLTEzIDYuNSA2LjUgMCAwIDAgMCAxM3pNNyAzdjZoMVYzSDd6bTEgNXYxaDRWOEg4eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_card__status-timetable{display:none;width:100%;margin-top:11px;color:#000}.ymaps-2-1-79-islets_card__status-timetable-row{display:block;width:90%;position:relative}.ymaps-2-1-79-islets_card__status-timetable-cell{background-color:#fff;text-transform:capitalize}.ymaps-2-1-79-islets_card__status-timetable-cell-time{white-space:nowrap;float:right;position:relative;left:10%}.ymaps-2-1-79-islets_card__status-timetable-cell-time:after{position:absolute;z-index:-1;right:12px;color:#e5e5e5;content:\'...................................................................................................................................................................................................................................................................................................................................................................................................................................................\'}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__timetable-visible .ymaps-2-1-79-islets_card__status-timetable{display:table}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-no-rating+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-no-rating-text+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-rating-container+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-no-rating+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-no-rating-text+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-rating-container+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-no-rating+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-no-rating-text+.ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-rating-container+.ymaps-2-1-79-islets_card__status-time{margin-top:4px}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-no-rating,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-no-rating-text,.ymaps-2-1-79-islets_card__contacts-phones.ymaps-2-1-79-islets__expanded .ymaps-2-1-79-islets_card__contacts-phones-item,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-no-rating,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-no-rating-text,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-no-rating,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-no-rating-text{display:block}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-time{display:block;text-align:left}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__status-time-text,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-kk .ymaps-2-1-79-islets_card__status-time-text,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-time,.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_card__status-time-text{width:auto}.ymaps-2-1-79-islets_card__contacts{display:block;font-size:13px}.ymaps-2-1-79-islets_card__contacts-phones{position:relative;display:block;line-height:17px;max-height:75px;overflow-y:auto}.ymaps-2-1-79-islets_card__contacts-phones-item{display:none;padding-top:4px;padding-bottom:4px;padding-left:21px}.ymaps-2-1-79-islets_card__contacts-phones-item-text{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#000}.ymaps-2-1-79-islets_card__contacts-phones-item-text:link,.ymaps-2-1-79-islets_card__contacts-phones-item-text:visited{color:#000}.ymaps-2-1-79-islets_card__contacts-phones-item-text:hover{color:#c00}.ymaps-2-1-79-islets_card__contacts-phones-item:first-child{position:relative;display:inline-block}.ymaps-2-1-79-islets_card__contacts-phones-item:first-child:before{position:absolute;top:0;bottom:0;left:0;width:21px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyI+PHBhdGggZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMDEgOC43NWEuNDQuNDQgMCAwIDAtLjQ4LjA3bC0uODQuODRhLjg2Ljg2IDAgMCAxLS41Mi4yMlM3LjEgOS45IDUuMSA3LjljLTItMi0xLjk5LTMuMDgtMS45OS0zLjA4IDAtLjE2LjEtLjQuMjItLjUxbC43Mi0uNzJhLjQ3LjQ3IDAgMCAwIC4wOC0uNUwyLjU2LjE0Yy0uMDctLjE1LS4yMi0uMTctLjM0LS4wNkwuMjYgMi4wMmExLjEgMS4xIDAgMCAwLS4yNS41MnMtLjM4IDIuODUgMy42MSA2Ljg0YzQgNCA2Ljg0IDMuNjEgNi44NCAzLjYxLjE2LS4wMi40LS4xNC41MS0uMjVsMS45Ni0xLjk2Yy4xMS0uMTEuMDktLjI3LS4wNi0uMzVsLTIuODYtMS42OHoiLz48L3N2Zz4=) left center no-repeat;content:\'\'}.ymaps-2-1-79-islets_card__contacts-phones-more{display:inline-block;margin-left:8px;width:23px;height:16px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMyIgaGVpZ2h0PSIxMyI+PHBhdGggZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNSAwTDMuOTIuMjJBNS4wOCA1LjA4IDAgMCAwIDAgNXYzYTUuMDMgNS4wMyAwIDAgMCAzLjkyIDQuNzVsMS4zMi4yNUgxOGwxLjA5LS4yMkE1LjA4IDUuMDggMCAwIDAgMjMgOFY1QTUuMDUgNS4wNSAwIDAgMCAxOS4wNy4yNEwxNy44NSAwSDV6bTEyLjY2Ljk4bDEuMjIuMjRBNC4wNSA0LjA1IDAgMCAxIDIyIDV2M2E0LjA4IDQuMDggMCAwIDEtMy4xMiAzLjhsLTEuMDkuMjIuMi0uMDJINS4yNGwuMi4wMi0xLjMzLS4yNUE0LjAzIDQuMDMgMCAwIDEgMSA4VjVhNC4wOCA0LjA4IDAgMCAxIDMuMTEtMy44TDUuMi45OCA1IDFoMTIuODVsLS4yLS4wMnpNNS41IDhhMS41IDEuNSAwIDEgMCAwLTMgMS41IDEuNSAwIDAgMCAwIDN6bTYgMGExLjUgMS41IDAgMSAwIDAtMyAxLjUgMS41IDAgMCAwIDAgM3ptNiAwYTEuNSAxLjUgMCAxIDAgMC0zIDEuNSAxLjUgMCAwIDAgMCAzeiIvPjwvc3ZnPg==) left top no-repeat;vertical-align:middle;opacity:.4;cursor:pointer;-webkit-transition:.3s opacity;transition:.3s opacity}.ymaps-2-1-79-islets_card__contacts-phones-more:hover{opacity:1}.ymaps-2-1-79-islets_card__contacts-phones.ymaps-2-1-79-islets__expanded .ymaps-2-1-79-islets_card__contacts-phones-more{display:none}.ymaps-2-1-79-islets_card__contacts-urls{display:block;position:relative;padding-left:21px;overflow:hidden;line-height:24px}.ymaps-2-1-79-islets_card__contacts-urls:before{position:absolute;top:0;bottom:0;left:0;width:21px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyI+PGcgZmlsbD0iIzY2NiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNLjkzIDRoMTEuMTR2LjkzSC45M3pNLjkzIDhoMTEuMTR2LjkzSC45M3oiLz48cGF0aCBkPSJNNi41IDEyLjA3QTUuNTcgNS41NyAwIDEgMCA2LjUuOTNhNS41NyA1LjU3IDAgMCAwIDAgMTEuMTR6bTAgLjkzYTYuNSA2LjUgMCAxIDEgMC0xMyA2LjUgNi41IDAgMCAxIDAgMTN6Ii8+PHBhdGggZD0iTTYuNSAxMi4wN2MuMDIgMCAuMTgtLjA4LjM5LS4yNy4yOS0uMjYuNi0uNjYuODctMS4xNmE4LjYgOC42IDAgMCAwIDAtOC4yOGMtLjI3LS41LS41OC0uOS0uODctMS4xNkExLjIgMS4yIDAgMCAwIDYuNS45M2MtLjAyIDAtLjE4LjA4LS4zOS4yNy0uMjkuMjYtLjYuNjYtLjg3IDEuMTZhOC42IDguNiAwIDAgMCAwIDguMjhjLjI3LjUuNTguOS44NyAxLjE2LjIxLjIuMzcuMjcuMzkuMjd6bTAgLjkzYy0xLjIgMC0zLjI1LTIuOTEtMy4yNS02LjVTNS4zIDAgNi41IDBjMS4yIDAgMy4yNSAyLjkxIDMuMjUgNi41UzcuNyAxMyA2LjUgMTN6Ii8+PC9nPjwvc3ZnPg==) left center no-repeat;content:\'\'}.ymaps-2-1-79-islets_card__contacts-url{display:inline-block;white-space:nowrap;cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#070}.ymaps-2-1-79-islets_card__contacts-url:link,.ymaps-2-1-79-islets_card__contacts-url:visited{color:#070}.ymaps-2-1-79-islets_card__contacts-url:hover,.ymaps-2-1-79-islets_card__metro-station-distance-link:hover{color:#c00}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__houseorg-button-text[title],.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__phones-expanded .ymaps-2-1-79-islets_card__contacts-phones-item{display:block}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__phones-expanded .ymaps-2-1-79-islets_card__contacts-phones-more{display:none}.ymaps-2-1-79-islets_card__metro{display:block;font-size:13px;line-height:20px}.ymaps-2-1-79-islets_card__metro-station{display:block;overflow:hidden;margin-top:8px;color:#000}.ymaps-2-1-79-islets_card__metro-station-icon{display:inline-block;vertical-align:top;margin-right:4px;width:12px;height:16px;position:relative;top:1px}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__moscow .ymaps-2-1-79-islets_card__metro-station-icon,.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__spb .ymaps-2-1-79-islets_card__metro-station-icon{width:16px;margin-right:8px}.ymaps-2-1-79-islets_card__metro-station-icon:before{content:\'\';position:absolute;top:0;left:0;right:0;bottom:0;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwaDEydjE2SDBWMHptNiAxM0E1IDUgMCAxIDAgNiAzYTUgNSAwIDAgMCAwIDEweiIvPjwvc3ZnPg==);background-position:50% 50%}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__moscow .ymaps-2-1-79-islets_card__metro-station-icon:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTAgMGgxOHYxNkgwVjB6bTguOTkgMTMuMThsMi42LTQuNDggMS4wNyAzLjA0aC0uODd2MS4zM2g1LjE5di0xLjMzaC0uOTlMMTIuMjcgMiA4Ljk5IDggNS43MSAyIDIgMTEuNzRIMXYxLjMzaDUuMTl2LTEuMzNoLS44N0w2LjM5IDguNyA5IDEzLjE4eiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__spb .ymaps-2-1-79-islets_card__metro-station-icon:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxNiI+PHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwaDE4djE2SDBWMHptMTAuODIgMkw5LjAxIDguODYgNy4xOSAyUzUgMi4xNyAzLjU1IDMuMjlDMi4yIDQuMzMgMS4wNSA1LjQzIDEgOC44NkE2LjggNi44IDAgMCAwIDMuMSAxNGwzLjcyLS4wMXMtMi41LS45Ni0zLjI3LTMuNDJjLS45MS0yLjktLjIyLTQuMTguODgtNS4xNC40NC0uMzYgMS4xLS40NSAxLjM0LjMzTDguNSAxNGgxLjAzczEuNzctNS43OCAyLjYtOC4yNGMuMjYtLjc3LjkxLS43IDEuMzQtLjMzIDEuMS45NiAxLjkgMi4yMy45OCA1LjE0LS43NyAyLjQ3LTMuMjggMy40Mi0zLjI4IDMuNDJsMy43Mi4wMXMxLjk0LTEuNzEgMi4xLTUuMTRjLjAyLTMuNDMtMS4yMi00LjU4LTIuNTQtNS43QzEzLjA3IDIgMTAuODIgMiAxMC44MiAyeiIvPjwvc3ZnPg==)}.ymaps-2-1-79-islets_card__metro-station-distance:before{content:\' — \'}.ymaps-2-1-79-islets_card__metro-station-distance-link{padding-left:18px;cursor:pointer;color:#4b4b99;-webkit-transition:color .15s ease-out;transition:color .15s ease-out}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__metro-station-distance,.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__metro-station-distance-link-hint,.ymaps-2-1-79-islets_card__metro-station-distance-link-text{display:none}.ymaps-2-1-79-islets_card__metro-station-distance-link-text:before{content:\'\';display:inline-block;width:12px;height:12px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iIzRCNEI5OSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+) no-repeat;padding-right:4px;-webkit-transition:background-image .15s ease-out;transition:background-image .15s ease-out}.ymaps-2-1-79-islets_card__metro-station-distance-link:hover .ymaps-2-1-79-islets_card__metro-station-distance-link-text:before{background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PHBhdGggZmlsbD0iI0MwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNy4zNSA1Ljc3bC4wNi0uOTdBMzguNTQgMzguNTQgMCAwIDAgOC44IDUuODZhLjM4LjM4IDAgMCAxIC4xMS41NS40My40MyAwIDAgMS0uNTcuMWMtLjEtLjA2LS43NS0uNTEtLjk4LS43NHpNNC4yIDQuOGgtLjAxYTQ2LjE0IDQ2LjE0IDAgMCAwLS43NCAxLjU0Yy0uMDcuMi0uMzEuMy0uNTIuMjQtLjIxLS4wNy0uMzQtLjMtLjI1LS41bC42Ni0xLjY3QzMuNDUgNC4xMiA1LjA5IDIuOSA1LjkgMi45Yy4yNCAwIC42OC4yLjY4LjY4IDAgLjUtLjE3IDMuMDUtLjE3IDMuMDUgMCAuMDUuMDEuMS4wNC4xM0w3LjcgOC40MmEuNTkuNTkgMCAwIDEgLjA4LjEzbC45NyAyLjg2YS40OC40OCAwIDAgMS0uMzYuNTcuNS41IDAgMCAxLS42LS4zM2MtLjA0LS4xNC0xLjA3LTIuNi0xLjA3LTIuNmEuMzUuMzUgMCAwIDAtLjA4LS4xM2wtMS42NS0xLjZhMS4wNiAxLjA2IDAgMCAxLS4yOC0uNzlsLjI2LTIuMTlzLS43LjMyLS43Ny40NnptMS40MiA0LjU2UzQuMDggMTEuNiA0IDExLjc0YS41LjUgMCAwIDEtLjY2LjIxLjQ2LjQ2IDAgMCAxLS4yMi0uNjNsMS41My0yLjkxLjk3Ljk1em0xLjUtOC4zNGExLjAyIDEuMDIgMCAxIDEtMi4wNCAwIDEuMDIgMS4wMiAwIDAgMSAyLjA0IDB6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__metro-station-distance-link{padding-left:8px}.ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__metro-station-distance-link-text,.ymaps-2-1-79-islets_card__metro-station-distance-link-hint{display:inline-block}.ymaps-2-1-79-islets_card__underground-line{display:block}.ymaps-2-1-79-islets_card__underground-line-icon{content:\'\';display:inline-block;width:8px;height:8px;background:0 0;margin-right:8px;border-radius:50%;margin-bottom:1px}.ymaps-2-1-79-islets_card__buttons{margin-top:16px}.ymaps-2-1-79-islets_card__buttons,.ymaps-2-1-79-islets_card__stop-buttons{display:block;margin-bottom:6px;height:28px;overflow:hidden;line-height:0}.ymaps-2-1-79-islets_card__business-buttons,.ymaps-2-1-79-islets_card__toponym-buttons{display:block;margin-top:16px;margin-bottom:6px;height:28px;overflow:hidden;line-height:0}.ymaps-2-1-79-islets_card__business-buttons *,.ymaps-2-1-79-islets_card__buttons *,.ymaps-2-1-79-islets_card__stop-buttons *,.ymaps-2-1-79-islets_card__toponym-buttons *{box-sizing:border-box!important}.ymaps-2-1-79-islets_card__business-buttons+.ymaps-2-1-79-islets_card__separator,.ymaps-2-1-79-islets_card__buttons+.ymaps-2-1-79-islets_card__separator,.ymaps-2-1-79-islets_card__stop-buttons+.ymaps-2-1-79-islets_card__separator,.ymaps-2-1-79-islets_card__toponym-buttons+.ymaps-2-1-79-islets_card__separator{margin-top:16px}.ymaps-2-1-79-islets_card__business-button,.ymaps-2-1-79-islets_card__stop-info-button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:block;width:100%;text-align:center;height:28px;border-color:transparent;background-color:#ffdb4d}a.ymaps-2-1-79-islets_card__business-button,a.ymaps-2-1-79-islets_card__business-button:active,a.ymaps-2-1-79-islets_card__business-button:hover,a.ymaps-2-1-79-islets_card__business-button:link,a.ymaps-2-1-79-islets_card__business-button:visited,a.ymaps-2-1-79-islets_card__houseorg-button,a.ymaps-2-1-79-islets_card__houseorg-button:active,a.ymaps-2-1-79-islets_card__houseorg-button:hover,a.ymaps-2-1-79-islets_card__houseorg-button:link,a.ymaps-2-1-79-islets_card__houseorg-button:visited,a.ymaps-2-1-79-islets_card__route-button,a.ymaps-2-1-79-islets_card__route-button:active,a.ymaps-2-1-79-islets_card__route-button:hover,a.ymaps-2-1-79-islets_card__route-button:link,a.ymaps-2-1-79-islets_card__route-button:visited,a.ymaps-2-1-79-islets_card__stop-info-button,a.ymaps-2-1-79-islets_card__stop-info-button:active,a.ymaps-2-1-79-islets_card__stop-info-button:hover,a.ymaps-2-1-79-islets_card__stop-info-button:link,a.ymaps-2-1-79-islets_card__stop-info-button:visited{color:#000!important;text-decoration:none!important}.ymaps-2-1-79-islets_card__business-button-text,.ymaps-2-1-79-islets_card__stop-info-button-text{display:inline-block;position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px}.ymaps-2-1-79-islets_card__business-button.ymaps-2-1-79-islets__disabled,.ymaps-2-1-79-islets_card__stop-info-button.ymaps-2-1-79-islets__disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-islets_card__business-button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_card__business-button-text,.ymaps-2-1-79-islets_card__houseorg-button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_card__houseorg-button-text,.ymaps-2-1-79-islets_card__route-button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_card__route-button-text,.ymaps-2-1-79-islets_card__stop-info-button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_card__stop-info-button-text{opacity:.5}.ymaps-2-1-79-islets_card__business-button:hover,.ymaps-2-1-79-islets_card__stop-info-button:hover{background-color:#ffd633;border-color:transparent}.ymaps-2-1-79-islets_card__business-button.ymaps-2-1-79-islets__pressed,.ymaps-2-1-79-islets_card__business-button:active,.ymaps-2-1-79-islets_card__stop-info-button.ymaps-2-1-79-islets__pressed,.ymaps-2-1-79-islets_card__stop-info-button:active{background-color:#fc0}.ymaps-2-1-79-islets_card__route-button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:block;width:100%;text-align:center;height:28px;background-color:#fff;border-color:rgba(0,0,0,.2)}.ymaps-2-1-79-islets_card__route-button-text{display:inline-block;position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px}.ymaps-2-1-79-islets_card__route-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-islets_card__route-button.ymaps-2-1-79-islets__pressed,.ymaps-2-1-79-islets_card__route-button:active{background-color:#f3f1ed}.ymaps-2-1-79-islets_card__route-button.ymaps-2-1-79-islets__disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-islets_card__business-button-text,.ymaps-2-1-79-islets_card__route-button-text,.ymaps-2-1-79-islets_card__stop-info-button-text{padding-right:5px;padding-left:5px}.ymaps-2-1-79-islets_card__toponym-buttons{text-align:center}.ymaps-2-1-79-islets_card__toponym-buttons iframe{width:205px;min-width:100%!important;min-height:28px!important;display:block!important;visibility:visible!important;opacity:1!important}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card__toponym-buttons{width:100%;max-width:100%}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card__toponym-buttons iframe{max-width:100%}.ymaps-2-1-79-islets_card__buttons-cell{display:inline-block;width:50%;vertical-align:top}.ymaps-2-1-79-islets_card__buttons-cell:first-of-type{padding-right:4px}.ymaps-2-1-79-islets_card__buttons-cell+.ymaps-2-1-79-islets_card__buttons-cell{padding-left:4px}.ymaps-2-1-79-islets_card__business-button,.ymaps-2-1-79-islets_card__route-button,.ymaps-2-1-79-islets_card__stop-info-button{overflow:hidden;text-overflow:ellipsis}.ymaps-2-1-79-islets_card__business-button:focus,.ymaps-2-1-79-islets_card__business-button:hover,.ymaps-2-1-79-islets_card__route-button:focus,.ymaps-2-1-79-islets_card__route-button:hover,.ymaps-2-1-79-islets_card__stop-info-button:focus,.ymaps-2-1-79-islets_card__stop-info-button:hover{text-decoration:inherit;color:inherit}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card__houseorg-button{min-width:initial}.ymaps-2-1-79-islets_card__houseorg-button{box-sizing:border-box!important;border-width:1px;border-style:solid;border-radius:3px;background-clip:border-box;color:#000;vertical-align:middle;text-decoration:none;font-family:Arial,Helvetica,sans-serif;cursor:pointer;-webkit-transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;transition:background-color .15s ease-out,border-color .15s ease-out,opacity .15s ease-out;display:block;width:100%;text-align:center;height:28px;background-color:#fff;border-color:rgba(0,0,0,.2);min-width:230px}.ymaps-2-1-79-islets_card__houseorg-button-text{position:relative;border:none;text-decoration:none;white-space:nowrap;font-size:13px;line-height:26px;padding:0 12px;display:block;overflow:hidden;text-overflow:ellipsis}.ymaps-2-1-79-islets_card__houseorg-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-islets_card__houseorg-button.ymaps-2-1-79-islets__pressed,.ymaps-2-1-79-islets_card__houseorg-button:active{background-color:#f3f1ed}.ymaps-2-1-79-islets_card__houseorg-button.ymaps-2-1-79-islets__disabled{cursor:default;background-color:#ebebeb}.ymaps-2-1-79-islets_card__houseorg-button:focus,.ymaps-2-1-79-islets_card__houseorg-button:hover{text-decoration:inherit;color:inherit}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__houseorg-button-text,.ymaps-2-1-79-islets_card__houseorg-button-text[title]{display:none}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__business-buttons,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__width-less-than-290 .ymaps-2-1-79-islets_card__stop-buttons{height:auto}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__business-buttons .ymaps-2-1-79-islets_card__buttons-cell,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__width-less-than-290 .ymaps-2-1-79-islets_card__stop-buttons .ymaps-2-1-79-islets_card__buttons-cell{display:block;width:100%;padding:0}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__business-buttons .ymaps-2-1-79-islets_card__buttons-cell+.ymaps-2-1-79-islets_card__buttons-cell,.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__width-less-than-290 .ymaps-2-1-79-islets_card__stop-buttons .ymaps-2-1-79-islets_card__buttons-cell+.ymaps-2-1-79-islets_card__buttons-cell{margin-top:8px}.ymaps-2-1-79-islets__card-geocoder-toponym .ymaps-2-1-79-islets_card__toponym-buttons{margin-top:9px}.ymaps-2-1-79-islets_card__taxi-container{display:none;white-space:nowrap}.ymaps-2-1-79-islets_card__taxi-container_shown.ymaps-2-1-79-islets_card__taxi-container{display:table-cell}.ymaps-2-1-79-islets_card__taxi-full-block{display:block}.ymaps-2-1-79-islets_balloon_layout_panel .ymaps-2-1-79-islets_card.ymaps-2-1-79-islets__is-narrow .ymaps-2-1-79-islets_card__taxi-price{display:none}.ymaps-2-1-79-islets_card__taxi-footer{display:inline-block;width:auto;box-sizing:border-box}.ymaps-2-1-79-islets_card__taxi-footer .ymaps-2-1-79-islets_card__taxi-link{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#04b}.ymaps-2-1-79-islets_card__taxi-footer .ymaps-2-1-79-islets_card__taxi-link:link,.ymaps-2-1-79-islets_card__taxi-footer .ymaps-2-1-79-islets_card__taxi-link:visited{color:#04b}.ymaps-2-1-79-islets_card__taxi-footer .ymaps-2-1-79-islets_card__taxi-link:hover{color:#c00}.ymaps-2-1-79-islets_card__taxi-price{color:#999}.ymaps-2-1-79-islets_card__taxi-price:before{content:\' \'}.ymaps-2-1-79-islets_card__taxi,.ymaps-2-1-79-islets_card__taxi-link{width:auto;box-sizing:border-box;position:relative;padding-left:20px}.ymaps-2-1-79-islets_card__taxi,.ymaps-2-1-79-islets_card__taxi-link,.ymaps-2-1-79-islets_card__timetable-link{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#04b}.ymaps-2-1-79-islets_card__taxi:link,.ymaps-2-1-79-islets_card__taxi:visited{color:#04b}.ymaps-2-1-79-islets_card__taxi:hover{color:#c00}.ymaps-2-1-79-islets_card__taxi-link,.ymaps-2-1-79-islets_card__timetable-link{color:#000}.ymaps-2-1-79-islets_card__taxi-link:link,.ymaps-2-1-79-islets_card__taxi-link:visited{color:#000}.ymaps-2-1-79-islets_card__taxi-link:hover{color:#c00}.ymaps-2-1-79-islets_card__taxi-link:before,.ymaps-2-1-79-islets_card__taxi:before{content:\'\';width:12px;height:12px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJub256ZXJvIj48cGF0aCBmaWxsPSIjRkQzIiBkPSJNMyAwaDZhMyAzIDAgMCAxIDMgM3YzSDBWM2EzIDMgMCAwIDEgMy0zeiIvPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik02IDZoNnYzYTMgMyAwIDAgMS0zIDNINlY2eiIvPjxwYXRoIGZpbGw9IiNGMkYxRUQiIGQ9Ik0wIDZoNnY2SDNhMyAzIDAgMCAxLTMtM1Y2eiIvPjwvZz48L3N2Zz4=) left center no-repeat;position:absolute;top:0;bottom:0;left:0}.ymaps-2-1-79-islets_card__timetable-link{position:relative;padding-left:20px;white-space:nowrap;color:#04b}.ymaps-2-1-79-islets_card__timetable-link:link,.ymaps-2-1-79-islets_card__timetable-link:visited{color:#04b}.ymaps-2-1-79-islets_card__timetable-link:hover{color:#c00}.ymaps-2-1-79-islets_card__timetable-link:before{content:\'\';width:16px;height:16px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PGcgZmlsbD0ibm9uZSI+PHBhdGggZmlsbD0iI0ZGQzkyNiIgZD0iTTUgMEwwIDQuNSA1IDloNC44TDYuMiA2SDE2VjNINi4ybDMuOS0zIi8+PHBhdGggZmlsbD0iI0YwMCIgZD0iTTExIDE1bDUtNC41TDExIDZINi4ybDMuNiAzSDB2M2g5LjhMNiAxNSIvPjwvZz48L3N2Zz4=) left center no-repeat;position:absolute;top:0;bottom:0;left:0}.ymaps-2-1-79-islets_card__stop-buttons{white-space:nowrap;margin-top:12px}.ymaps-2-1-79-islets_card__stop-buttons .ymaps-2-1-79-islets_card__buttons-cell{min-width:140px}.ymaps-2-1-79-islets_card__separator.ymaps-2-1-79-islets__stop-title-separator{margin-top:11px}.ymaps-2-1-79-islets_card__underground-line{padding-top:4px;line-height:120%}'));
    });
}
, function(ym) {
    ym.modules.define('islets-circle-dot-icon-with-caption', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_circle-dot-icon-with-caption__caption-block{position:absolute;top:-13px}.ymaps-2-1-79-islets_circle-dot-icon-with-caption__caption-block .ymaps-2-1-79-islets_icon-caption{padding-left:16px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-dot-icon-with-caption', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_dot-icon-with-caption__caption-block{position:absolute;top:-37px}.ymaps-2-1-79-islets_dot-icon-with-caption__caption-block .ymaps-2-1-79-islets_icon-caption{padding-left:20px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-editor-vertex-menu', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_editor-vertex-menu{display:table;padding-top:4px;padding-bottom:4px;border-radius:2px;background-color:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.1),0 2px 3px 2px rgba(0,0,0,.1);color:#000;font:0/0 Arial,sans-serif}.ymaps-2-1-79-islets_editor-vertex-menu__item{display:block;padding-right:13px;padding-left:13px;white-space:nowrap;font-size:13px;line-height:22px;cursor:pointer}.ymaps-2-1-79-islets_editor-vertex-menu__item:hover{background-color:#ffeba0}'));
    });
}
, function(ym) {
    ym.modules.define('islets-error', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_error{display:block;color:#ff5858;font:13px/1.2 Arial,sans-serif}'));
    });
}
, function(ym) {
    ym.modules.define('islets-icon-caption', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_icon-caption{white-space:nowrap;font:13px/27px Arial,sans-serif;border-radius:5px;height:27px;text-overflow:ellipsis;overflow:hidden;background:rgba(255,255,255,.85);padding:0 8px 0 0;position:absolute;margin-top:-1px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-round-button', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_round-button{position:relative;display:inline-block;margin:0;padding:0;outline:0;border:0;vertical-align:middle;text-align:left;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;min-width:38px;white-space:nowrap;height:38px;border-radius:38px;background-color:#fff;box-shadow:0 2px 3px 1px rgba(0,0,0,.2);font-size:15px;font-family:Arial,Helvetica,sans-serif;line-height:38px;-webkit-transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955),background-color .2s cubic-bezier(.455,.03,.515,.955),opacity .2s cubic-bezier(.455,.03,.515,.955);transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955),background-color .2s cubic-bezier(.455,.03,.515,.955),opacity .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_round-button__text{position:relative;margin:0;white-space:nowrap;text-decoration:none;border:none;background:0 0;vertical-align:top}.ymaps-2-1-79-islets_round-button__icon{display:inline-block;vertical-align:top}.ymaps-2-1-79-islets_round-button__text{display:block;overflow:hidden;padding:0 20px 0 46px;color:#000;text-overflow:ellipsis}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__text_only .ymaps-2-1-79-islets_round-button__text{padding-left:20px}.ymaps-2-1-79-islets_round-button__icon{position:absolute;top:0;left:0;margin-left:6px;padding:6px;width:26px;height:26px}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__icon_only .ymaps-2-1-79-islets_round-button__icon{margin-left:0}.ymaps-2-1-79-islets_round-button:hover{box-shadow:0 3px 4px 1px rgba(0,0,0,.3)}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__pressed{box-shadow:0 2px 3px 1px rgba(0,0,0,.12);opacity:.95}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__checked{background-color:#ffeba0}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_round-button__text{color:#746233}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__disabled{background-color:#fafafa;box-shadow:none;opacity:.75}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__disabled .ymaps-2-1-79-islets_round-button__icon{opacity:.75}.ymaps-2-1-79-islets_round-button.ymaps-2-1-79-islets__checked.ymaps-2-1-79-islets__disabled{background:#fff8db}'));
    });
}
, function(ym) {
    ym.modules.define('islets-serp-advert', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet-large{font-size:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__box{width:15px;height:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:10px;left:2px;width:18px;height:18px}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:2px;left:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PHBhdGggZD0iTTIuMiA2LjhsNC4yNSA0LjgzTDE1LjggMGwxLjcgMS43TDYuNDUgMTcgLjUgOC41bDEuNy0xLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet-large__dash{height:3px;margin-top:-1.5px}.ymaps-2-1-79-islets_y-checkbox_islet{font-size:13px}.ymaps-2-1-79-islets_y-checkbox_islet__box{width:12px;height:12px}.ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:8px;left:2px;width:14px;height:14px}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTEuNCA1LjZsMy41NiAzLjk4TDEyLjYgMCAxNCAxLjQgNC45NiAxNCAwIDdsMS40LTEuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet__dash{height:2px;margin-top:-1px}.ymaps-2-1-79-islets_serp-advert{position:relative;z-index:1;display:block;margin-bottom:-1px;border-top:1px solid #e5e5e5;vertical-align:top;font:13px/20px Arial,Helvetica,sans-serif;border-top-color:transparent;padding:12px;overflow:hidden;min-height:58px;text-decoration:none}.ymaps-2-1-79-islets_serp ymaps+ymaps .ymaps-2-1-79-islets_serp-advert{border-top-color:#e5e5e5}.ymaps-2-1-79-islets_serp-advert:hover{z-index:3;border-color:#ffeba0!important;background:#ffeba0;cursor:pointer;text-decoration:none}'));
    });
}
, function(ym) {
    ym.modules.define('islets-serp-item', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet-large{font-size:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__box{width:15px;height:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:10px;left:2px;width:18px;height:18px}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:2px;left:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PHBhdGggZD0iTTIuMiA2LjhsNC4yNSA0LjgzTDE1LjggMGwxLjcgMS43TDYuNDUgMTcgLjUgOC41bDEuNy0xLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet-large__dash{height:3px;margin-top:-1.5px}.ymaps-2-1-79-islets_y-checkbox_islet{font-size:13px}.ymaps-2-1-79-islets_y-checkbox_islet__box{width:12px;height:12px}.ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:8px;left:2px;width:14px;height:14px}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTEuNCA1LjZsMy41NiAzLjk4TDEyLjYgMCAxNCAxLjQgNC45NiAxNCAwIDdsMS40LTEuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet__dash{height:2px;margin-top:-1px}.ymaps-2-1-79-islets_serp-item{position:relative;z-index:1;display:block;margin-bottom:-1px;border-top:1px solid #e5e5e5;vertical-align:top;font:13px/20px Arial,Helvetica,sans-serif;padding:7px 12px 5px;background:#fff;color:#999}.ymaps-2-1-79-islets_serp .ymaps-2-1-79-islets_serp-item.ymaps-2-1-79-islets__first{border-top-color:transparent}.ymaps-2-1-79-islets_serp>ymaps+ymaps .ymaps-2-1-79-islets_serp-item.ymaps-2-1-79-islets__first{border-top-color:#e5e5e5}.ymaps-2-1-79-islets_serp-item.ymaps-2-1-79-islets__selected{background:#fff7d8;border-top-color:#fff7d8!important;position:relative;z-index:2}.ymaps-2-1-79-islets_serp-item.ymaps-2-1-79-islets__selected:hover,.ymaps-2-1-79-islets_serp-item:hover{z-index:3;border-color:#ffeba0!important;background:#ffeba0;cursor:pointer}.ymaps-2-1-79-islets_serp-item__title{display:block;color:#04b;font-size:15px;margin-bottom:1px}'));
    });
}
, function(ym) {
    ym.modules.define('islets-serp-popup', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet-large{font-size:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__box{width:15px;height:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:10px;left:2px;width:18px;height:18px}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:2px;left:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PHBhdGggZD0iTTIuMiA2LjhsNC4yNSA0LjgzTDE1LjggMGwxLjcgMS43TDYuNDUgMTcgLjUgOC41bDEuNy0xLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet-large__dash{height:3px;margin-top:-1.5px}.ymaps-2-1-79-islets_y-checkbox_islet{font-size:13px}.ymaps-2-1-79-islets_y-checkbox_islet__box{width:12px;height:12px}.ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:8px;left:2px;width:14px;height:14px}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTEuNCA1LjZsMy41NiAzLjk4TDEyLjYgMCAxNCAxLjQgNC45NiAxNCAwIDdsMS40LTEuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet__dash{height:2px;margin-top:-1px}.ymaps-2-1-79-islets_serp-popup{position:absolute;right:0;left:0;top:100%;margin-top:12px;z-index:3;padding:1px;display:block;box-sizing:border-box;min-height:20px;background:#fff;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),0 8px 30px -5px rgba(0,0,0,.5);-webkit-overflow-scrolling:touch}.ymaps-2-1-79-islets_serp-popup ::-webkit-scrollbar,.ymaps-2-1-79-islets_serp-popup::-webkit-scrollbar{width:17px;height:17px}.ymaps-2-1-79-islets_serp-popup ::-webkit-scrollbar-thumb,.ymaps-2-1-79-islets_serp-popup::-webkit-scrollbar-thumb{min-height:34px;min-width:34px;background-color:rgba(170,170,170,.5);background-clip:content-box;border:5px solid transparent}.ymaps-2-1-79-islets_serp-popup ::-webkit-scrollbar-thumb:hover,.ymaps-2-1-79-islets_serp-popup::-webkit-scrollbar-thumb:hover{background-color:rgba(170,170,170,.8)}.ymaps-2-1-79-islets_serp-popup ::-webkit-scrollbar-thumb:horizontal,.ymaps-2-1-79-islets_serp-popup::-webkit-scrollbar-thumb:horizontal{border-left-width:0;border-right-width:0}.ymaps-2-1-79-islets_serp-popup ::-webkit-scrollbar-thumb:vertical,.ymaps-2-1-79-islets_serp-popup::-webkit-scrollbar-thumb:vertical{border-top-width:0;border-bottom-width:0}.ymaps-2-1-79-islets_serp-popup.ymaps-2-1-79-islets__hidden{display:none}.ymaps-2-1-79-islets_serp-popup__tail{position:absolute;right:110px;bottom:100%;z-index:0;margin-left:-17px;width:17px;height:17px;background:rgba(0,0,0,.15);background:-webkit-linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);background:linear-gradient(45deg,rgba(0,0,0,.15) 50%,rgba(0,0,0,0) 50%);font:0/0 a;-webkit-transform:rotate(135deg);transform:rotate(135deg);-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.ymaps-2-1-79-islets_map-lang-tr .ymaps-2-1-79-islets_serp-popup__tail{right:95px}.ymaps-2-1-79-islets_serp-popup__tail:after{content:\'\';position:absolute;bottom:1px;left:1px;width:17px;height:17px;background-color:#fff}'));
    });
}
, function(ym) {
    ym.modules.define('islets-serp', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_y-checkbox_islet-large{font-size:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__box{width:15px;height:15px}.ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:10px;left:2px;width:18px;height:18px}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet-large__tick{bottom:2px;left:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PHBhdGggZD0iTTIuMiA2LjhsNC4yNSA0LjgzTDE1LjggMGwxLjcgMS43TDYuNDUgMTcgLjUgOC41bDEuNy0xLjd6Ii8+PC9zdmc+)}.ymaps-2-1-79-islets_y-checkbox_islet-large.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet-large__dash{height:3px;margin-top:-1.5px}.ymaps-2-1-79-islets_y-checkbox_islet{font-size:13px}.ymaps-2-1-79-islets_y-checkbox_islet__box{width:12px;height:12px}.ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:8px;left:2px;width:14px;height:14px}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_y-checkbox_islet__tick{bottom:2px;background-repeat:no-repeat;background-position:0 100%;background-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCI+PHBhdGggZD0iTTEuNCA1LjZsMy41NiAzLjk4TDEyLjYgMCAxNCAxLjQgNC45NiAxNCAwIDdsMS40LTEuNHoiLz48L3N2Zz4=)}.ymaps-2-1-79-islets_y-checkbox_islet.ymaps-2-1-79-islets__indeterminate .ymaps-2-1-79-islets_y-checkbox_islet__dash{height:2px;margin-top:-1px}.ymaps-2-1-79-islets_serp{position:relative;background-color:#fff;display:block;overflow-y:auto;font-family:Arial,Helvetica,sans-serif;color:#000;padding-bottom:1px}.ymaps-2-1-79-islets_serp:before{position:absolute;top:0;right:0;left:0;z-index:2;height:1px;background:#fff;content:\'\'}.ymaps-2-1-79-islets_serp.ymaps-2-1-79-islets_serp{box-sizing:border-box}.ymaps-2-1-79-islets_serp__error{display:block;padding:6px 12px;font-size:13px}.ymaps-2-1-79-islets_serp__loader{position:relative;z-index:1;display:block;margin-bottom:-1px;border-top:1px solid #e5e5e5;vertical-align:top;font:13px/20px Arial,Helvetica,sans-serif;background-color:#f6f5f3;padding:12px}.ymaps-2-1-79-islets_serp__loader-button{display:inline-block;border:1px solid rgba(0,0,0,.2);border-radius:4px;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;cursor:pointer;width:100%;text-align:center;font-size:15px;height:38px;line-height:38px}.ymaps-2-1-79-islets_serp__loader-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-islets_serp__loader-button.ymaps-2-1-79-islets__pressed{background-color:#f6f5f3}.ymaps-2-1-79-islets_serp__loader-button.ymaps-2-1-79-islets__focused{border-color:rgba(178,142,0,.6);box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_serp__back{position:relative;z-index:1;display:block;vertical-align:top;font:13px/20px Arial,Helvetica,sans-serif;margin-bottom:0;padding-top:10px;padding-bottom:8px;padding-left:10px;border-top:0}.ymaps-2-1-79-islets_serp__back-button{display:inline-block;border:1px solid rgba(0,0,0,.2);border-radius:4px;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;cursor:pointer;line-height:26px;font-size:13px;background:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3IiBoZWlnaHQ9IjEzIj48cGF0aCBmaWxsPSJ0cmFuc3BhcmVudCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjIiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNNiAxTDEgNi41IDYgMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==) 10px 50% no-repeat;padding-left:27px;padding-right:10px}.ymaps-2-1-79-islets_serp__back-button:hover{border-color:rgba(0,0,0,.3)}.ymaps-2-1-79-islets_serp__back-button.ymaps-2-1-79-islets__pressed{background-color:#f6f5f3}.ymaps-2-1-79-islets_serp__back-button.ymaps-2-1-79-islets__focused{border-color:rgba(178,142,0,.6);box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_serp__loadmore{position:relative;z-index:1;display:block;margin-bottom:-1px;border-top:1px solid #e5e5e5;vertical-align:top;font:13px/20px Arial,Helvetica,sans-serif;color:#04b;text-align:center;cursor:pointer;padding:6px 10px;font-size:13px;line-height:1.2}.ymaps-2-1-79-islets_serp__loadmore:hover{z-index:3;border-color:#ffeba0!important;background:#ffeba0;cursor:pointer}@-webkit-keyframes spinner{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spinner{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.ymaps-2-1-79-islets_serp__error{line-height:1.2}.ymaps-2-1-79-islets_serp__error-msg{display:table-cell;vertical-align:middle;height:25px}.ymaps-2-1-79-islets_serp__error a{cursor:pointer;-webkit-transition:color .15s ease-out;transition:color .15s ease-out;text-decoration:none!important;color:#04b}.ymaps-2-1-79-islets_serp__error a:link,.ymaps-2-1-79-islets_serp__error a:visited{color:#04b}.ymaps-2-1-79-islets_serp__error a:hover{color:#c00}'));
    });
}
, function(ym) {
    ym.modules.define('islets-traffic-button-jams-data', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_traffic-button-jams-data__icon{position:relative;display:inline-block;height:26px;width:26px;padding:6px;margin-left:6px}.ymaps-2-1-79-islets_traffic-button-jams-data__text{position:relative;display:inline-block;padding:0 20px;color:#000;vertical-align:top;text-decoration:none}.ymaps-2-1-79-islets_traffic-button-jams-data.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button-jams-data__content{background-color:#ffeba0}.ymaps-2-1-79-islets_traffic-button-jams-data.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button-jams-data__text{color:#746233}.ymaps-2-1-79-islets_traffic-button-jams-data__icon+.ymaps-2-1-79-islets_traffic-button-jams-data__text{padding-left:2px}.ymaps-2-1-79-islets_traffic-button-jams-data{display:inline-block;font:15px/38px Arial,sans-serif}.ymaps-2-1-79-islets_traffic-button-jams-data__text{padding-right:12px}.ymaps-2-1-79-islets_traffic-button-jams-data.ymaps-2-1-79-islets__checked::after{right:38px;-webkit-transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button-jams-data:not(.ymaps-2-1-79-islets__checked)::after{right:0;border-top-right-radius:38px;border-bottom-right-radius:38px;-webkit-transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955)}'));
    });
}
, function(ym) {
    ym.modules.define('islets-traffic-button', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_traffic-button,.ymaps-2-1-79-islets_traffic-settings-button{display:inline-block;height:38px;outline:0;border:0;box-shadow:none;vertical-align:top;font:15px/38px Arial,sans-serif;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:38px}.ymaps-2-1-79-islets_traffic-button::after{left:0}.ymaps-2-1-79-islets_traffic-button::after,.ymaps-2-1-79-islets_traffic-settings-button::after{content:\'\';z-index:-1;position:absolute;top:0;right:0;bottom:0;box-shadow:0 2px 3px 1px rgba(0,0,0,.2);border-radius:38px;-webkit-transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button:not(.ymaps-2-1-79-islets__disabled):hover::after,.ymaps-2-1-79-islets_traffic-settings-button:not(.ymaps-2-1-79-islets__disabled):hover::after{box-shadow:0 3px 4px 1px rgba(0,0,0,.3)}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__pressed:hover::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed:hover::after{box-shadow:0 2px 3px 1px rgba(0,0,0,.12);opacity:.95}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__focused,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__focused{box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_traffic-button__content,.ymaps-2-1-79-islets_traffic-settings-button__content{position:relative;display:block;overflow:hidden;box-sizing:border-box;height:38px;background-color:#fff;white-space:nowrap;border-radius:38px;-webkit-transition:background-color .2s cubic-bezier(.455,.03,.515,.955);transition:background-color .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button__icon{margin-left:6px}.ymaps-2-1-79-islets_traffic-button__icon,.ymaps-2-1-79-islets_traffic-settings-button__icon{position:relative;display:inline-block;height:26px;width:26px;padding:6px}.ymaps-2-1-79-islets_traffic-button__text{position:relative;display:inline-block;padding:0 20px;color:#000;vertical-align:top;text-decoration:none}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__content,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-settings-button__content{background-color:#ffeba0}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__text{color:#746233}.ymaps-2-1-79-islets_traffic-button__icon+.ymaps-2-1-79-islets_traffic-button__text{padding-left:2px}.ymaps-2-1-79-islets_traffic-button{position:absolute;right:0;top:0}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__content{padding-right:38px}.ymaps-2-1-79-islets_traffic-button__text{padding-right:12px}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked::after{border-top-right-radius:0;border-bottom-right-radius:0;right:38px;-webkit-transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button:not(.ymaps-2-1-79-islets__checked)::after{right:0;border-top-right-radius:38px;border-bottom-right-radius:38px;-webkit-transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-settings-button{position:relative;z-index:2;opacity:1;-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) opacity;transition:.2s cubic-bezier(.455,.03,.515,.955) opacity}.ymaps-2-1-79-islets_traffic-settings-button__icon{margin-left:0}.ymaps-2-1-79-islets_traffic-settings-button,.ymaps-2-1-79-islets_traffic-settings-button::after,.ymaps-2-1-79-islets_traffic-settings-button__content{border-top-left-radius:0;border-bottom-left-radius:0}.ymaps-2-1-79-islets_traffic-settings-button::after{left:2px}.ymaps-2-1-79-islets_traffic-settings-button::before{position:absolute;top:0;bottom:0;left:-1px;width:1px;background:rgba(0,0,0,.1);content:\'\';z-index:1}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__checked::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__focused::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-settings-button:hover::after{-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow;transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__hidden{opacity:0}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__hidden::after{box-shadow:none;-webkit-transition:none;transition:none}'));
    });
}
, function(ym) {
    ym.modules.define('islets-traffic-settings-button', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_traffic-button,.ymaps-2-1-79-islets_traffic-settings-button{display:inline-block;height:38px;outline:0;border:0;box-shadow:none;vertical-align:top;font:15px/38px Arial,sans-serif;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:38px}.ymaps-2-1-79-islets_traffic-button::after{left:0}.ymaps-2-1-79-islets_traffic-button::after,.ymaps-2-1-79-islets_traffic-settings-button::after{content:\'\';z-index:-1;position:absolute;top:0;right:0;bottom:0;box-shadow:0 2px 3px 1px rgba(0,0,0,.2);border-radius:38px;-webkit-transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button:not(.ymaps-2-1-79-islets__disabled):hover::after,.ymaps-2-1-79-islets_traffic-settings-button:not(.ymaps-2-1-79-islets__disabled):hover::after{box-shadow:0 3px 4px 1px rgba(0,0,0,.3)}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__pressed:hover::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed:hover::after{box-shadow:0 2px 3px 1px rgba(0,0,0,.12);opacity:.95}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__focused,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__focused{box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_traffic-button__content,.ymaps-2-1-79-islets_traffic-settings-button__content{position:relative;display:block;overflow:hidden;box-sizing:border-box;height:38px;background-color:#fff;white-space:nowrap;border-radius:38px;-webkit-transition:background-color .2s cubic-bezier(.455,.03,.515,.955);transition:background-color .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button__icon{margin-left:6px}.ymaps-2-1-79-islets_traffic-button__icon,.ymaps-2-1-79-islets_traffic-settings-button__icon{position:relative;display:inline-block;height:26px;width:26px;padding:6px}.ymaps-2-1-79-islets_traffic-button__text{position:relative;display:inline-block;padding:0 20px;color:#000;vertical-align:top;text-decoration:none}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__content,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-settings-button__content{background-color:#ffeba0}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__text{color:#746233}.ymaps-2-1-79-islets_traffic-button__icon+.ymaps-2-1-79-islets_traffic-button__text{padding-left:2px}.ymaps-2-1-79-islets_traffic-button{position:absolute;right:0;top:0}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic-button__content{padding-right:38px}.ymaps-2-1-79-islets_traffic-button__text{padding-right:12px}.ymaps-2-1-79-islets_traffic-button.ymaps-2-1-79-islets__checked::after{border-top-right-radius:0;border-bottom-right-radius:0;right:38px;-webkit-transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s cubic-bezier(.455,.03,.515,.955),border-bottom-right-radius .2s cubic-bezier(.455,.03,.515,.955),box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-button:not(.ymaps-2-1-79-islets__checked)::after{right:0;border-top-right-radius:38px;border-bottom-right-radius:38px;-webkit-transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic-settings-button{position:relative;z-index:2;opacity:1;-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) opacity;transition:.2s cubic-bezier(.455,.03,.515,.955) opacity}.ymaps-2-1-79-islets_traffic-settings-button__icon{margin-left:0}.ymaps-2-1-79-islets_traffic-settings-button,.ymaps-2-1-79-islets_traffic-settings-button::after,.ymaps-2-1-79-islets_traffic-settings-button__content{border-top-left-radius:0;border-bottom-left-radius:0}.ymaps-2-1-79-islets_traffic-settings-button::after{left:2px}.ymaps-2-1-79-islets_traffic-settings-button::before{position:absolute;top:0;bottom:0;left:-1px;width:1px;background:rgba(0,0,0,.1);content:\'\';z-index:1}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__checked::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__focused::after,.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic-settings-button:hover::after{-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow;transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__hidden{opacity:0}.ymaps-2-1-79-islets_traffic-settings-button.ymaps-2-1-79-islets__hidden::after{box-shadow:none;-webkit-transition:none;transition:none}'));
    });
}
, function(ym) {
    ym.modules.define('islets-traffic', ["system.provideCss"], function(provide, systemProvideCss) {
        provide.async(systemProvideCss('.ymaps-2-1-79-islets_traffic__button,.ymaps-2-1-79-islets_traffic__settings-button{display:inline-block;height:38px;outline:0;border:0;box-shadow:none;vertical-align:top;font:15px/38px Arial,sans-serif;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border-radius:38px}.ymaps-2-1-79-islets_traffic__button::after{left:0}.ymaps-2-1-79-islets_traffic__button::after,.ymaps-2-1-79-islets_traffic__settings-button::after{content:\'\';z-index:-1;position:absolute;top:0;right:0;bottom:0;box-shadow:0 2px 3px 1px rgba(0,0,0,.2);border-radius:38px;-webkit-transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic__button:not(.ymaps-2-1-79-islets__disabled):hover::after,.ymaps-2-1-79-islets_traffic__settings-button:not(.ymaps-2-1-79-islets__disabled):hover::after{box-shadow:0 3px 4px 1px rgba(0,0,0,.3)}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__pressed:hover::after,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__pressed:hover::after{box-shadow:0 2px 3px 1px rgba(0,0,0,.12);opacity:.95}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__focused,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__focused{box-shadow:0 0 10px #fc0}.ymaps-2-1-79-islets_traffic__button-content,.ymaps-2-1-79-islets_traffic__settings-button-content{position:relative;display:block;overflow:hidden;box-sizing:border-box;height:38px;background-color:#fff;white-space:nowrap;border-radius:38px;-webkit-transition:background-color .2s cubic-bezier(.455,.03,.515,.955);transition:background-color .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic__button-icon{margin-left:6px}.ymaps-2-1-79-islets_traffic__button-icon,.ymaps-2-1-79-islets_traffic__settings-button-icon{position:relative;display:inline-block;height:26px;width:26px;padding:6px}.ymaps-2-1-79-islets_traffic__button-text{position:relative;display:inline-block;padding:0 20px;color:#000;vertical-align:top;text-decoration:none}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic__button-content,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic__settings-button-content{background-color:#ffeba0}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic__button-text{color:#746233}.ymaps-2-1-79-islets_traffic__button-icon+.ymaps-2-1-79-islets_traffic__button-text{padding-left:2px}.ymaps-2-1-79-islets_traffic{display:inline-block;position:relative}.ymaps-2-1-79-islets_traffic__panel-content .ymaps-2-1-79-islets_y-checkbox_islet{display:block;margin-top:18px}.ymaps-2-1-79-islets_traffic__panel-content .ymaps-2-1-79-islets_error{margin-top:16px}.ymaps-2-1-79-islets_traffic__button{position:absolute;right:0}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__checked .ymaps-2-1-79-islets_traffic__button-content{padding-right:38px}.ymaps-2-1-79-islets_traffic__button-text{padding-right:12px}.ymaps-2-1-79-islets_traffic__button.ymaps-2-1-79-islets__checked::after{border-top-right-radius:0;border-bottom-right-radius:0;right:38px;-webkit-transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s linear,border-bottom-right-radius .2s linear,box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right .2s cubic-bezier(.455,.03,.515,.955),border-top-right-radius .2s linear,border-bottom-right-radius .2s linear,box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic__button:not(.ymaps-2-1-79-islets__checked)::after{right:0;border-top-right-radius:38px;border-bottom-right-radius:38px;-webkit-transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955);transition:right 0s,border-top-right-radius 0s,border-bottom-right-radius 0s,box-shadow .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic__settings-button{position:relative;z-index:2}.ymaps-2-1-79-islets_traffic__settings-button-icon{margin-left:0}.ymaps-2-1-79-islets_traffic__settings-button,.ymaps-2-1-79-islets_traffic__settings-button-content,.ymaps-2-1-79-islets_traffic__settings-button::after{border-top-left-radius:0;border-bottom-left-radius:0}.ymaps-2-1-79-islets_traffic__settings-button::after{left:2px}.ymaps-2-1-79-islets_traffic__settings-button::before{position:absolute;top:0;bottom:0;left:-1px;width:1px;background:rgba(0,0,0,.1);content:\'\';z-index:1}.ymaps-2-1-79-islets_traffic__settings-button{opacity:1;-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) opacity;transition:.2s cubic-bezier(.455,.03,.515,.955) opacity}.ymaps-2-1-79-islets_traffic__settings-button:not(_hidden)::after{-webkit-transition:0s box-shadow;transition:0s box-shadow}.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__checked::after,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__focused::after,.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__pressed::after,.ymaps-2-1-79-islets_traffic__settings-button:hover::after{-webkit-transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow;transition:.2s cubic-bezier(.455,.03,.515,.955) box-shadow}.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__hidden{opacity:0}.ymaps-2-1-79-islets_traffic__settings-button.ymaps-2-1-79-islets__hidden::after{box-shadow:none;-webkit-transition:none;transition:none}.traffic__panel{position:absolute;top:100%;z-index:1;margin-top:-9999px;padding:8px 16px 16px;width:290px;background-color:#fff;background-clip:padding-box;box-shadow:0 5px 15px -7px rgba(0,0,0,.5);-webkit-transform:translate3d(0,0,0)}.ymaps-2-1-79-islets_traffic__panel.ymaps-2-1-79-islets__show_animation{-webkit-animation:traffic__panel_show_animation_keyframe .25s ease-out;animation:traffic__panel_show_animation_keyframe .25s ease-out}.ymaps-2-1-79-islets_traffic__panel.ymaps-2-1-79-islets__hide_animation{-webkit-animation:traffic__panel_hide_animation_keyframe .25s ease-out;animation:traffic__panel_hide_animation_keyframe .25s ease-out}.ymaps-2-1-79-islets_traffic__panel.ymaps-2-1-79-islets__shown_true{margin-top:4px}.ymaps-2-1-79-islets_traffic__panel.ymaps-2-1-79-islets__align_left{right:auto;left:0}.ymaps-2-1-79-islets_traffic__panel.ymaps-2-1-79-islets__align_right{left:auto;right:0}.ymaps-2-1-79-islets_traffic__switcher{display:block;margin-bottom:8px;border-bottom:1px solid #f0f0f0;font:15px/28px Arial,sans-serif}.ymaps-2-1-79-islets_traffic__switcher-item{position:relative;top:1px;display:inline-block;padding:0 4px;border-bottom:3px solid transparent;color:#5099ff;cursor:pointer}.ymaps-2-1-79-islets_traffic__switcher-item:not(:last-child){margin-right:12px}.ymaps-2-1-79-islets_traffic__switcher-item.ymaps-2-1-79-islets__selected{cursor:default;color:#000;border-bottom-color:#000}.ymaps-2-1-79-islets_traffic__tabs{display:block;box-sizing:border-box;height:13px;margin-top:20px;margin-right:-4px;margin-left:-4px;text-align:justify;color:#5099ff;font:13px/1 Arial,sans-serif}.ymaps-2-1-79-islets_traffic__tabs-justifier{display:inline-block;width:100%}.ymaps-2-1-79-islets_traffic__tab{font:13px Arial,sans-serif}.ymaps-2-1-79-islets_traffic__tab-text{padding:4px;cursor:pointer;-webkit-transition:color .2s cubic-bezier(.455,.03,.515,.955);transition:color .2s cubic-bezier(.455,.03,.515,.955)}.ymaps-2-1-79-islets_traffic__tab.ymaps-2-1-79-islets__selected .ymaps-2-1-79-islets_traffic__tab-text{cursor:default;color:#000}.ymaps-2-1-79-islets_traffic__slider{position:relative;display:block;margin-top:18px;font-family:Arial,sans-serif}.ymaps-2-1-79-islets_traffic__slider-scale{position:relative;display:block;height:16px;margin-bottom:4px}.ymaps-2-1-79-islets_traffic__slider-body{position:relative;display:block;line-height:0}.ymaps-2-1-79-islets_traffic__slider-track{position:absolute;top:50%;right:1px;left:1px;display:block;margin-top:-3px;height:4px;border:1px solid #ccc;border-radius:3px;background-color:#f3f3f3;cursor:pointer}.ymaps-2-1-79-islets_traffic__slider-first-label,.ymaps-2-1-79-islets_traffic__slider-last-label{position:absolute;color:#999;font-size:13px}.ymaps-2-1-79-islets_traffic__slider-first-label{left:0}.ymaps-2-1-79-islets_traffic__slider-last-label{right:0}.ymaps-2-1-79-islets_traffic__slider-runner{position:relative;display:inline-block;padding:1px 10px 0;border:1px solid rgba(0,0,0,.2);border-radius:3px;background-color:#fff;background-clip:padding-box;color:#000;vertical-align:top;font-size:13px;line-height:25px;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ymaps-2-1-79-islets_traffic__slider-runner:hover{border:1px solid rgba(0,0,0,.3)}@-webkit-keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:4px;opacity:1;-webkit-transform:scale(1,1)}}@-webkit-keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:4px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1)}}@-webkit-keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:4px;opacity:1;-webkit-transform:scale(1,1);transform:scale(1,1)}}@keyframes traffic__panel_show_animation_keyframe{0%{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}to{margin-top:4px;opacity:1;-webkit-transform:scale(1,1);transform:scale(1,1)}}@-webkit-keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:4px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}}@keyframes traffic__panel_hide_animation_keyframe{0%{margin-top:4px;opacity:1}to{margin-top:0;opacity:0;-webkit-transform:translate(42%,-60%) scale(.1,.1);transform:translate(42%,-60%) scale(.1,.1)}}'));
    });
}
]);
