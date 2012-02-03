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
			duration: 'short',
		},
		caption: {
			opacity: 0.8,
			duration: 'short',
		},
		text: {
			duration: 200,
		}
	},

	initialize: function(obj, images, options) {
		this.setOptions(options);
		this_ = this;
		
		this.images = [];
		this.current = null;
	
		this.obj = obj;
		obj.addClass('picture-slider');

		/* Determine width and height. */
		this.width = obj.getStyle('width').toInt();
		this.height = obj.getStyle('height').toInt();	
	
		/* Sheet. */
		this.sheet = document.createElement('div');
		this.sheet.addClass('ps-sheet');
		this.sheet.setStyle('width', this.width);
		this.sheet.setStyle('height', this.height);
		obj.appendChild(this.sheet);
	
		/* Place images on the sheet. */
		images.each(function(image) { this_.appendImage(image); });
		
		/* Bottom description panel. */
		this.caption = document.createElement('div');
		this.caption.addClass('ps-caption');
		this.caption.setStyle('height', 0);
		this.caption.setStyle('opacity', this.options.caption.opacity);
		this.caption.p = document.createElement('p');
		this.caption.p.set('tween', {duration: this.options.caption.duration});
		this.caption.appendChild(this.caption.p);
		this.obj.appendChild(this.caption);
		
		/* Controls. */
		this.controls = document.createElement('div');
		this.controls.addClass('ps-controls');
		this.controls.setStyle('width', this.width);
		this.controls.setStyle('height', this.height);
		this.controls.setStyle('opacity', 0);
		this.controls.set('tween',  {duration: this.options.controls.duration});
		this.obj.appendChild(this.controls);
		
		this.leftArrow = document.createElement('div');
		this.leftArrow.addClass('ps-left');
		if (this.options.arrows)
			this.leftArrow.addClass('ps-left-'+this.options.arrows);
		//this.leftArrow.setStyle('width', this.width*0.3);
		this.leftArrow.setStyle('height', this.height);
		this.leftArrow.setStyle('opacity', 0);
		this.leftArrow.addEvent('click', function() { this_.left(); });
		this.controls.appendChild(this.leftArrow);
	
		this.rightArrow = document.createElement('div');
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
		if (typeof Keyboard != 'undefined') {
			var kb = new Keyboard({
				defaultEventType: 'keydown',
				events: {
					'left': function() { this_.left(); },
					'right': function() { this_.right(); },
				},
			});
			kb.activate();
		}
		
		/* Switch to the first image. */	
		this.switchTo(0);
	},
	
	activateControls: function() {
		this.controls.fade(this.options.controls.opacity);
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
			frame = document.createElement('a');
			frame.href = image.link;
		} else {
			frame = document.createElement('div');
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
			var img = document.createElement('img');
			img.addClass('ps-frame-image');
			img.src = image.src;
			if (img.width/img.height > this.width/this.height) {
				img.setStyle('width', this.width);
			} else {
				img.setStyle('height', this.height);
			}
			frame.appendChild(img);
			var w = img.getStyle('width').toInt();
			img.setStyle('left', (this.width-w)/2);
			if (center) {
				var h = img.getStyle('height').toInt();
				img.setStyle('top', (this.height-h)/2);
			}
		}
		
		if (image.content) {
			var content = document.createElement('div');
			content.addClass('ps-frame-content');
			frame.appendChild(content);
			if (typeof image.content == 'string') {
				content.innerHTML = image.content;
			}
			if (center) {
				var h = content.getStyle('height').toInt();
				var pad = content.getStyle('padding-top').toInt() +
		    			  content.getStyle('padding-bottom').toInt();
		 		var mar = content.getStyle('margin-top').toInt() +
		   				  content.getStyle('margin-bottom').toInt();
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
			link: 'chain',
		});
		
		if (text) {
			this_ = this;
			fx.addEvent('complete', function() {
				this_.caption.p.innerHTML = text;
				this_.caption.p.fade(1);
			});
			this.caption.p.fade(0);
			var tmpcaption = document.createElement('div');
			tmpcaption.addClass('ps-caption');
			tmpcaption.setStyle('visibility', 'hidden');
			tmpcaption.p = document.createElement('p');
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
	},
});

/*
 * Turn obj into an interactive image gallery.
 *
 * Example:
 *
 * <div id="gallery" style="width: 900px; height: 600px" />
 * <script>
 * document.addEvent('domready', function() {
 *     gallery($('gallery'), {
 *         images: [
 *             {
 *                 src: 'image1.jpg',
 *                 desc: 'Description of image1.',
 *             },
 *             {
 *                 src: 'image2.jpg',
 *                 desc: 'Description of image2.',
 *             },
 *         ]
 *     });
 * });
 * </script>
 */
