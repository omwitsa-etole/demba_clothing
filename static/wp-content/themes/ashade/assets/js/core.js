/**
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";

var ashade = {},
    $ashade_html = jQuery('html'),
    ashade_tns = [],
    $ashade_body = jQuery('body'),
    $ashade_window = jQuery(window),
    $ashade_header = jQuery('header#ashade-header'),
    $ashade_footer = jQuery('footer#ashade-footer'),
    $ashade_main = jQuery('main.ashade-content-wrap'),
    $ashade_scroll = jQuery('.ashade-content-scroll'),
    $ashade_header_holder,
    ashade_f_grid = [];

// iOS Device
ashade.iOSDevice = !!navigator.platform.match(/iPhone|iPod|iPad/);
ashade.isTouched = false;

ashade.isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

// Default Options
ashade.config = {
    'smooth_ease': 0.1,
    'content_load_delay': 0.8,
    'header_scroll': false,
    'referrer': document.referrer,
    'location': jQuery(location).attr('href'),
    'home_link': false
}

ashade.tapedTwice = false;

// In View Function
function ashade_inView(this_el) {
    // Check if Element is in View
    var rect = this_el.getBoundingClientRect()
    return (
        (rect.height > 0 || rect.width > 0) &&
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

// Header Scrolling State
if ($ashade_body.hasClass('ashade-header-scrollable')) {
    ashade.config.header_scroll = true;
    var $ashade_header_inner = $ashade_header.children('.ashade-header-inner');
}

// Landing Object
if ($ashade_body.hasClass('ashade-home-template') && !jQuery('.ashade-maintenance-wrap').length) {
    var ashade_landing = {
        get_event: function() {
            let this_event = false;
            if (window.location.href.indexOf('?event=') > -1) {
                this_event = window.location.href.split('?event=')[1];
            } else if (window.location.href.indexOf('?page_id=') > -1 && window.location.href.indexOf('&event=') > -1) {
                this_event = window.location.href.split('&event=')[1];
            }
            return this_event;
        },
        get_location: function() {
            let this_url = false;
            if (window.location.href.indexOf('?event=') > -1) {
                this_url = window.location.href.split('?event=')[0];
            } else if (window.location.href.indexOf('?page_id=') > -1 && window.location.href.indexOf('&event=') > -1) {
                this_url = window.location.href.split('&event=')[0];
            }
            return this_url;
        },
        get_event_url: function(event) {
            let this_event_url = false;
            if (window.location.href.indexOf('?page_id=') > -1) {
                this_event_url = window.location.href + '&event=' + event;
            } else {
                this_event_url = window.location.href + '?event=' + event;
            }
            return this_event_url;
        }
    }
} else {
    ashade_landing = false;
}

ashade.link_exception = function($this) {
    // Disable location change on link click by Class and ID;
    let classes = [
            'comment-reply-link',
            'ajax_add_to_cart',
            'remove',
            'woocommerce-MyAccount-downloads-file'
        ],
        ids = [
            'cancel-comment-reply-link'
        ],
        result = false;
    classes.forEach(function(this_class) {
        if ($this.hasClass(this_class)) {
            result = true;
        }
    });
    ids.forEach(function(this_id) {
        if ($this.attr('id') == this_id) result = true;
    });
    return result;
}

// Grid Filtering
class Ashade_Filtered_Grid {
    constructor(this_obj) {
        let this_class = this;

        if (!this_obj) {
            return false;
        }

        // Create $el
        if (this_obj instanceof jQuery) {
            this.$el = this_obj;
        } else {
            this.$el = jQuery(this_obj);
        }

        if (this.$el.hasClass('ashade-gallery-adjusted')) {
            this.type = 'adjusted';
        } else {
            this.type = 'grid';
        }

        this.id = this.$el.attr('id');
        this.$filter = jQuery('.ashade-filter-wrap[data-id="' + this.id + '"]');
        if (!this.$filter.find('.ashade-mobile-filter-wrap').length) {
            this.init_mobile_filter = true;
            this.$filter_mobile_wrap = jQuery('<div class="ashade-mobile-filter-wrap"/>').appendTo(this.$filter);
            this.$filter_mobile = jQuery('<div class="ashade-mobile-filter"/>').appendTo(this.$filter_mobile_wrap);
            this.$filter_mobile.append('<span class="ashade-mobile-filter-label">' + this.$filter.attr('data-label') + '</span>');
            this.$filter_mobile_value = jQuery('<span class="ashade-mobile-filter-value">' + this.$filter.find('a.is-active').text() + '</span>').appendTo(this.$filter_mobile);
            this.$filter_mobile_list = jQuery('<ul class="ashade-mobile-filter-list"/>').insertAfter(this.$filter_mobile).slideUp(1);
            this.$filter_mobile_wrap.append('\
					<svg xmlns="http://www.w3.org/2000/svg" width="19.875" height="10.969" viewBox="0 0 19.875 10.969">\
						<path id="arrow-down" d="M-8.812-12.937,0-4.078l8.813-8.859,1.125,1.125L.563-2.437,0-1.969l-.562-.469-9.375-9.375Z" transform="translate(9.938 12.938)"/>\
					</svg>');
        } else {
            this.init_mobile_filter = false;
        }
        // Add list items
        this.$filter.children('a').each(function() {
            let $this_a = jQuery(this),
                this_li = jQuery('<li data-category="' + $this_a.attr('data-category') + '">' + $this_a.text() + '</li>').appendTo(this_class.$filter_mobile_list);
            this_li.on('click', function(e) {
                e.preventDefault();
                let $this = jQuery(this),
                    category = $this.attr('data-category'),
                    label = $this.text();

                this_class.set(category, label);
            });
        });

        // Set Current Values
        this.$filter.children('a.is-active').each(function() {
            let category = jQuery(this).attr('data-category'),
                label = jQuery(this).text();

            if (this.init_mobile_filter) {
                this_class.$filter_mobile_list.find('[data-category="' + category + '"]').addClass('is-active');
                this_class.$filter_mobile_value.text(label);
            }
        });

        // Setup
        this.$el.addClass('ashade-grid-filtered');

        this_class.layout();

        // Bind Actions
        this.$filter.on('click', 'a', function(e) {
            e.preventDefault();
            let $this = jQuery(this),
                category = $this.attr('data-category'),
                label = $this.text();

            this_class.set(category, label);
        });
        if (this.init_mobile_filter) {
            this.$filter_mobile.on('click', function() {
                jQuery(this).parents('.ashade-filter-wrap').toggleClass('is-open');
                this_class.$filter_mobile_list.slideToggle(300);
            });
        }
        jQuery(window)
            .on('resize', function() {
                this_class.layout();
            })
            .on('load', function() {
                this_class.layout();
            });
    }
    set(category, label) {
        let this_class = this;
        // Set Active Filter Item
        this_class.$filter.find('.is-active').removeClass('is-active');
        this_class.$filter.find('[data-category="' + category + '"]').addClass('is-active');

        // Hide not match Items
        this_class.$el.children('div').removeClass('ashade-grid-item-hidden');
        this_class.$el.children('div:not(' + category + ')').addClass('ashade-grid-item-hidden');

        // Update Mobile List
        this_class.$filter_mobile_value.text(label);
        this_class.$filter.removeClass('is-open');
        this_class.$filter_mobile_list.slideUp(300);

        // reLayout Grid
        this_class.layout();

    }
    layout() {
        let this_class = this,
            count = 0,
            row_height = 0,
            container_height = 0,
            $items = this.$el.children('div:not(.ashade-grid-item-hidden)'),
            spacing_x = parseInt($items.css('margin-left'), 10) + parseInt($items.css('margin-right'), 10),
            spacing_y = parseInt($items.css('margin-top'), 10) + parseInt($items.css('margin-bottom'), 10),
            item_width = $items.width() + spacing_x,
            columns = Math.round(this.$el.width() / item_width);

        if ('adjusted' == this.type) {
            var current_row = [];
        }

        $items.each(function() {
            let $this = jQuery(this),
                this_height = $this.height() + spacing_y,
                setX = item_width * count,
                setY = container_height;

            // Check item Height
            if (this_height > row_height) {
                row_height = this_height;
            }

            // Set Position
            $this.css('transform', 'translate3d(' + setX + 'px, ' + setY + 'px, 0) scale(1,1)');

            if ('adjusted' == this_class.type) {
                current_row.push({
                    index: jQuery(this).index(),
                    xPos: setX,
                    yPos: setY,
                });
            }

            // Count Next
            count++
            if (count >= columns) {
                count = 0;
                container_height += row_height;

                if ('adjusted' == this_class.type) {
                    let rowItemHeight = row_height - spacing_y;
                    jQuery(current_row).each(function() {
                        let $current = this_class.$el.children('div:eq(' + this.index + ')');
                        if ($current.height() < rowItemHeight) {
                            let newY = this.yPos + ((rowItemHeight - $current.height()) / 2);
                            $current.css('transform', 'translate3d(' + this.xPos + 'px, ' + newY + 'px, 0) scale(1,1)');
                        }
                    });
                    current_row.length = 0;
                }

                row_height = 0;
            }
        });
        // Add Last Row Height
        if (count > 0) {
            container_height += row_height;

            if ('adjusted' == this_class.type) {
                let rowItemHeight = row_height - spacing_y;
                jQuery(current_row).each(function() {
                    let $current = this_class.$el.children('div:eq(' + this.index + ')');
                    if ($current.height() < rowItemHeight) {
                        let newY = this.yPos + ((rowItemHeight - $current.height()) / 2);
                        $current.css('transform', 'translate3d(' + this.xPos + 'px, ' + newY + 'px, 0) scale(1,1)');
                    }
                });
                current_row.length = 0;
            }
        }
        this.$el.height(container_height);

        if ($ashade_body.hasClass('ashade-home-template') && $ashade_body.hasClass('ashade-smooth-scroll')) {
            ashade.sScroll.layout();
        }
    }
}

// Magic Cursor
ashade.cursor = {
    $el: jQuery('.ashade-cursor'),
    $el_main: jQuery('span.ashade-cursor-circle'),
    targetX: $ashade_window.width() / 2,
    targetY: $ashade_window.height() / 2,
    currentX: $ashade_window.width() / 2,
    currentY: $ashade_window.height() / 2,
    easing: 0.2,
    init: function() {
        let $this_el = this.$el;

        // Cursor Move
        $ashade_window.on('mousemove', function(e) {
            ashade.cursor.targetX = e.clientX - $this_el.width() / 2;
            ashade.cursor.targetY = e.clientY - $this_el.height() / 2;
        });
        if ($this_el.length) {
            ashade.cursor.animate();
        }

        // Show and Hide Cursor
        $ashade_window.on('mouseleave', function() {
            ashade.cursor.$el.addClass('is-inactive');
        }).on('mouseenter', function() {
            ashade.cursor.$el.removeClass('is-inactive');
        });

        // Bind Interractions
        jQuery(document).on('mouseenter', 'a', function() {
            if (jQuery(this).hasClass('ashade-lightbox-link')) {
                ashade.cursor.$el.addClass('int-lightbox');
            } else {
                ashade.cursor.$el.addClass('int-link');
            }
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-link int-lightbox');
            });
        }).on('mouseenter', 'a', function() {
            if (jQuery(this).hasClass('shadowcore-lightbox-link')) {
                ashade.cursor.$el.addClass('int-lightbox');
            } else {
                ashade.cursor.$el.addClass('int-link');
            }
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-link int-lightbox');
            });
        }).on('mouseenter', 'button', function() {
            ashade.cursor.$el.addClass('int-link');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-link');
            });
        }).on('mouseenter', 'input[type="submit"]', function() {
            ashade.cursor.$el.addClass('int-link');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-link');
            });
        }).on('mouseenter', '.ashade-back', function() {
            jQuery('.ashade-back').on('mouseenter', function() {
                ashade.cursor.$el.addClass('int-link');
                jQuery(this).on('mouseleave', function() {
                    ashade.cursor.$el.removeClass('int-link');
                });
            });
        }).on('mouseenter', '.is-link', function() {
            jQuery('.is-link').on('mouseenter', function() {
                ashade.cursor.$el.addClass('int-link');
                jQuery(this).on('mouseleave', function() {
                    ashade.cursor.$el.removeClass('int-link');
                });
            });
        }).on('mouseenter', '.ashade-aside-overlay', function() {
            ashade.cursor.$el.addClass('int-close');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-close');
            });
        }).on('mouseenter', '.ashade-categories-overlay', function() {
            ashade.cursor.$el.addClass('int-close');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-close');
            });
        }).on('mouseenter', '.shadowcore-before-after', function() {
            ashade.cursor.$el.addClass('int-grab-h');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-grab-h');
            });
        }).on('mouseenter', '.shadowcore-testimonials-carousel .tns-inner', function() {
            ashade.cursor.$el.addClass('int-grab-h');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-grab-h');
            });
        }).on('mouseenter', '.ashade-albums-slider-wrap:not(.is-single) .ashade-albums-slider', function() {
            ashade.cursor.$el.addClass('int-grab-h');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-grab-h');
            });
        }).on('mouseenter', '.pswp__scroll-wrap, .shadowcore-cursor--scrollH', function() {
            ashade.cursor.$el.addClass('int-grab-h');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-grab-h');
            });
        }).on('mouseenter', '.price_slider.ui-slider-horizontal', function() {
            ashade.cursor.$el.addClass('int-grab-h');
            jQuery(this).on('mouseleave', function() {
                ashade.cursor.$el.removeClass('int-grab-h');
            });
        }).on('mouseenter', '.ashade-albums-carousel', function() {
            let $this = jQuery(this);
            if ($this.parent().hasClass('is-centered')) {
                ashade.cursor.$el.removeClass('int-grab-h int-grab-v');
            }
            if (!$this.parent().hasClass('is-centered')) {
                if ($this.hasClass('is-vertical')) {
                    ashade.cursor.$el.addClass('int-grab-v');
                } else {
                    ashade.cursor.$el.addClass('int-grab-h');
                }
            }
            $this.on('mouseleave', function() {
                if (!$this.parent().hasClass('is-centered')) {
                    ashade.cursor.$el.removeClass('int-grab-h int-grab-v');
                }
            });
        }).on('mouseenter', 'iframe', function() {
            ashade.cursor.$el.addClass('int-iframe');
        }).on('mouseleave', 'iframe', function() {
            ashade.cursor.$el.removeClass('int-iframe');
        });
    },
    animate: function() {
        let $this_el = ashade.cursor.$el,
            diff_x = ((ashade.cursor.targetX - ashade.cursor.currentX) * ashade.cursor.easing),
            diff_y = ((ashade.cursor.targetY - ashade.cursor.currentY) * ashade.cursor.easing);

        ashade.cursor.currentX += diff_x;
        ashade.cursor.currentY += diff_y;
        $this_el.css('transform', 'translate3d(' + ashade.cursor.currentX + 'px, ' + ashade.cursor.currentY + 'px, 0)');
        requestAnimationFrame(ashade.cursor.animate);
    }
};
ashade.cursor.init();

// Lightbox
if (jQuery('.ashade-lightbox-link').length || jQuery('.shadowcore-lightbox-link').length) {
    ashade.pswp = {
        getMaxHeight: function() {
            let maxHeight = $ashade_window.height();
            if (jQuery('.pswp__caption').length) {
                maxHeight = maxHeight - jQuery('.pswp__caption').height();
            }
            if (jQuery('.pswp__top-bar').length) {
                let $top_bar = jQuery('.pswp__top-bar'),
                    top_bar_height = $top_bar.height() + parseInt($top_bar.css('padding-top'), 10) + parseInt($top_bar.css('padding-bottom'), 10);
                if (jQuery('.pswp__caption').length) {
                    maxHeight = maxHeight - top_bar_height;
                } else {
                    maxHeight = maxHeight - top_bar_height * 2;
                }
            }
            return maxHeight;
        },
        // Resize Video
        resizeVideo: function() {
            let result = {};
            if ($ashade_window.width() / 16 > this.getMaxHeight() / 9) {
                result.w = this.getMaxHeight() * 1.7778 * 0.8;
                result.h = this.getMaxHeight() * 0.8;
            } else {
                result.w = $ashade_window.width() * 0.8;
                result.h = $ashade_window.width() * 0.5625 * 0.8;
            }
            return result;
        },
        gallery: Array(),
        html: jQuery('\
		<!-- Root element of PhotoSwipe. Must have class pswp. -->\
		<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">\
			<div class="pswp__bg"></div><!-- PSWP Background -->\
			\
			<div class="pswp__scroll-wrap">\
				<div class="pswp__container">\
					<div class="pswp__item"></div>\
					<div class="pswp__item"></div>\
					<div class="pswp__item"></div>\
				</div><!-- .pswp__container -->\
				\
				<div class="pswp__ui pswp__ui--hidden">\
					<div class="pswp__top-bar">\
						<!--  Controls are self-explanatory. Order can be changed. -->\
						<div class="pswp__counter"></div>\
						\
						<button class="pswp__button pswp__button--close" title="Close (Esc)">\
							<svg xmlns="http://www.w3.org/2000/svg" width="15.375" height="15.375" viewBox="0 0 15.375 15.375"><path id="close" d="M-6.562-16.687,0-10.078l6.563-6.609,1.125,1.125L1.078-9,7.688-2.437,6.563-1.312,0-7.922-6.562-1.312-7.687-2.437-1.078-9l-6.609-6.562Z" transform="translate(7.688 16.688)" fill="#fff"/></svg>\
						</button>\
						\
						<div class="pswp__preloader">\
							<div class="pswp__preloader__icn">\
							  <div class="pswp__preloader__cut">\
								<div class="pswp__preloader__donut"></div>\
							  </div><!-- .pswp__preloader__cut -->\
							</div><!-- .pswp__preloader__icn -->\
						</div><!-- .pswp__preloader -->\
					</div><!-- .pswp__top-bar -->\
					\
					<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">\
						<div class="pswp__share-tooltip"></div>\
					</div><!-- .pswp__share-modal -->\
					\
					<button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">\
						<svg xmlns="http://www.w3.org/2000/svg" width="9.844" height="17.625" viewBox="0 0 9.844 17.625"><path id="prev" d="M2.25-17.812l1.125,1.125L-4.359-9,3.375-1.312,2.25-.187-6-8.437-6.469-9-6-9.562Z" transform="translate(6.469 17.813)" fill="#fff"/></svg>\
					</button>\
					<button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">\
						<svg xmlns="http://www.w3.org/2000/svg" width="9.844" height="17.625" viewBox="0 0 9.844 17.625"><path id="next" d="M-2.25-17.812,6-9.562,6.469-9,6-8.437-2.25-.187-3.375-1.312,4.359-9l-7.734-7.687Z" transform="translate(3.375 17.813)" fill="#fff"/></svg>\
					</button>\
					\
					<div class="pswp__caption">\
						<div class="pswp__caption__center"></div>\
					</div><!-- .pswp__caption -->\
				</div><!-- .pswp__ui pswp__ui--hidden -->\
			</div><!-- .pswp__scroll-wrap -->\
		</div><!-- .pswp -->').appendTo($ashade_body)
    };
}

// Coming Soon Count Down
ashade.count_down = {
    init: function() {
        let $dom = jQuery('#ashade-coming-soon'),
            datetime = new Date($dom.find('time').text() + 'T00:00:00'),
            is_this;

        $dom.find('time').remove();
        this.labels = $dom.data('labels');
        this.days = jQuery('<h2>0</h2>')
            .appendTo($dom).wrap('<div/>')
            .after('<span>' + ashade.count_down.labels[0] + '</span>');
        this.hours = jQuery('<h2>0</h2>')
            .appendTo($dom).wrap('<div/>')
            .after('<span>' + ashade.count_down.labels[1] + '</span>');
        this.minutes = jQuery('<h2>0</h2>')
            .appendTo($dom).wrap('<div/>')
            .after('<span>' + ashade.count_down.labels[2] + '</span>');
        this.seconds = jQuery('<h2>0</h2>')
            .appendTo($dom).wrap('<div/>')
            .after('<span>' + ashade.count_down.labels[3] + '</span>');

        this.update(datetime);

        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(function() {
            ashade.count_down.update(datetime);
        }, 1000);
    },
    update: function(endDate) {
        let now = new Date();
        let difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
            clearInterval(this.interval);
        } else {
            let seconds = Math.floor(difference / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);

            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            if (days < 10) {
                days = ("0" + days).slice(-2);
            }

            this.days.text(days);
            this.hours.text(("0" + hours).slice(-2));
            this.minutes.text(("0" + minutes).slice(-2));
            this.seconds.text(("0" + seconds).slice(-2));
        }
    }
};

// Ashade Lazy Loading
class Ashade_Lazy {
    constructor(this_class) {
        let classVar = this;

        const images = document.querySelectorAll(this_class);

        const options = {};

        if ('IntersectionObserver' in window) {
            classVar.imgObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    } else {
                        classVar.preloadImage(entry.target);
                        classVar.imgObserver.unobserve(entry.target);
                    }
                });
            }, options);

            images.forEach(image => {
                classVar.imgObserver.observe(image);
            });
        } else {
            if ($ashade_body.hasClass('ashade-albums-template--ribbon')) {
                if (jQuery(this_class + ':not(.is-loaded)').length) {
                    jQuery(this_class + ':not(.is-loaded)').each(function() {
                        classVar.preloadImage(this);
                    });
                }
            } else {
                if (jQuery(this_class + ':not(.is-loaded)').length) {
                    jQuery(this_class + ':not(.is-loaded)').each(function() {
                        if (classVar.inView(this)) {
                            classVar.preloadImage(this);
                        }
                    });
                }
                $ashade_window.on('scroll', function() {
                    if (jQuery(this_class + ':not(.is-loaded)').length) {
                        jQuery(this_class + ':not(.is-loaded)').each(function() {
                            if (classVar.inView(this)) {
                                classVar.preloadImage(this);
                            }
                        });
                    }
                });
            }
        }
    }

    inView(this_el) {
        // Check if Element is in View
        var rect = this_el.getBoundingClientRect()
        return (
            (rect.height > 0 || rect.width > 0) &&
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    preloadImage(this_img) {
        const src = this_img.getAttribute('data-src');
        if (!src) {
            console.warn('Can not load image. No image src defined.');
            return
        }
        this_img.src = src;
        // Support for OLD
        if (jQuery(this_img).is('img')) {
            this_img.addEventListener("load", function(e) {
                e.target.classList.add('is-loaded');
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    if (jQuery(this_img).parents('div').hasClass('ashade-justified-gallery')) {
                        setTimeout(function() {
                            jQuery(this_img).parent('a').addClass('is-ready');
                        }, 100, this_img);
                        setTimeout(function() {
                            jQuery(this_img).parents('.ashade-justified-gallery').justifiedGallery();
                        }, 500, this_img);
                    }
                }
            });
        }
        // New DIV image
        if (jQuery(this_img).is('div')) {
            jQuery(this_img).css('background-image', 'url(' + jQuery(this_img).attr('data-src') + ')');
            let img = new Image();
            img.src = src;
            img.original_el = this_img;
            img.addEventListener('load', function(e) {
                let $this_el = jQuery(e.target.original_el);
                $this_el.addClass('is-loaded');

                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    if ($this_el.parents('div').hasClass('ashade-justified-gallery')) {
                        setTimeout(function() {
                            $this_el.parent('a').addClass('is-ready');
                        }, 100, $this_el);
                        setTimeout(function() {
                            $this_el.parents('.ashade-justified-gallery').justifiedGallery();
                        }, 500, $this_el);
                    }
                }
            });
        }
    }
}
// Support for Old Safari Browser
if ('IntersectionObserver' in window) {} else {
    var ashade_lazy_old = {
        inView: function(this_el) {
            // Check if Element is in View
            var rect = this_el.getBoundingClientRect()
            return (
                (rect.height > 0 || rect.width > 0) &&
                rect.bottom >= 0 &&
                rect.right >= 0 &&
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth)
            )
        },
        preloadImage: function(this_img) {
            const src = this_img.getAttribute('data-src');
            if (!src) {
                console.warn('Can not load image. No image src defined.');
                return
            }
            this_img.src = src;
            this_img.addEventListener("load", function(e) {
                e.target.classList.add('is-loaded');
            });
        }
    }
}

// Ashade Kenburns
if (jQuery('.ashade-kenburns-slider').length) {
    ashade.kenburns = {
        init: function() {
            // Set Variables
            let this_f = this;
            this_f.$el = jQuery('.ashade-kenburns-slider');
            this_f.items = this_f.$el.find('.ashade-kenburns-slide').length;
            this_f.transition = parseInt(this_f.$el.attr('data-transition'), 10);
            this_f.delay = parseInt(this_f.$el.attr('data-delay'), 10) / 1000 + this_f.transition * 0.001;
            this_f.zoom = this_f.$el.attr('data-zoom');
            this_f.from = this_f.zoom;
            this_f.to = 1;
            this_f.active = 0;

            // Setup Items
            let prev_offset_x = 0,
                prev_offset_y = 0;

            this_f.$el.find('.ashade-kenburns-slide').each(function() {
                let offset_x = Math.random() * 100,
                    offset_y = Math.random() * 100;

                if (prev_offset_x > 50 && offset_x > 50) {
                    offset_x = offset_x - 50;
                } else if (prev_offset_x < 50 && offset_x < 50) {
                    offset_x = offset_x + 50;
                }
                if (prev_offset_y > 50 && offset_y > 50) {
                    offset_y = offset_y - 50;
                } else if (prev_offset_y < 50 && offset_y < 50) {
                    offset_y = offset_y + 50;
                }

                prev_offset_x = offset_x;
                prev_offset_y = offset_y;

                jQuery(this).css({
                    'transition': 'opacity ' + this_f.transition + 'ms',
                    'transform-origin': offset_x + '% ' + offset_y + '%',
                    'background-image': 'url(' + jQuery(this).attr('data-src') + ')'
                });
            });

            // Run Slider
            ashade.kenburns.change();
        },
        change: function() {
            let this_f = this,
                scale_from = this_f.from,
                scale_to = this_f.to;

            // Loop
            if (this_f.active >= this_f.items) {
                this_f.active = 0;
            }
            let current_slide = this_f.$el.find('.ashade-kenburns-slide').eq(this_f.active);

            gsap.fromTo(current_slide, {
                scale: scale_from,
                onStart: function() {
                    current_slide.addClass('is-active');
                }
            }, {
                scale: scale_to,
                duration: this_f.delay,
                ease: 'none',
                onComplete: function() {
                    ashade.kenburns.active++;
                    ashade.kenburns.from = scale_to;
                    ashade.kenburns.to = scale_from;
                    ashade.kenburns.change();
                    ashade.kenburns.$el.find('.is-active').removeClass('is-active');
                }
            });
        }
    };
}

// Counter
ashade.counter = function(this_el) {
    jQuery(this_el).prop('Counter', 0).animate({
        Counter: jQuery(this_el).text()
    }, {
        duration: parseInt(jQuery(this_el).parent().attr('data-delay'), 10),
        easing: 'swing',
        step: function(now) {
            jQuery(this_el).text(Math.ceil(now));
        }
    });
}

// Smooth Scroll
ashade.old_scroll_top = 0;
if (ashade.isTouchDevice && $ashade_body.hasClass('ashade-smooth-scroll') && $ashade_body.hasClass('ashade-native-touch-scroll')) {
    $ashade_body.removeClass('ashade-smooth-scroll');
}

if ($ashade_body.hasClass('ashade-smooth-scroll')) {
    ashade.sScroll = {
        target: 0,
        current: 0,
        animate: function() {
            let mover = ((ashade.sScroll.target - ashade.sScroll.current) * ashade.config.smooth_ease),
                old = ashade.sScroll.current;

            if (Math.floor(Math.abs(mover)) === 0)
                mover = 0;

            ashade.sScroll.current += mover;

            if (ashade.sScroll.current !== old) {
                $ashade_scroll.css('transform', 'translate3d(0, -' + ashade.sScroll.current + 'px, 0)');

                if (ashade.config.header_scroll) {
                    $ashade_header_inner.css('transform', 'translate3d(0, -' + ashade.sScroll.current + 'px, 0)');
                }
                if (jQuery('.wp-block-cover-image.has-parallax').length) {
                    jQuery('.wp-block-cover-image.has-parallax').each(function() {
                        let $this = jQuery(this),
                            this_speed = 50,
                            this_offset_top = $this.offset().top,
                            current_scroll = ($ashade_window.scrollTop() - this_offset_top) / 100,
                            set_top = current_scroll * 100 - current_scroll * this_speed;
                        $this.css('background-position', 'center ' + set_top + 'px');
                    });
                }
                if (jQuery('.wp-block-cover.has-parallax').length) {
                    jQuery('.wp-block-cover.has-parallax').each(function() {
                        let $this = jQuery(this),
                            this_speed = 50,
                            this_offset_top = $this.offset().top,
                            current_scroll = ($ashade_window.scrollTop() - this_offset_top) / 100,
                            set_top = current_scroll * 100 - current_scroll * this_speed;
                        $this.css('background-position', 'center ' + set_top + 'px');
                    });
                }

                if (!$ashade_body.hasClass('ashade-home-template')) {
                    if ($ashade_body.hasClass('admin-bar')) {
                        if ($ashade_scroll.height() !== ($ashade_body.height() + jQuery('#wpadminbar').height())) {
                            ashade.sScroll.layout();
                        }
                    } else {
                        if ($ashade_scroll.height() !== $ashade_body.height()) {
                            ashade.sScroll.layout();
                        }
                    }
                }
            }

            requestAnimationFrame(ashade.sScroll.animate);
        },
        layout: function() {
            // Old Safari Browsers support
            if ('IntersectionObserver' in window) {} else {
                if (!$ashade_body.hasClass('ashade-albums-template--ribbon')) {
                    if (jQuery('img.ashade-lazy:not(.is-loaded)').length) {
                        jQuery('img.ashade-lazy:not(.is-loaded)').each(function() {
                            if (ashade_lazy_old.inView(this)) {
                                ashade_lazy_old.preloadImage(this);
                            }
                        });
                    }
                }
            }

            if ($ashade_scroll.length) {
                let this_content = $ashade_scroll.children('.ashade-content');
                this_content.css('min-height', '0px');

                // Set Body Height (for smooth scroll)
                if ($ashade_scroll.height() <= $ashade_window.height()) {
                    let min_height = $ashade_window.height() - $ashade_footer.height();

                    if (!$ashade_body.hasClass('no-header-padding'))
                        min_height = min_height - $ashade_scroll.children('.ashade-header-holder').height();

                    if ($ashade_body.hasClass('ashade-layout--horizontal')) {
                        if (jQuery('.ashade-to-top-wrap.ashade-back-wrap').length) {
                            min_height = min_height - jQuery('.ashade-to-top-wrap.ashade-back-wrap').height();
                        }
                        if (jQuery('.ashade-page-title-wrap').length) {
                            min_height = min_height - jQuery('.ashade-page-title-wrap').height();
                        }
                    }
                    this_content.css('min-height', min_height + 'px');
                    $ashade_scroll.addClass('is-centered');
                } else {
                    $ashade_scroll.removeClass('is-centered');
                }

                if ($ashade_window.width() > 960) {
                    if (jQuery('#wpadminbar').length) {
                        $ashade_body.height($ashade_scroll.height() - jQuery('#wpadminbar').height());
                    } else {
                        $ashade_body.height($ashade_scroll.height());
                    }
                } else {
                    $ashade_body.height($ashade_scroll.height());
                }
            }
        }
    };
    if ($ashade_scroll.length || $ashade_body.hasClass('ashade-home-template')) {
        ashade.sScroll.animate();
    }
}

ashade.init = function() {
    // Change all # to void(0)
    jQuery('a[href="#"]').each(function() {
        jQuery(this).attr('href', 'javascript:void(0)');
    });

    if (ashade.config.referrer !== '' && ashade.config.referrer !== ashade.config.location && window.history.length > 1) {
        $ashade_body.addClass('has-history');
    } else {
        $ashade_body.addClass('no-history');
    }

    $ashade_body.addClass('is-init');

    // Hide Sticky Header
    if ($ashade_body.hasClass('ashade-header-sticky') && $ashade_body.hasClass('ashade-header-hos')) {
        $ashade_window.oldPos = $ashade_window.scrollTop();
        $ashade_window.hidePoint = 0;
        $ashade_window.on('scroll', function() {
            if ($ashade_window.scrollTop() > $ashade_window.oldPos) {
                $ashade_header.addClass('is-hidden');
                $ashade_window.hidePoint = $ashade_window.scrollTop();
            } else {
                let scroll_diff = $ashade_window.hidePoint - 50;
                if ($ashade_window.scrollTop() < scroll_diff) {
                    $ashade_header.removeClass('is-hidden');
                }
            }
            if ($ashade_window.scrollTop() < $ashade_header.height()) {
                $ashade_header.removeClass('is-hidden');
            }
            $ashade_window.oldPos = $ashade_window.scrollTop();
        });
    }

    // Header Fade Point
    ashade.config.fade_point = parseInt($ashade_header.attr('data-fade-point'), 10);
    if (!ashade.config.fade_point) ashade.config.fade_point = 0;

    if ($ashade_window.scrollTop() > ashade.config.fade_point) {
        $ashade_header.addClass('is-faded');
    } else {
        $ashade_header.removeClass('is-faded');
    }

    // Init Coming Soon Counter
    if (jQuery('#ashade-coming-soon').length) {
        ashade.count_down.init();
    }

    // Right Click Protection
    if ($ashade_body.hasClass('ashade-rcp')) {
        jQuery(document).on('contextmenu', function(e) {
            e.preventDefault();
            if (jQuery('.ashade-rcp-message-wrap').length) {
                alert(jQuery('.ashade-rcp-message-wrap').text());
            }
        });
    }
    // Image Drag Protection
    if ($ashade_body.hasClass('ashade-idp')) {
        jQuery('a').on('mousedown', function(e) {
            e.preventDefault();
        });
        jQuery('.ashade-content img').on('mousedown', function(e) {
            e.preventDefault();
        });
    }

    // Page Background
    if (jQuery('.ashade-page-background[data-src]').length) {
        jQuery('.ashade-page-background[data-src]').each(function() {
            jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-src') + ')');
        });
    }
    if (jQuery('.ashade-page-background[data-opacity]').length) {
        jQuery('.ashade-page-background[data-opacity]').each(function() {
            jQuery(this).css('opacity', jQuery(this).attr('data-opacity'));
        });
    }

    // Next Post Preview
    if (jQuery('.ashade-next-album-preview').length) {
        jQuery('.ashade-next-album-preview').each(function() {
            jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-src') + ')');
        });
    }

    // Admin Bar Fixes
    if ($ashade_body.hasClass('admin-bar')) {
        $ashade_html.addClass('has-admin-bar');
    } else {
        $ashade_html.addClass('no-admin-bar');
    }
    ashade.old_scroll_top = $ashade_window.scrollTop();

    // 404 Page
    if (jQuery('.ashade-404-background').length) {
        $ashade_body.addClass('is-404-page');
    }

    // Password Protected
    if (jQuery('.ashade-protected-form-wrap').length) {
        let $protected_wrap = jQuery('.ashade-protected-form-wrap'),
            $protected_form = jQuery('.ashade-protected-form-wrap > form'),
            $protected_form_inner = jQuery('<div class="ashade-protected-form-inner">').appendTo($protected_form),
            $password_input = $protected_form.find('label > input')
            .appendTo($protected_form_inner)
            .wrap('<div class="ashade-protected-input-wrap"/>')
            .attr('placeholder', $protected_wrap.attr('data-placeholder')),
            $input_wrap = $protected_form.find('.ashade-protected-input-wrap'),
            $password_submit = $protected_form.find('input[type="submit"]')
            .appendTo($protected_form_inner)
            .wrap('<div class="ashade-protected-submit-wrap"/>'),
            $password_toggler = jQuery('\
			<a href="javascript:void(0)" class="ashade-password-view">\
				<svg xmlns="http://www.w3.org/2000/svg" width="23.063" height="20.625" viewBox="0 0 23.063 20.625" class="ashade-password-view__hide">\
				  <path id="icon-eye-close" d="M-9.187-19.312l5.063,5.063A12.269,12.269,0,0,1,0-15a11.773,11.773,0,0,1,3.563.563,14.278,14.278,0,0,1,3,1.289,19.761,19.761,0,0,1,2.344,1.641,17.981,17.981,0,0,1,1.523,1.336q.4.422.633.7l.469.516-.469.516A22.142,22.142,0,0,1,5.531-4.547L10.313.188,9.188,1.313,4.078-3.844,2.719-5.25.375-7.547-2.2-10.125l-2.3-2.344-1.125-1.125-4.687-4.594ZM0-13.5a10.181,10.181,0,0,0-2.953.469l1.547,1.547A2.235,2.235,0,0,1,0-12a2.17,2.17,0,0,1,1.594.656A2.17,2.17,0,0,1,2.25-9.75a2.235,2.235,0,0,1-.516,1.406L3.844-6.187A5.14,5.14,0,0,0,5.25-9.75a5.011,5.011,0,0,0-.8-2.719A10.624,10.624,0,0,0,0-13.5Zm-7.031.656,1.922,1.922A5.21,5.21,0,0,0-5.25-9.75,5.033,5.033,0,0,0-3.914-6.258,5.179,5.179,0,0,0-.562-4.547l.047.047H.516l.094-.047q.328-.047.609-.094L2.484-3.375A7.7,7.7,0,0,1,.7-3.047H.656Q.094-3,0-3t-.656-.047H-.7a10.683,10.683,0,0,1-3.07-.7A17.743,17.743,0,0,1-6.539-5.039,22.492,22.492,0,0,1-8.812-6.586q-1.125-.867-1.547-1.242t-.7-.609l-.469-.516.469-.516A16.965,16.965,0,0,1-7.031-12.844Zm.469,1.5a16.522,16.522,0,0,0-2.906,2.3A22.631,22.631,0,0,0-5.859-6.422,6.559,6.559,0,0,1-6.75-9.75,7.359,7.359,0,0,1-6.562-11.344Zm13.125,0A7.359,7.359,0,0,1,6.75-9.75a6.559,6.559,0,0,1-.891,3.328A22.5,22.5,0,0,0,9.422-9,15.178,15.178,0,0,0,6.563-11.344ZM0-10.5a.755.755,0,0,0-.328.094l.984.984A.755.755,0,0,0,.75-9.75a.73.73,0,0,0-.211-.539A.73.73,0,0,0,0-10.5Z" transform="translate(11.531 19)" fill="gray"/>\
				</svg>\
				<svg xmlns="http://www.w3.org/2000/svg" width="23.063" height="12" viewBox="0 0 23.063 12"  class="ashade-password-view__show">\
				  <path id="icon-eye-open" d="M-3.539-14.414A11.421,11.421,0,0,1,0-15a11.629,11.629,0,0,1,3.516.563,13.481,13.481,0,0,1,3.094,1.383q1.313.82,2.344,1.617a17.189,17.189,0,0,1,1.594,1.359l.516.609L11.531-9l-.469.469a7.144,7.144,0,0,1-.516.563q-.328.328-1.406,1.219a20.627,20.627,0,0,1-2.2,1.594A16.089,16.089,0,0,1,4.148-3.82a12.208,12.208,0,0,1-3.3.773A6.853,6.853,0,0,1,0-3a6.853,6.853,0,0,1-.844-.047A12.45,12.45,0,0,1-4.125-3.8,14.53,14.53,0,0,1-6.961-5.18q-1.2-.773-2.156-1.523a16.651,16.651,0,0,1-1.477-1.266l-.469-.562L-11.531-9l.469-.469a7.961,7.961,0,0,1,.563-.609q.375-.375,1.523-1.336A17.465,17.465,0,0,1-6.586-13.1,15.616,15.616,0,0,1-3.539-14.414ZM0-13.5a10.849,10.849,0,0,0-4.547,1.078H-4.5A5,5,0,0,0-5.25-9.75,5.118,5.118,0,0,0-3.914-6.234,5.137,5.137,0,0,0-.562-4.5H.563A5.137,5.137,0,0,0,3.914-6.234,5.118,5.118,0,0,0,5.25-9.75a5.242,5.242,0,0,0-.75-2.719A10.937,10.937,0,0,0,0-13.5Zm-1.594,2.156A2.17,2.17,0,0,1,0-12a2.17,2.17,0,0,1,1.594.656A2.17,2.17,0,0,1,2.25-9.75a2.17,2.17,0,0,1-.656,1.594A2.17,2.17,0,0,1,0-7.5a2.17,2.17,0,0,1-1.594-.656A2.17,2.17,0,0,1-2.25-9.75,2.17,2.17,0,0,1-1.594-11.344Zm-4.969.047A18.386,18.386,0,0,0-9.375-9,17.308,17.308,0,0,0-5.719-6.187,6.418,6.418,0,0,1-6.75-9.75,6.745,6.745,0,0,1-6.562-11.3Zm13.125,0A6.745,6.745,0,0,1,6.75-9.75,6.418,6.418,0,0,1,5.719-6.187,17.309,17.309,0,0,0,9.375-9,18.386,18.386,0,0,0,6.563-11.3Z" transform="translate(11.531 15)" fill="gray"/>\
				</svg>\
			</a>').appendTo($input_wrap);

        $protected_form.find('p').remove();
        $password_submit.val($protected_wrap.attr('data-submit'));
        $password_toggler.on('click', function(e) {
            e.preventDefault();
            if ($password_input.attr('type') == 'password') {
                $password_input.attr('type', 'text');
                $protected_wrap.addClass('is-view-password');
            } else {
                $password_input.attr('type', 'password');
                $protected_wrap.removeClass('is-view-password');
            }
        })
    }

    // More Categories
    if (jQuery('.ashade-category-more').length) {
        jQuery('.ashade-category-more').on('click', function(e) {
            e.preventDefault();
            $ashade_body.addClass('is-faded shown-more-categories');
        });
        jQuery('.ashade-categories-overlay').on('click', function(e) {
            $ashade_body.removeClass('is-faded shown-more-categories');
        });
        jQuery('.ashade-more-categories-close').on('click', function(e) {
            $ashade_body.removeClass('is-faded shown-more-categories');
        });
    }

    // Header Holder
    $ashade_header_holder = jQuery('<div class="ashade-header-holder"></div>');
    $ashade_header_holder.height($ashade_header.height()).prependTo($ashade_scroll);

    // Set Logo Size
    if (jQuery('a.ashade-logo').length) {
        jQuery('a.ashade-logo').each(function() {
            let $this = jQuery(this),
                $img = $this.children('img'),
                w = $img.attr('width'),
                h = $img.attr('height');
            if ($this.hasClass('is-retina')) {
                $this.width(w / 2).height(h / 2);
            } else {
                $this.width(w).height(h);
            }
        });
    }

    // Set Menu Active Parent Items
    if (jQuery('.current-menu-item').length) {
        jQuery('.current-menu-item').each(function() {
            jQuery(this).parents('li').addClass('current-menu-ancestor');
        });
    }

    // Mobile Page Title
    if (jQuery('.ashade-page-title-wrap').length) {
        if (jQuery('.ashade-content-wrap .ashade-content').length) {
            let ashade_mobile_title = jQuery('<div class="ashade-mobile-title-wrap">' + jQuery('.ashade-page-title-wrap').html() + '</div>');
            jQuery('.ashade-content-wrap .ashade-content').prepend(ashade_mobile_title);
        }
    }

    // Mobile Menu DOM Construct
    let ashade_mobile_header = jQuery('<div class="ashade-mobile-header">'),
        mobile_menu_button = jQuery('<a href="javascript:void(0)" class="ashade-mobile-menu-button"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="34" viewBox="0 0 32 34"><rect id="line03" width="24" height="2" transform="translate(4 9)"/><rect id="line02" width="24" height="2" transform="translate(4 17)"/><rect id="line01" width="24" height="2" transform="translate(4 25)"/></svg></a>').appendTo(ashade_mobile_header),
        mobile_menu = jQuery('<nav class="ashade-mobile-menu"></nav>').appendTo($ashade_body),
        mobile_menu_close = jQuery('<a href="javascript:void(0)" class="ashade-mobile-menu-close"><svg xmlns="http://www.w3.org/2000/svg" width="15.375" height="15.375" viewBox="0 0 15.375 15.375"><path id="close" d="M-6.562-16.687,0-10.078l6.563-6.609,1.125,1.125L1.078-9,7.688-2.437,6.563-1.312,0-7.922-6.562-1.312-7.687-2.437-1.078-9l-6.609-6.562Z" transform="translate(7.688 16.688)" fill="#fff"/></svg></a>').appendTo(mobile_menu);

    // Mobile Header
    if (jQuery('.ashade-aside-overlay').length) {
        ashade_mobile_header.append($ashade_header.find('.ashade-aside-toggler-wrap').html());
    }


    if ($ashade_header.find('.ashade-wc-header-cart').length) {
        jQuery('.ashade-wc-header-cart').append('\
			<svg xmlns="http://www.w3.org/2000/svg" width="20.781" height="17.5" viewBox="0 0 20.781 17.5">\
				<path d="M-23.844-18.375h1.969a1.708,1.708,0,0,1,1.066.355,1.5,1.5,0,0,1,.574.957l2.3,9.188H-7.875L-6.234-14H-18.156l-.437-1.75H-3.937l-2.3,8.313a1.5,1.5,0,0,1-.574.957,1.708,1.708,0,0,1-1.066.355H-17.937A1.708,1.708,0,0,1-19-6.48a1.5,1.5,0,0,1-.574-.957l-2.3-9.187h-1.969a.852.852,0,0,1-.629-.246.852.852,0,0,1-.246-.629.852.852,0,0,1,.246-.629A.852.852,0,0,1-23.844-18.375ZM-10.828-5.359a2.531,2.531,0,0,1,1.859-.766,2.531,2.531,0,0,1,1.859.766A2.531,2.531,0,0,1-6.344-3.5a2.531,2.531,0,0,1-.766,1.859,2.531,2.531,0,0,1-1.859.766,2.531,2.531,0,0,1-1.859-.766A2.531,2.531,0,0,1-11.594-3.5,2.531,2.531,0,0,1-10.828-5.359Zm-7.875,0a2.531,2.531,0,0,1,1.859-.766,2.531,2.531,0,0,1,1.859.766A2.531,2.531,0,0,1-14.219-3.5a2.531,2.531,0,0,1-.766,1.859,2.531,2.531,0,0,1-1.859.766A2.531,2.531,0,0,1-18.7-1.641,2.531,2.531,0,0,1-19.469-3.5,2.531,2.531,0,0,1-18.7-5.359ZM-15.969-3.5a.773.773,0,0,0-.875-.875.773.773,0,0,0-.875.875.773.773,0,0,0,.875.875A.773.773,0,0,0-15.969-3.5Zm7.875,0a.773.773,0,0,0-.875-.875.773.773,0,0,0-.875.875.773.773,0,0,0,.875.875A.773.773,0,0,0-8.094-3.5Z" transform="translate(24.719 18.375)"/>\
			</svg>');
        ashade_mobile_header.prepend($ashade_header.find('.ashade-wc-header-cart').clone());
    }

    if ($ashade_body.hasClass('ashade-albums-back')) {
        let $ashade_mobile_back = jQuery('\
			<a href="javascript:void(0)" class="ashade-mobile-back">\
				<svg xmlns="http://www.w3.org/2000/svg" width="9.844" height="17.625" viewBox="0 0 9.844 17.625">\
					<path d="M2.25-17.812l1.125,1.125L-4.359-9,3.375-1.312,2.25-.187-6-8.437-6.469-9-6-9.562Z" transform="translate(6.469 17.813)" fill="#ffffff"/>\
				</svg>\
			</a>');
        $ashade_mobile_back.on('click', function(e) {
            e.preventDefault();
            ashade.change_location('history.back');
        });
        ashade_mobile_header.prepend($ashade_mobile_back);
    }

    $ashade_header.find('.ashade-nav-block').append(ashade_mobile_header);

    if ($ashade_header.find('.ashade-nav').length) {
        if ($ashade_header.find('.ashade-mob-nav').length) {
            mobile_menu.append('\
                <div class="ashade-mobile-menu-inner">\
                    <div class="ashade-mobile-menu-content">\
                        ' + $ashade_header.find('.ashade-mob-nav').html() + '\
                    </div>\
                </div>\
            ');
        } else {
            mobile_menu.append('\
                <div class="ashade-mobile-menu-inner">\
                    <div class="ashade-mobile-menu-content">\
                        ' + $ashade_header.find('.ashade-nav').html() + '\
                    </div>\
                </div>\
            ');
        }

        mobile_menu.find('ul.main-menu a').on('click', function(e) {
            var $this = jQuery(this),
                $parent = $this.parent();
            if ($parent.hasClass('menu-item-has-children') || $parent.find('ul').length) {
                e.preventDefault();
                $parent.children('ul').slideToggle(300).toggleClass('is-open');
            }
        });
        mobile_menu.find('ul.sub-menu').slideUp(1);
        mobile_menu.find("li.menu-item-has-children").each(function() {
            let $li = jQuery(this),
                $a = $li.children("a");

            if ($a.attr('href') && $a.attr('href').indexOf('http') > -1) {
                $a.attr("data-href", $a.attr("href")).attr("href", "javascript:void(0)");
                $a[0].addEventListener("touchstart", function(event) {
                    if (!ashade.tapedTwice) {
                        ashade.tapedTwice = true;
                        setTimeout(function() {
                            ashade.tapedTwice = false;
                        }, 300);
                        return false;
                    }
                    event.preventDefault();
                    //action on double tap goes below
                    $a.attr('href', $a.attr('data-href')).trigger('click');
                });
            }
        });
    }

    mobile_menu_button.on('click', function() {
        $ashade_body.addClass('ashade-mobile-menu-shown').addClass('is-locked');
        ashade.old_scroll_top = $ashade_window.scrollTop();
        gsap.fromTo('.ashade-mobile-menu ul.main-menu > li', {
            x: 0,
            y: 40,
            opacity: 0,
        }, {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.2,
            delay: 0.3,
            stagger: 0.1,
            onComplete: function() {
                $ashade_body.removeClass('is-locked');
            }
        }, );
    });

    mobile_menu_close.on('click', function() {
        let setDelay = 0;
        $ashade_body.addClass('is-locked');
        if (mobile_menu.find('.is-open').length) {
            mobile_menu.find('ul.sub-menu').slideUp(300);
            setDelay = 0.3;
        }
        gsap.fromTo('.ashade-mobile-menu ul.main-menu > li', {
            x: 0,
            y: 0,
            opacity: 1
        }, {
            x: 0,
            y: -40,
            opacity: 0,
            duration: 0.2,
            delay: setDelay,
            stagger: 0.1,
            onComplete: function() {
                $ashade_body.removeClass('ashade-mobile-menu-shown').removeClass('is-locked');
            }
        }, );
    });

    jQuery('.ashade-menu-overlay').on('click', function() {
        $ashade_body.removeClass('ashade-mobile-menu-shown').removeClass('is-locked');
    });

    // Custom Aside Opener Link
    if (jQuery('a[href="#ashade-aside-toggler"]').length) {
        jQuery('a[href="#ashade-aside-toggler"]').each(function() {
            jQuery(this).attr('href', 'javascript:void(0)').addClass('ashade-aside-toggler');
        });
    }

    // Aside Open and Close
    jQuery(document).on('click', 'a.ashade-aside-toggler', function(e) {
        e.preventDefault();
        $ashade_body.addClass('ashade-aside-shown').removeClass('ashade-menu-fade');
        ashade.old_scroll_top = $ashade_window.scrollTop();
    });
    jQuery('a.ashade-aside-close').on('click', function(e) {
        e.preventDefault();
        $ashade_body.removeClass('ashade-aside-shown');
    });
    jQuery('.ashade-aside-overlay').on('click', function() {
        $ashade_body.removeClass('ashade-aside-shown');
    });

    // Main Nav Events
    jQuery('nav.ashade-nav a').on('touchstart', function() {
        if (!jQuery(this).parent('li').hasClass('menu-item-has-children')) {
            jQuery(this).trigger('click');
        }
    });
    jQuery('nav.ashade-nav a').on('mouseenter', function(e) {
        $ashade_body.addClass('ashade-menu-fade');
    });
    jQuery('nav.ashade-nav').on('mouseleave', function() {
        $ashade_body.removeClass('ashade-menu-fade');
    });

    jQuery('.ashade-footer-menu a').on('mouseenter', function(e) {
        $ashade_body.addClass('ashade-footer-menu-fade');
    })
    jQuery('.ashade-footer-menu').on('mouseleave', function() {
        $ashade_body.removeClass('ashade-footer-menu-fade');
    });
    jQuery('.ashade-footer-menu-overlay').on('click', function() {
        $ashade_body.removeClass('ashade-footer-menu-fade');
    });

    // Back Button Functions
    jQuery('.ashade-back').on('click', function(e) {
        e.preventDefault();
        var $this = jQuery(this);

        // Albums Back
        if ($this.hasClass('albums-go-back')) {
            ashade.change_location('history.back');
        }

        // Back to Top
        if ($this.hasClass('is-to-top')) {
            if (!$ashade_body.hasClass('ashade-layout--horizontal')) {
                if ($ashade_window.scrollTop() > $ashade_window.height() / 2) {
                    $ashade_body.addClass('has-to-top');
                }
            }
            $this.addClass('in-action');

            if (jQuery('.ashade-albums-carousel').length) {
                ashade_ribbon.target = 0;
                ashade_ribbon.currentStep = 0;
                setTimeout(function() {
                    $ashade_body.removeClass('has-to-top');
                    $this.removeClass('in-action');
                }, 300, $this);
            } else {
                jQuery('html, body').stop().animate({
                    scrollTop: 0
                }, 500, function() {
                    if (!$ashade_body.hasClass('ashade-layout--horizontal')) {
                        $ashade_body.removeClass('has-to-top');
                    }
                    $this.removeClass('in-action');
                });
            }
        }

        // 404 Page
        if ($this.hasClass('is-404-return')) {
            ashade.change_location('back_404');
        }
        if ($this.hasClass('is-404-home')) {
            ashade.change_location($this.attr('data-href'));
        }

        // Maintenace Mode - Write Message
        if ($this.hasClass('is-message')) {
            $ashade_body.addClass('is-locked in-message-mode');
            $this.parent().removeClass('is-loaded');
            gsap.to('.ashade-content-wrap .ashade-content', {
                opacity: 0,
                y: -150,
                duration: 0.7,
                onComplete: function() {
                    jQuery('.ashade-back-wrap .is-message').hide();
                    jQuery('.ashade-back-wrap .is-message-close').show();
                }
            });
            gsap.to('.ashade-page-background', {
                opacity: 0,
                scale: 1.05,
                duration: 1,
            });
            gsap.to('#ashade-contacts-wrap', {
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: 0.3,
                onComplete: function() {
                    $ashade_body.removeClass('is-locked');
                    jQuery('.ashade-back-wrap').addClass('is-loaded');
                }
            });
        }

        // Maintenace Mode - Close Message
        if ($this.hasClass('is-message-close')) {
            $ashade_body.addClass('is-locked').removeClass('in-message-mode');
            $this.parent().removeClass('is-loaded');
            gsap.to('#ashade-contacts-wrap', {
                opacity: 0,
                y: 150,
                duration: 0.7,
                onComplete: function() {
                    jQuery('.ashade-back-wrap .is-message').show();
                    jQuery('.ashade-back-wrap .is-message-close').hide();
                }
            });
            gsap.to('.ashade-page-background', {
                opacity: 0.13,
                scale: 1,
                duration: 1,
            });
            gsap.to('.ashade-content-wrap .ashade-content', {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.3,
                onComplete: function() {
                    $ashade_body.removeClass('is-locked');
                    jQuery('.ashade-back-wrap').addClass('is-loaded');
                }
            });
        }
    });

    // Home Template Core
    if ($ashade_body.hasClass('ashade-home-template') && !jQuery('.ashade-maintenance-wrap').length) {
        // Functions
        let home_functions = {
            animate: function(event) {
                let $this = jQuery('a[data-event="' + event + '"]').parent();

                ashade.cursor.$el.removeClass('int-link');
                $ashade_body.removeClass('is-faded').addClass('ashade-content-shown');
                jQuery('.ashade-home-link-wrap').addClass('is-inactive');

                gsap.to('.ashade-page-background', {
                    opacity: 0,
                    scale: 1.05,
                    duration: 1,
                    delay: 0.5,
                });
                gsap.to('.ashade-home-link--works', 0.5, {
                    css: {
                        top: 0,
                        opacity: 0,
                    },
                    delay: 0.5,
                });
                gsap.to('.ashade-home-link--contacts', 0.5, {
                    css: {
                        top: '200%',
                        opacity: 0,
                    },
                    delay: 0.5,
                });

                jQuery('.ashade-page-title').empty().append('<span>' + $this.find('span:first-child').text() + '</span>' + $this.find('span:last-child').text()).removeClass('is-inactive');
                jQuery('.ashade-home-return').removeClass('is-inactive');

                gsap.to('.ashade-page-title-wrap', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-page-title-wrap').addClass('is-loaded').removeClass('is-inactive');
                    }
                });
                gsap.to('.ashade-back-wrap', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-back-wrap').addClass('is-loaded').removeClass('is-inactive');
                    }
                });

                if ($this.parent().hasClass('ashade-home-link--works')) {
                    var $current_content = jQuery('#ashade-home-works');
                }
                if ($this.parent().hasClass('ashade-home-link--contacts')) {
                    var $current_content = jQuery('#ashade-home-contacts');
                }

                $current_content
                    .wrap('<main class="ashade-content-wrap"/>')
                    .wrap('<div class="ashade-content-scroll"/>')
                    .wrap('<div class="ashade-content"/>')
                    .wrap('<section class="ashade-section"/>');

                if ($ashade_body.hasClass('ashade-smooth-scroll')) {
                    $ashade_scroll = $ashade_body.find('.ashade-content-scroll');
                    $ashade_body.height($ashade_scroll.height());
                }
                ashade.layout();

                if (jQuery('.ashade-grid.has-filter:not(.is-masonry)').length) {
                    jQuery('.ashade-grid.has-filter:not(.is-masonry)').each(function() {
                        ashade_f_grid[jQuery(this).attr('id')].layout();
                    });
                }

                gsap.fromTo('.ashade-content', 1, {
                    y: 100,
                    opacity: 0,
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: 1.2,
                });
            },
            back: function() {
                $ashade_body.addClass('is-locked');
                gsap.fromTo('.ashade-content', 1, {
                    y: 0,
                    opacity: 1,
                }, {
                    y: -100,
                    opacity: 0,
                    duration: 1,
                    onComplete: function() {
                        if ($ashade_body.find('.ashade-content-scroll').length) {
                            var $scroll_content = $ashade_body.find('.ashade-content-scroll');
                            if ($scroll_content.find('#ashade-home-works').length) {
                                var $current_content = jQuery('#ashade-home-works');
                            }
                            if ($scroll_content.find('#ashade-home-contacts').length) {
                                var $current_content = jQuery('#ashade-home-contacts');
                            }
                            for (var i = 0; i < 4; i++) {
                                $current_content.unwrap();
                            }
                            if ($ashade_body.hasClass('ashade-smooth-scroll')) {
                                ashade.sScroll.layout();
                                $ashade_body.height($ashade_window.height());
                            }
                        }
                    }
                });

                if (jQuery('.ashade-page-title-wrap').length) {
                    jQuery('.ashade-page-title-wrap').removeClass('is-loaded').addClass('is-inactive');
                    gsap.to('.ashade-page-title-wrap', 0.5, {
                        css: {
                            top: 0,
                            opacity: 0
                        },
                        delay: 0.5,
                    });
                }
                if (jQuery('.ashade-back-wrap').length) {
                    jQuery('.ashade-back-wrap').removeClass('is-loaded').addClass('is-inactive');
                    gsap.to('.ashade-back-wrap', 0.5, {
                        css: {
                            top: '200%',
                            opacity: 0
                        },
                        delay: 0.5,
                    });
                }
                gsap.to('.ashade-home-link--works', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-home-link--works').addClass('is-loaded').removeClass('is-inactive');
                    }
                });
                gsap.to('.ashade-home-link--contacts', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-home-link--contacts').addClass('is-loaded').removeClass('is-inactive');
                    }
                });
                gsap.to('.ashade-page-background', {
                    opacity: jQuery('.ashade-page-background').attr('data-opacity'),
                    scale: 1,
                    duration: 1,
                    delay: 1,
                    onComplete: function() {
                        $ashade_body.removeClass('ashade-content-shown');
                        $ashade_body.removeClass('is-locked');
                    }
                });
            },
            load: function(event) {
                let $this = jQuery('a[data-event="' + event + '"]').parent(),
                    nowDelay = 0.5;

                $ashade_body.removeClass('is-faded').addClass('ashade-content-shown');
                jQuery('.ashade-home-link-wrap').addClass('is-inactive');

                jQuery('.ashade-page-background').css({
                    'transform': 'scale(1.05)',
                    'opacity': '0'
                });
                gsap.to('.ashade-home-link--works', 0.5, {
                    css: {
                        top: 0,
                        opacity: 0
                    },
                    delay: nowDelay,
                });
                gsap.to('.ashade-home-link--contacts', 0.5, {
                    css: {
                        top: '200%',
                        opacity: 0
                    },
                    delay: nowDelay,
                });

                jQuery('.ashade-page-title').empty().append('<span>' + $this.find('span:first-child').text() + '</span>' + $this.find('span:last-child').text()).removeClass('is-inactive');
                jQuery('.ashade-home-return').removeClass('is-inactive');

                gsap.to('.ashade-page-title-wrap', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-page-title-wrap').addClass('is-loaded').removeClass('is-inactive');
                    }
                });
                gsap.to('.ashade-back-wrap', 0.5, {
                    css: {
                        top: '100%',
                        opacity: 1
                    },
                    delay: 1,
                    onComplete: function() {
                        jQuery('.ashade-back-wrap').addClass('is-loaded').removeClass('is-inactive');
                    }
                });

                let $current_content = false;
                if ($this.parent().hasClass('ashade-home-link--works')) {
                    $current_content = jQuery('#ashade-home-works');
                }
                if ($this.parent().hasClass('ashade-home-link--contacts')) {
                    $current_content = jQuery('#ashade-home-contacts');
                }

                if ($current_content) {
                    $current_content
                        .wrap('<main class="ashade-content-wrap"/>')
                        .wrap('<div class="ashade-content-scroll"/>')
                        .wrap('<div class="ashade-content"/>')
                        .wrap('<section class="ashade-section"/>');
                }

                if ($ashade_body.hasClass('ashade-smooth-scroll')) {
                    $ashade_scroll = $ashade_body.find('.ashade-content-scroll');
                    $ashade_body.height($ashade_scroll.height());
                }
                ashade.layout();

                if (jQuery('.ashade-grid.has-filter:not(.is-masonry)').length) {
                    jQuery('.ashade-grid.has-filter:not(.is-masonry)').each(function() {
                        if (ashade_f_grid[jQuery(this).attr('id')]) {
                            ashade_f_grid[jQuery(this).attr('id')].layout();
                        } else {
                            ashade_f_grid[jQuery(this).attr('id')] = new Ashade_Filtered_Grid(this);
                        }
                    });
                }

                gsap.fromTo('.ashade-content', 1, {
                    y: 100,
                    opacity: 0,
                }, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: 1.2,
                });
            },

        }

        if (window.location.href.indexOf('?event=') > -1 || window.location.href.indexOf('&event=') > -1) {
            let event = ashade_landing.get_event();
            let state_obj = {
                'page': event
            };
            history.replaceState(state_obj, '', window.location.href);
            home_functions.load(event);
        }

        // Open needed state
        window.onpopstate = function(e) {
            let state = e.state;
            if (state == null) {
                home_functions.back();
            } else {
                if ('back' == state.page) {
                    home_functions.back();
                } else {
                    home_functions.animate(state.page);
                }
            }
        };

        // Link Clicked
        jQuery('.ashade-home-link--a').on('click', function(e) {
            e.preventDefault();
            let event = jQuery(this).attr('data-event'),
                state_obj = {
                    'page': event
                };
            if ('back' == event) {
                history.pushState(state_obj, '', ashade_landing.get_location());
                home_functions.back();
            } else {
                history.pushState(state_obj, '', ashade_landing.get_event_url(event));
                home_functions.animate(event);
            }
        });
    }

    // All Links Events
    jQuery('a').on('click', function(e) {
        var $this = jQuery(this),
            this_href = $this.attr('href'),
            client_exception = false;

        if (typeof child_links_exceptions !== "undefined") {
            client_exception = child_links_exceptions($this);
        }

        if (this_href.indexOf('javascript') !== 0 && !client_exception) {
            if (this_href.indexOf('#') == 0) {
                if (!jQuery(this_href).length) {
                    window.location.hash = this_href;
                }
            } else {
                if (!$ashade_body.hasClass('ashade-unloading--none')) {
                    if ($this.attr('target') && '_blank' == $this.attr('target')) {
                        // Nothing to do here. Open link in new tab.
                    } else if (this_href.indexOf('elementor-action') > -1) {
                        // Nothing to do here. Download Link.
                    } else if ($this.is('[download]')) {
                        // Nothing to do here. Download Link.
                    } else if (this_href.indexOf('tel:') > -1 || this_href.indexOf('mailto:') > -1) {
                        // Nothing to do here. Tel or Email Link
                    } else {
                        if (!ashade.link_exception($this)) {
                            e.preventDefault();
                            if (this_href == '#') {
                                e.preventDefault();
                            } else if ($this.hasClass('ashade-lightbox-link') || $this.hasClass('shadowcore-lightbox-link')) {
                                e.preventDefault();
                            } else if ($this.is('[data-elementor-open-lightbox="yes"]')) {
                                e.preventDefault();
                            } else if (this_href.length > 1 && this_href[0] !== '#' && !/\.(jpg|jpeg|png|gif|webp)$/.test(this_href)) {
                                e.preventDefault();
                                ashade.change_location(this_href);
                            }
                        }
                    }
                }
            }
        }
    });

    // Filtering Grid
    if (jQuery('.ashade-grid.has-filter:not(.is-masonry)').length) {
        jQuery('.ashade-grid.has-filter:not(.is-masonry)').each(function() {
            ashade_f_grid[jQuery(this).attr('id')] = new Ashade_Filtered_Grid(this);
        });
    }

    // Masonry Items
    if (jQuery('.is-masonry').length) {
        jQuery('.is-masonry').each(function() {
            var $this = jQuery(this);
            $this.cache = [];
            $this.children('div').each(function() {
                $this.cache.push(this);
            });
            $this.masonry();

            // Filter
            if ($this.hasClass('has-filter')) {
                let $filter = $this.prev('div.ashade-filter-wrap'),
                    $filter_mobile_wrap = jQuery('<div class="ashade-mobile-filter-wrap"/>').appendTo($filter),
                    $filter_mobile = jQuery('<div class="ashade-mobile-filter"/>').appendTo($filter_mobile_wrap),
                    $filter_mobile_list = jQuery('<ul class="ashade-mobile-filter-list"/>').insertAfter($filter_mobile).slideUp(1),
                    $filter_mobile_value = jQuery('<span class="ashade-mobile-filter-value">' + $filter.find('a.is-active').text() + '</span>').appendTo($filter_mobile),
                    filter_action = function(category, label) {
                        // Remove and Set Active Class
                        $filter.find('.is-active').removeClass('is-active');
                        $filter.find('[data-category="' + category + '"]').addClass('is-active');

                        // Show and Hide Items
                        if ('*' == category) {
                            $this.empty();
                            jQuery($this.cache).each(function() {
                                $this.append(jQuery(this));
                                $this.masonry('appended', jQuery(this));
                            });
                            $this.masonry('reloadItems');
                            $this.masonry('layout');
                        } else {
                            if (!$this.children('div' + category).length) {
                                jQuery($this.cache).each(function() {
                                    if (jQuery(this).is('div' + category)) {
                                        $this.append(jQuery(this));
                                        $this.masonry('appended', jQuery(this));
                                    }
                                });
                                $this.masonry('reloadItems');
                                $this.masonry('layout')
                            }
                            if ($this.children('div:not(' + category + ')').length) {
                                $this.children('div:not(' + category + ')').each(function() {
                                    $this.masonry('remove', jQuery(this));
                                });
                            }
                            $this.masonry('layout')
                        }

                        // Update Mobile List
                        $filter_mobile_value.text(label);
                        $filter.removeClass('is-open');
                        $filter_mobile_list.slideUp(300);

                        // Relayout Sscroll for Home
                        if ($ashade_body.hasClass('ashade-home-template') && $ashade_body.hasClass('ashade-smooth-scroll')) {
                            ashade.sScroll.layout();
                        }
                    };

                $filter_mobile.prepend('<span class="ashade-mobile-filter-label">' + $filter.attr('data-label') + '</span>');
                $filter_mobile_wrap.append('\
				<svg xmlns="http://www.w3.org/2000/svg" width="19.875" height="10.969" viewBox="0 0 19.875 10.969">\
  					<path id="arrow-down" d="M-8.812-12.937,0-4.078l8.813-8.859,1.125,1.125L.563-2.437,0-1.969l-.562-.469-9.375-9.375Z" transform="translate(9.938 12.938)"/>\
				</svg>');

                // Add list items
                $filter.children('a').each(function() {
                    let $this_a = jQuery(this),
                        this_li = jQuery('<li data-category="' + $this_a.attr('data-category') + '">' + $this_a.text() + '</li>').appendTo($filter_mobile_list);

                    this_li.on('click', function(e) {
                        e.preventDefault();
                        let $this = jQuery(this),
                            category = $this.attr('data-category'),
                            label = $this.text();

                        filter_action(category, label);
                    });
                });

                // Set Current Values
                $filter.children('a.is-active').each(function() {
                    let category = jQuery(this).attr('data-category'),
                        label = jQuery(this).text();

                    $filter_mobile_list.find('[data-category="' + category + '"]').addClass('is-active');
                    $filter_mobile_value.text(label);
                });

                // Bind Actions
                $filter_mobile.on('click', function() {
                    jQuery(this).parents('.ashade-filter-wrap').toggleClass('is-open');
                    $filter_mobile_list.slideToggle(300);
                });

                $filter.on('click', 'a', function(e) {
                    e.preventDefault();
                    let $this_link = jQuery(this),
                        category = $this_link.attr('data-category'),
                        label = $this_link.text();

                    filter_action(category, label);
                });
            }
        });
    }

    // Kenburns Sliders
    if (jQuery('.ashade-kenburns-slider').length) {
        ashade.kenburns.init();
    }

    // Ashade Images Lazy Loading Init
    if (jQuery('.ashade-lazy').length) {
        new Ashade_Lazy('.ashade-lazy');
    }

    // Init DIV-images
    if (jQuery('.ashade-div-image:not(.is-loaded)').length) {
        jQuery('.ashade-div-image:not(.is-loaded)').each(function() {
            jQuery(this).css('background-image', 'url(' + jQuery(this).attr('data-src') + ')').addClass('is-loaded');
        });
    }

    // Justify Gallery
    if (jQuery('.ashade-justified-gallery').length) {
        jQuery('.ashade-justified-gallery').each(function() {
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && jQuery('img.ashade-lazy').length) {
                var options = {
                    rowHeight: parseInt(jQuery(this).attr('data-row-height'), 10),
                    lastRow: jQuery(this).attr('data-last-row'),
                    margins: parseInt(jQuery(this).attr('data-spacing'), 10),
                    captions: false,
                    selector: 'a.is-ready',
                    waitThumbnailsLoad: true
                }
            } else {
                var options = {
                    rowHeight: parseInt(jQuery(this).attr('data-row-height'), 10),
                    lastRow: jQuery(this).attr('data-last-row'),
                    margins: parseInt(jQuery(this).attr('data-spacing'), 10),
                    captions: false,
                    waitThumbnailsLoad: true
                }
            }
            jQuery(this).justifiedGallery(options);
        });
    }

    // Lightbox
    if (jQuery('.ashade-lightbox-link').length) {
        jQuery('.ashade-lightbox-link').each(function() {
            let $this = jQuery(this),
                this_item = {},
                this_gallery = 'default';

            if ($this.parent().find('.ashade-grid-item-holder[data-src]').length) {
                let $holder_bg = '';
                if ($this.parent().hasClass('justified-gallery')) {
                    $holder_bg = $this.find('.ashade-grid-item-holder[data-src]');
                } else {
                    $holder_bg = $this.parent().find('.ashade-grid-item-holder[data-src]');
                }
                if ($holder_bg.attr('data-src')) {
                    $holder_bg.css('background-image', 'url(' + $holder_bg.attr('data-src') + ')');
                }
            }
            if ($this.attr('data-type') && $this.data('type') !== 'image') {
                // Video Slide
                if ('video' == $this.data('video-type')) {
                    this_item.html = '\
					<div class="ashade-pswp-media--video" data-src="' + $this.attr('href') + '">\
						<video src="' + $this.attr('href') + '" controls playsinline></video>\
					</div>';
                } else {
                    this_item.html = '\
					<div class="ashade-pswp-media--iframe" data-src="' + $this.attr('href') + '">\
						<iframe src="' + $this.attr('href') + '?controls=1&amp;loop=0"></iframe>\
					</div>';
                }
            } else {
                // Image Slide
                if ($this.attr('data-size')) {
                    let item_size = $this.attr('data-size').split('x');
                    this_item.w = item_size[0];
                    this_item.h = item_size[1];
                }
                this_item.src = $this.attr('href');
            }

            if ($this.attr('data-caption')) {
                this_item.title = $this.attr('data-caption');
            }

            if ($this.attr('data-gallery')) {
                this_gallery = $this.attr('data-gallery');
            }

            if (ashade.pswp.gallery[this_gallery]) {
                ashade.pswp.gallery[this_gallery].push(this_item);
            } else {
                ashade.pswp.gallery[this_gallery] = [];
                ashade.pswp.gallery[this_gallery].push(this_item);
            }
            $this.attr('data-count', ashade.pswp.gallery[this_gallery].length - 1);
        });

        jQuery(document).on('click', '.ashade-lightbox-link', function(e) {
            e.preventDefault();

            let $this = jQuery(this),
                this_index = parseInt($this.attr('data-count'), 10),
                this_gallery = 'default',
                this_options = {
                    index: this_index,
                    history: false,
                    bgOpacity: 0.85,
                    showHideOpacity: true,
                    getThumbBoundsFn: function(index) {
                        var thumbnail = $this[0],
                            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                            rect = thumbnail.getBoundingClientRect();

                        return {
                            x: rect.left,
                            y: rect.top + pageYScroll,
                            w: rect.width
                        };
                    },
                };

            if ($this.attr('data-gallery')) {
                this_gallery = $this.attr('data-gallery');
            }

            ashade.pswp.lightbox = new PhotoSwipe($ashade_body.find('.pswp')[0], PhotoSwipeUI_Default, ashade.pswp.gallery[this_gallery], this_options);
            ashade.pswp.lightbox.init();

            // Click Overlay = Close
            if ($ashade_body.hasClass('pswp-close-by-overlay')) {
                $ashade_body.on('click', '.pswp__scroll-wrap', function(e) {
                    ashade.pswp.lightbox.close();
                });
                $ashade_body.on('click', '.ashade-pswp-image-wrap, .ashade-pswp-media--video', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                $ashade_body.on('click', '.pswp__scroll-wrap button, .pswp__scroll-wrap a, .pswp__scroll-wrap img', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                if (!$ashade_body.hasClass('pswp-click-to-zoom')) {
                    ashade.pswp.lightbox.listen('gettingData', function(index, item) {
                        let $currItem = jQuery(this.currItem.container);
                        if ($currItem.children('img').length) {
                            $currItem.children('img').wrap('<div class="ashade-pswp-image-wrap"/>');
                        }
                    });
                }
            }

            // Init video (if is video slide)
            if ($this.attr('data-type') !== 'image') {
                let $this_video = jQuery(ashade.pswp.lightbox.container).find('[data-src="' + $this.attr('href') + '"]');
                $this_video.addClass('is-inview').width(ashade.pswp.resizeVideo().w).height(ashade.pswp.resizeVideo().h);
                if ('video' == $this.attr('data-video-type')) {
                    if ($this_video.children('video').length) {
                        $this_video.children('video')[0].play();
                    }
                } else {
                    if ($this_video.children('iframe').length) {
                        if ('vimeo' == $this.attr('data-video-type')) {
                            $this_video.children('iframe').attr('src', $this_video.attr('data-src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;muted=1');
                        } else {
                            $this_video.children('iframe').attr('src', $this_video.attr('data-src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;mute=1');
                        }
                    }
                }
            }

            // Check for videos in view
            ashade.pswp.lightbox.listen('resize', function() {
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').width(ashade.pswp.resizeVideo().w).height(ashade.pswp.resizeVideo().h);
                }
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').width(ashade.pswp.resizeVideo().w).height(ashade.pswp.resizeVideo().h);
                }
            });

            ashade.pswp.lightbox.listen('beforeChange', function() {
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').width(ashade.pswp.resizeVideo().w).height(ashade.pswp.resizeVideo().h);
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').each(function() {
                        if (ashade_inView(this)) {
                            jQuery(this).addClass('is-inview');
                            if (jQuery(this).children('video').length) {
                                jQuery(this).children('video')[0].play();
                            }
                        } else {
                            jQuery(this).removeClass('is-inview');
                            if (jQuery(this).children('video').length) {
                                jQuery(this).children('video')[0].pause();
                            }
                        }
                    });
                }
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').width(ashade.pswp.resizeVideo().w).height(ashade.pswp.resizeVideo().h);
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').each(function() {
                        let $this_video = jQuery(this);
                        if (ashade_inView(this)) {
                            $this_video.addClass('is-inview');
                            if ($this_video.attr('data-src').indexOf('vimeo') > 0) {
                                $this_video.children('iframe').attr('src', $this_video.attr('data-src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;muted=1');
                            } else {
                                $this_video.children('iframe').attr('src', $this_video.attr('data-src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;mute=1');
                            }
                        } else {
                            $this_video.removeClass('is-inview');
                            $this_video.children('iframe').attr('src', jQuery(this).attr('data-src') + '?controls=1&amp;loop=0');
                        }
                    });
                }
            });

            ashade.pswp.lightbox.listen('close', function() {
                // Close ligthbox
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--iframe').each(function() {
                        if (jQuery(this).children('iframe').length) {
                            jQuery(this).children('iframe').attr('src', jQuery(this).attr('data-src') + '?controls=1&amp;loop=0');
                        }
                    });
                }
            });

            ashade.pswp.lightbox.listen('unbindEvents', function() {
                // Unbind Events after close
            });
            ashade.pswp.lightbox.listen('destroy', function() {
                // Destroy after unbind close
                if (jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').length) {
                    jQuery(ashade.pswp.lightbox.container).find('.ashade-pswp-media--video').each(function() {
                        if (jQuery(this).children('video').length) {
                            jQuery(this).children('video')[0].pause();
                        }
                    });
                }
            });
        });
    }

    // Contact Form
    if (jQuery('.wpcf7').length) {
        jQuery('.wpcf7').each(function() {
            let $this = jQuery(this),
                $form = $this.children('form.wpcf7-form');

            $form.on('submit', function() {
                $form.addClass('in-process');
            });
            this.addEventListener('wpcf7submit', function(event) {
                $form.removeClass('in-process');
            }, false);
        });
    }

    // Spacer
    jQuery('.ashade-spacer').each(function() {
        jQuery(this).height(jQuery(this).attr('data-size'));
    });

    // Sticky Post Preview
    if (jQuery('.ashade-post-preview.is-sticky').length) {
        jQuery('.ashade-post-preview.is-sticky').each(function() {
            let $this = jQuery(this);
            $this.wrapInner('<div class="ashade-sticky-post-wrap"/>');
        });
    }

    // Search Form
    if (jQuery('.ashade-search-form svg').length) {
        jQuery('.ashade-search-form svg').on('click', function() {
            jQuery(this).parents('form').submit();
        });
    }

    // Custom Select
    if ($ashade_body.find('select').length) {
        $ashade_body.find('select').each(function() {
            if (jQuery(this).parent().hasClass('woocommerce-input-wrapper') && jQuery(this).parents('form').hasClass('woocommerce-checkout')) {
                // Escape if is WooCommerce field
                return false;
            }

            let $this = jQuery(this),
                $select = jQuery('<div class="ashade-select is-link"/>'),
                $list = jQuery('<ul class="ashade-select__list"/>');

            $this.wrap('<div class="ashade-select-wrap"/>').after($list).after($select).addClass('is-hidden');
            let $wrap = $this.parent('.ashade-select-wrap');
            $wrap.css('max-width', $this.width() + 'px').append('\
				<svg xmlns="http://www.w3.org/2000/svg" width="19.875" height="10.969" viewBox="0 0 19.875 10.969">\
  					<path id="arrow-down" d="M-8.812-12.937,0-4.078l8.813-8.859,1.125,1.125L.563-2.437,0-1.969l-.562-.469-9.375-9.375Z" transform="translate(9.938 12.938)"/>\
				</svg>');
            $list.slideUp(1);

            if ('' == $this.val() || !$this.val()) {
                $select.text($this.children('option:first').text());
            } else {
                $select.text($this.children('option[value="' + $this.val() + '"]').text());
            }

            $this.children('option').each(function() {
                let $opt = jQuery(this);
                $list.append('<li class="is-link" data-value="' + $opt.val() + '">' + $opt.text() + '</li>');
            });

            $select.on('click', function(e) {
                e.stopPropagation();
                let $thisWrap = jQuery(this).parent();

                // Close Other Lists
                jQuery('div.ashade-select-wrap.is-active').not($thisWrap[0]).each(function() {
                    jQuery(this).removeClass('is-active').children('ul').slideUp(300);
                });

                // Open Current List
                $wrap.toggleClass('is-active');
                $list.slideToggle(300);
            });

            $list.children('li').on('click', function(e) {
                // Close List and Pick Value
                e.stopPropagation();
                $select.text(jQuery(this).text());
                $wrap.removeClass('is-active');
                $list.slideUp(300);
                $this.val(jQuery(this).attr('data-value')).trigger('change');
            });

            jQuery(document).on('click', function(e) {
                // Close All Lists
                jQuery('div.ashade-select-wrap.is-active').each(function() {
                    jQuery(this).removeClass('is-active').children('ul').slideUp(300);
                });
            });
        });
    }

    // Custom Radio
    if ($ashade_body.find('input[type="radio"]:not(".is-default")').length) {
        $ashade_body.find('input[type="radio"]').each(function() {
            let $this = jQuery(this),
                check_class = '';

            if ($this.is(':checked')) {
                check_class = 'is-checked';
            }

            $this.wrap('<div class="ashade-radio-wrap is-link ' + check_class + '"></div>').on('click', function() {
                jQuery('[name="' + jQuery(this).attr('name') + '"]').each(function() {
                    var $current = jQuery(this);
                    if ($current.is(':checked')) {
                        $current.parent('div').addClass('is-checked');
                    } else {
                        $current.parent('div').removeClass('is-checked');
                    }
                });
            });

        });
    }

    // Custom Checkbox
    if ($ashade_body.find('input[type="checkbox"]').length) {
        $ashade_body.find('input[type="checkbox"]').each(function() {
            let $checkbox = jQuery(this),
                check_class = '';

            if (!$checkbox.parent('label').hasClass('woocommerce-form__label-for-checkbox')) {
                if ($checkbox.is(':checked')) {
                    check_class = 'is-checked';
                }

                $checkbox.wrap('<div class="ashade-checkbox-wrap is-link ' + check_class + '"></div>').on('click', function() {
                    var $this = jQuery(this);
                    if ($this.is(":checked")) {
                        $this.parent('div').addClass('is-checked');
                    } else {
                        $this.parent('div').removeClass('is-checked');
                    }
                });
            }
        });
    }

    // Back to Top
    if (jQuery('.ashade-back.is-to-top').length && $ashade_body.hasClass('ashade-layout--horizontal')) {
        $ashade_body.addClass('has-to-top');
    }

    // Image Slider
    if (jQuery('.ashade-albums-slider').length) {
        ashade_slider.init();
    }

    // Image Ribbon
    if (jQuery('.ashade-albums-carousel').length) {
        ashade_ribbon.init();
    }

    // Clients Filter Counters
    if (jQuery('.ashade-filter-counters').length) {
        let $filter = jQuery('.ashade-filter-counters'),
            $mfilter = jQuery('.ashade-mobile-filter-list'),
            $mf_result = jQuery('.ashade-mobile-filter-value'),
            $gallery = $filter.next('.ashade-client-grid');

        ashade.f_counters = {
            $a: $filter.children('a[data-category="*"]'),
            $l: $filter.children('a[data-category=".is-liked"]'),
            $d: $filter.children('a[data-category=".is-disliked"]'),
            $u: $filter.children('a[data-category=".is-unviewed"]'),
            $ma: $mfilter.children('li[data-category="*"]'),
            $ml: $mfilter.children('li[data-category=".is-liked"]'),
            $md: $mfilter.children('li[data-category=".is-disliked"]'),
            $mu: $mfilter.children('li[data-category=".is-unviewed"]'),
            ia: $gallery.children('div').length,
            il: $gallery.children('div.is-liked').length,
            id: $gallery.children('div.is-disliked').length,
            iu: $gallery.children('div.is-unviewed').length,
            update: function() {
                this.$l.attr('data-count', this.il);
                this.$d.attr('data-count', this.id);
                this.$u.attr('data-count', this.iu);

                this.$ml.attr('data-count', this.il);
                this.$md.attr('data-count', this.id);
                this.$mu.attr('data-count', this.iu);

                $mf_result.attr('data-count', $filter.children("a:contains('" + $mf_result.text() + "')").attr('data-count'));
            }
        }
        ashade.f_counters.$a.attr('data-count', ashade.f_counters.ia);
        ashade.f_counters.$ma.attr('data-count', ashade.f_counters.ia);
        $mfilter.on('click', 'li', function() {
            ashade.f_counters.update()
        });
        ashade.f_counters.update();
    } else {
        ashade.f_counters = false;
    }

    // Client's Page Buttons
    if (jQuery('.ahshade-client-like').length) {
        jQuery(document).on('click', '.ahshade-client-like', function(e) {
            e.preventDefault();
            let $this = jQuery(this),
                $parent = jQuery(this).parents('.ashade-client-item'),
                this_event = '',
                prev_state = '';

            if ($parent.hasClass('is-liked')) {
                prev_state = 'l';
            }
            if ($parent.hasClass('is-disliked')) {
                prev_state = 'd';
            }
            if ($parent.hasClass('is-unviewed')) {
                prev_state = 'u';
            }
            $parent.removeClass('is-disliked');
            $parent.removeClass('is-unviewed');
            $parent.addClass('is-busy');
            if ($parent.hasClass('is-liked')) {
                // Remove Like
                this_event = 'remove';
            } else {
                // Add Like
                this_event = 'like';
            }

            jQuery.post(ashade_urls['ajax'], {
                action: 'ashade_client_approval',
                post_id: $parent.parent().attr('data-id'),
                item_id: $this.attr('data-id'),
                event: this_event
            }, function(response) {
                $parent.removeClass('is-busy');
                if ('remove' == this_event) {
                    $parent.removeClass('is-liked');
                    $parent.addClass('is-unviewed');
                    if (ashade.f_counters) {
                        ashade.f_counters.iu += 1;
                        ashade.f_counters.il -= 1;
                    }
                } else {
                    $parent.addClass('is-liked');
                    $parent.removeClass('is-unviewed');
                    if (ashade.f_counters) {
                        ashade.f_counters.il += 1;
                        if ('u' == prev_state) {
                            ashade.f_counters.iu -= 1;
                        } else if ('d' == prev_state) {
                            ashade.f_counters.id -= 1;
                        }
                    }
                }
                if (ashade.f_counters) ashade.f_counters.update();
            });
        });
    }
    if (jQuery('.ahshade-client-dislike').length) {
        jQuery(document).on('click', '.ahshade-client-dislike', function(e) {
            e.preventDefault();
            let $this = jQuery(this),
                $parent = jQuery(this).parents('.ashade-client-item'),
                this_event = '',
                prev_state = '';

            if ($parent.hasClass('is-liked')) {
                prev_state = 'l';
            }
            if ($parent.hasClass('is-disliked')) {
                prev_state = 'd';
            }
            if ($parent.hasClass('is-unviewed')) {
                prev_state = 'u';
            }
            $parent.removeClass('is-liked');
            $parent.removeClass('is-unviewed');
            $parent.addClass('is-busy');
            if ($parent.hasClass('is-disliked')) {
                // Remove Like
                this_event = 'remove';
            } else {
                // Add Like
                this_event = 'dislike';
            }

            jQuery.post(ashade_urls['ajax'], {
                action: 'ashade_client_approval',
                post_id: $parent.parent().attr('data-id'),
                item_id: $this.attr('data-id'),
                event: this_event
            }, function(response) {
                $parent.removeClass('is-busy');
                if ('remove' == this_event) {
                    $parent.removeClass('is-disliked');
                    $parent.addClass('is-unviewed');
                    if (ashade.f_counters) {
                        ashade.f_counters.iu += 1;
                        ashade.f_counters.id -= 1;
                    }
                } else {
                    $parent.addClass('is-disliked');
                    $parent.removeClass('is-unviewed');
                    if (ashade.f_counters) {
                        ashade.f_counters.id += 1;
                        if ('u' == prev_state) {
                            ashade.f_counters.iu -= 1;
                        } else if ('l' == prev_state) {
                            ashade.f_counters.il -= 1;
                        }
                    }
                }
                if (ashade.f_counters) ashade.f_counters.update();
            });
        });
    }

    // Author Notify
    if (jQuery('.ashade-author-notify-button').length) {
        jQuery('.ashade-author-notify-button').on('click', function() {
            let $this = jQuery(this),
                $parent = $this.parent(),
                client_data = $this.data('client'),
                $gallery = $parent.parent().find('.ashade-client-grid');

            client_data.url = document.URL;
            client_data.title = document.title;
            if ('yes' == client_data.includes) {
                let images_array = Array();
                $gallery.find('.is-liked').each(function() {
                    images_array.push(jQuery(this).attr('data-id'));
                });
                client_data.images = images_array;
            }

            jQuery.post(ashade_urls['ajax'], {
                action: 'shadowcore_proofing_notify',
                client_data: $this.data('client'),
            }, function(response) {
                $this.slideUp(300);
                $parent.find('.ashade-client-notify-message').html(response).slideDown(300);
                setTimeout(function() {
                    $this.slideDown(300);
                    $parent.find('.ashade-client-notify-message').slideUp(300);
                }, 3000, $this, $parent);
            });
        });
    }


    // Grid Item
    if (jQuery('.ashade-grid-item').length) {
        if (!ashade.iOSDevice) {
            jQuery('.ashade-grid-item').on('mouseenter', function() {
                let $this = jQuery(this);
                if ($this.find('video').length) {
                    $this.find('video')[0].play();
                }
                $this.parent().addClass('ashade-grid--hovered');
            }).on('mouseleave', function() {
                let $this = jQuery(this);
                $this.parent().removeClass('ashade-grid--hovered');
                if ($this.find('video').length) {
                    $this.find('video')[0].pause();
                }
            });
        }
    }
    // Justified Video Play
    if (jQuery('.ashade-justified-gallery').length) {
        jQuery('.ashade-justified-gallery a').on('mouseenter', function() {
            let $this = jQuery(this);
            if ($this.find('video').length) {
                $this.find('video')[0].play();
            }
        }).on('mouseleave', function() {
            let $this = jQuery(this);
            if ($this.find('video').length) {
                $this.find('video')[0].pause();
            }
        });
    }

    ashade.layout();
    ashade.loading();
}

ashade.layout = function() {
    // Close Mobile Menu (if it don't use)
    if ($ashade_window.width() > 760) {
        $ashade_body.removeClass('ashade-mobile-menu-shown');
    }

    // Attachment Page
    if (jQuery('.ashade-attachment-wrap').length) {
        jQuery('.ashade-attachment-wrap').each(function() {
            let $this = jQuery(this),
                $inner = $this.find('.ashade-attachment-inner'),
                $imgWrap = $this.find('.ashade-attachment'),
                ratio = $imgWrap.attr('data-ratio'),
                maxH = $ashade_window.height() - $ashade_header.height() - $ashade_footer.height() - parseInt($inner.css('padding-top'), 10) - parseInt($inner.css('padding-bottom'), 10),
                maxW = $ashade_window.width() - parseInt($inner.css('padding-left'), 10) - parseInt($inner.css('padding-right'), 10),
                tempW = maxH / ratio,
                setW, setH;
            if ($ashade_body.hasClass('admin-bar')) {
                maxH = maxH - jQuery('#wpadminbar').height();
            }
            if (tempW > maxW) {
                setW = maxW;
                setH = setW * ratio;
            } else {
                setH = maxH;
                setW = maxH / ratio;
            }
            $this.css({
                'padding-top': $ashade_header.height(),
                'padding-bottom': $ashade_footer.height(),
            })
            $imgWrap.find('img').width(setW).height(setH);
        });
    }

    // Header Space Holder
    if (typeof $ashade_header_holder !== 'undefined') {
        $ashade_header_holder.height($ashade_header.height());
    }

    // Header Padding to Home Template
    if (jQuery('#ashade-home-works').length) {
        jQuery('#ashade-home-works').css('padding-top', $ashade_header.height() + 'px');
    }
    if (jQuery('#ashade-home-contacts').length) {
        jQuery('#ashade-home-contacts').css('padding-top', $ashade_header.height() + 'px');
    }

    // Relayout Masonry items
    if (jQuery('.is-masonry').length) {
        jQuery('.is-masonry').each(function() {
            var $this_el = jQuery(this);
            if ('absolute' == $this_el.children('div').css('position')) {
                $this_el.masonry('layout');
            } else {
                $this_el.masonry();
            }
        });
    }

    // Fullheight Row
    if (jQuery('.ashade-row-fullheight').length) {
        jQuery('.ashade-row-fullheight').each(function() {
            var $this = jQuery(this),
                minHeight = $ashade_window.height();

            if ($ashade_body.hasClass('admin-bar')) {
                minHeight = minHeight - jQuery('#wpadminbar').height();
            }
            if ($this.hasClass('exclude-header')) {
                minHeight = minHeight - $ashade_header.height();
            }
            if ($this.hasClass('exclude-footer')) {
                minHeight = minHeight - $ashade_footer.height();
            }
            $this.css('min-height', minHeight + 'px');
        });
    }

    // Dropdown Menu Position
    $ashade_header.find('.ashade-menu-offset').removeClass('ashade-menu-offset');

    $ashade_header.find('.sub-menu').each(function() {
        var $this = jQuery(this),
            this_left = $this.offset().left,
            this_left_full = $this.offset().left + $this.width() + parseInt($this.css('padding-left'), 10) + parseInt($this.css('padding-right'), 10);

        if (this_left_full > $ashade_window.width()) {
            $this.addClass('ashade-menu-offset');
        }
    });

    // Smooth Scroll Functions
    ashade.old_scroll_top = $ashade_window.scrollTop();
    if ($ashade_body.hasClass('ashade-smooth-scroll')) {
        ashade.sScroll.layout();
    }
}

// Loading Animation
ashade.loading = function() {
    if ($ashade_body.hasClass('ashade-loading--full')) {
        // Load Page Title and Guides
        if (!$ashade_body.hasClass('ashade-layout--horizontal')) {
            // Vertical Layout
            if (jQuery('.ashade-page-title-wrap:not(.is-inactive)').length) {
                gsap.to('.ashade-page-title-wrap:not(.is-inactive)', 0.5, {
                    css: {
                        top: '100%',
                    },
                    onComplete: function() {
                        jQuery('.ashade-page-title-wrap:not(.is-inactive)').addClass('is-loaded');
                    }
                });
            }
            if (jQuery('.ashade-back-wrap:not(.is-inactive)').length) {
                gsap.to('.ashade-back-wrap:not(.is-inactive)', 0.5, {
                    css: {
                        top: '100%',
                    },
                    onComplete: function() {
                        jQuery('.ashade-back-wrap:not(.is-inactive)').addClass('is-loaded');
                    }
                });
            }
        } else {
            // Horizontal Layout
            if (jQuery('.ashade-page-title-wrap:not(.is-inactive)').length) {
                if (jQuery('.ashade-page-title-wrap:not(.is-inactive)').hasClass('ashade-page-title--is-alone')) {
                    setTimeout("jQuery('.ashade-page-title-wrap:not(.is-inactive)').addClass('is-loaded')", 500);
                } else {
                    gsap.to('.ashade-page-title-wrap:not(.is-inactive)', 0.5, {
                        x: 0,
                        delay: 0.5,
                        onComplete: function() {
                            jQuery('.ashade-page-title-wrap:not(.is-inactive)').addClass('is-loaded');
                        }
                    });
                }
            }
            if (jQuery('.ashade-back-wrap:not(.is-inactive)').length) {
                gsap.to('.ashade-back-wrap:not(.is-inactive)', 0.5, {
                    css: {
                        x: 0,
                    },
                    delay: 0.5,
                    onComplete: function() {
                        jQuery('.ashade-back-wrap:not(.is-inactive)').addClass('is-loaded');
                    }
                });
            }
        }

        // Load Home Links
        if (ashade_landing && 'contacts' !== ashade_landing.get_event() && 'works' !== ashade_landing.get_event()) {
            gsap.to('.ashade-home-link--works:not(.is-inactive)', 0.5, {
                css: {
                    top: '100%',
                },
                onComplete: function() {
                    jQuery('.ashade-home-link--works:not(.is-inactive)').addClass('is-loaded');
                }
            });
            gsap.to('.ashade-home-link--contacts:not(.is-inactive)', 0.5, {
                css: {
                    top: '100%',
                },
                onComplete: function() {
                    jQuery('.ashade-home-link--contacts:not(.is-inactive)').addClass('is-loaded');
                }
            });
        }

        // Load Page Background
        if (ashade_landing && ('contacts' == ashade_landing.get_event() || 'works' == ashade_landing.get_event())) {
            if (jQuery('.ashade-page-background').length) {
                gsap.fromTo('.ashade-page-background', {
                    scale: 1.05,
                    opacity: 0,
                }, {
                    scale: 1.05,
                    opacity: 0,
                    duration: 1,
                    delay: ashade.config.content_load_delay,

                });
            }
        } else {
            if (jQuery('.ashade-page-background').length) {
                gsap.fromTo('.ashade-page-background', {
                    scale: 1.05,
                    opacity: 0,
                }, {
                    scale: 1,
                    opacity: jQuery('.ashade-page-background').attr('data-opacity'),
                    duration: 1,
                    delay: ashade.config.content_load_delay,

                });
            }
        }

        let logoDelay = ashade.config.content_load_delay;
        if ($ashade_window.width() < 760) {
            logoDelay = 0.1;
        }

        // Load Logo
        gsap.from('.ashade-logo', {
            x: '-50%',
            opacity: 0,
            duration: 0.5,
            delay: logoDelay
        });

        // Load Mobile Menu
        gsap.from('.ashade-mobile-header > a', {
            x: 10,
            y: -10,
            opacity: 0,
            duration: 0.2,
            delay: 0.1,
            stagger: 0.1
        }, );

        // Load Menu
        gsap.from('.ashade-nav ul.main-menu > li', {
            x: -10,
            y: -10,
            opacity: 0,
            duration: 0.2,
            delay: ashade.config.content_load_delay,
            stagger: 0.1
        }, );

        // Load Footer Menu
        if (jQuery('.ashade-footer-menu').length) {
            if ($ashade_window.width() < 760) {
                gsap.from('.ashade-footer-menu > li', {
                    x: 0,
                    y: -15,
                    opacity: 0,
                    duration: 0.2,
                    delay: ashade.config.content_load_delay,
                    stagger: 0.1
                }, );
            } else {
                gsap.from('.ashade-footer-menu > li', {
                    x: -10,
                    y: -10,
                    opacity: 0,
                    duration: 0.2,
                    delay: ashade.config.content_load_delay,
                    stagger: 0.1
                }, );
            }
        }
        // Load Footer Socials
        if (jQuery('.ashade-footer__socials').length) {
            if ($ashade_window.width() < 760) {
                gsap.from('.ashade-footer__socials li', {
                    x: 0,
                    y: -15,
                    opacity: 0,
                    duration: 0.2,
                    delay: ashade.config.content_load_delay,
                    stagger: 0.1
                }, );
            } else {
                gsap.from('.ashade-footer__socials li', {
                    x: -10,
                    y: -10,
                    opacity: 0,
                    duration: 0.2,
                    delay: ashade.config.content_load_delay,
                    stagger: 0.1
                }, );
            }
        }

        // Load Fotoer Copyright
        if (jQuery('.ashade-footer__copyright').length) {
            if ($ashade_window.width() < 760) {
                gsap.from('.ashade-footer__copyright', {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    delay: ashade.config.content_load_delay
                });
            } else {
                gsap.from('.ashade-footer__copyright', {
                    x: 50,
                    opacity: 0,
                    duration: 0.5,
                    delay: ashade.config.content_load_delay
                });
            }
        }

        // Show Content
        if (!$ashade_body.hasClass('ashade-home-template') || jQuery('.ashade-maintenance-wrap').length) {
            if (jQuery('.ashade-content').length) {
                let contentDelay = ashade.config.content_load_delay * 1.7;
                if ($ashade_window.width() < 760) {
                    contentDelay = 0.5;
                }
                gsap.from('.ashade-content', {
                    opacity: 0,
                    y: 100,
                    duration: 1,
                    delay: contentDelay,
                    onStart: function() {
                        ashade.content_loaded();
                    }
                });
            }
        }

        // Show 404 Text
        if (jQuery('.ashade-404-text').length) {
            let contentDelay = ashade.config.content_load_delay * 1.7;
            if ($ashade_window.width() < 760) {
                contentDelay = 0.5;
            }
            gsap.from('.ashade-404-text', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: contentDelay
            });
        }

        // Show Protected Test
        if (jQuery('.ashade-protected-text').length) {
            let contentDelay = ashade.config.content_load_delay * 1.7;
            if ($ashade_window.width() < 760) {
                contentDelay = 0.5;
            }
            gsap.from('.ashade-protected-text', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: contentDelay
            });
        }

        // Show Albums Ribbon Content
        if (jQuery('.ashade-albums-carousel').length) {
            if (jQuery('.ashade-albums-carousel').hasClass('is-vertical')) {
                gsap.from('.ashade-album-item__inner', {
                    opacity: 0,
                    y: 100,
                    duration: 1,
                    stagger: 0.1,
                    delay: ashade.config.content_load_delay * 1.7
                });
            } else {
                gsap.from('.ashade-album-item__inner', {
                    opacity: 0,
                    x: 100,
                    duration: 1,
                    stagger: 0.1,
                    delay: ashade.config.content_load_delay * 1.7
                });
            }
            if (ashade_ribbon.$bar) {
                gsap.from(ashade_ribbon.$bar[0], {
                    opacity: 0,
                    y: 20,
                    duration: 1,
                    delay: ashade.config.content_load_delay * 1.7
                });
            }
        }

        // Show Albums Slider Content
        if (jQuery('.ashade-albums-slider').length) {
            if (jQuery('.ashade-album-item__title').length) {
                gsap.to('.ashade-album-item__title', {
                    css: {
                        top: '100%',
                    },
                    delay: 0.5,
                    duration: 1,
                    onComplete: function() {
                        jQuery('.ashade-album-item__title').addClass('is-loaded');
                    }
                });
            }
            if (jQuery('.ashade-album-item__explore').length) {
                gsap.to('.ashade-album-item__explore', {
                    css: {
                        top: '100%',
                    },
                    delay: 0.5,
                    duration: 1,
                    onComplete: function() {
                        jQuery('.ashade-album-item__explore').addClass('is-loaded');
                    }
                });
            }
            gsap.fromTo('.ashade-slider-prev', {
                x: -50,
            }, {
                x: 0,
                delay: ashade.config.content_load_delay * 1.7,
                duration: 0.5,
                onStart: function() {
                    jQuery('.ashade-slider-prev').addClass('is-loaded');
                }
            });
            gsap.fromTo('.ashade-slider-next', {
                x: 50,
            }, {
                x: 0,
                delay: ashade.config.content_load_delay * 1.7,
                duration: 0.5,
                onStart: function() {
                    jQuery('.ashade-slider-next').addClass('is-loaded');
                }
            });
            gsap.from('.ashade-album-item__image', {
                scale: 1.05,
                opacity: 0,
                duration: 1,
                delay: ashade.config.content_load_delay * 1.7,
            });
        }

        setTimeout("$ashade_body.addClass('is-loaded')", 1500);
    } else {
        jQuery('.ashade-home-link--works:not(.is-inactive)').addClass('is-loaded');
        jQuery('.ashade-home-link--contacts:not(.is-inactive)').addClass('is-loaded');
        jQuery('.ashade-back-wrap:not(.is-inactive)').addClass('is-loaded');
        jQuery('.ashade-page-title-wrap:not(.is-inactive)').addClass('is-loaded');
        jQuery('.ashade-album-item__title').addClass('is-loaded');
        jQuery('.ashade-album-item__explore').addClass('is-loaded');
        jQuery('.ashade-slider-prev').addClass('is-loaded');
        jQuery('.ashade-slider-next').addClass('is-loaded');
    }
    if ($ashade_body.hasClass('ashade-loading--fade')) {
        setTimeout("$ashade_body.addClass('is-loaded')", 500);
    }
    if ($ashade_body.hasClass('ashade-loading--none')) {
        $ashade_body.addClass('is-loaded');
    }

}

ashade.change_location = function(this_href) {
    if ($ashade_body.hasClass('ashade-unloading--none')) {
        if ('history.back' == this_href) {
            window.location = ashade.config.referrer;
        } else if ('back_404' == this_href) {
            window.history.back();
        } else {
            window.location = this_href;
        }
    } else if ($ashade_body.hasClass('ashade-unloading--full')) {
        ashade.cursor.$el.addClass('is-unloading');
        $ashade_body.addClass('is-locked');
        if ($ashade_window.width() < 760 && $ashade_body.hasClass('ashade-mobile-menu-shown')) {
            let setDelay = 0;
            $ashade_body.addClass('is-locked');
            if (jQuery('.ashade-mobile-menu').find('.is-open').length) {
                jQuery('.ashade-mobile-menu').find('ul.sub-menu').slideUp(300);
                setDelay = 0.3;
            }
            gsap.fromTo('.ashade-mobile-menu ul.main-menu > li', {
                x: 0,
                y: 0,
                opacity: 1
            }, {
                x: 0,
                y: -40,
                opacity: 0,
                duration: 0.2,
                delay: setDelay,
                stagger: 0.1,
                onComplete: function() {
                    window.location = this_href;
                }
            }, );
            return false;
        }
        $ashade_body.removeClass('is-loaded');
        if ($ashade_body.hasClass('ashade-aside-shown')) {
            $ashade_body.removeClass('ashade-aside-shown');
        }
        if ($ashade_body.hasClass('ashade-mobile-menu-shown')) {
            $ashade_body.removeClass('ashade-mobile-menu-shown');
        }

        // Unload Content
        if (jQuery('.ashade-content').length) {
            gsap.to('.ashade-content', {
                css: {
                    opacity: 0,
                    y: -100,
                },
                duration: 0.6,
            });
        }

        // Unload 404 Content
        if (jQuery('.ashade-404-text').length) {
            gsap.to('.ashade-404-text', {
                css: {
                    opacity: 0,
                    y: -50,
                },
                duration: 0.6,
            });
        }

        // Unload Protected Content
        if (jQuery('.ashade-protected-text').length) {
            gsap.to('.ashade-protected-text', {
                css: {
                    opacity: 0,
                    y: -50,
                },
                duration: 0.6,
            });
        }

        // Unload Albums Carousel Content
        if (jQuery('.ashade-albums-carousel').length) {
            if (ashade_ribbon.type == 'vertical') {
                gsap.to('.ashade-album-item__inner.is-inview', {
                    css: {
                        opacity: 0,
                        y: -100,
                    },
                    stagger: 0.1,
                    delay: 0.5,
                    duration: 0.6,
                });
            } else {
                gsap.to('.ashade-album-item__inner.is-inview', {
                    css: {
                        opacity: 0,
                        x: -100,
                    },
                    stagger: 0.1,
                    delay: 0.5,
                    duration: 0.6,
                });
            }
            if (ashade_ribbon.$bar) {
                gsap.to(ashade_ribbon.$bar[0], {
                    opacity: 0,
                    y: 20,
                    duration: 1,
                });
            }
        }

        // Unload Albums Slider Content
        if (jQuery('.ashade-albums-slider').length) {
            if (jQuery('.ashade-album-item__title').length) {
                setTimeout("jQuery('.ashade-album-item__title').removeClass('is-loaded')", 300);
                gsap.to('.ashade-album-item__title', {
                    css: {
                        top: '0%',
                    },
                    delay: 1.2,
                    duration: 1,
                });
            }
            if (jQuery('.ashade-album-item__explore').length) {
                setTimeout("jQuery('.ashade-album-item__explore').removeClass('is-loaded')", 300);
                gsap.to('.ashade-album-item__explore', {
                    css: {
                        top: '200%',
                    },
                    delay: 1.2,
                    duration: 1,
                });
            }
            gsap.fromTo('.ashade-slider-prev', {
                x: 0,
            }, {
                x: -50,
                duration: 0.5,
                onStart: function() {
                    jQuery('.ashade-slider-prev').removeClass('is-loaded');
                }
            });
            gsap.fromTo('.ashade-slider-next', {
                x: 0,
            }, {
                x: 50,
                duration: 0.5,
                onStart: function() {
                    jQuery('.ashade-slider-next').removeClass('is-loaded');
                }
            });
            gsap.to('.ashade-album-item__image', {
                css: {
                    scale: 1.05,
                    opacity: 0,
                },
                duration: 1,
                delay: ashade.config.content_load_delay * 1.7,
            });
        }

        // Remove Logo
        gsap.to('.ashade-logo', {
            css: {
                x: '-50%',
                opacity: 0,
            },
            duration: 0.5,
            delay: 0.5
        });

        // Remove Menu
        gsap.to('.ashade-nav ul.main-menu > li', {
            css: {
                x: -10,
                y: -10,
                opacity: 0,
            },
            duration: 0.2,
            delay: 0.5,
            stagger: 0.1
        }, );

        // Unload Mobile Menu
        gsap.to('.ashade-mobile-header > a', {
            x: -10,
            y: -10,
            opacity: 0,
            duration: 0.2,
            delay: 0.5,
            stagger: 0.1
        }, );

        // Unload Footer Menu
        if (jQuery('.ashade-footer-menu').length) {
            gsap.to('.ashade-footer-menu > li', {
                css: {
                    x: -10,
                    y: -10,
                    opacity: 0,
                },
                duration: 0.2,
                delay: 0.5,
                stagger: 0.1
            }, );
        }

        // Footer Socials
        if (jQuery('.ashade-footer__socials').length) {
            gsap.to('.ashade-footer__socials li', {
                css: {
                    x: -10,
                    y: -10,
                    opacity: 0,
                },
                duration: 0.2,
                delay: 0.5,
                stagger: 0.1
            }, );
        }

        // Fotoer Copyright
        if (jQuery('.ashade-footer__copyright').length) {
            gsap.to('.ashade-footer__copyright', {
                css: {
                    x: 50,
                    opacity: 0,
                },
                duration: 0.5,
                delay: 0.5
            });
        }

        // Remove Page Title and Guides
        if (!$ashade_body.hasClass('ashade-layout--horizontal')) {
            // Vertical Layout
            if (jQuery('.ashade-page-title-wrap').length) {
                setTimeout("jQuery('.ashade-page-title-wrap:not(.is-inactive)').removeClass('is-loaded')", 600);
                gsap.to('.ashade-page-title-wrap', 0.5, {
                    css: {
                        top: 0,
                    },
                    delay: 1.1,
                });
            }
            if (jQuery('.ashade-back-wrap').length) {
                setTimeout("jQuery('.ashade-back-wrap:not(.is-inactive)').removeClass('is-loaded')", 600);
                gsap.to('.ashade-back-wrap', 0.5, {
                    css: {
                        top: '200%',
                    },
                    delay: 1.1,
                });
            }
        } else {
            // Horizontal Layout
            if (jQuery('.ashade-page-title-wrap:not(.is-inactive)').length) {
                if (jQuery('.ashade-page-title-wrap:not(.is-inactive)').hasClass('ashade-page-title--is-alone')) {
                    setTimeout("jQuery('.ashade-page-title-wrap:not(.is-inactive)').removeClass('is-loaded')", 600);
                } else {
                    setTimeout("jQuery('.ashade-page-title-wrap:not(.is-inactive)').removeClass('is-loaded')", 600);
                    gsap.to('.ashade-page-title-wrap:not(.is-inactive)', 0.5, {
                        x: '-100%',
                        delay: 1.1,
                    });
                }
            }
            if (jQuery('.ashade-back-wrap:not(.is-inactive)').length) {
                setTimeout("jQuery('.ashade-back-wrap:not(.is-inactive)').removeClass('is-loaded')", 600);
                gsap.to('.ashade-back-wrap:not(.is-inactive):not(.ashade-404-return-wrap)', 0.5, {
                    css: {
                        x: '100%',
                    },
                    delay: 1.1,
                });
                gsap.to('.ashade-back-wrap.ashade-404-return-wrap:not(.is-inactive)', 0.5, {
                    css: {
                        x: '-100%',
                    },
                    delay: 1.1,
                });
            }
        }

        // Home Template Unloading
        if ($ashade_body.hasClass('ashade-home-template') && !jQuery('.ashade-maintenance-wrap').length) {
            if (!$ashade_body.hasClass('ashade-home-state--contacts') && !$ashade_body.hasClass('ashade-home-state--works')) {
                var links_delay = 0.5,
                    links_timeout = 0;
            } else {
                var links_delay = 1.1,
                    links_timeout = 600;
            }
            setTimeout("jQuery('.ashade-home-link--works:not(.is-inactive)').removeClass('is-loaded')", links_timeout);
            gsap.to('.ashade-home-link--works:not(.is-inactive)', 0.5, {
                css: {
                    top: 0,
                    opacity: 0,
                },
                delay: links_delay,
            });
            setTimeout("jQuery('.ashade-home-link--contacts:not(.is-inactive)').removeClass('is-loaded')", links_timeout);
            gsap.to('.ashade-home-link--contacts:not(.is-inactive)', 0.5, {
                css: {
                    top: '200%',
                    opacity: 0,
                },
                delay: links_delay,
            });
        }

        // Remove Page Background
        if (jQuery('.ashade-page-background').length) {
            gsap.to('.ashade-page-background', {
                css: {
                    scale: 1.05,
                    opacity: 0,
                },
                duration: 1,
                delay: ashade.config.content_load_delay * 1.7,
            });
        }

        setTimeout(function() {
            if ('history.back' == this_href) {
                window.location = ashade.config.referrer;
            } else if ('back_404' == this_href) {
                window.history.back();
            } else {
                window.location = this_href;
            }
        }, 2100, this_href);
    } else if ($ashade_body.hasClass('ashade-unloading--fade')) {
        // Fade Unload
        $ashade_body.addClass('is-fade-unload');
        gsap.to('body', {
            css: {
                opacity: 0,
            },
            duration: 1,
        });

        setTimeout(function() {
            if ('history.back' == this_href) {
                window.location = ashade.config.referrer;
            } else if ('back_404' == this_href) {
                window.history.back();
            } else {
                window.location = this_href;
            }
        }, 1000, this_href);
    } else {
        window.location = this_href;
    }
}

// DOM Ready. Init Template Core.
jQuery(document).ready(function() {
    ashade.init();
});

// Fix for Scroll in Elementor Editor
$ashade_window.on('elementor/frontend/init', function() {
    if (elementorFrontend.isEditMode()) {

        elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope) {
            if ($ashade_body.hasClass('ashade-smooth-scroll')) {
                ashade.sScroll.layout();
            }
        });
    }
});

$ashade_window.on('resize', function() {
    // Window Resize Actions
    ashade.layout();
    setTimeout(ashade.layout(), 500);
}).on('load', function() {
    // Window Load Actions
    ashade.layout();
}).on('scroll', function() {
    // Header Fade Point
    if ($ashade_window.scrollTop() > ashade.config.fade_point) {
        $ashade_header.addClass('is-faded');
    } else {
        $ashade_header.removeClass('is-faded');
    }

    if ($ashade_body.hasClass('ashade-aside-shown')) {
        $ashade_window.scrollTop(ashade.old_scroll_top);
    }
    if ($ashade_body.hasClass('ashade-mobile-menu-shown')) {
        $ashade_window.scrollTop(ashade.old_scroll_top);
    }
    if ($ashade_body.hasClass('ashade-smooth-scroll')) {
        ashade.sScroll.target = $ashade_window.scrollTop();
        if (ashade.sScroll.target > ($ashade_scroll.height() - $ashade_window.height())) {
            ashade.sScroll.layout();
        }
    }

    //Window Scroll Actions
    if (jQuery('.ashade-back.is-to-top:not(.in-action)').length) {
        if (!$ashade_body.hasClass('ashade-layout--horizontal')) {
            if ($ashade_window.scrollTop() > $ashade_window.height() / 2) {
                $ashade_body.addClass('has-to-top');
            } else {
                $ashade_body.removeClass('has-to-top');
            }
        } else {
            $ashade_body.addClass('has-to-top');
        }
    }
});

// Keyboard Controls
jQuery(document).on('keyup', function(e) {
    switch (e.keyCode) {
        case 27: // 'Esc' Key
            if ($ashade_body.hasClass('ashade-aside-shown')) {
                $ashade_body.removeClass('ashade-aside-shown');
            }
            if ($ashade_body.hasClass('shown-more-categories')) {
                $ashade_body.removeClass('shown-more-categories');
            }
            break;
        default:
            break;
    }
});

// Init Content After Loading
ashade.content_loaded = function() {
    ashade.layout();
}

// Firefox Back Button Fix
window.onunload = function() {};

// Safari Back Button Fix
jQuery(window).on('pageshow', function(event) {
    if (event.originalEvent.persisted) {
        window.location.reload()
    }
});