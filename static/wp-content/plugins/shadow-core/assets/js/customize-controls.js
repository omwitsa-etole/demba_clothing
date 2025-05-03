"use strict";

jQuery(document).on('click', '.cc-switcher-wrapper input[type="checkbox"]', function() {
    let $this = jQuery(this),
        $wrap = $this.parent(),
        $switcher = $wrap.find('.cc-switcher');

    if ($this.is(":checked")) {
        $switcher.addClass('toggled_on');
    } else {
        $switcher.removeClass('toggled_on');
    }
});

jQuery(document).on('click', '.cc-choose-item', function() {
    var $this = jQuery(this),
        $parent = $this.parent(),
        $input = $parent.find('input');
    $parent.find('.active').removeClass('active');
    $this.addClass('active');
    $input.val($this.attr('data-value')).trigger('change');

});

jQuery(document).ready(function() {
    // Reset Tabs Choose Items
    jQuery('.cc-choose-wrapper-tab').each(function() {
        jQuery(this).find('.cc-choose-item').eq(0).trigger('click');
    });

    // Add Custom Class to Option LI
    jQuery("[data-class]").each(function() {
        var $this = jQuery(this);
        $this.parents('li').addClass($this.attr('data-class'));
    });

    // Setting Up Controls
    jQuery('.cc-choose-wrapper-image').each(function() {
        var $this = jQuery(this);
        $this.css({
            'margin': '-' + parseInt($this.attr('data-margin'), 10) + 'px',
            'width': 'calc(100% + ' + parseInt($this.attr('data-margin'), 10) * 2 + 'px)',
        });
        $this.find('.cc-choose-item').css('padding', $this.attr('data-margin') + 'px');
    });

    jQuery('.cc-choose-color').each(function() {
        jQuery(this).find('span').css('background', jQuery(this).attr('data-value'));
        jQuery(this).css('border-color', jQuery(this).attr('data-value'));
    });

    jQuery('.cc_control_divider').each(function() {
        var $this = jQuery(this);
        if ($this.attr('data-top')) {
            $this.css('margin-top', parseInt($this.attr('data-top'), 10) + 'px');
        }
        if ($this.attr('data-bottom')) {
            $this.css('margin-bottom', parseInt($this.attr('data-bottom'), 10) + 'px');
        }
    });

    jQuery('.cc_control_title').each(function() {
        var $this = jQuery(this);
        if ($this.attr('data-bottom')) {
            $this.css('margin-bottom', parseInt($this.attr('data-bottom'), 10) + 'px');
        }
        if ($this.attr('data-font-size')) {
            $this.css('font-size', parseInt($this.attr('data-font-size'), 10) + 'px');
        }
        if ($this.attr('data-line-height')) {
            $this.css('line-height', parseInt($this.attr('data-line-height'), 10) + 'px');
        }
        if ($this.attr('data-color')) {
            $this.css('color', $this.attr('data-color'));
        }
        if ($this.attr('data-font-family')) {
            $this.css('font-family', $this.attr('data-font-family'));
        }
    });

    // Tab Toggler 
    jQuery('.cc-toggle-tab-start').each(function() {
        var $this = jQuery(this);
        $this.parents('li').addClass('shadow_toggle_tab_start');
    });

    jQuery('.cc-toggle-tab-end').each(function() {
        var $this = jQuery(this);
        $this.parents('li').addClass('shadow_toggle_tab_end');
    });

    jQuery('.shadow_toggle_tab_start').each(function() {
        var $this = jQuery(this),
            $this_content = jQuery($this.nextUntil('.shadow_toggle_tab_end'));

        $this_content.addClass('cc-toggle-tab-off cc-toggle-tab-content');
        $this_content.first().addClass('cc-tt-first');
        $this_content.last().addClass('cc-tt-last');

    });

    jQuery('.cc-toggle-tab-start').on('click', function() {
        var $this = jQuery(this),
            $this_li = $this.parents('li');

        $this_li.toggleClass('active');
        $this_li.nextUntil('.shadow_toggle_tab_end').toggleClass('cc-toggle-tab-off');
    });

    // Dimensions Control
    jQuery('.cc-dimension-lock').on('click', function() {
        var $this = jQuery(this),
            $wrapper = $this.parents('.cc-dimension-wrapper'),
            $first = $wrapper.find('.cc-dimension-input:enabled:visible:first'),
            $input = $wrapper.find('.cc-dimension-value');

        $wrapper.toggleClass('cc-dimension-locked');

        if ($wrapper.hasClass('cc-dimension-locked')) {
            $wrapper.find('.cc-dimension-input').not($first[0]).val($first.val());
            $input.val($first.val() + '/' + $first.val() + '/' + $first.val() + '/' + $first.val()).trigger('change');
        }
    });

    jQuery('.cc-dimension-input').on('change', function() {
        change_dimension_value(jQuery(this));
    });

    jQuery('.cc-dimension-input').on('keyup', function() {
        change_dimension_value(jQuery(this));
    });

    // Slider Control
    jQuery('.customize-control-slider').each(function() {
        var $this = jQuery(this),
            $slider = $this.find('.cc-number-slider'),
            $input = $this.find('.cc-number-value'),
            this_min = $input.attr('min'),
            this_max = $input.attr('max'),
            this_step = $input.attr('step');

        if ($slider.attr('data-step')) {
            this_step = parseFloat($slider.attr('data-step'));
        }

        $slider.slider({
            value: parseFloat($input.val()),
            min: parseFloat(this_min),
            max: parseFloat(this_max),
            step: parseFloat(this_step),
            range: 'min',
            slide: function(event, ui) {
                $input.val(ui.value).trigger('change');
            }
        });

        $input.on('change', function() {
            $slider.slider('value', $input.val());
        });
    });

    jQuery('.cc-number-reset').on('click', function() {
        var $this = jQuery(this),
            $wrapper = $this.parents('.customize-control-slider'),
            default_value = $wrapper.attr('data-default'),
            $input = $wrapper.find('.cc-number-value');

        $input.val(default_value).trigger('change');
    });

    // Check Dependency and Bind Dependency
    jQuery('.customize_condition').each(function() {
        var $this = jQuery(this),
            $this_parent = $this.parents('li.customize-control'),
            this_id_array = $this.attr('data-id').split('|'),
            this_value_array = $this.attr('data-value').split('|'),
            final_result = check_custom_depend(this_id_array, this_value_array);

        parent_depend_event($this_parent, final_result);

        this_id_array.forEach(function(item, i) {
            var $this_el = jQuery('#_customize-input-' + item);

            if (!$this_el.length && jQuery('#customize-control-' + item).length) {
                // Radio Button
                var $radio_parent = jQuery('#customize-control-' + item);
                $radio_parent.find('input[type=radio]').on('click', function() {
                    var action = check_custom_depend(this_id_array, this_value_array);
                    parent_depend_event($this_parent, action);
                });
            } else {
                if ($this_el.is('div') && $this_el.hasClass('cc-switcher-wrapper')) {
                    // Switcher
                    $this_el.find('input').on('change', function() {
                        var action = check_custom_depend(this_id_array, this_value_array);
                        parent_depend_event($this_parent, action);
                    });
                }
                if ($this_el.is('div') && $this_el.hasClass('cc-choose-wrapper')) {
                    // Choose
                    $this_el.find('input').on('change', function() {
                        var action = check_custom_depend(this_id_array, this_value_array);
                        parent_depend_event($this_parent, action);
                    });
                }
                if ($this_el.is('input') && $this_el.attr('type') == 'checkbox') {
                    // Checkbox
                    $this_el.on('click', function() {
                        var action = check_custom_depend(this_id_array, this_value_array);
                        parent_depend_event($this_parent, action);
                    });
                }
                if ($this_el.is('select')) {
                    // Select
                    $this_el.on('change', function() {
                        var action = check_custom_depend(this_id_array, this_value_array);
                        parent_depend_event($this_parent, action);
                    });
                }
            }
        });
    });
});

