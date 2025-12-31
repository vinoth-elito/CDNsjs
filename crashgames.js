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
var svgHandler = (function() {
    const processedLinks = new WeakSet();
    const processedElements = new WeakSet();
    function handleMediaElement(element, link) {
        if (processedElements.has(element)) return;
        processedElements.add(element);
        const container = element.closest('.svg__object__container');
        const fallback = container ? container.querySelector('.svg__fallback') : null;
        const dataImage = link ? link.getAttribute('data-image') : null;
        const isObject = element.tagName === 'OBJECT';
        const isImg = element.tagName === 'IMG';
        let resolved = false;
        let backgroundImageLoaded = false;
        function markAsLoaded() {
            if (resolved) return;
            resolved = true;
            element.style.opacity = '1';
            element.style.display = '';
            if (container) {
                container.style.backgroundImage = 'none';
            }
            if (fallback) {
                fallback.style.display = 'none';
            }
        }
        function markAsFailed() {
            if (resolved) return;
            resolved = true;
            element.style.opacity = '0';
            element.style.display = 'none';
            if (dataImage && container && backgroundImageLoaded) {
                if (fallback) {
                    fallback.style.display = 'none';
                }
            } else if (dataImage && container) {
                const testImage = new Image();
                testImage.onload = function() {
                    container.style.backgroundImage = 'url(' + dataImage + ')';
                    container.style.backgroundSize = 'contain';
                    container.style.backgroundPosition = 'center';
                    container.style.backgroundRepeat = 'no-repeat';
                    if (fallback) {
                        fallback.style.display = 'none';
                    }
                };
                testImage.onerror = function() {
                    if (fallback) {
                        fallback.style.display = 'flex';
                    }
                    if (link) {
                        link.classList.remove('casinoLink');
                        link.classList.add('casinoLinkremoved');
                    }
                };
                testImage.src = dataImage;
            } else {
                if (fallback) {
                    fallback.style.display = 'flex';
                }
                if (link) {
                    link.classList.remove('casinoLink');
                    link.classList.add('casinoLinkremoved');
                }
            }
        }
        let mediaUrl = '';
        if (isObject) {
            mediaUrl = element.getAttribute('data');
        } else if (isImg) {
            mediaUrl = element.getAttribute('src');
        }
        if (!mediaUrl || mediaUrl.trim() === '') {
            setTimeout(function() {
                markAsFailed();
            }, 50);
            return;
        }
        element.style.opacity = '0';
        let mediaUrlTested = false;
        let dataImageTested = false;
        let mediaUrlAccessible = false;
        let dataImageAccessible = false;
        function checkAllTestsComplete() {
            if (mediaUrlTested && dataImageTested && !resolved) {
                if (mediaUrlAccessible) {
                    setupMediaElementLoading();
                } else {
                    if (dataImageAccessible && dataImage && container) {
                        container.style.backgroundImage = 'url(' + dataImage + ')';
                        container.style.backgroundSize = 'contain';
                        container.style.backgroundPosition = 'center';
                        container.style.backgroundRepeat = 'no-repeat';
                        backgroundImageLoaded = true;
                        if (fallback) {
                            fallback.style.display = 'none';
                        }
                        if (link) {
                            link.classList.remove('casinoLink');
                            link.classList.add('casinoLinkremoved');
                        }
                    } else {
                        markAsFailed();
                    }
                }
            }
        }
        const mediaTestImg = new Image();
        mediaTestImg.onload = function() {
            mediaUrlTested = true;
            mediaUrlAccessible = true;
            checkAllTestsComplete();
        };
        mediaTestImg.onerror = function() {
            mediaUrlTested = true;
            mediaUrlAccessible = false;
            checkAllTestsComplete();
        };
        mediaTestImg.src = mediaUrl;
        if (dataImage) {
            const dataTestImg = new Image();
            dataTestImg.onload = function() {
                dataImageTested = true;
                dataImageAccessible = true;
                backgroundImageLoaded = true;
                if (container && !resolved) {
                    container.style.backgroundImage = 'url(' + dataImage + ')';
                    container.style.backgroundSize = 'contain';
                    container.style.backgroundPosition = 'center';
                    container.style.backgroundRepeat = 'no-repeat';
                }
                checkAllTestsComplete();
            };
            dataTestImg.onerror = function() {
                dataImageTested = true;
                dataImageAccessible = false;
                checkAllTestsComplete();
            };
            dataTestImg.src = dataImage;
        } else {
            dataImageTested = true;
            dataImageAccessible = false;
            checkAllTestsComplete();
        }
        function setupMediaElementLoading() {
            if (isImg) {
                element.addEventListener('load', function onLoad() {
                    markAsLoaded();
                    element.removeEventListener('load', onLoad);
                }, { once: true });
                
                element.addEventListener('error', function onError() {
                    markAsFailed();
                    element.removeEventListener('error', onError);
                }, { once: true });
                if (element.complete) {
                    if (element.naturalHeight > 0 && element.naturalWidth > 0) {
                        markAsLoaded();
                    } else {
                        markAsFailed();
                    }
                }
            } else if (isObject) {
                element.addEventListener('load', function onLoad() {
                    setTimeout(function() {
                        markAsLoaded();
                    }, 100);
                    element.removeEventListener('load', onLoad);
                }, { once: true }); 
                element.addEventListener('error', function onError() {
                    markAsFailed();
                    element.removeEventListener('error', onError);
                }, { once: true });
                setTimeout(function() {
                    if (!resolved && element.offsetWidth > 0 && element.offsetHeight > 0) {
                        markAsLoaded();
                    }
                }, 500);
            }
            setTimeout(function() {
                if (!resolved) {
                    markAsFailed();
                }
            }, 3000);
        }
    }
    function handleSvgElement(link) {
        if (processedLinks.has(link)) return;
        processedLinks.add(link);
        const container = link.querySelector('.svg__object__container');
        if (!container) return;
        const objectElement = container.querySelector('object.crash__svg__object');
        const imgElement = container.querySelector('img.crash__svg__object');
        if (objectElement) {
            handleMediaElement(objectElement, link);
            return;
        }
        if (imgElement) {
            handleMediaElement(imgElement, link);
            return;
        }
        const fallback = link.querySelector('.svg__fallback');
        if (fallback) {
            fallback.style.display = 'flex';
        }
        link.classList.remove('casinoLink');
        link.classList.add('casinoLinkremoved');
    }
    function processAllLinks() {
        document.querySelectorAll('.casinoLink').forEach(handleSvgElement);
        document.querySelectorAll('.svg__object__container object, .svg__object__container img').forEach(function(element) {
            if (!processedElements.has(element)) {
                const link = element.closest('.casinoLink, .casinoLinkremoved');
                handleMediaElement(element, link);
            }
        });
    }
    return {
        processAllLinks: processAllLinks,
        handleSvgElement: handleSvgElement
    };
})();
var swiperMobile = new Swiper('.crash__games__mobile', {
    loop: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        waitForTransition: true,
        stopOnLastSlide: false
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    on: {
        init: function() {
            if (this.autoplay && !this.autoplay.running) {
                this.autoplay.start();
            }
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
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        waitForTransition: true,
        stopOnLastSlide: false 
    },
    speed: 500,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
    on: {
        init: function() {
            if (this.autoplay && !this.autoplay.running) {
                this.autoplay.start();
            }
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
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
        waitForTransition: true,
        stopOnLastSlide: false
    },
    speed: 500,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    loop: true,
    on: {
        init: function() {
            if (this.autoplay && !this.autoplay.running) {
                this.autoplay.start();
            }
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
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    for (let i = 0; i < mutation.removedNodes.length; i++) {
                        const node = mutation.removedNodes[i];
                        if (node.nodeType === 1) {
                            const isTargetElement = (
                                (node.classList && node.classList.contains('crash__svg__object')) ||
                                (node.tagName && (
                                    node.tagName.toLowerCase() === 'object' || 
                                    node.tagName.toLowerCase() === 'img'
                                ))
                            );
                            if (isTargetElement) {
                                const container = mutation.target;
                                const parentLink = container.closest('.casinoLink, .casinoLinkremoved');
                                const dataImage = parentLink ? parentLink.getAttribute('data-image') : null;
                                const fallback = container.querySelector('.svg__fallback');
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
                        }
                    }
                }
            });
        });
        observer.observe(container, {
            childList: true,
            subtree: false
        });
        container._fallbackObserver = observer;
    }
    document.querySelectorAll('.svg__object__container').forEach(setupFallbackDetection);
    const globalObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('svg__object__container')) {
                            setupFallbackDetection(node);
                        }
                        if (node.querySelectorAll) {
                            const containers = node.querySelectorAll('.svg__object__container');
                            containers.forEach(function(container) {
                                if (!container._fallbackObserver) {
                                    setupFallbackDetection(container);
                                }
                            });
                        }
                    }
                });
            }
        });
    });
    globalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    setTimeout(function() {
        svgHandler.processAllLinks();
    }, 100);
    window.addEventListener('load', function() {
        setTimeout(svgHandler.processAllLinks, 200);
        setTimeout(svgHandler.processAllLinks, 500);
        setTimeout(svgHandler.processAllLinks, 1000);
    });
    function ensureAutoplayRunning() {
        [swiperMobile, swiperTopRow, swiperBottomRow].forEach(function(swiper) {
            if (swiper && swiper.autoplay && !swiper.autoplay.running) {
                swiper.autoplay.start();
            }
        });
    }
    setInterval(ensureAutoplayRunning, 10000);
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(ensureAutoplayRunning, 1000);
        }
    });
    window.addEventListener('beforeunload', function() {
        document.querySelectorAll('.svg__object__container').forEach(function(container) {
            if (container._fallbackObserver) {
                container._fallbackObserver.disconnect();
            }
        });
        if (globalObserver) {
            globalObserver.disconnect();
        }
    });
});