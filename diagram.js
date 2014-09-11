jQuery(function() { // Execute after the DOM is ready

jQuery.widget("custom.diagram", {
	options: {
		grid: {x: 10, y: 10}
	},
	id: (new Date()).getTime(), /* id genérico para atribuição aos objetos sem id */
	_create: function() {
		var $div = this.element;
		var o = this.options;
		var self = this;
	
		$div.addClass('diagram');
	},
	
    _setOption: function(option, value) {  
        $.Widget.prototype._setOption.apply( this, arguments );  
      
		var $div = this.element;
		var o = this.options;
		var self = this;
    },

	adjustSize: function() {
		return;
		var $div = this.element;
		var width = $div.outerWidth();
		var height = $div.outerHeight();
		jQuery('.diagramObject', $div).each(function() {
			var $this = jQuery(this); 
			tPos = $this.offset();
			if (width < (tPos.left + $this.outerWidth() + 20)) width = tPos.left + $this.outerWidth() + 20;
			if (height < (tPos.top + $this.outerHeight())) height = tPos.top + $this.outerHeight();
		});
		jQuery('body').css({
			width : width,
			height : height
		});
		$div.css({
			width : width,
			height : height
		});
	},

	clear: function() {
		var $div = this.element;
		
		bootbox.confirm('Are you sure you want to clear this diagram?', 
			function(confirmed) {
				if (confirmed) $div.empty(); 
			});
	},

	connect: function($from, $to, color, proximity, marker) {
		if ($from.length + $to.length != 2) return;
		var self = this;
		var $div = this.element;
		var $fromObj = $from.closest('.diagramObject');
		var $toObj = $to.closest('.diagramObject');
		if ($fromObj.is(':hidden') || $toObj.is(':hidden')) return;
		/* Atribuo id aos objetos sem id */
		if (!$fromObj.attr('id')) $fromObj.attr('id','id'+(this.id++));
		if (!$toObj.attr('id')) $toObj.attr('id','id'+(this.id++));
		if (!$from.attr('id')) $from.attr('id','id'+(this.id++));
		if (!$to.attr('id')) $to.attr('id','id'+(this.id++));
		/* id base para os conectores */
		var id = $fromObj.attr('id') + '-' + $from.attr('id') + '-' + $toObj.attr('id') + '-' + $to.attr('id');
		color = color || '#000000';

		if (jQuery('#h1-'+id).length == 0) $div.append('<div id="h1-'+id+'" class="connector h"></div>');
		if (jQuery('#h2-'+id).length == 0) $div.append('<div id="h2-'+id+'" class="connector h"></div>');
		if (jQuery('#v-'+id).length == 0) {
			$div.append('<div id="v-'+id+'" class="connector v"></div>');
			var $v = jQuery('#v-'+id);
			$v.draggable({
				grid: [5, 5],
				axis: "x",
				drag: function(event, ui) {
					$v.data("xv", ui.position.left);
					self.connect($from, $to, color, proximity, marker);
				}
			});
			
		}
		if ($from.data('marker') && jQuery('#mfrom-'+id).length == 0) $div.append('<span id="mfrom-'+id+'" class="connector marker start">'+$from.data('marker')+'</span>');
		if ($to.data('marker') && jQuery('#mto-'+id).length == 0) $div.append('<span id="mto-'+id+'" class="connector marker end">'+$to.data('marker')+'</span>');
		if (marker && jQuery('#mv-'+id).length == 0) $div.append('<div id="mv-'+id+'" class="connector marker">'+marker+'</div>');
		var $h1 = jQuery('#h1-'+id);
		var $h2 = jQuery('#h2-'+id);
		$v = jQuery('#v-'+id);
		
		if (proximity) $v.addClass(proximity);
		
		var fPos = $fromObj.offset();
		if ($from.is(':visible')) fPos.top = $from.offset().top;
		var tPos = $toObj.offset();
		if ($to.is(':visible')) tPos.top = $to.offset().top;
		var fvOffset = $from.outerHeight() / 2;
		var tvOffset = $to.outerHeight() / 2;
		
		var mfromPos = {};
		var mtoPos = {};
		var xv = $v.data("xv") || -1;
		if (fPos.left < tPos.left) {
			var x1 = fPos.left+$fromObj.outerWidth();
			var x2 = tPos.left;
			var y1 = fPos.top+fvOffset;
			var y2 = tPos.top+tvOffset;
			if (xv < 0 && $v.hasClass('_from')) xv = x1 + 30;
			if (xv < 0 && $v.hasClass('_to')) xv = x2 - 30;
			mfromPos = {my: 'center', at: 'left', of: '#h1-'+id};
			mtoPos = {my: 'center', at: 'right', of: '#h2-'+id};
			if (xv < 0 && (x2-x1)<30) xv = fPos.left - 15;
			if (xv > 0 && xv < x1) {
				x1 = fPos.left;
				mfromPos.at = 'right';
			}
			if (xv > x2) {
				x2 += $toObj.outerWidth();
				mtoPos.at = 'left';
			}
		} else {
			var x1 = tPos.left+$toObj.outerWidth();
			var x2 = fPos.left;
			var y1 = tPos.top+tvOffset;
			var y2 = fPos.top+fvOffset;
			if (xv < 0 && $v.hasClass('_from')) xv = x2 - 30;
			if (xv < 0 && $v.hasClass('_to')) xv = x1 + 30;
			mfromPos = {my: 'center', at: 'right', of: '#h2-'+id};
			mtoPos = {my: 'center', at: 'left', of: '#h1-'+id};
			if (xv < 0 && (x2-x1)<30) xv = tPos.left - 15;
			if (xv > 0 && xv < x1) {
				x1 = tPos.left;
				mtoPos.at = 'right';
			}
			if (xv > x2) {
				x2 += $fromObj.outerWidth();
				mfromPos.at = 'left';
			}
		}
		if (xv < 0) xv = (x1+x2)/2;
		xv = 5 * Math.round(xv/5); 
	
		$h1.css({
			left : Math.min(x1,xv),
			top : y1,
			width : Math.abs(xv-x1),
			backgroundColor: color
		});
		$h2.css({
			left : Math.min(xv,x2),
			top : y2,
			width : Math.abs(x2-xv),
			backgroundColor: color
		});
		$v.css({
			left : xv,
			top : Math.min(y1,y2),
			height : Math.abs(y2-y1),
			backgroundColor: color
		});
		jQuery.extend(mfromPos, {collision:'none'});
		jQuery.extend(mtoPos, {collision:'none'});
		jQuery('#mfrom-'+id).position(mfromPos).css({color: color});
		jQuery('#mto-'+id).position(mtoPos).css({color: color});
		jQuery('#mv-'+id).position({my:'center', at:'center', of: $v}).css({
			color: color,
			borderColor: color
		});
	},
	
    connectAll: function() {
		var $div = this.element;
		var o = this.options;
		var self = this;
		
		jQuery('.connector.v', $div).each(function() {
			var $conn = jQuery(this);
			var arrId = this.id.split('-');
			self.connect(jQuery('#'+arrId[2]), jQuery('#'+arrId[4]), $conn.css('backgroundColor'));
		});
    },
    
    selectByFence: function() {
		var $div = this.element;
		
		$document.off('mousemove', drawFence);
		$fence.hide();
		if (fenceData.width*fenceData.height > 0) {
			jQuery('.diagramObject:visible', $div).each(function() {
				var $this = jQuery(this);
				var pos = $this.offset();
				if (pos.top <= fenceData.top+fenceData.height && pos.top+$this.height() >= fenceData.top &&
					pos.left <= fenceData.left+fenceData.width && pos.left+$this.width() >= fenceData.left) 
					$this.addClass('selected');
			});
			fenceData = {left: 0, top: 0, width:0, height: 0};
		}
	}

   
});

jQuery.widget("custom.diagramObject", {
	options: {
		position: {top: 50, left: 40},
		draggable: true,
		handle: false,
		diagram: 'body',
		color: '#000000'
	},

	_create: function() {
		var $obj = this.element;
		var o = this.options;
		var self = this;
		var grid = jQuery(o.diagram).data("diagram").options.grid;
	
		o.position.top = grid.y * Math.round(o.position.top/grid.y); 	
		o.position.left = grid.x * Math.round(o.position.left/grid.x); 	

		$obj.css(o.position).addClass('diagramObject').appendTo(o.diagram);
		
		jQuery(o.diagram).diagram('adjustSize');
		
		if (o.draggable) self.setDraggable();
	},
	
    _setOption: function(option, value) {  
        $.Widget.prototype._setOption.apply( this, arguments );  
      
		var $obj = this.element;
		var o = this.options;
		var self = this;
    },
    
    connect: function() {
		var $div = this.element;
		var o = this.options;
		var id = $div.attr('id');
		
		jQuery('.connector.v', this.options.diagram).each(function() {
			var $conn = jQuery(this);
			var arrId = this.id.split('-');
			if (id == arrId[1] || id == arrId[3]) {
				$conn.removeData('xv');
				jQuery(o.diagram).diagram('connect', jQuery('#'+arrId[2]), jQuery('#'+arrId[4]), $conn.css('backgroundColor'));
			} 
		});
    },
    
    connectFrom: function($obj) {
		var $div = this.element;
    	jQuery(this.options.diagram).diagram('connect', $obj, $div, this.options.color);
    },
    
    connectTo: function($obj) {
		var $div = this.element;
    	jQuery(this.options.diagram).diagram('connect', $div, $obj, this.options.color);
    },
    
    hide: function() {
		var $div = this.element;
 		var id = $div.attr('id');
   	
    	$div.hide();

		jQuery('.connector', this.options.diagram).each(function() {
			var $conn = jQuery(this);
			var arrId = this.id.split('-');
			if (id == arrId[1] || id == arrId[3]) $conn.hide();
		});
    },
    
    remove: function() {
		var $div = this.element;
 		var id = $div.attr('id');
   	
    	$div.remove();

		jQuery('.connector', this.options.diagram).each(function() {
			var $conn = jQuery(this);
			var arrId = this.id.split('-');
			if (id == arrId[1] || id == arrId[3]) $conn.remove();
		});
    },
    
	select: function() {
		var $div = this.element;

		if (!KEY_SHIFT) jQuery('.diagramObject.selected').removeClass('selected');
		$div.toggleClass('selected');
	},
	
    setColor: function(hexcolor) {
    	var $div = this.element;
		$div.data('color',hexcolor);
    },

	setDraggable: function() {
		var $obj = this.element;
		var o = this.options;
		var self = this;
		var grid = jQuery(o.diagram).data("diagram").options.grid;
		
		$obj.draggable({
			handle: o.handle,
			grid: [grid.x, grid.y],
			start: function(event, ui) {
				iPos = ui.position; // Armazena posição inicial do objeto
			},
			drag: function(event, ui) {
				var delta = {};
				
				fPos = ui.position;
	
				delta.top = fPos.top - iPos.top;
				delta.left = fPos.left - iPos.left; // Calcula deslocamento do objeto
				iPos = fPos;
				
				self.connect();
				
				jQuery('.diagramObject.selected').each(function() { 
				// Aplica o mesmo -delta- aos outros objetos selecionados
					var $this = jQuery(this);
					if (this.id == ui.helper.attr('id')) return;
					var pos = $this.offset();
					if ((pos.left + delta.left) > 40 && (pos.top + delta.top) > 40) {
						$this.css({
							left : pos.left + delta.left,
							top : pos.top + delta.top
						});
						$this.diagramObject("connect");
					}
				});
			},
			stop: function(event, ui) {
				jQuery(self.options.diagram).diagram('connectAll');
			}
		});
	},
   
    show: function() {
		var $div = this.element;
 		var id = $div.attr('id');
   	
    	$div.show();

		jQuery('.connector', this.options.diagram).each(function() {
			var $conn = jQuery(this);
			var arrId = this.id.split('-');
			if ((id == arrId[1] && jQuery('#'+arrId[3]).is(':visible')) || (id == arrId[3]) && jQuery('#'+arrId[1]).is(':visible')) $conn.show();
		});
		this.connect();
    },
    
    toggle: function(opt) {
		var $div = this.element;
		if (opt == undefined) opt = !$div.is(':visible');
		if (opt) this.show();
		else this.hide();
    }
    
});

var KEY_CTRL = false;
var KEY_SHIFT = false; 
var $document = jQuery(document);
var $fence = jQuery('<div id="fence"/>').hide().appendTo('body');
var fenceData = {left: 0, top: 0, width:0, height: 0};

drawFence = function(event) {
	var x = event.pageX;
	var y = event.pageY;
	
    if (jQuery.browser.msie) {
        document.onselectstart = function () { return false; };
        window.setTimeout(function () { document.onselectstart = null; }, 0);
    }

	fenceData.width = Math.abs(x-fenceData.x0);
	fenceData.height = Math.abs(y-fenceData.y0);
	fenceData.left = Math.min(x,fenceData.x0);
	fenceData.top = Math.min(y,fenceData.y0);

	$fence.css(fenceData);
}

$document
	.on('keydown', function(event) {
		KEY_CTRL = event.ctrlKey;
		KEY_SHIFT = event.shiftKey;
		if ((KEY_CTRL) && (event.which == 65)) { // Ctrl + A
			jQuery('.diagramObject:visible').addClass('selected');
			event.preventDefault();
		}
	}).on('keyup', function(event) {
		KEY_CTRL = event.ctrlKey;
		KEY_SHIFT = event.shiftKey;
	})
	.on('mouseup', '.diagramObject', function(event) {
		if (event.which == 1)
			jQuery(this).diagramObject('select');
		jQuery('.diagram').diagram('selectByFence');
	})
	.on('mouseup', function(event) {
		if (!jQuery(this).is('.diagramObject')) 
			jQuery('.diagramObject.selected').removeClass('selected');
		jQuery('.diagram').diagram('selectByFence');
	})
	.on('mousedown', '.diagram', function(event) {
		if (KEY_SHIFT) {
			event.preventDefault();
	        if (jQuery.browser.msie) {
	            document.onselectstart = function () { return false; };
	            window.setTimeout(function () { document.onselectstart = null; }, 0);
	        }
		}
		if (event.which == 1 && jQuery('#'+event.target.id).is('.diagram')) {
			event.preventDefault();
	        if (jQuery.browser.msie) {
	            document.onselectstart = function () { return false; };
	            window.setTimeout(function () { document.onselectstart = null; }, 0);
	        }
			fenceData = {left: event.pageX, top: event.pageY, width:0, height: 0};
			fenceData.x0 = fenceData.left; fenceData.y0 = fenceData.top;
			$fence.css(fenceData);
			$fence.show();
			$document.on('mousemove', drawFence);
		}
	})
;

});
