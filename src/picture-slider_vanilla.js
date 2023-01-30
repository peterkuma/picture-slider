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

class PictureSlider {
	options = {
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
	}

	constructor(obj, images, options) {
		if (options) {
			for (let [k, v] of Object.entries(options)) {
				if (this.options[k] instanceof Object)
					this.options[k] = {...this.options[k], v}
				else
					this.options[k] = v;
			}
		}

		this.images = [];
		this.current = null;

		this.obj = obj;
		obj.classList.add('picture-slider');
		this.aspect =
			parseInt(getComputedStyle(this.obj).width, 10) /
			parseInt(getComputedStyle(this.obj).height, 10);
		this.resizeObj();

		/* Determine width and height. */
		let observer = new ResizeObserver(() => this.resize());
		observer.observe(obj);
		this.resize();

		/* Sheet. */
		this.sheet = document.createElement('div');
		this.sheet.classList.add('ps-sheet');
		this.resizeSheet()
		obj.appendChild(this.sheet);

		/* Place images on the sheet. */
		images.forEach((image) => this.appendImage(image));

		/* Bottom description panel. */
		this.caption = document.createElement('div');
		this.caption.classList.add('ps-caption');
		this.caption.style.height = '0px';
		this.caption.style.opacity = this.options.caption.opacity;
		this.caption.p = document.createElement('p');
		this.caption.p.set('tween', {duration: this.options.caption.duration});
		this.caption.appendChild(this.caption.p);
		this.obj.appendChild(this.caption);

		/* Controls. */
		this.controls = document.createElement('div');
		this.controls.classList.add('ps-controls');
		this.controls.style.opacity = 0;
		this.controls.set('tween',  {duration: this.options.controls.duration});
		this.obj.appendChild(this.controls);

		this.leftArrow = document.createElement('div');
		this.leftArrow.classList.add('ps-left');
		if (this.options.arrows)
			this.leftArrow.classList.add('ps-left-'+this.options.arrows);
		this.leftArrow.style.opacity = 0;
		this.leftArrow.addEventListener('click', () => this.left());
		this.controls.appendChild(this.leftArrow);

		this.rightArrow = document.createElement('div');
		this.rightArrow.classList.add('ps-right');
		if (this.options.arrows)
			this.rightArrow.classList.add('ps-right-'+this.options.arrows);
		this.rightArrow.style.opacity = 0;
		this.rightArrow.addEventListener('click', () => this.right());

		this.resizeControls();
		this.controls.appendChild(this.rightArrow);

		this.obj.addEventListener('mouseover', () => this.activateControls());
		this.obj.addEventListener('mouseout', () => this.deactivateControls());
		this.obj.addEventListener('mousedown', (ev) => this.dragStart(ev));
		this.obj.addEventListener('mousemove', (ev) => this.drag(ev));
		this.obj.addEventListener('mouseup', (ev) => this.dragStop(ev));
		this.obj.addEventListener('touchmove', (ev) => { this.dragStart(ev); this.drag(ev); });
		this.obj.addEventListener('touchend', (ev) => this.dragStop(ev));

		/* Keyboard control. */
		this.kb = null;

		document.addEventListener('keydown', (ev) => {
			if (this.hasFocus) {
				if (ev.key == 'ArrowLeft') this.left();
				if (ev.key == 'ArrowRight') this.right();
			}
		});

		this.initialized = true;

		/* Switch to the first image. */
		this.switchTo(0);
	}

	resizeObj() {
		this.obj.style.height = this.width/this.aspect + 'px';
	}

	resizeSheet() {
		this.sheet.style.width = this.width + 'px';
		this.sheet.style.height = this.height + 'px';
		this.sheet.style.left = -this.n*this.width + 'px';
	}

	resizeControls() {
		this.controls.style.width = this.width + 'px';
		this.controls.style.height = this.height + 'px';
		this.leftArrow.style.height = this.height + 'px';
		this.rightArrow.style.height = this.height + 'px';
	}

	resizeFrame(frame, i) {
		frame.style.left = this.width*i + 'px';
		frame.style.width = this.width + 'px';
		frame.style.height = this.height + 'px';
		frame.getChildren().forEach((e) => {
			if (e.className == 'ps-frame-image')
				this.resizeImage(e, this.images[i]);
			if (e.className == 'ps-frame-content')
				this.resizeContent(e, this.images[i]);
		});
	}

	resizeImage(img, image) {
		let center = this.options.center;
		if (typeof image.center != 'undefined')
			center = image.center;

		if (img.width/img.height > this.width/this.height) {
			img.style.width = this.width + 'px';
			img.style.height = 'auto';
		} else {
			img.style.width = 'auto';
			img.style.height = this.height + 'px';
		}
		if (center)
			img.style.top = (this.height-img.height)/2 + 'px';
	}

