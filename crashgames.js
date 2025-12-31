/* ===================== SCROLL AUTOPLAY ===================== */
const $sec = $('.crash__games__sec');
const $bar = $('.crash__games__bar');
const childW = $sec.children().first().outerWidth(true);
const total = $sec.children().length;
let idx = 0, timer;

$('.crash__games__scroll__sec').toggle(total > 1);

function updateBar() {
    const max = $sec.prop('scrollWidth') - $sec.width();
    const w = max ? 5 + ($sec.scrollLeft() / max) * 95 : 5;
    $bar.css('width', w + '%');
}

function autoplay() {
    idx = (idx + 1) % total;
    $sec.animate({ scrollLeft: idx * childW }, 500);
    updateBar();
}

function resetAutoplay() {
    clearInterval(timer);
    timer = setInterval(autoplay, 3000);
}

$sec.on('scroll', function () {
    idx = Math.round(this.scrollLeft / childW);
    updateBar();
    resetAutoplay();
});

resetAutoplay();

/* ===================== SVG / IMG FALLBACK ===================== */
const processed = new WeakSet();

function handleMedia(el) {
    if (processed.has(el)) return;
    processed.add(el);

    const box = el.closest('.svg__object__container');
    const link = el.closest('.casinoLink, .casinoLinkremoved');
    const fallback = box?.querySelector('.svg__fallback');
    const imgUrl = link?.dataset.image;

    function fail() {
        el.style.display = 'none';
        if (!imgUrl || !box) return fallback?.style.display = 'flex';
        const i = new Image();
        i.onload = () => box.style.background = `url(${imgUrl}) center/contain no-repeat`;
        i.onerror = () => fallback?.style.display = 'flex';
        i.src = imgUrl;
        link?.classList.replace('casinoLink', 'casinoLinkremoved');
    }

    el.onload = () => el.style.opacity = 1;
    el.onerror = fail;

    if (el.complete && el.naturalWidth === 0) fail();
}

function processSVG() {
    document.querySelectorAll('.crash__svg__object').forEach(handleMedia);
}

setTimeout(processSVG, 150);
window.addEventListener('load', processSVG);

/* ===================== MUTATION OBSERVER ===================== */
new MutationObserver(processSVG).observe(document.body, {
    childList: true,
    subtree: true
});

/* ===================== SWIPER FACTORY ===================== */
function initSwiper(sel, slides = 4) {
    return new Swiper(sel, {
        slidesPerView: slides,
        spaceBetween: 20,
        loop: true,
        speed: 500,
        autoplay: { delay: 3000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        on: {
            init: processSVG,
            slideChange: processSVG
        }
    });
}

const swiperMobile = initSwiper('.crash__games__mobile', 'auto');
const swiperTop = initSwiper('.ks_mycrash_game_ab');
const swiperBottom = initSwiper('.ks_mycrash_game_ab2');

/* ===================== AUTOPLAY RECOVERY ===================== */
function ensureAutoplay() {
    [swiperMobile, swiperTop, swiperBottom].forEach(s =>
        s?.autoplay && !s.autoplay.running && s.autoplay.start()
    );
}

setInterval(ensureAutoplay, 10000);
document.addEventListener('visibilitychange', () => !document.hidden && ensureAutoplay());
