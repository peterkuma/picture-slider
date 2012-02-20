/*
---

name: PictureSlider

description: Animated picture slider.

license: MIT-style

authors:
- Peter Kuma

requires:
- core/1.4.3: [Class, Element.Style, Fx.Tween]

provides: PictureSlider

...
*/
 
var PictureSlider = new Class({
	Implements: [Options,Events],
	
	options: {
		arrows: 'medium',
		duration: 'short',
		center: true,
		controls: {
			opacity: 0.8,
			duration: 'short'
		},
		caption: {
			opacity: 0.8,
			duration: 'short'
		},
		text: {
			duration: 200
		}
	},

	initialize: function(obj, images, options) {
		this.setOptions(options);
		var this_ = this;
		
		this.images = [];
		this.current = null;
	
		this.obj = obj;
		obj.addClass('picture-slider');

		/* Determine width and height. */
		this.width = obj.getStyle('width').toInt();
		this.height = obj.getStyle('height').toInt();	
	
		/* Sheet. */
		this.sheet = new Element('div');
		this.sheet.addClass('ps-sheet');
		this.sheet.setStyle('width', this.width);
		this.sheet.setStyle('height', this.height);
		obj.appendChild(this.sheet);
	
		/* Place images on the sheet. */
		images.each(function(image) { this_.appendImage(image); });
		
		/* Bottom description panel. */
		this.caption = new Element('div');
		this.caption.addClass('ps-caption');
		this.caption.setStyle('height', 0);
		this.caption.setStyle('opacity', this.options.caption.opacity);
		this.caption.p = new Element('p');
		this.caption.p.set('tween', {duration: this.options.caption.duration});
		this.caption.appendChild(this.caption.p);
		this.obj.appendChild(this.caption);
		
		/* Controls. */
		this.controls = new Element('div');
		this.controls.addClass('ps-controls');
		this.controls.setStyle('width', this.width);
		this.controls.setStyle('height', this.height);
		this.controls.setStyle('opacity', 0);
		this.controls.set('tween',  {duration: this.options.controls.duration});
		this.obj.appendChild(this.controls);
		
		this.leftArrow = new Element('div');
		this.leftArrow.addClass('ps-left');
		if (this.options.arrows)
			this.leftArrow.addClass('ps-left-'+this.options.arrows);
		//this.leftArrow.setStyle('width', this.width*0.3);
		this.leftArrow.setStyle('height', this.height);
		this.leftArrow.setStyle('opacity', 0);
		this.leftArrow.addEvent('click', function() { this_.left(); });
		this.controls.appendChild(this.leftArrow);
	
		this.rightArrow = new Element('div');
		this.rightArrow.addClass('ps-right');
		if (this.options.arrows)
			this.rightArrow.addClass('ps-right-'+this.options.arrows);
		//this.rightArrow.setStyle('width', this.width*0.3);
		this.rightArrow.setStyle('height', this.height);
		this.rightArrow.setStyle('opacity', 0);
		this.rightArrow.addEvent('click', function() { this_.right(); });
		this.controls.appendChild(this.rightArrow);
		
		this.obj.addEvent('mouseover', function() { this_.activateControls(); });
		this.obj.addEvent('mouseout', function() { this_.deactivateControls(); });
		
		/* Keyboard control. */
		this.kb = null;
		if (typeof Keyboard != 'undefined') {
			this.kb = new Keyboard({
				defaultEventType: 'keydown',
				events: {
					'left': function() { this_.left(); },
					'right': function() { this_.right(); }
				}
			});
			this.kb.activate();
		}
		
		/* Switch to the first image. */	
		this.switchTo(0);
	},
	
	activateControls: function() {
		this.controls.fade(this.options.controls.opacity);
		/* The last to get focus gets the keyboard. */
		if (this.kb) this.kb.activate();
	},
	
	deactivateControls: function() {
		this.controls.fade(0);
	},
	
	/*
	 * Switches to the image number n.
	 */
	switchTo: function(n) {
		if (!(n >= 0 && n < this.images.length))
			return this.current;
		
		this.current = this.images[n];
			
		var fx = new Fx.Tween(this.sheet, {
			duration: this.options.duration,
			property: 'left'
		});
		fx.start(-n*this.width);

		/* If at the beginning, hide left arrow. */
		if (n == 0)
			this.leftArrow.fade(0);
		else
			this.leftArrow.fade(1);
		
		/* If at the end, hide right arrow. */
		if (n == this.images.length - 1)
			this.rightArrow.fade(0);
		else
			this.rightArrow.fade(1);
			
		this.setCaption(this.current.caption);
		this.n = n;
		
		this.fireEvent('change', this.current);
		
		return this.current;
	},
	
	/*
	 * Switches to the previous image.
	 */
	left: function() {
		return this.switchTo(this.n - 1);
	},
	
	/*
	 * Switches to the next image.
	 */
	right: function() {
		return this.switchTo(this.n + 1);
	},
	
	/*
	 * Appends image to the end.
	 */
	appendImage: function(image) {
		var frame;
		if (image.link) {
			frame = new Element('a');
			frame.href = image.link;
		} else {
			frame = new Element('div');
		}
		frame.addClass('ps-frame');
		frame.setStyle('left', this.width*this.images.length);
		frame.setStyle('width', this.width);
		frame.setStyle('height', this.height);
		this.sheet.appendChild(frame);
		
		var center = this.options.center;
		if (typeof image.center != 'undefined')
			center = image.center;
		
		if (image.src) {
			var img = new Element('img');
			img.addClass('ps-frame-image');
			img.src = image.src;
			frame.appendChild(img);
			var this_ = this;
			img.addEvent('load', function() {
				if (img.width/img.height > this_.width/this_.height) {
					img.width = this_.width;
				} else {
					img.height = this_.height;
				}
				if (center)
					img.setStyle('top', (this_.height-img.height)/2);
			});
		}
		
		if (image.content) {
			var content = new Element('div');
			content.addClass('ps-frame-content');
			frame.appendChild(content);
			if (typeof image.content == 'string') {
				content.innerHTML = image.content;
			}
			var w = content.getStyle('width').toInt();
			var pad = content.getStyle('padding-left').toInt() +
		    		  content.getStyle('padding-right').toInt();
		 	var mar = content.getStyle('margin-left').toInt() +
		   			  content.getStyle('margin-right').toInt();
			content.setStyle('left', (this.width-w-pad-mar)/2);
			if (center) {
				var h = content.getStyle('height').toInt();
				var pad = content.getStyle('padding-top').toInt() +
		    			  content.getStyle('padding-bottom').toInt();
		 		var mar = content.getStyle('margin-top').toInt() +
		   				  content.getStyle('margin-bottom').toInt();
		   		var top = (this.height-h-pad-mar)/2;
		   		if (top > 0)
					content.setStyle('top', (this.height-h-pad-mar)/2);
			}
		}
		
		this.images.push(image);
	},
	
	/*
	 * Set caption to text.
	 */
	setCaption: function(text) {
		var fx = new Fx.Tween(this.caption, {
			duration: this.options.text.duration,
			property: 'height',
			link: 'chain'
		});
		
		if (text) {
			var this_ = this;
			fx.addEvent('complete', function() {
				this_.caption.p.innerHTML = text;
				this_.caption.p.fade(1);
			});
			this.caption.p.fade(0);
			var tmpcaption = new Element('div');
			tmpcaption.addClass('ps-caption');
			tmpcaption.setStyle('visibility', 'hidden');
			tmpcaption.p = new Element('p');
			tmpcaption.p.innerHTML = text;
			tmpcaption.appendChild(tmpcaption.p);
			this.obj.appendChild(tmpcaption);
			h = tmpcaption.getStyle('height');
			this.obj.removeChild(tmpcaption);
			fx.start(h);		
		} else {
			this.caption.p.innerHTML = '';
			this.caption.p.fade(0);
			fx.start(0);		
		}
	}
});

