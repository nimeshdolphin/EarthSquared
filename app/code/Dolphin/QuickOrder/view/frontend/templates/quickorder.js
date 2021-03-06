require([
    'jquery',
    'Magento_Customer/js/customer-data',
    'mage/cookies',
    'jquery/ui',
    'Magento_Ui/js/modal/modal',
    'jquery/jquery-storageapi',
    'mage/storage'
], function($,customerData,modal,storage){
	var cookieData = new Array();
var updatedcookieData = new Array();
	$( document ).ready(function() {
		loadSubtotalSection();
		//sideBar();
	});
	$( window ).resize(function() {
		//sideBar();
	});
	var click_qty = 0;
	$(document).on('click','.qty-inc', function(){
		//console.log("test--");
			var dataString = new Array();
			var selectedOptionsData = [];
			var type_id = $(this).closest('.subcategoryproduct-collection').find('.type_id').val();
				if(type_id == 'configurable'){
					if($(this).closest('.subcategoryproduct-collection').find('.swatch-option').hasClass('selected')){
						var selectedOptionId = $(this).closest('.subcategoryproduct-collection').find('.swatch-option.selected').attr('option-id');
						var selectedOptionLabel = $(this).closest('.subcategoryproduct-collection').find('.swatch-option.selected').attr('option-label');
						var selectedOptionProductId = $(this).closest('.subcategoryproduct-collection').find('.swatch-option.selected').attr('associated-id');
						selectedOptionsData = {'option_id': selectedOptionId,'option_label':selectedOptionLabel, 'associated_id':selectedOptionProductId};
						$(this).closest('.subcategoryproduct-collection').find('.swatch-error').hide();
					} else {
						$(this).closest('.subcategoryproduct-collection').find('.swatch-error').html('<span style="color:red">Please select colour</span>');
						return false;
					}
				}
				//console.log("QTY --"+$(this).parents('.field.quickqty').find("input.input-text.qty").val());
	            var inputqty = $(this).parents('.field.quickqty').find("input.input-text.qty").val((+$(this).parents('.field.quickqty').find("input.input-text.qty").val() + 1) || 0);
	            $(this).focus();

	            var product_id = $(this).closest('.subcategoryproduct-collection').find('.productid').val();
				var name =  $(this).closest('.subcategoryproduct-collection').find('.product-name .subpname').text();
				var sku = $(this).closest('.subcategoryproduct-collection').find('.product-ref').text();

				var qty = $(inputqty).val();

				var image = $(this).closest('.subcategoryproduct-collection').find('.product-image-photo').attr('src');
				var finalPrice = $(this).closest('.subcategoryproduct-collection').find('.price-box .price').text();

				var rowcollection = {
	            	'product_id':product_id,
	            	'name':name,
	            	'sku':sku,
	            	'type_id':type_id,
	            	'qty':qty,
	            	'selectedOptionsData':selectedOptionsData,
	            	'image':image,
	            	'finalPrice': finalPrice
	            };

				dataString.push(rowcollection);

				var sidedata = $.parseJSON(JSON.stringify(dataString));
				console.log(sidedata);

				cookieData.push(rowcollection);

				var newCookieData = {}

				//old cookie data push to new
				var total_qty = 0;
				if(!!$.cookie('rowcollection') != "")
				{
					newCookieData = $.parseJSON($.cookie('rowcollection'));
					// $.each(newCookieData,function(index,value){
					// 	total_qty = parseInt(total_qty) + parseInt(value.qty);
					// });
				}

				for(var i=0; i<cookieData.length; i++) {
					newCookieData[cookieData[i]['product_id']] = cookieData[i];
				}

				// `newCookieData` is now:
				$.cookie("rowcollection", JSON.stringify(newCookieData));
					var flag = 0;
				//click_qty = parseInt(sidedata[0].qty) + parseInt(click_qty);
				//console.log(click_qty);
						$( ".subrowitems .rowdata" ).each(function( index ) {
							if($(this).attr('id') == '_'+sidedata[0].product_id){
								flag = 1;

								console.log("flag 1");
									if(sidedata[0].selectedOptionsData.length === 0)
									{
										var html = '<div class="rowdata row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rownameswatches"><div class="rowname">'+sidedata[0].name+'</div></div><div class="editrow"><a href="#left'+sidedata[0].product_id+'"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></a></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
										$('.quicksidebar .subrowitems .rowdata#_'+sidedata[0].product_id+'').replaceWith(html);
										//var total_items = $('.quicksidebar .subrowitems .rowdata').length;
										//$('.quicksidebar .subtotal').html('Selected Items <span class="total_products">('+click_qty+' Products</span> , <span class="total_items">'+total_items+' Items)</span>');
										return false;
									} else {
										if($(this).children().find('.swatches').attr('id') == 'a'+sidedata[0].selectedOptionsData.associated_id)
										{
											var html = '<div class="rowdata row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rownameswatches"><div class="rowname">'+sidedata[0].name+'</div><div class="swatches" id="a'+sidedata[0].selectedOptionsData.associated_id+'">Colour: '+sidedata[0].selectedOptionsData.option_label+'</div></div><div class="editrow"><a href="#left'+sidedata[0].product_id+'"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></a></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
											$('.quicksidebar .subrowitems .rowdata#_'+sidedata[0].product_id+'').replaceWith(html);
											//var total_items = $('.quicksidebar .subrowitems .rowdata').length;
											//$('.quicksidebar .subtotal').html('Selected Items <span class="total_products">('+click_qty+' Products</span> , <span class="total_items">'+total_items+' Items)</span>');
											return false;
										} else {
											var html = '<div class="rowdata row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rownameswatches"><div class="rowname">'+sidedata[0].name+'</div><div class="swatches" id="a'+sidedata[0].selectedOptionsData.associated_id+'">Colour: '+sidedata[0].selectedOptionsData.option_label+'</div></div><div class="editrow"><a href="#left'+sidedata[0].product_id+'"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></a></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
											$('.quicksidebar .subrowitems').append(html);
											//var total_items = $('.quicksidebar .subrowitems .rowdata').length;
											//$('.quicksidebar .subtotal').html('Selected Items <span class="total_products">('+click_qty+' Products</span> , <span class="total_items">'+total_items+' Items)</span>');
											return false;
										}
									}
								return false;
							}
						});
		                if(flag == 0){
								console.log("flag 0");
		                	    if(sidedata[0].selectedOptionsData.length === 0)
								{
									var html = '<div class="rowdata selected row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rownameswatches"><div class="rowname">'+sidedata[0].name+'</div></div><div class="editrow"><a href="#left'+sidedata[0].product_id+'"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></a></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
									$('.quicksidebar .subrowitems').append(html);
									//var total_items = $('.quicksidebar .subrowitems .rowdata').length;
									//$('.quicksidebar .subtotal').html('Selected Items <span class="total_products">('+click_qty+' Products</span> , <span class="total_items">'+total_items+' Items)</span>');
								} else {
									var html = '<div class="rowdata not-sel row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rownameswatches"><div class="rowname">'+sidedata[0].name+'</div><div class="swatches" id="a'+sidedata[0].selectedOptionsData.associated_id+'">Colour: '+sidedata[0].selectedOptionsData.option_label+'</div></div><div class="editrow"><a href="#left'+sidedata[0].product_id+'"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></a></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
									$('.quicksidebar .subrowitems').append(html);
									//var total_items = $('.quicksidebar .subrowitems .rowdata').length;
									//$('.quicksidebar .subtotal').html('Selected Items <span class="total_products">('+click_qty+' Products</span> , <span class="total_items">'+total_items+' Items)</span>');
								}


                            //var html = '<div class="rowdata row'+sidedata[0].product_id+'" id="_'+sidedata[0].product_id+'"><div class="rowqty"><span>'+sidedata[0].qty+'</span></div><div class="rowname">'+sidedata[0].name+'</div><div class="rownameswatches"><div class="swatches">Colour: '+sidedata[0].selectedOptionsData.option_label+'</div></div><div class="editrow"><img src="http://staging-trade.earthsquared.com/pub/media/pen.png"></div><div class="removerow"><img src="http://staging-trade.earthsquared.com/pub/media/garbage.png"></div></div>';
					        //$('.quicksidebar .subrowitems').append(html);
		                }
			loadSubtotalSection();
		sideBar();

	});
	$(document).on('click','.qty-dec', function(){
		if($(this).parents('.field.quickqty').find("input.input-text.qty").is(':enabled')){
	    	$(this).parents('.field.quickqty').find("input.input-text.qty").val(($(this).parents('.field.quickqty').find("input.input-text.qty").val() - 1 > 0) ? ($(this).parents('.field.quickqty').find("input.input-text.qty").val() - 1) : 0);
	        $(this).focus();
	    }
	    var mainId = $(this).attr('data-id');
	    $('#_'+mainId+' .rowqty span').text($(this).next().val());
	    if($(this).next().val() == 0){
	    	$('#_'+mainId+' .removerow').trigger('click');
	    }
	    var sumall = 0;
		$(".subrowitems .rowdata" ).each(function( index ) {
			sumall += parseInt($(this).find('.rowqty span').text());
		});
		$('.quicksidebar .subtotal .total_products .countqty').text(sumall);

		if(!!$.cookie('rowcollection') != "")
		{
			var cookieCollection = $.parseJSON($.cookie('rowcollection'));
			if(cookieCollection.hasOwnProperty(mainId)){
				cookieCollection[mainId]['qty'] = $(this).next().val();
			}
			$.cookie('rowcollection',JSON.stringify(cookieCollection));
		}

		decreaseSideBar();
	});
	//For edit click focus
	$(document).on('click','.editrow a', function(event){
	    var target = $(this.getAttribute('href'));
	    var focusTarget = this.getAttribute('href');
	    console.log(focusTarget);
	    if( target.length ) {
	        event.preventDefault();
	        $('html, body').stop().animate({
	            scrollTop: target.offset().top - 100
	        }, 1000);
	    }
	    $(focusTarget).children('.product-item').children('.quickproduct').children('.product-item-details').children('.productprice-qty').children('.quickqty').children('#qty').focus();
	});
	$(document).on('click','.removerow', function(){
		var delRowFromHtml = $(this).closest('.rowdata').attr('id');
		$('#'+delRowFromHtml+'').remove();
		var delRowFromCookie = delRowFromHtml.replace("_", "");

			if(!!$.cookie('rowcollection') != "")
			{
				var cookieCollection = $.parseJSON($.cookie('rowcollection'));
				delete cookieCollection[delRowFromCookie];
				$.cookie('rowcollection',JSON.stringify(cookieCollection));
			}
			loadSubtotalSection();
		decreaseSideBar();
	});
	var $rows = $('.quickorder-product-collection .subcategoryproduct-collection');
	$('#quicksearch').keyup(function() {
	    var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

	    $rows.show().filter(function() {
	        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
	        return !~text.indexOf(val);
	    }).hide();
	});

	$("#addtobagall").click(function(){
		if(!$('.subrowitems').children().length > 0){
			$('.allproductmsg').remove();
			$('.page.messages').before('<div class="message error allproductmsg">Please Select Product</div>');
			return false;
		}
		$('#addtobagall span').html('Adding..');
		$.ajax({
			showLoader: true,
			dataType: 'json',
			url: window.location.addToProductUrl,
			success: function(responce)
			{
				$('.listitemerror').remove();
				$('.allproductmsg').remove();
				if(responce.errors == true && responce.productId != ''){
					var proId = responce.productId,
						leftitem = $('#left'+proId);
					leftitem.find('.product-item-info').after('<div class="message error listitemerror">'+responce.message+'</div>');
					$('html, body').animate({
				        scrollTop: leftitem.offset().top - 60
				    }, 500);
				}else if(responce.errors == true){
					$('.page.messages').before('<div class="message error allproductmsg">'+responce.message+'</div>');
		            $('html, body').animate({
				        scrollTop: $('body').offset().top
				    }, 500);
				}else{
					// Remove all row
					//$.cookie("rowcollection", null, { path: '/' });
					$(".subrowitems .rowdata" ).each(function( index ) {
						$(this).find('.removerow').trigger('click');
					});
					$('.subrowitems').html('');
					$('.page.messages').before('<div class="message success allproductmsg">'+responce.message+'</div>');
					var sections = ['cart'];
		            customerData.invalidate(sections);
		            customerData.reload(sections, true);
		            $('#addtobagall span').html('Added');
		            $('html, body').animate({
				        scrollTop: $('body').offset().top
				    }, 500);
				}
	            setTimeout(function(){
	            	$('#addtobagall span').html("Add to Bag");
	           	}, 800);
	           	$('body').loader().loader('hide');
			}
		});
	});

	function loadSubtotalSection(){
		if(!!$.cookie('rowcollection') != "")
		{
			var loadcookieCollection_new = $.parseJSON($.cookie('rowcollection'));
			var total_qty_new = 0;
			$.each(loadcookieCollection_new,function(index,value){
				total_qty_new = parseInt(total_qty_new) + parseInt(value.qty);
				console.log(value.qty);
				$('#left'+index).children('.product-item').children('.quickproduct').children('.product-item-details').children('.productprice-qty').children('.quickqty').children('#qty').attr('value',value.qty);
			});
			var total_items = $('.quicksidebar .subrowitems .rowdata').length;
			//$('.quicksidebar .subtotal').html('Selected Items<span class="total_products">(<span class="countqty">'+total_qty_new+'</span> Products</span> , <span class="total_items">'+total_items+' Items)</span>');

		$('.quicksidebar .subtotal').html('Selected Items<span class="total_products"><span class="left_br">(</span><span class="countqty">'+total_qty_new+'</span> <span class="prod">Products</span></span> <span class="comma">,</span> <span class="total_items">'+total_items+' <span class="itm">Items</span><span class="right_br">)</span></span><span class="close-all">close</span>');
		}
	}

	function sideBar(){

   		var windowHeight = window.innerHeight;
		var headerHeight = $('.page-header').height();
		var menuHeight = $('.sections.nav-sections').height();
		var totaldecHeight = headerHeight - menuHeight;
		var btnHeight = $('.action.alladdtocart').height();
		var totalHeight = windowHeight - totaldecHeight;
		var withoutBtn = totalHeight - btnHeight;

		// $('.quicksidebar').css('height',withoutBtn+'px');
		// console.log(windowHeight);
		// console.log($('.quicksidebar').outerHeight());
		// console.log(totaldecHeight);
		// console.log($(".quicksidebar").scrollTop());

        var newWindowWidth = $(window).width();
        if (newWindowWidth >= 767) {
			if($(window).scrollTop() <= $('.quicksidebar').offset().top + $('.quicksidebar').outerHeight() - window.innerHeight) {
				console.log("end reached");
				var rowheight = $('.subrowitems .rowdata:last-child').height();
		        $('.subrowitems').addClass('inneractive');
		        $('.quicksidebar').addClass('active');

    			var divLength = $('.subrowitems').children().length;
    			    console.log(divLength);
    			    if(divLength > 6){
		        		$('.subrowitems').addClass('moreitems');
    			    }else{    			    	
		        		$('.subrowitems').removeClass('moreitems');
    			    }
		        //$('.subrowitems').css('height',withoutBtn-rowheight+'px');

				//$('.subrowitems').animate({height: '+='+rowheight}, 500);
				//$('.subrowitems').css('padding-bottom',rowheight+menuHeight+'px');
		    }
		}else{
		
			if($(window).scrollTop() >= $('.quicksidebar').offset().top + $('.quicksidebar').outerHeight() - window.innerHeight) {

				//console.log("end reached");
				var rowheight = $('.subrowitems .rowdata:last-child').height();

		        $('.subrowitems').addClass('inneractive');
		        $('.quicksidebar').addClass('active');
    			var divLength = $('.subrowitems').children().length;
    			    console.log(divLength);
    			    if(divLength > 6){
		        		$('.subrowitems').addClass('moreitems');
    			    }else{    			    	
		        		$('.subrowitems').removeClass('moreitems');
    			    }


				//$('.subrowitems').animate({height: '+='+rowheight}, 500);
				//$('.subrowitems').css('padding-bottom',rowheight+'px');
		    }
		}
   	}
   	function decreaseSideBar(){
        var newWindowWidth = $(window).width();
        if (newWindowWidth >= 767) {
	   		var windowHeight = window.innerHeight;
			var headerHeight = $('.page-header').height();
			var menuHeight = $('.sections.nav-sections').height();
			var totaldecHeight = headerHeight + menuHeight;
			var btnHeight = $('.action.alladdtocart').height();
			var totalHeight = windowHeight - totaldecHeight;
			var withoutBtn = totalHeight - btnHeight;
			var rowheight = $('.subrowitems .rowdata:last-child').height();

			//$('.subrowitems').removeClass('inneractive');
		 	//$('.quicksidebar').removeClass('active');

			var divLength = $('.subrowitems').children().length;
			    console.log(divLength);
			    if(divLength > 6){
		 			$('.quicksidebar').addClass('active');
					$('.subrowitems').addClass('inneractive');
					$('.subrowitems').css('padding-bottom','0px');
			    }else if(divLength == 0){    			    	
					$('.subrowitems').css('padding-bottom','0px');
					$('.subrowitems').removeClass('moreitems');
			    }else{    			    	
	        		$('.quicksidebar').removeClass('active');
					$('.subrowitems').removeClass('inneractive');
			    }
		}else{
			var divLength = $('.subrowitems').children().length;
			    console.log(divLength);
			    if(divLength < 4){
		 			
	        		$('.subrowitems').removeClass('moreitems');
			    }
		}
   	}
	$(window).on("resize", function (e) {
        checkScreenSize();
    });

    checkScreenSize();

    function checkScreenSize(){
        var newWindowWidth = $(window).width();
        if (newWindowWidth <= 767) {

            //alert("Page loaded.");
            $(".subrowitems").hide();
            $(".quicksidebar .subtotal.outer").click(function(){
                $(this).parent().toggleClass("active");
                $(".subrowitems").toggle();
            });

			$(".subtotal.inner span.close-all").click(function(event){
	        event.preventDefault();
				console.log("click");
		        $(this).parent().parent().parent(".quicksidebar").toggleClass("active");
		        $(".subrowitems").toggle();
		        if($(".subrowitems").hasClass("inneractive")){
					$(".subrowitems").removeClass("inneractive");
		        	$(".subrowitems").hide();
		        }
			});
           
        }else{

        }

    }

	// $(".subtotal.inner span.close-all").click(function(e){
	// 	console.log("click");
	//         e.preventDefault();
 //        $(this).parent().parent().parent(".quicksidebar").toggleClass("active");
 //        $(".quicksidebar").removeClass("active");
 //        $(".subrowitems").hide();
	// });

	$(".page-title-wrapper .need_morehelp span").click(function(event){
	        event.preventDefault();
        $(this).parent().toggleClass("active");
        $(".page-title-wrapper .need_morehelp .tooltip_text").toggle();
	});
	$(".page-title-wrapper .need_morehelp span").hover(function(event){
	        event.preventDefault();
        $(this).parent().toggleClass("active");
        $(".page-title-wrapper .need_morehelp .tooltip_text").toggle();
	});

});