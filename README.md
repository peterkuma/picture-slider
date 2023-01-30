PictureSlider
=============

PictureSlider allows you to create an unobtrusive and easy-to-control
picture preview box, controlled by two arrows on the sides, or by keyboard.
Optional caption is displayed in a panel at the bottom of the box.

<img src="https://picture-slider.peterkuma.net/Screenshots/picture-slider.png" alt="PictureSlider" width="185" />

[Demo](https://picture-slider.peterkuma.net)

How to use
----------

A div element can be turned into a picture slider by creating an instance
of the PictureSlider class, supplying an array of entries
describing the image source and an optional caption:

	<head>
		...
		<script src="mootools.js"></script>
		<script src="picture-slider/Source/picture-slider.js"></script>
		<link rel="stylesheet" type="text/css" href="picture-slider/Source/picture-slider.css" />
	</head>
	...

    <div id="picture-slider" style="width: 900px; height: 600px"></div>
	<script>
		document.addEvent('domready', function() {
			var pc = new PictureSlider($('picture-slider'), [
			    {
			        src: 'image1.jpg',
			        caption: 'Description of image1.',
			    },
			    {
			        src: 'image2.jpg',
			        caption: 'Description of image2.',
			    },
			]);
		});
	</script>

#### Notes:
* The size of the box is set by the width and height style attributes of the div.
* If the caption key is left out, the bottom panel is not shown.

In addition to images, you can also supply HTML content:

	var pc = new PictureSlider($('picture-slider'), [
		{
			content: 'Text to appear inside the frame.',
		}
	]);

#### Notes:

* By default, the content is centered in the vertical. For top alignment,
append 'center: false,' below the `content` attribute.

Keyboard
--------

The images can be switched by the left and right keyboard arrows.

Styling
-------

The picture slider can be styled by amending
or extending the CSS defined in Source/picture-slider.css.

Options can be supplied as the third argument to the constructor.
The options available are described in the reference below.

### Example:

	var pc = new PictureSlider($('picture-slider', [
		{
			src: 'image1.jpg',
			caption: 'Description of image1.',
		},
		{
			src: 'image2.jpg',
		    caption: 'Description of image2.',
	    },
	], {
		arrows: 'small',
		duration: 'long',
		center: false,
		controls: {
			opacity: 0.5,
			duration: 500,
		},
		caption: {
			opacity: 0.5,
			duration: 'long',
		},
		text: {
			duration: 500,
		},
	});

Release notes
-------------

* 0.7.4 (2021-08-01):
	- Fixed freezing when mouse moves out of the element.
* 0.7.3 (2021-08-01):
	- Fixed switching of captions.
* 0.7.2 (2021-08-01):
	- Fixed resizing and scaling of content.
* 0.7.1 (2021-07-31):
	- Fixed image resizing.
* 0.7 (2021-07-31):
	- Support for touch events.
	- Support for resizing.
	- Fixed keyboard events in Chrome.
* 0.6 (2012-02-20):
	- Fixed a number of issues with IE7.
* 0.5 (2012-02-20):
	- Fixed interference between multiple picture sliders on a single page.
* 0.4 (2012-02-03):
	- Fixed image scaling.
	- Fixed vertical centering of frame content.
* 0.3 (2012-02-03):
	- Fixed interference between multiple picture sliders on a single page.
* 0.2 (2012-02-03):
	- Fixed horizontal centering of frame content.
* 0.1 (2012-02-02):
	- Initial release.


<h2 class="green">Class: PictureSlider</h2>

Animated picture slider.

### Implements:

[Events][], [Options][]

<h3 class="blue">PictureSlider Method: contructor</h3>

### Syntax:

	var ps = new PictureSlider(obj, images[, options])

### Arguments:

1. obj - (*object*) Object which is turned into a picture slider. `div` is
         recommended. Dimensions of the picture slider are determined
         by the dimensions of this object.
2. images - (*array*) Array of objects describing the images. The objects
            can have to following properties:
	* src		- (*string*, optional) The image source.
	* caption	- (*string*, optional) Caption to be shown in the bottom panel.
	* link		- (*string*, optional) Make the entire frame a hyperlink pointing to link.
	* content	- (*string*, optional) HTML content of the frame.
    * center	- (*boolean*: defaults to `options.center`) Enable vertical centering.
3. options - (*object*, optional) See below.

### Options:

* arrows - (*string*: defaults to 'medium') Size of the arrows. Can be one of:
	* 'small'  - Small arrows.
	* 'medium' - Medium-sized arrows.
	* 'large'  - Large arrows.
* caption (*object*) An object with the following properties:
	* opacity  - (*number*: defaults to 0.8) Opacity of the caption.
	* duration - (*number*: defaults to 'short') The duration of the caption height transition effect in ms. Also see below.
* center - (*boolean*: defaults to true) Enable vertical centering.
* controls (*object*) An object with the following properties:
	* opacity  - (*number*: defaults to 0.8) Opacity of the controls (the left and right arrow).
	* duration - (*number*: defaults to 'short') The duration of the controls fade effect in ms. Also see below.
* duration - (*number*: defaults to 'short') The duration of the slide effect in ms. Also see below.
* text (*string*) An object with the following properties:
	* duration - (*number*: defaults to 200) The duration of the caption text fade effect in ms. Also see below.

#### duration
The duration property can also be one of:

* 'short'  - 250ms
* 'normal' - 500ms
* 'long'   - 1000ms

### Events:

#### change

Fired when the slider is switched to another image.

##### Signature:

	onChange(image)

##### Arguments:

1. image - (*object*) The image object as supplied to the PictureSlider constructor.

#### Example:

	var pc = new PictureSlide(obj, images);
	pc.addEvent('change', function(image) {
		if (image.src)
			console.log('Switched to the image ' + image.src);
	});

<h3 class="blue">PictureSlider Method: switchTo</h3>

Switch to the image number n.

### Syntax:

	pc.switchTo(n);

### Arguments:

1. n - (*number*) The index of the image starting from 0.

### Returns:

* (*object*) The image object.

### Example:

	var pc = new PictureSlider(obj, [
		{'src': 'img1.jpg', caption: 'First image.' },
		{'src': 'img2.jpg', caption: 'Second image.'},
	]);
	pc.switchTo(1) // Switch to the second image.

<h3 class="blue">PictureSlider Method: left</h3>

Switch to the image on the left.

### Syntax:

	pc.left()

### Returns:

* (*object*) The object of the image on the left.

<h3 class="blue">PictureSlider Method: right</h3>

Switch to the image on the right.

### Syntax:

	pc.right()

### Returns:

* (*object*) The object of the image on the right.

[Events]: http://mootools.net/docs/core/Class/Class.Extras#Events
[Options]: http://mootools.net/docs/core/Class/Class.Extras#Options
