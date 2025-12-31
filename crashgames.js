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
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },
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
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
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
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    speed: 500,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
});
var swiperMobile = new Swiper('.crash__games__mobile', {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    autoplay: false,
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    on: {
        init: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 150);
        },
        slideChange: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 100);
        }
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
    on: {
        init: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 150);
        },
        slideChange: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 100);
        }
    }
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
    on: {
        init: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 150);
        },
        slideChange: function() {
            setTimeout(function() {
                svgHandler.processAllLinks();
            }, 100);
        }
    }
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
                if (node.tagName && node.tagName.toLowerCase() === 'img') {
                    const parentLink = node.closest('.casinoLink, .casinoLinkremoved');
                    const dataImage = parentLink ? parentLink.getAttribute('data-image') : null;
                    const container = node.parentElement;
                    const fallback = container ? container.querySelector('.svg__fallback') : null;
                    if (dataImage && container) {
                        const testImage = new Image();
                        testImage.onload = function () {
                            container.style.backgroundImage = 'url(' + dataImage + ')';
                            container.style.backgroundSize = 'contain';
                            container.style.backgroundPosition = 'center';
                            container.style.backgroundRepeat = 'no-repeat';
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
    svgHandler.processAllLinks();
    window.addEventListener('load', function() {
        setTimeout(svgHandler.processAllLinks, 200);
        setTimeout(svgHandler.processAllLinks, 500);
        setTimeout(svgHandler.processAllLinks, 1000);
        setTimeout(svgHandler.processAllLinks, 2000);
    });
});

console.log('vcvcvcv');