/* Dimension Change Function */
function change_dimension_value($this) {
    var $wrapper = $this.parents('.cc-dimension-wrapper'),
        this_val = $this.val(),
        $top = $wrapper.find('.cc-dimension-top'),
        $right = $wrapper.find('.cc-dimension-right'),
        $bottom = $wrapper.find('.cc-dimension-bottom'),
        $left = $wrapper.find('.cc-dimension-left'),
        $input = $wrapper.find('.cc-dimension-value'),
        final_val = '';

    if ($wrapper.hasClass('cc-dimension-locked')) {
        $wrapper.find('.cc-dimension-input:enabled').not(this).val($this.val());
    }

    $wrapper.find('.cc-dimension-input').each(function() {
        if (!jQuery(this).attr('disabled')) {
            final_val = final_val + jQuery(this).val() + '/';
        } else {
            final_val = final_val + 'd/';
        }
    });

    final_val = final_val.substring(0, final_val.length - 1);

    $input.val(final_val).trigger('change');
}

/* Show or Hide Dependency Parent */
function parent_depend_event($this_parent, action) {
    if (action == 'hide') {
        $this_parent.hide();
        if ($this_parent.hasClass('shadow_toggle_tab_start')) {
            $this_parent.nextUntil('.shadow_toggle_tab_end').hide();
        }
    } else {
        $this_parent.show();
        if ($this_parent.hasClass('shadow_toggle_tab_start')) {
            $this_parent.nextUntil('.shadow_toggle_tab_end').show();
        }
    }
}

