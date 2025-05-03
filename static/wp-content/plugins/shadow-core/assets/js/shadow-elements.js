/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";

/* Elements Object */
var shadowcore_editor = {
    hotspot: {},
    query_carousel: {}
};
var shadowcore_el = {
    elements: {
        countdown: Array(),
        tns: Array(),
        pswp_gallery: Array(),
        kenburns: Array(),
        sliders: Array(),
        ribbons: Array(),
        masonry: Array(),
    },
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
            console.warn('Can not load image. Image data-src error.');
            return
        }

        if (jQuery(this_img).is('img')) {
            this_img.src = src;
            this_img.addEventListener('load', function(e) {
                let this_el = e.target;
                this_el.classList.remove('shadowcore-lazy');
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    if (jQuery(this_el).parents('div').hasClass('shadowcore-justified-gallery')) {
                        setTimeout(function() {
                            jQuery(this_el).parent('a').addClass('is-ready');
                        }, 100, this_el);
                        setTimeout(function() {
                            jQuery(this_el).parents('.shadowcore-justified-gallery').justifiedGallery();
                        }, 500, this_el);
                    }
                }
            });
        }
        if (jQuery(this_img).is('div')) {
            jQuery(this_img).css('background-image', 'url(' + jQuery(this_img).data('src') + ')');
            let img = new Image();
            img.src = src;
            img.original_el = this_img;
            img.addEventListener('load', function(e) {
                let $this_el = jQuery(e.target.original_el);
                $this_el.removeClass('shadowcore-lazy');
                if ($this_el.parent().hasClass('shadowcore-lazy-await')) {
                    $this_el.parent('.shadowcore-lazy-await').addClass('is-done');
                }

                if ($this_el.hasClass('shadowcore-div-image')) {
                    $this_el.addClass('is-loaded');
                }

                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                    if ($this_el.parents('div').hasClass('shadowcore-justified-gallery')) {
                        setTimeout(function() {
                            $this_el.parent('a').addClass('is-ready');
                        }, 100, $this_el);
                        setTimeout(function() {
                            $this_el.parents('.shadowcore-justified-gallery').justifiedGallery();
                        }, 500, $this_el);
                    }
                }
            });
        }
    },
    pswpMaxHeight: function() {
        let maxHeight = window.innerHeight;
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
    pswpVideoSize: function() {
        let result = {};
        if (window.innerWidth / 16 > this.pswpMaxHeight() / 9) {
            result.w = this.pswpMaxHeight() * 1.7778 * 0.8;
            result.h = this.pswpMaxHeight() * 0.8;
        } else {
            result.w = window.innerWidth * 0.8;
            result.h = window.innerWidth * 0.5625 * 0.8;
        }
        return result;
    }
}

/* Intersection Observer */
if ('IntersectionObserver' in window) {
    var shadowcore_lazyObserver = new IntersectionObserver((entries, shadowcore_lazyObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                shadowcore_el.preloadImage(entry.target);
                shadowcore_lazyObserver.unobserve(entry.target);
            } else {
                return;
            }
        });
    });
}

/* Object: Cirlce Progress Bar */
var shadowcore_circle_progress = {
    layout: function(this_el) {
        let $this = jQuery(this_el);
        if ($this.find('svg').length) {
            let this_size = this.getSize(this_el),
                $svg = $this.find('svg'),
                $barBg = $this.find('.shadowcore-progress-circle--bg'),
                $bar = $this.find('.shadowcore-progress-circle--bar');
            $svg.attr('width', this_size.svgSize)
                .attr('height', this_size.svgSize)
                .attr('viewPort', '0 0 ' + this_size.barSize + ' ' + this_size.barSize);
            $barBg.css({
                'r': this_size.r,
                'cx': this_size.barSize,
                'cy': this_size.barSize,
                'stroke-dasharray': this_size.dashArray,
            });
            $bar.css({
                'r': this_size.r,
                'cx': this_size.barSize,
                'cy': this_size.barSize,
                'stroke-dasharray': this_size.dashArray,
            }).attr('transform', 'rotate(-90, ' + this_size.barSize + ', ' + this_size.barSize + ')');
            if (!$this.hasClass('is-done')) {
                $bar.css('stroke-dashoffset', this_size.dashArray);
            } else {
                //
            }
        }
    },
    getSize: function(this_el) {
        let $this = jQuery(this_el),
            $wrap = $this.find('.shadowcore-progress-item-wrap'),
            sizes = {
                percent: parseInt($this.data('percent'), 10),
                svgSize: $wrap.width(),
                stroke: parseInt($wrap.css('stroke-width'), 10),
            }
        sizes.barSize = Math.floor(sizes.svgSize / 2);
        sizes.r = sizes.barSize - sizes.stroke;
        sizes.dashArray = parseFloat(Math.PI * (sizes.r * 2)).toFixed(2);
        sizes.dashOffset = parseFloat(sizes.dashArray - (sizes.dashArray * sizes.percent) / 100).toFixed(2);
        return sizes;
    },
    animate: function(this_el) {
        let $this = jQuery(this_el),
            $this_counter = $this.find('span.shadowcore-progress-counter'),
            this_size = this.getSize(this_el),
            $bar = $this.find('.shadowcore-progress-circle--bar');
        $this.addClass('is-done');
        $bar.css('stroke-dashoffset', this_size.dashOffset);
        $this_counter.prop('Counter', 0).animate({
            Counter: $this_counter.text()
        }, {
            duration: parseInt($this_counter.parents('.shadowcore-progress-item').data('delay'), 10),
            easing: 'swing',
            step: function(now) {
                $this_counter.text(Math.ceil(now));
            }
        });

    }
}

