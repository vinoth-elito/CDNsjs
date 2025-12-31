// Main carousel functionality
var $crashGamesSec = $('.crash__games__sec');
var $crashGamesBar = $('.crash__games__bar');
var $children = $crashGamesSec.children();
var childWidth = $children.first().outerWidth(true);
var totalChildren = $children.length;
var currentIndex = 0;
var direction = 1;
var scrollTimer;

// Show/hide scroll controls based on item count
$('.crash__games__scroll__sec').toggle($children.length > 1);

function updateBarWidth() {
    var scrollLeft = $crashGamesSec.scrollLeft();
    var scrollWidth = $crashGamesSec.prop('scrollWidth');
    var clientWidth = $crashGamesSec.width();
    var maxBarWidth = 100;
    var minBarWidth = 5;
    var calculatedWidth = (scrollLeft / (scrollWidth - clientWidth)) * maxBarWidth;
    var barWidth = minBarWidth + calculatedWidth;
    $crashGamesBar.css('width', barWidth + '%');
}

function autoplay() {
    if (currentIndex >= totalChildren - 1) {
        currentIndex = 0;
        $crashGamesSec.animate({ scrollLeft: 0 }, 500);
    } else {
        currentIndex++;
        $crashGamesSec.animate({ scrollLeft: currentIndex * childWidth }, 500);
    }
    updateBarWidth();
}

function resetAutoplay() {
    clearInterval(scrollTimer);
    scrollTimer = setInterval(autoplay, 3000);
}

// Event handlers
$crashGamesSec.on('scroll', function() {
    updateBarWidth();
    currentIndex = Math.round($crashGamesSec.scrollLeft() / childWidth);
    $crashGamesSec.toggleClass('at-left', $crashGamesSec.scrollLeft() === 0);
    resetAutoplay();
});

scrollTimer = setInterval(autoplay, 3000);

// SVG/Image handler
var svgHandler = (function() {
    const processedElements = new WeakSet();

    function handleMediaElement(element, link) {
        if (processedElements.has(element)) return;
        processedElements.add(element);

        const container = element.closest('.svg__object__container');
        const fallback = container?.querySelector('.svg__fallback');
        const dataImage = link?.getAttribute('data-image');
        const mediaUrl = element.getAttribute(element.tagName === 'OBJECT' ? 'data' : 'src');

        if (!mediaUrl?.trim()) {
            handleMediaFailure(link, container, fallback, dataImage);
            return;
        }

        element.style.opacity = '0';
        
        // Test both media and fallback images
        Promise.all([
            testImage(mediaUrl),
            dataImage ? testImage(dataImage) : Promise.resolve(false)
        ]).then(([mediaAccessible, dataAccessible]) => {
            if (mediaAccessible) {
                setupMediaLoading(element, link, container, fallback);
            } else if (dataAccessible && container) {
                container.style.backgroundImage = `url(${dataImage})`;
                container.style.backgroundSize = 'contain';
                container.style.backgroundPosition = 'center';
                container.style.backgroundRepeat = 'no-repeat';
                updateLinkState(link, false);
                hideFallback(fallback);
            } else {
                handleMediaFailure(link, container, fallback, dataImage);
            }
        });
    }

    function testImage(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    function setupMediaLoading(element, link, container, fallback) {
        const isImg = element.tagName === 'IMG';
        
        element.addEventListener('load', () => handleMediaSuccess(element, link, container, fallback), { once: true });
        element.addEventListener('error', () => handleMediaFailure(link, container, fallback), { once: true });

        if (isImg && element.complete) {
            element.naturalHeight > 0 && element.naturalWidth > 0 
                ? handleMediaSuccess(element, link, container, fallback)
                : handleMediaFailure(link, container, fallback);
        }

        setTimeout(() => {
            if (element.offsetWidth === 0 || element.offsetHeight === 0) {
                handleMediaFailure(link, container, fallback);
            }
        }, 500);
    }

    function handleMediaSuccess(element, link, container, fallback) {
        element.style.opacity = '1';
        container && (container.style.backgroundImage = 'none');
        hideFallback(fallback);
        updateLinkState(link, true);
    }

    function handleMediaFailure(link, container, fallback, dataImage) {
        if (dataImage && container) {
            testImage(dataImage).then(success => {
                if (success) {
                    container.style.backgroundImage = `url(${dataImage})`;
                    container.style.backgroundSize = 'contain';
                    container.style.backgroundPosition = 'center';
                    container.style.backgroundRepeat = 'no-repeat';
                    hideFallback(fallback);
                } else {
                    showFallback(fallback);
                }
                updateLinkState(link, false);
            });
        } else {
            showFallback(fallback);
            updateLinkState(link, false);
        }
    }

    function hideFallback(fallback) { fallback && (fallback.style.display = 'none'); }
    function showFallback(fallback) { fallback && (fallback.style.display = 'flex'); }
    function updateLinkState(link, isActive) {
        if (!link) return;
        link.classList.toggle('casinoLink', isActive);
        link.classList.toggle('casinoLinkremoved', !isActive);
    }

    function processAllLinks() {
        document.querySelectorAll('.casinoLink').forEach(link => {
            const element = link.querySelector('object.crash__svg__object, img.crash__svg__object');
            element && handleMediaElement(element, link);
        });
    }

    return { processAllLinks };
})();

// Swiper configurations
const swiperConfig = {
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    on: {
        init: () => setTimeout(svgHandler.processAllLinks, 150),
        slideChange: () => setTimeout(svgHandler.processAllLinks, 100)
    }
};

const swiperMobile = new Swiper('.crash__games__mobile', {
    ...swiperConfig,
    slidesPerView: 'auto',
    spaceBetween: 10,
    pagination: { el: '.swiper-pagination', clickable: true }
});

const swiperTopRow = new Swiper(".ks_mycrash_game_ab", {
    ...swiperConfig,
    slidesPerView: 4,
    spaceBetween: 20,
    mousewheel: { forceToAxis: true, sensitivity: 1, releaseOnEdges: true },
    speed: 500
});

const swiperBottomRow = new Swiper(".ks_mycrash_game_ab2", { ...swiperConfig, ...swiperTopRow.params });

// Fallback observer setup
function setupFallbackDetection(container) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('crash__svg__object') ||
                        ['object', 'img'].includes(node.tagName.toLowerCase())
                    )) {
                        const link = container.closest('.casinoLink, .casinoLinkremoved');
                        svgHandler.processAllLinks();
                    }
                });
            }
        });
    });
    
    observer.observe(container, { childList: true });
    container._fallbackObserver = observer;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.svg__object__container').forEach(setupFallbackDetection);
    
    const globalObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.classList?.contains('svg__object__container')) {
                        setupFallbackDetection(node);
                    }
                    node.querySelectorAll?.('.svg__object__container').forEach(setupFallbackDetection);
                }
            });
        });
    });
    
    globalObserver.observe(document.body, { childList: true, subtree: true });
    
    // Initial processing
    [100, 200, 500, 1000].forEach(delay => 
        setTimeout(svgHandler.processAllLinks, delay)
    );
    
    // Keep autoplay running
    setInterval(() => {
        [swiperMobile, swiperTopRow, swiperBottomRow].forEach(swiper => {
            swiper?.autoplay?.running || swiper?.autoplay?.start();
        });
    }, 10000);
    
    document.addEventListener('visibilitychange', () => {
        !document.hidden && setTimeout(svgHandler.processAllLinks, 1000);
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    document.querySelectorAll('.svg__object__container').forEach(container => {
        container._fallbackObserver?.disconnect();
    });
});

console.log('ttttt')