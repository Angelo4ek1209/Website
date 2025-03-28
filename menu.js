!function() {
    "use strict";
    class e {
        constructor(e) {
            this.mobileMenu = e;
            var t = e.closest("header");
            this.toggler = t.querySelector("[data-public-mobile-toggler]"),
            this.menuItems = Array.from(t.querySelectorAll("[data-public-menu-item]")),
            this.menuHandler = this.toggleMenu.bind(this)
        }
        get isOpen() {
            return this.mobileMenu.classList.contains("opened")
        }
        toggleMenu() {
            this.isOpen ? window.userScripts.Util.hideMenu(this.mobileMenu) : window.userScripts.Util.showMenu(this.mobileMenu)
        }
        init() {
            this.toggler && this.toggler.addEventListener("click", this.menuHandler);
            var e = this.menuItems.filter((e => "a" === e.tagName.toLowerCase())).find((e => e.href && document.location.href === e.href));
            e && e.classList.add("active"),
            this.menuItems.filter((e => "button" === e.tagName.toLowerCase())).forEach((e => {
                e.addEventListener("click", ( () => e.classList.toggle("active")))
            }
            ))
        }
        destroy() {
            this.toggler.removeEventListener("click", this.menuHandler)
        }
        static run() {
            [...(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document.body).querySelectorAll("[data-public-mobile-content]")].forEach((t => {
                new e(t).init()
            }
            ))
        }
    }
    document.addEventListener("DOMContentLoaded", ( () => {
        e.run()
    }
    )),
    window.userScripts = window.userScripts || {},
    window.userScripts.Menu = e
}();