/* Customizer Dependency Functions */
function check_custom_depend(this_id_array, this_value_array) {
    var result = '';
    for (var i = 0; i < this_id_array.length; i++) {
        var $this_item = jQuery('#_customize-input-' + this_id_array[i]);

        if (!$this_item.length && jQuery('#customize-control-' + this_id_array[i]).length) {
            // Radio Button
            $this_item = 'radio';
        }

        var state = check_custom_depend_state($this_item, i, this_id_array, this_value_array);
        if (result == '') {
            result = state;
        } else if (result == 'show' && state == 'hide') {
            result = 'hide';
        } else if (result == 'hide' && state == 'show') {
            result = 'hide';
        }
    }
    return result;
}

function check_custom_depend_state($this_item, i, this_id_array, this_value_array) {
    var result = '';
    if ($this_item == 'radio') {
        // Radio Button
        var $radio_parent = jQuery('#customize-control-' + this_id_array[i]),
            val = '';
        $radio_parent.find('input[type=radio]').each(function() {
            if (jQuery(this).attr('checked')) {
                val = jQuery(this).val();
            }
        });
        result = check_custom_depend_value(val, this_value_array[i]);
    } else {
        if ($this_item.is('div') && $this_item.hasClass('cc-choose-wrapper')) {
            // Choose
            result = check_custom_depend_value($this_item.find('input').val(), this_value_array[i]);
        }
        if ($this_item.is('div') && $this_item.hasClass('cc-switcher-wrapper')) {
            // Switcher
            if ($this_item.find('input').is(":checked")) {
                var this_val = 1;
            } else {
                var this_val = 0;
            }
            if (this_val == this_value_array[i]) {
                result = 'show';
            } else {
                result = 'hide';
            }
        }
        if ($this_item.is('input') && $this_item.attr('type') == 'checkbox') {
            // Checkbox
            if ($this_item.attr('checked')) {
                if (this_value_array[i] == 'checked') {
                    result = 'show';
                } else {
                    result = 'hide';
                }
            } else {
                if (this_value_array[i] !== 'checked') {
                    result = 'show';
                } else {
                    result = 'hide';
                }
            }
        }
        if ($this_item.is('select')) {
            // Select
            result = check_custom_depend_value($this_item.val(), this_value_array[i]);
        }
    }
    return result;
}

function check_custom_depend_value(val, this_value) {
    var result = '';

    if (this_value.indexOf(',') > 0) {
        this_value = this_value.split(',');
        if (search_in_array(val, this_value) > -1) {
            result = 'show';
        } else {
            result = 'hide';
        }
    } else {
        if (val == this_value) {
            result = 'show';
        } else {
            result = 'hide';
        }
    }
    return result;
}

/* Responsive Controls 
   ------------------- */
jQuery(document).on('click', '.cc-responsive-control-states a', function(e) {
    e.preventDefault();
    let $overlay = jQuery(this).parents('.wp-full-overlay'),
        state = jQuery(this).data('state');
    $overlay.removeClass('preview-desktop preview-tablet preview-mobile').addClass('preview-' + state);
    $overlay.find('.devices-wrapper .devices button').each(function() {
        if (jQuery(this).data('device') == state) {
            jQuery(this).addClass('active');
        } else {
            jQuery(this).removeClass('active');
        }
    });
});

