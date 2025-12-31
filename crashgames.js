var $crashGamesSec = $('.crash__games__sec');
var $crashGamesBar = $('.crash__games__bar');
var $children = $crashGamesSec.children();
var childWidth = $children.first().outerWidth(true);
var totalChildren = $children.length;
var currentIndex = 0;
var direction = 1;
var scrollTimer;
let data = 0;

if ($('.crash__games__sec__clmn').length <= 1) {
    $('.crash__games__scroll__sec').hide();
} else {
    $('.crash__games__scroll__sec').show();
}

function updateBarWidth() {
    var scrollLeft = $crashGamesSec.scrollLeft();
    var scrollWidth = $crashGamesSec.prop('scrollWidth');
    var clientWidth = $crashGamesSec.width();
    var maxBarWidth = 100;
    var minBarWidth = 5;
    var calculatedWidth = (scrollLeft / (scrollWidth - clientWidth)) * maxBarWidth;
    var barWidth = minBarWidth + calculatedWidth;
    $crashGamesBar.css({
        width: barWidth + '%'
        
    });
}

function autoplay() {
    if (data >= totalChildren - 1) {
        data = 0;
        direction = -1;
        setTimeout(function () {
            $crashGamesSec.animate({ scrollLeft: 0 }, 500, function () {
                currentIndex = 0;
                direction = 1;
                resetAutoplay();
            });
            updateBarWidth();
        }, 100);
    } else {
        currentIndex = currentIndex + 1;
        var newScrollLeft = currentIndex * childWidth;
        $crashGamesSec.animate({ scrollLeft: newScrollLeft }, 500);
        updateBarWidth();
        data += 1;
    }
}

function resetAutoplay() {
    clearInterval(scrollTimer);
    scrollTimer = setInterval(autoplay, 3000);
}

$crashGamesSec.on('scroll', function () {
    updateBarWidth();
    var scrollLeft = $crashGamesSec.scrollLeft();
    currentIndex = Math.round(scrollLeft / childWidth);
    if (scrollLeft === 0) {
        $crashGamesSec.addClass('at-left');
    } else {
        $crashGamesSec.removeClass('at-left');
    }
    resetAutoplay();
});

scrollTimer = setInterval(autoplay, 3000);


var swiperMobile = new Swiper('.crash__games__mobile', {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    autoplay: false,
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        640: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        768: {
            slidesPerView: 1,
            spaceBetween: 10
        },
        1024: {
            slidesPerView: 1,
            spaceBetween: 10
        }
    }
});


var swiperTopRow = new Swiper(".ks_mycrash_game_ab", {
    slidesPerView: 4,
    spaceBetween: 20,
    mousewheel: {
        forceToAxis: true,
        sensitivity: 1,
        releaseOnEdges: true,
    },
    autoplay: false,
    speed: 500,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
});


