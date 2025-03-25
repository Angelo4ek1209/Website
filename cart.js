!function() {
    function t(t, e) {
        var i = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(t);
            e && (r = r.filter((function(e) {
                return Object.getOwnPropertyDescriptor(t, e).enumerable
            }
            ))),
            i.push.apply(i, r)
        }
        return i
    }
    function e(e) {
        for (var i = 1; i < arguments.length; i++) {
            var r = null != arguments[i] ? arguments[i] : {};
            i % 2 ? t(Object(r), !0).forEach((function(t) {
                var i, a, s;
                i = e,
                a = t,
                s = r[t],
                (a = function(t) {
                    var e = function(t, e) {
                        if ("object" != typeof t || null === t)
                            return t;
                        var i = t[Symbol.toPrimitive];
                        if (void 0 !== i) {
                            var r = i.call(t, "string");
                            if ("object" != typeof r)
                                return r;
                            throw new TypeError("@@toPrimitive must return a primitive value.")
                        }
                        return String(t)
                    }(t);
                    return "symbol" == typeof e ? e : String(e)
                }(a))in i ? Object.defineProperty(i, a, {
                    value: s,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0
                }) : i[a] = s
            }
            )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : t(Object(r)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t))
            }
            ))
        }
        return e
    }
    !function() {
        "use strict";
        class t {
            constructor(t) {
                this.el = t,
                this.productList = this.el.querySelector("[data-public-cart-list]"),
                this.items = [],
                this.totalEl = this.el.querySelector("[data-public-cart-list-total]"),
                this.totalElNumber = this.totalEl.querySelector("span:first-child"),
                this.productTemplate = this.el.querySelector("[data-public-cart-list-item]"),
                this.cartIcon = document.querySelector("[data-public-cart-button]"),
                this.cartIconCounter = this.cartIcon.querySelector("[data-public-cart-button-count]"),
                this.handleAction = this.action.bind(this)
            }
            get id() {
                return this.el.id
            }
            get savedItems() {
                return (localStorage.carts && JSON.parse(localStorage.carts) || {})[this.id] || []
            }
            init() {
                this.items = this.savedItems.map((t => new i(t,this.productTemplate))),
                this.render(),
                this.updateCartIcon(),
                this.updateSumm(),
                document.addEventListener("public-add-to-cart", (t => {
                    var {detail: e} = t;
                    this.add(e)
                }
                )),
                document.addEventListener("public-clear-cart", this.clear.bind(this))
            }
            destroy() {
                document.removeEventListener("public-clear-cart", this.clear.bind(this))
            }
            add(t) {
                var r = this.items.find((e => e.id === t.id));
                if (r)
                    r.increment();
                else {
                    var a = new i(e(e({}, t), {}, {
                        productQuantity: 1
                    }),this.productTemplate);
                    this.items.push(a)
                }
                this.render(),
                this.updateCartIcon(),
                this.updateSumm(),
                this.save()
            }
            delete(t) {
                var e = this.items.find((e => e.id === t));
                this.items = this.items.filter((t => t.id !== e.id)),
                this.save(),
                e.el.removeEventListener("click", this.handleAction),
                e.el.removeEventListener("input", this.handleAction),
                e.el.removeEventListener("change", this.handleAction)
            }
            clear() {
                this.items = [],
                this.productList.innerHTML = "",
                this.updateCartIcon(),
                this.updateSumm(),
                this.save()
            }
            save() {
                var t = localStorage.carts && JSON.parse(localStorage.carts) || {};
                t[this.id] = this.items.map((t => t.data)),
                localStorage.setItem("carts", JSON.stringify(t)),
                localStorage.setItem("cartLastUpdate", JSON.stringify(Date.now()))
            }
            render() {
                this.productList.innerHTML = "",
                this.items.forEach((t => {
                    this.productList.appendChild(t.el),
                    t.render(),
                    t.el.addEventListener("click", this.handleAction),
                    t.el.addEventListener("input", this.handleAction),
                    t.el.addEventListener("change", this.handleAction)
                }
                ))
            }
            updateCartIcon() {
                this.cartIcon.style.display = this.items.length ? "inline-flex" : "none",
                this.cartIconCounter.textContent = this.items.length
            }
            updateSumm() {
                var t = this.items.reduce(( (t, e) => t + e.total), 0);
                this.totalElNumber.textContent = parseFloat(t.toFixed(2)),
                this.totalEl.style.display = t ? "block" : "none"
            }
            action(t) {
                t.preventDefault(),
                t.stopPropagation();
                var {target: e, currentTarget: i} = t
                  , r = this.items.find((t => t.data.id === i.dataset.id));
                if ("click" === t.type) {
                    if (e.closest("[data-public-cart-list-increment]"))
                        return r.increment(),
                        this.updateSumm(),
                        void this.save();
                    if (e.closest("[data-public-cart-list-decrement]"))
                        return r.decrement(),
                        this.updateSumm(),
                        void this.save();
                    e.closest("[data-public-cart-list-delete]") && (this.delete(r.id),
                    r.delete(),
                    this.updateCartIcon(),
                    this.updateSumm(),
                    this.save())
                } else
                    "input" === t.type ? e.closest("[data-public-cart-list-quantity]") && "" !== e.value && (r.setProductQuantity(parseInt(e.value)),
                    this.updateSumm(),
                    this.save()) : "change" === t.type && e.closest("[data-public-cart-list-quantity]") && r.render()
            }
            static run() {
                [...(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document.body).querySelectorAll('[data-script="cart-items"]')].forEach((e => {
                    new t(e).init()
                }
                ))
            }
        }
        class i {
            constructor(t, e) {
                var i = e.cloneNode(!0);
                this.data = t,
                this.el = i,
                this.nameEl = i.querySelector("[data-public-cart-list-name]"),
                this.descriptionEl = i.querySelector("[data-public-cart-list-description]"),
                this.priceEl = i.querySelector("[data-public-cart-list-price]"),
                this.quantityEl = i.querySelector("[data-public-cart-list-quantity]"),
                this.imgEl = i.querySelector("[data-public-cart-list-image]")
            }
            get id() {
                return this.data.id
            }
            get total() {
                var t = this.data.productPrice * this.data.productQuantity;
                return parseFloat(t.toFixed(2))
            }
            render() {
                var {id: t, productName: e, productDescription: i, productImage: r, productQuantity: a=1} = this.data;
                this.nameEl.textContent = e,
                this.descriptionEl.textContent = i,
                this.priceEl.textContent = this.total,
                this.quantityEl.value = a,
                this.imgEl.src = r,
                this.imgEl.srcset = r,
                this.el.dataset.id = t
            }
            normalizeToProductQuantityRange(t) {
                return t < 1 ? 1 : 999 < t ? 999 : t
            }
            setProductQuantity(t) {
                if (isFinite(t)) {
                    var e = this.normalizeToProductQuantityRange(t);
                    this.data.productQuantity = e
                }
                this.render()
            }
            increment() {
                var t = this.normalizeToProductQuantityRange(this.data.productQuantity + 1);
                this.data.productQuantity !== t && (this.data.productQuantity = t,
                this.render())
            }
            decrement() {
                var t = this.normalizeToProductQuantityRange(this.data.productQuantity - 1);
                this.data.productQuantity !== t && (this.data.productQuantity = t,
                this.render())
            }
            delete() {
                this.el.remove()
            }
        }
        window.userScripts = window.userScripts || {},
        window.userScripts.Cart = t,
        document.addEventListener("DOMContentLoaded", ( () => {
            t.run()
        }
        ))
    }()
}();