/* Indents Control
   --------------- */
jQuery(document).on('keyup', '.shadow-indents-field-wrap input', function() {
    jQuery(this).trigger('change');
});

jQuery(document).on('change', '.shadow-indents-field-wrap input', function() {
    let $parent = jQuery(this).parent().parent();

    if ($parent.hasClass('is-locked')) {
        $parent.find('input').not(':disabled').val(jQuery(this).val());
    }

    if ($parent.parents('li.customize-control').hasClass('customize-control-border')) {
        stcc_save_borders($parent.parents('li'));
    } else if ($parent.parents('li.customize-control').hasClass('customize-control-indents')) {
        stcc_save_indents($parent.parents('li'));
    }
});

jQuery(document).on('click', '.shadow-indents-field-lock', function() {
    let $parent = jQuery(this).parent().parent();
    $parent.toggleClass('is-locked');
    if ($parent.hasClass('is-locked')) {
        let fVal = $parent.children('li').first().children('input').val();
        $parent.find('input').val(fVal);
    }
    $parent.children('li:first-child').children('input').trigger('change');
});

// Save Indents Settings
function stcc_save_indents($parent) {
    let result = {};

    $parent.find('.cc-responsive-control-wrap').each(function() {
        let this_id = jQuery(this).data('id'),
            this_result = {},
            this_lock = '',
            result_string = '';

        jQuery(this).find('.shadow-indents-field-wrap').each(function() {
            let $wrap = jQuery(this);

            if ($wrap.hasClass('is-locked')) {
                this_lock = this_lock + '1/';
            } else {
                this_lock = this_lock + '0/';
            }
            this_result[$wrap.data('type')] = {
                hasValues: false
            };

            jQuery(this).find('input').each(function() {
                let $this = jQuery(this);
                if ($this.is(':disabled')) {
                    this_result[$wrap.data('type')][$this.data('pos')] = 'd';
                    this_result[$wrap.data('type')].hasValues = true;
                } else if ($this.val() == '') {
                    this_result[$wrap.data('type')][$this.data('pos')] = 'n';
                } else {
                    this_result[$wrap.data('type')][$this.data('pos')] = $this.val();
                    this_result[$wrap.data('type')].hasValues = true;
                }
            });
        });

        this_lock = this_lock.slice(0, -1);
        result[this_id + '_lock'] = this_lock;
        if (this_result.desktop.hasValues || this_result.tablet.hasValues || this_result.mobile.hasValues) {
            if (this_result.desktop.hasValues) {
                result_string = this_result.desktop.t + 'x' + this_result.desktop.r + 'x' + this_result.desktop.b + 'x' + this_result.desktop.l;
                if (this_result.tablet.hasValues || this_result.mobile.hasValues) {
                    result_string = result_string + '/' + this_result.tablet.t + 'x' + this_result.tablet.r + 'x' + this_result.tablet.b + 'x' + this_result.tablet.l + '/' + this_result.mobile.t + 'x' + this_result.mobile.r + 'x' + this_result.mobile.b + 'x' + this_result.mobile.l
                }
            }
        }
        result[this_id] = result_string;
    });

    let resultJSON = JSON.stringify(result);
    $parent.find('.cc-indents-wrapper').children('input').val(resultJSON).trigger('change');
}

/* Border Control
   -------------- */
jQuery(document).on('change', 'select.cc-border-control--style', function() {
    let $val = jQuery(this).val(),
        $wrap = jQuery(this).parent(),
        $bw = $wrap.children('.cc-border-control--width');

    if ($val == 'none' || $val == 'default') {
        $bw.slideUp(200);
    } else {
        $bw.slideDown(200);
    }
    stcc_save_borders(jQuery(this).parents('li.customize-control-border'));
});

// Change Units
jQuery(document).on('click', '.cc-unit-selector a', function(e) {
    e.preventDefault();
    jQuery(this).parent().attr('data-value', jQuery(this).attr('data-val'));
    jQuery(this).parent().children('.is-active').removeClass('is-active');
    jQuery(this).addClass('is-active');

    stcc_save_borders(jQuery(this).parents('li.customize-control-border'));
});

