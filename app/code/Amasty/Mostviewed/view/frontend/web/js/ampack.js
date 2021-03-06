define([
    'jquery',
    'Magento_Catalog/js/price-utils',
    'Magento_Catalog/js/price-box'
], function ($, utils) {
    $.widget('mage.amPack', {
        options: {},
        excluded: [],
        selectors: {
            'discount': '[data-amrelated-js="bundle-price-discount"]',
            'finalPrice': '[data-amrelated-js="bundle-final-price"]',
            'checkbox': '[data-amrelated-js="checkbox"]',
            'packContainer': '[data-amrelated-js="pack-container"]',
            'packWrapper': '[data-amrelated-js="pack-wrapper"]',
            'packItem': '[data-amrelated-js="pack-item"]',
            'packTitle': '[data-amrelated-js="pack-title"]',
            'selectedBackground': '[data-amrelated-js="selected-background"]',
            'mainPackItem': '[data-item-role="main"]'
        },
        classes: {
            discountApplied: '-discount-applied'
        },

        _create: function () {
            var self = this;

            $(this.element).find(this.selectors.checkbox).change(function () {
                self.changeEvent($(this));
            });

            this.observeClickOnMobile();
        },

        observeClickOnMobile: function () {
            var self = this;

            if ($(window).width() < 768) {
                $(this.element).find(this.selectors.packItem).on('click', function (event) {
                    if (!$(event.target).hasClass('amrelated-link')
                        && !$(event.target).parents().hasClass('amrelated-link')
                    ) {
                        var checkbox = $(event.target).parents(self.selectors.packItem).find(self.selectors.checkbox);

                        checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
                    }
                });

                $(self.element).find(this.selectors.packTitle).on('click', function (event) {
                    self.toggleItems(event);
                });
            }
        },

        toggleItems: function (event) {
            var packContainer = $(event.target).parents(this.selectors.packWrapper);

            packContainer.find(this.selectors.packTitle).toggleClass('-collapsed');
            packContainer.find(this.selectors.packItem).toggleClass('-collapsed');
        },

        changeEvent: function (checkbox) {
            var id = checkbox.closest(this.selectors.packItem).attr('data-product-id'),
                isChecked = checkbox.prop('checked'),
                packItem = checkbox.parents(this.selectors.packItem),
                isLastItem = packItem.is('.amrelated-pack-item:last-child'),
                packContainer = checkbox.parents(this.selectors.packContainer),
                itemsCount = packContainer.find(this.selectors.checkbox).length,
                packBackground = packContainer.find(this.selectors.selectedBackground),
                selectedItems = packContainer.find(this.selectors.checkbox + ':checked'),
                selectedItemsCount = selectedItems.length;

            if (isChecked) {
                packItem.addClass('-selected');
                this.excluded = this.excluded.filter(function (item) {
                    return item !== id
                });
            } else {
                packItem.removeClass('-selected');
                this.excluded.push(id);
            }

            if (packContainer.length && itemsCount > 1) {
                var rtlCondition = (isChecked && selectedItemsCount === 1) || (!isChecked && selectedItemsCount === 0);
                packBackground.toggleClass('rtl', rtlCondition ? isLastItem : !isLastItem);
            }

            if (selectedItemsCount === itemsCount) {
                packContainer.addClass('-selected');
                packBackground.width("100%");
            } else if (selectedItemsCount === 0) {
                packContainer.removeClass('-selected');
                packBackground.width(0);
            } else {
                packContainer.removeClass('-selected');
                packBackground.width(selectedItems.parents(this.selectors.packItem).outerWidth())
            }

            this.reRenderPrice();
        },

        reRenderPrice: function () {
            var self = this,
                saveAmount = 0,
                isAllUnchecked = true,
                parentPrice = +this.options.parent_info.price,
                oldPrice = parentPrice,
                newPrice = 0,
                $element = $(this.element),
                priceFormat = this.options.priceFormat;

            $.each(this.options.products, function (index, priceInfo) {
                if (self.excluded.indexOf(index) === -1) {
                    isAllUnchecked = false;
                    oldPrice += priceInfo.price * priceInfo.qty;
                    newPrice += self.applyDiscount(priceInfo);
                }
            });

            if (isAllUnchecked) {
                newPrice = oldPrice;
            } else {
                newPrice += this.options.apply_for_parent ? this.applyDiscount(this.options.parent_info) : parentPrice;
            }

            this.toggleMainItemDiscount(!isAllUnchecked);

            saveAmount = oldPrice - newPrice;
            $element.find(this.selectors.discount).html(utils.formatPrice(saveAmount, priceFormat));
            $element.find(this.selectors.finalPrice).html(utils.formatPrice(newPrice, priceFormat));
        },

        toggleMainItemDiscount: function (visible) {
            var mainPackItem = $(this.selectors.mainPackItem);

            if (visible) {
                mainPackItem.addClass(this.classes.discountApplied);
            } else {
                mainPackItem.removeClass(this.classes.discountApplied);
            }
        },

        applyDiscount: function (priceInfo) {
            var price = priceInfo.price;
            if (this.options.discount_type == 0) {
                price = (price > this.options.discount_amount)
                    ? (price - this.options.discount_amount) * priceInfo.qty
                    : 0;
            } else {
                price = price - parseFloat(
                    (Math.round((price * 100) * this.options.discount_amount / 100) / 100).toFixed(2)
                );
                price *= priceInfo.qty;
            }

            return price;
        }
    });

    return $.mage.amPack;
});
