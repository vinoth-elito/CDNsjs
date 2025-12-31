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

// Global SVG handler
var svgHandler = (function() {
    const processedLinks = new WeakSet();
    
    function isSvgLoaded(svgObject) {
        if (!svgObject) return false;
        
        try {
            // Try to access contentDocument
            const doc = svgObject.contentDocument;
            if (doc) {
                const svgElement = doc.querySelector('svg');
                if (svgElement) {
                    return true;
                }
            }
            
            // Alternative method
            if (svgObject.getSVGDocument) {
                try {
                    const svgDoc = svgObject.getSVGDocument();
                    if (svgDoc && svgDoc.querySelector('svg')) {
                        return true;
                    }
                } catch (e) {
                    // CORS blocked - but check if it visually loaded
                }
            }
        } catch (e) {
            // CORS or access denied - check alternate indicators
        }
        
        // If we can't access content due to CORS, check visual indicators
        // If the object has dimensions and data attribute, assume it loaded
        if (svgObject.offsetWidth > 0 && svgObject.offsetHeight > 0) {
            const dataUrl = svgObject.getAttribute('data');
            if (dataUrl && dataUrl.trim() !== '') {
                // Object is visible with valid data - likely loaded successfully despite CORS
                return true;
            }
        }
        
        return false;
    }
    
    function testSvgUrl(url, onSuccess, onError) {
        // Test if the SVG URL is accessible
        const testImg = new Image();
        testImg.onload = function() {
            onSuccess();
        };
        testImg.onerror = function() {
            onError();
        };
        testImg.src = url;
    }
    
    function handleSvgElement(link) {
        if (processedLinks.has(link)) return;
        processedLinks.add(link);
        
        const dataImage = link.getAttribute('data-image');
        const container = link.querySelector('.svg__object__container');
        const svgObject = link.querySelector('.crash__svg__object');
        const fallback = link.querySelector('.svg__fallback');
        
        if (!container || !svgObject) return;
        
        const svgDataUrl = svgObject.getAttribute('data');
        
        // If no data URL at all, show fallback immediately
        if (!svgDataUrl || svgDataUrl.trim() === '') {
            svgObject.style.opacity = '0';
            svgObject.style.display = 'none';
            if (fallback) {
                fallback.style.display = 'flex';
            }
            link.classList.remove('casinoLink');
            link.classList.add('casinoLinkremoved');
            return;
        }
        
        let resolved = false;
        let checkInterval;
        let maxTimeout;
        let loadEventFired = false;
        let errorEventFired = false;
        
        function markAsLoaded() {
            if (resolved) return;
            resolved = true;
            
            clearInterval(checkInterval);
            clearTimeout(maxTimeout);
            
            // SVG loaded successfully
            svgObject.style.opacity = '1';
            svgObject.style.display = '';
            container.style.backgroundImage = 'none';
            if (fallback) {
                fallback.style.display = 'none';
            }
        }
        
        function markAsFailed() {
            if (resolved) return;
            resolved = true;
            
            clearInterval(checkInterval);
            clearTimeout(maxTimeout);
            
            // SVG failed to load - show fallback
            svgObject.style.opacity = '0';
            svgObject.style.display = 'none';
            
            if (fallback) {
                fallback.style.display = 'flex';
            }
            link.classList.remove('casinoLink');
            link.classList.add('casinoLinkremoved');
        }
        
        // Setup background image (if available)
        if (dataImage) {
            const testImage = new Image();
            testImage.onload = function () {
                container.style.backgroundImage = 'url(' + dataImage + ')';
                container.style.backgroundSize = 'contain';
                container.style.backgroundPosition = 'center';
                container.style.backgroundRepeat = 'no-repeat';
            };
            testImage.src = dataImage;
        }
        
        // Check if already loaded
        if (isSvgLoaded(svgObject)) {
            markAsLoaded();
            return;
        }
        
        // Start hidden until we know the result
        svgObject.style.opacity = '0';
        
        // Listen for successful load
        svgObject.addEventListener('load', function onLoad() {
            loadEventFired = true;
            // Wait a bit for rendering
            setTimeout(function() {
                if (!errorEventFired) {
                    // Load event fired - consider it successful
                    // Even if we can't access contentDocument due to CORS
                    markAsLoaded();
                }
            }, 100);
            svgObject.removeEventListener('load', onLoad);
        }, { once: true });
        
        // Listen for error
        svgObject.addEventListener('error', function onError() {
            errorEventFired = true;
            markAsFailed();
            svgObject.removeEventListener('error', onError);
        }, { once: true });
        
        // Test the URL accessibility as backup
        testSvgUrl(svgDataUrl, 
            function() {
                // URL is accessible - if load event doesn't fire, still consider checking
            },
            function() {
                // URL returned error - mark as failed
                if (!loadEventFired && !resolved) {
                    setTimeout(function() {
                        if (!loadEventFired && !resolved) {
                            markAsFailed();
                        }
                    }, 1000);
                }
            }
        );
        
        // Polling mechanism - check every 150ms
        let checkCount = 0;
        const maxChecks = 30; // 4.5 seconds total (30 * 150ms)
        
        checkInterval = setInterval(function() {
            checkCount++;
            
            if (errorEventFired) {
                // Already failed
                return;
            }
            
            if (loadEventFired || isSvgLoaded(svgObject)) {
                // Successfully loaded
                markAsLoaded();
            } else if (checkCount >= maxChecks) {
                // Timeout reached
                // Check one more time if it has visual dimensions (CORS case)
                if (svgObject.offsetWidth > 0 && svgObject.offsetHeight > 0) {
                    // Has dimensions - likely loaded but CORS blocked access
                    markAsLoaded();
                } else {
                    // No dimensions - failed
                    markAsFailed();
                }
            }
        }, 150);
        
        // Absolute maximum timeout (6 seconds)
        maxTimeout = setTimeout(function() {
            if (!resolved) {
                // Final check
                if (loadEventFired || isSvgLoaded(svgObject) || 
                    (svgObject.offsetWidth > 0 && svgObject.offsetHeight > 0)) {
                    markAsLoaded();
                } else {
                    markAsFailed();
                }
            }
        }, 6000);
    }
    
    function processAllLinks() {
        document.querySelectorAll('.casinoLink').forEach(handleSvgElement);
    }
    
    return {
        processAllLinks: processAllLinks,
        handleSvgElement: handleSvgElement
    };
})();

// Initialize Swipers with proper callbacks
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
                });
            });
        });
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }
    
    document.querySelectorAll('.svg__object__container').forEach(setupFallbackDetection);
    
    // Initial processing
    svgHandler.processAllLinks();
    
    // Re-check on window load with staggered delays
    window.addEventListener('load', function() {
        setTimeout(svgHandler.processAllLinks, 200);
        setTimeout(svgHandler.processAllLinks, 500);
        setTimeout(svgHandler.processAllLinks, 1000);
        setTimeout(svgHandler.processAllLinks, 2000);
    });
    
    // Autoplay management
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
                [swiperTopRow, swiperBottomRow, swiperMobile].forEach(function (swiper) {
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
        [swiperTopRow, swiperBottomRow, swiperMobile].forEach(function (swiper) {
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
});

console.log('test     dsdsdsdsdsdsd');