// Save Border Settings
function stcc_save_borders($parent) {
    let result = {},
        $wrap = $parent.find('.cc-border-control-wrapper');

    result.bs = $wrap.children('select').val();
    result.bru = $wrap.find('.cc-unit-selector').attr('data-value');

    $wrap.find('.shadow-indents-field-wrap').each(function() {
        let this_id = jQuery(this).data('id'),
            this_result = {
                hasValues: false,
            };

        if (jQuery(this).hasClass('is-locked')) {
            result[jQuery(this).data('id') + 'l'] = 1;
        } else {
            result[jQuery(this).data('id') + 'l'] = 0;
        }

        jQuery(this).find('input').each(function() {
            let $this = jQuery(this);
            if ($this.is(':disabled')) {
                this_result[$this.data('pos')] = 'd';
                this_result.hasValues = true;
            } else if ($this.val() == '') {
                this_result[$this.data('pos')] = 'n';
            } else {
                this_result[$this.data('pos')] = parseInt($this.val(), 10);
                this_result.hasValues = true;
            }
        });

        if (this_result.hasValues) {
            if (this_result.t == this_result.r && this_result.t == this_result.b && this_result.t == this_result.l) {
                result[this_id] = this_result.t;
            } else {
                result[this_id] = this_result.t + 'x' + this_result.r + 'x' + this_result.b + 'x' + this_result.l;
            }
        }
    });

    let resultJSON = JSON.stringify(result);
    $wrap.children('input').val(resultJSON).trigger('change');
}