/* Class: Get Pan Axis  */
class Shadowcore_PanAxis {
    constructor(sens) {
        let this_class = this;
        this.xs = 0;
        this.xd = 0;
        this.ys = 0;
        this.yd = 0;
        this.ax = 0;
        this.sens = sens;

        document.addEventListener('touchstart', function(e) {
            this_class.xs = e.touches[0].clientX;
            this_class.ys = e.touches[0].clientY;
        }, false);

        document.addEventListener('touchmove', function(e) {
            if (!this_class.ax) {
                // X
                if (this_class.xs) {
                    this_class.xd = this_class.xd + Math.abs(this_class.xs - e.touches[0].clientX);
                    this_class.xs = e.touches[0].clientX;
                }
                if (this_class.ys) {
                    this_class.yd = this_class.yd + Math.abs(this_class.ys - e.touches[0].clientY);
                    this_class.ys = e.touches[0].clientY;
                }

                // Check Axis
                if (this_class.xd > this_class.sens) {
                    this_class.ax = 'x';
                }
                if (this_class.yd > this_class.sens) {
                    this_class.ax = 'y';
                }
            }
        }, false);

        document.addEventListener('touchend', function(e) {
            // Reset Values
            this_class.xs = 0;
            this_class.xd = 0;
            this_class.ys = 0;
            this_class.yd = 0;
            this_class.ax = 0;
        }, false);
    }
    getAxis() {
        return this.ax;
    }
}
shadowcore_el.panAxis = new Shadowcore_PanAxis(10);

/* Class: Before and After */
class ShadowCore_Before_After {
    constructor($obj) {
        if ($obj instanceof jQuery) {
            let this_class = this;
            this.$el = {
                $wrap: $obj,
                $before: jQuery('<div class="shadowcore-before-after-img shadowcore-before-img"/>').appendTo($obj),
                $after: jQuery('<div class="shadowcore-before-after-img shadowcore-after-img-wrap"/>').appendTo($obj),
                $divider: jQuery('<div class="shadowcore-before-after-divider">\
                    <svg xmlns="http://www.w3.org/2000/svg" width="23.813" height="13.875" viewBox="0 0 23.813 13.875">\
                        <path d="M-5.062-15.937l1.125,1.125L-9.047-9.75H9.047L3.938-14.812l1.125-1.125,6.375,6.375L11.906-9l-.469.563L5.063-2.062,3.938-3.187,9.047-8.25H-9.047l5.109,5.063L-5.062-2.062l-6.375-6.375L-11.906-9l.469-.562Z" transform="translate(11.906 15.938)" fill="#fff"/>\
                    </svg>\
                </div>').appendTo($obj),
            };
            this.$el.$after.append(this_class.$el.$wrap.children('img').clone());
            this.offset = this.$el.$wrap.offset().left;
            this.size = this.$el.$wrap.width();
            this.current = 50;
            this.target = 50;
            this.isDown = false;

            this.$el.$before.css('background-image', 'url(' + this.$el.$wrap.data('img-before') + ')');
            this.$el.$after.children('img').wrap('<div class="shadowcore-after-img"/>');
            this.$el.$after.children('.shadowcore-after-img').css('background-image', 'url(' + this.$el.$wrap.data('img-after') + ')');

            // Mouse Events
            this.$el.$wrap.on('mousedown', function(e) {
                e.preventDefault();
                this_class.isDown = true;
            }).on('mousemove', function(e) {
                e.preventDefault();
                if (this_class.isDown) {
                    let position = e.pageX - this_class.offset,
                        newTarget = position / this_class.size;
                    if (newTarget > 1) {
                        newTarget = 1;
                    }
                    if (newTarget < 0) {
                        newTarget = 0;
                    }
                    this_class.target = newTarget * 100;
                }
            }).on('mouseleave', function(e) {
                e.preventDefault();
                this_class.isDown = false;
            }).on('mouseup', function(e) {
                e.preventDefault();
                this_class.isDown = false;
            });

            // Touch Events
            this.$el.$wrap[0].addEventListener('touchstart', function(e) {
                this_class.isDown = true;
            }, false);
            this.$el.$wrap[0].addEventListener('touchmove', function(e) {
                let axis = shadowcore_el.panAxis.getAxis();
                if ('x' == axis) {
                    e.preventDefault();
                    if (this_class.isDown) {
                        let position = e.touches[0].clientX - this_class.offset,
                            newTarget = position / this_class.size;
                        if (newTarget > 1) {
                            newTarget = 1;
                        }
                        if (newTarget < 0) {
                            newTarget = 0;
                        }
                        this_class.target = newTarget * 100;
                    }
                }
            }, false);
            this.$el.$wrap[0].addEventListener('touchend', function(e) {
                this_class.isDown = false;
            }, false);

            // Window Events
            jQuery(window).on('resize', function() {
                this_class.layout();
                this_class.reset();
            }).on('load', function() {
                this_class.layout();
            });

            // Layout
            this.layout();

            // Run Animation
            this.requestAnimation();
        } else {
            return false;
        }
    }

    layout() {
        let this_class = this;
        this.offset = this.$el.$wrap.offset().left;
        this.size = this.$el.$wrap.width();
        this.$el.$after.children('.shadowcore-after-img').width(this_class.$el.$wrap.width()).height(this_class.$el.$wrap.height());
    }
    reset() {
        this.current = 50;
        this.target = 50;
    }
    requestAnimation() {
        this.animation = requestAnimationFrame(() => this.animate());
    }
    animate() {
        this.current += ((this.target - this.current) * 0.1);
        this.$el.$after.css('width', parseFloat(this.current).toFixed(1) + '%');
        this.$el.$divider.css('left', parseFloat(this.current).toFixed(1) + '%');
        this.requestAnimation();
    }
}

/* Class: Countdown */
class ShadowCore_Countdown {
    constructor($this_el) {
        if ($this_el instanceof jQuery) {
            let this_class = this;
            this_class.time = new Date($this_el.find('time').text() + 'T00:00:00'),
                $this_el.find('time').remove();
            this_class.$el = {
                wrap: $this_el,
                d: $this_el.find('.shadowcore-coming-soon--days > .shadowcore-coming-soon__count'),
                h: $this_el.find('.shadowcore-coming-soon--hours > .shadowcore-coming-soon__count'),
                m: $this_el.find('.shadowcore-coming-soon--minutes > .shadowcore-coming-soon__count'),
                s: $this_el.find('.shadowcore-coming-soon--seconds > .shadowcore-coming-soon__count'),
            }
            this_class.update(this_class.time);

            if (this_class.interval) {
                clearInterval(this_class.interval);
            }

            this_class.interval = setInterval(function() {
                this_class.update(this_class.time);
            }, 1000);
        }
    }

