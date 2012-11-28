/**
 * Ptgamr Scrollbar
 * 
 * Use the native scrolling approach describe here: http://augustl.com/blog/2010/custom_scroll_bar_native_behaviour/
 * 
 * - Support content update
 * - Support Responsive design (automatically update the scrollbar size)
 * - Support fix width element
 * 
 * Limitation:
 * - Only have vertical scroll
 * 
 * @author: ptgamr
 */

 var ptgamr = {};

ptgamr.ptscroll = (function (w, $) {
	
	var opts = {
			fixWidth : false, //require to set the width in Css
			autoHide : false,
			trackMargin : 10, //margin of the ray to the bottom
			contentMargin : 15, //margin of the ray to the bottom
			hideTrack : false
	};
	
	/**
	 * Set up
	 */
	var init = function() {
		
		$body = $(document.body);
		
		$.fn.ptscroll = function(params) {
			
			var options = $.extend( {}, opts, params );
			
			this.each( function() { 
	            $( this ).data('ptscrollbar', new PtScrollbar( $( this ), options ) ); 
	        });

	        return this;
	        
		};
		
		$.fn.ptscroll_update = function() {
			 return $( this ).data( 'ptscrollbar' ).update(); 
		};
		
		$.fn.ptscroll_updateAndGo = function(position) {
			 return $( this ).data( 'ptscrollbar' ).update(position); 
		};
		
		$.fn.setupPtscroll = function() {
			
			$this = $(this);
			
			$this.find(".ptscrollbar").ptscroll();
			
		};
		
		$body.setupPtscroll();
	};
	
	/**
	 * Initializes the scrollbar
	 */
	function PtScrollbar( root, options ) {
		
		var self = this,
			wrapper = root, //the wrapper 
			nativeBox = { obj: $( '>.native', root ) }, //the native scrolling box - with width = 200%, height depend on window
			contentBox = { obj: $( '>.content', nativeBox.obj ) }, //the content box - height is automatic, width is fixed to a determine size
			
			//some local variable for better performance
			ratio = -1, //the ratio use for calculate position + thumb size
			track = null,
			thumb = null, //the scrollbar
			dragging = false,
			animating = false,
			hiding = null,
			currentScrollPosition = 0,
			contentHeight = 0,
			scrollbarHeight = 0,
			boxHeight = 0,
			trackHeight = 0,
			fixWidth = options.fixWidth;
		
		/**
		 * 
		 * @returns {PtScrollbar}
		 */
		function initialize() {
			
			// Applying the final styles.
			wrapper.addClass("retained");
			
	        nativeBox.obj.css('height', wrapper.height() + "px");
	        
	        if (!fixWidth) {
	        	contentBox.obj.css('width', wrapper.width() - options.contentMargin + "px");
	        }
	        
	        contentHeight = contentBox.obj.height();
	        boxHeight = nativeBox.obj.height();
	        trackHeight = boxHeight;// - options.trackMargin;

	        ratio = trackHeight / contentHeight;
	        
        	scrollbarHeight = ratio * trackHeight;
        	
        	if(scrollbarHeight > trackHeight ) {
        		scrollbarHeight = 0;
        	}
        	
        	// create The handle.
        	thumb = $(document.createElement("div"));
        	thumb.attr({"class": "ptScrollbarThumb"}).css('height', scrollbarHeight + "px");
        	
        	track = $(document.createElement("div")).attr({"class": "ptScrollbarTrack"}).css('height', trackHeight + "px").append(thumb);
        	
        	wrapper.append(track);
        	
        	//if (ratio > 1) {
        	//	thumb.show();
	        //} else {
	        //	thumb.hide();
        	//}
	        
	        bindEvents();
	        return self;
        }
		
		/**
		 * 
		 */
		function mouseenter() {
			enter = true;
			//show();
		} 
		
		/**
		 * 
		 */
		function mouseleave() {
			enter = false;

		    if (!dragging) {
		    	//hide();
		    }
		}
		
		/**
		 * 
		 */
		function show() {
			
			if (thumb.is(':hidden') ) {
				
				//thumb.show();
				
				if (hiding) {
					clearTimeout(hiding);
					hiding = null;
				}
				
				shown = true;
		    }
		}
		
		/**
		 * 
		 */
		function hide() {
			if (thumb.is(':visible') ) {
				//thumb.fadeOut();
			}
		}
		
		/**
		 * 
		 * @param position
		 */
		this.update = function(position) {
			
			contentHeight = contentBox.obj.height();
	        boxHeight = nativeBox.obj.height();
	        trackHeight = boxHeight;	// - options.trackMargin;

	        ratio = trackHeight / contentHeight;
			
			//no - scrollbar anymore
			if (ratio >= 1){
				
				if (track && track.length) {		
        			
        			scrollbarHeight = 0;
        			
        		}
        		
				//thumb.hide(); 
				
        	} else {
        		
        		scrollbarHeight = ratio * trackHeight;
        		
        		if(scrollbarHeight > trackHeight ) {
            		scrollbarHeight = 0;
            	}
        		
        		track.css('height', trackHeight + "px");
        		thumb.css('height', scrollbarHeight + "px");
        		
        		//thumb.show();       		
        		
        		if (position) {
        			scrollTo(position);
        		}
        		
        	}
			
			return $(this);
		};
		
		/**
		 * 
		 * @param position
		 */
		function scrollTo(position) {
			var speed = 100;
			if (!animating) {
				animating = true;
				currentScrollPosition =  position ;
				nativeBox.obj.stop().animate({ scrollTop: currentScrollPosition}, speed , "", function() {
					animating = false;
				});
			}
		};
		
		/**
		 * 
		 */
		function bindEvents() {
			
			var speed = 100;
			
			// autohide
			if (options.autoHide) {
				wrapper.mouseenter(mouseenter);
				wrapper.mouseleave(mouseleave);
				
				show();
				hiding = setTimeout(hide, 3000);
			}
			
			var resizeTimeout;
			
			//bind the window resize event
			$(window).resize( function() {
				
				if (resizeTimeout) {
					clearTimeout(resizeTimeout);
				}
				
				resizeTimeout = setTimeout(function(){
					
		        	nativeBox.obj.css('height', wrapper.height() + "px");
		        	
		        	if (!fixWidth) {
		        		contentBox.obj.css('width', wrapper.width() - options.contentMargin + "px");
		        	}
	
		        	contentHeight = contentBox.obj.height();
			        boxHeight = nativeBox.obj.height();
			        
			        trackHeight = boxHeight;	// - options.trackMargin;

			        ratio = trackHeight / contentHeight;
			        
			        scrollbarHeight = ratio * trackHeight;
			        
			        if(scrollbarHeight > trackHeight ) {
		        		scrollbarHeight = 0;
		        	}
			        
			        track.css('height', trackHeight + "px");
			        thumb.css('height', scrollbarHeight + "px");
				
				},150);
				
	        });
	        
	        //bind the content update event
	        wrapper.bind("contentUpdate", function(e) {
	        	
	        	self.update();
	        	
	        	return this;
	        	
	        });
	        
	        // Moving the scroll handle when scrolling with mouse, arrow keys,
	        // page up, page down, etc.
	        nativeBox.obj.bind("smartscroll", function (e) {
	            //is user dragging?
	            if (!dragging && !animating) {
	            	currentScrollPosition = nativeBox.obj.scrollTop();
	            	thumb.css("top", currentScrollPosition * ratio + "px");
	            }
	        });
	        
	        //Handle user's drag the thumb
	        if (thumb && !thumb.hasClass("ui-draggable")) {
	        	thumb.draggable({
	        		axis:"y",
					containment:"parent",
					drag:function(event,ui){
						if (!animating) {
							animating = true;
							currentScrollPosition =  ui.position.top / ratio ;
							nativeBox.obj.stop().animate({ scrollTop: currentScrollPosition}, speed , "", function() {
								animating = false;
							});
						}
						
						dragging = true;
					},
					stop:function(event,ui){
						dragging = false;
					}
	        	});
	        }
		}
		
		return initialize();
	}
	
	/**!
     * smartscroll: debounced scroll event for jQuery *
     * https://github.com/lukeshumard/smartscroll
     * Based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
     * Copyright 2011 Louis-Remi & Luke Shumard * Licensed under the MIT license. *
     */
    var event = $.event, scrollTimeout;

    event.special.smartscroll = {
        setup: function () {
            $(this).bind("scroll", event.special.smartscroll.handler);
        },
        teardown: function () {
            $(this).unbind("scroll", event.special.smartscroll.handler);
        },
        handler: function (event, execAsap) {
            // Save the context
            var context = this,
            args = arguments;

            // set correct event type
            event.type = "smartscroll";

            if (scrollTimeout) { clearTimeout(scrollTimeout); }
            scrollTimeout = setTimeout(function () {
                $.event.handle.apply(context, args);
            }, execAsap === "execAsap" ? 0 : 100);
        }
    };

    $.fn.smartscroll = function (fn) {
        return fn ? this.bind("smartscroll", fn) : this.trigger("smartscroll", ["execAsap"]);
    };
	
	return {
		init : init
	};
	
}(window, jQuery));