jQuery(document).ready(function() {
    /* Responsive Number 
       ----------------- */
    if (jQuery('.cc-responsive-number').length) {
        jQuery('.cc-responsive-number').each(function() {
            let $control = jQuery(this);

            $control.save = function() {
                let data = {};

                $control.find('input[type="number"]').each(function() {
                    let this_id = jQuery(this).parent().attr('data-id');
                    data[this_id] = jQuery(this).val();

                });
                let resultJSON = JSON.stringify(data);
                $control.children('input').val(resultJSON).trigger('change');
            }

            /* Activate Sliders */
            $control.find('.cc-slider-input').each(function() {
                let $this = jQuery(this),
                    $input = $this.children('input'),
                    mouseDown = false,
                    valueChanged = false,
                    $slider = $this.children('.cc-slider-wrap'),
                    options = {
                        value: $input.val() !== '' ? parseFloat($input.val()) : '',
                        min: parseFloat($input.attr('min')),
                        max: parseFloat($input.attr('max')),
                        step: parseFloat($slider.attr('data-step')),
                        range: 'min',
                        slide: function(event, ui) {
                            if (mouseDown) {
                                valueChanged = true;
                            }
                            $input.val(ui.value);
                        }
                    };

                $slider.on('mousedown', function() {
                    mouseDown = true;
                });

                $this.on('mouseup', function() {
                    mouseDown = false;
                    if (valueChanged) {
                        valueChanged = false;
                        $control.save();
                    }
                });

                $input.on('keyup', function() {
                    jQuery(this).trigger('change');
                });
                $input.on('change', function() {
                    $slider.slider('value', $input.val());
                    if (mouseDown) {
                        valueChanged = true;
                    } else {
                        $control.save();
                    }
                });

                $slider.slider(options);
            });

            $control.on('change', 'input[type="number"]', function() {
                $control.save();
            });
        });
    }

    /* Sortable Lists
       -------------- */
    if (jQuery('.cc-sortable-list').length) {
        jQuery('.cc-sortable-list').each(function() {
            jQuery(this).sortable({
                connectWith: '.cc-sortable-item',
                handle: '.cc-sortable-drag',
                cancel: '.cc-socials-item-toggler, .cc-socials-item--remove',
                placeholder: 'cc-sortable-holder ui-corner-all',
                stop: function(event, ui) {
                    ui.item.find('input').trigger('change');
                }
            });
        });
    }

    /* Multi Switcher Control
       ---------------------- */
    if (jQuery('.cc-m-switcher-wrapper').length) {
        jQuery('.cc-m-switcher-wrapper').each(function() {
            let $control = jQuery(this);

            $control.save = function() {
                let data = {};

                $control.children('.cc-m-switch-item').each(function() {
                    let this_id = jQuery(this).attr('data-id');
                    if (jQuery(this).hasClass('is-active')) {
                        data[this_id] = 1;
                    } else {
                        data[this_id] = 0;
                    }
                });

                let resultJSON = JSON.stringify(data);
                $control.children('input').val(resultJSON).trigger('change');
            }

            $control.on('click', '.cc-m-switch-item', function(e) {
                e.preventDefault();
                jQuery(this).toggleClass('is-active');
                $control.save();
            });
        });
    }

    /* Socials Control 
       --------------- */
    if (jQuery('.cc-socials-wrapper').length) {
        jQuery('.cc-socials-wrapper').each(function() {
            let $control = jQuery(this),
                $list = $control.children('.cc-sortable-list');

            $control.save = function() {
                let data = {
                    type: $control.hasClass('cc-socials--text') ? 'text' : 'icons',
                    target: $control.find('.cc-socials-target').attr('data-target'),
                    socials: {}
                };

                $control.children('.cc-socials-list').children('.cc-socials-item').each(function() {
                    let $item = jQuery(this),
                        ind = $item.attr('data-type');

                    if (typeof data.socials[$item.attr('data-type')] !== 'undefined') {
                        ind = ind + '-' + Math.random().toString(36).substr(2, 5);
                    }
                    data.socials[ind] = {
                        url: $item.find('.cc-socials-field--url input').val(),
                        label: $item.find('.cc-socials-field--label input').val(),
                    };

                });
                let resultJSON = JSON.stringify(data);
                $control.children('input').val(resultJSON).trigger('change');
            }

            $list.find('.cc-socials-item--fields').slideUp(1);

            // Expand/Collapse
            $control.on('click', '.cc-socials-item--head', function(e) {
                let $this = jQuery(this).children('.cc-socials-item-toggler');
                if ($this.hasClass('dashicons-edit')) {
                    $this.parents('.cc-socials-item').children('.cc-socials-item--fields').slideDown(200);
                    $this.removeClass('dashicons-edit').addClass('dashicons-arrow-up');
                } else {
                    $this.parents('.cc-socials-item').children('.cc-socials-item--fields').slideUp(200);
                    $this.addClass('dashicons-edit').removeClass('dashicons-arrow-up');
                }
            });

            // Add New Item
            $control.on('click', '.cc-socials-add', function(e) {
                e.preventDefault();
                let $newItem = $control.children('.cc-socials-new-item').clone();
                $newItem.removeClass('cc-socials-new-item').slideUp(1, function() {
                    jQuery(this).appendTo($list);
                    jQuery(this).slideDown(150);
                    setTimeout(function() {
                        $control.save();
                    }, 50);
                });
            });

            // Remove Item
            $control.on('click', '.cc-socials-item--remove', function(e) {
                e.preventDefault();
                e.stopPropagation();
                jQuery(this).parent().parent().slideUp(150, function() {
                    jQuery(this).remove();
                    setTimeout(function() {
                        $control.save();
                    }, 50);
                });
            });

            // Change Display Type
            $control.on('click', '.cc-socials-type', function(e) {
                e.preventDefault();
                let $parent = jQuery(this).parent();
                $parent.toggleClass('cc-socials--text cc-socials--icons');
                setTimeout(function() {
                    $control.save();
                }, 50);
            });

            // Change Link Target
            $control.on('click', '.cc-socials-target', function(e) {
                e.preventDefault();
                jQuery(this).attr('data-target', jQuery(this).attr('data-target') == 'blank' ? 'self' : 'blank');
                setTimeout(function() {
                    $control.save();
                }, 50);
            });

            // Select Item Type
            $control.on('change', 'select', function() {
                let $item = jQuery(this).parents('.cc-socials-item'),
                    this_val = jQuery(this).val(),
                    this_label = jQuery(this).children('[value="' + this_val + '"]').text();

                $item.children('.cc-socials-item--head').children('label').text(this_label);
                $item.attr('data-type', this_label);
                setTimeout(function() {
                    $control.save();
                }, 50);
            });

            // React on Input Change
            $control.on('change', '.cc-socials-item--fields input', function() {
                let $item = jQuery(this).parents('.cc-socials-item');
                if ($item.find('.cc-socials-field--url input').val() == '') {
                    $item.addClass('is-inactive');
                } else {
                    $item.removeClass('is-inactive');
                }
                setTimeout(function() {
                    $control.save();
                }, 50);
            });
        });
    }

    /* Multi Color Select
    ------------------ */
    jQuery('.customize-control-multicolor').each(function() {
        let $control = jQuery(this);

        if ($control.find('.cc-multicolor-toggler').hasClass('is-active')) {
            $control.find('.has-toggler').slideDown(200);
        } else {
            $control.find('.has-toggler').slideUp(200);
        }
        $control.on('click', '.cc-multicolor-toggler', function(e) {
            e.preventDefault();

            jQuery(this).toggleClass('is-active');

            if (jQuery(this).hasClass('is-active')) {
                $control.find('.has-toggler').slideDown(200);
            } else {
                $control.find('.has-toggler').slideUp(200);
            }

            cc_multicolor_save();
        });

        $control.on('click', '.cc-multicolor-item--clear', function(e) {
            e.preventDefault();
            let $this = jQuery(this),
                $item = $this.parents('.cc-multicolor-item');
            if ($this.attr('data-defaults')) {
                $item.find('input').val($this.attr('data-defaults'));
                $item.removeClass('is-active').children('.cc-multicolor-item--body').slideUp(200);
                $item.find('.cc-multicolor-item--preview').css('background-color', $this.attr('data-defaults'));
            } else {
                $item.find('input').val('');
                $item.removeClass('is-active').children('.cc-multicolor-item--body').slideUp(200);
                $item.find('.cc-multicolor-item--preview').css('background-color', '#eeeeee');
            }

            cc_multicolor_save();
        });

        function cc_multicolor_save() {
            let result = {};
            if ($control.find('.has-toggler').length) {
                if ($control.find('.cc-multicolor-toggler').hasClass('is-active')) {
                    result.toggled = 'on';
                } else {
                    result.toggled = 'off';
                }
            }
            $control.find('.cc-multicolor-item').each(function() {
                let $input = jQuery(this).find('input');
                if ($input.val() !== '') {
                    result[$input.attr('data-id')] = $input.val();
                    $input.parents('.cc-multicolor-item').addClass('has-value').removeClass('no-value');
                } else {
                    $input.parents('.cc-multicolor-item').removeClass('has-value').addClass('no-value');
                }
            });

            let resultJSON = JSON.stringify(result);
            $control.find('.cc-multi-color-wrapper').children('input').val(resultJSON).trigger('change');
        }

        $control.find('.cc-multicolor-item').each(function() {
            let $this = jQuery(this),
                $preview = $this.find('.cc-multicolor-item--preview'),
                $body = $this.children('.cc-multicolor-item--body'),
                $input = $body.children('input.cc-multiclor-item--input'),
                mouseDown = false,
                valueChanged = false;

            if ($preview.attr('data-color')) {
                $preview.css('background-color', $preview.attr('data-color'));
            }
            $input.iris({
                mode: 'hsv',
                hide: false,
                change: function(event, ui) {
                    if (mouseDown) {
                        valueChanged = true;
                    } else {
                        cc_multicolor_save();
                    }
                    if ($this.hasClass('no-value')) {
                        $this.removeClass('no-value').addClass('has-value');
                    }
                    $preview.attr('data-color', ui.color.toString());
                    $preview.css('background-color', ui.color.toString());
                }
            });
            $preview.on('click', function() {
                if ($this.hasClass('is-active')) {
                    $this.parent().find('.cc-multicolor-item.is-active').removeClass('is-active').children('.cc-multicolor-item--body').slideUp(200);
                } else {
                    $this.parent().find('.cc-multicolor-item.is-active').removeClass('is-active').children('.cc-multicolor-item--body').slideUp(200);
                    $body.slideDown(200);
                    $this.addClass('is-active');
                }
            });
            $this.on('mousedown', '.iris-picker', function() {
                mouseDown = true;
            }).on('mouseup', function() {
                mouseDown = false;
                if (valueChanged) {
                    valueChanged = false;
                    cc_multicolor_save();
                }
            });
        });
    });

    /* Typography Control
    --------------------- */
    jQuery('.customize-control-typography').each(function() {
        let $control = jQuery(this);

        // Save Function
        function cc_typography_save() {
            let result = {};
            if ($control.find('.has-toggler').length) {
                if ($control.find('.cc-typography-toggler').hasClass('is-active')) {
                    result.toggled = 'on';
                } else {
                    result.toggled = 'off';
                }
            }

            $control.find('select').each(function() {
                if (jQuery(this).val() !== 'default') {
                    result[jQuery(this).data('id')] = jQuery(this).val();
                }
            });

            result.ls = $control.find('.cc-slider-input[data-id="ls"] > input').val();

            $control.find('.cc-responsive-control-wrap').each(function() {
                let this_id = jQuery(this).data('id'),
                    $d = jQuery(this).find('.responsive-input--desktop > input'),
                    $t = jQuery(this).find('.responsive-input--tablet > input'),
                    $m = jQuery(this).find('.responsive-input--mobile > input'),
                    dV = ($d.val() ? $d.val() : 0),
                    tV = ($t.val() ? $t.val() : 0),
                    mV = ($m.val() ? $m.val() : 0);

                if (tV || mV) {
                    result[this_id] = dV + '/' + tV + '/' + mV;
                } else if (dV) {
                    result[this_id] = dV;
                }
            });

            let resultJSON = JSON.stringify(result);
            $control.children('input').val(resultJSON).trigger('change');
        }

        // Toggler
        if ($control.find('.cc-typography-toggler').hasClass('is-active')) {
            $control.find('.has-toggler').slideDown(1);
        } else {
            $control.find('.has-toggler').slideUp(1);
        }
        $control.on('click', '.cc-typography-toggler', function(e) {
            e.preventDefault();

            jQuery(this).toggleClass('is-active');

            if (jQuery(this).hasClass('is-active')) {
                $control.find('.has-toggler').slideDown(200);
            } else {
                $control.find('.has-toggler').slideUp(200);
            }

            cc_typography_save();
        });

        // Dropdown Events
        $control.on('change', 'select', function() {
            cc_typography_save();
        });

        // Slider Input
        $control.find('.cc-slider-input').each(function() {

            let $this = jQuery(this),
                $slider = $this.find('.cc-slider-wrap'),
                $input = $this.children('input'),
                mouseDown = false,
                valueChanged = false,
                options = {
                    value: $input.val() !== '' ? parseFloat($input.val()) : '',
                    min: parseFloat($input.attr('min')),
                    max: parseFloat($input.attr('max')),
                    step: parseFloat($slider.attr('data-step')),
                    range: 'min',
                    slide: function(event, ui) {
                        if (mouseDown) {
                            valueChanged = true;
                        }
                        $input.val(ui.value);
                    }
                };

            $slider.on('mousedown', function() {
                mouseDown = true;
            });

            $this.on('mouseup', function() {
                mouseDown = false;
                if (valueChanged) {
                    valueChanged = false;
                    cc_typography_save();
                }
            });

            $slider.slider(options);

            $input.on('keyup', function() {
                jQuery(this).trigger('change');
            });
            $input.on('change', function() {
                $slider.slider('value', $input.val());
                if (mouseDown) {
                    valueChanged = true;
                } else {
                    cc_typography_save();
                }
            });
        });
    });

    /* Divider Attribute 
       ----------------- */
    if (jQuery('hr.cc-divider-bst').length) {
        jQuery('hr.cc-divider-bst').each(function() {
            let $this = jQuery(this),
                $li = $this.parents('li.customize-control'),
                position = 'after';

            if ($this.attr('data-position')) {
                position = $this.attr('data-position');
            }
            if ($this.attr('data-color')) {
                $this.css('border-top-color', $this.attr('data-color'));
            }
            if ($this.attr('data-margin-top')) {
                $this.css('margin-top', $this.attr('data-margin-top') + 'px');
            }
            if ($this.attr('data-margin-bottom')) {
                $this.css('margin-bottom', $this.attr('data-margin-bottom') + 'px');
            }
            if ($this.attr('data-class')) {
                $this.addClass($this.attr('data-class'));
            }
            $this.detach();
            $this.removeClass('hidden');
            if ('before' == position) {
                $li.prepend($this);
            } else {
                $li.append($this);
            }
        });
    }
});