    update(endDate) {
        let this_class = this;
        let now = new Date();
        let difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
            clearInterval(this_class.interval);
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

            this_class.$el.d.text(days);
            this_class.$el.h.text(("0" + hours).slice(-2));
            this_class.$el.m.text(("0" + minutes).slice(-2));
            this_class.$el.s.text(("0" + seconds).slice(-2));
        }
    }
}

/* Class: KenBurns Gallery */
class ShadowCore_KenBurns {
    constructor($el) {
        if ($el instanceof jQuery) {
            let this_class = this;
            // Set Variables
            this.$el = $el;
            this.count = $el.find('.shadowcore-kenburns-slide').length;
            this.speed = parseInt($el.attr('data-speed'), 10);
            this.delay = parseInt($el.attr('data-delay'), 10) * 0.001 + this.speed * 0.001;
            this.from = parseInt($el.attr('data-zoom'), 10) * 0.01;
            this.to = 1;
            this.active = 0;
            this.$title = $el.parent().children('.shadowcore-kenburns-title-wrap').children('.shadowcore-kenburns-title');
            this.$caption = this.$title.children('.shadowcore-kenburns-caption');
            this.$descr = this.$title.children('.shadowcore-kenburns-description');

            // Set Items
            let poX = 0,
                poY = 0;

            $el.find('.shadowcore-kenburns-slide').each(function() {
                let oX = Math.random() * 100,
                    oY = Math.random() * 100;

                if (poX > 50 && oX > 50) {
                    oX = oX - 50;
                } else if (poX < 50 && oX < 50) {
                    oX = oX + 50;
                }
                if (poY > 50 && oY > 50) {
                    oY = oY - 50;
                } else if (poY < 50 && oY < 50) {
                    oY = oY + 50;
                }

                poX = oX;
                poY = oY;

                jQuery(this).css('transition', 'opacity ' + this_class.speed + 'ms');
                jQuery(this).children('.shadowcore-kenburns-slide-image').css({
                    'transform-origin': oX + '% ' + oY + '%',
                    'background-image': 'url(' + jQuery(this).data('src') + ')'
                });
            });

            // Run Slider
            this_class.change();

        } else {
            console.warn('Cannot init Kenburns. Element is not an instance of jQuery.');
        }
    }

    update($el) {
        let this_class = this;
        this.$el = $el;
        this.count = $el.find('.shadowcore-kenburns-slide').length;
        this.speed = parseInt($el.data('speed'), 10);
        this.delay = parseInt($el.data('delay'), 10) * 0.001 + this.speed * 0.001;
        this.from = parseInt($el.data('zoom'), 10) * 0.01;
        this.to = 1;

        $el.find('.shadowcore-kenburns-slide').each(function() {
            jQuery(this).css('transition', 'opacity ' + this_class.speed + 'ms');
        });
    }

    change() {
        let this_class = this,
            from = this.from,
            to = this.to;

        // Loop
        if (this_class.active >= this_class.count) {
            this_class.active = 0;
        }

        let current = this_class.$el.find('.shadowcore-kenburns-slide').eq(this_class.active),
            image = current.children('.shadowcore-kenburns-slide-image');

        // Slides
        gsap.fromTo(image, {
            scale: from,
            onStart: function() {
                current.addClass('is-active');
            }
        }, {
            scale: to,
            duration: this_class.delay,
            ease: 'none',
            onComplete: function() {
                this_class.active++;
                this_class.from = to;
                this_class.to = from;
                this_class.change();
                this_class.$el.find('.is-active').removeClass('is-active');
            }
        });
    }
}

