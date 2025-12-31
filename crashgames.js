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

// Global SVG handler for both IMG and OBJECT tags
var svgHandler = (function() {
    const processedLinks = new WeakSet();
    const processedElements = new WeakSet();
    
    function testUrl(url, onSuccess, onError) {
        const testImg = new Image();
        testImg.onload = function() {
            onSuccess();
        };
        testImg.onerror = function() {
            onError();
        };
        testImg.src = url;
    }
    
    function handleMediaElement(element, link) {
        if (processedElements.has(element)) return;
        processedElements.add(element);
        
        const container = element.closest('.svg__object__container');
        const fallback = container ? container.querySelector('.svg__fallback') : null;
        const dataImage = link ? link.getAttribute('data-image') : null;
        const isObject = element.tagName === 'OBJECT';
        const isImg = element.tagName === 'IMG';
        
        let resolved = false;
        
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
            
            // Try to use data-image as fallback
            if (dataImage && container) {
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
                    // Both element and data-image failed - show fallback
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
                // No data-image available - show fallback
                if (fallback) {
                    fallback.style.display = 'flex';
                }
                if (link) {
                    link.classList.remove('casinoLink');
                    link.classList.add('casinoLinkremoved');
                }
            }
        }
        
        // Get the URL
        let mediaUrl = '';
        if (isObject) {
            mediaUrl = element.getAttribute('data');
        } else if (isImg) {
            mediaUrl = element.getAttribute('src');
        }
        
        // If no data URL at all, show fallback immediately
        if (!mediaUrl || mediaUrl.trim() === '') {
            setTimeout(function() {
                markAsFailed();
            }, 100);
            return;
        }
        
        // Test URL first (works for both img and object URLs)
        testUrl(mediaUrl, 
            function() {
                // URL is accessible
                element.style.opacity = '0';
                
                // For IMG tags, let browser handle loading
                if (isImg) {
                    // Set up load/error listeners for img
                    element.addEventListener('load', function onLoad() {
                        markAsLoaded();
                        element.removeEventListener('load', onLoad);
                    }, { once: true });
                    
                    element.addEventListener('error', function onError() {
                        markAsFailed();
                        element.removeEventListener('error', onError);
                    }, { once: true });
                    
                    // If img already loaded
                    if (element.complete) {
                        if (element.naturalHeight > 0 && element.naturalWidth > 0) {
                            markAsLoaded();
                        } else {
                            markAsFailed();
                        }
                    }
                } 
                // For OBJECT tags
                else if (isObject) {
                    // Set up load/error listeners for object
                    element.addEventListener('load', function onLoad() {
                        // Object "load" event fired - check if it actually loaded
                        setTimeout(function() {
                            // Check if object has content (but don't rely on contentDocument due to CORS)
                            // Just assume if load event fired and no error, it's loaded
                            markAsLoaded();
                        }, 200);
                        element.removeEventListener('load', onLoad);
                    }, { once: true });
                    
                    element.addEventListener('error', function onError() {
                        markAsFailed();
                        element.removeEventListener('error', onError);
                    }, { once: true });
                    
                    // Alternative: Check object dimensions after a delay
                    setTimeout(function() {
                        if (!resolved) {
                            // If object has dimensions, assume it loaded
                            if (element.offsetWidth > 0 && element.offsetHeight > 0) {
                                markAsLoaded();
                            } else {
                                markAsFailed();
                            }
                        }
                    }, 2000);
                }
                
                // Overall timeout for both
                setTimeout(function() {
                    if (!resolved) {
                        markAsFailed();
                    }
                }, 5000);
            },
            function() {
                // URL is NOT accessible - mark as failed immediately
                setTimeout(function() {
                    markAsFailed();
                }, 100);
            }
        );
    }
    
    function handleSvgElement(link) {
        if (processedLinks.has(link)) return;
        processedLinks.add(link);
        
        const container = link.querySelector('.svg__object__container');
        if (!container) return;
        
        // Check for object element first
        const objectElement = container.querySelector('object.crash__svg__object');
        const imgElement = container.querySelector('img.crash__svg__object');
        
        // Handle object element if present (priority for SVG)
        if (objectElement) {
            handleMediaElement(objectElement, link);
            return;
        }
        
        // Handle img element if present
        if (imgElement) {
            handleMediaElement(imgElement, link);
            return;
        }
        
        // If no media element found, show fallback
        const fallback = link.querySelector('.svg__fallback');
        if (fallback) {
            fallback.style.display = 'flex';
        }
        link.classList.remove('casinoLink');
        link.classList.add('casinoLinkremoved');
    }
    
    function processAllLinks() {
        // Process all casino links
        document.querySelectorAll('.casinoLink').forEach(handleSvgElement);
        
        // Also process any media elements that might not be in .casinoLink containers
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

// Initialize Swipers with autoplay ALWAYS enabled
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
            // Force start autoplay immediately
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
            // Force start autoplay immediately
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
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.removedNodes.forEach(function (node) {
                    // Handle OBJECT or IMG element removal
                    if ((node.classList && node.classList.contains('crash__svg__object')) || 
                        (node.tagName && (node.tagName.toLowerCase() === 'object' || node.tagName.toLowerCase() === 'img'))) {
                        
                        const parentLink = mutation.target.closest('.casinoLink, .casinoLinkremoved');
                        const dataImage = parentLink ? parentLink.getAttribute('data-image') : null;
                        const fallback = mutation.target.querySelector('.svg__fallback');
                        
                        if (dataImage && mutation.target) {
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
    
    // Function to restart autoplay if it stops
    function ensureAutoplayRunning() {
        [swiperMobile, swiperTopRow, swiperBottomRow].forEach(function(swiper) {
            if (swiper && swiper.autoplay && !swiper.autoplay.running) {
                console.log('Restarting autoplay for swiper');
                swiper.autoplay.start();
            }
        });
    }
    
    // Periodically check and restart autoplay if it stops
    setInterval(ensureAutoplayRunning, 10000);
    
    // Also check when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Page is visible again, ensure autoplay is running
            setTimeout(ensureAutoplayRunning, 1000);
        }
    });
});

console.log('Swiper autoplay ALWAYS enabled with OBJECT/IMG support hghg');