var swiperBottomRow = new Swiper(".ks_mycrash_game_ab2", {
    slidesPerView: 4,
    spaceBetween: 20,
    mousewheel: {
        forceToAxis: true,
        sensitivity: 1,
        releaseOnEdges: true,
    },
    autoplay: false,
    speed: 500,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
});
document.addEventListener('DOMContentLoaded', function () {
    function setupFallbackDetection(container) {
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.removedNodes.forEach(function (node) {
                    if (node.classList && node.classList.contains('crash__svg__object')) {
                        const parentLink = mutation.target.closest('.casinoLink, .casinoLinkremoved');
                        const dataImage = parentLink ? parentLink.getAttribute('data-image') : null;
                        const fallback = mutation.target.querySelector('.svg__fallback');
                        if (dataImage) {
                            const testImage = new Image();
                            testImage.onload = function () {
                                mutation.target.style.backgroundImage = 'url(' + dataImage + ')';
                                mutation.target.style.backgroundSize = 'contain';
                                mutation.target.style.backgroundPosition = 'center';
                                mutation.target.style.backgroundRepeat = 'no-repeat';
                                if (fallback) {
                                    fallback.style.display = 'none';
                                }
                            };
                            testImage.onerror = function () {
                                if (fallback) {
                                    fallback.style.display = 'flex';
                                }
                                if (parentLink) {
                                    parentLink.classList.remove('casinoLink');
                                    parentLink.classList.add('casinoLinkremoved');
                                }
                            };
                            testImage.src = dataImage;
                        } else {
                            if (fallback) {
                                fallback.style.display = 'flex';
                            }
                            if (parentLink) {
                                parentLink.classList.remove('casinoLink');
                                parentLink.classList.add('casinoLinkremoved');
                            }
                        }
                    }
                });
            });
        });
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }
    document.querySelectorAll('.svg__object__container').forEach(setupFallbackDetection);
    function isSvgLoaded(svgObject) {
        if (!svgObject) return false;
        
        try {
            // Check various indicators that SVG is loaded
            if (svgObject.contentDocument) return true;
            if (svgObject.getSVGDocument && svgObject.getSVGDocument()) return true;
            if (svgObject.data && svgObject.readyState === 4) return true;
            if (svgObject.complete) return true;
            
            // Check dimensions as indicator of content
            if (svgObject.offsetWidth > 10 || svgObject.offsetHeight > 10) {
                return true;
            }
        } catch (e) {
            // Cross-origin or other errors - ignore
            console.debug('SVG check error:', e);
        }
        
        return false;
    }
    document.querySelectorAll('.casinoLink').forEach(function (link) {
        const dataImage = link.getAttribute('data-image');
        const container = link.querySelector('.svg__object__container');
        const svgObject = link.querySelector('.crash__svg__object');
        const fallback = link.querySelector('.svg__fallback');
        if (container && svgObject) {
            const originalOpacity = svgObject.style.opacity || '';
            if (isSvgLoaded(svgObject)) {
                svgObject.style.opacity = '1';
                container.style.backgroundImage = 'none';
                if (fallback) {
                    fallback.style.display = 'none';
                }
                return;
            }
            svgObject.style.opacity = '0';
            if (dataImage) {
                const testImage = new Image();
                testImage.onload = function () {
                    container.style.backgroundImage = 'url(' + dataImage + ')';
                    container.style.backgroundSize = 'contain';
                    container.style.backgroundPosition = 'center';
                    container.style.backgroundRepeat = 'no-repeat';
                };
                testImage.onerror = function () {
                    if (fallback) {
                        fallback.style.display = 'flex';
                        link.classList.remove('casinoLink');
                        link.classList.add('casinoLinkremoved');
                    }
                };
                testImage.src = dataImage;
            } else {
                if (fallback) {
                    fallback.style.display = 'flex';
                    link.classList.remove('casinoLink');
                    link.classList.add('casinoLinkremoved');
                }
            }
            function onSvgLoad() {
                svgObject.style.opacity = '1';
                container.style.backgroundImage = 'none';
                if (fallback) {
                    fallback.style.display = 'none';
                }
                svgObject.removeEventListener('load', onSvgLoad);
                svgObject.removeEventListener('error', onSvgError);
            }
            function onSvgError() {
                svgObject.style.display = 'none';
                container.style.backgroundImage = 'none';
                if (fallback) {
                    fallback.style.display = 'flex';
                    link.classList.remove('casinoLink');
                    link.classList.add('casinoLinkremoved');
                }
                svgObject.removeEventListener('load', onSvgLoad);
                svgObject.removeEventListener('error', onSvgError);
            }
            svgObject.addEventListener('load', onSvgLoad);
            svgObject.addEventListener('error', onSvgError);
            setTimeout(() => {
                if (svgObject.style.opacity === '0' && isSvgLoaded(svgObject)) {
                    onSvgLoad();
                }
            }, 100);
            setTimeout(() => {
                if (svgObject.style.opacity === '0' && isSvgLoaded(svgObject)) {
                    onSvgLoad();
                }
            }, 500);
        }
    });
    let autoplayStarted = false;
    let skeletonObserver = null;
    function checkAndStartAutoplay() {
        if (autoplayStarted) return true;
        const skeleton = document.querySelector('.sportsbook_page_skeleton');
        if (!skeleton ||
            skeleton.style.display === 'none' ||
            !skeleton.offsetParent ||
            skeleton.classList.contains('d-none') ||
            window.getComputedStyle(skeleton).display === 'none') {
            setTimeout(function () {
                [
                    typeof swiperTopRow !== 'undefined' ? swiperTopRow : null,
                    typeof swiperBottomRow !== 'undefined' ? swiperBottomRow : null,
                    typeof swiperMobile !== 'undefined' ? swiperMobile : null
                ].forEach(function (swiper) {
                    try {
                        if (swiper && swiper.autoplay && !swiper.autoplay.running) {
                            swiper.autoplay.start();
                        }
                    } catch (e) {
                    }
                });
                autoplayStarted = true;
                if (skeletonObserver) {
                    skeletonObserver.disconnect();
                    skeletonObserver = null;
                }
            }, 100);
            return true;
        }
        return false;
    }
    
    if (!checkAndStartAutoplay()) {
        const skeleton = document.querySelector('.sportsbook_page_skeleton');
        if (skeleton) {
            skeletonObserver = new MutationObserver(function (mutations) {
                if (checkAndStartAutoplay()) {
                    skeletonObserver.disconnect();
                    skeletonObserver = null;
                }
            });
            skeletonObserver.observe(skeleton, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            skeletonObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            setTimeout(() => {
                if (skeletonObserver) {
                    skeletonObserver.disconnect();
                    skeletonObserver = null;
                    if (!autoplayStarted) {
                        setTimeout(() => {
                            startAllAutoplay();
                        }, 500);
                    }
                }
            }, 10000);
        } else {
            setTimeout(() => {
                startAllAutoplay();
            }, 1000);
        }
    }
    
    function startAllAutoplay() {
        if (autoplayStarted) return;
        [
            typeof swiperTopRow !== 'undefined' ? swiperTopRow : null,
            typeof swiperBottomRow !== 'undefined' ? swiperBottomRow : null,
            typeof swiperMobile !== 'undefined' ? swiperMobile : null
        ].forEach(function (swiper) {
            try {
                if (swiper && swiper.autoplay) {
                    if (!swiper.autoplay.running) {
                        swiper.autoplay.start();
                    }
                }
            } catch (e) {
            }
        });
        autoplayStarted = true;
    }
    
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && autoplayStarted) {
            setTimeout(() => {
                startAllAutoplay();
            }, 300);
        }
    });
    window.addEventListener('load', function() {
        document.querySelectorAll('.casinoLink .crash__svg__object').forEach(function(svgObject) {
            if (svgObject.style.opacity === '0' || svgObject.style.opacity === '') {
                if (isSvgLoaded(svgObject)) {
                    svgObject.style.opacity = '1';
                    const container = svgObject.closest('.svg__object__container');
                    if (container) {
                        container.style.backgroundImage = 'none';
                    }
                    const fallback = svgObject.querySelector('.svg__fallback');
                    if (fallback) {
                        fallback.style.display = 'none';
                    }
                }
            }
        });
    });
});