/* Elementor Shadow Core */
/* --------------------- */
jQuery(window).on('elementor/frontend/init', function() {
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
        jQuery('body').addClass('shadowcore-touch');
    }
    if (!!navigator.platform.match(/iPhone|iPod|iPad/)) {
        jQuery('body').addClass('shadowcore-ios');
    }

    /* Editor */
    if (elementorFrontend.isEditMode()) {

        /* --- Image Hotspot set Items to Inactive --- */
        elementor.hooks.addAction('panel/open_editor/widget', function(panel, model, view) {
            if (jQuery('.shadowcore-hotspot.is-editing').length) {
                jQuery('.shadowcore-hotspot.is-editing').removeClass('is-editing');
            }
        });
        elementor.hooks.addAction('panel/open_editor/column', function(panel, model, view) {
            if (jQuery('.shadowcore-hotspot.is-editing').length) {
                jQuery('.shadowcore-hotspot.is-editing').removeClass('is-editing');
            }
        });
        elementor.hooks.addAction('panel/open_editor/section', function(panel, model, view) {
            if (jQuery('.shadowcore-hotspot.is-editing').length) {
                jQuery('.shadowcore-hotspot.is-editing').removeClass('is-editing');
            }
        });

        /* --- Image Hotspot --- */
        elementor.hooks.addAction('panel/open_editor/widget/shadow-image-hotspot', function(panel, model, view) {
            shadowcore_editor.hotspot.$el = jQuery('[data-id="' + model.id + '"]');

            panel.content.on('show', function() {
                /* Tab Seitched */
                panel.$el.find('.elementor-repeater-row-item-title').on('click', function() {
                    shadowcore_editor.hotspot.$field = jQuery(this).parents('.elementor-repeater-fields');
                    shadowcore_editor.hotspot.$el.find('.shadowcore-hotspot.is-editing').removeClass('is-editing');
                    setTimeout(function() {
                        if (shadowcore_editor.hotspot.$field.children('.elementor-repeater-row-controls').hasClass('editable')) {
                            shadowcore_editor.hotspot.$el.find('.shadowcore-hotspot').eq(shadowcore_editor.hotspot.$field.index()).addClass('is-editing');
                        }
                    }, 50);
                });
            });

            panel.$el.find('.elementor-repeater-row-item-title').on('click', function() {
                shadowcore_editor.hotspot.$field = jQuery(this).parents('.elementor-repeater-fields');
                shadowcore_editor.hotspot.$el.find('.shadowcore-hotspot.is-editing').removeClass('is-editing');
                setTimeout(function() {
                    if (shadowcore_editor.hotspot.$field.children('.elementor-repeater-row-controls').hasClass('editable')) {
                        shadowcore_editor.hotspot.$el.find('.shadowcore-hotspot').eq(shadowcore_editor.hotspot.$field.index()).addClass('is-editing');
                    }
                }, 50);
            });

            if (!view.$el.hasClass('is-init-editor')) {
                view.$el.addClass('is-init-editor');
                view.$el.on('click', '.shadowcore-hotspot', function(e) {
                    e.preventDefault();
                    let indx = jQuery(this).index() - 1;
                    if (panel.$el.find('.elementor-tab-control-content').hasClass('elementor-active') && !jQuery(this).hasClass('is-editing')) {
                        panel.$el.find('.elementor-repeater-fields').eq(indx).children().children('.elementor-repeater-row-item-title').trigger('click');
                    }
                });
            }
        });

        /* --- Posts Ribbon --- */
        elementor.hooks.addAction('panel/open_editor/widget/shadow-query-ribbon', function(panel, model, view) {
            if (!panel.$el.hasClass('is-init')) {
                panel.$el.addClass('is-init');
                shadowcore_el.elements.ribbons[model.id].layout();

                panel.$el.on('click', function() {
                    shadowcore_el.elements.ribbons[model.id].layout();
                });
                panel.$el.on('change', 'input, select', function() {
                    shadowcore_el.elements.ribbons[model.id].layout();
                });
            }

        });

        /* --- Cards Carousel --- */
        elementor.hooks.addAction('panel/open_editor/widget/shadow-cards-carousel', function(panel, model, view) {
            // Image Spacing
            panel.$el.on('change', '.elementor-control-image_spacing input', function() {
                jQuery(window).trigger('resize');
            });
            panel.$el.on('mouseup', '.elementor-control-image_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('mouseleave', '.elementor-control-image_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('click', '.elementor-control-image_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('mousemove', '.elementor-control-image_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    jQuery(window).trigger('resize');
                }
            });

            //Heading Spacing
            panel.$el.on('change', '.elementor-control-heading_spacing input', function() {
                jQuery(window).trigger('resize');
            });
            panel.$el.on('mouseup', '.elementor-control-heading_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('mouseleave', '.elementor-control-heading_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('click', '.elementor-control-heading_spacing', function() {
                jQuery(window).trigger('resize');
            }).on('mousemove', '.elementor-control-heading_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    jQuery(window).trigger('resize');
                }
            });

            // Typography
            panel.$el.on('click', '.e-controls-popover--typography', function() {
                jQuery(window).trigger('resize');
            });
            panel.$el.on('click', '.elementor-control-heading_typo_typography', function() {
                jQuery(window).trigger('resize');
            });
            panel.$el.on('click', '.elementor-control-caption_typo_typography', function() {
                jQuery(window).trigger('resize');
            });
        });

        /* --- Circle Progress Bar --- */
        elementor.hooks.addAction('panel/open_editor/widget/shadow-circle-progress', function(panel, model, view) {
            panel.$el.on('mouseup', '.elementor-control-side_spacing', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });

            panel.$el.on('mouseup', '.elementor-control-side_spacing_tablet', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing_tablet', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing_tablet', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing_tablet input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });

            panel.$el.on('mouseup', '.elementor-control-side_spacing_mobile', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing_mobile', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing_mobile', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing_mobile input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });
        });

        /*  ----------------------------
            Sections and Columns Edition 
            ----------------------------  */
        elementor.hooks.addAction('panel/open_editor/section', function(panel, model, view) {
            // Editing Section
        });
        elementor.hooks.addAction('panel/open_editor/column', function(panel, model, view) {
            // Editing Column
        });
        elementor.hooks.addAction('panel/remove/column', function(panel, model, view) {
            // Remove Column
        });
    }

    /*  ----------------
        Frontend Scripts
        ----------------  */
    elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope) {
        if (jQuery('.shadowcore-div-image:not(.is-loading)').length) {
            jQuery('.shadowcore-div-image:not(.is-loading)').each(function() {
                jQuery(this).addClass('is-loading');
                shadowcore_el.preloadImage(this);
            });
        }

        // Justified Init
        if (jQuery('.shadowcore-justified-gallery').length) {
            jQuery('.shadowcore-justified-gallery').each(function() {
                let $this = jQuery(this);
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && jQuery('img.shadowcore-lazy').length) {
                    var options = {
                        rowHeight: parseInt($this.attr('data-row-height'), 10),
                        lastRow: 'nojustify',
                        margins: parseInt($this.attr('data-spacing'), 10),
                        captions: false,
                        selector: 'a.is-ready',
                        waitThumbnailsLoad: true
                    }
                } else {
                    var options = {
                        rowHeight: parseInt($this.attr('data-row-height'), 10),
                        lastRow: 'nojustify',
                        margins: parseInt($this.attr('data-spacing'), 10),
                        captions: false,
                        waitThumbnailsLoad: true
                    }
                }
                if ('yes' == $this.attr('data-last-row')) {
                    options.lastRow = 'justify';
                }
                $this.justifiedGallery(options);
            });
        }

        // Images Lazy Loading
        if ($scope.find('img.shadowcore-lazy').length) {
            $scope.find('img.shadowcore-lazy').each(function() {
                if ('IntersectionObserver' in window) {
                    shadowcore_lazyObserver.observe(this);
                } else {
                    shadowcore_el.preloadImage(this);
                }
            });
        }
        if ($scope.find('div.shadowcore-lazy').length) {
            $scope.find('div.shadowcore-lazy').each(function() {
                if ('IntersectionObserver' in window) {
                    shadowcore_lazyObserver.observe(this);
                } else {
                    shadowcore_el.preloadImage(this);
                }
            });
        }

        // PSWP Preparing
        if ($scope.find('a.shadowcore-lightbox-link:not(.pswp-done)').length) {
            $scope.find('a.shadowcore-lightbox-link:not(.pswp-done)').each(function() {
                let $this = jQuery(this),
                    this_item = {},
                    this_gallery = 'default';

                if ($this.attr('data-video-type')) {
                    this_item.html = '\
					<div class="shadowcore-pswp-media--iframe" data-src="' + $this.attr('href') + '">\
						<iframe src="' + $this.attr('href') + '?controls=1&amp;loop=0"></iframe>\
					</div>';
                } else {
                    if ($this.data('size')) {
                        let item_size = $this.attr('data-size').split('x');
                        this_item.w = item_size[0];
                        this_item.h = item_size[1];
                    }
                    this_item.src = $this.attr('href');
                }

                if ($this.data('gallery')) {
                    this_gallery = $this.data('gallery');
                }
                if ($this.data('caption')) {
                    this_item.title = $this.data('caption');
                }
                if (shadowcore_el.elements.pswp_gallery[this_gallery]) {
                    shadowcore_el.elements.pswp_gallery[this_gallery].push(this_item);
                } else {
                    shadowcore_el.elements.pswp_gallery[this_gallery] = [];
                    shadowcore_el.elements.pswp_gallery[this_gallery].push(this_item);
                }

                $this.attr('data-count', shadowcore_el.elements.pswp_gallery[this_gallery].length - 1).addClass('pswp-done');
            });
        }
    });

    /* Image HotSpot */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-image-hotspot.default', function($scope) {
        if (!elementorFrontend.isEditMode()) {
            let $wrap = $scope.find('.shadowcore-hotspot-wrap');
            if ($wrap.hasClass('show-on-click')) {
                jQuery(document).on('click', function() {
                    jQuery('.shadowcore-hotspot-descr.is-active').removeClass('is-active');
                });
                $wrap.on('click', '.shadowcore-hotspot', function(e) {
                    $wrap.find('.shadowcore-hotspot-descr.is-active').removeClass('is-active');
                    e.preventDefault();
                    e.stopPropagation();
                    jQuery(this).children('.shadowcore-hotspot-descr').addClass('is-active');
                });
            }
        }
    });

    /* Universal Query Carousel */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-query-ribbon.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-ribbon'),
            this_id = $scope.find('.shadowcore-ribbon').attr('data-id');
        shadowcore_el.elements.ribbons[this_id] = new ShadowCore_RibbonGallery($this_el);
        setTimeout(function() {
            shadowcore_el.elements.ribbons[this_id].layout();
        }, 100, this_id);
    });

    /* Universal Query Slider */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-query-slider.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-slider'),
            this_id = $scope.find('.shadowcore-slider').attr('data-id');
        shadowcore_el.elements.sliders[this_id] = new ShadowCore_SlideGallery($this_el);
    });

    /* Info Card */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-info-card.default', function($scope) {
        $scope.find('.shadowcore-gallery-image').each(function() {
            let $this = jQuery(this),
                $img = jQuery(this).children('img');
            if ($this.css('border-radius') !== $img.css('border-radius')) {
                jQuery('head').append('<style id="shadow-element">.elementor-element-' + $scope.attr('data-id') + ' .shadowcore-gallery-image { border-radius: ' + $img.css('border-radius') + ' }</style>');
            }
        });
    });

    /* Info Card Grid */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-info-card-grid.default', function($scope) {
        $scope.find('.shadowcore-gallery-image').each(function() {
            let $this = jQuery(this),
                $img = jQuery(this).children('img');
            if ($this.css('border-radius') !== $img.css('border-radius')) {
                jQuery('head').append('<style id="shadow-element">.elementor-element-' + $scope.attr('data-id') + ' .shadowcore-gallery-image { border-radius: ' + $img.css('border-radius') + ' }</style>');
            }
        });
    });

    /* Slide Gallery */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-gallery-slider.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-slider'),
            this_id = $scope.find('.shadowcore-slider').attr('data-id');
        shadowcore_el.elements.sliders[this_id] = new ShadowCore_SlideGallery($this_el);
    });

    /* Ribbon Gallery */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-gallery-ribbon.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-ribbon'),
            this_id = $scope.find('.shadowcore-ribbon').attr('data-id');
        shadowcore_el.elements.ribbons[this_id] = new ShadowCore_RibbonGallery($this_el);
    });

    /* Kenburns */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-gallery-kenburns.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-kenburns'),
            this_id = $scope.find('.shadowcore-kenburns').attr('data-id');
        shadowcore_el.elements.kenburns[this_id] = new ShadowCore_KenBurns($this_el);
    });

    /* Count Down Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-countdown.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-coming-soon'),
            this_id = $scope.find('.shadowcore-coming-soon').attr('id');
        shadowcore_el.elements.countdown[this_id] = new ShadowCore_Countdown($this_el);
    });

    /* Before After */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-before-after.default', function($scope) {
        var $this_el = $scope.find('.shadowcore-before-after');
        new ShadowCore_Before_After($this_el);
    });

    /* Testimonials Carousel */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-testimonials-carousel.default', function($scope) {
        var $this_el = $scope.find('.shadowcore-owl-container');
        $scope.find('.shadowcore-gallery-image').each(function() {
            let $this = jQuery(this),
                $img = jQuery(this).children('img');
            if ($this.css('border-radius') !== $img.css('border-radius')) {
                jQuery('head').append('<style id="shadow-element">.elementor-element-' + $scope.attr('data-id') + ' .shadowcore-gallery-image { border-radius: ' + $img.css('border-radius') + ' }</style>');
            }
        });
        $this_el.owlCarousel({
            margin: parseInt($this_el.data('gutter'), 10),
            loop: true,
            center: true,
            nav: false,
            dots: true,
            dotsEach: true,
            autoHeight: true,
            autoplay: false,
            items: 1,
            navSpeed: parseInt($this_el.data('speed'), 10),

        });
    });

    /* Circle Progress Bar Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-circle-progress.default', function($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-progress-item');
        shadowcore_circle_progress.layout($this_el[0]);
        if (elementorFrontend.isEditMode()) {
            shadowcore_circle_progress.animate($this_el[0]);
        } else {
            if (shadowcore_el.inView($this_el[0])) {
                shadowcore_circle_progress.animate($this_el[0]);
            }
        }
    });

    /* Cards Carousel */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-cards-carousel.default', function($scope) {
        var $this_el = $scope.find('.shadowcore-owl-container');
        $this_el.owlCarousel({
            margin: parseInt($this_el.data('gutter-d'), 10),
            loop: parseInt($this_el.attr('data-loop'), 10),
            center: parseInt($this_el.attr('data-center'), 10),
            autoHeight: parseInt($this_el.attr('data-autoheight'), 10),
            autoplay: parseInt($this_el.attr('data-autoplay'), 10),
            items: parseInt($this_el.data('columns-d'), 10),
            autoplayTimeout: parseInt($this_el.data('delay'), 10),
            autoplayHoverPause: parseInt($this_el.attr('data-pause'), 10),
            nav: false,
            dots: true,
            dotsEach: true,
            responsive: {
                // breakpoint from 0 up
                0: {
                    items: parseFloat($this_el.data('columns-m')).toFixed(1),
                    margin: parseInt($this_el.data('gutter-m'), 10),
                },
                760: {
                    items: parseFloat($this_el.data('columns-t')).toFixed(1),
                    margin: parseInt($this_el.data('gutter-t'), 10),
                },
                1024: {
                    items: parseFloat($this_el.data('columns-d')).toFixed(1),
                    margin: parseInt($this_el.data('gutter-d'), 10),
                }
            },
            onInitialized: function() {
                let $dots = this.$element.children('.owl-dots');
                if ($dots.length) {
                    $dots.children('.next').removeClass('next');
                    $dots.children('.prev').removeClass('prev');
                    let ind = $dots.children('.active').index();
                    if (ind + 1 <= $dots.children().length - 1) {
                        $dots.children('.owl-dot').eq(ind + 1).addClass('next');
                    }
                    if (ind - 1 >= 0) {
                        $dots.children('.owl-dot').eq(ind - 1).addClass('prev');
                    }
                }
            },
            onChanged: function() {
                let $dots = this.$element.children('.owl-dots');
                if ($dots.length) {
                    $dots.children('.next').removeClass('next');
                    $dots.children('.prev').removeClass('prev');
                    let ind = $dots.children('.active').index();
                    if (ind + 1 <= $dots.children().length - 1) {
                        $dots.children('.owl-dot').eq(ind + 1).addClass('next');
                    }
                    if (ind - 1 >= 0) {
                        $dots.children('.owl-dot').eq(ind - 1).addClass('prev');
                    }
                }
            }

        });
    });

    /* Universal Query Grid Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-query-grid.default', function($scope) {
        let this_id = $scope.attr('data-id'),
            $wrap = $scope.find('.shadowcore-posts-grid-wrap'),
            $button = $wrap.children('.shadowcore-pgi--button-wrap').children('a.shadowcore-pgi--more'),
            $loadTrigger = $wrap.children('.shadowcore-pgi--load'),
            load_type = $wrap.attr('data-loading'),
            show_items = function() {
                if ($wrap.find('.not-loaded').length) {
                    $wrap.find('.not-loaded').first().removeClass('not-loaded');
                    setTimeout(function() {
                        show_items();
                    }, 100, show_items);
                } else {
                    if ('button' == load_type) {
                        $button.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                    }
                    if ('scroll' == load_type) {
                        $loadTrigger.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                        if (!$loadTrigger.hasClass('all-posts-loaded')) {
                            if ($loadTrigger.hasClass('in-promise')) {
                                $loadTrigger.removeClass('is-promise');
                                trigger_posts_load();
                            } else {
                                let rect = $loadTrigger[0].getBoundingClientRect();
                                if (
                                    (rect.height > 0 || rect.width > 0) &&
                                    rect.bottom >= 0 &&
                                    rect.right >= 0 &&
                                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                                    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                                ) {
                                    trigger_posts_load();
                                }
                            }
                        }
                    }
                    jQuery(window).trigger('resize');
                }
            },
            get_posts = function(ajax_prop, offset) {
                jQuery.post(ajax_prop.url, {
                    action: 'shadowcore_query_posts',
                    offset: offset,
                    security: ajax_prop.nonce,
                    query_prop: JSON.stringify(ajax_prop)
                }).done(function(data) {
                    let $data = jQuery(data),
                        shown = offset + ajax_prop.args.posts_per_page,
                        count = 0;
                    if ('button' == load_type) {
                        count = parseInt($button.attr('data-count'), 10);
                    }
                    if ('scroll' == load_type) {
                        count = parseInt($loadTrigger.attr('data-count'), 10);
                    }
                    $data.addClass('not-loaded');

                    // Load images
                    if ($data.find('div.shadowcore-lazy').length) {
                        $data.find('div.shadowcore-lazy').each(function() {
                            if ('IntersectionObserver' in window) {
                                shadowcore_lazyObserver.observe(this);
                            } else {
                                shadowcore_el.preloadImage(this);
                            }
                        });
                    }
                    if ($data.find('.shadowcore-div-image:not(.is-loading)').length) {
                        $data.find('.shadowcore-div-image:not(.is-loading)').each(function() {
                            jQuery(this).addClass('is-loading');
                            shadowcore_el.preloadImage(this);
                        });
                    }

                    // Append Data
                    shadowcore_el.elements.masonry[this_id].insert($data, show_items);
                    setTimeout(function() {
                        jQuery(window).trigger('contentUpdate');
                        jQuery(window).trigger('resize');
                    }, 100);

                    // Update posts counter
                    if ('button' == load_type) {
                        $button.attr('data-shown', shown);
                        if (shown >= count) {
                            $button.addClass('all-posts-loaded').slideUp(300);
                        }
                    }
                    if ('scroll' == load_type) {
                        $loadTrigger.attr('data-shown', shown);
                        if (shown >= count) {
                            $loadTrigger.addClass('all-posts-loaded');
                        }
                    }
                }).fail(function() {
                    $wrap.append('<span class="shadowcore-ajax-error">AJAX request fail.</span>');
                    if ('button' == load_type) {
                        $button.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                    }
                });
            },
            trigger_posts_load = function() {
                $loadTrigger.addClass('is-processing');
                jQuery(window).trigger('setBusy');
                let this_prop = $loadTrigger.data('prop'),
                    offset = parseInt($loadTrigger.attr('data-shown'), 10);
                get_posts(this_prop, offset);
            },
            checkScrollLoad = function() {
                let rect = $loadTrigger[0].getBoundingClientRect();
                if (
                    (rect.height > 0 || rect.width > 0) &&
                    rect.bottom >= 0 &&
                    rect.right >= 0 &&
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                ) {

                    if ($loadTrigger.hasClass('is-processing')) {
                        if (!$loadTrigger.hasClass('in-promise')) {
                            $loadTrigger.addClass('in-promise');
                        }
                    } else {
                        trigger_posts_load();
                    }
                    if ($loadTrigger.hasClass('all-posts-loaded')) {
                        shadowcore_losObserver.unobserve(entry.target);
                    }
                }
            };

        // Button Click Event
        $wrap.children().children('.not-loaded').removeClass('not-loaded');
        if ('button' == load_type) {
            $button.on('click', function(e) {
                e.preventDefault();
                $button.addClass('is-processing');
                jQuery(window).trigger('setBusy');
                let this_prop = jQuery(this).data('prop'),
                    offset = parseInt(jQuery(this).attr('data-shown'), 10);
                get_posts(this_prop, offset);
            });
        }

        // Scroll Event
        if ('scroll' == load_type) {
            if ('IntersectionObserver' in window) {
                var shadowcore_losObserver = new IntersectionObserver((entries, shadowcore_losObserver) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if ($loadTrigger.hasClass('is-processing')) {
                                if (!$loadTrigger.hasClass('in-promise')) {
                                    $loadTrigger.addClass('in-promise');
                                }
                            } else {
                                trigger_posts_load();
                            }
                            if ($loadTrigger.hasClass('all-posts-loaded')) {
                                shadowcore_losObserver.unobserve(entry.target);
                            }
                        } else {
                            return;
                        }
                    });
                });
                shadowcore_losObserver.observe($loadTrigger[0]);
            } else {
                checkScrollLoad();

                jQuery(window).on('scroll', function() {
                    if (!$loadTrigger.hasClass('all-posts-loaded')) {
                        checkScrollLoad();
                    }
                });
            }
        }

    });

    /* Universal Posts Listing Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-query-listing.default', function($scope) {
        let this_id = $scope.attr('data-id'),
            $wrap = $scope.find('.shadowcore-posts-listing-wrap'),
            $button = $wrap.children('.shadowcore-pli--button-wrap').children('a.shadowcore-pli--more'),
            $loadTrigger = $wrap.children('.shadowcore-pli--load'),
            load_type = $wrap.attr('data-loading'),
            show_items = function() {
                if ($wrap.find('.not-loaded').length) {
                    $wrap.find('.not-loaded').first().removeClass('not-loaded');
                    setTimeout(function() {
                        show_items();
                    }, 100, show_items);
                } else {
                    if ('button' == load_type) {
                        $button.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                    }
                    if ('scroll' == load_type) {
                        $loadTrigger.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                        if (!$loadTrigger.hasClass('all-posts-loaded')) {
                            if ($loadTrigger.hasClass('in-promise')) {
                                $loadTrigger.removeClass('is-promise');
                                trigger_posts_load();
                            } else {
                                let rect = $loadTrigger[0].getBoundingClientRect();
                                if (
                                    (rect.height > 0 || rect.width > 0) &&
                                    rect.bottom >= 0 &&
                                    rect.right >= 0 &&
                                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                                    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                                ) {
                                    trigger_posts_load();
                                }
                            }
                        }
                    }
                    jQuery(window).trigger('resize');
                }
            },
            get_posts = function(ajax_prop, offset) {
                jQuery.post(ajax_prop.url, {
                    action: 'shadowcore_query_posts_list',
                    offset: offset,
                    security: ajax_prop.nonce,
                    query_prop: JSON.stringify(ajax_prop)
                }).done(function(data) {
                    let $data = jQuery(data),
                        shown = parseInt(offset, 10) + parseInt(ajax_prop.args.posts_per_page, 10),
                        count = 0;
                    if ('button' == load_type) {
                        count = parseInt($button.attr('data-count'), 10);
                    }
                    if ('scroll' == load_type) {
                        count = parseInt($loadTrigger.attr('data-count'), 10);
                    }
                    $data.addClass('not-loaded');

                    // Load images
                    if ($data.find('div.shadowcore-lazy').length) {
                        $data.find('div.shadowcore-lazy').each(function() {
                            if ('IntersectionObserver' in window) {
                                shadowcore_lazyObserver.observe(this);
                            } else {
                                shadowcore_el.preloadImage(this);
                            }
                        });
                    }
                    if ($data.find('.shadowcore-div-image:not(.is-loading)').length) {
                        $data.find('.shadowcore-div-image:not(.is-loading)').each(function() {
                            jQuery(this).addClass('is-loading');
                            shadowcore_el.preloadImage(this);
                        });
                    }

                    // Append Data
                    $wrap.children('div.shadowcore-posts-listing').append($data);
                    setTimeout(function() {
                        jQuery(window).trigger('contentUpdate');
                        jQuery(window).trigger('resize');
                    }, 100);

                    // Update posts counter
                    if ('button' == load_type) {
                        $button.attr('data-shown', shown);
                        if (shown >= count) {
                            $button.addClass('all-posts-loaded').slideUp(300);
                        }
                    }
                    if ('scroll' == load_type) {
                        $loadTrigger.attr('data-shown', shown);
                        if (shown >= count) {
                            $loadTrigger.addClass('all-posts-loaded');
                        }
                    }

                    // Render Data
                    setTimeout(function() {
                        show_items();
                    }, 100, show_items);
                }).fail(function() {
                    $wrap.append('<span class="shadowcore-ajax-error">AJAX request fail.</span>');
                    if ('button' == load_type) {
                        $button.removeClass('is-processing');
                        jQuery(window).trigger('unsetBusy');
                    }
                });
            },
            trigger_posts_load = function() {
                $loadTrigger.addClass('is-processing');
                jQuery(window).trigger('setBusy');
                let this_prop = $loadTrigger.data('prop'),
                    offset = parseInt($loadTrigger.attr('data-shown'), 10);
                get_posts(this_prop, offset);
            },
            checkScrollLoad = function() {
                let rect = $loadTrigger[0].getBoundingClientRect();
                if (
                    (rect.height > 0 || rect.width > 0) &&
                    rect.bottom >= 0 &&
                    rect.right >= 0 &&
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.left <= (window.innerWidth || document.documentElement.clientWidth)
                ) {

                    if ($loadTrigger.hasClass('is-processing')) {
                        if (!$loadTrigger.hasClass('in-promise')) {
                            $loadTrigger.addClass('in-promise');
                        }
                    } else {
                        trigger_posts_load();
                    }
                    if ($loadTrigger.hasClass('all-posts-loaded')) {
                        shadowcore_losObserver.unobserve(entry.target);
                    }
                }
            };

        // Button Click Event
        $wrap.children().children('.not-loaded').removeClass('not-loaded');
        if ('button' == load_type) {
            $button.on('click', function(e) {
                e.preventDefault();
                $button.addClass('is-processing');
                jQuery(window).trigger('setBusy');
                let this_prop = jQuery(this).data('prop'),
                    offset = parseInt(jQuery(this).attr('data-shown'), 10);
                get_posts(this_prop, offset);
            });
        }

        // Scroll Event
        if ('scroll' == load_type) {
            if ('IntersectionObserver' in window) {
                var shadowcore_losObserver = new IntersectionObserver((entries, shadowcore_losObserver) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if ($loadTrigger.hasClass('is-processing')) {
                                if (!$loadTrigger.hasClass('in-promise')) {
                                    $loadTrigger.addClass('in-promise');
                                }
                            } else {
                                trigger_posts_load();
                            }
                            if ($loadTrigger.hasClass('all-posts-loaded')) {
                                shadowcore_losObserver.unobserve(entry.target);
                            }
                        } else {
                            return;
                        }
                    });
                });
                shadowcore_losObserver.observe($loadTrigger[0]);
            } else {
                checkScrollLoad();

                jQuery(window).on('scroll', function() {
                    if (!$loadTrigger.hasClass('all-posts-loaded')) {
                        checkScrollLoad();
                    }
                });
            }
        }
    });
});

jQuery(window).on('resize', function() {

}).on('load', function() {

}).on('scroll', function() {
    if (jQuery('.shadowcore-progress-item:not(.is-done)').length) {
        jQuery('.shadowcore-progress-item:not(.is-done)').each(function() {
            if (shadowcore_el.inView(this)) {
                shadowcore_circle_progress.animate(this);
            }
        });
    }
});

// PSWP Open Lightbox
jQuery(document).on('click', 'a.shadowcore-lightbox-link', function(e) {
    e.preventDefault();

    let $this = jQuery(this),
        this_index = parseInt($this.data('count'), 10),
        this_gallery = 'default',
        this_options = {
            index: this_index,
            bgOpacity: 0.85,
            history: false,
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

    if ($this.data('gallery')) {
        this_gallery = $this.data('gallery');
    }

    if (jQuery('body').find('.pswp').length) {

        // Init PSWP
        shadowcore_el.elements.pswp = new PhotoSwipe(jQuery('body').find('.pswp')[0], PhotoSwipeUI_Default, shadowcore_el.elements.pswp_gallery[this_gallery], this_options);
        shadowcore_el.elements.pswp.init();

        // Click Overlay = Close
        if (jQuery('body').hasClass('pswp-close-by-overlay')) {
            jQuery('body').on('click', '.pswp__scroll-wrap', function(e) {
                shadowcore_el.elements.pswp.close();
            });
            jQuery('body').on('click', '.shadowcore-pswp-image-wrap', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            jQuery('body').on('click', '.pswp__scroll-wrap button, .pswp__scroll-wrap a, .pswp__scroll-wrap img', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            if (!jQuery('body').hasClass('pswp-click-to-zoom')) {
                shadowcore_el.elements.pswp.listen('gettingData', function(index, item) {
                    let $currItem = jQuery(this.currItem.container);
                    if ($currItem.children('img').length) {
                        $currItem.children('img').wrap('<div class="shadowcore-pswp-image-wrap"/>');
                    }
                });
            }
        }

        // Init video (if is video slide)
        if ($this.attr('data-video-type')) {
            let $this_video = jQuery(shadowcore_el.elements.pswp.container).find('[data-src="' + $this.attr('href') + '"]');
            $this_video.addClass('is-inview').width(shadowcore_el.pswpVideoSize().w).height(shadowcore_el.pswpVideoSize().h);

            if ($this_video.children('iframe').length) {
                if ('vimeo' == $this.data('video-type')) {
                    $this_video.children('iframe').attr('src', $this_video.data('src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;muted=1');
                } else {
                    $this_video.children('iframe').attr('src', $this_video.data('src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;mute=1');
                }
            }
        }

        // Check for videos in view
        shadowcore_el.elements.pswp.listen('resize', function() {
            if (jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').length) {
                jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').width(shadowcore_el.pswpVideoSize().w).height(shadowcore_el.pswpVideoSize().h);
            }
        });

        shadowcore_el.elements.pswp.listen('beforeChange', function() {
            if (jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').length) {
                jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').width(shadowcore_el.pswpVideoSize().w).height(shadowcore_el.pswpVideoSize().h);
                jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').each(function() {
                    let $this_video = jQuery(this);
                    if (shadowcore_el.inView(this)) {
                        $this_video.addClass('is-inview');
                        if ($this_video.data('src').indexOf('vimeo') > 0) {
                            $this_video.children('iframe').attr('src', $this_video.data('src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;muted=1');
                        } else {
                            $this_video.children('iframe').attr('src', $this_video.data('src') + '?controls=1&amp;loop=0&amp;autoplay=1&amp;mute=1');
                        }
                    } else {
                        $this_video.removeClass('is-inview');
                        $this_video.children('iframe').attr('src', jQuery(this).data('src') + '?controls=1&amp;loop=0');
                    }
                });
            }
        });

        shadowcore_el.elements.pswp.listen('close', function() {
            // Close ligthbox
            if (jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').length) {
                jQuery(shadowcore_el.elements.pswp.container).find('.shadowcore-pswp-media--iframe').each(function() {
                    if (jQuery(this).children('iframe').length) {
                        jQuery(this).children('iframe').attr('src', jQuery(this).data('src') + '?controls=1&amp;loop=0');
                    }
                });
            }
        });
    } else {
        console.error('ERROR: PSWP Container not found');
    }
});

jQuery(window).on('resize', function() {
    if (jQuery('.shadowcore-progress-item').length) {
        jQuery('.shadowcore-progress-item').each(function() {
            shadowcore_circle_progress.layout(this);
        });
    }
    jQuery('body').removeClass('shadowcore-touch').removeClass('shadowcore-ios');
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
        jQuery('body').addClass('shadowcore-touch');
    }
    if (!!navigator.platform.match(/iPhone|iPod|iPad/)) {
        jQuery('body').addClass('shadowcore-ios');
    }
});

// Init YouTube API
function onYouTubeIframeAPIReady() {

}

// Init Vimeo API
jQuery(document).ready(function() {

});