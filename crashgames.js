/* =========================================================
   CRASH GAMES HORIZONTAL AUTOPLAY + PROGRESS BAR
========================================================= */
var $crashGamesSec = $('.crash__games__sec');
var $crashGamesBar = $('.crash__games__bar');
var $children = $crashGamesSec.children();
var childWidth = $children.first().outerWidth(true);
var totalChildren = $children.length;
var currentIndex = 0;
var scrollTimer;

$('.crash__games__scroll__sec').toggle(totalChildren > 1);

function updateBarWidth() {
    var scrollLeft = $crashGamesSec.scrollLeft();
    var maxScroll = $crashGamesSec.prop('scrollWidth') - $crashGamesSec.width();
    var width = maxScroll ? 5 + (scrollLeft / maxScroll) * 95 : 5;
    $crashGamesBar.css('width', width + '%');
}

function autoplayScroll() {
    currentIndex++;
    if (currentIndex >= totalChildren) {
        currentIndex = 0;
        $crashGamesSec.animate({ scrollLeft: 0 }, 500);
    } else {
        $crashGamesSec.animate({ scrollLeft: currentIndex * childWidth }, 500);
    }
    updateBarWidth();
}

function resetAutoplay() {
    clearInterval(scrollTimer);
    scrollTimer = setInterval(autoplayScroll, 3000);
}

$crashGamesSec.on('scroll', function () {
    currentIndex = Math.round(this.scrollLeft / childWidth);
    updateBarWidth();
    resetAutoplay();
});

resetAutoplay();

/* =========================================================
   SVG / IMG FALLBACK HANDLER (OBJECT + IMG)
========================================================= */
var svgHandler = (function () {
    const processed = new WeakSet();

    function handleMedia(el) {
        if (processed.has(el)) return;
        processed.add(el);

        const container = el.closest('.svg__object__container');
        const link = el.closest('.casinoLink, .casinoLinkremoved');
        const fallback = container?.querySelector('.svg__fallback');
        const dataImage = link?.getAttribute('data-image');

        function showFallback() {
            el.style.display = 'none';

            if (dataImage && container) {
                const img = new Image();
                img.onload = function () {
                    container.style.backgroundImage = 'url(' + dataImage + ')';
                    container.style.backgroundSize = 'contain';
                    container.style.backgroundPosition = 'center';
                    container.style.backgroundRepeat = 'no-repeat';
                    fallback && (fallback.style.display = 'none');
                };
                img.onerror = function () {
                    fallback && (fallback.style.display = 'flex');
                };
                img.src = dataImage;
            } else {
                fallback && (fallback.style.display = 'flex');
            }

            if (link) {
                link.classList.remove('casinoLink');
                link.classList.add('casinoLinkremoved');
            }
        }

        el.onload = function () {
            el.style.opacity = '1';
            fallback && (fallback.style.display = 'none');
        };

        el.onerror = showFallback;

        if (el.complete && el.naturalWidth === 0) {
            showFallback();
        }
    }

    function processAll() {
        document.querySelectorAll('.crash__svg__object').forEach(handleMedia);
    }

    return { processAll };
})();

/* =========================================================
   MUTATION OBSERVER (DOM CHANGES / REMOVALS)
========================================================= */
document.querySelectorAll('.svg__object__container').forEach(function (container) {
    new MutationObserver(svgHandler.processAll).observe(container, {
        childList: true
    });
});

new MutationObserver(svgHandler.processAll).observe(document.body, {
    childList: true,
    subtree: true
});

/* =========================================================
   SWIPER FACTORY (MOBILE + TOP + BOTTOM)
========================================================= */
function initSwiper(selector, slides) {
    return new Swiper(selector, {
        loop: true,
        slidesPerView: slides,
        spaceBetween: 20,
        speed: 500,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        on: {
            init: function () {
                this.autoplay?.start();
                setTimeout(svgHandler.processAll, 150);
            },
            slideChange: function () {
                setTimeout(svgHandler.processAll, 100);
            }
        }
    });
}

var swiperMobile = initSwiper('.crash__games__mobile', 'auto');
var swiperTopRow = initSwiper('.ks_mycrash_game_ab', 4);
var swiperBottomRow = initSwiper('.ks_mycrash_game_ab2', 4);

/* =========================================================
   AUTOPLAY RECOVERY (BFCache / TAB SWITCH)
========================================================= */
function ensureAutoplayRunning() {
    [swiperMobile, swiperTopRow, swiperBottomRow].forEach(function (swiper) {
        if (swiper?.autoplay && !swiper.autoplay.running) {
            swiper.autoplay.start();
        }
    });
}

setInterval(ensureAutoplayRunning, 10000);

document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
        setTimeout(ensureAutoplayRunning, 1000);
    }
});

/* =========================================================
   INITIAL LOAD SAFETY
========================================================= */
document.addEventListener('DOMContentLoaded', svgHandler.processAll);
window.addEventListener('load', function () {
    setTimeout(svgHandler.processAll, 200);
    setTimeout(svgHandler.processAll, 500);
});
