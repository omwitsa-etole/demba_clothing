/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";
if (jQuery('.ashade-cart-page-wrap').length) {
    var $cart_wrap = jQuery('.ashade-cart-page-wrap'),
        ashade_woo_currency = {
            format: $cart_wrap.data('price-format'),
            thousand: $cart_wrap.data('price-sep'),
            dec: $cart_wrap.data('price-dec'),
            dec_num: $cart_wrap.data('price-dec-num'),
            symbol: $cart_wrap.data('price-symbol'),
            get_price: function(price, $item) {
                if (!$item.length) {
                    return false;
                } else {
                    $item.empty();

                    let int_price = parseInt(price, 10),
                        float_part = 0,
                        $symbol = jQuery('<span />', {
                            'class': 'woocommerce-Price-currencySymbol'
                        });

                    $symbol.html(this.symbol);

                    if (int_price > 999) {
                        int_price = int_price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, this.thousand);
                    }

                    if (this.dec_num) {
                        let float_price = parseFloat(price).toFixed(this.dec_num);
                        float_part = (float_price - int_price).toFixed(this.dec_num).split('.')[1];
                        $item.html(int_price + this.dec + float_part);
                    } else {
                        $item.html(int_price);
                    }

                    switch (this.format) {
                        case 'left':
                            $item.prepend($symbol);
                            break;
                        case 'left_space':
                            $item.prepend('&nbsp;');
                            $item.prepend($symbol);
                            break;
                        case 'right':
                            $item.append($symbol);
                            break;
                        case 'right_space':
                            $item.append('&nbsp;');
                            $item.append($symbol);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
}
var $ashade_woo = {
    init: function() {
        this.fixDOM();

        // Single Product QTY
        if (jQuery('.ashade-single-add2cart--qty').length) {
            jQuery('.ashade-single-add2cart--qty').each(function() {
                let $this = jQuery(this),
                    $parent = $this.parents('.ashade-single-product--qty'),
                    $qty = $this.find('input[type="number"]'),
                    $minus = $this.find('a.ashade-single-add2cart--minus'),
                    $plus = $this.find('a.ashade-single-add2cart--plus');

                if ($parent.find('p.in-stock').length) {
                    $parent.addClass('has-in-stock-label');
                }

                $qty.on('change', function() {
                    let current_value = parseInt($qty.val(), 10),
                        in_stock = parseInt($qty.attr('max'), 10),
                        min = parseInt($qty.attr('min'), 10);

                    if (!min) min = 0;

                    if (current_value > min) {
                        $minus.removeClass('is-disabled');
                    } else {
                        $minus.addClass('is-disabled');
                    }

                    if (current_value == in_stock) {
                        $plus.addClass('is-disabled');
                    } else {
                        $plus.removeClass('is-disabled');
                    }
                });

                $minus.on('click', function(e) {
                    e.preventDefault();
                    let qty_val = $qty.val();
                    if (!qty_val) qty_val = 0;

                    let current_value = parseInt(qty_val, 10),
                        new_value, in_stock,
                        min = parseInt($qty.attr('min'), 10);

                    if (!min) min = 0;

                    if (current_value > min) {
                        new_value = current_value - 1;
                        $qty.val(new_value).trigger('change');
                    }
                });

                $plus.on('click', function(e) {
                    e.preventDefault();
                    let qty_val = $qty.val();
                    if (!qty_val) qty_val = 0;

                    let current_value = parseInt(qty_val, 10),
                        new_value = current_value + 1,
                        in_stock = parseInt($qty.attr('max'), 10);

                    if (new_value > in_stock)
                        new_value = in_stock;

                    $qty.val(new_value).trigger('change');
                });
            });
        }

        // Shopping Cart QTY
        if (jQuery('.ashade-cart-page-wrap').length) {

            // Minus Button
            jQuery(document).on('click', '.ashade-cart-item--qty-minus', function(e) {
                e.preventDefault();
                let $this = jQuery(this),
                    $parent = $this.parent('.ashade-cart-item--qty-wrap'),
                    $input = $parent.find('input');

                let current_value = parseInt($input.val(), 10),
                    new_value;

                if (current_value > 1) {
                    new_value = current_value - 1;
                    $input.val(new_value).trigger('change');
                }
            });

            // Plus Button
            jQuery(document).on('click', '.ashade-cart-item--qty-plus', function(e) {
                e.preventDefault();
                let $this = jQuery(this),
                    $parent = $this.parent('.ashade-cart-item--qty-wrap'),
                    $input = $parent.find('input');

                let current_value = parseInt($input.val(), 10),
                    new_value = current_value + 1,
                    max_count = parseInt($input.attr('max'), 10);

                if (new_value > max_count)
                    new_value = max_count;

                $input.val(new_value).trigger('change');
            });

            // Change QTY
            jQuery(document).on('change', '.ashade-cart-item--qty-wrap input', function() {
                let $input = jQuery(this),
                    $parent = $input.parents('.ashade-cart-item--qty-wrap');

                // Enable and Disable Buttons
                let current_value = parseInt($input.val(), 10),
                    price = parseFloat($parent.find('.ashade-cart-item--qty-price').data('price')).toFixed(ashade_woo_currency.dec_num),
                    max_count = parseInt($input.attr('max'), 10),
                    $label_count = $parent.find('.ashade-cart-item--qty-count'),
                    $amount = $parent.find('.ashade-cart-item--qty-label > span.woocommerce-Price-amount');

                if (current_value > 1) {
                    $parent.children('.ashade-cart-item--qty-minus').removeClass('is-disabled');
                } else {
                    $parent.children('.ashade-cart-item--qty-minus').addClass('is-disabled');
                }

                if (current_value == max_count) {
                    $parent.children('.ashade-cart-item--qty-plus').addClass('is-disabled');
                } else {
                    $parent.children('.ashade-cart-item--qty-plus').removeClass('is-disabled');
                }

                // Format Total Price
                let total = current_value * price;
                $label_count.html(current_value);
                ashade_woo_currency.get_price(total, $amount);
            });
        }

        // Clear Variate Product
        jQuery(document).on('click', '.reset_variations', function() {
            let $this = jQuery(this),
                $parent = $this.parents('.ashade-wc-variations-form-wrap');

            $parent.find('.ashade-select-wrap').each(function() {
                let $wrap = jQuery(this);
                $wrap.find('.ashade-select').text($wrap.find('.ashade-select__list li:first-child').text());
            });
        });
    },
    fixDOM: function() {
        if (jQuery('.woocommerce-pagination').length) {
            if (jQuery('.woocommerce-pagination a.prev').length) {
                jQuery('.woocommerce-pagination a.prev').html('<svg xmlns="http://www.w3.org/2000/svg" width="9.844" height="17.625" viewBox="0 0 9.844 17.625"><path id="angle-left" d="M2.25-17.812l1.125,1.125L-4.359-9,3.375-1.312,2.25-.187-6-8.437-6.469-9-6-9.562Z" transform="translate(6.469 17.813)" fill="#ffffff"/></svg>');
            }
            if (jQuery('.woocommerce-pagination a.next').length) {
                jQuery('.woocommerce-pagination a.next').html('<svg xmlns="http://www.w3.org/2000/svg" width="9.844" height="17.625" viewBox="0 0 9.844 17.625"><path id="angle-right" d="M-2.25-17.812,6-9.562,6.469-9,6-8.437-2.25-.187-3.375-1.312,4.359-9l-7.734-7.687Z" transform="translate(3.375 17.813)" fill="#ffffff"/></svg>');
            }
        }
    }
}

jQuery(document).ready(function() {
    $ashade_woo.init();

    // Variation Product Images
    jQuery('input[name="variation_id"]').on('change', function() {
        let $this = jQuery(this),
            thisID = $this.val(),
            check = function() {
                if ($this.val() !== '') {
                    changed();
                } else {
                    reset();
                }
            },
            changed = function() {
                jQuery('.ashade-single-product-gallery-wrap').find('.ashade-single-product-image--variation:not([data-variation="' + $this.val() + '"])').slideUp(300);
                jQuery('.ashade-single-product-gallery-wrap').find('.ashade-single-product-image--variation[data-variation="' + $this.val() + '"]').slideDown(300);
            },
            reset = function() {
                jQuery('.ashade-single-product-gallery-wrap').find('.ashade-single-product-image--variation:not([data-variation="default"])').slideUp(300);
                jQuery('.ashade-single-product-gallery-wrap').find('.ashade-single-product-image--variation[data-variation="default"]').slideDown(300);
            }

        if (thisID !== '') {
            changed();
        } else {
            setTimeout(function() {
                check();
            }, 50);
        }
    });

    // Update Header Cart
    if (jQuery('.ashade-wc-header-cart--counter').length) {
        let $ashade_header_cc = $ashade_header.find('.ashade-wc-header-cart--counter'),
            ashade_update_cart = function() {
                jQuery.post(ashade_urls['ajax'], {
                    action: 'ashade_update_cart',
                }, function(response) {
                    $ashade_header_cc.text(parseInt(response, 10));
                });
            };

        $ashade_body.on('added_to_cart', function(e) {
            let this_val = parseInt($ashade_header_cc.attr('data-count'), 10),
                new_val = parseInt(this_val, 10) + 1;
            $ashade_header_cc.text(new_val);
            $ashade_header_cc.attr('data-count', new_val);
        });
        $ashade_body.on('removed_from_cart', function() {
            ashade_update_cart();
        });
        $ashade_body.on('cart_page_refreshed', function() {
            ashade_update_cart();
        });
        $ashade_body.on('cart_totals_refreshed', function() {
            ashade_update_cart();
        });
        $ashade_body.on('updated_cart_totals', function() {
            ashade_update_cart();
        });
        $ashade_body.on('wc_cart_emptied', function() {
            $ashade_header_cc.text('0');
        });
        $ashade_body.on('update_checkout', function() {
            ashade_update_cart();
        });
    }

    jQuery(document).on('click', '.ashade-woo-loop-item__add2cart', function() {
        let $this = jQuery(this),
            $parent = $this.parents('.ashade-woo-loop-item__image-wrap');

        $ashade_body.on('added_to_cart', function(e) {
            $parent.addClass('is-added2cart');
            setTimeout(function() {
                $this.removeClass('added');
            }, 1000);
        });
    });

    // Single Product Tabs
    if (jQuery('.ashade-wc-tabs-wrap').length) {
        jQuery('.ashade-wc-tabs-wrap').each(function() {
            var $this = jQuery(this),
                $tabs_wrap = $this.children('.ashade-wc-tabs');

            // Tab Click Event
            $this.find('.ashade-wc-tab-item').on('click', function(e) {
                e.preventDefault();

                let $this_li = jQuery(this);

                $tabs_wrap.find('.is-active').removeClass('is-active');
                $this_li.addClass('is-active');

                window.location.hash = $this_li.data('tab').split('#')[1];
                $this.find('.woocommerce-Tabs-panel').hide();
                $this.find('#tab-' + $this_li.data('tab').split('#product-')[1]).show();
            });

            // Set Active Tab
            if (window.location.hash) {
                if ($tabs_wrap.children('li[data-tab="' + window.location.hash + '"]').length) {
                    var $currentTab = $tabs_wrap.children('li[data-tab="' + window.location.hash + '"]');
                } else if (window.location.hash.indexOf('#comment') > -1) {
                    var $currentTab = $tabs_wrap.children('li[data-tab="#product-reviews"]');
                } else {
                    let $currentTab = $tabs_wrap.children('.ashade-wc-tab-item').eq(0);
                    $currentTab.addClass('is-active');
                    $this.find('#tab-' + $currentTab.data('tab').split('#product-')[1]).show();
                    return false;
                }

                // Open Tab from Hash
                let $tabContent = $this.find('#tab-' + $currentTab.data('tab').split('#product-')[1]);
                $currentTab.addClass('is-active');
                $tabContent.show();

                let contentOffset = $tabs_wrap.offset().top;

                if ($ashade_body.hasClass('ashade-smooth-scroll')) {
                    contentOffset = $tabs_wrap.offset().top - $ashade_scroll.offset().top;
                }

                setTimeout(function() {
                    $ashade_window.scrollTop(contentOffset);
                }, 100, contentOffset);

            } else {
                // Open First Available Tab
                let $currentTab = $tabs_wrap.children('.ashade-wc-tab-item').eq(0);
                $currentTab.addClass('is-active');
                $this.find('#tab-' + $currentTab.data('tab').split('#product-')[1]).show();
            }
        });
    }

    // Terms Checkbox
    jQuery(document).on('click', 'label.woocommerce-form__label-for-checkbox', function() {
        if (jQuery(this).children('input[type="checkbox"]').is(':checked')) {
            jQuery(this).addClass('is-checked');
        } else {
            jQuery(this).removeClass('is-checked');
        }
    });

    // Login and Register
    if (jQuery('.ashade-woo-login-wrap').length) {
        jQuery('.ashade-woo-login-wrap').parent('.woocommerce').addClass('ashade-wc-login-page');
        jQuery('.ashade-woo-login-wrap').on('click', '.ashade-woo-customer-register', function() {
            let $this = jQuery(this),
                $parent = $this.parent();
            $parent.find('.ashade-woo-customer-signin').addClass('is-inactive');
            $this.removeClass('is-inactive');
            $parent.parent().children('form.ashade-wc-signin-form').slideUp(300).addClass('is-inactive');
            $parent.parent().children('form.ashade-wc-register-form').slideDown(300).removeClass('is-inactive');
        });
        jQuery('.ashade-woo-login-wrap').on('click', '.ashade-woo-customer-signin', function() {
            let $this = jQuery(this),
                $parent = $this.parent();
            $parent.find('.ashade-woo-customer-register').addClass('is-inactive');
            $this.removeClass('is-inactive');
            $parent.parent().children('form.ashade-wc-signin-form').slideDown(300).removeClass('is-inactive');
            $parent.parent().children('form.ashade-wc-register-form').slideUp(300).addClass('is-inactive');
        });
    }
});