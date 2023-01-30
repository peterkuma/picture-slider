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
		this.aspect  = this.obj.getStyle('width').toInt()/this.obj.getStyle('height').toInt();
		this.resizeObj();

		/* Determine width and height. */
		var observer = new ResizeObserver(function() { this_.resize() });
		observer.observe(obj);
		this.resize();

		/* Sheet. */
		this.sheet = new Element('div');
		this.sheet.addClass('ps-sheet');
		this.resizeSheet()
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
		this.controls.setStyle('opacity', 0);
		this.controls.set('tween',  {duration: this.options.controls.duration});
		this.obj.appendChild(this.controls);

		this.leftArrow = new Element('div');
		this.leftArrow.addClass('ps-left');
		if (this.options.arrows)
			this.leftArrow.addClass('ps-left-'+this.options.arrows);
		this.leftArrow.setStyle('opacity', 0);
		this.leftArrow.addEvent('click', function() { this_.left(); });
		this.controls.appendChild(this.leftArrow);

		this.rightArrow = new Element('div');
		this.rightArrow.addClass('ps-right');
		if (this.options.arrows)
			this.rightArrow.addClass('ps-right-'+this.options.arrows);
		this.rightArrow.setStyle('opacity', 0);
		this.rightArrow.addEvent('click', function() { this_.right(); });

		this.resizeControls();
		this.controls.appendChild(this.rightArrow);

		this.obj.addEvent('mouseover', function() { this_.activateControls(); });
		this.obj.addEvent('mouseout', function() { this_.deactivateControls(); });
		this.obj.addEvent('mousedown', function(ev) { this_.dragStart(ev) });
		this.obj.addEvent('mousemove', function(ev) { this_.drag(ev) });
		this.obj.addEvent('mouseup', function(ev) { this_.dragStop(ev) });
		this.obj.addEvent('mouseleave', function(ev) { this_.dragStop(ev) });
		this.obj.addEvent('touchmove', function(ev) { this_.dragStart(ev); this_.drag(ev); });
		this.obj.addEvent('touchend', function(ev) { this_.dragStop(ev); });

		/* Keyboard control. */
		this.kb = null;

		document.addEvent('keydown', function(ev) {
			if (this_.hasFocus) {
				if (ev.key == 'left') this_.left();
				if (ev.key == 'right') this_.right();
			}
		});

		this.initialized = true;

		/* Switch to the first image. */
		this.switchTo(0);
	},

	resizeObj: function() {
		this.obj.setStyle('height', this.width/this.aspect);
	},

	resizeSheet: function() {
		this.sheet.setStyle('width', this.width);
		this.sheet.setStyle('height', this.height);
		this.sheet.setStyle('left', -this.n*this.width);
	},

	resizeControls: function() {
		this.controls.setStyle('width', this.width);
		this.controls.setStyle('height', this.height);
		this.leftArrow.setStyle('height', this.height);
		this.rightArrow.setStyle('height', this.height);
	},

	resizeFrame: function(frame, i) {
		var this_ = this;
		frame.setStyle('left', this.width*i);
		frame.setStyle('width', this.width);
		frame.setStyle('height', this.height);
		frame.getChildren().each(function(e) {
			if (e.className == 'ps-frame-image')
				this_.resizeImage(e, this_.images[i]);
			if (e.className == 'ps-frame-content')
				this_.resizeContent(e, this_.images[i]);
		});
	},

	resizeImage: function(img, image) {
		var center = this.options.center;
		if (typeof image.center != 'undefined')
			center = image.center;

		if (img.width/img.height > this.width/this.height) {
			img.setStyle('width', this.width);
			img.setStyle('height', 'auto');
		} else {
			img.setStyle('width', 'auto');
			img.setStyle('height', this.height);
		}
		if (center)
			img.setStyle('top', (this.height-img.height)/2);
	},

	resizeContent: function(content, image) {
		var center = this.options.center;
		if (typeof image.center != 'undefined')
			center = image.center;

		var scale = this.width/this.obj.getStyle('width').toInt();
		content.setStyle('transform', 'scale(' + scale + ')');

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
			content.setStyle('top', top);
		}
	},

	resize: function() {
		var this_ = this;
		if (this.fx) {
			this.fx.stop();
		}
		var this_ = this;
		this.width = this.obj.getSize().x;
		this.height = this.obj.getSize().y;
		if (this.initialized) {
			this.resizeObj();
			this.resizeSheet();
			this.resizeControls();
			this.sheet.getChildren().each(function(frame, i) {
				this_.resizeFrame(frame, i);
			});
		}
	},

	activateControls: function() {
		this.controls.fade(this.options.controls.opacity);
		this.hasFocus = true;
	},

	deactivateControls: function() {
		this.controls.fade(0);
		this.hasFocus = false;
	},

	dragStart: function(ev) {
		if (this.isDragging) {
			return;
		}
		ev.preventDefault();
		this.isDragging = true;
		if (ev.targetTouches) {
			this.dragStartPos = ev.targetTouches[0].clientX;
		} else {
			this.dragStartPos = ev.client.x;
		}
		if (this.fx) {
			this.fx.stop();
		}
	},

	dragStop: function(ev) {
		ev.preventDefault();
		this.isDragging = false;
		var pos = (this.sheet.getStyle('left').toInt() + this.width*this.n)/this.width;
		if (pos > 0.25) {
			this.left();
		} else if (pos < -0.25 ) {
			this.right();
		} else {
			this.switchTo(this.n);
		}
	},

	drag: function(ev) {
		if (!this.isDragging) {
			return;
		}
		ev.preventDefault();
		var pos;
		if (ev.targetTouches) {
			pos = ev.targetTouches[0].clientX;
		} else {
			pos = ev.client.x;
		}
		var dx = pos - this.dragStartPos;
		this.sheet.setStyle('left', this.sheet.getStyle('left').toInt() + dx);
		this.dragStartPos = pos;
	},

	/*
	 * Switches to the image number n.
	 */
	switchTo: function(n) {
		if (!(n >= 0 && n < this.images.length))
			return this.current;

		this.current = this.images[n];

		if (this.fx) {
			this.fx.stop();
		}
		this.fx = new Fx.Tween(this.sheet, {
			duration: this.options.duration,
			property: 'left'
		});
		this.fx.start(-n*this.width);

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
		return this.switchTo(Math.max(this.n - 1, 0));
	},

	/*
	 * Switches to the next image.
	 */
	right: function() {
		return this.switchTo(Math.min(this.n + 1, this.images.length - 1));
	},

	/*
	 * Appends image to the end.
	 */
	appendImage: function(image) {
		var this_ = this;
		var frame;
		if (image.link) {
			frame = new Element('a');
			frame.href = image.link;
		} else {
			frame = new Element('div');
		}
		frame.addClass('ps-frame');
		this.resizeFrame(frame, this.images.length);
		this.sheet.appendChild(frame);

		if (image.src) {
			var img = new Element('img');
			img.addClass('ps-frame-image');
			img.src = image.src;
			frame.appendChild(img);
			var this_ = this;
			img.addEvent('load', function() {
				this_.resizeImage(img, image);
			});
		}

		if (image.content) {
			var content = new Element('div');
			content.addClass('ps-frame-content');
			frame.appendChild(content);
			if (typeof image.content == 'string') {
				content.set('html', image.content);
			}
			this.resizeContent(content, image);
		}

		this.images.push(image);
	},

	/*
	 * Set caption to text.
	 */
	setCaption: function(text) {
		if (this.fxCaption) {
			this.fxCaption.stop();
		}
		this.fxCaption = new Fx.Tween(this.caption, {
			duration: this.options.text.duration,
			property: 'height',
			link: 'chain'
		});

		if (text) {
			var this_ = this;
			this.fxCaption.addEvent('complete', function() {
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
			this.fxCaption.start(h);
		} else {
			this.caption.p.innerHTML = '';
			this.caption.p.fade(0);
			this.fxCaption.start(0);
		}
	}
});