function gallery(obj, options) {
	if (!options.images)
		options.images = new Array();

	obj.addClass('gallery');
	
	/* Sheet. */
	var sheet = document.createElement('div');
	sheet.addClass('gallery-sheet');
	
	var width = obj.getStyle('width').toInt();
	var height = obj.getStyle('height').toInt();
	
	sheet.setStyle('width', width);
	sheet.setStyle('height', height);
	
	/* Place images on the sheet. */
	var offset = 0;
	options.images.each(function(image) {
		var wrapper = document.createElement('div');
		wrapper.addClass('gallery-wrapper');
		wrapper.setStyle('position', 'absolute');
		wrapper.setStyle('top', 0);
		wrapper.setStyle('left', offset);
		wrapper.setStyle('width', width);
		wrapper.setStyle('height', height);
		sheet.appendChild(wrapper);

		var img = document.createElement('img');
		img.src = image.src;
		img.height = height;
		img.setStyle('display', 'block');
		img.setStyle('margin', '0 auto');
		wrapper.appendChild(img);

		offset += width;
	});	
	obj.appendChild(sheet);	
	
	/* Bottom description panel. */
	var desc = document.createElement('div');
	desc.addClass('gallery-desc');
	desc.setStyle('height', 0);
	desc.setStyle('opacity', 0.7);
	desc.p = document.createElement('p');
	desc.set('tween', {duration: 'short'});
	desc.appendChild(desc.p);

	function updateDesc(n) {
		var descFx = new Fx.Tween(desc, {
			duration: 300,
			property: 'height',
			link: 'chain',
		});
		
		if (options.images.length > n && options.images[n].desc) {
			/* Alter height. */
			descFx.addEvent('complete', function() {
				desc.p.innerHTML = options.images[n].desc;
				desc.p.fade(1);
			});
			desc.p.fade(0);
			var tmpdesc = document.createElement('div');
			tmpdesc.addClass('gallery-desc');
			tmpdesc.setStyle('visibility', 'hidden');
			tmpdesc.p = document.createElement('p');
			tmpdesc.p.innerHTML = options.images[n].desc;
			tmpdesc.appendChild(tmpdesc.p);
			obj.appendChild(tmpdesc);
			h = tmpdesc.getStyle('height');
			obj.removeChild(tmpdesc);
			descFx.start(h);
		} else {
			desc.p.innerHTML = '';
			desc.p.fade(0);
			descFx.start(0);
		}
	}
	updateDesc(0);
	
	/* Image switching (left and right arrows). */
	var n = 0;
	
	var mouseover = 0;
	
	function switchTo(n) {
		var fx = new Fx.Tween(sheet, {
			duration: 'short',
			property: 'left'
		});
		fx.start(-n*width);
		updateDesc(n);
		if (n == 0)
			leftArrow.fade(0);
		else
			leftArrow.fade(mouseover*0.8);
		if (n == options.images.length - 1)
			rightArrow.fade(0);
		else
			rightArrow.fade(mouseover*0.8);
	}
 	
	var leftArrow = document.createElement('div');
	leftArrow.addClass('gallery-left');
	leftArrow.setStyle('width', width*0.3);
	leftArrow.setStyle('height', height);
	leftArrow.setStyle('opacity', 0);
	leftArrow.addEvent('click', function() {
		if (n > 0) switchTo(n = n-1);
	});
	obj.appendChild(leftArrow);
	
	var rightArrow = document.createElement('div');
	rightArrow.addClass('gallery-right');
	rightArrow.setStyle('width', width*0.3);
	rightArrow.setStyle('height', height);
	rightArrow.setStyle('opacity', 0);
	rightArrow.addEvent('click', function() {
		if (n < options.images.length - 1) switchTo(n = n+1);
	});
	
	rightArrow.set('tween', {duration: 'short'});
	leftArrow.set('tween',  {duration: 'short'});
	
	obj.addEvent('mouseover', function() {
		mouseover = 1;
		if (n > 0)
			leftArrow.fade(0.8);
		if (n < options.images.length - 1)
			rightArrow.fade(0.8);
	});
	
	obj.addEvent('mouseout', function() {
		mouseover = 0;
		leftArrow.fade(0);
		rightArrow.fade(0);
	});
	
	/* Keyboard control. */
	if (typeof Keyboard != 'undefined') {
		var kb = new Keyboard({
			defaultEventType: 'keydown',
			events: {
				'left': function() {
					if (n > 0) switchTo(n = n-1);
				},
				'right': function() {
					if (n < options.images.length - 1) switchTo(n = n+1);
				}
			}
		});
		kb.activate();
	}
	
	obj.appendChild(desc);
	obj.appendChild(leftArrow);
	obj.appendChild(rightArrow);
}