	resizeContent(content, image) {
		let center = this.options.center;
		if (typeof image.center != 'undefined')
			center = image.center;

		let scale = this.width/parseInt(getComputedStyle(this.obj).width, 10);
		content.style.transform = 'scale(' + scale + ')';

		let w = parseInt(getComputedStyle(content).width, 10);
		let pad = parseInt(getComputedStyle(content).paddingLeft, 10) +
			parseInt(getComputedStyle(content).paddingRight, 10);
		let mar = parseInt(getComputedStyle(content).marginLeft, 10) +
			parseInt(getComputedStyle(content).marginRight, 10);
		content.style.left = (this.width-w-pad-mar)/2 + 'px';
		if (center) {
			let h = parseInt(getComputedStyle(content).height, 10);
			let pad = parseInt(getComputedStyle(content).paddingTop, 10) +
				parseInt(getComputedStyle(content).paddingBottom, 10);
			let mar = parseInt(getComputedStyle(content).marginTop, 10) +
				parseInt(getComputedStyle(content).marginBottom, 10);
			let top = (this.height-h-pad-mar)/2;
			content.style.top = top + 'px';
		}
	}

	resize() {
		if (this.fx) {
			this.fx.stop();
		}
		this.width = this.obj.clientWidth;
		this.height = this.obj.clientHeight;
		if (this.initialized) {
			this.resizeObj();
			this.resizeSheet();
			this.resizeControls();
			this.sheet.getChildren().forEach((frame, i) => {
				this.resizeFrame(frame, i);
			});
		}
	}

	activateControls() {
		this.controls.fade(this.options.controls.opacity);
		this.hasFocus = true;
	}

	deactivateControls() {
		this.controls.fade(0);
		this.hasFocus = false;
	}

	dragStart(ev) {
		if (this.isDragging) {
			return;
		}
		ev.preventDefault();
		this.isDragging = true;
		if (ev.targetTouches) {
			this.dragStartPos = ev.targetTouches[0].clientX;
		} else {
			this.dragStartPos = ev.clientX;
		}
		if (this.fx) {
			this.fx.stop();
		}
	}

	dragStop(ev) {
		ev.preventDefault();
		this.isDragging = false;
		let pos = (parseInt(getComputedStyle(this.sheet).left, 10) +
			this.width*this.n)/this.width;
		if (pos > 0.25) {
			this.left();
		} else if (pos < -0.25 ) {
			this.right();
		} else {
			this.switchTo(this.n);
		}
	}

	drag(ev) {
		if (!this.isDragging) {
			return;
		}
		ev.preventDefault();
		let pos;
		if (ev.targetTouches) {
			pos = ev.targetTouches[0].clientX;
		} else {
			pos = ev.clientX;
		}
		let dx = pos - this.dragStartPos;
		this.sheet.style.left = parseInt(getComputedStyle(this.sheet).left, 10) + dx + 'px';
		this.dragStartPos = pos;
	}

	/*
	 * Switches to the image number n.
	 */
	switchTo(n) {
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

		//this.dispatchEvent(new CustomEvent('change', this.current));

		return this.current;
	}

	/*
	 * Switches to the previous image.
	 */
	left() {
		return this.switchTo(Math.max(this.n - 1, 0));
	}

	/*
	 * Switches to the next image.
	 */
	right() {
		return this.switchTo(Math.min(this.n + 1, this.images.length - 1));
	}

	/*
	 * Appends image to the end.
	 */
	appendImage(image) {
		let frame;
		if (image.link) {
			frame = document.createElement('a');
			frame.href = image.link;
		} else {
			frame = document.createElement('div');
		}
		frame.classList.add('ps-frame');
		this.resizeFrame(frame, this.images.length);
		this.sheet.appendChild(frame);

		if (image.src) {
			let img = document.createElement('img');
			img.classList.add('ps-frame-image');
			img.src = image.src;
			frame.appendChild(img);
			img.addEventListener('load', () => this.resizeImage(img, image));
		}

		if (image.content) {
			let content = document.createElement('div');
			content.classList.add('ps-frame-content');
			frame.appendChild(content);
			if (typeof image.content == 'string') {
				content.set('html', image.content);
			}
			this.resizeContent(content, image);
		}

		this.images.push(image);
	}

	/*
	 * Set caption to text.
	 */
	setCaption(text) {
		if (this.fxCaption) {
			this.fxCaption.stop();
		}
		this.fxCaption = new Fx.Tween(this.caption, {
			duration: this.options.text.duration,
			property: 'height',
			link: 'chain'
		});

		if (text) {
			this.fxCaption.addEvent('complete', () => {
				this.caption.p.innerHTML = text;
				this.caption.p.fade(1);
			});
			this.caption.p.fade(0);
			let tmpcaption = document.createElement('div');
			tmpcaption.classList.add('ps-caption');
			tmpcaption.style.visibility = 'hidden';
			tmpcaption.p = document.createElement('p');
			tmpcaption.p.innerHTML = text;
			tmpcaption.appendChild(tmpcaption.p);
			this.obj.appendChild(tmpcaption);
			let h = parseInt(getComputedStyle(tmpcaption).height, 10)
			this.obj.removeChild(tmpcaption);
			this.fxCaption.start(h);
		} else {
			this.caption.p.innerHTML = '';
			this.caption.p.fade(0);
			this.fxCaption.start(0);
		}
	}
}

