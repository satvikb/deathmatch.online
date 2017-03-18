// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container.
var app = new PIXI.Application();
var b = new Bump(PIXI);

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);
